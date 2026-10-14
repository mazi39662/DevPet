import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import type { Settings } from '../types/settings';

class NotificationService {
  private hasPermission = false;
  private audioCtx: AudioContext | null = null;

  public async init(): Promise<void> {
    try {
      this.hasPermission = await isPermissionGranted();
      if (!this.hasPermission) {
        const perm = await requestPermission();
        this.hasPermission = perm === 'granted';
      }
    } catch (e) {
      console.warn('Desktop notifications not supported or failed to init:', e);
    }
  }

  public async notifyCompletion(agentName: string, settings: Settings, taskDetail?: string): Promise<void> {
    if (!settings.notificationsEnabled) return;

    if (this.hasPermission) {
      try {
        sendNotification({
          title: `DevPet — ${agentName} Finished!`,
          body: taskDetail ? `Task complete: ${taskDetail}` : `Your coding agent completed its turn.`,
        });
      } catch (err) {
        console.error('Failed to dispatch notification:', err);
      }
    }

    if (settings.soundEnabled) {
      this.playChime();
    }
  }

  public async notifyActionRequired(agentName: string, settings: Settings, taskDetail?: string): Promise<void> {
    if (!settings.notificationsEnabled) return;

    if (this.hasPermission) {
      try {
        sendNotification({
          title: `DevPet — Action Required (${agentName})`,
          body: taskDetail ? taskDetail : `Antigravity is waiting for you to allow execution.`,
        });
      } catch (err) {
        console.error('Failed to dispatch alert notification:', err);
      }
    }
  }

  public async notifyPomodoroPhase(
    title: string,
    message: string,
    settings: Settings,
    phase: 'focus' | 'break'
  ): Promise<void> {
    if (!settings.notificationsEnabled) return;

    if (this.hasPermission) {
      try {
        sendNotification({
          title: `Momo — ${title}`,
          body: message,
        });
      } catch (err) {
        console.error('Failed to dispatch Pomodoro notification:', err);
      }
    }

    if (settings.soundEnabled) {
      if (phase === 'focus') {
        this.playFocusStartChime();
      } else {
        this.playBreakBell();
      }
    }
  }

  public playChime(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Rich 4-note celebratory arpeggio chime: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.35, gain: 0.18 }, // C5
        { freq: 659.25, time: 0.09, dur: 0.35, gain: 0.20 }, // E5
        { freq: 783.99, time: 0.18, dur: 0.40, gain: 0.22 }, // G5
        { freq: 1046.50, time: 0.28, dur: 0.85, gain: 0.26 }, // C6 (high resonant bell)
      ];

      for (const note of notes) {
        const start = now + note.time;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Sine base with slight warm bell shimmer
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(note.gain, start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.dur + 0.05);
      }
    } catch (e) {
      console.warn('Audio synthesis failed, falling back to native alert:', e);
      // Fallback to native Windows notification sound
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  public playAlertChime(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Two-tone attention chime (E5 -> A5)
      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.18, gain: 0.20 },
        { freq: 880.00, time: 0.10, dur: 0.38, gain: 0.24 },
      ];

      for (const note of notes) {
        const start = now + note.time;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(note.gain, start + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.dur + 0.04);
      }
    } catch (e) {
      console.warn('Alert audio synthesis failed, falling back to native alert:', e);
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  private lastPurrTime = 0;

  /** Playful warm cat purr and gentle chirp when scratched / petted */
  public playPurr(): void {
    const nowMs = Date.now();
    if (nowMs - this.lastPurrTime < 340) return;
    this.lastPurrTime = nowMs;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // 1. Warm purring rumble: low frequency modulated wave (~82Hz vibrating at ~24Hz)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(82, now);
      osc.frequency.exponentialRampToValueAtTime(102, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(74, now + 0.28);

      modOsc.type = 'sine';
      modOsc.frequency.setValueAtTime(24, now);
      modGain.gain.setValueAtTime(0.04, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      modOsc.connect(gainNode.gain);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      modOsc.start(now);
      osc.start(now);
      modOsc.stop(now + 0.3);
      osc.stop(now + 0.3);

      // 2. Sweet subtle high harmonic chirp (D6 -> E6)
      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(1174.66, now + 0.02);
      chirp.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1);
      chirpGain.gain.setValueAtTime(0.0001, now + 0.02);
      chirpGain.gain.linearRampToValueAtTime(0.025, now + 0.04);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      chirp.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirp.start(now + 0.02);
      chirp.stop(now + 0.17);
    } catch {
      // Audio optional / graceful fallback
    }
  }

  /** Energizing rising chime for focus sprint start (F4 -> A4 -> C5 -> F5) */
  public playFocusStartChime(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const notes = [
        { freq: 349.23, time: 0.0, dur: 0.22, gain: 0.16 }, // F4
        { freq: 440.0, time: 0.08, dur: 0.22, gain: 0.18 }, // A4
        { freq: 523.25, time: 0.16, dur: 0.26, gain: 0.22 }, // C5
        { freq: 698.46, time: 0.24, dur: 0.65, gain: 0.24 }, // F5
      ];

      for (const n of notes) {
        const start = now + n.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(n.gain, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + n.dur + 0.02);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Relaxing zen / singing bowl resonant chime for break start */
  public playBreakBell(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Resonant harmonic pair: fundamental 432Hz + warm 864Hz overtone with slow decay
      const harmonics = [
        { freq: 432.0, gain: 0.25, dur: 1.8 },
        { freq: 864.0, gain: 0.12, dur: 1.2 },
        { freq: 1296.0, gain: 0.05, dur: 0.8 },
      ];

      for (const h of harmonics) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(h.gain, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + h.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + h.dur + 0.05);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Subtle mechanical key switch click */
  public playKeyClick(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Snappy micro-click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      // Pitch drop simulates switch actuation
      osc.frequency.setValueAtTime(600 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  /** Gentle harmonic stretch reminder chime (singing bowl vibe) */
  public playStretchZenChime(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const tones = [
        { freq: 528.0, time: 0.0, gain: 0.22, dur: 2.2 }, // "Love frequency" 528Hz
        { freq: 792.0, time: 0.15, gain: 0.12, dur: 1.8 },
        { freq: 1056.0, time: 0.35, gain: 0.08, dur: 1.5 },
      ];

      for (const t of tones) {
        const start = now + t.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(t.gain, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + t.dur + 0.05);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Cheerful victory sparkle when completing a task or checklist item */
  public playTaskCelebration(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // 3 ascending major tones: G5 -> C6 -> E6
      const fanfare = [
        { freq: 783.99, time: 0.00, gain: 0.16, dur: 0.2 },
        { freq: 1046.50, time: 0.10, gain: 0.20, dur: 0.22 },
        { freq: 1318.51, time: 0.22, gain: 0.24, dur: 0.45 },
      ];

      for (const f of fanfare) {
        const start = now + f.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f.freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(f.gain, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + f.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + f.dur + 0.03);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }
}

export const notificationService = new NotificationService();
