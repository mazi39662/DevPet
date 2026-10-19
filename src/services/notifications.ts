import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import type { Settings, SoundEffectsConfig, KeyboardSoundProfile } from '../types/settings';
import { DEFAULT_SOUND_EFFECTS } from '../types/settings';

class NotificationService {
  private hasPermission = false;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private keyboardGain: GainNode | null = null;
  private volume = 0.8;
  private keyboardVolume = 0.8;
  private soundEffectsConfig: SoundEffectsConfig = { ...DEFAULT_SOUND_EFFECTS };

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setKeyboardVolume(vol: number): void {
    this.keyboardVolume = Math.max(0, Math.min(1, vol));
    if (this.keyboardGain && this.audioCtx) {
      try {
        this.keyboardGain.gain.setValueAtTime(this.keyboardVolume, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public getKeyboardVolume(): number {
    return this.keyboardVolume;
  }

  public getSoundEffectsConfig(): SoundEffectsConfig {
    return { ...this.soundEffectsConfig };
  }

  public setSoundEffectsConfig(config: Partial<SoundEffectsConfig>): void {
    this.soundEffectsConfig = {
      ...this.soundEffectsConfig,
      ...config,
    };
  }

  public setKeyboardProfile(profile: KeyboardSoundProfile): void {
    this.soundEffectsConfig.keyboardProfile = profile;
  }

  private getAudioContext(): AudioContext | null {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
        this.masterGain = null;
        this.keyboardGain = null;
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.masterGain && this.audioCtx) {
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
      if (!this.keyboardGain && this.audioCtx && this.masterGain) {
        this.keyboardGain = this.audioCtx.createGain();
        this.keyboardGain.gain.setValueAtTime(this.keyboardVolume, this.audioCtx.currentTime);
        this.keyboardGain.connect(this.masterGain);
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private getDestination(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    return this.masterGain || ctx.destination;
  }

  private getKeyboardDestination(): AudioNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    return this.keyboardGain || this.masterGain || ctx.destination;
  }

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
    if (!this.soundEffectsConfig.completion || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, start);

        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(note.gain, start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

        osc.connect(gainNode);
        gainNode.connect(dest);

        osc.start(start);
        osc.stop(start + note.dur + 0.05);
      }
    } catch (e) {
      console.warn('Audio synthesis failed, falling back to native alert:', e);
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  public playAlertChime(): void {
    if (!this.soundEffectsConfig.alerts || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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
        gainNode.connect(dest);

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
    if (!this.soundEffectsConfig.purr || this.volume <= 0.001) return;
    const nowMs = Date.now();
    if (nowMs - this.lastPurrTime < 340) return;
    this.lastPurrTime = nowMs;

    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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
      gainNode.connect(dest);

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
      chirpGain.connect(dest);
      chirp.start(now + 0.02);
      chirp.stop(now + 0.17);
    } catch {}
  }

  /** Energizing rising chime for focus sprint start (F4 -> A4 -> C5 -> F5) */
  public playFocusStartChime(): void {
    if (!this.soundEffectsConfig.pomodoro || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + n.dur + 0.02);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Relaxing zen / singing bowl resonant chime for break start */
  public playBreakBell(): void {
    if (!this.soundEffectsConfig.pomodoro || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + h.dur + 0.05);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Plays sound for a specific keyboard sound profile */
  public playKeyboardProfileSound(profile: KeyboardSoundProfile, pitchVariation = true): void {
    if (!this.soundEffectsConfig.typing || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;
      const pitchRnd = pitchVariation ? (Math.random() - 0.5) * 50 : 0;

      switch (profile) {
        case 'thock': {
          // Deep creamy lubed linear mechanical switch (Gateron Ink / Holy Panda style)
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(580, now);
          filter.Q.setValueAtTime(2.2, now);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(290 + pitchRnd, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.052);
          break;
        }

        case 'typewriter': {
          // Vintage mechanical typewriter: metallic strike transient + mechanical bottom-out
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'square';
          clickOsc.frequency.setValueAtTime(1400 + pitchRnd * 4, now);
          clickGain.gain.setValueAtTime(0.0001, now);
          clickGain.gain.linearRampToValueAtTime(0.045, now + 0.001);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'triangle';
          bodyOsc.frequency.setValueAtTime(320 + pitchRnd, now);
          bodyOsc.frequency.exponentialRampToValueAtTime(95, now + 0.038);
          bodyGain.gain.setValueAtTime(0.0001, now);
          bodyGain.gain.linearRampToValueAtTime(0.08, now + 0.002);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

          clickOsc.connect(clickGain);
          clickGain.connect(dest);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(dest);

          clickOsc.start(now);
          bodyOsc.start(now);
          clickOsc.stop(now + 0.02);
          bodyOsc.stop(now + 0.045);
          break;
        }

        case 'bubble': {
          // Bubbly water pop: upward resonant frequency chirp
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320 + pitchRnd, now);
          osc.frequency.exponentialRampToValueAtTime(860 + pitchRnd * 1.5, now + 0.028);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.11, now + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.042);
          break;
        }

        case 'arcade': {
          // 8-bit retro arcade switch blip
          const baseTone = 659.25 + pitchRnd * 0.3;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(baseTone, now);
          osc.frequency.setValueAtTime(baseTone * 1.25, now + 0.015);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.001);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.038);
          break;
        }

        case 'cyber': {
          // Cyberpunk sci-fi neon pulse: resonant sweeping filter
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2600, now);
          filter.frequency.exponentialRampToValueAtTime(260, now + 0.04);
          filter.Q.setValueAtTime(3.5, now);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220 + pitchRnd, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.07, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case 'muted': {
          // Soft dampened tactile / Topre silent membrane switch
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, now);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(170 + pitchRnd * 0.4, now);
          osc.frequency.exponentialRampToValueAtTime(65, now + 0.025);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.032);
          break;
        }

        case 'marbly': {
          // Hi-Fi PE Foam marbly pop clack (Jelly Epoch acoustic profile)
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();
          const snapFilter = ctx.createBiquadFilter();
          snapFilter.type = 'bandpass';
          snapFilter.frequency.setValueAtTime(2500, now);
          snapFilter.Q.setValueAtTime(3.0, now);

          snapOsc.type = 'triangle';
          snapOsc.frequency.setValueAtTime(3200 + pitchRnd * 6, now);
          snapOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.012);
          snapGain.gain.setValueAtTime(0.0001, now);
          snapGain.gain.linearRampToValueAtTime(0.08, now + 0.001);
          snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

          snapOsc.connect(snapFilter);
          snapFilter.connect(snapGain);
          snapGain.connect(dest);

          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'sine';
          bodyOsc.frequency.setValueAtTime(460 + pitchRnd, now);
          bodyOsc.frequency.exponentialRampToValueAtTime(140, now + 0.038);
          bodyGain.gain.setValueAtTime(0.0001, now);
          bodyGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

          bodyOsc.connect(bodyGain);
          bodyGain.connect(dest);

          snapOsc.start(now);
          bodyOsc.start(now);
          snapOsc.stop(now + 0.02);
          bodyOsc.stop(now + 0.045);
          break;
        }

        case 'creamy': {
          // Ultra-smooth lubricated linear switch (Milky Yellow / Alpaca)
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(750, now);
          filter.Q.setValueAtTime(1.8, now);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(360 + pitchRnd, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.11, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.044);
          break;
        }

        case 'waterdrop': {
          // Soothing clean water droplet / dewdrop plink
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(520 + pitchRnd, now);
          osc1.frequency.exponentialRampToValueAtTime(1650 + pitchRnd * 1.5, now + 0.016);

          gain1.gain.setValueAtTime(0.0001, now);
          gain1.gain.linearRampToValueAtTime(0.1, now + 0.002);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760 + pitchRnd * 2, now + 0.012);

          gain2.gain.setValueAtTime(0.0001, now + 0.012);
          gain2.gain.linearRampToValueAtTime(0.06, now + 0.014);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

          osc1.connect(gain1);
          gain1.connect(dest);
          osc2.connect(gain2);
          gain2.connect(dest);

          osc1.start(now);
          osc2.start(now + 0.012);
          osc1.stop(now + 0.035);
          osc2.stop(now + 0.06);
          break;
        }

        case 'synthwave': {
          // 80s neon analog poly-synth FM keyboard clack
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3600, now);
          filter.frequency.exponentialRampToValueAtTime(550, now + 0.04);
          filter.Q.setValueAtTime(3.8, now);

          const rootOsc = ctx.createOscillator();
          const fifthOsc = ctx.createOscillator();
          const gain = ctx.createGain();

          rootOsc.type = 'sawtooth';
          rootOsc.frequency.setValueAtTime(440 + pitchRnd, now);
          fifthOsc.type = 'square';
          fifthOsc.frequency.setValueAtTime(659.25 + pitchRnd * 1.2, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.07, now + 0.002);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

          rootOsc.connect(filter);
          fifthOsc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          rootOsc.start(now);
          fifthOsc.start(now);
          rootOsc.stop(now + 0.048);
          fifthOsc.stop(now + 0.048);
          break;
        }

        case 'wooden': {
          // Hollow bamboo / walnut woodblock tactile knock
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1180, now);
          filter.Q.setValueAtTime(4.2, now);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(950 + pitchRnd * 2, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.022);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.001);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'sine';
          bodyOsc.frequency.setValueAtTime(240 + pitchRnd, now);
          bodyOsc.frequency.exponentialRampToValueAtTime(85, now + 0.03);
          bodyGain.gain.setValueAtTime(0.0001, now);
          bodyGain.gain.linearRampToValueAtTime(0.06, now + 0.002);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(dest);

