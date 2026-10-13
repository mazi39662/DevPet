// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PomodoroCoordinator } from './pomodoro';
import { DEFAULT_SETTINGS } from '../types/settings';

// Mock native calls
vi.mock('./native', () => ({
  emitEvent: vi.fn().mockResolvedValue(undefined),
  onEvent: vi.fn().mockResolvedValue(() => {}),
}));

// Mock notifications
vi.mock('./notifications', () => ({
  notificationService: {
    notifyPomodoroPhase: vi.fn(),
    playFocusStartChime: vi.fn(),
    playBreakBell: vi.fn(),
  },
}));

describe('Pomodoro Coordinator & Focus Tracker', () => {
  let coordinator: PomodoroCoordinator;

  beforeEach(() => {
    localStorage.clear();
    coordinator = new PomodoroCoordinator(() => ({ ...DEFAULT_SETTINGS }));
  });

  it('initializes with default 25 min focus and 5 min break', () => {
    const state = coordinator.getState();
    const config = coordinator.getConfig();

    expect(config.focusMinutes).toBe(25);
    expect(config.breakMinutes).toBe(5);
    expect(state.value.phase).toBe('focus');
    expect(state.value.timeRemaining).toBe(25 * 60);
    expect(state.value.status).toBe('idle');
  });

  it('allows changing work and break durations', () => {
    coordinator.updateConfig({ focusMinutes: 50, breakMinutes: 10 });
    const state = coordinator.getState();
    const config = coordinator.getConfig();

    expect(config.focusMinutes).toBe(50);
    expect(config.breakMinutes).toBe(10);
    expect(state.value.timeRemaining).toBe(50 * 60);
    expect(state.value.totalDuration).toBe(50 * 60);
  });

  it('switches phases between focus and break', () => {
    coordinator.setPhase('break');
    const state = coordinator.getState();
    expect(state.value.phase).toBe('break');
    expect(state.value.timeRemaining).toBe(5 * 60);

    coordinator.setPhase('focus');
    expect(state.value.phase).toBe('focus');
    expect(state.value.timeRemaining).toBe(25 * 60);
  });

  it('starts, pauses, toggles, and resets the focus timer', () => {
    coordinator.start();
    const state = coordinator.getState();
    expect(state.value.status).toBe('running');

    coordinator.pause();
    expect(state.value.status).toBe('paused');

    coordinator.toggle();
    expect(state.value.status).toBe('running');

    coordinator.toggle();
    expect(state.value.status).toBe('paused');

    coordinator.reset();
    expect(state.value.status).toBe('idle');
    expect(state.value.timeRemaining).toBe(25 * 60);
  });

  it('handles skip action and transitions phase', () => {
    coordinator.handleAction({ type: 'start' });
    expect(coordinator.getState().value.status).toBe('running');

    coordinator.handleAction({ type: 'skip' });
    expect(coordinator.getState().value.phase).toBe('break');
  });

  it('handles action events correctly', () => {
    coordinator.handleAction({ type: 'update-config', config: { focusMinutes: 30, breakMinutes: 7 } });
    expect(coordinator.getConfig().focusMinutes).toBe(30);
    expect(coordinator.getConfig().breakMinutes).toBe(7);

    coordinator.handleAction({ type: 'set-phase', phase: 'break' });
    expect(coordinator.getState().value.phase).toBe('break');
    expect(coordinator.getState().value.timeRemaining).toBe(7 * 60);

    coordinator.handleAction({ type: 'reset' });
    expect(coordinator.getState().value.status).toBe('idle');
  });
});
