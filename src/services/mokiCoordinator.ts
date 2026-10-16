/**
 * MokiCoordinator - State Manager & Wellness Coach for Moki Companion
 * Handles live typing WPM calculation, keystroke particle events,
 * and prolonged computer usage stretch reminders.
 */

import { reactive } from 'vue';
import type { MokiAction, MokiMood, MokiState, TypingSpeedTier } from '../types/moki';
import { DEFAULT_MOKI_STATE } from '../types/moki';
import { EVENTS } from '../types/events';
import { emitEvent, onEvent } from './native';

const STORAGE_KEYS = {
  stats: 'devpet_moki_stats',
};

class MokiCoordinatorService {
  private state: MokiState = reactive({ ...DEFAULT_MOKI_STATE });
  private recentKeystrokes: number[] = [];
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;
  private lastKeystrokeTime = 0;
  private comboResetTimer: ReturnType<typeof setTimeout> | null = null;
  private celebrationTimer: ReturnType<typeof setTimeout> | null = null;
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private moodTimer: ReturnType<typeof setTimeout> | null = null;
  private isCoordinatorHost = false;

  public getState(): MokiState {
    return this.state;
  }

  public init(isHost = true): void {
    this.isCoordinatorHost = isHost;
    this.loadPersistedData();

    if (this.isCoordinatorHost) {
      this.startHeartbeat();
      this.listenForRemoteActions();
    } else {
      this.listenForStateBroadcasts();
      this.dispatchAction({ type: 'sync' });
    }

    this.listenForTyping();
  }

