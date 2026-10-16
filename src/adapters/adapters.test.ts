import { describe, it, expect } from 'vitest';
import { CursorAdapter } from './cursor';
import { OpenCodeAdapter } from './opencode';
import { OllamaAdapter } from './ollama';
import type { StatusUpdate } from '../types/status';

describe('New Agent Adapters', () => {
  it('CursorAdapter emits status changes on process detection tick', () => {
    const adapter = new CursorAdapter();
    const emitted: StatusUpdate[] = [];

    adapter.init({
      emit: (u) => emitted.push(u),
      complete: () => {},
    });

    expect(emitted.length).toBe(1);
    expect(emitted[0].status).toBe('unknown');

    // Simulate process running
    adapter.tick(Date.now(), {
      agentId: 'cursor',
      running: true,
      processCount: 1,
      processNames: ['cursor.exe'],
    });

    expect(emitted.length).toBe(2);
    expect(emitted[1].status).toBe('idle');
    expect(emitted[1].agentId).toBe('cursor');
  });

  it('OpenCodeAdapter emits working status when CLI is running', () => {
    const adapter = new OpenCodeAdapter();
    const emitted: StatusUpdate[] = [];

    adapter.init({
      emit: (u) => emitted.push(u),
      complete: () => {},
    });

    adapter.tick(Date.now(), {
      agentId: 'opencode',
      running: true,
      processCount: 1,
      processNames: ['opencode.exe'],
    });

    expect(emitted.length).toBe(2);
    expect(emitted[1].status).toBe('working');
    expect(emitted[1].agentId).toBe('opencode');
  });

  it('OllamaAdapter initializes with available integration state', () => {
    const adapter = new OllamaAdapter();
    const state = adapter.getIntegrationState();
    expect(state.level).toBe('available');
    expect(adapter.id).toBe('ollama');
  });
});
