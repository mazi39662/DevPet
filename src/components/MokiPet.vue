<template>
  <div
    ref="containerRef"
    class="moki-container"
    :class="[
      `mood-${currentMood}`,
      currentMood,
      {
        mini,
        booped: isBooped,
        scratching: isScratching,
        blissful: isBlissful,
        hovered: isHovered,
        'user-typing': isTyping,
        'status-morphing': isMorphing,
        turbo: displayWpm >= 60 || currentMood === 'turbo',
      },
    ]"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Floating Keystroke & WPM Particle Bursts -->
    <div class="particles-overlay">
      <div
        v-for="p in particles"
        :key="p.id"
        class="key-particle"
        :class="{ 'wpm-particle': p.isWpm }"
        :style="{
          left: `${p.x}px`,
          top: `${p.y}px`,
          color: p.color,
          opacity: p.opacity,
          transform: `translate(-50%, -50%) rotate(${p.rot}deg) scale(${p.scale})`,
        }"
      >
        {{ p.char }}
      </div>

      <!-- Affection hearts when petted -->
      <Transition name="fade">
        <div v-if="isScratching || isBlissful" class="affection-particles">
          <span class="heart-particle h1">💖</span>
          <span class="heart-particle h2">💕</span>
          <span class="heart-particle h3">✨</span>
          <span class="heart-particle h4">🐾</span>
        </div>
      </Transition>

      <!-- Dynamic 360-degree burst code & spark particles (Base Codi) -->
      <div class="burst-particles-layer">
        <span
          v-for="p in activeBurstParticles"
          :key="p.id"
          class="burst-particle"
          :class="p.typeClass"
          :style="{
            '--dx': p.dx + 'px',
            '--dy': p.dy + 'px',
            '--rot': p.rot + 'deg',
            '--size': p.size + 'px',
            '--duration': p.duration + 'ms',
            '--color': p.color
          }"
        >{{ p.text }}</span>
      </div>

      <!-- Celebration particles (Base Codi) -->
      <Transition name="fade">
        <div v-if="currentMood === 'celebrating'" class="celebration-particles">
          <span class="particle p1">✨</span>
          <span class="particle p2">⭐</span>
          <span class="particle p3">🎉</span>
          <span class="particle p4">🌟</span>
          <span class="particle p5">🎊</span>
        </div>
      </Transition>

      <!-- Thinking floating curiosity particles & aura (Base Codi) -->
      <Transition name="fade">
        <div v-if="currentMood === 'thinking'" class="thinking-particles-container">
          <div class="thinking-gear">
            <span class="gear-icon">🧠</span>
            <span class="thought-aura"></span>
          </div>
          <span class="particle think-p1">💡</span>
          <span class="particle think-p2">✦</span>
          <span class="particle think-p3">¿</span>
          <span class="particle think-p4">hmmm..!</span>
        </div>
      </Transition>

      <!-- Waiting / Action Required alert badge & radar ping (Base Codi) -->
      <Transition name="fade">
        <div v-if="currentMood === 'waiting'" class="waiting-particles-container">
          <div class="waiting-alert-badge" title="Waiting for you!">
            <span class="alert-icon">⏳</span>
            <span class="alert-radar"></span>
            <span class="alert-radar radar-2"></span>
          </div>
          <span class="particle w1">⏳</span>
          <span class="particle w2">⚡</span>
          <span class="particle w3">🔔</span>
        </div>
      </Transition>

      <!-- Error badge & panic sweat particles (Base Codi) -->
      <Transition name="fade">
        <div v-if="currentMood === 'error'" class="error-particles-container">
          <div class="error-badge">
            <span class="exclamation">!</span>
            <span class="error-ping"></span>
          </div>
          <span class="particle err-p1">💧</span>
          <span class="particle err-p2">⚠️</span>
          <span class="particle err-p3">⚡</span>
        </div>
      </Transition>

      <!-- Sleepy snoring particles -->
      <Transition name="fade">
        <div v-if="currentMood === 'sleepy'" class="sleepy-particles-container">
          <span class="particle z1">💤</span>
          <span class="particle z2">Zzz</span>
          <span class="particle z3">💭</span>
        </div>
      </Transition>

      <!-- Stretching wellness relaxation particles -->
      <Transition name="fade">
        <div v-if="currentMood === 'stretching'" class="stretch-particles-container">
          <span class="particle s1">🌸</span>
          <span class="particle s2">✨</span>
          <span class="particle s3">🌿</span>
        </div>
      </Transition>
    </div>

    <!-- Speech Bubble (Clean floating pill matching CompanionPet) -->
    <Transition name="pop">
      <div
        v-if="bubbleVisible"
        class="speech-bubble"
        :class="[currentMood, { 'scratch-bubble': isScratching || isBlissful }]"
        @click.stop="triggerRandomQuip"
        @mousedown.stop
      >
        <span class="bubble-icon">{{ bubbleMoodIcon }}</span>
        <span class="bubble-text">{{ currentBubbleText }}</span>
      </div>
    </Transition>

    <!-- Pixel Art Mascot SVG (72x72 crisp pixel grid, matching Momo & Codi) -->
    <div
      class="character-art"
      :class="[
        currentMood,
        {
          scratching: isScratching,
          blissful: isBlissful,
          booped: isBooped,
          'user-typing': isTyping,
          'status-morphing': isMorphing,
        }
      ]"
    >
      <svg
        viewBox="0 0 72 72"
        class="character-svg"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
      >
        <!-- Dynamic Dynamic Dropshadow (Reacts dynamically to jumping/floating states like Codi) -->
        <ellipse
          cx="36"
          cy="67"
          rx="18"
          ry="3.5"
          fill="rgba(0,0,0,0.28)"
          class="shadow-ellipse"
          :class="currentMood"
        />

        <!-- Thinking Cyber Orbit Ring (Base Codi) -->
        <g v-if="currentMood === 'thinking'" class="cyber-orbit-ring">
          <ellipse cx="36" cy="18" rx="24" ry="7" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4 2" opacity="0.8" />
          <circle cx="14" cy="18" r="2.2" fill="#fbbf24" class="orbit-electron" />
        </g>

        <!-- Pixel Ears -->
        <!-- Left Ear -->
        <g class="pixel-ear left-ear" :class="[currentMood, { 'ear-wiggle': isScratching }]">
          <rect x="20" y="12" width="8" height="12" fill="#d97706" />
          <rect x="22" y="10" width="4" height="2" fill="#d97706" />
          <rect x="22" y="14" width="4" height="6" fill="#fbcfe8" />
        </g>
        <!-- Right Ear -->
        <g class="pixel-ear right-ear" :class="[currentMood, { 'ear-wiggle': isScratching }]">
          <rect x="44" y="12" width="8" height="12" fill="#d97706" />
          <rect x="46" y="10" width="4" height="2" fill="#d97706" />
          <rect x="46" y="14" width="4" height="6" fill="#fbcfe8" />
        </g>

        <!-- Tail -->
        <g class="pixel-tail" :class="currentMood">
          <rect x="14" y="44" width="4" height="10" fill="#d97706" />
          <rect x="10" y="40" width="4" height="8" fill="#f59e0b" />
          <rect x="10" y="36" width="4" height="4" fill="#fef3c7" />
        </g>

        <!-- Main Body Box (Square pixel mascot matching Codi & Momo) -->
        <rect x="18" y="22" width="36" height="36" fill="#f59e0b" rx="2" class="character-torso" :class="currentMood" />
        <!-- Forehead highlight corner -->
        <rect x="20" y="24" width="4" height="4" fill="#fef3c7" />
        <rect x="24" y="24" width="6" height="2" fill="#fef3c7" />

        <!-- Cream Belly Patch -->
        <rect x="24" y="38" width="24" height="18" fill="#fffbeb" />

        <!-- Cheeks with dynamic blush glow -->
        <rect x="20" y="40" width="4" height="3" fill="#f43f5e" opacity="0.85" :class="{ 'blush-glow': isBlissful || isScratching || currentMood === 'celebrating' }" />
        <rect x="48" y="40" width="4" height="3" fill="#f43f5e" opacity="0.85" :class="{ 'blush-glow': isBlissful || isScratching || currentMood === 'celebrating' }" />

        <!-- Eyes (Expressive pixel emotions based on Codi's emotional depth) -->
        <g class="pixel-eyes">
          <!-- 1. Blissful / Petted / Loving -->
          <template v-if="isBlissful || isScratching">
            <path d="M 23 33 Q 27 29 31 33" stroke="#451a03" stroke-width="2.2" fill="none" stroke-linecap="round" />
            <path d="M 41 33 Q 45 29 49 33" stroke="#451a03" stroke-width="2.2" fill="none" stroke-linecap="round" />
          </template>

          <!-- 2. Celebrating / Victory (Ecstatic closed arc eyes ^_^) -->
          <template v-else-if="currentMood === 'celebrating'">
            <path d="M 23 33 L 27 29 L 31 33" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <path d="M 41 33 L 45 29 L 49 33" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round" />
          </template>

          <!-- 3. Error / Panic (Crossed X _ X dizzy distress eyes) -->
          <template v-else-if="currentMood === 'error'">
            <path d="M 24 30 L 30 36 M 30 30 L 24 36" stroke="#d63031" stroke-width="2.5" stroke-linecap="round" />
            <path d="M 42 30 L 48 36 M 48 30 L 42 36" stroke="#d63031" stroke-width="2.5" stroke-linecap="round" />
          </template>

          <!-- 4. Waiting / Alert (Raised expectant eyebrows + wide attentive sclera & scanning pupils) -->
          <template v-else-if="currentMood === 'waiting'">
            <rect x="22" y="24" width="8" height="2" fill="#451a03" class="waiting-brow-left" />
            <rect x="42" y="24" width="8" height="2" fill="#451a03" class="waiting-brow-right" />
            <rect x="23" y="27" width="8" height="9" fill="#ffffff" rx="1" />
            <rect x="41" y="27" width="8" height="9" fill="#ffffff" rx="1" />
            <g class="waiting-pupils-animated">
              <rect x="25" y="29" width="4" height="6" fill="#451a03" />
              <rect x="43" y="29" width="4" height="6" fill="#451a03" />
              <rect x="25" y="29" width="2" height="2" fill="#f43f5e" />
              <rect x="43" y="29" width="2" height="2" fill="#f43f5e" />
            </g>
          </template>

          <!-- 5. Thinking / Pondering (Thoughtful raised brow + scanning pupils) -->
          <template v-else-if="currentMood === 'thinking'">
            <line x1="22" y1="26" x2="30" y2="25" stroke="#451a03" stroke-width="1.5" stroke-linecap="round" />
            <line x1="42" y1="26" x2="50" y2="27" stroke="#451a03" stroke-width="1.5" stroke-linecap="round" />
            <g class="thinking-eyes-scanning">
              <rect x="25" y="28" width="4" height="5" fill="#451a03" />
              <rect x="43" y="28" width="4" height="5" fill="#451a03" />
              <rect x="26" y="28" width="2" height="2" fill="#38bdf8" />
              <rect x="44" y="28" width="2" height="2" fill="#38bdf8" />
            </g>
          </template>

          <!-- 6. Sleepy / Dozing -->
          <template v-else-if="currentMood === 'sleepy'">
            <rect x="25" y="34" width="6" height="2" fill="#451a03" />
            <rect x="41" y="34" width="6" height="2" fill="#451a03" />
          </template>

          <!-- 7. Stretching / Wellness (Contented relaxed squint) -->
          <template v-else-if="currentMood === 'stretching'">
            <path d="M 24 33 Q 28 35 31 33" stroke="#451a03" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M 41 33 Q 44 35 48 33" stroke="#451a03" stroke-width="2" fill="none" stroke-linecap="round" />
          </template>

          <!-- 8. Starry / Turbo Typing (60+ WPM) -->
          <template v-else-if="displayWpm >= 60 || currentMood === 'turbo'">
            <!-- Left Sparkle Star Eye -->
            <rect x="26" y="28" width="2" height="8" fill="#f59e0b" class="star-eye" />
            <rect x="23" y="31" width="8" height="2" fill="#f59e0b" class="star-eye" />
            <rect x="25" y="30" width="4" height="4" fill="#ffffff" />
            <!-- Right Sparkle Star Eye -->
            <rect x="44" y="28" width="2" height="8" fill="#f59e0b" class="star-eye" />
            <rect x="41" y="31" width="8" height="2" fill="#f59e0b" class="star-eye" />
            <rect x="43" y="30" width="4" height="4" fill="#ffffff" />
          </template>

          <!-- 9. Typing Focus with Determined Brows & Cyber Screen Glint -->
          <template v-else-if="isTyping">
            <line x1="23" y1="27" x2="30" y2="29" stroke="#451a03" stroke-width="1.5" stroke-linecap="round" />
            <line x1="49" y1="27" x2="42" y2="29" stroke="#451a03" stroke-width="1.5" stroke-linecap="round" />
            <g :style="{ transform: `translate(${eyeLookX * 0.7}px, ${eyeLookY * 0.7 + 0.5}px)` }" class="typing-eyes-focus">
              <rect x="25" y="30" width="4" height="6" fill="#1e1f22" class="eye-pupil" />
              <rect x="25" y="30" width="2" height="2" fill="#38bdf8" class="glint-pulse" />
              <rect x="43" y="30" width="4" height="6" fill="#1e1f22" class="eye-pupil" />
              <rect x="43" y="30" width="2" height="2" fill="#38bdf8" class="glint-pulse" />
            </g>
          </template>

          <!-- 10. Normal Blinking Pixel Eyes with Interactive Mouse Gaze (Base Codi) -->
          <template v-else>
            <g :style="{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)` }" class="idle-eyes">
              <rect x="25" y="30" width="4" height="6" fill="#451a03" class="eye-pupil" />
              <rect x="25" y="30" width="2" height="2" fill="#ffffff" />
              <rect x="43" y="30" width="4" height="6" fill="#451a03" class="eye-pupil" />
              <rect x="43" y="30" width="2" height="2" fill="#ffffff" />
            </g>
          </template>
        </g>

        <!-- Cute Pixel Nose -->
        <rect x="35" y="36" width="2" height="2" fill="#be123c" />

        <!-- Dynamic Mouths per emotion -->
        <!-- Error wavy mouth -->
        <template v-if="currentMood === 'error'">
          <path d="M 31 40 Q 34 38 36 40 Q 38 42 41 40" stroke="#d63031" stroke-width="2" fill="none" stroke-linecap="round" />
        </template>
        <!-- Stretching yawny mouth -->
        <template v-else-if="currentMood === 'stretching'">
          <rect x="34" y="38" width="4" height="4" fill="#451a03" rx="2" />
          <rect x="35" y="40" width="2" height="2" fill="#f43f5e" />
        </template>
        <!-- Thinking "o" mouth -->
        <template v-else-if="currentMood === 'thinking'">
          <rect x="35" y="39" width="3" height="3" fill="#451a03" rx="1" />
        </template>
        <!-- Waiting "o" mouth -->
        <template v-else-if="currentMood === 'waiting'">
          <rect x="34" y="39" width="4" height="3" fill="#451a03" rx="1" />
        </template>
        <!-- Happy open smile when typing/celebrating/blissful -->
        <template v-else-if="isTyping || isBlissful || isScratching || currentMood === 'celebrating' || currentMood === 'turbo'">
          <rect x="33" y="39" width="6" height="2" fill="#451a03" />
          <rect x="34" y="41" width="4" height="2" fill="#f43f5e" />
        </template>
        <!-- Confident cute kitten grin :3 when idle -->
        <template v-else>
          <rect x="33" y="39" width="2" height="2" fill="#451a03" />
          <rect x="35" y="40" width="2" height="1" fill="#451a03" />
          <rect x="37" y="39" width="2" height="2" fill="#451a03" />
        </template>

        <!-- Mini Pixel Mechanical Keyboard -->
        <g class="pixel-keyboard">
          <rect x="18" y="52" width="36" height="11" fill="#1e1f22" rx="1" />
          <rect x="19" y="53" width="34" height="1" :fill="rgbAccent" />
          <!-- Keycaps with dynamic RGB clack -->
          <rect x="21" y="55" width="5" height="5" :fill="keyColors[0]" class="pkey" />
          <rect x="28" y="55" width="5" height="5" :fill="keyColors[1]" class="pkey" />
          <rect x="35" y="55" width="8" height="5" :fill="keyColors[2]" class="pkey" />
          <rect x="45" y="55" width="5" height="5" :fill="keyColors[3]" class="pkey" />
        </g>

        <!-- Dynamic Paws with Codi-based animations -->
        <!-- Cheering paws when celebrating -->
        <g v-if="currentMood === 'celebrating'" class="cheering-paws">
          <rect x="16" y="26" width="6" height="5" fill="#fffbeb" class="cheer-paw left" rx="1" />
          <rect x="50" y="26" width="6" height="5" fill="#fffbeb" class="cheer-paw right" rx="1" />
        </g>

        <!-- Flailing distress paws when error -->
        <g v-else-if="currentMood === 'error'" class="error-paws">
          <rect x="15" y="34" width="6" height="5" fill="#fffbeb" stroke="#d63031" stroke-width="0.8" class="flail-paw left" rx="1" />
          <rect x="51" y="34" width="6" height="5" fill="#fffbeb" stroke="#d63031" stroke-width="0.8" class="flail-paw right" rx="1" />
        </g>

        <!-- Impatient waving paw when waiting -->
        <g v-else-if="currentMood === 'waiting'" class="waiting-paws">
          <rect x="15" y="40" width="6" height="5" fill="#fffbeb" class="wave-paw" rx="1" />
          <rect x="44" y="50" width="6" height="5" fill="#fffbeb" class="paw right-paw" />
        </g>

        <!-- Extended stretching paws -->
        <g v-else-if="currentMood === 'stretching'" class="stretching-paws">
          <rect x="20" y="56" width="6" height="4" fill="#fffbeb" class="stretch-paw left" rx="1" />
          <rect x="46" y="56" width="6" height="4" fill="#fffbeb" class="stretch-paw right" rx="1" />
        </g>

        <!-- Pixel Paws clacking on keyboard or dancing -->
        <g v-else class="pixel-paws" :class="{ 'paws-clacking': isTyping || currentMood === 'turbo' }">
          <rect x="22" y="50" width="6" height="5" fill="#fffbeb" class="paw left-paw" />
          <rect x="44" y="50" width="6" height="5" fill="#fffbeb" class="paw right-paw" />
        </g>
      </svg>
    </div>

    <!-- Status Pill Underneath (Matches Momo & Codi 1:1, strictly pet's name) -->
    <div class="name-tag" :class="tierClass" @click.stop="triggerRandomQuip">
      <span class="status-dot" :class="{ active: isTyping }"></span>
      <span class="tag-label">Moki</span>
    </div>

    <!-- Hover Quick Buttons: Settings, Sticky Notes, Checklist, Close -->
    <div class="hover-controls" @mousedown.stop @mouseup.stop>
      <button class="icon-btn" title="Settings (DevPet Dashboard)" @click.stop="openDashboard">⚙️</button>
      <button class="icon-btn" title="Add Floating Sticky Note" @click.stop="addStickyNote">📌</button>
      <button class="icon-btn" title="Open Checklist" @click.stop="toggleChecklistModal">✅</button>
      <button class="icon-btn" title="Hide Moki" @click.stop="hidePet">✕</button>
    </div>

    <!-- Floating Sticky Notes (Draggable & editable on the desktop companion) -->
    <div
      v-for="note in floatingNotes"
      :key="note.id"
      class="floating-sticky-note"
      :class="note.color"
      :style="{ left: `${note.x ?? 10}px`, top: `${note.y ?? 10}px` }"
      @mousedown.stop
    >
      <div class="sticky-drag-header" @mousedown="onStickyMouseDown($event, note)">
        <span class="sticky-icon">📌</span>
        <div class="sticky-dots">
          <span
            v-for="c in (['yellow', 'pink', 'mint', 'cyan', 'lavender'] as const)"
            :key="c"
            class="color-dot"
            :class="[c, { active: note.color === c }]"
            @click.stop="changeNoteColor(note, c)"
          ></span>
        </div>
        <button class="sticky-close-btn" @click.stop="deleteNote(note.id)">✕</button>
      </div>
      <textarea
        v-model="note.content"
        class="sticky-textarea"
        placeholder="Type quick note..."
        @blur="saveNote(note)"
      ></textarea>
    </div>

    <!-- Quick Tasks Checklist Modal -->
    <Transition name="pop">
      <div v-if="showChecklistModal" class="checklist-modal-backdrop" @mousedown.stop>
        <div class="checklist-modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="m-icon">✅</span>
              <div>
                <h4 class="m-title">Checklist</h4>
                <p class="m-sub">{{ completedTasksCount }}/{{ state.tasks.length }} completed</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="showChecklistModal = false">✕</button>
          </div>

          <form @submit.prevent="addTaskFromModal" class="modal-add-form">
            <input
              v-model="modalNewTaskText"
              type="text"
              placeholder="+ New task & press Enter..."
              class="modal-input"
            />
            <button type="submit" class="modal-add-btn" :disabled="!modalNewTaskText.trim()">Add</button>
          </form>

          <div class="modal-tasks-list">
            <div
              v-for="task in state.tasks"
              :key="task.id"
              class="modal-task-row"
              :class="{ done: task.completed }"
            >
              <label class="m-check-label">
                <input
                  type="checkbox"
                  class="m-chk"
                  :checked="task.completed"
                  @change="toggleTaskModal(task.id)"
                />
                <span class="m-chk-box"></span>
              </label>
              <span class="m-task-text">{{ task.text }}</span>
              <button class="m-del-btn" @click="deleteTaskModal(task.id)">✕</button>
            </div>
            <div v-if="state.tasks.length === 0" class="modal-empty-tasks">
              No tasks yet! Add one above 🚀
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { KeystrokeParticle, MokiMood } from '../types/moki';
import { mokiCoordinator } from '../services/mokiCoordinator';
import { EVENTS } from '../types/events';
import { native, onEvent } from '../services/native';
import { notificationService } from '../services/notifications';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const props = withDefaults(
  defineProps<{
    mini?: boolean;
    interactive?: boolean;
    soundEnabled?: boolean;
  }>(),
  {
    mini: false,
    interactive: true,
    soundEnabled: true,
  }
);

const emit = defineEmits<{
  (e: 'open-dashboard'): void;
  (e: 'hide-pet'): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const state = mokiCoordinator.getState();

// Reactive pet interaction states
const isBooped = ref(false);
const isScratching = ref(false);
const isBlissful = ref(false);
const isTyping = ref(false);
const isHovered = ref(false);
const isMorphing = ref(false);
const eyeLookX = ref(0);
const eyeLookY = ref(0);
const bubbleVisible = ref(false);
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
let typingTimeout: ReturnType<typeof setTimeout> | null = null;
let morphTimer: ReturnType<typeof setTimeout> | null = null;

// Local Rolling WPM Calculation (Self-contained, reliable)
const localWpm = ref(0);
const keystrokeTimestamps: number[] = [];

// Display WPM: take local active WPM or coordinator WPM
const displayWpm = computed(() => {
  return localWpm.value > 0 ? localWpm.value : state.currentWpm;
});

// Pool of alphabet keyboard characters to ensure particles are ALWAYS real keyboard letters
const KEYBOARD_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
let letterCycleIdx = 0;

function resolveKeyboardLetter(rawKey?: string): string {
  if (rawKey && /^[a-zA-Z]$/.test(rawKey)) {
    return rawKey.toUpperCase();
  }
  if (rawKey && /^[0-9]$/.test(rawKey)) {
    return rawKey;
  }
  const ch = KEYBOARD_LETTERS[letterCycleIdx % KEYBOARD_LETTERS.length];
  letterCycleIdx++;
  return ch;
}

let continuousTypingStartTime = 0;
let lastKeystrokeTime = 0;
let lastWpmSpawnTime = 0;
let continuousKeystrokeCount = 0;

function registerKeystrokeLocally(char: string) {
  const now = Date.now();
  keystrokeTimestamps.push(now);

  if (!lastKeystrokeTime || now - lastKeystrokeTime > 1800) {
    continuousTypingStartTime = now;
    continuousKeystrokeCount = 0;
  }
  lastKeystrokeTime = now;
  continuousKeystrokeCount++;

  while (keystrokeTimestamps.length > 0 && now - keystrokeTimestamps[0] > 5000) {
    keystrokeTimestamps.shift();
  }

  if (keystrokeTimestamps.length >= 2) {
    const elapsedSec = Math.max((now - keystrokeTimestamps[0]) / 1000, 0.8);
    localWpm.value = Math.min(250, Math.round((keystrokeTimestamps.length / 5) / (elapsedSec / 60)));
  } else {
    localWpm.value = 32;
  }

  isTyping.value = true;
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping.value = false;
    localWpm.value = 0;
    continuousTypingStartTime = 0;
    continuousKeystrokeCount = 0;
    lastKeystrokeTime = 0;
  }, 2000);

  // 1. Emit keyboard letter particle
  spawnLetterParticle(char);

  // 2. Base Codi: Shoot 1-2 code / spark particles in 360-degree directions
  spawnBurst(Math.random() > 0.4 ? 2 : 1, Math.random() > 0.35);

  // 3. Occasional WPM particle after continuous flow
  const continuousDuration = now - continuousTypingStartTime;
  const timeSinceLastWpm = now - lastWpmSpawnTime;

  if (
    continuousDuration >= 5000 &&
    continuousKeystrokeCount >= 8 &&
    timeSinceLastWpm >= 5000
  ) {
    spawnWpmParticle();
    lastWpmSpawnTime = now;
  }
}

// Keystroke particles
const particles = ref<KeystrokeParticle[]>([]);
let nextId = 1;
const COLORS = ['#38bdf8', '#fb923c', '#f43f5e', '#a855f7', '#22c55e', '#facc15'];
const keyColors = ref(['#38bdf8', '#818cf8', '#c084fc', '#f472b6']);
const rgbAccent = computed(() => (displayWpm.value >= 60 || currentMood.value === 'turbo' ? '#f43f5e' : '#38bdf8'));

function spawnLetterParticle(char: string) {
  const displayChar = resolveKeyboardLetter(char);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  particles.value.push({
    id: nextId++,
    char: displayChar,
    x: 84 + (Math.random() - 0.5) * 28,
    y: 84 + (Math.random() - 0.5) * 6,
    vx: (Math.random() - 0.5) * 1.4,
    vy: -1.3 - Math.random() * 0.9,
    rot: (Math.random() - 0.5) * 18,
    scale: 1.05 + Math.random() * 0.25,
    color,
    opacity: 1,
    isWpm: false,
  });

  if (particles.value.length > 25) particles.value.shift();

  keyColors.value = [
    COLORS[Math.floor(Math.random() * COLORS.length)],
    COLORS[Math.floor(Math.random() * COLORS.length)],
    COLORS[Math.floor(Math.random() * COLORS.length)],
    COLORS[Math.floor(Math.random() * COLORS.length)],
  ];

  if (props.soundEnabled) {
    notificationService.playKeyClick();
  }
}

// Base Codi: Burst Particles Layer (Code snippets & sparks in 360 degrees)
interface BurstParticle {
  id: number;
  text: string;
  typeClass: string;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  duration: number;
  color: string;
}

const activeBurstParticles = ref<BurstParticle[]>([]);
let burstIdCounter = 0;
const CODE_SNIPPETS = ['{ }', '</>', '[ ]', '=>', '!=', '===', '()', ';', 'fn()', 'return', 'let', 'ok', '★'];
const SPARK_SNIPPETS = ['✦', '✨', '⚡', '•', '✧', '🔥'];
const NEON_COLORS = ['#38bdf8', '#fb923c', '#f43f5e', '#a855f7', '#22c55e', '#facc15'];

function spawnBurst(count = 2, isCode = true) {
  for (let i = 0; i < count; i++) {
    burstIdCounter++;
    const currentId = burstIdCounter;
    const angle = Math.random() * Math.PI * 2;
    const distance = 26 + Math.random() * 32;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rot = -40 + Math.random() * 80;
    const duration = 550 + Math.random() * 300;
    const textList = isCode ? CODE_SNIPPETS : SPARK_SNIPPETS;
    const text = textList[Math.floor(Math.random() * textList.length)];
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

    activeBurstParticles.value.push({
      id: currentId,
      text,
      typeClass: isCode ? 'burst-code' : 'burst-spark',
      dx,
      dy,
      rot,
      size: isCode ? 11 : 12,
      duration,
      color,
    });

    setTimeout(() => {
      activeBurstParticles.value = activeBurstParticles.value.filter((p) => p.id !== currentId);
    }, duration);
  }

  if (activeBurstParticles.value.length > 20) {
    activeBurstParticles.value = activeBurstParticles.value.slice(-16);
  }
}

function spawnWpmParticle() {
  const wpm = displayWpm.value > 0 ? displayWpm.value : 32;
  const isTurbo = wpm >= 60;
  const badgeText = isTurbo ? `${wpm} WPM 🔥` : `${wpm} WPM ⚡`;
  const badgeColor = isTurbo ? '#f43f5e' : '#38bdf8';
  const side = Math.random() > 0.5 ? 1 : -1;

  particles.value.push({
    id: nextId++,
    char: badgeText,
    x: 84 + side * (32 + Math.random() * 8),
    y: 74 + (Math.random() - 0.5) * 8,
    vx: side * (0.2 + Math.random() * 0.3),
    vy: -0.9 - Math.random() * 0.5,
    rot: side * (1 + Math.random() * 3),
    scale: 1.0,
    color: badgeColor,
    opacity: 1,
    isWpm: true,
  });

  if (particles.value.length > 25) particles.value.shift();
}

// Animation frame for flying particles
let animId: number | null = null;
function loopParticles() {
  for (let i = particles.value.length - 1; i >= 0; i--) {
    const p = particles.value[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.isWpm ? 0.006 : 0.025;
    p.opacity -= p.isWpm ? 0.012 : 0.016;
    if (p.opacity <= 0 || p.y < -30) {
      particles.value.splice(i, 1);
    }
  }
  animId = requestAnimationFrame(loopParticles);
}

// Playful quips
const MOKI_QUIPS = [
  'Clack clack! Let us code something epic! ⌨️✨',
  'Your keyboard sounds like music to my ears! 🎶🐾',
  'Speed demon! Keep that rhythm going! 🔥⚡',
  'I believe in you! Write that clean code! 💻🌸',
  'Type away! I will catch all your keystrokes! ✨🐾',
  'Feeling the coding flow today! 🚀💫',
  'Purrrrr~ happy to be your keyboard buddy! 💕',
];
const activeBubbleQuip = ref(MOKI_QUIPS[0]);

function pickRandomQuip(): string {
  const q = MOKI_QUIPS[Math.floor(Math.random() * MOKI_QUIPS.length)];
  activeBubbleQuip.value = q;
  return q;
}

function triggerRandomQuip() {
  pickRandomQuip();
  showBubbleBriefly(3800);
}

// Current mood with full Codi-based emotional spectrum
const currentMood = computed<MokiMood>(() => {
  if (isScratching.value || isBlissful.value) return 'blissful';
  if (state.mood && state.mood !== 'idle') return state.mood;
  if (isTyping.value) return displayWpm.value >= 60 ? 'turbo' : 'typing';
  return 'idle';
});

// Watch mood change for smooth transition morphing (Base Codi)
watch(
  () => currentMood.value,
  (newMood, oldMood) => {
    if (newMood !== oldMood) {
      isMorphing.value = true;
      if (morphTimer) clearTimeout(morphTimer);
      morphTimer = setTimeout(() => {
        isMorphing.value = false;
        morphTimer = null;
      }, 340);
    }
  }
);

const bubbleMoodIcon = computed(() => {
  if (isScratching.value || isBlissful.value) return '💖';
  switch (currentMood.value) {
    case 'turbo': return '🔥';
    case 'celebrating': return '🎉';
    case 'thinking': return '💡';
    case 'waiting': return '⏳';
    case 'error': return '⚠️';
    case 'sleepy': return '💤';
    case 'stretching': return '🌸';
    case 'typing': return '⚡';
    default: return '✨';
  }
});

const tierClass = computed(() => {
  if (displayWpm.value >= 60 || currentMood.value === 'turbo') return 'turbo';
  if (displayWpm.value > 0 || currentMood.value === 'typing') return 'typing';
  return 'idle';
});

const currentBubbleText = computed(() => {
  if (isScratching.value || isBlissful.value) {
    return 'Purrrrr~ that tickles so good! 💕🐾';
  }
  switch (currentMood.value) {
    case 'turbo':
      return `TURBO MODE! ${displayWpm.value} WPM! 🚀🔥`;
    case 'celebrating':
      return 'Task finished! High five! 🎉🐾';
    case 'thinking':
      return 'Hmm... thinking deeply through this algorithm... 🧠💡';
    case 'waiting':
      return 'Waiting for your action! Ready when you are! ⏳🐾';
    case 'error':
      return 'Oh no! A bug was detected! We can squash it! ⚠️⚡';
    case 'sleepy':
      return 'Zzz... Snoozing on the keyboard... 💤';
    case 'stretching':
      return 'Time to stretch paws and relax shoulders! Ahhh~ 🌸';
    default:
      return state.speechBubbleText || activeBubbleQuip.value;
  }
});

function showBubbleBriefly(ms = 3500) {
  bubbleVisible.value = true;
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => (bubbleVisible.value = false), ms);
}

// Checklist & Sticky Notes Modal / Floating State
const showChecklistModal = ref(false);
const modalNewTaskText = ref('');

const completedTasksCount = computed(() => state.tasks.filter((t) => t.completed).length);

const floatingNotes = computed(() => {
  return state.stickyNotes.filter((n) => n.isFloating !== false);
});

function toggleChecklistModal() {
  showChecklistModal.value = !showChecklistModal.value;
}

function addTaskFromModal() {
  if (!modalNewTaskText.value.trim()) return;
  mokiCoordinator.dispatchAction({
    type: 'add-task',
    text: modalNewTaskText.value.trim(),
    priority: 'normal',
  });
  modalNewTaskText.value = '';
}

function toggleTaskModal(id: string) {
  mokiCoordinator.dispatchAction({ type: 'toggle-task', id });
}

function deleteTaskModal(id: string) {
  mokiCoordinator.dispatchAction({ type: 'delete-task', id });
}

function addStickyNote() {
  const colors: Array<'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender'> = ['yellow', 'pink', 'mint', 'cyan', 'lavender'];
  const randColor = colors[Math.floor(Math.random() * colors.length)];
  mokiCoordinator.dispatchAction({
    type: 'add-sticky-note',
    color: randColor,
    content: 'Quick note 📌',
    x: 10 + Math.floor(Math.random() * 20),
    y: 10 + Math.floor(Math.random() * 20),
    isFloating: true,
  });
  showBubbleBriefly(2500);
}

function changeNoteColor(note: any, color: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender') {
  mokiCoordinator.dispatchAction({
    type: 'update-sticky-note',
    id: note.id,
    color,
  });
}

function saveNote(note: any) {
  mokiCoordinator.dispatchAction({
    type: 'update-sticky-note',
    id: note.id,
    content: note.content,
  });
}

function deleteNote(id: string) {
  mokiCoordinator.dispatchAction({
    type: 'delete-sticky-note',
    id,
  });
}

// Dragging sticky notes inside companion
let draggingNote: any = null;
let noteDragStartX = 0;
let noteDragStartY = 0;
let noteOrigX = 0;
let noteOrigY = 0;

function onStickyMouseDown(e: MouseEvent, note: any) {
  draggingNote = note;
  noteDragStartX = e.clientX;
  noteDragStartY = e.clientY;
  noteOrigX = note.x ?? 10;
  noteOrigY = note.y ?? 10;

  window.addEventListener('mousemove', onStickyMouseMove);
  window.addEventListener('mouseup', onStickyMouseUp);
}

function onStickyMouseMove(e: MouseEvent) {
  if (!draggingNote) return;
  const dx = e.clientX - noteDragStartX;
  const dy = e.clientY - noteDragStartY;
  draggingNote.x = Math.max(0, noteOrigX + dx);
  draggingNote.y = Math.max(0, noteOrigY + dy);
}

function onStickyMouseUp() {
  if (draggingNote) {
    mokiCoordinator.dispatchAction({
      type: 'update-sticky-note',
      id: draggingNote.id,
      x: draggingNote.x,
      y: draggingNote.y,
    });
    draggingNote = null;
  }
  window.removeEventListener('mousemove', onStickyMouseMove);
  window.removeEventListener('mouseup', onStickyMouseUp);
}

// Window Dragging & Interactions
let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let startX = 0;
let startY = 0;

// Rapid mousemove tracking for scratch detection (Base Codi)
interface MouseSample {
  x: number;
  y: number;
  time: number;
}
const mouseHistory: MouseSample[] = [];
let scratchTimeout: ReturnType<typeof setTimeout> | null = null;
let blissTimeout: ReturnType<typeof setTimeout> | null = null;

function startScratching() {
  if (!isScratching.value) {
    isScratching.value = true;
    if (blissTimeout) {
      clearTimeout(blissTimeout);
      blissTimeout = null;
    }
    isBlissful.value = false;
  }
  if (props.soundEnabled) {
    notificationService.playPurr();
  }
  showBubbleBriefly(3000);

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
    }, 1500);
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

