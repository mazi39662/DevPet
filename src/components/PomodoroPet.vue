<template>
  <div
    ref="containerRef"
    class="pomo-container"
    :class="[
      state.phase,
      state.status,
      {
        mini,
        deepWork: isDeepWork,
        interactive,
        scratching: isScratching,
        blissful: isBlissful,
        booped: isBooped,
        'user-typing': isUserTyping,
        'phase-morphing': isMorphing,
      }
    ]"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- Speech bubble -->
    <Transition name="bubble">
      <div
        v-if="interactive && !mini && (bubbleVisible || isScratching || isBlissful)"
        class="speech-bubble"
        :class="[state.phase, { 'scratch-bubble': isScratching || isBlissful }]"
        @mousedown.stop
        @mouseup.stop
        @click.stop="togglePlay"
      >
        <span v-if="isScratching || isBlissful" class="bubble-icon heart-bounce">💖</span>
        <span v-else-if="isDeepWork" class="bubble-icon">🔥</span>
        <span v-else-if="state.phase === 'break'" class="bubble-icon">☕</span>
        <span v-else-if="state.status === 'paused'" class="bubble-icon">⏸️</span>
        <span class="bubble-text">{{ isScratching || isBlissful ? 'Purrrr~ 💖' : bubbleText }}</span>
      </div>
    </Transition>

    <!-- Momo sprite with smooth transitions -->
    <div
      class="pet-sprite"
      :class="[
        state.phase,
        state.status,
        {
          deepWork: isDeepWork,
          booped: isBooped,
          scratching: isScratching,
          blissful: isBlissful,
          'user-typing': isUserTyping,
          'phase-morphing': isMorphing,
        }
      ]"
    >
      <!-- Affection particles when scratched or petted -->
      <Transition name="particle-fade">
        <div v-if="isScratching || isBlissful" class="scratch-particles">
          <span class="heart-particle mh1">💖</span>
          <span class="heart-particle mh2">💕</span>
          <span class="heart-particle mh3">✨</span>
          <span class="heart-particle mh4">🍅</span>
        </div>
      </Transition>

      <!-- Deep work focus particles (fiery aura, coffee, energy sparks) -->
      <Transition name="particle-fade">
        <div v-if="isDeepWork" class="focus-particles-container">
          <span class="particle fp1">🔥</span>
          <span class="particle fp2">⚡</span>
          <span class="particle fp3">☕</span>
          <span class="particle fp4">✨</span>
        </div>
      </Transition>

      <!-- Break time particles (musical notes, relaxation sparkles, tea steam) -->
      <Transition name="particle-fade">
        <div v-if="state.phase === 'break' && state.status === 'running'" class="break-particles-container">
          <span class="particle bp1">🎵</span>
          <span class="particle bp2">🎶</span>
          <span class="particle bp3">🌸</span>
          <span class="particle bp4">✨</span>
        </div>
      </Transition>

      <!-- Paused time gentle snooze / wait particle -->
      <Transition name="particle-fade">
        <div v-if="state.status === 'paused'" class="paused-particles-container">
          <span class="particle pp1">⏳</span>
          <span class="particle pp2">💤</span>
        </div>
      </Transition>

      <svg
        viewBox="0 0 72 72"
        class="character-svg"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
      >
        <!-- Dynamic Dropshadow -->
        <ellipse
          cx="36"
          cy="64"
          rx="22"
          ry="5"
          fill="rgba(0, 0, 0, 0.3)"
          class="shadow-ellipse"
          :class="[state.phase, state.status]"
        />

        <!-- Momo cute cat tail behind body -->
        <path
          d="M 52 48 Q 62 44 59 36"
          :stroke="bodyColor"
          stroke-width="3.5"
          fill="none"
          stroke-linecap="round"
          class="momo-tail"
          :class="[state.phase, state.status]"
        />

        <!-- Deep Work Focus Aura glow behind Momo -->
        <ellipse
          v-if="isDeepWork"
          cx="36"
          cy="42"
          rx="24"
          ry="20"
          fill="rgba(235, 77, 75, 0.18)"
          class="focus-aura-halo"
        />

        <!-- Break Time Soft Calm Aura behind Momo -->
        <ellipse
          v-if="state.phase === 'break' && state.status === 'running'"
          cx="36"
          cy="42"
          rx="24"
          ry="20"
          fill="rgba(0, 206, 201, 0.16)"
          class="break-aura-halo"
        />

        <!-- Body -->
        <path
          d="M 22 24 H 50 V 28 H 54 V 54 H 50 V 58 H 22 V 54 H 18 V 28 H 22 Z"
          :fill="bodyColor"
          class="momo-torso"
          :class="[state.phase, state.status]"
        />

        <!-- Ears -->
        <g class="momo-ears" :class="[state.phase, state.status, { 'ear-wiggle': isScratching }]">
          <path d="M 18 16 H 26 V 24 H 18 Z" :fill="bodyColor" />
          <path d="M 46 16 H 54 V 24 H 46 Z" :fill="bodyColor" />
          <path d="M 20 18 H 24 V 22 H 20 Z" fill="#fab1a0" />
          <path d="M 48 18 H 52 V 22 H 48 Z" fill="#fab1a0" />
        </g>

        <!-- Tomato stem & leaves (animated rhythmically) -->
        <g class="tomato-stem-group" :class="[state.phase, state.status]">
          <rect x="34" y="14" width="4" height="10" fill="#2ed573" />
          <path d="M 28 17 H 34 V 21 H 28 Z" fill="#2ed573" class="leaf-left" />
          <path d="M 38 17 H 44 V 21 H 38 Z" fill="#2ed573" class="leaf-right" />
        </g>

        <!-- Gloss -->
        <rect x="24" y="28" width="4" height="4" fill="rgba(255, 255, 255, 0.45)" />
        <rect x="28" y="26" width="8" height="2" fill="rgba(255, 255, 255, 0.45)" />

        <!-- Headphones during deep work with pulsing RGB beat glow -->
        <g v-if="isDeepWork" class="focus-headphones">
          <path d="M 15 32 C 15 15, 57 15, 57 32" stroke="#2d3436" stroke-width="3" fill="none" />
          <rect x="13" y="27" width="6" height="12" fill="#2d3436" rx="2" />
          <rect x="53" y="27" width="6" height="12" fill="#2d3436" rx="2" />
          <!-- Animated beat ring on ear cups -->
          <circle cx="16" cy="33" r="2" fill="#00cec9" class="headphone-beat" />
          <circle cx="56" cy="33" r="2" fill="#00cec9" class="headphone-beat" />
        </g>

        <!-- Faces -->
        <!-- SCRATCHING / BLISSFUL -->
        <g v-if="isScratching || isBlissful">
          <path d="M 25 35 Q 29 31 33 35" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 39 35 Q 43 31 47 35" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 31 42 Q 33 44 36 42 Q 39 44 41 42" stroke="#1e272e" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <rect x="21" y="38" width="5" height="3" fill="#ff7675" rx="1.5" class="blush-glow" />
          <rect x="46" y="38" width="5" height="3" fill="#ff7675" rx="1.5" class="blush-glow" />
        </g>

        <!-- DEEP WORK (Focused determination brow slant, intense glint) -->
        <g v-else-if="isDeepWork" class="focus-face">
          <path d="M 24 31 L 33 34" stroke="#1e272e" stroke-width="2" stroke-linecap="round" />
          <path d="M 48 31 L 39 34" stroke="#1e272e" stroke-width="2" stroke-linecap="round" />
          <rect x="26" y="35" width="6" height="5" fill="#1e272e" rx="1" />
          <rect x="40" y="35" width="6" height="5" fill="#1e272e" rx="1" />
          <rect x="27" y="37" width="2" height="2" fill="#00d2d3" class="screen-reflect" />
          <rect x="41" y="37" width="2" height="2" fill="#00d2d3" class="screen-reflect" />
          <!-- Determined dev mouth -->
          <line x1="33" y1="44" x2="39" y2="44" stroke="#1e272e" stroke-width="1.5" stroke-linecap="round" />
        </g>

        <!-- BREAK (Happy content smile, rosy cheeks) -->
        <g v-else-if="state.phase === 'break'" class="break-face">
          <path d="M 25 35 Q 29 32 33 35" stroke="#1e272e" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M 39 35 Q 43 32 47 35" stroke="#1e272e" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M 33 42 Q 36 45 39 42" stroke="#1e272e" stroke-width="2" fill="none" stroke-linecap="round" />
          <rect x="22" y="38" width="4" height="3" fill="#ff9ff3" rx="1.5" class="blush-glow" />
          <rect x="46" y="38" width="4" height="3" fill="#ff9ff3" rx="1.5" class="blush-glow" />
        </g>

        <!-- IDLE / PAUSED (Eye look tracking) -->
        <g v-else class="normal-face">
          <g :style="{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)` }">
            <rect x="26" y="34" width="5" height="7" fill="#1e272e" rx="1" />
            <rect x="41" y="34" width="5" height="7" fill="#1e272e" rx="1" />
            <rect x="26" y="34" width="2" height="2" fill="#ffffff" />
            <rect x="41" y="34" width="2" height="2" fill="#ffffff" />
          </g>
          <rect x="34" y="44" width="4" height="2" fill="#1e272e" />
        </g>

        <!-- Deep work OR user typing in idle: laptop + animated typing paws -->
        <g v-if="isDeepWork || (state.status !== 'running' && isUserTyping)">
          <path d="M 18 54 H 54 L 56 62 H 16 Z" fill="#2d3436" />
          <rect x="22" y="55" width="28" height="4" fill="#1e272e" rx="0.5" />
          <path d="M 20 44 H 52 V 54 H 20 Z" fill="#1e272e" />
          <rect x="22" y="45" width="28" height="8" :fill="isDeepWork ? '#00cec9' : '#ff7675'" class="glow-screen" :class="{ 'idle-screen': !isDeepWork }" />
          <line x1="24" y1="47" x2="38" y2="47" :stroke="isDeepWork ? '#003b46' : '#2d3436'" stroke-width="1.2" class="code-line l1" />
          <line x1="24" y1="49" x2="46" y2="49" :stroke="isDeepWork ? '#003b46' : '#2d3436'" stroke-width="1.2" class="code-line l2" />
          <line x1="24" y1="51" x2="34" y2="51" :stroke="isDeepWork ? '#003b46' : '#2d3436'" stroke-width="1.2" class="code-line l3" />
          <!-- Fast alternating typing paws -->
          <g class="typing-paw left-paw">
            <rect x="23" y="52" width="6" height="5" :fill="bodyColor" rx="2" stroke="#1e272e" stroke-width="0.8" />
          </g>
          <g class="typing-paw right-paw">
            <rect x="43" y="52" width="6" height="5" :fill="bodyColor" rx="2" stroke="#1e272e" stroke-width="0.8" />
          </g>
        </g>

        <!-- Break time: Momo holding a steaming warm cup of tea/coffee -->
        <g v-else-if="state.phase === 'break' && state.status === 'running'" class="break-coffee-cup">
          <!-- Mug Body -->
          <rect x="31" y="50" width="10" height="9" fill="#dfe6e9" rx="1.5" stroke="#1e272e" stroke-width="0.8" />
          <!-- Mug handle -->
          <path d="M 41 52 H 44 V 56 H 41" stroke="#1e272e" stroke-width="1" fill="none" />
          <!-- Coffee / tea liquid -->
          <rect x="32" y="51" width="8" height="2" fill="#d63031" />
          <!-- Rising steam swirls -->
          <path d="M 33 48 Q 35 45 33 42" stroke="rgba(255, 255, 255, 0.75)" stroke-width="1" fill="none" class="coffee-steam s1" />
          <path d="M 38 48 Q 40 45 38 42" stroke="rgba(255, 255, 255, 0.75)" stroke-width="1" fill="none" class="coffee-steam s2" />
          <!-- Cozy paws holding the mug -->
          <ellipse cx="30" cy="54" rx="3" ry="2.5" :fill="bodyColor" stroke="#1e272e" stroke-width="0.8" />
          <ellipse cx="42" cy="54" rx="3" ry="2.5" :fill="bodyColor" stroke="#1e272e" stroke-width="0.8" />
        </g>

        <!-- Normal resting paws -->
        <g v-else>
          <ellipse cx="28" cy="53" rx="4" ry="3" :fill="bodyColor" stroke="#1e272e" stroke-width="0.8" />
          <ellipse cx="44" cy="53" rx="4" ry="3" :fill="bodyColor" stroke="#1e272e" stroke-width="0.8" />
        </g>
      </svg>
    </div>

    <!-- Name + timer tag -->
    <div
      class="name-tag"
      :class="state.phase"
      :title="state.status === 'running' ? 'Pause' : 'Start'"
      @mousedown.stop
      @mouseup.stop
      @click.stop="togglePlay"
    >
      <span class="dot" :class="{ pulsing: state.status === 'running' }"></span>
      <span class="time">{{ formatTime(state.timeRemaining) }}</span>
      <span class="play">{{ state.status === 'running' ? '⏸' : '▶' }}</span>
    </div>

    <!-- Hover controls -->
    <div v-if="interactive" class="hover-controls" @mousedown.stop @mouseup.stop>
      <button
        class="icon-btn"
        :title="state.status === 'running' ? 'Pause' : 'Start focus'"
        @mousedown.stop
        @mouseup.stop
        @click.stop="togglePlay"
      >
        {{ state.status === 'running' ? '⏸' : '▶' }}
      </button>
      <button
        class="icon-btn"
        title="Skip to next phase"
        @mousedown.stop
        @mouseup.stop
        @click.stop="skipPhase"
      >
        ⏭
      </button>
      <button
        class="icon-btn"
        title="Open settings"
        @mousedown.stop
        @mouseup.stop
        @click.stop="openDashboard"
      >
        ⚙️
      </button>
      <button
        class="icon-btn"
        title="Hide Momo"
        @mousedown.stop
        @mouseup.stop
        @click.stop="hidePet"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { PomodoroState } from '../types/pomodoro';
