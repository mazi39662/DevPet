import { describe, it, expect } from 'vitest';
import { parseAntigravityRecord, mapAntigravityRecord } from './antigravity';

describe('Antigravity Hook Adapter', () => {
  it('correctly parses and maps a PreInvocation event to thinking state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PreInvocation',
      ts: 1690000000000,
      invocationNum: 3,
      conversationId: 'conv-123',
    };
    const rec = parseAntigravityRecord(raw);
    expect(rec).not.toBeNull();
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped).not.toBeNull();
    expect(mapped?.status).toBe('thinking');
    expect(mapped?.detail).toContain('Thinking #3');
  });

  it('correctly maps a PostToolUse event to working state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PostToolUse',
      ts: 1690000001000,
      conversationId: 'conv-123',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped?.status).toBe('working');
  });

  it('correctly maps Stop with model_stop to completed state with completion key', () => {
    const raw = {
      agent: 'antigravity',
      event: 'Stop',
      ts: 1690000002000,
      conversationId: 'conv-123',
      executionNum: 1,
      terminationReason: 'model_stop',
      fullyIdle: true,
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped?.status).toBe('completed');
    expect(mapped?.completionKey).toBe('antigravity:conv-123:1');
  });

  it('correctly maps Stop with error reason to error state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'Stop',
      ts: 1690000002000,
      conversationId: 'conv-123',
      terminationReason: 'error',
      error: 'Tool execution crashed',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped?.status).toBe('error');
    expect(mapped?.detail).toContain('Tool execution crashed');
  });

  it('ignores PostInvocation so it does not falsely force working state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PostInvocation',
      ts: 1690000001500,
      conversationId: 'conv-123',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped).toBeNull();
  });

  it('maps PreToolUse with run_command to waiting state for user allow execution', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PreToolUse',
      ts: 1690000001200,
      conversationId: 'conv-123',
      toolName: 'run_command',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped).not.toBeNull();
    expect(mapped?.status).toBe('waiting');
    expect(mapped?.detail).toBe('Allow execution in Antigravity to proceed');
  });

  it('maps PreToolUse with ask_question to waiting state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PreToolUse',
      ts: 1690000001200,
      conversationId: 'conv-123',
      toolName: 'ask_question',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped).not.toBeNull();
    expect(mapped?.status).toBe('waiting');
    expect(mapped?.detail).toBe('Action needed: Question waiting for reply');
  });

  it('maps PreToolUse with safe tool like view_file to working state', () => {
    const raw = {
      agent: 'antigravity',
      event: 'PreToolUse',
      ts: 1690000001200,
      conversationId: 'conv-123',
      toolName: 'view_file',
    };
    const rec = parseAntigravityRecord(raw);
    const mapped = mapAntigravityRecord(rec!);
    expect(mapped).not.toBeNull();
    expect(mapped?.status).toBe('working');
    expect(mapped?.detail).toBe('Running view_file');
  });
});
