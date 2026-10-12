/**
 * Google Antigravity adapter.
 *
 * Source: Antigravity's documented lifecycle hooks (`~/.gemini/config/hooks.json`).
 * DevPet registers observe-only handlers for PreInvocation, PostToolUse,
 * PostInvocation and Stop; the hook CLI appends minimal JSONL records that the
 * Rust monitor tails and forwards here.
 *
 * PreToolUse observes proposed tool calls (such as commands or questions awaiting
 * approval) and outputs {} as a safe pass-through without blocking.
 */
import type { RawSourceEvent, HookStatus } from '../types/events';
import type { AgentStatus, AppDetection, IntegrationState, StatusUpdate } from '../types/status';
import { native } from '../services/native';
import { SessionTracker } from './sessionTracker';
import type { AdapterContext, AgentAdapter } from './types';

export interface AntigravityRecord {
  v: number;
  id: string;
  event: string;
  ts: number;
  conversationId: string | null;
  workspace: string | null;
  executionNum: number | null;
  invocationNum: number | null;
  terminationReason: string | null;
  fullyIdle: boolean | null;
  error: string | null;
  toolName: string | null;
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function parseAntigravityRecord(payload: unknown): AntigravityRecord | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (p.agent !== 'antigravity' || typeof p.event !== 'string' || typeof p.ts !== 'number') return null;
  return {
    v: num(p.v) ?? 0,
    id: str(p.id) ?? String(p.ts),
    event: p.event,
    ts: p.ts,
    conversationId: str(p.conversationId),
    workspace: str(p.workspace),
    executionNum: num(p.executionNum),
    invocationNum: num(p.invocationNum),
    terminationReason: str(p.terminationReason),
    fullyIdle: typeof p.fullyIdle === 'boolean' ? p.fullyIdle : null,
    error: str(p.error),
    toolName: str(p.toolName),
  };
}

export interface MappedStatus {
  status: AgentStatus;
  detail: string;
  completionKey?: string;
}

/** Pure mapping from a hook record to a normalized status. */
export function mapAntigravityRecord(r: AntigravityRecord): MappedStatus | null {
  switch (r.event) {
    case 'PreInvocation':
      return { status: 'thinking', detail: r.invocationNum != null ? `Thinking #${r.invocationNum}...` : 'Thinking...' };

    case 'PreToolUse': {
      const tool = (r.toolName || '').toLowerCase();
      // If the tool is asking to allow something to execute or waiting for user interaction/approval:
      const isApprovalOrExecution =
        tool.includes('run_command') ||
        tool.includes('command') ||
        tool.includes('exec') ||
        tool.includes('bash') ||
        tool.includes('terminal') ||
        tool.includes('shell') ||
        tool.includes('ask_question') ||
        tool.includes('question') ||
        tool.includes('confirm') ||
        tool.includes('approval') ||
        tool.includes('permission');

      if (isApprovalOrExecution) {
        return {
          status: 'waiting',
          detail: tool.includes('ask_question') || tool.includes('question')
            ? 'Action needed: Question waiting for reply'
            : 'Allow execution in Antigravity to proceed',
        };
      }
      return {
        status: 'working',
        detail: r.toolName ? `Running ${r.toolName}` : 'Executing tool...',
      };
    }

    case 'PostToolUse':
      return {
        status: 'working',
        detail: r.error
          ? `Tool error: ${r.error}`
          : (r.toolName ? `Finished ${r.toolName}` : 'Tool execution finished'),
      };

    case 'PostInvocation':
      // Invocation and its tool calls (if any) finished; do not falsely claim tools are running.
      return null;

    case 'Stop': {
      const reason = (r.terminationReason ?? '').toLowerCase();
      if (reason === 'error') {
        return { status: 'error', detail: r.error ? `Stopped with error: ${r.error}` : 'Stopped with error' };
      }
      if (reason === 'max_steps_exceeded') {
        return { status: 'error', detail: 'Stopped: max steps exceeded' };
      }
      if (r.fullyIdle === false) {
        return { status: 'working', detail: 'Turn ended; background tasks still running' };
      }

      // Successful turn finish: 'model_stop', 'no_tool_call', 'complete', 'completed', or empty
      return {
        status: 'completed',
        detail: 'Task complete!',
        completionKey: `antigravity:${r.conversationId ?? 'unknown'}:${r.executionNum ?? r.id}`,
      };
    }
    default:
      return null;
  }
}


