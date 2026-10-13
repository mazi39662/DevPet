<template>
  <div
    ref="containerRef"
    class="pet-container"
    :class="[
      status,
      {
        mini,
        scratching: isScratching,
        blissful: isBlissful,
        booped: isBooped,
        hovered: isHovered,
        'status-morphing': isMorphing,
      }
    ]"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Speech bubble for status summary or scratching affection -->
    <Transition name="bubble">
      <div
        class="speech-bubble"
        :class="[status, { 'scratch-bubble': isScratching || isBlissful }]"
        v-if="((showBubble && displayBubbleLabel && !mini) || isScratching || isBlissful)"
        @click.stop="registerClick"
        @mousedown.stop
      >
        <span v-if="isScratching || isBlissful" class="bubble-alert-badge heart-bounce">💖</span>
        <span v-else-if="status === 'waiting'" class="bubble-alert-badge">⏳</span>
        <span v-else-if="status === 'working'" class="bubble-alert-badge">⚡</span>
        <span v-else-if="status === 'thinking'" class="bubble-alert-badge">💡</span>
        <span v-else-if="status === 'completed'" class="bubble-alert-badge">🎉</span>
        <span v-else-if="status === 'error'" class="bubble-alert-badge">⚠️</span>
        <span class="bubble-text">{{ (isScratching || isBlissful) ? scratchQuip : displayBubbleLabel }}</span>
      </div>
    </Transition>

    <!-- Pixel Art Companion Character (SVG canvas) with motion wrapper for smooth blending -->
    <div
      class="pet-sprite"
      :class="[
        status,
        {
          scratching: isScratching,
          blissful: isBlissful,
          booped: isBooped,
          'status-morphing': isMorphing,
        }
      ]"
    >
      <!-- Affection particles when scratched or petted -->
      <Transition name="particle-fade">
        <div v-if="isScratching || isBlissful" class="scratch-particles">
          <span class="heart-particle h1">💖</span>
          <span class="heart-particle h2">💕</span>
          <span class="heart-particle h3">✨</span>
          <span class="heart-particle h4">🐾</span>
        </div>
      </Transition>

      <!-- Particle effects for celebration, thinking, error, working, waiting -->
      <Transition name="particle-fade">
        <div v-if="status === 'completed'" class="celebration-particles">
          <span class="particle p1">✨</span>
          <span class="particle p2">⭐</span>
          <span class="particle p3">🎉</span>
          <span class="particle p4">🌟</span>
          <span class="particle p5">🎊</span>
        </div>
      </Transition>

      <!-- Working digital sparks & code particles -->
      <Transition name="particle-fade">
        <div v-if="status === 'working'" class="working-particles">
          <span class="particle code-p1">{ }</span>
          <span class="particle code-p2">&lt;/&gt;</span>
          <span class="particle code-p3">⚡</span>
          <span class="particle code-p4">✨</span>
        </div>
      </Transition>

      <!-- Thinking floating curiosity particles & cyber orbit halo -->
      <Transition name="particle-fade">
        <div v-if="status === 'thinking'" class="thinking-particles-container">
          <div class="thinking-gear">
            <span class="gear-icon">💡</span>
            <span class="thought-aura"></span>
          </div>
          <span class="particle think-p1">💭</span>
          <span class="particle think-p2">✦</span>
          <span class="particle think-p3">?</span>
        </div>
      </Transition>

      <!-- Error badge & panic sweat / hazard sparks -->
      <Transition name="particle-fade">
        <div v-if="status === 'error'" class="error-particles-container">
          <div class="error-badge">
            <span class="exclamation">!</span>
            <span class="error-ping"></span>
          </div>
          <span class="particle err-p1">💧</span>
          <span class="particle err-p2">⚠️</span>
          <span class="particle err-p3">⚡</span>
        </div>
      </Transition>

      <!-- Action Required / Waiting Approval Alert Badge & Floating Particles -->
      <Transition name="particle-fade">
        <div v-if="status === 'waiting'" class="waiting-particles-container">
          <div class="waiting-alert-badge" title="Waiting for your approval — click twice to focus agent">
            <span class="alert-icon">⏳</span>
            <span class="alert-radar"></span>
            <span class="alert-radar radar-2"></span>
          </div>
          <span class="particle w1">⏳</span>
          <span class="particle w2">⚡</span>
          <span class="particle w3">🔔</span>
        </div>
      </Transition>

      <!-- Character Body: "Codi" the Cyber Slime Cat -->
      <svg
        viewBox="0 0 64 64"
        class="character-svg"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#00cec9" flood-opacity="0.6"/>
          </filter>
        </defs>

        <!-- Dropshadow (reacts dynamically to jumping/floating states) -->
        <ellipse
          cx="32"
          cy="56"
          rx="20"
          ry="5"
          fill="rgba(0, 0, 0, 0.3)"
          class="shadow-ellipse"
          :class="status"
        />


        <!-- Thinking Cyber Orbit Ring (orbits behind & around head) -->
        <g v-if="status === 'thinking'" class="cyber-orbit-ring">
          <ellipse cx="32" cy="18" rx="22" ry="7" fill="none" stroke="#74b9ff" stroke-width="1.2" stroke-dasharray="4 2" opacity="0.8" />
          <circle cx="12" cy="18" r="2.2" fill="#0984e3" class="orbit-electron" />
        </g>

        <!-- Base Slime Body with morphing bounce -->
        <path
          d="M 20 20 H 44 V 24 H 48 V 48 H 44 V 52 H 20 V 48 H 16 V 24 H 20 Z"
          :fill="primaryColor"
          class="character-torso"
          :class="status"
        />

        <!-- Cat Ears (animated per state) -->
        <g class="character-ears" :class="[status, { 'ear-wiggle': isScratching }]">
          <path d="M 16 12 H 24 V 20 H 16 Z" :fill="primaryColor" class="ear-left" />
          <path d="M 40 12 H 48 V 20 H 40 Z" :fill="primaryColor" class="ear-right" />
          <path d="M 18 14 H 22 V 18 H 18 Z" fill="#ff7675" />
          <path d="M 42 14 H 46 V 18 H 42 Z" fill="#ff7675" />
        </g>

        <!-- Highlights (Gloss) -->
        <rect x="22" y="24" width="4" height="4" fill="rgba(255, 255, 255, 0.45)" />
        <rect x="26" y="22" width="6" height="2" fill="rgba(255, 255, 255, 0.45)" />

        <!-- Eyes & Face according to state -->
        <!-- SCRATCHING / PETTING / BLISSFUL REACTION -->
        <g v-if="isScratching || isBlissful" class="scratch-face">
          <path d="M 22 31 Q 26 27 30 31" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 34 31 Q 38 27 42 31" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 28 38 Q 30 40.5 32 38 Q 34 40.5 36 38" stroke="#1e272e" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <rect x="18" y="34" width="4" height="3" fill="#ff7675" rx="1.5" class="blush-glow" />
          <rect x="42" y="34" width="4" height="3" fill="#ff7675" rx="1.5" class="blush-glow" />
        </g>

        <!-- WORKING (Focused developer eyes, intense focus glint) -->
        <g v-else-if="status === 'working'" class="working-face">
          <!-- Determined brow slant -->
          <line x1="22" y1="27" x2="29" y2="29" stroke="#1e272e" stroke-width="1.5" stroke-linecap="round" />
          <line x1="42" y1="27" x2="35" y2="29" stroke="#1e272e" stroke-width="1.5" stroke-linecap="round" />
          <!-- Pupil look-around reacting slightly to hover -->
          <g :style="{ transform: `translate(${eyeLookX * 0.7}px, ${eyeLookY * 0.7}px)` }" class="working-eyes-focus">
            <rect x="24" y="30" width="4" height="6" fill="#1e272e" />
            <rect x="36" y="30" width="4" height="6" fill="#1e272e" />
            <!-- Glowing cyber screen reflection glint in eyes -->
            <rect x="25" y="31" width="2" height="2" fill="#00cec9" class="glint-pulse" />
            <rect x="37" y="31" width="2" height="2" fill="#00cec9" class="glint-pulse" />
          </g>
          <!-- Confident dev grin :3 -->
          <path d="M 29 38 Q 32 40.5 35 38" stroke="#1e272e" stroke-width="1.8" fill="none" stroke-linecap="round" />
        </g>

        <!-- IDLE (Calm, gentle look) -->
        <g v-else-if="status === 'idle'">
          <g :style="{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)` }" class="idle-eyes">
            <rect x="24" y="30" width="4" height="6" fill="#1e272e" />
            <rect x="36" y="30" width="4" height="6" fill="#1e272e" />
            <!-- Eye glint -->
            <rect x="24" y="30" width="2" height="2" fill="#ffffff" />
            <rect x="36" y="30" width="2" height="2" fill="#ffffff" />
          </g>
          <!-- Cute mouth -->
          <path d="M 30 38 H 34 V 40 H 30 Z" fill="#1e272e" />
        </g>

        <!-- THINKING (Curious pondering eyes scanning up & around) -->
        <g v-else-if="status === 'thinking'" class="thinking-face">
          <!-- Thoughtful raised brow -->
          <line x1="22" y1="26" x2="28" y2="25" stroke="#1e272e" stroke-width="1.5" stroke-linecap="round" />
          <line x1="36" y1="26" x2="42" y2="27" stroke="#1e272e" stroke-width="1.5" stroke-linecap="round" />
          <g class="thinking-eyes-scanning">
            <rect x="24" y="28" width="4" height="5" fill="#1e272e" />
            <rect x="36" y="28" width="4" height="5" fill="#1e272e" />
            <rect x="25" y="28" width="2" height="2" fill="#55efc4" />
            <rect x="37" y="28" width="2" height="2" fill="#55efc4" />
          </g>
          <!-- Pondering "o" mouth -->
          <rect x="31" y="38" width="2" height="2" fill="#1e272e" rx="1" />
        </g>

        <!-- WAITING (Alert expectant expression, eager scanning) -->
        <g v-else-if="status === 'waiting'" class="waiting-face-group">
          <!-- Eyebrows raised in anticipation -->
          <rect x="22" y="24" width="7" height="2" fill="#1e272e" class="waiting-brow-left" />
          <rect x="35" y="24" width="7" height="2" fill="#1e272e" class="waiting-brow-right" />
          <!-- Eye sclera (large attentive eyes) -->
          <rect x="22" y="27" width="8" height="9" fill="#ffffff" rx="1" />
          <rect x="34" y="27" width="8" height="9" fill="#ffffff" rx="1" />
          <!-- Pupils that scan/glance back and forth waiting for click -->
          <g class="waiting-pupils-animated">
            <rect x="24" y="29" width="4" height="6" fill="#1e272e" />
            <rect x="36" y="29" width="4" height="6" fill="#1e272e" />
            <!-- Eye gleam highlights -->
            <rect x="24" y="29" width="2" height="2" fill="#ff7675" />
            <rect x="36" y="29" width="2" height="2" fill="#ff7675" />
          </g>
          <!-- Open "o" mouth waiting for input -->
          <path d="M 30 38 H 34 V 41 H 30 Z" fill="#1e272e" />
          <!-- Subtle blush from excitement -->
          <rect x="18" y="34" width="3" height="2" fill="#ff7675" opacity="0.8" />
          <rect x="43" y="34" width="3" height="2" fill="#ff7675" opacity="0.8" />
        </g>

        <!-- COMPLETED (Ecstatic closed arc eyes ^_^ with star sparkles) -->
        <g v-else-if="status === 'completed'" class="completed-face">
          <path d="M 23 32 L 26 29 L 29 32" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 35 32 L 38 29 L 41 32" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <!-- Joyful open cat smile -->
          <path d="M 29 37 Q 32 41 35 37" stroke="#1e272e" stroke-width="2" fill="#ff7675" />
          <!-- Golden rosy blush -->
          <rect x="19" y="34" width="4" height="2" fill="#e17055" rx="1" class="blush-glow" />
          <rect x="41" y="34" width="4" height="2" fill="#e17055" rx="1" class="blush-glow" />
        </g>

        <!-- ERROR (Dizzy / startled X _ X eyes with wavy distress mouth) -->
        <g v-else-if="status === 'error'" class="error-face">
          <path d="M 24 30 L 28 34 M 28 30 L 24 34" stroke="#d63031" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 36 30 L 40 34 M 40 30 L 36 34" stroke="#d63031" stroke-width="2.5" stroke-linecap="round" />
          <!-- Wavy mouth -->
          <path d="M 27 39 Q 30 37 32 39 Q 34 41 37 39" stroke="#d63031" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>

        <!-- UNKNOWN -->
        <g v-else>
          <rect x="24" y="32" width="5" height="3" fill="#636e72" />
          <circle cx="38" cy="33" r="2.5" fill="#636e72" />
          <rect x="30" y="38" width="4" height="2" fill="#636e72" />
        </g>

        <!-- Cheering paws when COMPLETED -->
        <g v-if="status === 'completed'" class="cheering-paws">
          <ellipse cx="17" cy="22" rx="3" ry="3" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" class="cheer-paw left" />
          <ellipse cx="47" cy="22" rx="3" ry="3" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" class="cheer-paw right" />
        </g>

        <!-- Impatient waving paw when WAITING -->
        <g v-else-if="status === 'waiting'" class="waiting-paws">
          <ellipse cx="14" cy="36" rx="3" ry="3" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" class="wave-paw" />
          <ellipse cx="46" cy="46" rx="3" ry="2.5" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" />
        </g>

        <!-- Flailing distress paws when ERROR -->
        <g v-else-if="status === 'error'" class="error-paws">
          <ellipse cx="16" cy="26" rx="3" ry="2.5" :fill="primaryColor" stroke="#d63031" stroke-width="0.8" class="flail-paw left" />
          <ellipse cx="48" cy="26" rx="3" ry="2.5" :fill="primaryColor" stroke="#d63031" stroke-width="0.8" class="flail-paw right" />
        </g>

        <!-- Keyboard / Coding Laptop when working with streaming code & typing flurry -->
        <g v-else-if="status === 'working'" class="mini-laptop">
          <rect x="18" y="44" width="28" height="12" fill="#2d3436" rx="2" />
          <rect x="20" y="45" width="24" height="8" fill="#00cec9" class="laptop-screen" />
          <!-- Animated syntax code streams -->
          <line x1="22" y1="47" x2="33" y2="47" stroke="#003b46" stroke-width="1.2" class="agent-code-line c1" />
          <line x1="22" y1="49" x2="40" y2="49" stroke="#003b46" stroke-width="1.2" class="agent-code-line c2" />
          <line x1="22" y1="51" x2="35" y2="51" stroke="#003b46" stroke-width="1.2" class="agent-code-line c3" />
          <!-- Keystroke sparks -->
          <circle cx="25" cy="51" r="1" fill="#fff" class="key-spark k1" />
          <circle cx="39" cy="51" r="1" fill="#fff" class="key-spark k2" />
          <!-- Animated typing paws -->
          <ellipse cx="23" cy="52" rx="2.8" ry="2.2" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" class="agent-paw left" />
          <ellipse cx="41" cy="52" rx="2.8" ry="2.2" :fill="primaryColor" stroke="#1e272e" stroke-width="0.8" class="agent-paw right" />
        </g>
      </svg>
    </div>

    <!-- Active Agent Mini Badge (Codi) -->
    <div class="agent-tag" v-if="agentName && !mini" @mousedown.stop>
      <span class="dot" :class="status"></span>
      <span class="name">{{ agentName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { AgentStatus } from '../types/status';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { notificationService } from '../services/notifications';

const props = withDefaults(
  defineProps<{
    status: AgentStatus;
    label?: string;
    agentName?: string | null;
    showBubble?: boolean;
    mini?: boolean;
    soundEnabled?: boolean;
  }>(),
  {
    status: 'idle',
    label: '',
    agentName: 'Codi',
    showBubble: true,
    mini: false,
    soundEnabled: true,
  }
);

const containerRef = ref<HTMLElement | null>(null);

// Interactive mouse reaction states
const isScratching = ref(false);
const isBlissful = ref(false);
const isBooped = ref(false);
const isHovered = ref(false);
const isMorphing = ref(false);
const eyeLookX = ref(0);
const eyeLookY = ref(0);

// Smooth state transition watcher: seamlessly interpolates transforms across status changes
let morphTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => props.status,
  (newStatus, oldStatus) => {
    if (newStatus !== oldStatus) {
      isMorphing.value = true;
      if (morphTimer) clearTimeout(morphTimer);
      morphTimer = setTimeout(() => {
        isMorphing.value = false;
        morphTimer = null;
      }, 340);
    }
  }
);

const SCRATCH_QUIPS = [
  'Purrrrr~ ❤️',
  '*happy purrs* ✨',
  'Nyaaa~ that tickles! 🥰',
  '*melts into puddle* 💕',
  'Hehe scratchies! 🐾',
  'Purrrfect! ❤️',
  'Best dev ever! ✨',
];
const scratchQuip = ref(SCRATCH_QUIPS[0]);

// Rapid mousemove tracking for scratch detection
interface MouseSample {
  x: number;
  y: number;
  time: number;
}
const mouseHistory: MouseSample[] = [];
let scratchTimeout: ReturnType<typeof setTimeout> | null = null;
let blissTimeout: ReturnType<typeof setTimeout> | null = null;

function pickScratchQuip() {
  const idx = Math.floor(Math.random() * SCRATCH_QUIPS.length);
  scratchQuip.value = SCRATCH_QUIPS[idx];
}

const displayBubbleLabel = computed(() => {
  if (!props.label) return '';
  return props.label
    .replace(/\s*·\s*DevPet\b/gi, '')
    .replace(/\s*·\s*[^\s·]+$/g, '')
    .trim();
});

const primaryColor = computed(() => {
  switch (props.status) {
    case 'working':
      return '#00b894';
    case 'thinking':
      return '#0984e3';
    case 'completed':
      return '#fdcb6e';
    case 'error':
      return '#d63031';
    case 'waiting':
      return '#e17055';
    case 'unknown':
      return '#b2bec3';
    case 'idle':
    default:
      return '#6c5ce7';
  }
});

const emit = defineEmits<{
  (e: 'open-dashboard'): void;
  (e: 'focus-app'): void;
  (e: 'peek-bubble'): void;
  (e: 'scratch'): void;
}>();

let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let lastClickTime = 0;
let startX = 0;
let startY = 0;

function startScratching() {
  if (!isScratching.value) {
    pickScratchQuip();
    isScratching.value = true;
    if (blissTimeout) {
      clearTimeout(blissTimeout);
      blissTimeout = null;
    }
    isBlissful.value = false;
  }
  emit('scratch');
  if (props.soundEnabled) {
    notificationService.playPurr();
  }

  if (scratchTimeout) clearTimeout(scratchTimeout);
  scratchTimeout = setTimeout(() => {
    stopScratching();
  }, 280);
}

function stopScratching() {
  if (scratchTimeout) {
    clearTimeout(scratchTimeout);
    scratchTimeout = null;
  }
  if (isScratching.value) {
    isScratching.value = false;
    isBlissful.value = true;
    if (blissTimeout) clearTimeout(blissTimeout);
    blissTimeout = setTimeout(() => {
      isBlissful.value = false;
      blissTimeout = null;
    }, 1200);
  }
}

function onMouseEnter() {
  isHovered.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
  eyeLookX.value = 0;
  eyeLookY.value = 0;
  mouseHistory.length = 0;
  if (isScratching.value) {
    stopScratching();
  }
}

function onMouseMove(e: MouseEvent) {
  isHovered.value = true;
  const now = Date.now();

  // 1. Interactive eye tracking
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    eyeLookX.value = Math.max(-2, Math.min(2, ((e.clientX - centerX) / (rect.width / 2)) * 2));
    eyeLookY.value = Math.max(-1.5, Math.min(1.5, ((e.clientY - centerY) / (rect.height / 2)) * 1.5));
  }

  // 2. Rapid movement tracking (scratch reaction)
  mouseHistory.push({ x: e.clientX, y: e.clientY, time: now });
  while (mouseHistory.length > 0 && now - mouseHistory[0].time > 360) {
    mouseHistory.shift();
  }

  if (mouseHistory.length >= 4) {
    let totalDist = 0;
    for (let i = 1; i < mouseHistory.length; i++) {
      totalDist += Math.hypot(
        mouseHistory[i].x - mouseHistory[i - 1].x,
        mouseHistory[i].y - mouseHistory[i - 1].y
      );
    }

    const timeSpan = now - mouseHistory[0].time;
    if (totalDist >= 110 && timeSpan >= 60) {
      startScratching();
    }
  }
}

