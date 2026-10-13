import { ref } from 'vue';
import type { PomodoroConfig, PomodoroPhase, PomodoroState } from '../types/pomodoro';
import { DEFAULT_POMODORO_CONFIG, DEFAULT_POMODORO_STATE } from '../types/pomodoro';
import type { Settings } from '../types/settings';
import { emitEvent, onEvent } from './native';
import { EVENTS, type PomodoroAction } from '../types/events';
import { notificationService } from './notifications';

/**
 * Owns the single Pomodoro timer. Lives in the dashboard window; pet windows
 * send `pomodoroAction` events and render the broadcast `pomodoroState`.
 */
export class PomodoroCoordinator {
  private config: PomodoroConfig;
  private state = ref<PomodoroState>({ ...DEFAULT_POMODORO_STATE });
  private timer: ReturnType<typeof setInterval> | null = null;
  private getSettings: () => Settings;

  constructor(getSettings: () => Settings, initialConfig?: Partial<PomodoroConfig>) {
    this.getSettings = getSettings;
    this.config = { ...DEFAULT_POMODORO_CONFIG, ...(initialConfig || {}) };
    this.applyPhaseDuration('focus');
    this.initListeners();
  }

  public initListeners(): void {
    onEvent(EVENTS.pomodoroAction, (action: PomodoroAction) => this.handleAction(action)).catch(() => {});
  }

  public getState() {
    return this.state;
  }

  public getConfig(): PomodoroConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PomodoroConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Only re-apply duration when not mid-session.
    if (this.state.value.status === 'idle') {
      this.applyPhaseDuration(this.state.value.phase);
    }
    this.broadcastState();
  }

  public start(): void {
    if (this.state.value.status === 'running') return;
    this.state.value.status = 'running';
    this.startInterval();
    this.broadcastState();
  }

  public pause(): void {
    if (this.state.value.status !== 'running') return;
    this.state.value.status = 'paused';
    this.clearTimer();
    this.broadcastState();
  }

  public toggle(): void {
    if (this.state.value.status === 'running') this.pause();
    else this.start();
  }

  public reset(): void {
    this.clearTimer();
    this.state.value.status = 'idle';
    this.applyPhaseDuration(this.state.value.phase);
    this.broadcastState();
  }

  public skip(): void {
    this.clearTimer();
    this.transitionToNextPhase(true);
  }

  public setPhase(phase: PomodoroPhase): void {
    this.clearTimer();
    this.state.value.phase = phase;
    this.state.value.status = 'idle';
    this.applyPhaseDuration(phase);
    this.broadcastState();
  }

  public handleAction(action: PomodoroAction): void {
    switch (action.type) {
      case 'start':
        this.start();
        break;
      case 'pause':
        this.pause();
        break;
      case 'reset':
        this.reset();
        break;
      case 'skip':
        this.skip();
        break;
      case 'sync':
        this.broadcastState();
        break;
      case 'set-phase':
        this.setPhase(action.phase);
        break;
      case 'update-config':
        this.updateConfig(action.config);
        break;
    }
  }

  private applyPhaseDuration(phase: PomodoroPhase): void {
    const minutes = phase === 'focus' ? this.config.focusMinutes : this.config.breakMinutes;
    const seconds = Math.max(60, Math.round(minutes * 60));
    this.state.value.timeRemaining = seconds;
    this.state.value.totalDuration = seconds;
  }

  private startInterval(): void {
    this.clearTimer();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick(): void {
    if (this.state.value.status !== 'running') return;
    if (this.state.value.timeRemaining > 1) {
      this.state.value.timeRemaining--;
      this.broadcastState();
    } else {
      this.state.value.timeRemaining = 0;
      this.transitionToNextPhase(false);
    }
  }

  private transitionToNextPhase(isManualSkip: boolean): void {
    const settings = this.getSettings();

    if (this.state.value.phase === 'focus') {
      if (!isManualSkip) this.state.value.completedSessions++;
      this.state.value.phase = 'break';
      this.applyPhaseDuration('break');
      // Breaks start automatically after a focus session.
      this.state.value.status = 'running';
      this.startInterval();
      if (!isManualSkip) {
        notificationService.notifyPomodoroPhase(
          'Focus complete!',
          `Take a ${this.config.breakMinutes} minute break.`,
          settings,
          'break'
        );
      }
    } else {
      this.state.value.phase = 'focus';
      this.applyPhaseDuration('focus');
      // Focus waits for the user to start it.
      this.state.value.status = 'idle';
      if (!isManualSkip) {
        notificationService.notifyPomodoroPhase(
          'Break over',
          'Ready for the next focus session?',
          settings,
          'focus'
        );
      }
    }

    this.broadcastState();
  }

  public broadcastState(): void {
    emitEvent(EVENTS.pomodoroState, { ...this.state.value }).catch(() => {});
  }
}