export class AntigravityAdapter implements AgentAdapter {
  readonly id = 'antigravity' as const;
  readonly displayName = 'Antigravity';
  readonly rawSource = 'antigravity-hook' as const;
  readonly capabilities = { thinking: true, working: true, waiting: true, completed: true, error: true };

  private ctx: AdapterContext | null = null;
  private tracker = new SessionTracker();
  private hook: HookStatus | null = null;
  private eventsSeen = 0;
  private lastEventAt: number | null = null;
  private integration: IntegrationState = { level: 'not-configured', summary: 'Checking hook…', details: [] };

  init(ctx: AdapterContext): void {
    this.ctx = ctx;
  }

  get hookStatus(): HookStatus | null {
    return this.hook;
  }

  handleRaw(event: RawSourceEvent): void {
    const rec = parseAntigravityRecord(event.payload);
    if (!rec) return;
    const mapped = mapAntigravityRecord(rec);
    this.eventsSeen++;
    this.lastEventAt = Math.max(this.lastEventAt ?? 0, rec.ts);
    if (!mapped || (event.replay && this.tracker.isTooOld(rec.ts, Date.now()))) {
      this.updateIntegration();
      return;
    }

    const update: StatusUpdate = {
      agentId: this.id,
      status: mapped.status,
      timestamp: rec.ts,
      source: `antigravity hook: ${rec.event}`,
      method: 'lifecycle-hook',
      confidence: 'high',
      detail: mapped.detail,
      completionKey: mapped.completionKey,
      replay: event.replay,
    };
    const { completion, aggregate } = this.tracker.apply(rec.conversationId ?? 'default', update);
    if (aggregate) this.ctx?.emit(aggregate);
    if (completion) this.ctx?.complete(completion);
    this.updateIntegration();
  }

  tick(now: number, _app: AppDetection | undefined): void {
    const agg = this.tracker.tick(now);
    if (agg) this.ctx?.emit(agg);
  }

  async refreshIntegration(): Promise<IntegrationState> {
    try {
      this.hook = await native.getHookStatus();
    } catch (e) {
      this.hook = null;
      this.integration = { level: 'not-configured', summary: `Hook status unavailable: ${String(e)}`, details: [] };
      return this.integration;
    }
    this.updateIntegration();
    if (this.tracker.size === 0) this.emitBaseline();
    return this.integration;
  }

  getIntegrationState(): IntegrationState {
    return this.integration;
  }

  reset(): void {
    this.tracker.reset();
    this.eventsSeen = 0;
    this.emitBaseline();
  }

  /** Status before any session event: idle only once hooks are proven to deliver. */
  private emitBaseline(): void {
    const h = this.hook;
    const proven = h?.installed && (h.eventsFileExists || this.eventsSeen > 0);
    this.ctx?.emit({
      agentId: this.id,
      status: proven ? 'idle' : 'unknown',
      timestamp: Date.now(),
      source: 'antigravity hook',
      method: h?.installed ? 'lifecycle-hook' : 'none',
      confidence: proven ? 'medium' : 'none',
      detail: !h?.installed
        ? 'Hook not installed — status cannot be detected'
        : proven
          ? 'No agent activity since DevPet started'
          : 'Waiting for the first hook event (restart Antigravity if it was already open)',
    });
  }

  private updateIntegration(): void {
    const h = this.hook;
    if (!h) return;
    const details: string[] = [];
    if (h.hooksFile) details.push(`Config: ${h.hooksFile}`);
    details.push(`Events: ${h.eventsFile}`);
    if (h.otherHooks.length) details.push(`Other hooks preserved: ${h.otherHooks.join(', ')}`);
    if (h.warning) details.push(`⚠ ${h.warning}`);
    if (this.lastEventAt) details.push(`Last hook event: ${new Date(this.lastEventAt).toLocaleTimeString()}`);

    if (h.installed && h.upToDate) {
      this.integration = {
        level: 'active',
        summary: this.eventsSeen > 0 || h.eventsFileExists
          ? 'Lifecycle hooks installed and delivering events'
          : 'Lifecycle hooks installed — no events received yet',
        details,
      };
    } else if (h.installed) {
      this.integration = { level: 'not-configured', summary: 'Hook entry is outdated — reinstall it', details };
    } else {
      this.integration = { level: 'available', summary: 'Lifecycle hooks available — not installed', details };
    }
  }
}
