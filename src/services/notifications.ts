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
}

export const notificationService = new NotificationService();
