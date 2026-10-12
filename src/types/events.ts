/**
 * Typed contracts for Rust <-> Vue communication. Event names and payload
 * shapes mirror `src-tauri/src/monitor.rs`, `hook_install.rs` and `windows.rs`.
 */
import type { AppDetection, CelebrationEvent, CompanionState } from './status';
import type { Settings } from './settings';

export const EVENTS = {
  rawEvents: 'devpet://raw-events',
  tick: 'devpet://tick',
  companionVisibility: 'devpet://companion-visibility',
  // Frontend-only (dashboard coordinator <-> companion window)
  companionState: 'devpet://companion-state',
  companionReady: 'devpet://companion-ready',
  celebrate: 'devpet://celebrate',
  settings: 'devpet://settings',
} as const;

export type RawSourceName = 'antigravity-hook' | 'codex-rollout';

export interface RawSourceEvent {
  source: RawSourceName;
  replay: boolean;
  file: string | null;
  payload: unknown;
}

export interface TickPayload {
  at: number;
  apps: AppDetection[];
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

export interface EventPayloads {
  [EVENTS.rawEvents]: RawSourceEvent[];
  [EVENTS.tick]: TickPayload;
  [EVENTS.companionVisibility]: CompanionVisibility;
  [EVENTS.companionState]: CompanionState;
  [EVENTS.companionReady]: null;
  [EVENTS.celebrate]: CelebrationEvent;
  [EVENTS.settings]: Settings;
}

export type EventName = keyof EventPayloads;