function registerClick() {
  const now = Date.now();
  if (now - lastClickTime < 60) return;
  lastClickTime = now;

  clickCount++;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }

  if (clickCount >= 3) {
    clickCount = 0;
    emit('open-dashboard');
    return;
  }

  clickTimer = setTimeout(() => {
    if (clickCount === 2) {
      emit('focus-app');
    } else if (clickCount === 1) {
      emit('peek-bubble');
    }
    clickCount = 0;
  }, 320);
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 0) {
    if ((e.target as HTMLElement).closest('.agent-tag, .speech-bubble, button, .icon-btn, input, label')) {
      return;
    }
    startX = e.screenX;
    startY = e.screenY;
    if (isScratching.value) {
      stopScratching();
    }
    try {
      const appWin = getCurrentWebviewWindow();
      appWin.startDragging();
    } catch {
      // preview mode
    }
  }
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 0) {
    const dx = Math.abs(e.screenX - startX);
    const dy = Math.abs(e.screenY - startY);
    if (dx <= 6 && dy <= 6) {
      isBooped.value = true;
      setTimeout(() => {
        isBooped.value = false;
      }, 260);
      registerClick();
    }
  }
}
</script>

<style scoped>
.pet-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: grab;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 30px 4px 10px;
  box-sizing: border-box;
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.pet-container:active {
  cursor: grabbing;
}