          osc.start(now);
          bodyOsc.start(now);
          osc.stop(now + 0.038);
          bodyOsc.stop(now + 0.035);
          break;
        }

        case 'clicky':
        default: {
          // Crisp mechanical blue switch (Cherry MX Blue / Kailh Box White)
          // Stage 1: Sharp click leaf
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();
          snapOsc.type = 'triangle';
          snapOsc.frequency.setValueAtTime(2200 + pitchRnd * 6, now);
          snapOsc.frequency.exponentialRampToValueAtTime(750, now + 0.012);
          snapGain.gain.setValueAtTime(0.0001, now);
          snapGain.gain.linearRampToValueAtTime(0.065, now + 0.001);
          snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          // Stage 2: Housing bottom-out thud
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'triangle';
          bodyOsc.frequency.setValueAtTime(520 + pitchRnd, now);
          bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.035);
          bodyGain.gain.setValueAtTime(0.0001, now);
          bodyGain.gain.linearRampToValueAtTime(0.075, now + 0.002);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

          snapOsc.connect(snapGain);
          snapGain.connect(dest);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(dest);

          snapOsc.start(now);
          bodyOsc.start(now);
          snapOsc.stop(now + 0.018);
          bodyOsc.stop(now + 0.045);
          break;
        }
      }
    } catch {}
  }

  /** Distinct deep stabilized sound for the Spacebar */
  public playSpacebarSound(profile?: KeyboardSoundProfile): void {
    if (!this.soundEffectsConfig.typing || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const activeProf = profile || this.soundEffectsConfig.keyboardProfile || 'clicky';
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      // Stabilizer wire micro-clack + deeper chamber thud
      const wireOsc = ctx.createOscillator();
      const wireGain = ctx.createGain();
      wireOsc.type = 'triangle';
      wireOsc.frequency.setValueAtTime(1100, now);
      wireOsc.frequency.exponentialRampToValueAtTime(350, now + 0.015);
      wireGain.gain.setValueAtTime(0.0001, now);
      wireGain.gain.linearRampToValueAtTime(0.05, now + 0.001);
      wireGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      const barOsc = ctx.createOscillator();
      const barGain = ctx.createGain();
      barOsc.type = activeProf === 'thock' || activeProf === 'creamy' ? 'sine' : 'triangle';
      barOsc.frequency.setValueAtTime(activeProf === 'thock' ? 170 : 260, now);
      barOsc.frequency.exponentialRampToValueAtTime(65, now + 0.055);
      barGain.gain.setValueAtTime(0.0001, now);
      barGain.gain.linearRampToValueAtTime(0.12, now + 0.003);
      barGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      wireOsc.connect(wireGain);
      wireGain.connect(dest);
      barOsc.connect(barGain);
      barGain.connect(dest);

      wireOsc.start(now);
      barOsc.start(now);
      wireOsc.stop(now + 0.02);
      barOsc.stop(now + 0.065);
    } catch {}
  }

  /** Satisfying carriage return bell or affirmative chord for Enter key */
  public playEnterSound(profile?: KeyboardSoundProfile): void {
    if (!this.soundEffectsConfig.typing || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const activeProf = profile || this.soundEffectsConfig.keyboardProfile || 'clicky';
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      if (activeProf === 'typewriter') {
        // Classic authentic typewriter carriage return bell "Ding! 🛎️" (C7 harmonic bell)
        const bell = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        bell.type = 'sine';
        bell.frequency.setValueAtTime(2093.0, now); // C7
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(3135.96, now); // G7

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        bell.connect(gain);
        overtone.connect(gain);
        gain.connect(dest);

        bell.start(now);
        overtone.start(now);
        bell.stop(now + 0.58);
        overtone.stop(now + 0.58);
      } else {
        // Affirmative 2-tone melodic harmonic chime on Enter
        const chord = [
          { freq: 659.25, time: 0.0, gain: 0.09, dur: 0.12 }, // E5
          { freq: 987.77, time: 0.04, gain: 0.12, dur: 0.22 }, // B5
        ];
        for (const note of chord) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          gain.gain.setValueAtTime(0.0001, now + note.time);
          gain.gain.linearRampToValueAtTime(note.gain, now + note.time + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur + 0.02);
        }
      }
    } catch {}
  }

  /** Distinct downward blip / erase sound for Backspace key */
  public playBackspaceSound(profile?: KeyboardSoundProfile): void {
    if (!this.soundEffectsConfig.typing || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const activeProf = profile || this.soundEffectsConfig.keyboardProfile || 'clicky';
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = activeProf === 'arcade' || activeProf === 'synthwave' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.042);
    } catch {}
  }

  /** Main entry point for playing keyboard sound effects */
  public playKeyClick(key?: string, overrideProfile?: KeyboardSoundProfile): void {
    if (!this.soundEffectsConfig.typing || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    const profile = overrideProfile || this.soundEffectsConfig.keyboardProfile || 'clicky';

    const normalizedKey = (key || '').toLowerCase();
    if (normalizedKey === ' ' || normalizedKey === 'space' || normalizedKey === 'spacebar') {
      if (this.soundEffectsConfig.spacebarSound) {
        this.playSpacebarSound(profile);
        return;
      }
    } else if (normalizedKey === 'enter' || normalizedKey === 'return') {
      if (this.soundEffectsConfig.enterSound) {
        this.playEnterSound(profile);
        return;
      }
    } else if (normalizedKey === 'backspace' || normalizedKey === 'delete') {
      if (this.soundEffectsConfig.backspaceSound) {
        this.playBackspaceSound(profile);
        return;
      }
    }

    this.playKeyboardProfileSound(profile, true);
  }

  /** Celebratory milestone chime when user hits typing combo streaks */
  public playComboMilestone(combo: number): void {
    if (!this.soundEffectsConfig.comboMilestones || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      let notes: { freq: number; time: number; gain: number; dur: number }[] = [];
      if (combo >= 100) {
        // Grand 4-note ascending sparkle arpeggio
        notes = [
          { freq: 523.25, time: 0.0, gain: 0.12, dur: 0.15 },
          { freq: 659.25, time: 0.08, gain: 0.14, dur: 0.18 },
          { freq: 783.99, time: 0.16, gain: 0.16, dur: 0.22 },
          { freq: 1046.5, time: 0.24, gain: 0.18, dur: 0.4 },
        ];
      } else if (combo >= 50) {
        // Uplifting 3-note sparkle chord
        notes = [
          { freq: 698.46, time: 0.0, gain: 0.11, dur: 0.14 },
          { freq: 880.0, time: 0.09, gain: 0.13, dur: 0.18 },
          { freq: 1046.5, time: 0.18, gain: 0.15, dur: 0.32 },
        ];
      } else if (combo >= 25) {
        // Upbeat double chime
        notes = [
          { freq: 783.99, time: 0.0, gain: 0.1, dur: 0.12 },
          { freq: 1174.66, time: 0.09, gain: 0.13, dur: 0.25 },
        ];
      } else {
        return;
      }

      for (const n of notes) {
        const start = now + n.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(n.gain, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + n.dur + 0.03);
      }
    } catch {}
  }

  /** Uplifting power-up riser whoosh when user reaches Turbo WPM speed */
  public playTurboPowerup(): void {
    if (!this.soundEffectsConfig.turboPowerup || this.volume <= 0.001 || this.keyboardVolume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getKeyboardDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  /** Playful cute mascot boop chirp when user clicks or pets Moki */
  public playMascotBoop(): void {
    if (!this.soundEffectsConfig.mascotBoop || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(1420, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.11);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  /** Gentle harmonic stretch reminder chime (singing bowl vibe) */
  public playStretchZenChime(): void {
    if (!this.soundEffectsConfig.pomodoro || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      const tones = [
        { freq: 528.0, time: 0.0, gain: 0.22, dur: 2.2 },
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
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + t.dur + 0.05);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Cheerful victory sparkle when completing a task or checklist item */
  public playTaskCelebration(): void {
    if (!this.soundEffectsConfig.completion || this.volume <= 0.001) return;
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
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
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + f.dur + 0.03);
      }
    } catch {
      import('./native').then(({ native }) => native.playSystemSound()).catch(() => {});
    }
  }

  /** Direct audition tone for volume slider testing */
  public playPreviewSound(): void {
    try {
      const ctx = this.getAudioContext();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }
}

export const notificationService = new NotificationService();