import { DEFAULT_POMODORO_STATE } from '../types/pomodoro';
import { EVENTS, type PomodoroAction } from '../types/events';
import { emitEvent, native, onEvent } from '../services/native';
import { notificationService } from '../services/notifications';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const props = withDefaults(
  defineProps<{
    mini?: boolean;
    soundEnabled?: boolean;
    interactive?: boolean;
  }>(),
  { mini: false, soundEnabled: true, interactive: true }
);

const state = ref<PomodoroState>({ ...DEFAULT_POMODORO_STATE });
const containerRef = ref<HTMLElement | null>(null);

const isScratching = ref(false);
const isBlissful = ref(false);
const isBooped = ref(false);
const isMorphing = ref(false);
const isUserTyping = ref(false);
const eyeLookX = ref(0);
const eyeLookY = ref(0);

let userTypingTimer: ReturnType<typeof setTimeout> | null = null;
function handleUserTypingPulse() {
  isUserTyping.value = true;
  if (userTypingTimer) {
    clearTimeout(userTypingTimer);
  }
  userTypingTimer = setTimeout(() => {
    isUserTyping.value = false;
    userTypingTimer = null;
  }, 1200);
}

// Smooth phase/status transition morphing
let morphTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => [state.value.phase, state.value.status],
  () => {
    isMorphing.value = true;
    if (morphTimer) clearTimeout(morphTimer);
    morphTimer = setTimeout(() => {
      isMorphing.value = false;
      morphTimer = null;
    }, 340);
    if (props.interactive) showBubble();
  }
);

