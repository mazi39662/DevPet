// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock native calls
vi.mock('./native', () => ({
  emitEvent: vi.fn().mockResolvedValue(undefined),
  onEvent: vi.fn().mockResolvedValue(() => {}),
}));

// Mock notifications
vi.mock('./notifications', () => ({
  notificationService: {
    playChime: vi.fn(),
    playKeyClick: vi.fn(),
    playStretchZenChime: vi.fn(),
    playTaskCelebration: vi.fn(),
  },
}));

import { mokiCoordinator } from './mokiCoordinator';

describe('mokiCoordinator', () => {
  beforeEach(() => {
    localStorage.clear();
    mokiCoordinator.init(true);
  });

  it('initializes with default state', () => {
    const state = mokiCoordinator.getState();
    expect(state.mood).toBe('idle');
    expect(state.currentWpm).toBe(0);
  });

  it('records keystrokes and increments counts', () => {
    const initialStrokes = mokiCoordinator.getState().totalKeystrokes;
    mokiCoordinator.recordKeystroke('A');
    mokiCoordinator.recordKeystroke('B');
    mokiCoordinator.recordKeystroke('C');

    const state = mokiCoordinator.getState();
    expect(state.totalKeystrokes).toBe(initialStrokes + 3);
    expect(state.mood).toBe('typing');
  });

  it('handles custom speech bubble messages', () => {
    mokiCoordinator.handleAction({
      type: 'set-speech-bubble',
      text: 'Testing Moki speech bubble! ✨',
      durationMs: 3000,
    });
    const state = mokiCoordinator.getState();
    expect(state.speechBubbleText).toBe('Testing Moki speech bubble! ✨');
    expect(state.isSpeechBubbleVisible).toBe(true);
  });

  it('handles emotion transitions via set-mood action', () => {
    mokiCoordinator.handleAction({
      type: 'set-mood',
      mood: 'thinking',
      durationMs: 4000,
    });
    expect(mokiCoordinator.getState().mood).toBe('thinking');

    mokiCoordinator.setMood('waiting');
    expect(mokiCoordinator.getState().mood).toBe('waiting');

    mokiCoordinator.setMood('error');
    expect(mokiCoordinator.getState().mood).toBe('error');

    mokiCoordinator.setMood('turbo');
    expect(mokiCoordinator.getState().mood).toBe('turbo');
  });
});