function onMouseDown(e: MouseEvent) {
  if (!props.interactive || e.button !== 0) return;
  const target = e.target as Element | null;
  if (target?.closest('button, input, textarea, .name-tag, .speech-bubble, .hover-controls, .icon-btn, label, .floating-sticky-note, .checklist-modal-backdrop')) {
    return;
  }

  startX = e.screenX;
  startY = e.screenY;
  stopScratching();

  try {
    const win = getCurrentWebviewWindow();
    win.startDragging();
  } catch {
    native.startWindowDragging().catch(() => {});
  }
}

function onMouseUp(e: MouseEvent) {
  if (!props.interactive || e.button !== 0) return;
  const target = e.target as Element | null;
  if (target?.closest('button, input, textarea, .name-tag, .speech-bubble, .hover-controls, .icon-btn, label, .floating-sticky-note, .checklist-modal-backdrop')) {
    return;
  }

  if (Math.abs(e.screenX - startX) <= 6 && Math.abs(e.screenY - startY) <= 6) {
    isBooped.value = true;
    setTimeout(() => (isBooped.value = false), 260);

    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);
    if (clickCount >= 3) {
      clickCount = 0;
      openDashboard();
      return;
    }
    clickTimer = setTimeout(() => {
      triggerRandomQuip();
      clickCount = 0;
    }, 280);
  }
}

