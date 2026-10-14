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
    expect(Array.isArray(state.tasks)).toBe(true);
    expect(Array.isArray(state.stickyNotes)).toBe(true);
  });

  it('records keystrokes and increments counts & combo', () => {
    const initialStrokes = mokiCoordinator.getState().totalKeystrokes;
    mokiCoordinator.recordKeystroke('A');
    mokiCoordinator.recordKeystroke('B');
    mokiCoordinator.recordKeystroke('C');

    const state = mokiCoordinator.getState();
    expect(state.totalKeystrokes).toBe(initialStrokes + 3);
    expect(state.combo).toBeGreaterThanOrEqual(3);
    expect(state.mood).toBe('typing');
  });

  it('adds, toggles and deletes tasks', () => {
    mokiCoordinator.handleAction({ type: 'add-task', text: 'Write automated tests', priority: 'high' });
    const state = mokiCoordinator.getState();
    const created = state.tasks.find((t) => t.text === 'Write automated tests');
    expect(created).toBeDefined();
    expect(created?.completed).toBe(false);

    if (created) {
      mokiCoordinator.handleAction({ type: 'toggle-task', id: created.id });
      expect(created.completed).toBe(true);
      expect(state.mood).toBe('celebrating');

      mokiCoordinator.handleAction({ type: 'delete-task', id: created.id });
      expect(state.tasks.find((t) => t.id === created.id)).toBeUndefined();
    }
  });

  it('handles sticky note operations', () => {
    mokiCoordinator.handleAction({ type: 'add-sticky-note', content: 'Design review', color: 'pink' });
    const state = mokiCoordinator.getState();
    const note = state.stickyNotes.find((n) => n.content === 'Design review');
    expect(note).toBeDefined();
    expect(note?.color).toBe('pink');

    if (note) {
      mokiCoordinator.handleAction({
        type: 'update-sticky-note',
        id: note.id,
        content: 'Design review updated',
        color: 'mint',
      });
      expect(note.content).toBe('Design review updated');
      expect(note.color).toBe('mint');

      mokiCoordinator.handleAction({ type: 'delete-sticky-note', id: note.id });
      expect(state.stickyNotes.find((n) => n.id === note.id)).toBeUndefined();
    }
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

    mokiCoordinator.setMood('stretching');
    expect(mokiCoordinator.getState().mood).toBe('stretching');
  });
});