const bubbleVisible = ref(false);
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
function showBubble(ms = 3000) {
  bubbleVisible.value = true;
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => (bubbleVisible.value = false), ms);
}

const isDeepWork = computed(() => state.value.phase === 'focus' && state.value.status === 'running');

const bodyColor = computed(() => {
  if (state.value.phase === 'break') return '#00cec9';
  return isDeepWork.value ? '#eb4d4b' : '#ff7675';
});

const bubbleText = computed(() => {
  const s = state.value;
  if (s.phase === 'focus') {
    if (s.status === 'running') return `Deep work · ${Math.ceil(s.timeRemaining / 60)}m left`;
    if (s.status === 'paused') return 'Focus paused';
    return 'Ready to focus!';
  }
  if (s.status === 'paused') return 'Break paused';
  return 'Break time ☕';
});

const emit = defineEmits<{
  (e: 'open-dashboard'): void;
  (e: 'hide-pet'): void;
}>();

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function sendAction(action: PomodoroAction) {
  emitEvent(EVENTS.pomodoroAction, action).catch(() => {});
}

function togglePlay() {
  const nextStatus = state.value.status === 'running' ? 'paused' : 'running';
  state.value.status = nextStatus;
  sendAction({ type: nextStatus === 'running' ? 'start' : 'pause' });
}