/* Speech bubble */
.speech-bubble {
  position: absolute;
  top: 6px;
  background: rgba(20, 24, 33, 0.92);
  color: #f1f2f6;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 500;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.speech-bubble.waiting {
  border-color: rgba(243, 156, 18, 0.85);
  box-shadow: 0 0 14px rgba(243, 156, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4);
  background: rgba(28, 22, 16, 0.95);
  animation: bubblePulse 1.2s ease-in-out infinite alternate;
}
@keyframes bubblePulse {
  0% { box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); }
  100% { box-shadow: 0 0 18px rgba(243, 156, 18, 0.65); }
}

.bubble-alert-badge {
  font-size: 11px;
  animation: badgeWiggle 0.6s infinite alternate;
}
@keyframes badgeWiggle {
  0% { transform: scale(0.9) rotate(-6deg); }
  100% { transform: scale(1.15) rotate(6deg); }
}

/* Scratch affection bubble */
.speech-bubble.scratch-bubble {
  border-color: rgba(253, 121, 168, 0.9);
  box-shadow: 0 0 16px rgba(253, 121, 168, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4);
  background: rgba(36, 18, 30, 0.96);
  animation: scratchBubblePulse 0.8s ease-in-out infinite alternate;
}
@keyframes scratchBubblePulse {
  0% { box-shadow: 0 0 8px rgba(253, 121, 168, 0.35); }
  100% { box-shadow: 0 0 20px rgba(253, 121, 168, 0.75); }
}
.heart-bounce {
  font-size: 12px;
  animation: heartBounce 0.35s ease-in-out infinite alternate;
}
@keyframes heartBounce {
  0% { transform: scale(0.85); }
  100% { transform: scale(1.28); }
}

