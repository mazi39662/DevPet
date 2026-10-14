/**
 * Types and contracts for Moki - Idle Keyboard & Wellness Pet Companion
 */

export type MokiMood =
  | 'idle'
  | 'typing'
  | 'turbo'
  | 'thinking'
  | 'waiting'
  | 'celebrating'
  | 'error'
  | 'sleepy'
  | 'stretching'
  | 'booped'
  | 'blissful';

export type TypingSpeedTier = 'idle' | 'casual' | 'flow' | 'turbo' | 'godspeed';

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

export interface MokiTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'normal' | 'high' | 'urgent';
  createdAt: number;
}

export interface MokiStickyNote {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender';
  pinned: boolean;
  createdAt: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isFloating?: boolean;
}

export interface StretchReminderState {
  intervalMinutes: number;
  activeSecondsElapsed: number;
  isPrompting: boolean;
  promptMessage: string;
  stretchStreak: number;
  lastStretchedAt: number | null;
}

export interface MokiState {
  mood: MokiMood;
  currentWpm: number;
  peakWpm: number;
  totalKeystrokes: number;
  combo: number;
  maxCombo: number;
  speedTier: TypingSpeedTier;
  tasks: MokiTask[];
  stickyNotes: MokiStickyNote[];
  speechBubbleText: string;
  isSpeechBubbleVisible: boolean;
}

export type MokiAction =
  | { type: 'keystroke'; key?: string }
  | { type: 'set-mood'; mood: MokiMood; durationMs?: number }
  | { type: 'set-speech-bubble'; text: string; durationMs?: number }
  | { type: 'add-task'; text: string; priority?: 'normal' | 'high' | 'urgent' }
  | { type: 'toggle-task'; id: string }
  | { type: 'delete-task'; id: string }
  | { type: 'clear-completed-tasks' }
  | { type: 'add-sticky-note'; content?: string; color?: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender'; x?: number; y?: number; isFloating?: boolean }
  | { type: 'update-sticky-note'; id: string; content?: string; color?: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender'; pinned?: boolean; x?: number; y?: number; width?: number; height?: number; isFloating?: boolean }
  | { type: 'delete-sticky-note'; id: string }
  | { type: 'sync' };

export const DEFAULT_MOKI_STATE: MokiState = {
  mood: 'idle',
  currentWpm: 0,
  peakWpm: 0,
  totalKeystrokes: 0,
  combo: 0,
  maxCombo: 0,
  speedTier: 'idle',
  tasks: [
    { id: '1', text: 'Welcome to Moki! Type anywhere to see letter particles ✨', completed: true, priority: 'normal', createdAt: Date.now() - 30000 },
    { id: '2', text: 'Hit 60+ WPM to activate Turbo Moki mode 🚀', completed: false, priority: 'urgent', createdAt: Date.now() - 10000 },
  ],
  stickyNotes: [
    {
      id: 'note-1',
      content: '📌 Quick Notes:\n• Moki tracks typing speed\n• Click or pet Moki for love! 💕',
      color: 'yellow',
      pinned: true,
      createdAt: Date.now() - 100000,
    },
    {
      id: 'note-2',
      content: '⚡ Focus Mantra:\nBreathe deep, write clean code, type freely! ✨',
      color: 'mint',
      pinned: false,
      createdAt: Date.now() - 50000,
    },
  ],
  speechBubbleText: 'Hi, I am Moki! Ready to type with you! 🐾',
  isSpeechBubbleVisible: true,
};