function skipPhase() {
  sendAction({ type: 'skip' });
}

async function openDashboard() {
  emit('open-dashboard');
  try {
    await native.showDashboard();
  } catch {}
}

async function hidePet() {
  emit('hide-pet');
  try {
    await native.setPomodoroCompanionVisible(false);
  } catch {}
}

// ---- interactions (drag, double click) -----------------------
let scratchTimeout: ReturnType<typeof setTimeout> | null = null;
let blissTimeout: ReturnType<typeof setTimeout> | null = null;

function startScratching() {
  isScratching.value = true;
  isBlissful.value = false;
  if (props.soundEnabled) notificationService.playPurr();
  if (scratchTimeout) clearTimeout(scratchTimeout);
  scratchTimeout = setTimeout(stopScratching, 280);
}

function stopScratching() {
  if (!isScratching.value) return;
  isScratching.value = false;
  isBlissful.value = true;
  if (blissTimeout) clearTimeout(blissTimeout);
  blissTimeout = setTimeout(() => (isBlissful.value = false), 1200);
}

function onMouseLeave() {
  eyeLookX.value = 0;
  eyeLookY.value = 0;
  stopScratching();
}

function onMouseMove(e: MouseEvent) {
  if (!props.interactive) return;

  // Interactive eye tracking: Momo's eyes follow the mouse cursor smoothly
  if (containerRef.value) {
    const r = containerRef.value.getBoundingClientRect();
    eyeLookX.value = Math.max(-2, Math.min(2, ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 2));
    eyeLookY.value = Math.max(-1.5, Math.min(1.5, ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 1.5));
  }
}