/* Smooth fade & pop transition for speech bubble */
.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}

/* Smooth Particle Transitions */
.particle-fade-enter-active,
.particle-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.particle-fade-enter-from,
.particle-fade-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* Sprite Container with buttery smooth state transition morphing */
.pet-sprite {
  position: relative;
  width: 78px;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 85%;
  transition: transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), filter 0.35s ease;
}

.mini .pet-sprite {
  width: 58px;
  height: 58px;
}

.status-morphing {
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s ease !important;
}

.character-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
  overflow: visible;
}

/* ========================================================
   ANIMATIONS PER STATE (A lot of animations unless in idle)
   ======================================================== */

/* 1. IDLE: Calm, gentle breathing (minimal animation as instructed) */
.pet-sprite.idle {
  animation: idleBob 3.2s ease-in-out infinite;
}
@keyframes idleBob {
  0%, 100% {
    transform: translateY(0) scale(1, 1);
  }
  50% {
    transform: translateY(-3px) scale(0.98, 1.02);
  }
}
.character-torso.idle {
  animation: torsoBreathe 3.2s ease-in-out infinite;
  transform-origin: 32px 50px;
}
@keyframes torsoBreathe {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.02, 0.98); }
}

/* 2. WORKING: Energetic coding frenzy! Keystrokes, screen glows, typing bounce */
.pet-sprite.working {
  animation: workingFrenzy 0.36s ease-in-out infinite alternate;
}
@keyframes workingFrenzy {
  0% {
    transform: translateY(0) rotate(-1.5deg) scale(1, 0.98);
  }
  50% {
    transform: translateY(-2.5px) rotate(0deg) scale(0.98, 1.02);
  }
  100% {
    transform: translateY(-3.5px) rotate(1.5deg) scale(1.02, 0.98);
  }
}

