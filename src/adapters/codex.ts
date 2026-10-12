/**
 * OpenAI Codex adapter.
 *
 * Source: Codex's own session rollout logs (`~/.codex/sessions/YYYY/MM/DD/
 * rollout-*.jsonl`), which record `event_msg` entries such as `task_started`
 * and `task_complete` (with an `error` object when the turn failed). The Rust
 * monitor tails recent rollout files and forwards reduced records.
 *
 * We intentionally do NOT modify `notify` in `~/.codex/config.toml`: Codex
 * supports only one notify command and it may already be in use.
 *
 * Not available from logs: approval prompts ("waiting").
 */
import type { MonitorInfo, RawSourceEvent } from '../types/events';
import type { AgentStatus, AppDetection, IntegrationState, StatusUpdate } from '../types/status';
import { SessionTracker } from './sessionTracker';
import type { AdapterContext, AgentAdapter } from './types';

export interface CodexRecord {
  timestamp: number;
  type: string;
  payloadType: string | null;
  turnId: string | null;
  error: string | null;
}

export function parseCodexRecord(payload: unknown): CodexRecord | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.type !== 'string') return null;
  const ts = typeof p.timestamp === 'string' ? Date.parse(p.timestamp) : NaN;
  return {
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    type: p.type,
    payloadType: typeof p.payloadType === 'string' ? p.payloadType : null,
    turnId: typeof p.turnId === 'string' ? p.turnId : null,
    error: typeof p.error === 'string' ? p.error : null,
  };
}

export interface CodexMapped {
  status: AgentStatus;
  detail: string;
  completionKey?: string;
}

const REASONING = new Set(['reasoning', 'agent_reasoning']);
const TOOL_CALLS = new Set(['function_call', 'custom_tool_call', 'local_shell_call', 'exec_command_begin', 'web_search_call']);

/**
 * Pure mapping. Intermediate records only refine an *already active* turn, so
 * stray lines can never invent activity.
 */
export function mapCodexRecord(r: CodexRecord, current: AgentStatus | null): CodexMapped | null {
  const active = current === 'thinking' || current === 'working';
  if (r.type === 'event_msg') {
    switch (r.payloadType) {
      case 'task_started':
        return { status: 'working', detail: 'Turn started' };
      case 'task_complete':
        if (r.error) return { status: 'error', detail: `Turn failed: ${r.error}` };
        return { status: 'completed', detail: 'Turn completed', completionKey: `codex:${r.turnId ?? r.timestamp}` };
      case 'turn_aborted':
        return { status: 'idle', detail: 'Turn aborted' };
      case 'error':
        return active ? { status: 'error', detail: r.error ? `Error: ${r.error}` : 'Error reported' } : null;
      default:
        if (active && r.payloadType && REASONING.has(r.payloadType)) return { status: 'thinking', detail: 'Reasoning' };
        return null;
    }
  }
  if (r.type === 'response_item' && active && r.payloadType) {
    if (REASONING.has(r.payloadType)) return { status: 'thinking', detail: 'Reasoning' };
    if (TOOL_CALLS.has(r.payloadType)) return { status: 'working', detail: 'Running tools' };
  }
  return null;
}

function sessionFromFile(file: string | null): string {
  if (!file) return 'default';
  const base = file.split(/[\\/]/).pop() ?? file;
  return base.replace(/\.jsonl$/, '');
}

export class CodexAdapter implements AgentAdapter {
  readonly id = 'codex' as const;
  readonly displayName = 'Codex';
  readonly rawSource = 'codex-rollout' as const;
  readonly capabilities = { thinking: true, working: true, waiting: false, completed: true, error: true };

  private ctx: AdapterContext | null = null;
  private tracker = new SessionTracker();
  private info: MonitorInfo | null = null;
  private lastEventAt: number | null = null;
  private integration: IntegrationState = { level: 'not-configured', summary: 'Checking session logs…', details: [] };

  init(ctx: AdapterContext): void {
    this.ctx = ctx;
  }

  setMonitorInfo(info: MonitorInfo): void {
    this.info = info;
  }

  handleRaw(event: RawSourceEvent): void {
    const rec = parseCodexRecord(event.payload);
    if (!rec) return;
    if (event.replay && this.tracker.isTooOld(rec.timestamp, Date.now())) return;
    const session = sessionFromFile(event.file);
    const mapped = mapCodexRecord(rec, this.tracker.statusOf(session));
    if (!mapped) return;
    this.lastEventAt = Math.max(this.lastEventAt ?? 0, rec.timestamp);

    const update: StatusUpdate = {
      agentId: this.id,
      status: mapped.status,
      timestamp: rec.timestamp,
      source: `codex session log: ${rec.payloadType ?? rec.type}`,
      method: 'session-log',
      confidence: mapped.status === 'thinking' ? 'medium' : 'high',
      detail: mapped.detail,
      completionKey: mapped.completionKey,
      replay: event.replay,
    };
    const { completion, aggregate } = this.tracker.apply(session, update);
    if (aggregate) this.ctx?.emit(aggregate);
    if (completion) this.ctx?.complete(completion);
    this.updateIntegration();
  }

  tick(now: number, _app: AppDetection | undefined): void {
    const agg = this.tracker.tick(now);
    if (agg) this.ctx?.emit(agg);
  }

  async refreshIntegration(): Promise<IntegrationState> {
    this.updateIntegration();
    if (this.tracker.size === 0) this.emitBaseline();
    return this.integration;
  }

  getIntegrationState(): IntegrationState {
    return this.integration;
  }

  reset(): void {
    this.tracker.reset();
    this.emitBaseline();
  }

  private emitBaseline(): void {
    const found = this.info?.codexSessionsDirExists ?? false;
    this.ctx?.emit({
      agentId: this.id,
      status: found ? 'idle' : 'unknown',
      timestamp: Date.now(),
      source: 'codex session log',
      method: found ? 'session-log' : 'none',
      confidence: found ? 'medium' : 'none',
      detail: found ? 'No active turn in recent session logs' : 'No Codex session logs found',
    });
  }

  private updateIntegration(): void {
    const info = this.info;
    const details: string[] = [];
    if (info?.codexSessionsDir) details.push(`Logs: ${info.codexSessionsDir}`);
    details.push('config.toml `notify` is left untouched');
    if (this.lastEventAt) details.push(`Last log event: ${new Date(this.lastEventAt).toLocaleTimeString()}`);
    this.integration = info?.codexSessionsDirExists
      ? { level: 'active', summary: 'Reading Codex session logs (task_started / task_complete)', details }
      : { level: 'not-configured', summary: 'Codex session log folder not found', details };
  }
}
