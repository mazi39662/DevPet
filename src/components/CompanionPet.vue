<template>
  <div
    class="pet-container"
    :class="[status, { mini }]"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <!-- Speech bubble for status summary with smooth auto-hide transition -->
    <Transition name="bubble">
      <div class="speech-bubble" v-if="showBubble && label && !mini" @click.stop="registerClick">
        <span class="bubble-text">{{ label }}</span>
      </div>
    </Transition>

    <!-- Pixel Art Companion Character (SVG canvas) -->
    <div class="pet-sprite" :class="status">
      <!-- Particle effects for celebration, thinking, error -->
      <div v-if="status === 'completed'" class="celebration-particles">
        <span class="particle p1">✨</span>
        <span class="particle p2">⭐</span>
        <span class="particle p3">🎉</span>
      </div>

      <div v-if="status === 'thinking'" class="thinking-gear">
        <span class="gear-icon">💡</span>
      </div>

      <div v-if="status === 'error'" class="error-badge">
        <span class="exclamation">!</span>
      </div>

      <!-- Action Required / Waiting Approval Alert Badge -->
      <div v-if="status === 'waiting'" class="waiting-alert-badge">
        <span class="alert-icon">🔔</span>
      </div>

      <!-- Character Body: "Byte" the Cyber Slime Cat -->
      <svg
        viewBox="0 0 64 64"
        class="character-svg"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
      >
        <!-- Dropshadow -->
        <ellipse cx="32" cy="56" rx="20" ry="5" fill="rgba(0, 0, 0, 0.3)" />

        <!-- Base Body -->
        <path
          d="M 20 20 H 44 V 24 H 48 V 48 H 44 V 52 H 20 V 48 H 16 V 24 H 20 Z"
          :fill="primaryColor"
        />

        <!-- Cat Ears -->
        <path d="M 16 12 H 24 V 20 H 16 Z" :fill="primaryColor" />
        <path d="M 40 12 H 48 V 20 H 40 Z" :fill="primaryColor" />
        <path d="M 18 14 H 22 V 18 H 18 Z" fill="#ff7675" />
        <path d="M 42 14 H 46 V 18 H 42 Z" fill="#ff7675" />

        <!-- Highlights (Gloss) -->
        <rect x="22" y="24" width="4" height="4" fill="rgba(255, 255, 255, 0.4)" />
        <rect x="26" y="22" width="6" height="2" fill="rgba(255, 255, 255, 0.4)" />

        <!-- Eyes & Face according to state -->
        <!-- IDLE / WORKING -->
        <g v-if="status === 'idle' || status === 'working'">
          <rect x="24" y="30" width="4" height="6" fill="#1e272e" />
          <rect x="36" y="30" width="4" height="6" fill="#1e272e" />
          <!-- Eye glint -->
          <rect x="24" y="30" width="2" height="2" fill="#ffffff" />
          <rect x="36" y="30" width="2" height="2" fill="#ffffff" />
          <!-- Cute mouth -->
          <path d="M 30 38 H 34 V 40 H 30 Z" fill="#1e272e" />
        </g>

        <!-- THINKING (looking up/curious) -->
        <g v-else-if="status === 'thinking'">
          <rect x="24" y="28" width="4" height="5" fill="#1e272e" />
          <rect x="36" y="28" width="4" height="5" fill="#1e272e" />
          <rect x="25" y="28" width="2" height="2" fill="#55efc4" />
          <rect x="37" y="28" width="2" height="2" fill="#55efc4" />
          <!-- Pondering mouth -->
          <rect x="31" y="38" width="2" height="2" fill="#1e272e" />
        </g>

        <!-- WAITING (Wide sleepy blinking eyes) -->
        <g v-else-if="status === 'waiting'">
          <rect x="23" y="32" width="6" height="3" fill="#1e272e" />
          <rect x="35" y="32" width="6" height="3" fill="#1e272e" />
          <path d="M 29 38 H 35 V 39 H 29 Z" fill="#1e272e" />
        </g>

        <!-- COMPLETED (Happy closed arc eyes ^_^) -->
        <g v-else-if="status === 'completed'">
          <path d="M 23 32 L 26 29 L 29 32" stroke="#1e272e" stroke-width="2" fill="none" />
          <path d="M 35 32 L 38 29 L 41 32" stroke="#1e272e" stroke-width="2" fill="none" />
          <!-- Happy mouth -->
          <path d="M 30 36 H 34 V 40 H 30 Z" fill="#ff7675" />
          <!-- Blush -->
          <rect x="20" y="34" width="3" height="2" fill="#ff7675" />
          <rect x="41" y="34" width="3" height="2" fill="#ff7675" />
        </g>

        <!-- ERROR (X _ X eyes) -->
        <g v-else-if="status === 'error'">
          <!-- Left X -->
          <path d="M 24 30 L 28 34 M 28 30 L 24 34" stroke="#d63031" stroke-width="2" />
          <!-- Right X -->
          <path d="M 36 30 L 40 34 M 40 30 L 36 34" stroke="#d63031" stroke-width="2" />
          <!-- Wavy mouth -->
          <path d="M 28 39 H 36 V 41 H 28 Z" fill="#d63031" />
        </g>

        <!-- UNKNOWN (Squinting/questioning eyes) -->
        <g v-else>
          <rect x="24" y="32" width="5" height="3" fill="#636e72" />
          <circle cx="38" cy="33" r="2.5" fill="#636e72" />
          <rect x="30" y="38" width="4" height="2" fill="#636e72" />
        </g>

        <!-- Keyboard / Coding Laptop when working -->
        <g v-if="status === 'working'" class="mini-laptop">
          <rect x="22" y="44" width="20" height="10" fill="#2d3436" rx="2" />
          <rect x="24" y="46" width="16" height="6" fill="#00cec9" class="laptop-screen" />
        </g>
      </svg>
    </div>

    <!-- Active Agent Mini Badge -->
    <div class="agent-tag" v-if="agentName && !mini">
      <span class="dot" :class="status"></span>
      <span class="name">{{ agentName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AgentStatus } from '../types/status';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const props = withDefaults(
  defineProps<{
    status: AgentStatus;
    label?: string;
    agentName?: string | null;
    showBubble?: boolean;
    mini?: boolean;
  }>(),
  {
    status: 'idle',
    label: '',
    agentName: 'DevPet',
    showBubble: true,
    mini: false,
  }
);

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
}>();