.character-ears.working {
  animation: workingEarTwitch 0.22s ease-in-out infinite alternate;
  transform-origin: 32px 18px;
}
@keyframes workingEarTwitch {
  0% { transform: rotate(-2deg); }
  100% { transform: rotate(2deg); }
}

.laptop-screen {
  animation: screenBlink 0.4s infinite alternate;
}
@keyframes screenBlink {
  0% { fill: #00cec9; filter: drop-shadow(0 0 2px #00cec9); }
  100% { fill: #81ecec; filter: drop-shadow(0 0 6px #55efc4); }
}

.agent-paw.left {
  animation: agentPawLeft 0.14s ease-in-out infinite alternate;
}
.agent-paw.right {
  animation: agentPawRight 0.14s ease-in-out infinite alternate;
  animation-delay: 0.07s;
}
@keyframes agentPawLeft {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}
@keyframes agentPawRight {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

.agent-code-line.c1 {
  animation: codeStream 0.4s infinite alternate;
}
.agent-code-line.c2 {
  animation: codeStream 0.6s 0.1s infinite alternate;
}
.agent-code-line.c3 {
  animation: codeStream 0.5s 0.2s infinite alternate;
}
@keyframes codeStream {
  0% { stroke-dasharray: 2 1; opacity: 0.5; }
  100% { stroke-dasharray: 6 2; opacity: 1; stroke: #00cec9; }
}

.key-spark.k1 {
  animation: keySparkle 0.28s infinite alternate;
}
.key-spark.k2 {
  animation: keySparkle 0.32s 0.14s infinite alternate;
}
@keyframes keySparkle {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1.8); }
}

.working-particles {
  position: absolute;
  inset: -14px;
  pointer-events: none;
}
.code-p1 {
  top: -8px;
  left: 4px;
  font-size: 11px;
  font-family: monospace;
  font-weight: bold;
  color: #00cec9;
  animation: codeFloat 1.2s ease-in-out infinite alternate;
}
.code-p2 {
  top: -12px;
  right: 6px;
  font-size: 11px;
  font-family: monospace;
  font-weight: bold;
  color: #55efc4;
  animation: codeFloat 1.4s 0.3s ease-in-out infinite alternate;
}
.code-p3 {
  bottom: 12px;
  left: -6px;
  font-size: 12px;
  animation: codeFloat 1s 0.2s ease-in-out infinite alternate;
}
.code-p4 {
  bottom: 8px;
  right: -6px;
  font-size: 11px;
  animation: codeFloat 1.1s 0.4s ease-in-out infinite alternate;
}
@keyframes codeFloat {
  0% { transform: translateY(0) scale(0.85); opacity: 0.6; }
  100% { transform: translateY(-7px) scale(1.15); opacity: 1; }
}

/* 3. THINKING: Hypnotic levitation sway, orbiting thought aura & lightbulb */
.pet-sprite.thinking {
  animation: thinkingLevitate 2.2s ease-in-out infinite;
}
@keyframes thinkingLevitate {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6px) rotate(-3.5deg);
  }
  50% {
    transform: translateY(-2px) rotate(0deg);
  }
  75% {
    transform: translateY(-6px) rotate(3.5deg);
  }
}

