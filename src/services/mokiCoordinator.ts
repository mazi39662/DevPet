/**
 * MokiCoordinator - State Manager for Moki Companion
 * Handles live typing WPM calculation, keystroke particle events,
 * typing streaks, and speed tiers.
 */

import { reactive } from 'vue';
import type { MokiAction, MokiMood, MokiRamTier, MokiState, TypingSpeedTier } from '../types/moki';
import { DEFAULT_MOKI_STATE } from '../types/moki';
import { EVENTS } from '../types/events';
import { emitEvent, native, onEvent } from './native';

const STORAGE_KEYS = {
  stats: 'devpet_moki_stats',
};

class MokiCoordinatorService {
  private state: MokiState = reactive({ ...DEFAULT_MOKI_STATE });
  private recentKeystrokes: number[] = [];
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;
  private lastKeystrokeTime = 0;
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
      this.fetchInitialMemory();
    } else {
      this.listenForStateBroadcasts();
      this.dispatchAction({ type: 'sync' });
    }

    this.listenForTyping();
    this.listenForSystemMemory();
  }

  private loadPersistedData(): void {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEYS.stats);
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        this.state.peakWpm = stats.peakWpm || 0;
        this.state.totalKeystrokes = stats.totalKeystrokes || 0;
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

      // Idle mood progression (stays in lively idle with random animations)
      if (this.state.mood !== 'celebrating' && this.state.mood !== 'blissful' && this.state.mood !== 'booped') {
        if (elapsedSinceKeystroke > 12000) {
          // > 12 seconds idle -> resting idle (pet executes random idle micro-animations)
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

    this.recalculateWpm(now);

    // Dynamic mood update: actively typing
    if (this.state.mood !== 'celebrating' && this.state.mood !== 'booped') {
      this.state.mood = 'typing';
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
    else if (this.state.currentWpm >= 66) tier = 'fast';
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

      case 'set-ram-tier':
        this.setRamTier(action.tier, action.percentage, action.autoTracking ?? false);
        break;

      case 'set-ram-tracking':
        this.setRamAutoTracking(action.autoTracking);
        break;

      case 'sync':
        this.broadcastState();
        break;
    }

    this.broadcastState();
  }

  public updateMemoryUsage(mem: { totalBytes: number; usedBytes: number; usedPercent: number }): void {
    if (!this.state.ramUsage) {
      this.state.ramUsage = { ...DEFAULT_MOKI_STATE.ramUsage! };
    }
    // Only update automatically if autoTracking is active
    if (!this.state.ramUsage.autoTracking) return;

    this.state.ramUsage.totalBytes = mem.totalBytes;
    this.state.ramUsage.usedBytes = mem.usedBytes;
    this.state.ramUsage.percentage = Math.round(mem.usedPercent);

    // Compute tier based on thresholds
    let tier: MokiRamTier = 'breeze';
    if (this.state.ramUsage.percentage >= 85) tier = 'meltdown';
    else if (this.state.ramUsage.percentage >= 70) tier = 'heavy';
    else if (this.state.ramUsage.percentage >= 45) tier = 'warm';

    this.state.ramUsage.tier = tier;
    this.broadcastState();
  }

  public setRamTier(tier: MokiRamTier, percentage?: number, autoTracking = false): void {
    if (!this.state.ramUsage) {
      this.state.ramUsage = { ...DEFAULT_MOKI_STATE.ramUsage! };
    }
    this.state.ramUsage.tier = tier;
    this.state.ramUsage.autoTracking = autoTracking;

    if (percentage !== undefined) {
      this.state.ramUsage.percentage = percentage;
    } else {
      if (tier === 'breeze') this.state.ramUsage.percentage = 34;
      else if (tier === 'warm') this.state.ramUsage.percentage = 58;
      else if (tier === 'heavy') this.state.ramUsage.percentage = 78;
      else if (tier === 'meltdown') this.state.ramUsage.percentage = 92;
    }

    // Trigger themed speech bubble
    const quips: Record<MokiRamTier, string> = {
      breeze: 'RAM is crisp and breezy! 🍃 Plenty of headroom.',
      warm: 'Memory active and humming along nicely! ⚙️',
      heavy: 'Whew! Chrome & Docker are getting heavy! 💦',
      meltdown: 'RAM MELTDOWN!! Close some tabs before I explode! 🚨💥',
    };
    this.showSpeechBubble(quips[tier], 3500);
    this.broadcastState();
  }

  public setRamAutoTracking(enabled: boolean): void {
    if (!this.state.ramUsage) {
      this.state.ramUsage = { ...DEFAULT_MOKI_STATE.ramUsage! };
    }
    this.state.ramUsage.autoTracking = enabled;
    if (enabled) {
      this.fetchInitialMemory();
      this.showSpeechBubble('RAM Auto-Tracking synchronized! 🛰️', 3000);
    }
    this.broadcastState();
  }

  private async fetchInitialMemory(): Promise<void> {
    try {
      const mem = await native.getSystemMemory();
      if (mem) {
        this.updateMemoryUsage(mem);
      }
    } catch {}
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

  private listenForSystemMemory(): void {
    onEvent(EVENTS.tick, (payload) => {
      if (payload.memory) {
        this.updateMemoryUsage(payload.memory);
      }
    }).catch(() => {});
  }

  public cleanup(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
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
