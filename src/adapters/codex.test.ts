import { describe, it, expect } from 'vitest';
import { parseCodexRecord, mapCodexRecord } from './codex';

describe('Codex Session Log Adapter', () => {
  it('maps task_started to working state', () => {
    const raw = {
      type: 'event_msg',
      payloadType: 'task_started',
      turnId: 'turn-1',
      timestamp: '2026-09-19T07:40:40.804Z',
    };
    const rec = parseCodexRecord(raw);
    expect(rec).not.toBeNull();
    const mapped = mapCodexRecord(rec!, null);
    expect(mapped?.status).toBe('working');
  });

  it('maps task_complete to completed state with key', () => {
    const raw = {
      type: 'event_msg',
      payloadType: 'task_complete',
      turnId: 'turn-1',
      timestamp: '2026-09-19T07:40:44.027Z',
    };
    const rec = parseCodexRecord(raw);
    const mapped = mapCodexRecord(rec!, 'working');
    expect(mapped?.status).toBe('completed');
    expect(mapped?.completionKey).toBe('codex:turn-1');
  });

  it('maps task_complete with error to error state', () => {
    const raw = {
      type: 'event_msg',
      payloadType: 'task_complete',
      turnId: 'turn-1',
      error: 'usage limit exceeded',
      timestamp: '2026-09-19T07:40:44.027Z',
    };
    const rec = parseCodexRecord(raw);
    const mapped = mapCodexRecord(rec!, 'working');
    expect(mapped?.status).toBe('error');
    expect(mapped?.detail).toContain('usage limit exceeded');
  });
});
