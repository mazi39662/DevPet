/**
 * OpenCode / Claude Code adapter — CLI coding agent detection & terminal focus.
 *
 * Tracks autonomous CLI agents (OpenCode, Claude Code) and focuses their terminal window.
 */
import type { RawSourceEvent } from '../types/events';
import type { AppDetection, IntegrationState } from '../types/status';
import type { AdapterContext, AgentAdapter } from './types';

export class OpenCodeAdapter implements AgentAdapter {
  readonly id = 'opencode' as const;
  readonly displayName = 'OpenCode / Claude';
  readonly rawSource = null;
  readonly capabilities = { thinking: false, working: true, waiting: false, completed: false, error: false };

  private ctx: AdapterContext | null = null;
  private lastRunning: boolean | null = null;

  init(ctx: AdapterContext): void {
    this.ctx = ctx;
    this.publish(false);
  }

  handleRaw(_event: RawSourceEvent): void {
    // CLI event streams / session tailing hook point
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
      summary: 'CLI agent process detection & terminal launcher active',
      details: [
        'Monitors `claude.exe` and `opencode.exe` active CLI sessions.',
        'Brings the active agent terminal window to the front.',
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
      status: running ? 'working' : 'unknown',
      timestamp: Date.now(),
      source: 'process scan',
      method: 'none',
      confidence: 'low',
      detail: running ? 'CLI agent active in terminal' : 'CLI agent not running',
    });
  }
}