.cyber-orbit-ring {
  animation: orbitSpin 3s linear infinite;
  transform-origin: 32px 18px;
}
@keyframes orbitSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.thinking-particles-container {
  position: absolute;
  inset: -12px;
  pointer-events: none;
}
.thinking-gear {
  position: absolute;
  top: -12px;
  right: 10px;
  font-size: 18px;
  animation: pulseLight 1.4s ease-in-out infinite;
}
@keyframes pulseLight {
  0%, 100% { transform: scale(0.9); opacity: 0.75; }
  50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 6px #fdcb6e); }
}
.thought-aura {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px dashed rgba(116, 185, 255, 0.6);
  animation: thoughtRing 1.8s infinite linear;
}
@keyframes thoughtRing {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
  100% { transform: scale(1.6) rotate(360deg); opacity: 0; }
}

.think-p1 {
  top: -6px;
  left: 8px;
  font-size: 14px;
  animation: thinkDrift 1.8s ease-in-out infinite alternate;
}
.think-p2 {
  top: 14px;
  right: -4px;
  font-size: 13px;
  color: #74b9ff;
  animation: thinkDrift 1.5s 0.3s ease-in-out infinite alternate;
}
.think-p3 {
  bottom: 12px;
  left: 0px;
  font-size: 14px;
  font-weight: bold;
  color: #a29bfe;
  animation: thinkDrift 1.6s 0.6s ease-in-out infinite alternate;
}
@keyframes thinkDrift {
  0% { transform: translateY(0) scale(0.8); opacity: 0.5; }
  100% { transform: translateY(-8px) scale(1.15); opacity: 1; }
}

.thinking-eyes-scanning {
  animation: eyesScan 2s ease-in-out infinite alternate;
}
@keyframes eyesScan {
  0%, 20% { transform: translate(-1.5px, -1px); }
  40%, 60% { transform: translate(0, -1.8px); }
  80%, 100% { transform: translate(1.5px, -1px); }
}

/* 4. WAITING: High-energy alert bounce, impatient waving paw & radar ping */
.pet-sprite.waiting {
  animation: waitingAlertBounce 0.44s ease-in-out infinite alternate;
}
@keyframes waitingAlertBounce {
  0% {
    transform: translateY(0) scale(1, 0.94);
  }
  100% {
    transform: translateY(-9px) scale(0.96, 1.06);
  }
}

