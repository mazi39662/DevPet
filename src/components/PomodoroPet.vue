<template>
  <div
    ref="containerRef"
    class="pomo-container"
    :class="[state.phase, state.status, { mini, deepWork: isDeepWork, interactive }]"
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
        :class="state.phase"
        @mousedown.stop
        @mouseup.stop
        @click.stop="togglePlay"
      >
        <span class="bubble-text">{{ isScratching || isBlissful ? 'Purrrr~ 💖' : bubbleText }}</span>
      </div>
    </Transition>

    <!-- Momo sprite -->
    <div class="pet-sprite" :class="[state.phase, state.status, { deepWork: isDeepWork, booped: isBooped }]">
      <svg viewBox="0 0 72 72" class="character-svg" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <ellipse cx="36" cy="64" rx="22" ry="5" fill="rgba(0, 0, 0, 0.3)" />

        <!-- Body -->
        <path d="M 22 24 H 50 V 28 H 54 V 54 H 50 V 58 H 22 V 54 H 18 V 28 H 22 Z" :fill="bodyColor" />
        <!-- Ears -->
        <path d="M 18 16 H 26 V 24 H 18 Z" :fill="bodyColor" />
        <path d="M 46 16 H 54 V 24 H 46 Z" :fill="bodyColor" />
        <path d="M 20 18 H 24 V 22 H 20 Z" fill="#fab1a0" />
        <path d="M 48 18 H 52 V 22 H 48 Z" fill="#fab1a0" />
        <!-- Tomato stem -->
        <rect x="34" y="14" width="4" height="10" fill="#2ed573" />
        <path d="M 28 17 H 34 V 21 H 28 Z" fill="#2ed573" />
        <path d="M 38 17 H 44 V 21 H 38 Z" fill="#2ed573" />
        <!-- Gloss -->
        <rect x="24" y="28" width="4" height="4" fill="rgba(255, 255, 255, 0.45)" />
        <rect x="28" y="26" width="8" height="2" fill="rgba(255, 255, 255, 0.45)" />

        <!-- Headphones during deep work -->
        <g v-if="isDeepWork">
          <path d="M 15 32 C 15 15, 57 15, 57 32" stroke="#2d3436" stroke-width="3" fill="none" />
          <rect x="13" y="27" width="6" height="12" fill="#2d3436" rx="2" />
          <rect x="53" y="27" width="6" height="12" fill="#2d3436" rx="2" />
        </g>

        <!-- Faces -->
        <g v-if="isScratching || isBlissful">
          <path d="M 25 35 Q 29 31 33 35" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 39 35 Q 43 31 47 35" stroke="#1e272e" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M 31 42 Q 33 44 36 42 Q 39 44 41 42" stroke="#1e272e" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <rect x="21" y="38" width="5" height="3" fill="#ff7675" rx="1.5" />
          <rect x="46" y="38" width="5" height="3" fill="#ff7675" rx="1.5" />
        </g>
        <g v-else-if="isDeepWork">
          <!-- Focused: brows down, eyes on the screen -->
          <path d="M 24 31 L 33 34" stroke="#1e272e" stroke-width="2" stroke-linecap="round" />
          <path d="M 48 31 L 39 34" stroke="#1e272e" stroke-width="2" stroke-linecap="round" />
          <rect x="26" y="35" width="6" height="5" fill="#1e272e" rx="1" />
          <rect x="40" y="35" width="6" height="5" fill="#1e272e" rx="1" />
          <rect x="27" y="37" width="2" height="2" fill="#00d2d3" />
          <rect x="41" y="37" width="2" height="2" fill="#00d2d3" />
        </g>
        <g v-else-if="state.phase === 'break'">
          <path d="M 25 35 Q 29 32 33 35" stroke="#1e272e" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M 39 35 Q 43 32 47 35" stroke="#1e272e" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M 33 42 Q 36 45 39 42" stroke="#1e272e" stroke-width="2" fill="none" stroke-linecap="round" />
          <rect x="22" y="38" width="4" height="3" fill="#ff9ff3" rx="1.5" />
          <rect x="46" y="38" width="4" height="3" fill="#ff9ff3" rx="1.5" />
        </g>
        <g v-else>
          <g :style="{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)` }">
            <rect x="26" y="34" width="5" height="7" fill="#1e272e" rx="1" />
            <rect x="41" y="34" width="5" height="7" fill="#1e272e" rx="1" />
            <rect x="26" y="34" width="2" height="2" fill="#ffffff" />
            <rect x="41" y="34" width="2" height="2" fill="#ffffff" />
          </g>
          <rect x="34" y="44" width="4" height="2" fill="#1e272e" />
        </g>

        <!-- Deep work: laptop + typing paws -->
        <g v-if="isDeepWork">
          <path d="M 18 54 H 54 L 56 62 H 16 Z" fill="#2d3436" />
          <rect x="22" y="55" width="28" height="4" fill="#1e272e" rx="0.5" />
          <path d="M 20 44 H 52 V 54 H 20 Z" fill="#1e272e" />
          <rect x="22" y="45" width="28" height="8" fill="#00cec9" class="glow-screen" />
          <line x1="24" y1="47" x2="38" y2="47" stroke="#003b46" stroke-width="1" class="code-line l1" />
          <line x1="24" y1="49" x2="46" y2="49" stroke="#003b46" stroke-width="1" class="code-line l2" />
          <line x1="24" y1="51" x2="34" y2="51" stroke="#003b46" stroke-width="1" class="code-line l3" />
          <g class="typing-paw left-paw">
            <rect x="23" y="52" width="6" height="5" :fill="bodyColor" rx="2" stroke="#1e272e" stroke-width="0.8" />
          </g>
          <g class="typing-paw right-paw">
            <rect x="43" y="52" width="6" height="5" :fill="bodyColor" rx="2" stroke="#1e272e" stroke-width="0.8" />
          </g>
        </g>
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
      <span class="name">Momo</span>
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
import { ref, computed, onMounted, watch } from 'vue';
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
    /** false = static preview in the dashboard (no drag, bubble or hover buttons) */
    interactive?: boolean;
  }>(),
  { mini: false, soundEnabled: true, interactive: true }
);

