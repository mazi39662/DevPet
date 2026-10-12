import type { AgentStatus, StatusUpdate } from '../types/status';

/** Display priority when several sessions of one tool are active. */
const PRIORITY: Record<AgentStatus, number> = {
  error: 6,
  waiting: 5,
  completed: 4,
  working: 3,
  thinking: 2,
  idle: 1,
  unknown: 0,
};

export interface SessionTimings {
  /** completed -> idle */
  completedHoldMs: number;
  /** thinking with no further events -> idle */
  thinkingTimeoutMs: number;
  /** error -> idle */
  errorHoldMs: number;
  /** thinking/working with no events for this long -> unknown */
  staleMs: number;
  /** forget finished sessions after this long */
  forgetMs: number;
}

export const DEFAULT_TIMINGS: SessionTimings = {
  completedHoldMs: 4_000,
  thinkingTimeoutMs: 15_000,
  errorHoldMs: 30_000,
  staleMs: 15 * 60_000,
  forgetMs: 60 * 60_000,
};

interface Session {
  update: StatusUpdate;
}

const isActive = (s: AgentStatus): boolean => s === 'thinking' || s === 'working' || s === 'waiting';

export interface ApplyResult {
  /** Present when this update is a genuine active -> completed transition. */
  completion: StatusUpdate | null;
  /** Present when the aggregated status changed. */
  aggregate: StatusUpdate | null;
}

/**
 * Tracks per-session (conversation / thread) state for one tool and derives an
 * aggregated agent status. Pure logic, no I/O — unit-test friendly.
 */
export class SessionTracker {
  private sessions = new Map<string, Session>();
  private lastAggregate: StatusUpdate | null = null;

  constructor(private readonly timings: SessionTimings = DEFAULT_TIMINGS) {}

  statusOf(sessionId: string): AgentStatus | null {
    return this.sessions.get(sessionId)?.update.status ?? null;
  }

  apply(sessionId: string, update: StatusUpdate): ApplyResult {
    const prev = this.sessions.get(sessionId)?.update.status ?? null;
    this.sessions.set(sessionId, { update: { ...update, sessionId } });

    // Only a transition out of an active state counts as a completion. A second
    // Stop for an already-finished session (or one we never saw start, outside
    // replay) is not treated as a new completion.
    const genuineCompletion =
      update.status === 'completed' && (prev === null ? update.replay === true : isActive(prev));

    return {
      completion: genuineCompletion ? { ...update, sessionId } : null,
      aggregate: this.recompute(),
    };
  }

  /** True if an event is too old to be worth tracking (used for replay). */
  isTooOld(timestamp: number, now: number): boolean {
    return now - timestamp > this.timings.forgetMs;
  }

  /**
   * Applies time-based transitions. Timestamps are intentionally kept at the
   * last genuine event so the UI's "last update" stays truthful.
   */
  tick(now: number): StatusUpdate | null {
    const t = this.timings;
    for (const [id, s] of this.sessions) {
      const age = now - s.update.timestamp;
      const st = s.update.status;
      if (st === 'completed' && age > t.completedHoldMs) {
        s.update = { ...s.update, status: 'idle', detail: 'Ready', completionKey: undefined, replay: undefined };
      } else if (st === 'thinking' && age > t.thinkingTimeoutMs) {
        s.update = { ...s.update, status: 'idle', detail: 'Ready', completionKey: undefined, replay: undefined };
      } else if (st === 'error' && age > t.errorHoldMs) {
        s.update = { ...s.update, status: 'idle', detail: 'Last turn ended with an error', replay: undefined };
      } else if (isActive(st) && age > t.staleMs) {
        s.update = {
          ...s.update,
          status: 'unknown',
          confidence: 'low',
          detail: `No events for ${Math.round(t.staleMs / 60000)}+ min — state unknown`,
          replay: undefined,
        };
      } else if ((st === 'idle' || st === 'unknown') && age > t.forgetMs) {
        this.sessions.delete(id);
      }
    }
    return this.recompute();
  }

  reset(): void {
    this.sessions.clear();
    this.lastAggregate = null;
  }

  get size(): number {
    return this.sessions.size;
  }

  activeCount(): number {
    let n = 0;
    for (const s of this.sessions.values()) if (isActive(s.update.status)) n++;
    return n;
  }

  /** Returns the new aggregate only if its status or detail changed. */
  private recompute(): StatusUpdate | null {
    let best: StatusUpdate | null = null;
    for (const s of this.sessions.values()) {
      const u = s.update;
      if (
        !best ||
        PRIORITY[u.status] > PRIORITY[best.status] ||
        (PRIORITY[u.status] === PRIORITY[best.status] && u.timestamp > best.timestamp)
      ) {
        best = u;
      }
    }
    if (!best) return null;
    const prev = this.lastAggregate;
    this.lastAggregate = best;
    if (prev && prev.status === best.status && prev.detail === best.detail && prev.sessionId === best.sessionId) {
      return null;
    }
    return best;
  }
}