function onMouseMove(e: MouseEvent) {
  if (!props.interactive) return;
  isHovered.value = true;
  const now = Date.now();

  // 1. Interactive Eye Look Tracking (Base Codi)
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    eyeLookX.value = Math.max(-2, Math.min(2, ((e.clientX - centerX) / (rect.width / 2)) * 2));
    eyeLookY.value = Math.max(-1.5, Math.min(1.5, ((e.clientY - centerY) / (rect.height / 2)) * 1.5));
  }

  // 2. Rapid movement tracking for affection / scratch reaction (Base Codi)
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

function openDashboard() {
  emit('open-dashboard');
  native.showDashboard().catch(() => {});
}

function hidePet() {
  emit('hide-pet');
  native.setMokiCompanionVisible(false).catch(() => {});
}

// Event Listeners
function onWindowKeyDown(e: KeyboardEvent) {
  const char = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  registerKeystrokeLocally(char);
  mokiCoordinator.recordKeystroke(char);
}

let unlistenTyping: (() => void) | null = null;

onMounted(async () => {
  window.addEventListener('keydown', onWindowKeyDown);
  animId = requestAnimationFrame(loopParticles);

  try {
    unlistenTyping = await onEvent(EVENTS.userTyping, (payload) => {
      const keyStr = payload.key || '★';
      registerKeystrokeLocally(keyStr);
    });
  } catch {}

  showBubbleBriefly(3000);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeyDown);
  if (animId) cancelAnimationFrame(animId);
  if (unlistenTyping) unlistenTyping();
  if (clickTimer) clearTimeout(clickTimer);
  if (bubbleTimer) clearTimeout(bubbleTimer);
  if (typingTimeout) clearTimeout(typingTimeout);
  if (morphTimer) clearTimeout(morphTimer);
  if (scratchTimeout) clearTimeout(scratchTimeout);
  if (blissTimeout) clearTimeout(blissTimeout);
});
</script>