let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let lastClickTime = 0;
let startX = 0;
let startY = 0;

function registerClick() {
  const now = Date.now();
  if (now - lastClickTime < 60) return; // Debounce rapid duplicate event triggers
  lastClickTime = now;

  clickCount++;
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }

  // 3 or more clicks: immediately open dashboard / settings
  if (clickCount >= 3) {
    clickCount = 0;
    emit('open-dashboard');
    return;
  }

  // 1 or 2 clicks: short buffer to determine single vs double click
  clickTimer = setTimeout(() => {
    if (clickCount === 2) {
      // 2 clicks: shortcut to open / focus active agent (e.g. Antigravity)
      emit('focus-app');
    } else if (clickCount === 1) {
      // 1 click: show / refresh speech bubble
      emit('peek-bubble');
    }
    clickCount = 0;
  }, 320);
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 0) {
    startX = e.screenX;
    startY = e.screenY;
    try {
      const appWin = getCurrentWebviewWindow();
      appWin.startDragging();
    } catch {
      // In web preview mode, ignore
    }
  }
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 0) {
    const dx = Math.abs(e.screenX - startX);
    const dy = Math.abs(e.screenY - startY);
    // If movement was negligible, treat as an intentional click
    if (dx <= 6 && dy <= 6) {
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
  padding: 4px;
}

.pet-container:active {
  cursor: grabbing;
}

/* Speech bubble */
.speech-bubble {
  position: absolute;
  top: 4px;
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

.pet-sprite {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mini .pet-sprite {
  width: 64px;
  height: 64px;
}

.character-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
}

/* Animations per state */

/* IDLE: Breathing / Bobbing */
.pet-sprite.idle {
  animation: idleBob 3s ease-in-out infinite;
}
@keyframes idleBob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px) scaleY(1.03);
  }
}

