/**
 * Normalized status model shared by adapters, services and UI.
 * See docs in README: "Monitoring: what genuinely works".
 */

export const AGENT_STATUSES = [
  'idle',
  'thinking',
  'working',
  'waiting',
  'completed',
  'error',
  'unknown',
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

export type AgentId = 'antigravity' | 'vscode' | 'codex';

/** How a status was obtained. `process-scan` can never yield task status. */
export type DetectionMethod = 'lifecycle-hook' | 'session-log' | 'none' | 'dev-mock';

export type Confidence = 'high' | 'medium' | 'low' | 'none';

export interface StatusUpdate {
  agentId: AgentId;
  status: AgentStatus;
  /** Epoch ms when the underlying event happened (or was observed). */
  timestamp: number;
  /** Concrete source, e.g. "antigravity:hooks.json Stop". */
  source: string;
  method: DetectionMethod;
  confidence: Confidence;
  /** Conversation / thread / session id when known. */
  sessionId?: string;
  detail?: string;
  /** Stable key for a genuine completion event, used for de-duplication. */
  completionKey?: string;
  /** True when rebuilt from history at startup — must never notify. */
  replay?: boolean;
}

/** Application presence from process scanning. Not agent status. */
export interface AppDetection {
  agentId: AgentId;
  running: boolean;
  processCount: number;
  processNames: string[];
}

export type IntegrationLevel = 'active' | 'available' | 'not-configured' | 'unsupported';

export interface AdapterCapabilities {
  thinking: boolean;
  working: boolean;
  waiting: boolean;
  completed: boolean;
  error: boolean;
}

export interface IntegrationState {
  level: IntegrationLevel;
  /** Human readable description of how status is (or isn't) obtained. */
  summary: string;
  /** Optional extra lines (paths, warnings). */
  details: string[];
}

export interface HistoryEntry {
  id: number;
  agentId: AgentId | 'system';
  from: AgentStatus | null;
  to: AgentStatus;
  timestamp: number;
  source: string;
  detail?: string;
}

/** Display state broadcast to the companion window. */
export interface CompanionState {
  status: AgentStatus;
  label: string;
  agentName: string | null;
  monitoring: boolean;
}

export interface CelebrationEvent {
  key: string;
  agentName: string;
  playSound: boolean;
}