<style scoped>
.moki-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 4px 8px;
  box-sizing: border-box;
  user-select: none;
  background: transparent;
  cursor: grab;
  transition: transform 0.25s ease;
}
.moki-container:active {
  cursor: grabbing;
}

/* Character Art Container with Smooth Morphing (Base Codi) */
.character-art {
  width: 76px;
  height: 76px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 85%;
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), filter 0.35s ease;
  cursor: grab;
}
.character-art:active {
  cursor: grabbing;
}

.mini .character-art {
  width: 58px;
  height: 58px;
}

.status-morphing {
  transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s ease !important;
}

.character-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
  transition: transform 0.25s ease;
}

/* ========================================================
   BASE CODI EMOTIONS & BODY ANIMATIONS
   ======================================================== */

/* 1. IDLE: Calm, gentle breathing bob */
.character-art.idle:not(.user-typing) {
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
  transform-origin: 36px 50px;
}
@keyframes torsoBreathe {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.02, 0.98); }
}

/* 2. TYPING / FOCUS: Rapid energetic clacking bop */
.character-art.user-typing,
.character-art.typing {
  animation: idleTypingBop 0.32s ease-in-out infinite alternate !important;
}
@keyframes idleTypingBop {
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

/* 3. TURBO MODE (60+ WPM): Hyper speed frenzy */
.character-art.turbo {
  animation: turboFrenzy 0.18s ease-in-out infinite alternate !important;
}
@keyframes turboFrenzy {
  0% { transform: translateY(0) rotate(-2deg) scale(1.02); }
  100% { transform: translateY(-4.5px) rotate(2deg) scale(1.06); }
}

/* 4. THINKING / PONDERING: Hypnotic levitation sway & orbit (Base Codi) */
.character-art.thinking {
  animation: thinkingLevitate 2.2s ease-in-out infinite !important;
}
@keyframes thinkingLevitate {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6px) rotate(-3deg);
  }
  50% {
    transform: translateY(-2px) rotate(0deg);
  }
  75% {
    transform: translateY(-6px) rotate(3deg);
  }
}