/* WORKING: Typing bounce / jitter */
.pet-sprite.working {
  animation: typingBounce 0.4s ease-in-out infinite alternate;
}
@keyframes typingBounce {
  0% {
    transform: translateY(0) rotate(-1deg);
  }
  100% {
    transform: translateY(-3px) rotate(1deg);
  }
}
.laptop-screen {
  animation: screenBlink 0.5s infinite alternate;
}
@keyframes screenBlink {
  0% { fill: #00cec9; }
  100% { fill: #81ecec; }
}

/* THINKING: Gentle floating sway */
.pet-sprite.thinking {
  animation: thinkingSway 2.4s ease-in-out infinite;
}
@keyframes thinkingSway {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(-3deg);
  }
  75% {
    transform: translateY(-5px) rotate(3deg);
  }
}

.thinking-gear {
  position: absolute;
  top: -8px;
  right: 12px;
  font-size: 18px;
  animation: pulseLight 1.5s ease-in-out infinite;
}
@keyframes pulseLight {
  0%, 100% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}

/* COMPLETED: Celebratory jump & sparkle */
.pet-sprite.completed {
  animation: victoryJump 0.8s ease-in-out infinite alternate;
}
@keyframes victoryJump {
  0% {
    transform: translateY(0) scale(1, 0.95);
  }
  100% {
    transform: translateY(-12px) scale(0.95, 1.05);
  }
}

.celebration-particles {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.particle {
  position: absolute;
  font-size: 14px;
  animation: burst 1s infinite alternate;
}
.p1 { top: -6px; left: 10px; animation-delay: 0s; }
.p2 { top: -10px; right: 12px; animation-delay: 0.2s; }
.p3 { bottom: 10px; right: 2px; animation-delay: 0.4s; }

@keyframes burst {
  0% { transform: scale(0.7) translateY(0); opacity: 0.6; }
  100% { transform: scale(1.2) translateY(-6px); opacity: 1; }
}

/* ERROR: Shaking alarm */
.pet-sprite.error {
  animation: errorShake 0.4s ease-in-out infinite;
}
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-2deg); }
  75% { transform: translateX(4px) rotate(2deg); }
}

.error-badge {
  position: absolute;
  top: -4px;
  right: 14px;
  background: #d63031;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(214, 48, 49, 0.8);
}

/* WAITING / ACTION NEEDED: Energetic attention-seeking bounce & alert */
.pet-sprite.waiting {
  animation: waitingAlertBounce 0.55s ease-in-out infinite alternate;
}
@keyframes waitingAlertBounce {
  0% {
    transform: translateY(0) scale(1, 0.96);
  }
  100% {
    transform: translateY(-9px) scale(0.96, 1.05);
  }
}

.waiting-alert-badge {
  position: absolute;
  top: -8px;
  right: 12px;
  background: #f39c12;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  box-shadow: 0 0 14px rgba(243, 156, 18, 0.9);
  animation: pulseBell 0.55s infinite alternate;
  z-index: 15;
}

@keyframes pulseBell {
  0% {
    transform: scale(0.88) rotate(-12deg);
    box-shadow: 0 0 6px rgba(243, 156, 18, 0.6);
  }
  100% {
    transform: scale(1.18) rotate(12deg);
    box-shadow: 0 0 18px rgba(243, 156, 18, 1);
  }
}

/* UNKNOWN: Sleeping or confused */
.pet-sprite.unknown {
  filter: grayscale(40%);
  opacity: 0.85;
}

/* Agent tag badge */
.agent-tag {
  margin-top: 2px;
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
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.idle { background: #6c5ce7; }
.dot.thinking { background: #0984e3; box-shadow: 0 0 6px #0984e3; }
.dot.working { background: #00b894; box-shadow: 0 0 6px #00b894; }
.dot.completed { background: #fdcb6e; box-shadow: 0 0 6px #fdcb6e; }
.dot.error { background: #d63031; box-shadow: 0 0 6px #d63031; }
.dot.waiting { background: #e17055; }
.dot.unknown { background: #b2bec3; }
</style>
