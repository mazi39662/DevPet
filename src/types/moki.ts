/**
 * Types and contracts for Moki - Idle Desktop Keyboard Companion Pet
 */

export type MokiMood =
  | 'idle'
  | 'typing'
  | 'turbo'
  | 'thinking'
  | 'waiting'
  | 'celebrating'
  | 'error'
  | 'booped'
  | 'blissful';

export type TypingSpeedTier = 'idle' | 'casual' | 'flow' | 'fast' | 'godspeed';

export interface KeystrokeParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  scale: number;
  color: string;
  opacity: number;
  special?: boolean;
  isWpm?: boolean;
}

export interface MokiState {
  mood: MokiMood;
  currentWpm: number;
  peakWpm: number;
  totalKeystrokes: number;
  speedTier: TypingSpeedTier;
  speechBubbleText: string;
  isSpeechBubbleVisible: boolean;
}

export type MokiAction =
  | { type: 'keystroke'; key?: string }
  | { type: 'set-mood'; mood: MokiMood; durationMs?: number }
  | { type: 'set-speech-bubble'; text: string; durationMs?: number }
  | { type: 'sync' };

export const DEFAULT_MOKI_STATE: MokiState = {
  mood: 'idle',
  currentWpm: 0,
  peakWpm: 0,
  totalKeystrokes: 0,
  speedTier: 'idle',
  speechBubbleText: 'Hi, I am Moki! Ready to type with you! 🐾',
  isSpeechBubbleVisible: true,
};