.wave-paw {
  animation: pawWave 0.28s ease-in-out infinite alternate;
  transform-origin: 18px 38px;
}
@keyframes pawWave {
  0% { transform: rotate(-18deg) translateY(0); }
  100% { transform: rotate(18deg) translateY(-4px); }
}

.waiting-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.waiting-alert-badge {
  position: absolute;
  top: -10px;
  right: 8px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  box-shadow: 0 0 16px rgba(243, 156, 18, 0.95);
  animation: pulseWaitingBell 0.5s infinite alternate;
  z-index: 15;
  cursor: pointer;
}
.alert-radar {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #f39c12;
  animation: radarPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
.alert-radar.radar-2 {
  animation-delay: 0.6s;
}
@keyframes radarPing {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes pulseWaitingBell {
  0% {
    transform: scale(0.9) rotate(-10deg);
    box-shadow: 0 0 8px rgba(243, 156, 18, 0.6);
  }
  100% {
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 0 20px rgba(243, 156, 18, 1);
  }
}
.w1 {
  top: -12px;
  left: 6px;
  font-size: 13px;
  animation: floatWaiting 1s ease-in-out infinite alternate;
}
.w2 {
  bottom: 8px;
  right: -4px;
  font-size: 13px;
  animation: floatWaiting 1.2s 0.2s ease-in-out infinite alternate;
}
.w3 {
  top: 14px;
  left: -8px;
  font-size: 13px;
  animation: floatWaiting 1.1s 0.4s ease-in-out infinite alternate;
}
@keyframes floatWaiting {
  0% { transform: translateY(0) scale(0.85); opacity: 0.7; }
  100% { transform: translateY(-6px) scale(1.15); opacity: 1; }
}

.waiting-pupils-animated {
  animation: waitingEyeScan 1.4s ease-in-out infinite alternate;
}
@keyframes waitingEyeScan {
  0%, 15% { transform: translateX(-1.8px); }
  50% { transform: translateX(0); }
  85%, 100% { transform: translateX(1.8px); }
}

.waiting-brow-left {
  animation: browTwitch 0.8s infinite alternate;
}
.waiting-brow-right {
  animation: browTwitch 0.8s 0.2s infinite alternate;
}
@keyframes browTwitch {
  0% { transform: translateY(0); }
  100% { transform: translateY(-1.5px); }
}

/* 5. COMPLETED: Victory flip jumps, cheering paws, star & confetti shower */
.pet-sprite.completed {
  animation: victoryCelebration 0.75s ease-in-out infinite alternate;
}
@keyframes victoryCelebration {
  0% {
    transform: translateY(0) scale(1.05, 0.92) rotate(-2deg);
  }
  50% {
    transform: translateY(-8px) scale(0.96, 1.04) rotate(0deg);
  }
  100% {
    transform: translateY(-15px) scale(1, 1.05) rotate(2deg);
  }
}

.cheer-paw.left {
  animation: cheerPawWave 0.28s ease-in-out infinite alternate;
  transform-origin: 20px 26px;
}
.cheer-paw.right {
  animation: cheerPawWave 0.28s 0.14s ease-in-out infinite alternate;
  transform-origin: 44px 26px;
}
@keyframes cheerPawWave {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-4px) scale(1.1); }
}

.celebration-particles {
  position: absolute;
  inset: -16px;
  pointer-events: none;
}
.p1 { top: -14px; left: 8px; animation: burstStar 0.8s infinite alternate; }
.p2 { top: -16px; right: 10px; animation: burstStar 0.9s 0.15s infinite alternate; }
.p3 { bottom: 12px; right: -4px; animation: burstStar 0.75s 0.3s infinite alternate; }
.p4 { bottom: 14px; left: -6px; animation: burstStar 0.85s 0.45s infinite alternate; }
.p5 { top: 10px; right: -8px; animation: burstStar 1s 0.2s infinite alternate; }
@keyframes burstStar {
  0% { transform: scale(0.7) translateY(0) rotate(0deg); opacity: 0.6; }
  100% { transform: scale(1.25) translateY(-8px) rotate(25deg); opacity: 1; }
}

/* 6. ERROR: Distress panic wobble, warning strobe, sweat drop & flailing paws */
.pet-sprite.error {
  animation: errorPanicShake 0.28s ease-in-out infinite;
}
@keyframes errorPanicShake {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(-5px) translateY(-1px) rotate(-3deg); }
  75% { transform: translateX(5px) translateY(1px) rotate(3deg); }
}

.flail-paw.left {
  animation: flailPaw 0.16s ease-in-out infinite alternate;
}
.flail-paw.right {
  animation: flailPaw 0.16s 0.08s ease-in-out infinite alternate;
}
@keyframes flailPaw {
  0% { transform: translateY(0) rotate(-10deg); }
  100% { transform: translateY(-5px) rotate(10deg); }
}

