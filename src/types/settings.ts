import type { PomodoroConfig } from './pomodoro';
import { DEFAULT_POMODORO_CONFIG } from './pomodoro';

export type KeyboardSoundProfile =
  | 'clicky'
  | 'thock'
  | 'typewriter'
  | 'bubble'
  | 'arcade'
  | 'cyber'
  | 'muted';

export interface SoundEffectsConfig {
  completion: boolean;
  pomodoro: boolean;
  typing: boolean;
  purr: boolean;
  alerts: boolean;
  keyboardProfile: KeyboardSoundProfile;
  spacebarSound: boolean;
  enterSound: boolean;
  backspaceSound: boolean;
  comboMilestones: boolean;
  turboPowerup: boolean;
  mascotBoop: boolean;
}

export interface Settings {
  monitoringEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  volume: number; // 0 to 100
  soundEffects: SoundEffectsConfig;
  companionMini: boolean;
  alwaysOnTop: boolean;
  /** Codi — coding agent tracker pet */
  agentPetVisible: boolean;
  /** Momo — pomodoro pet */
  pomodoroPetVisible: boolean;
  /** Moki — typing & wellness pet */
  mokiPetVisible: boolean;
  hasSeenOnboarding?: boolean;
  pomodoroConfig: PomodoroConfig;
  autoStartBreaks?: boolean;
  stretchIntervalMinutes?: number;
  targetWpm?: number;
}

export const DEFAULT_SOUND_EFFECTS: SoundEffectsConfig = {
  completion: true,
  pomodoro: true,
  typing: true,
  purr: true,
  alerts: true,
  keyboardProfile: 'clicky',
  spacebarSound: true,
  enterSound: true,
  backspaceSound: true,
  comboMilestones: false,
  turboPowerup: false,
  mascotBoop: true,
};

export const DEFAULT_SETTINGS: Settings = {
  monitoringEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
  volume: 80,
  soundEffects: { ...DEFAULT_SOUND_EFFECTS },
  companionMini: false,
  alwaysOnTop: true,
  agentPetVisible: true,
  pomodoroPetVisible: false,
  mokiPetVisible: false,
  hasSeenOnboarding: false,
  pomodoroConfig: { ...DEFAULT_POMODORO_CONFIG },
  autoStartBreaks: false,
  stretchIntervalMinutes: 30,
  targetWpm: 75,
};

