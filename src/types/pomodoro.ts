export type PomodoroPhase = 'focus' | 'break';
export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface PomodoroConfig {
  focusMinutes: number; // default 25
  breakMinutes: number; // default 5
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  breakMinutes: 5,
};

export interface PomodoroState {
  phase: PomodoroPhase;
  status: PomodoroStatus;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  completedSessions: number;
}

export const DEFAULT_POMODORO_STATE: PomodoroState = {
  phase: 'focus',
  status: 'idle',
  timeRemaining: 25 * 60,
  totalDuration: 25 * 60,
  completedSessions: 0,
};
