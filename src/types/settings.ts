import type { PomodoroConfig } from './pomodoro';
import { DEFAULT_POMODORO_CONFIG } from './pomodoro';

export interface Settings {
  monitoringEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  companionMini: boolean;
  /** Codi — coding agent tracker pet */
  agentPetVisible: boolean;
  /** Momo — pomodoro pet */
  pomodoroPetVisible: boolean;
  pomodoroConfig: PomodoroConfig;
}

export const DEFAULT_SETTINGS: Settings = {
  monitoringEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
  companionMini: false,
  agentPetVisible: true,
  pomodoroPetVisible: false,
  pomodoroConfig: { ...DEFAULT_POMODORO_CONFIG },
};