.cyber-orbit-ring {
  animation: orbitSpin 3s linear infinite;
  transform-origin: 36px 18px;
}
@keyframes orbitSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.thinking-eyes-scanning {
  animation: eyesScan 2s ease-in-out infinite alternate;
}
@keyframes eyesScan {
  0%, 20% { transform: translate(-1.5px, -1px); }
  40%, 60% { transform: translate(0, -1.8px); }
  80%, 100% { transform: translate(1.5px, -1px); }
}

/* 5. WAITING: High-energy alert bounce & waving paw (Base Codi) */
.character-art.waiting {
  animation: waitingAlertBounce 0.44s ease-in-out infinite alternate !important;
}
@keyframes waitingAlertBounce {
  0% {
    transform: translateY(0) scale(1, 0.94);
  }
  100% {
    transform: translateY(-8px) scale(0.96, 1.05);
  }
}

.wave-paw {
  animation: pawWave 0.28s ease-in-out infinite alternate;
  transform-origin: 18px 42px;
}
@keyframes pawWave {
  0% { transform: rotate(-16deg) translateY(0); }
  100% { transform: rotate(18deg) translateY(-4px); }
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

/* 6. CELEBRATING / VICTORY: Victory flip jumps & cheering paws (Base Codi) */
.character-art.celebrating {
  animation: victoryCelebration 0.72s ease-in-out infinite alternate !important;
}
@keyframes victoryCelebration {
  0% {
    transform: translateY(0) scale(1.05, 0.92) rotate(-2deg);
  }
  50% {
    transform: translateY(-7px) scale(0.96, 1.04) rotate(0deg);
  }
  100% {
    transform: translateY(-13px) scale(1, 1.06) rotate(2deg);
  }
}

.cheer-paw.left {
  animation: cheerPawWave 0.28s ease-in-out infinite alternate;
  transform-origin: 18px 28px;
}
.cheer-paw.right {
  animation: cheerPawWave 0.28s 0.14s ease-in-out infinite alternate;
  transform-origin: 52px 28px;
}
@keyframes cheerPawWave {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-5px) scale(1.15); }
}

