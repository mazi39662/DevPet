/**
 * Cursor adapter — application detection & window focus.
 *
 * Tracks Cursor AI Editor process (`cursor.exe`) and enables one-click window focusing.
 */
import type { RawSourceEvent } from '../types/events';
import type { AppDetection, IntegrationState } from '../types/status';
import type { AdapterContext, AgentAdapter } from './types';

export class CursorAdapter implements AgentAdapter {
  readonly id = 'cursor' as const;
  readonly displayName = 'Cursor';
  readonly rawSource = null;
  readonly capabilities = { thinking: false, working: false, waiting: false, completed: false, error: false };

  private ctx: AdapterContext | null = null;
  private lastRunning: boolean | null = null;

  init(ctx: AdapterContext): void {
    this.ctx = ctx;
    this.publish(false);
  }

  handleRaw(_event: RawSourceEvent): void {
    // No native status source yet.
  }

  tick(_now: number, app: AppDetection | undefined): void {
    const running = app?.running ?? false;
    if (running !== this.lastRunning) this.publish(running);
  }

  async refreshIntegration(): Promise<IntegrationState> {
    return this.getIntegrationState();
  }

  getIntegrationState(): IntegrationState {
    return {
      level: 'available',
      summary: 'Process detection & one-click window focus active',
      details: [
        'Monitors `cursor.exe` presence across your desktop.',
        'Clicking the launcher button instantly brings Cursor into focus.',
      ],
    };
  }

  reset(): void {
    this.lastRunning = null;
  }

  private publish(running: boolean): void {
    this.lastRunning = running;
    this.ctx?.emit({
      agentId: this.id,
      status: running ? 'idle' : 'unknown',
      timestamp: Date.now(),
      source: 'process scan',
      method: 'none',
      confidence: 'none',
      detail: running ? 'Cursor is open and ready' : 'Cursor not running',
    });
  }
}