  private loadPersistedData(): void {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEYS.stats);
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        this.state.peakWpm = stats.peakWpm || 0;
        this.state.totalKeystrokes = stats.totalKeystrokes || 0;
        this.state.maxCombo = stats.maxCombo || 0;
      }
    } catch {}
  }

  private persistData(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.stats,
        JSON.stringify({
          peakWpm: this.state.peakWpm,
          totalKeystrokes: this.state.totalKeystrokes,
          maxCombo: this.state.maxCombo,
        })
      );
    } catch {}
  }

  private startHeartbeat(): void {
    if (this.idleCheckTimer) clearInterval(this.idleCheckTimer);

    this.idleCheckTimer = setInterval(() => {
      const now = Date.now();
      const elapsedSinceKeystroke = now - this.lastKeystrokeTime;

      // Clean old keystrokes from sliding window (last 6 seconds)
      this.recentKeystrokes = this.recentKeystrokes.filter((ts) => now - ts <= 6000);
      this.recalculateWpm(now);

      // Idle mood progression
      if (this.state.mood !== 'celebrating' && this.state.mood !== 'blissful' && this.state.mood !== 'booped') {
        if (elapsedSinceKeystroke > 180000) {
          // > 3 minutes idle -> sleepy
          this.state.mood = 'sleepy';
          this.state.speechBubbleText = 'Zzz... Snoozing... 💤';
        } else if (elapsedSinceKeystroke > 12000) {
          // > 12 seconds idle -> resting idle
          this.state.mood = 'idle';
        }
      }

      this.broadcastState();
    }, 1000);
  }

  public recordKeystroke(_key?: string): void {
    const now = Date.now();
    this.lastKeystrokeTime = now;
    this.recentKeystrokes.push(now);
    this.state.totalKeystrokes++;

    // Combo streak tracking
    this.state.combo++;
    if (this.state.combo > this.state.maxCombo) {
      this.state.maxCombo = this.state.combo;
    }

    if (this.comboResetTimer) clearTimeout(this.comboResetTimer);
    this.comboResetTimer = setTimeout(() => {
      this.state.combo = 0;
      this.broadcastState();
    }, 2800);

    this.recalculateWpm(now);

    // Dynamic mood update based on typing pace
    if (this.state.mood !== 'celebrating' && this.state.mood !== 'booped') {
      if (this.state.currentWpm >= 65) {
        this.state.mood = 'turbo';
      } else {
        this.state.mood = 'typing';
      }
    }

    this.persistData();
    this.broadcastState();
  }

  private recalculateWpm(now: number): void {
    const count = this.recentKeystrokes.length;
    if (count < 2) {
      if (now - this.lastKeystrokeTime > 2500) {
        this.state.currentWpm = 0;
        this.state.speedTier = 'idle';
      }
      return;
    }

    // Standard formula: (characters / 5) / minutes
    // Sliding window of up to 6 seconds
    const oldest = this.recentKeystrokes[0];
    const spanSeconds = Math.max((now - oldest) / 1000, 1.2);
    const calculatedWpm = Math.round((count / 5) / (spanSeconds / 60));

    this.state.currentWpm = Math.min(calculatedWpm, 250);

    if (this.state.currentWpm > this.state.peakWpm) {
      this.state.peakWpm = this.state.currentWpm;
    }

    // Speed tier calculation
    let tier: TypingSpeedTier = 'idle';
    if (this.state.currentWpm >= 96) tier = 'godspeed';
    else if (this.state.currentWpm >= 66) tier = 'turbo';
    else if (this.state.currentWpm >= 36) tier = 'flow';
    else if (this.state.currentWpm > 0) tier = 'casual';

    this.state.speedTier = tier;
  }

  public showSpeechBubble(text: string, durationMs = 4000): void {
    this.state.speechBubbleText = text;
    this.state.isSpeechBubbleVisible = true;

    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.state.isSpeechBubbleVisible = false;
      this.bubbleTimer = null;
    }, durationMs);
  }

  public setMood(mood: MokiMood, durationMs?: number): void {
    this.state.mood = mood;
    if (this.moodTimer) {
      clearTimeout(this.moodTimer);
      this.moodTimer = null;
    }
    if (durationMs && durationMs > 0) {
      this.moodTimer = setTimeout(() => {
        if (this.state.mood === mood) {
          this.state.mood = 'idle';
          this.broadcastState();
        }
        this.moodTimer = null;
      }, durationMs);
    }
    this.broadcastState();
  }

  public handleAction(action: MokiAction): void {
    switch (action.type) {
      case 'keystroke':
        this.recordKeystroke(action.key);
        break;

      case 'set-mood':
        this.setMood(action.mood, action.durationMs);
        break;

      case 'set-speech-bubble':
        this.showSpeechBubble(action.text, action.durationMs || 4000);
        this.broadcastState();
        break;

      case 'sync':
        this.broadcastState();
        break;
    }

    this.broadcastState();
  }

  public dispatchAction(action: MokiAction): void {
    if (this.isCoordinatorHost) {
      this.handleAction(action);
    } else {
      emitEvent(EVENTS.mokiAction, action).catch(() => {});
    }
  }

  private broadcastState(): void {
    if (this.isCoordinatorHost) {
      emitEvent(EVENTS.mokiState, { ...this.state }).catch(() => {});
    }
  }

  private listenForRemoteActions(): void {
    onEvent(EVENTS.mokiAction, (action: MokiAction) => {
      this.handleAction(action);
    }).catch(() => {});
  }

  private listenForStateBroadcasts(): void {
    onEvent(EVENTS.mokiState, (incoming: MokiState) => {
      Object.assign(this.state, incoming);
    }).catch(() => {});
  }

  private listenForTyping(): void {
    // Listen to global Windows low-level hook event
    onEvent(EVENTS.userTyping, (payload) => {
      this.recordKeystroke(payload.key);
    }).catch(() => {});
  }

  public cleanup(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
    if (this.comboResetTimer) {
      clearTimeout(this.comboResetTimer);
      this.comboResetTimer = null;
    }
    if (this.celebrationTimer) {
      clearTimeout(this.celebrationTimer);
      this.celebrationTimer = null;
    }
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }
}

export const mokiCoordinator = new MokiCoordinatorService();
