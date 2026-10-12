/**
 * Visual Studio Code adapter — application detection only.
 *
 * VS Code exposes no stable, external API for AI agent task status. Copilot
 * "agent hooks" (`.github/hooks/*.json`, preview) could feed a future adapter
 * the same way Antigravity hooks do: register a `Stop` handler that runs
 * `devpet-hook.exe` and add a parser here. Until that payload is verified, this
 * adapter always reports `unknown` and never infers status from the process.
 */
import type { RawSourceEvent } from '../types/events';
import type { AppDetection, IntegrationState } from '../types/status';
import type { AdapterContext, AgentAdapter } from './types';

export class VSCodeAdapter implements AgentAdapter {
  readonly id = 'vscode' as const;
  readonly displayName = 'VS Code';
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
      level: 'unsupported',
      summary: 'No reliable agent-status integration yet — app detection only',
      details: [
        'Process detection shows whether VS Code is open, not whether an agent is working.',
        'Future: Copilot agent hooks (preview) → devpet-hook adapter.',
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
      status: 'unknown',
      timestamp: Date.now(),
      source: 'process scan',
      method: 'none',
      confidence: 'none',
      detail: running ? 'VS Code is running — agent status not available' : 'VS Code not running',
    });
  }
}