/* 7. ERROR / PANIC: Distress panic wobble, hazard sparks & flailing paws (Base Codi) */
.character-art.error {
  animation: errorPanicShake 0.28s ease-in-out infinite !important;
}
@keyframes errorPanicShake {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(-4px) translateY(-1px) rotate(-3deg); }
  75% { transform: translateX(4px) translateY(1px) rotate(3deg); }
}

.flail-paw.left {
  animation: flailPaw 0.16s ease-in-out infinite alternate;
}
.flail-paw.right {
  animation: flailPaw 0.16s 0.08s ease-in-out infinite alternate;
}
@keyframes flailPaw {
  0% { transform: translateY(0) rotate(-12deg); }
  100% { transform: translateY(-5px) rotate(12deg); }
}

/* 8. SLEEPY: Gentle slow snoring sway */
.character-art.sleepy {
  animation: sleepySway 3.6s ease-in-out infinite alternate !important;
  opacity: 0.9;
}
@keyframes sleepySway {
  0% { transform: translateY(1px) rotate(-1.5deg); }
  100% { transform: translateY(-1px) rotate(1.5deg); }
}

/* 9. STRETCHING: Cat stretch pose */
.character-art.stretching {
  animation: catStretchPose 2.4s ease-in-out infinite alternate !important;
}
@keyframes catStretchPose {
  0% { transform: scale(1, 1) translateY(0); }
  50% { transform: scale(1.08, 0.92) translateY(2px); }
  100% { transform: scale(0.96, 1.05) translateY(-3px); }
}

/* 10. SCRATCHING / PURRING: Ecstatic purr vibration */
.character-art.scratching {
  animation: purrEcstasy 0.14s ease-in-out infinite alternate !important;
}
@keyframes purrEcstasy {
  0% { transform: translateY(0) scale(1.05, 0.95) rotate(-2.5deg); }
  50% { transform: translateY(-2px) scale(0.96, 1.04) rotate(0deg); }
  100% { transform: translateY(1px) scale(1.06, 0.94) rotate(2.5deg); }
}

/* 11. BLISSFUL: Lingering sweet sway */
.character-art.blissful {
  animation: blissfulSway 1.2s ease-in-out infinite alternate !important;
}
@keyframes blissfulSway {
  0% { transform: translateY(0) scale(1.02, 0.98) rotate(-1.2deg); }
  100% { transform: translateY(-4px) scale(0.98, 1.02) rotate(1.2deg); }
}