let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let startX = 0;
let startY = 0;

function registerClick() {
  clickCount++;
  if (clickTimer) clearTimeout(clickTimer);
  if (clickCount >= 3) {
    clickCount = 0;
    openDashboard();
    return;
  }
  clickTimer = setTimeout(() => {
    if (clickCount === 2) togglePlay();
    else if (clickCount === 1) showBubble();
    clickCount = 0;
  }, 300);
}

function onMouseDown(e: MouseEvent) {
  if (!props.interactive || e.button !== 0) return;
  const target = e.target as Element | null;
  if (target?.closest('button, .name-tag, .speech-bubble, .hover-controls, .icon-btn, input, label')) {
    return;
  }
  startX = e.screenX;
  startY = e.screenY;
  stopScratching();
  try {
    getCurrentWebviewWindow().startDragging();
  } catch {}
}

function onMouseUp(e: MouseEvent) {
  if (!props.interactive || e.button !== 0) return;
  const target = e.target as Element | null;
  if (target?.closest('button, .name-tag, .speech-bubble, .hover-controls, .icon-btn, input, label')) {
    return;
  }
  if (Math.abs(e.screenX - startX) <= 6 && Math.abs(e.screenY - startY) <= 6) {
    isBooped.value = true;
    setTimeout(() => (isBooped.value = false), 260);
    registerClick();
  }
}

// Window local keyboard handler (when window has focus)
function onWindowKeyDown() {
  handleUserTypingPulse();
}

let unlistenTyping: (() => void) | null = null;

onMounted(async () => {
  window.addEventListener('keydown', onWindowKeyDown);
  try {
    unlistenTyping = await onEvent(EVENTS.userTyping, () => {
      handleUserTypingPulse();
    });
  } catch {}

  try {
    await onEvent(EVENTS.pomodoroState, (s: PomodoroState) => {
      state.value = s;
    });
    sendAction({ type: 'sync' });
  } catch {}
  if (props.interactive) showBubble();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeyDown);
  if (unlistenTyping) {
    unlistenTyping();
    unlistenTyping = null;
  }
  if (userTypingTimer) {
    clearTimeout(userTypingTimer);
    userTypingTimer = null;
  }
});

defineExpose({
  startScratching,
});
</script>

<style scoped>
.pomo-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 4px 10px;
  box-sizing: border-box;
  user-select: none;
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
.pomo-container.interactive {
  cursor: grab;
}
.pomo-container.interactive:active {
  cursor: grabbing;
}
.pomo-container:not(.interactive),
.pomo-container.mini {
  padding: 4px;
}

/* Speech bubble */
.speech-bubble {
  position: absolute;
  top: 6px;
  background: rgba(22, 18, 26, 0.94);
  color: #f1f2f6;
  border: 1px solid rgba(255, 118, 117, 0.5);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 500;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.speech-bubble.break {
  border-color: rgba(0, 206, 201, 0.6);
  background: rgba(14, 24, 28, 0.94);
}
.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}

