/**
 * Ollama adapter — local LLM engine status & active model detection.
 *
 * Checks process presence and queries Ollama's local REST API (http://127.0.0.1:11434/api/ps)
 * to detect actively loaded models in VRAM / inference state.
 */
import type { RawSourceEvent } from '../types/events';
import type { AppDetection, IntegrationState } from '../types/status';
import type { AdapterContext, AgentAdapter } from './types';

export class OllamaAdapter implements AgentAdapter {
  readonly id = 'ollama' as const;
  readonly displayName = 'Ollama (Local LLM)';
  readonly rawSource = null;
  readonly capabilities = { thinking: false, working: true, waiting: false, completed: false, error: false };

  private ctx: AdapterContext | null = null;
  private lastRunning: boolean | null = null;
  private activeModel: string | null = null;
  private lastApiCheck = 0;

  init(ctx: AdapterContext): void {
    this.ctx = ctx;
    this.publish(false);
  }

  handleRaw(_event: RawSourceEvent): void {
    // No raw source
  }

  tick(now: number, app: AppDetection | undefined): void {
    const running = app?.running ?? false;

    // Check Ollama's local API periodically (every 5 seconds) if process is detected
    if (running && now - this.lastApiCheck > 5000) {
      this.lastApiCheck = now;
      this.pollOllamaApi();
    }

    if (running !== this.lastRunning) {
      this.publish(running);
    }
  }

  private async pollOllamaApi(): Promise<void> {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/ps', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const models = (data.models as Array<{ name: string }>) || [];
        if (models.length > 0) {
          this.activeModel = models.map((m) => m.name).join(', ');
          this.ctx?.emit({
            agentId: this.id,
            status: 'working',
            timestamp: Date.now(),
            source: 'ollama:api/ps',
            method: 'none',
            confidence: 'medium',
            detail: `Active model: ${this.activeModel}`,
          });
          return;
        } else {
          this.activeModel = null;
        }
      }
    } catch {
      // Local API not responding or offline
    }
  }

  async refreshIntegration(): Promise<IntegrationState> {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/version', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return {
          level: 'active',
          summary: `Ollama server online (v${data.version || 'active'})`,
          details: [
            'Connected to local inference API at http://127.0.0.1:11434',
            'Polls /api/ps for active models loaded in VRAM',
          ],
        };
      }
    } catch {
      // ignore
    }

    return this.getIntegrationState();
  }

  getIntegrationState(): IntegrationState {
    return {
      level: 'available',
      summary: 'Local LLM engine detection (API: http://127.0.0.1:11434)',
      details: [
        'Monitors `ollama.exe` and `ollama_app.exe`.',
        'Detects active models loaded into memory via /api/ps.',
      ],
    };
  }

  reset(): void {
    this.lastRunning = null;
    this.activeModel = null;
  }

  private publish(running: boolean): void {
    this.lastRunning = running;
    this.ctx?.emit({
      agentId: this.id,
      status: running ? (this.activeModel ? 'working' : 'idle') : 'unknown',
      timestamp: Date.now(),
      source: 'process scan',
      method: 'none',
      confidence: 'none',
      detail: running
        ? (this.activeModel ? `Loaded: ${this.activeModel}` : 'Ollama service active (idle)')
        : 'Ollama service offline',
    });
  }
}