.error-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.error-badge {
  position: absolute;
  top: -6px;
  right: 12px;
  background: #d63031;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  box-shadow: 0 0 12px rgba(214, 48, 49, 0.9);
  animation: errorBadgeFlash 0.3s infinite alternate;
}
@keyframes errorBadgeFlash {
  0% { transform: scale(0.9); }
  100% { transform: scale(1.18); box-shadow: 0 0 18px rgba(214, 48, 49, 1); }
}
.err-p1 {
  top: -8px;
  left: 10px;
  font-size: 14px;
  animation: sweatDrop 0.6s infinite;
}
@keyframes sweatDrop {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(8px); opacity: 0; }
}
.err-p2 {
  bottom: 8px;
  right: -2px;
  font-size: 12px;
  animation: errWarnFlash 0.4s infinite alternate;
}
.err-p3 {
  top: 14px;
  left: -6px;
  font-size: 13px;
  animation: errWarnFlash 0.35s 0.1s infinite alternate;
}
@keyframes errWarnFlash {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

/* 8. SHADOW DYNAMICS (Shadow scales and fades naturally with pet altitude) */
.shadow-ellipse {
  transform-origin: 32px 56px;
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.shadow-ellipse.completed {
  animation: shadowVictory 0.75s ease-in-out infinite alternate;
}
@keyframes shadowVictory {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(0.65); opacity: 0.15; }
}
.shadow-ellipse.waiting {
  animation: shadowWaiting 0.44s ease-in-out infinite alternate;
}
@keyframes shadowWaiting {
  0% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(0.75); opacity: 0.2; }
}
.shadow-ellipse.thinking {
  animation: shadowThinking 2.2s ease-in-out infinite;
}
@keyframes shadowThinking {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  25%, 75% { transform: scale(0.8); opacity: 0.22; }
  50% { transform: scale(0.95); opacity: 0.28; }
}

/* 9. SCRATCHING / PURRING: Ecstatic vibration & jiggle */
.pet-sprite.scratching {
  animation: purrVibrate 0.14s ease-in-out infinite alternate !important;
}
@keyframes purrVibrate {
  0% { transform: translateY(0) scale(1.05, 0.95) rotate(-2.5deg); }
  50% { transform: translateY(-2px) scale(0.96, 1.04) rotate(0deg); }
  100% { transform: translateY(1px) scale(1.06, 0.94) rotate(2.5deg); }
}

/* 10. BLISSFUL: Lingering satisfied sweet sway */
.pet-sprite.blissful {
  animation: blissfulSway 1.2s ease-in-out infinite alternate !important;
}
@keyframes blissfulSway {
  0% { transform: translateY(0) scale(1.02, 0.98) rotate(-1deg); }
  100% { transform: translateY(-4px) scale(0.98, 1.02) rotate(1deg); }
}

/* 11. BOOP: Playful squish on click */
.pet-sprite.booped {
  animation: boopSquish 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
@keyframes boopSquish {
  0% { transform: scale(1, 1); }
  40% { transform: scale(1.15, 0.82) translateY(4px); }
  100% { transform: scale(1, 1); }
}

/* Ear wiggle during scratch */
.ear-wiggle {
  animation: earTwitch 0.16s ease-in-out infinite alternate;
  transform-origin: 32px 16px;
}
@keyframes earTwitch {
  0% { transform: rotate(-4deg) scaleY(0.92); }
  100% { transform: rotate(4deg) scaleY(1.06); }
}

/* Blush glow pulsing */
.blush-glow {
  animation: blushPulse 0.5s ease-in-out infinite alternate;
}
@keyframes blushPulse {
  0% { fill: #ff7675; opacity: 0.8; }
  100% { fill: #fd79a8; opacity: 1; filter: drop-shadow(0 0 2px #fd79a8); }
}

/* Affection scratch particles */
.scratch-particles {
  position: absolute;
  inset: -12px;
  pointer-events: none;
  z-index: 25;
}
.heart-particle {
  position: absolute;
  font-size: 15px;
  animation: floatHeart 0.95s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
}
.h1 { top: -6px; left: 8px; animation-delay: 0s; }
.h2 { top: -14px; right: 10px; animation-delay: 0.22s; }
.h3 { top: 14px; right: -4px; animation-delay: 0.45s; }
.h4 { top: 10px; left: -2px; animation-delay: 0.68s; }
@keyframes floatHeart {
  0% { transform: translateY(6px) scale(0.4); opacity: 0; }
  30% { opacity: 1; transform: translateY(-4px) scale(1.2); }
  100% { transform: translateY(-22px) scale(0.85); opacity: 0; }
}

/* UNKNOWN */
.pet-sprite.unknown {
  filter: grayscale(40%);
  opacity: 0.85;
}

/* Agent tag badge */
.agent-tag {
  margin-top: 16px;
  background: rgba(15, 18, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #dfe6e9;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}
.dot.idle { background: #6c5ce7; }
.dot.thinking { background: #0984e3; box-shadow: 0 0 6px #0984e3; }
.dot.working { background: #00b894; box-shadow: 0 0 6px #00b894; }
.dot.completed { background: #fdcb6e; box-shadow: 0 0 6px #fdcb6e; }
.dot.error { background: #d63031; box-shadow: 0 0 6px #d63031; }
.dot.waiting { background: #e17055; box-shadow: 0 0 6px #e17055; }
.dot.unknown { background: #b2bec3; }
</style>