.particle-fade-enter-active,
.particle-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.particle-fade-enter-from,
.particle-fade-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* Momo Sprite Container with smooth state transitions */
.pet-sprite {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform-origin: 50% 85%;
  transition: transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), filter 0.35s ease;
}
.mini .pet-sprite {
  width: 58px;
  height: 58px;
}
.pet-sprite.phase-morphing {
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

/* 1. IDLE / STOPPED / NOT RUNNING: Calm gentle breathing (or fun companion typing bop when user types) */
.pet-sprite:not(.deepWork):not(.break):not(.user-typing) {
  animation: momoBreathe 3.2s ease-in-out infinite;
}
.pet-sprite:not(.deepWork):not(.break).user-typing {
  animation: momoIdleTypingBop 0.36s ease-in-out infinite alternate;
}
@keyframes momoIdleTypingBop {
  0% {
    transform: translateY(0) rotate(-1.2deg) scale(1, 0.98);
  }
  50% {
    transform: translateY(-2px) rotate(0deg) scale(0.98, 1.02);
  }
  100% {
    transform: translateY(-3.5px) rotate(1.2deg) scale(1.02, 0.98);
  }
}
.pet-sprite:not(.deepWork):not(.break).user-typing .tomato-stem-group {
  animation: momoIdleStemWiggle 0.36s ease-in-out infinite alternate;
  transform-origin: 36px 24px;
}
@keyframes momoIdleStemWiggle {
  0% { transform: rotate(-4deg); }
  100% { transform: rotate(4deg); }
}
.glow-screen.idle-screen {
  animation: momoIdleScreenBlink 0.5s infinite alternate;
}
@keyframes momoIdleScreenBlink {
  0% { fill: #ff7675; filter: drop-shadow(0 0 2px #ff7675); }
  100% { fill: #fab1a0; filter: drop-shadow(0 0 6px #ff7675); }
}
@keyframes momoBreathe {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(-3px) scale(0.98, 1.02); }
}

/* 2. DEEP WORK (FOCUS RUNNING): Intense Lo-fi Head Bop, Typing Flurry, Stem Sway */
.pet-sprite.deepWork {
  animation: focusLofiBop 0.42s ease-in-out infinite alternate;
}
@keyframes focusLofiBop {
  0% {
    transform: translateY(0) rotate(-1.5deg) scale(1, 0.97);
  }
  50% {
    transform: translateY(-2px) rotate(0deg) scale(0.98, 1.02);
  }
  100% {
    transform: translateY(-4px) rotate(1.5deg) scale(1.02, 0.98);
  }
}

.tomato-stem-group.focus {
  animation: stemBeatSway 0.42s ease-in-out infinite alternate;
  transform-origin: 36px 24px;
}
@keyframes stemBeatSway {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.focus-headphones {
  animation: headphoneBop 0.42s ease-in-out infinite alternate;
  transform-origin: 36px 32px;
}
@keyframes headphoneBop {
  0% { transform: translateY(0); }
  100% { transform: translateY(-1.5px); }
}

.headphone-beat {
  animation: beatGlow 0.42s infinite alternate;
}
@keyframes beatGlow {
  0% { fill: #00cec9; r: 1.8; opacity: 0.7; }
  100% { fill: #ff7675; r: 2.6; opacity: 1; filter: drop-shadow(0 0 3px #ff7675); }
}

.focus-aura-halo {
  animation: auraPulse 1.2s ease-in-out infinite alternate;
}
@keyframes auraPulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  100% { transform: scale(1.1); opacity: 0.9; }
}

.typing-paw.left-paw {
  animation: momoPawType 0.15s ease-in-out infinite alternate;
}
.typing-paw.right-paw {
  animation: momoPawType 0.15s ease-in-out infinite alternate;
  animation-delay: 0.075s;
}
@keyframes momoPawType {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3.5px); }
}

.glow-screen {
  animation: momoScreenGlow 1s ease-in-out infinite alternate;
}
@keyframes momoScreenGlow {
  0% { fill: #00cec9; filter: drop-shadow(0 0 2px #00cec9); }
  100% { fill: #55efc4; filter: drop-shadow(0 0 6px #55efc4); }
}

.code-line {
  animation: momoCodeType 0.45s infinite alternate;
}
.code-line.l2 { animation-duration: 0.65s; animation-delay: 0.1s; }
.code-line.l3 { animation-duration: 0.55s; animation-delay: 0.2s; }
@keyframes momoCodeType {
  0% { stroke-dasharray: 2 1; opacity: 0.5; }
  100% { stroke-dasharray: 6 2; opacity: 1; stroke: #00cec9; }
}

.focus-particles-container {
  position: absolute;
  inset: -14px;
  pointer-events: none;
}
.fp1 {
  top: -10px;
  left: 6px;
  font-size: 13px;
  animation: focusParticleFloat 1.1s ease-in-out infinite alternate;
}
.fp2 {
  top: -12px;
  right: 8px;
  font-size: 12px;
  animation: focusParticleFloat 1.3s 0.2s ease-in-out infinite alternate;
}
.fp3 {
  bottom: 10px;
  left: -6px;
  font-size: 12px;
  animation: focusParticleFloat 1s 0.3s ease-in-out infinite alternate;
}
.fp4 {
  bottom: 8px;
  right: -6px;
  font-size: 11px;
  animation: focusParticleFloat 1.2s 0.4s ease-in-out infinite alternate;
}
@keyframes focusParticleFloat {
  0% { transform: translateY(0) scale(0.8); opacity: 0.6; }
  100% { transform: translateY(-7px) scale(1.2); opacity: 1; }
}

/* 3. BREAK TIME RUNNING: Peaceful swaying float, tea steam, music notes */
.pet-sprite.break.running {
  animation: breakFloatSway 2.4s ease-in-out infinite;
}
@keyframes breakFloatSway {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(-3deg);
  }
  50% {
    transform: translateY(-2px) rotate(0deg);
  }
  75% {
    transform: translateY(-5px) rotate(3deg);
  }
}

.break-aura-halo {
  animation: breakAuraPulse 2s ease-in-out infinite alternate;
}
@keyframes breakAuraPulse {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0.8; }
}

.coffee-steam.s1 {
  animation: steamRise 1s infinite;
}
.coffee-steam.s2 {
  animation: steamRise 1.2s 0.3s infinite;
}
@keyframes steamRise {
  0% { transform: translateY(0) scaleX(0.8); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-6px) scaleX(1.3); opacity: 0; }
}

.break-particles-container {
  position: absolute;
  inset: -14px;
  pointer-events: none;
}
.bp1 {
  top: -8px;
  left: 6px;
  font-size: 13px;
  animation: breakNoteDrift 1.6s ease-in-out infinite alternate;
}
.bp2 {
  top: -12px;
  right: 8px;
  font-size: 14px;
  animation: breakNoteDrift 1.8s 0.3s ease-in-out infinite alternate;
}
.bp3 {
  bottom: 12px;
  left: -4px;
  font-size: 12px;
  animation: breakNoteDrift 1.5s 0.5s ease-in-out infinite alternate;
}
.bp4 {
  top: 14px;
  right: -6px;
  font-size: 11px;
  animation: breakNoteDrift 1.7s 0.2s ease-in-out infinite alternate;
}
@keyframes breakNoteDrift {
  0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0.5; }
  100% { transform: translateY(-8px) rotate(15deg) scale(1.15); opacity: 1; }
}

/* 4. PAUSED STATE: Expectant slow hover with floating hourglass */
.pet-sprite.paused {
  animation: pausedGentleHover 2.6s ease-in-out infinite alternate;
}
@keyframes pausedGentleHover {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3.5px); }
}

