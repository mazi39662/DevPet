import type { RawSourceEvent, RawSourceName } from '../types/events';
import type {
  AdapterCapabilities,
  AgentId,
  AppDetection,
  IntegrationState,
  StatusUpdate,
} from '../types/status';

export interface AdapterContext {
  /** Publish the adapter's current aggregated agent status. */
  emit(update: StatusUpdate): void;
  /** Publish a confirmed completion event (deduplicated by the coordinator). */
  complete(update: StatusUpdate): void;
}

/**
 * Contract every coding-tool integration implements. Adapters translate
 * tool-specific signals into the normalized {@link StatusUpdate} model and
 * must return `unknown` whenever status cannot be determined reliably.
 */
export interface AgentAdapter {
  readonly id: AgentId;
  readonly displayName: string;
  readonly capabilities: AdapterCapabilities;
  /** Native raw-event stream consumed by this adapter, if any. */
  readonly rawSource: RawSourceName | null;

  init(ctx: AdapterContext): void;
  handleRaw(event: RawSourceEvent): void;
  /** Housekeeping: decay transient states, flag stale sessions. */
  tick(now: number, app: AppDetection | undefined): void;
  /** Re-reads integration configuration (e.g. hook installation). */
  refreshIntegration(): Promise<IntegrationState>;
  getIntegrationState(): IntegrationState;
  /** Drop all session state (used when monitoring restarts). */
  reset(): void;
}