/* 12. BOOP SQUISH */
.character-art.booped {
  animation: boopSquish 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
@keyframes boopSquish {
  0% { transform: scale(1, 1); }
  45% { transform: scale(1.18, 0.82) translateY(3px); }
  100% { transform: scale(1, 1); }
}

/* ========================================================
   BASE CODI DYNAMIC SHADOW
   ======================================================== */
.shadow-ellipse {
  transform-origin: 36px 67px;
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.shadow-ellipse.celebrating {
  animation: shadowVictory 0.72s ease-in-out infinite alternate;
}
@keyframes shadowVictory {
  0% { transform: scale(1); opacity: 0.28; }
  100% { transform: scale(0.65); opacity: 0.14; }
}
.shadow-ellipse.waiting {
  animation: shadowWaiting 0.44s ease-in-out infinite alternate;
}
@keyframes shadowWaiting {
  0% { transform: scale(1); opacity: 0.28; }
  100% { transform: scale(0.75); opacity: 0.18; }
}
.shadow-ellipse.thinking {
  animation: shadowThinking 2.2s ease-in-out infinite;
}
@keyframes shadowThinking {
  0%, 100% { transform: scale(1); opacity: 0.28; }
  25%, 75% { transform: scale(0.8); opacity: 0.2; }
  50% { transform: scale(0.95); opacity: 0.25; }
}

/* Ears & Tail Animations */
.left-ear {
  transform-origin: 24px 18px;
  animation: earTwitch 5s infinite ease-in-out;
}
.right-ear {
  transform-origin: 48px 18px;
  animation: earTwitch 5.2s infinite ease-in-out 0.25s;
}
@keyframes earTwitch {
  0%, 90%, 100% { transform: rotate(0deg); }
  93% { transform: rotate(-7deg); }
  96% { transform: rotate(4deg); }
}

.ear-wiggle {
  animation: earFastTwitch 0.16s ease-in-out infinite alternate !important;
  transform-origin: 36px 16px;
}
@keyframes earFastTwitch {
  0% { transform: rotate(-4deg) scaleY(0.92); }
  100% { transform: rotate(4deg) scaleY(1.06); }
}

.turbo .left-ear,
.turbo .right-ear {
  animation: turboEars 0.18s infinite alternate !important;
}
@keyframes turboEars {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.pixel-tail {
  transform-origin: 14px 48px;
  animation: tailSwing 2.2s steps(2, jump-none) infinite alternate;
}
@keyframes tailSwing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-8deg); }
}

.user-typing .pixel-tail,
.turbo .pixel-tail {
  animation: tailWagFast 0.3s steps(2, jump-none) infinite alternate;
}
@keyframes tailWagFast {
  0% { transform: rotate(2deg); }
  100% { transform: rotate(-14deg); }
}

/* Typing Paws Clatter */
.paws-clacking .left-paw {
  animation: pawClackLeft 0.14s steps(2, jump-none) infinite alternate;
}
.paws-clacking .right-paw {
  animation: pawClackRight 0.14s steps(2, jump-none) infinite alternate 0.07s;
}
@keyframes pawClackLeft {
  0% { transform: translateY(0); }
  100% { transform: translateY(2px); }
}
@keyframes pawClackRight {
  0% { transform: translateY(0); }
  100% { transform: translateY(2px); }
}

