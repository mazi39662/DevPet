import type { AgentAdapter } from '../adapters/types';
import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from '../types/status';
import type { RawSourceEvent, TickPayload } from '../types/events';
import { EVENTS } from '../types/events';
import { emitEvent, onEvent } from './native';

export interface CoordinatorListener {
  onStatusChange?: (status: StatusUpdate) => void;
  onHistoryAdd?: (entry: HistoryEntry) => void;
  onAppsUpdate?: (apps: AppDetection[]) => void;
  onActiveAgentChange?: (agentId: AgentId) => void;
}

export class MonitoringCoordinator {
  private adapters = new Map<AgentId, AgentAdapter>();
  private statuses = new Map<AgentId, StatusUpdate>();
  private apps = new Map<AgentId, AppDetection>();
  private history: HistoryEntry[] = [];
  private activeAgentId: AgentId = 'antigravity';
  private listeners = new Set<CoordinatorListener>();
  private nextHistoryId = 1;
  private seenCompletionKeys = new Set<string>();

  constructor(adaptersList: AgentAdapter[]) {
    for (const adapter of adaptersList) {
      this.adapters.set(adapter.id, adapter);
      adapter.init({
        emit: (update: StatusUpdate) => this.handleStatusUpdate(update),
        complete: (update: StatusUpdate) => this.handleCompletion(update),
      });
    }
  }

  public registerListener(listener: CoordinatorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAdapters(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getAdapter(id: AgentId): AgentAdapter | undefined {
    return this.adapters.get(id);
  }

  public getStatus(id: AgentId): StatusUpdate | undefined {
    return this.statuses.get(id);
  }

  public getAllStatuses(): Map<AgentId, StatusUpdate> {
    return new Map(this.statuses);
  }

  public getAppDetection(id: AgentId): AppDetection | undefined {
    return this.apps.get(id);
  }

  public getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  public getActiveAgentId(): AgentId {
    return this.activeAgentId;
  }

  public setActiveAgentId(id: AgentId): void {
    if (this.activeAgentId !== id && this.adapters.has(id)) {
      this.activeAgentId = id;
      this.listeners.forEach((l) => l.onActiveAgentChange?.(id));
      this.syncCompanion();
    }
  }

  public async start(): Promise<void> {
    // Listen for incoming raw events from Rust
    await onEvent(EVENTS.rawEvents, (events: RawSourceEvent[]) => {
      for (const ev of events) {
        for (const adapter of this.adapters.values()) {
          if (adapter.rawSource === ev.source) {
            adapter.handleRaw(ev);
          }
        }
      }
    });

    // Listen for periodic app scan tick from Rust
    await onEvent(EVENTS.tick, (payload: TickPayload) => {
      const now = payload.at;
      for (const app of payload.apps) {
        this.apps.set(app.agentId, app);
        const adapter = this.adapters.get(app.agentId);
        adapter?.tick(now, app);
      }
      this.listeners.forEach((l) => l.onAppsUpdate?.(payload.apps));
      this.evaluateActiveAgent();
    });

    // Initial adapter refresh
    for (const adapter of this.adapters.values()) {
      await adapter.refreshIntegration();
    }
  }

  public handleStatusUpdate(update: StatusUpdate): void {
    const prev = this.statuses.get(update.agentId);
    this.statuses.set(update.agentId, update);

    const statusChanged = !prev || prev.status !== update.status;
    const detailChanged = Boolean(
      update.detail && (!prev || prev.detail !== update.detail) && update.detail !== prev?.status
    );

    // If status changed or significant detail changed
    if (statusChanged || detailChanged) {
      let durationMs: number | undefined;
      if (
        prev &&
        statusChanged &&
        (prev.status === 'working' || prev.status === 'thinking' || prev.status === 'waiting')
      ) {
        durationMs = Math.max(0, update.timestamp - prev.timestamp);
      }

      const entry: HistoryEntry = {
        id: this.nextHistoryId++,
        agentId: update.agentId,
        from: prev ? prev.status : null,
        to: update.status,
        timestamp: update.timestamp,
        source: update.source,
        detail: update.detail,
        confidence: update.confidence,
        method: update.method,
        sessionId: update.sessionId,
        approvalTitle: update.approval?.title,
        approvalType: update.approval?.type,
        durationMs,
      };
      this.history.unshift(entry);
      if (this.history.length > 80) {
        this.history.pop();
      }
      this.listeners.forEach((l) => l.onHistoryAdd?.(entry));
    }

    this.listeners.forEach((l) => l.onStatusChange?.(update));
    this.evaluateActiveAgent();
    this.syncCompanion();
  }

  public handleCompletion(update: StatusUpdate): void {
    if (update.replay) {
      return; // Never trigger notifications on historical replays
    }

    if (update.completionKey) {
      if (this.seenCompletionKeys.has(update.completionKey)) {
        return; // Deduplicate
      }
      this.seenCompletionKeys.add(update.completionKey);
    }

    const adapter = this.adapters.get(update.agentId);
    const agentName = adapter ? adapter.displayName : update.agentId;

    emitEvent(EVENTS.celebrate, {
      key: update.completionKey || `${update.agentId}-${update.timestamp}`,
      agentName,
      playSound: true,
    });
  }

  private evaluateActiveAgent(): void {
    // If the currently selected agent is waiting, working, or thinking, keep it
    const current = this.statuses.get(this.activeAgentId);
    if (current && (current.status === 'waiting' || current.status === 'working' || current.status === 'thinking')) {
      return;
    }

    // Otherwise, check if any other agent has high-priority status (waiting/working/thinking)
    for (const [id, st] of this.statuses.entries()) {
      if (st.status === 'waiting' || st.status === 'working' || st.status === 'thinking') {
        this.setActiveAgentId(id);
        return;
      }
    }
  }

  public syncCompanion(): void {
    const current = this.statuses.get(this.activeAgentId);
    const adapter = this.adapters.get(this.activeAgentId);
    const status: AgentStatus = current ? current.status : 'unknown';

    emitEvent(EVENTS.companionState, {
      status,
      label: current?.detail || status,
      agentName: adapter ? adapter.displayName : this.activeAgentId,
      monitoring: true,
      approval: current?.status === 'waiting' ? (current.approval ?? null) : null,
    });
  }

  public resolveApproval(agentId?: AgentId, actionId: string = 'open'): void {
    const id = agentId || this.activeAgentId;
    const current = this.statuses.get(id);
    if (current && current.status === 'waiting') {
      const isDismiss = actionId === 'dismiss' || actionId === 'reject';
      const detail = isDismiss ? 'Alert dismissed' : 'Opened in IDE';
      this.handleStatusUpdate({
        ...current,
        status: isDismiss ? 'idle' : 'working',
        detail,
        approval: null,
        timestamp: Date.now(),
      });
    }
  }
}
