/**
 * Typed contracts for Rust <-> Vue communication. Event names and payload
 * shapes mirror `src-tauri/src/monitor.rs`, `hook_install.rs` and `windows.rs`.
 */
import type { AppDetection, CelebrationEvent, CompanionState } from './status';
import type { Settings } from './settings';
import type { PomodoroConfig, PomodoroPhase, PomodoroState } from './pomodoro';
import type { MokiAction, MokiState } from './moki';

export const EVENTS = {
  rawEvents: 'devpet://raw-events',
  tick: 'devpet://tick',
  companionVisibility: 'devpet://companion-visibility',
  pomodoroVisibility: 'devpet://pomodoro-companion-visibility',
  mokiVisibility: 'devpet://moki-companion-visibility',
  // Frontend-only (dashboard coordinator <-> companion windows)
  companionState: 'devpet://companion-state',
  pomodoroState: 'devpet://pomodoro-state',
  pomodoroAction: 'devpet://pomodoro-action',
  mokiState: 'devpet://moki-state',
  mokiAction: 'devpet://moki-action',
  companionReady: 'devpet://companion-ready',
  celebrate: 'devpet://celebrate',
  settings: 'devpet://settings',
  userTyping: 'devpet://user-typing',
  approvalAction: 'devpet://approval-action',
} as const;

export interface ApprovalActionEvent {
  agentId?: string;
  actionId: string;
}

export type RawSourceName = 'antigravity-hook' | 'codex-rollout';

export interface RawSourceEvent {
  source: RawSourceName;
  replay: boolean;
  file: string | null;
  payload: unknown;
}

export interface SystemMemoryInfo {
  totalBytes: number;
  usedBytes: number;
  usedPercent: number;
}

export interface TickPayload {
  at: number;
  apps: AppDetection[];
  memory?: SystemMemoryInfo;
}

export interface MonitorInfo {
  alreadyRunning: boolean;
  antigravityEventsFile: string;
  codexSessionsDir: string | null;
  codexSessionsDirExists: boolean;
}

export interface HookStatus {
  hooksFile: string | null;
  hooksFileExists: boolean;
  installed: boolean;
  upToDate: boolean;
  hookExe: string;
  hookExeExists: boolean;
  eventsFile: string;
  eventsFileExists: boolean;
  otherHooks: string[];
  warning: string | null;
}

export interface CompanionVisibility {
  visible: boolean;
}

export type PomodoroAction =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'skip' }
  | { type: 'sync' }
  | { type: 'set-phase'; phase: PomodoroPhase }
  | { type: 'update-config'; config: Partial<PomodoroConfig> };

export interface EventPayloads {
  [EVENTS.rawEvents]: RawSourceEvent[];
  [EVENTS.tick]: TickPayload;
  [EVENTS.companionVisibility]: CompanionVisibility;
  [EVENTS.pomodoroVisibility]: CompanionVisibility;
  [EVENTS.mokiVisibility]: CompanionVisibility;
  [EVENTS.companionState]: CompanionState;
  [EVENTS.pomodoroState]: PomodoroState;
  [EVENTS.pomodoroAction]: PomodoroAction;
  [EVENTS.mokiState]: MokiState;
  [EVENTS.mokiAction]: MokiAction;
  [EVENTS.companionReady]: null;
  [EVENTS.celebrate]: CelebrationEvent;
  [EVENTS.settings]: Settings;
  [EVENTS.userTyping]: { timestamp: number; key?: string };
  [EVENTS.approvalAction]: ApprovalActionEvent;
}

export type EventName = keyof EventPayloads;