/* Glint & Star eyes */
.glint-pulse {
  animation: glintBlink 0.35s infinite alternate;
}
@keyframes glintBlink {
  0% { opacity: 0.6; }
  100% { opacity: 1; fill: #ffffff; }
}

.star-eye {
  animation: starTwinkle 0.4s infinite alternate;
}
@keyframes starTwinkle {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; fill: #facc15; }
}

.blush-glow {
  animation: blushPulse 0.5s ease-in-out infinite alternate;
}
@keyframes blushPulse {
  0% { fill: #f43f5e; opacity: 0.8; }
  100% { fill: #fb7185; opacity: 1; filter: drop-shadow(0 0 3px #fb7185); }
}

/* ========================================================
   BURST PARTICLES LAYER (Base Codi)
   ======================================================== */
.burst-particles-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 30;
}

.burst-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  user-select: none;
  white-space: nowrap;
  animation: burstShoot var(--duration, 600ms) cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
  will-change: transform, opacity;
}

.burst-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 700;
  font-size: var(--size, 11px);
  color: var(--color, #38bdf8);
  text-shadow: 0 0 6px var(--color, #38bdf8);
}

.burst-spark {
  font-size: var(--size, 12px);
  color: var(--color, #facc15);
  filter: drop-shadow(0 0 5px var(--color, #facc15));
}

@keyframes burstShoot {
  0% {
    transform: translate(-50%, -50%) scale(0.4) rotate(0deg);
    opacity: 0.95;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.1) rotate(var(--rot));
    opacity: 0;
  }
}

/* Celebration Star Particles (Base Codi) */
.celebration-particles {
  position: absolute;
  inset: -14px;
  pointer-events: none;
}
.p1 { top: -12px; left: 10px; animation: burstStar 0.8s infinite alternate; }
.p2 { top: -14px; right: 12px; animation: burstStar 0.9s 0.15s infinite alternate; }
.p3 { bottom: 12px; right: -2px; animation: burstStar 0.75s 0.3s infinite alternate; }
.p4 { bottom: 14px; left: -4px; animation: burstStar 0.85s 0.45s infinite alternate; }
.p5 { top: 12px; right: -6px; animation: burstStar 1s 0.2s infinite alternate; }
@keyframes burstStar {
  0% { transform: scale(0.7) translateY(0) rotate(0deg); opacity: 0.6; }
  100% { transform: scale(1.25) translateY(-8px) rotate(25deg); opacity: 1; }
}

/* Thinking Particles Container (Base Codi) */
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
  border: 1px dashed rgba(245, 158, 11, 0.6);
  animation: thoughtRing 1.8s infinite linear;
}
@keyframes thoughtRing {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
  100% { transform: scale(1.6) rotate(360deg); opacity: 0; }
}
.think-p1 { top: -6px; left: 8px; font-size: 13px; animation: thinkDrift 1.8s ease-in-out infinite alternate; }
.think-p2 { top: 14px; right: -4px; font-size: 12px; color: #f59e0b; animation: thinkDrift 1.5s 0.3s ease-in-out infinite alternate; }
.think-p3 { bottom: 12px; left: 2px; font-size: 13px; font-weight: bold; color: #38bdf8; animation: thinkDrift 1.6s 0.6s ease-in-out infinite alternate; }
.think-p4 { top: -10px; right: -6px; font-size: 11px; color: #ffeaa7; animation: thinkDrift 1.3s 0.45s ease-in-out infinite alternate; }
@keyframes thinkDrift {
  0% { transform: translateY(0) scale(0.8); opacity: 0.5; }
  100% { transform: translateY(-7px) scale(1.15); opacity: 1; }
}

/* Waiting Alert Particles Container (Base Codi) */
.waiting-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.waiting-alert-badge {
  position: absolute;
  top: -10px;
  right: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.95);
  animation: pulseWaitingBell 0.5s infinite alternate;
  z-index: 15;
}
.alert-radar {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #f59e0b;
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
  0% { transform: scale(0.9) rotate(-10deg); box-shadow: 0 0 8px rgba(245, 158, 11, 0.6); }
  100% { transform: scale(1.15) rotate(10deg); box-shadow: 0 0 18px rgba(245, 158, 11, 1); }
}
.w1 { top: -12px; left: 6px; font-size: 13px; animation: floatWaiting 1s ease-in-out infinite alternate; }
.w2 { bottom: 8px; right: -4px; font-size: 13px; animation: floatWaiting 1.2s 0.2s ease-in-out infinite alternate; }
.w3 { top: 14px; left: -8px; font-size: 13px; animation: floatWaiting 1.1s 0.4s ease-in-out infinite alternate; }
@keyframes floatWaiting {
  0% { transform: translateY(0) scale(0.85); opacity: 0.7; }
  100% { transform: translateY(-6px) scale(1.15); opacity: 1; }
}

/* Error Particles Container (Base Codi) */
.error-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.error-badge {
  position: absolute;
  top: -6px;
  right: 10px;
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
.err-p1 { top: -8px; left: 10px; font-size: 14px; animation: sweatDrop 0.6s infinite; }
@keyframes sweatDrop {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(8px); opacity: 0; }
}
.err-p2 { bottom: 8px; right: -2px; font-size: 12px; animation: errWarnFlash 0.4s infinite alternate; }
.err-p3 { top: 14px; left: -6px; font-size: 13px; animation: errWarnFlash 0.35s 0.1s infinite alternate; }
@keyframes errWarnFlash {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

/* Sleepy & Stretching Particles */
.sleepy-particles-container,
.stretch-particles-container {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}
.z1 { top: -10px; right: 8px; font-size: 13px; animation: driftUp 2s infinite ease-out; }
.z2 { top: -16px; right: -2px; font-size: 11px; font-weight: bold; color: #a855f7; animation: driftUp 2s 0.6s infinite ease-out; }
.z3 { top: 4px; left: -4px; font-size: 12px; animation: driftUp 2s 1.2s infinite ease-out; }

.s1 { top: -8px; left: 6px; font-size: 13px; animation: pulseSparkle 1.6s infinite alternate; }
.s2 { top: -12px; right: 10px; font-size: 12px; animation: pulseSparkle 1.8s 0.3s infinite alternate; }
.s3 { bottom: 10px; right: -4px; font-size: 12px; animation: pulseSparkle 1.5s 0.6s infinite alternate; }

@keyframes driftUp {
  0% { transform: translateY(0) scale(0.7); opacity: 0; }
  30% { opacity: 0.85; }
  100% { transform: translateY(-16px) scale(1.2); opacity: 0; }
}
@keyframes pulseSparkle {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
  100% { transform: scale(1.2) rotate(20deg); opacity: 1; }
}

/* Status Pill (Matches Momo & Codi 1:1) */
.name-tag {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(17, 18, 20, 0.88);
  border: 1px solid #383a40;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #dbdee1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.name-tag.typing {
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.name-tag.turbo {
  border-color: #f43f5e;
  color: #f43f5e;
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.5);
  animation: pulseTag 0.8s infinite alternate;
}
@keyframes pulseTag {
  0% { transform: scale(0.98); }
  100% { transform: scale(1.04); }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4e5058;
}
.status-dot.active {
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

/* Flying Particles */
.particles-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 25;
}

.key-particle {
  position: absolute;
  font-family: 'JetBrains Mono', 'Segoe UI', monospace;
  font-weight: 900;
  font-size: 16px;
  line-height: 1;
  text-shadow: 0 0 8px currentColor, 0 1px 3px rgba(0, 0, 0, 0.95);
  pointer-events: none;
  user-select: none;
}

.wpm-particle {
  font-size: 11px !important;
  font-weight: 800 !important;
  padding: 3px 8px;
  background: rgba(15, 23, 42, 0.92);
  border: none !important;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: none;
}

.affection-particles {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  font-size: 14px;
}
.heart-particle {
  animation: heartFloat 0.8s ease-out forwards;
}
.h1 { animation-delay: 0s; }
.h2 { animation-delay: 0.1s; }
.h3 { animation-delay: 0.2s; }
.h4 { animation-delay: 0.3s; }
@keyframes heartFloat {
  0% { transform: translateY(0) scale(0.7); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-16px) scale(1.2); opacity: 0; }
}

/* Speech Bubble - Compact floating message matching Momo/Codi */
.speech-bubble {
  position: absolute;
  top: 4px;
  background: rgba(20, 24, 33, 0.94);
  color: #f1f2f6;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  max-width: 154px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  z-index: 35;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.3;
  text-align: left;
}

.bubble-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.bubble-text {
  flex: 1;
  word-break: break-word;
}

.speech-bubble.turbo {
  border-color: #f43f5e;
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.45);
}

.speech-bubble.celebrating {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.45);
}

.speech-bubble.thinking {
  border-color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
}

.speech-bubble.waiting {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.45);
}

.speech-bubble.error {
  border-color: #d63031;
  box-shadow: 0 0 12px rgba(214, 48, 49, 0.45);
}

.speech-bubble.blissful,
.speech-bubble.scratch-bubble {
  border-color: #f472b6;
  box-shadow: 0 0 12px rgba(244, 114, 182, 0.45);
}

/* Quick Hover Controls */
.hover-controls {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 40;
}
.moki-container:hover .hover-controls {
  opacity: 1;
}

.icon-btn {
  background: rgba(30, 39, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #d2dae2;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}
.icon-btn:hover {
  background: #3b4252;
  color: #ffffff;
  transform: scale(1.1);
  border-color: #38bdf8;
}

/* Floating Sticky Notes */
.floating-sticky-note {
  position: absolute;
  width: 135px;
  height: 120px;
  border-radius: 6px;
  padding: 6px;
  box-sizing: border-box;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  z-index: 50;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.floating-sticky-note.yellow { background: #fef08a; border-color: #fde047; }
.floating-sticky-note.pink { background: #fbcfe8; border-color: #f472b6; }
.floating-sticky-note.mint { background: #a7f3d0; border-color: #6ee7b7; }
.floating-sticky-note.cyan { background: #bae6fd; border-color: #7dd3fc; }
.floating-sticky-note.lavender { background: #e9d5ff; border-color: #d8b4fe; }

.sticky-drag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 4px;
  user-select: none;
}
.sticky-drag-header:active {
  cursor: grabbing;
}
.sticky-icon {
  font-size: 11px;
}
.sticky-dots {
  display: flex;
  gap: 3px;
}
.color-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.color-dot.yellow { background: #facc15; }
.color-dot.pink { background: #f472b6; }
.color-dot.mint { background: #34d399; }
.color-dot.cyan { background: #38bdf8; }
.color-dot.lavender { background: #c084fc; }
.color-dot.active { border-color: #000; transform: scale(1.15); }

.sticky-close-btn {
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  color: #475569;
  padding: 0 2px;
}
.sticky-close-btn:hover {
  color: #e11d48;
}

.sticky-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 11px;
  line-height: 1.35;
  color: #0f172a;
  font-family: inherit;
  padding: 0;
}

/* Quick Checklist Modal */
.checklist-modal-backdrop {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 6px;
  right: 6px;
  z-index: 60;
  display: flex;
  flex-direction: column;
}
.checklist-modal-card {
  background: rgba(17, 18, 20, 0.98);
  border: 1px solid #383a40;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  padding: 8px;
  flex: 1;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2b2d31;
  padding-bottom: 6px;
  margin-bottom: 6px;
}
.modal-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.m-icon { font-size: 13px; }
.m-title {
  font-size: 11px;
  font-weight: 700;
  color: #f2f3f5;
  margin: 0;
}
.m-sub {
  font-size: 9px;
  color: #949ba4;
  margin: 0;
}
.modal-close-btn {
  background: transparent;
  border: none;
  color: #949ba4;
  font-size: 11px;
  cursor: pointer;
}
.modal-close-btn:hover { color: #f2f3f5; }
.modal-add-form {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.modal-input {
  flex: 1;
  background: #1e1f22;
  border: 1px solid #3b3e45;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10px;
  color: #f2f3f5;
  outline: none;
}
.modal-add-btn {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.modal-tasks-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 80px;
}
.modal-task-row {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #232428;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #dbdee1;
}
.modal-task-row.done {
  opacity: 0.6;
}
.modal-task-row.done .m-task-text {
  text-decoration: line-through;
  color: #80848e;
}
.m-check-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.m-chk { display: none; }
.m-chk-box {
  width: 10px;
  height: 10px;
  border: 1px solid #5c5f66;
  border-radius: 2px;
  display: inline-block;
  background: #1e1f22;
}
.m-chk:checked + .m-chk-box {
  background: #22c55e;
  border-color: #22c55e;
}
.m-task-text {
  flex: 1;
  word-break: break-word;
  line-height: 1.2;
}
.m-del-btn {
  background: transparent;
  border: none;
  color: #5c5f66;
  font-size: 9px;
  cursor: pointer;
  padding: 0 2px;
}
.m-del-btn:hover { color: #f43f5e; }
.modal-empty-tasks {
  text-align: center;
  font-size: 9px;
  color: #80848e;
  padding: 10px 0;
}

/* Transitions */
.pop-enter-active, .pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