const state = ref<PomodoroState>({ ...DEFAULT_POMODORO_STATE });
const containerRef = ref<HTMLElement | null>(null);

const isScratching = ref(false);
const isBlissful = ref(false);
const isBooped = ref(false);
const eyeLookX = ref(0);
const eyeLookY = ref(0);

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

// ---- interactions (drag, petting, double click) -----------------------
interface MouseSample { x: number; y: number; time: number }
const mouseHistory: MouseSample[] = [];
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
  mouseHistory.length = 0;
  stopScratching();
}

function onMouseMove(e: MouseEvent) {
  if (!props.interactive) return;
  const now = Date.now();
  if (containerRef.value) {
    const r = containerRef.value.getBoundingClientRect();
    eyeLookX.value = Math.max(-2, Math.min(2, ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 2));
    eyeLookY.value = Math.max(-1.5, Math.min(1.5, ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 1.5));
  }
  mouseHistory.push({ x: e.clientX, y: e.clientY, time: now });
  while (mouseHistory.length && now - mouseHistory[0].time > 360) mouseHistory.shift();
  if (mouseHistory.length >= 4) {
    let dist = 0;
    for (let i = 1; i < mouseHistory.length; i++) {
      dist += Math.hypot(mouseHistory[i].x - mouseHistory[i - 1].x, mouseHistory[i].y - mouseHistory[i - 1].y);
    }
    if (dist >= 110 && now - mouseHistory[0].time >= 60) startScratching();
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

watch(
  () => [state.value.phase, state.value.status],
  () => {
    if (props.interactive) showBubble();
  }
);

onMounted(async () => {
  try {
    await onEvent(EVENTS.pomodoroState, (s: PomodoroState) => {
      state.value = s;
    });
    // Ask the dashboard for the current timer state (pet may open mid-session).
    sendAction({ type: 'sync' });
  } catch {}
  if (props.interactive) showBubble();
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
}
.speech-bubble.break {
  border-color: rgba(0, 206, 201, 0.6);
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

.pet-sprite {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.mini .pet-sprite {
  width: 58px;
  height: 58px;
}
.pet-sprite.booped {
  transform: scale(0.92);
}
.character-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
}

/* Idle / break: gentle breathing */
.pet-sprite:not(.deepWork) {
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Deep work: typing bob + paws + screen */
.pet-sprite.deepWork {
  animation: focusBob 0.32s ease-in-out infinite alternate;
}
@keyframes focusBob {
  0% { transform: translateY(0) rotate(-0.5deg); }
  100% { transform: translateY(-2px) rotate(0.5deg); }
}
.typing-paw.left-paw {
  animation: pawType 0.16s ease-in-out infinite alternate;
}
.typing-paw.right-paw {
  animation: pawType 0.16s ease-in-out infinite alternate;
  animation-delay: 0.08s;
}
@keyframes pawType {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}
.glow-screen {
  animation: screenGlow 1.2s ease-in-out infinite alternate;
}
@keyframes screenGlow {
  0% { fill: #00cec9; }
  100% { fill: #55efc4; }
}
.code-line {
  animation: codeType 0.5s infinite alternate;
}
.code-line.l2 { animation-duration: 0.7s; }
.code-line.l3 { animation-duration: 0.6s; }
@keyframes codeType {
  0% { stroke-dasharray: 2 1; opacity: 0.6; }
  100% { stroke-dasharray: 5 2; opacity: 1; }
}

/* Name + timer tag (spaced far away from the sprite) */
.name-tag {
  margin-top: 16px;
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