.paused-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.pp1 {
  top: -10px;
  right: 6px;
  font-size: 13px;
  animation: pausedFloat 1.2s ease-in-out infinite alternate;
}
.pp2 {
  top: -6px;
  left: 8px;
  font-size: 13px;
  animation: pausedFloat 1.5s 0.3s ease-in-out infinite alternate;
}
@keyframes pausedFloat {
  0% { transform: translateY(0) scale(0.85); opacity: 0.6; }
  100% { transform: translateY(-5px) scale(1.1); opacity: 0.95; }
}

/* 5. TAIL ANIMATION FOR MOMO */
.momo-tail {
  transform-origin: 52px 48px;
  transition: transform 0.35s ease;
}
.momo-tail.focus.running {
  animation: momoTailFastWag 0.28s ease-in-out infinite alternate;
}
@keyframes momoTailFastWag {
  0% { transform: rotate(-14deg); }
  100% { transform: rotate(14deg); }
}
.momo-tail.break {
  animation: momoTailLazyWag 1.8s ease-in-out infinite alternate;
}
@keyframes momoTailLazyWag {
  0% { transform: rotate(-8deg); }
  100% { transform: rotate(8deg); }
}

/* 6. SHADOW DYNAMICS */
.shadow-ellipse {
  transform-origin: 36px 64px;
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.shadow-ellipse.break.running {
  animation: momoShadowBreak 2.4s ease-in-out infinite;
}
@keyframes momoShadowBreak {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  25%, 75% { transform: scale(0.82); opacity: 0.2; }
  50% { transform: scale(0.95); opacity: 0.28; }
}

/* 7. SCRATCHING / PURRING / BOOPING */
.pet-sprite.scratching {
  animation: momoPurrVibrate 0.14s ease-in-out infinite alternate !important;
}
@keyframes momoPurrVibrate {
  0% { transform: translateY(0) scale(1.05, 0.95) rotate(-2deg); }
  50% { transform: translateY(-2px) scale(0.96, 1.04) rotate(0deg); }
  100% { transform: translateY(1px) scale(1.06, 0.94) rotate(2deg); }
}

.pet-sprite.blissful {
  animation: momoBlissfulSway 1.2s ease-in-out infinite alternate !important;
}
@keyframes momoBlissfulSway {
  0% { transform: translateY(0) scale(1.02, 0.98) rotate(-1deg); }
  100% { transform: translateY(-4px) scale(0.98, 1.02) rotate(1deg); }
}

.pet-sprite.booped {
  animation: momoBoopSquish 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
@keyframes momoBoopSquish {
  0% { transform: scale(1, 1); }
  40% { transform: scale(1.15, 0.82) translateY(4px); }
  100% { transform: scale(1, 1); }
}

.ear-wiggle {
  animation: momoEarTwitch 0.16s ease-in-out infinite alternate;
  transform-origin: 36px 20px;
}
@keyframes momoEarTwitch {
  0% { transform: rotate(-4deg); }
  100% { transform: rotate(4deg); }
}

.blush-glow {
  animation: momoBlushPulse 0.5s ease-in-out infinite alternate;
}
@keyframes momoBlushPulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; filter: drop-shadow(0 0 2px #fd79a8); }
}

/* Scratch particles */
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
.mh1 { top: -6px; left: 8px; animation-delay: 0s; }
.mh2 { top: -14px; right: 10px; animation-delay: 0.22s; }
.mh3 { top: 14px; right: -4px; animation-delay: 0.45s; }
.mh4 { top: 10px; left: -2px; animation-delay: 0.68s; }
@keyframes floatHeart {
  0% { transform: translateY(6px) scale(0.4); opacity: 0; }
  30% { opacity: 1; transform: translateY(-4px) scale(1.2); }
  100% { transform: translateY(-22px) scale(0.85); opacity: 0; }
}

/* Name + timer tag */
.name-tag {
  background: rgba(15, 18, 26, 0.88);
  border: 1px solid rgba(255, 118, 117, 0.5);
  border-radius: 12px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #dfe6e9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s ease, border-color 0.3s ease;
}
.mini .name-tag {
  margin-top: 4px;
}
.name-tag.break {
  border-color: rgba(0, 206, 201, 0.6);
}
.name-tag .name {
  font-weight: 600;
}
.name-tag .time {
  font-family: Consolas, monospace;
  font-weight: 600;
}
.name-tag .play {
  font-size: 8px;
  opacity: 0.75;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff7675;
  transition: background-color 0.3s ease;
}
.name-tag.break .dot {
  background: #00cec9;
}
.dot.pulsing {
  animation: dotPulse 1s ease-in-out infinite alternate;
}
@keyframes dotPulse {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 1; }
}

.hover-controls {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 20;
}
.pomo-container:hover .hover-controls {
  opacity: 1;
}
.icon-btn {
  background: rgba(30, 39, 46, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d2dae2;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}
.icon-btn:hover {
  background: rgba(45, 52, 54, 1);
  color: #fff;
}
</style>
