<template>
  <div class="tutorials-container">
    <!-- Hero Banner -->
    <div class="tutorials-hero">
      <div class="tutorials-hero-content">
        <div class="tutorials-badge">
          <span class="badge-sparkle">✨</span>
          <span>ACADEMY & INTERACTIVE PLAYGROUND</span>
        </div>
        <h2 class="tutorials-title">DevPet Tutorials & Companion Guide</h2>
        <p class="tutorials-subtitle">
          Master your desktop fleet! Test live companion animations, play synthesized sounds, explore multi-window desktop features, and connect your IDE hooks.
        </p>
      </div>

      <div class="tutorials-header-actions">
        <button class="hero-action-btn secondary" @click="$emit('replayOnboarding')">
          🚀 Replay Onboarding Wizard
        </button>
        <button class="hero-action-btn primary" @click="$emit('startTour')">
          ✨ Start UI Spotlight Tour
        </button>
      </div>
    </div>

    <!-- Category Tabs Navigation -->
    <nav class="tutorials-nav-bar">
      <button
        class="tut-nav-tab"
        :class="{ active: activeCategory === 'playground' }"
        @click="activeCategory = 'playground'"
      >
        <span class="tab-icon">🎮</span>
        <span>Interactive Pet Playground</span>
      </button>

      <button
        class="tut-nav-tab"
        :class="{ active: activeCategory === 'desktop' }"
        @click="activeCategory = 'desktop'"
      >
        <span class="tab-icon">🪟</span>
        <span>Desktop Companion Guide</span>
      </button>

      <button
        class="tut-nav-tab"
        :class="{ active: activeCategory === 'hooks' }"
        @click="activeCategory = 'hooks'"
      >
        <span class="tab-icon">🔌</span>
        <span>IDE & Agent Hook Setup</span>
      </button>

      <button
        class="tut-nav-tab"
        :class="{ active: activeCategory === 'checklist' }"
        @click="activeCategory = 'checklist'"
      >
        <span class="tab-icon">📋</span>
        <span>Getting Started Checklist</span>
        <span class="checklist-count-chip">{{ completedChecklistCount }}/{{ checklistItems.length }}</span>
      </button>
    </nav>

    <!-- Content Sections -->
    <div class="tutorials-content">
      <!-- ======================================================== -->
      <!-- TAB 1: INTERACTIVE PET PLAYGROUND                        -->
      <!-- ======================================================== -->
      <section v-if="activeCategory === 'playground'" class="playground-section">
        <!-- Sub-switcher for Mascot Playgrounds -->
        <div class="mascot-selector-row">
          <button
            class="mascot-select-card codi"
            :class="{ active: activeMascot === 'codi' }"
            @click="activeMascot = 'codi'"
          >
            <span class="m-card-avatar">🐾</span>
            <div class="m-card-meta">
              <strong>Codi Playground</strong>
              <span>Agent States, Celebrations & Chimes</span>
            </div>
          </button>

          <button
            class="mascot-select-card momo"
            :class="{ active: activeMascot === 'momo' }"
            @click="activeMascot = 'momo'"
          >
            <span class="m-card-avatar">🍅</span>
            <div class="m-card-meta">
              <strong>Momo Playground</strong>
              <span>Sprint Cycles, Tea Breaks & Bells</span>
            </div>
          </button>

          <button
            class="mascot-select-card moki"
            :class="{ active: activeMascot === 'moki' }"
            @click="activeMascot = 'moki'"
          >
            <span class="m-card-avatar">✨</span>
            <div class="m-card-meta">
              <strong>Moki Playground</strong>
              <span>Interactive Typing Arena & WPM</span>
            </div>
          </button>
        </div>

        <!-- 1. CODI PLAYGROUND -->
        <div v-if="activeMascot === 'codi'" class="mascot-playground-box codi-box">
          <div class="playground-layout">
            <!-- Left: Interactive Mascot Canvas -->
            <div class="mascot-stage">
              <div class="stage-tag">LIVE INTERACTIVE PREVIEW</div>
              <div class="pet-wrapper">
                <CompanionPet
                  :status="playgroundCodiStatus"
                  agent-name="Codi"
                  :detail="playgroundCodiDetail"
                  :show-bubble="playgroundCodiBubble"
                  :interactive="true"
                  :sound-enabled="true"
                />
              </div>
              <div class="stage-tip">
                💡 <strong>Click or scratch</strong> Codi's head with your cursor for purrs!
              </div>
            </div>

            <!-- Right: Interactive Controls -->
            <div class="mascot-controls-panel">
              <div class="panel-header">
                <h3>Codi • AI Coding Agent Companion</h3>
                <p>Simulate real agent events to see how Codi reacts during your coding workflow:</p>
              </div>

              <!-- State Simulator Buttons -->
              <div class="control-group">
                <label class="group-label">Simulate Agent State:</label>
                <div class="state-buttons-grid">
                  <button
                    v-for="st in codiStates"
                    :key="st.id"
                    class="state-btn"
                    :class="[st.id, { active: playgroundCodiStatus === st.id }]"
                    @click="setCodiState(st.id, st.detail)"
                  >
                    <span class="st-icon">{{ st.icon }}</span>
                    <span class="st-name">{{ st.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Speech Bubble & Quip Simulator -->
              <div class="control-group">
                <div class="group-label-row">
                  <label class="group-label">Speech Bubble Quip:</label>
                  <label class="mini-toggle">
                    <input type="checkbox" v-model="playgroundCodiBubble" />
                    <span>Show Bubble</span>
                  </label>
                </div>
                <div class="quip-input-row">
                  <input
                    type="text"
                    v-model="playgroundCodiDetail"
                    class="quip-input"
                    placeholder="Enter custom speech bubble text..."
                  />
                  <button class="random-quip-btn" @click="randomizeCodiQuip">
                    🎲 Random
                  </button>
                </div>
              </div>

              <!-- Sound & Affection Actions -->
              <div class="control-group">
                <label class="group-label">Audio & Mascot Actions:</label>
                <div class="action-buttons-row">
                  <button class="pg-action-btn chime" @click="testChime">
                    🎉 Play Victory Chime
                  </button>
                  <button class="pg-action-btn purr" @click="testPurr">
                    💖 Pet Codi (Affection Purr)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. MOMO PLAYGROUND -->
        <div v-else-if="activeMascot === 'momo'" class="mascot-playground-box momo-box">
          <div class="playground-layout">
            <!-- Left: Mascot Stage -->
            <div class="mascot-stage">
              <div class="stage-tag">LIVE INTERACTIVE PREVIEW</div>
              <div class="pet-wrapper">
                <PomodoroPet
                  :state="playgroundMomoState"
                  :interactive="true"
                  :sound-enabled="true"
                />
              </div>
              <div class="stage-tip">
                ☕ <strong>Scratch Momo's ears</strong> for cozy tea purrs & floating hearts!
              </div>
            </div>

            <!-- Right: Controls -->
            <div class="mascot-controls-panel">
              <div class="panel-header">
                <h3>Momo • Pomodoro Focus Mascot</h3>
                <p>Experiment with sprint phases, timer countdowns, and soothing mindfulness sound effects:</p>
              </div>

              <!-- Phase Selector -->
              <div class="control-group">
                <label class="group-label">Switch Pomodoro Phase:</label>
                <div class="phase-buttons-row">
                  <button
                    class="phase-btn focus"
                    :class="{ active: playgroundMomoState.phase === 'focus' }"
                    @click="setMomoPhase('focus')"
                  >
                    <span>🔥</span> Deep Work Sprint (25m)
                  </button>
                  <button
                    class="phase-btn break"
                    :class="{ active: playgroundMomoState.phase === 'break' && playgroundMomoState.totalDuration === 5 * 60 }"
                    @click="setMomoPhase('break', 5)"
                  >
                    <span>☕</span> Refreshing Break (5m)
                  </button>
                  <button
                    class="phase-btn long-break"
                    :class="{ active: playgroundMomoState.phase === 'break' && playgroundMomoState.totalDuration === 15 * 60 }"
                    @click="setMomoPhase('break', 15)"
                  >
                    <span>🧘</span> Long Rest (15m)
                  </button>
                </div>
              </div>

              <!-- Timer Controls -->
              <div class="control-group">
                <label class="group-label">Timer Simulation:</label>
                <div class="timer-simulation-row">
                  <div class="clock-display">
                    {{ formatPlaygroundTime(playgroundMomoState.timeRemaining) }}
                  </div>
                  <button
                    class="timer-action-btn toggle"
                    @click="togglePlaygroundTimer"
                  >
                    {{ playgroundMomoState.status === 'running' ? '⏸️ Pause' : '▶️ Start Sprint' }}
                  </button>
                  <button class="timer-action-btn" @click="resetPlaygroundTimer">
                    🔄 Reset
                  </button>
                </div>
              </div>

              <!-- Audio Audition -->
              <div class="control-group">
                <label class="group-label">Synthesized Sound Effects:</label>
                <div class="action-buttons-row">
                  <button class="pg-action-btn focus-snd" @click="testFocusSound">
                    🔔 Upbeat Focus Gong
                  </button>
                  <button class="pg-action-btn break-snd" @click="testBreakSound">
                    🍵 Zen Tea Break Bell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. MOKI PLAYGROUND -->
        <div v-else-if="activeMascot === 'moki'" class="mascot-playground-box moki-box">
          <div class="playground-layout">
            <!-- Left: Mascot Stage -->
            <div class="mascot-stage">
              <div class="stage-tag">LIVE INTERACTIVE PREVIEW</div>
              <div class="pet-wrapper">
                <MokiPet
                  :interactive="true"
                  :sound-enabled="true"
                />
              </div>
              <div class="live-wpm-badge">
                <span class="wpm-val">{{ typingWpm }}</span>
                <span class="wpm-lbl">WPM SPEED</span>
              </div>
            </div>

            <!-- Right: Interactive Live Typing Arena -->
            <div class="mascot-controls-panel">
              <div class="panel-header">
                <h3>Moki • Interactive Typing Velocity Arena</h3>
                <p>Type inside the test box below! Watch Moki clack paws on the keyboard, trigger keystroke particles, and calculate your real-time WPM:</p>
              </div>

              <!-- Typing Test Box -->
              <div class="control-group">
                <div class="group-label-row">
                  <label class="group-label">Interactive Keystroke Arena:</label>
                  <span class="typing-stats-text">
                    Total Keys: <strong>{{ typingKeystrokes }}</strong>
                  </span>
                </div>
                <textarea
                  v-model="typingInput"
                  class="interactive-typing-area"
                  placeholder="Type anything here! Feel the mechanical clacks and watch Moki sprint..."
                  @keydown="onTypingKeyDown"
                  @input="onTypingInput"
                  rows="3"
                ></textarea>
              </div>

              <!-- Switch Profiles Audition -->
              <div class="control-group">
                <label class="group-label">Keyboard Acoustic Switch Profiles:</label>
                <div class="action-buttons-row profile-pills-row">
                  <button
                    v-for="prof in previewProfiles"
                    :key="prof.id"
                    class="pg-action-btn profile-pill-btn"
                    :class="{ active: activeTutorialProfile === prof.id }"
                    @click="setTutorialProfile(prof.id)"
                  >
                    {{ prof.icon }} {{ prof.name }}
                  </button>
                </div>
              </div>

              <!-- Special Sound Effects Audition -->
              <div class="control-group">
                <label class="group-label">Tactile Feedback & Health Prompts:</label>
                <div class="action-buttons-row">
                  <button class="pg-action-btn key-snd" @click="testKeySound">
                    ⌨️ Standard Key
                  </button>
                  <button class="pg-action-btn space-snd" @click="testSpaceSound">
                    ⎵ Spacebar
                  </button>
                  <button class="pg-action-btn enter-snd" @click="testEnterSound">
                    ↵ Enter Bell
                  </button>
                  <button class="pg-action-btn backspace-snd" @click="testBackspaceSound">
                    ⌫ Backspace
                  </button>
                  <button class="pg-action-btn streak-snd" @click="testStreakSound">
                    🏆 Streak Chime
                  </button>
                  <button class="pg-action-btn boop-snd" @click="testBoopSound">
                    🐾 Mascot Boop
                  </button>
                  <button class="pg-action-btn stretch-snd" @click="testStretchAlert">
                    🧘 Stretch Bowl
                  </button>
                  <button class="pg-action-btn clear-btn" @click="resetTypingStats">
                    🧹 Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- TAB 2: DESKTOP COMPANION GUIDE                           -->
      <!-- ======================================================== -->
      <section v-else-if="activeCategory === 'desktop'" class="guide-section">
        <div class="guide-grid">
          <!-- Guide Card 1 -->
          <div class="guide-card">
            <div class="g-card-icon">🪟</div>
            <h4>Always-On-Top Desktop Overlays</h4>
            <p>
              Companions live in native transparent Tauri windows. They stay pinned comfortably above your code editor, IDE, terminal, or browser so you always have a visual pulse on your work.
            </p>
            <div class="g-card-chip">Always On Top • Transparent Canvas</div>
          </div>

          <!-- Guide Card 2 -->
          <div class="guide-card">
            <div class="g-card-icon">🖱️</div>
            <h4>Drag & Drop Anywhere</h4>
            <p>
              Simply click and hold any floating mascot to reposition them anywhere on your screens. DevPet remembers your preferred positions across multi-monitor setups.
            </p>
            <div class="g-card-chip">Multi-Monitor Support • Native Dragging</div>
          </div>

          <!-- Guide Card 3 -->
          <div class="guide-card">
            <div class="g-card-icon">📏</div>
            <h4>Compact Mini Mode</h4>
            <p>
              Need maximum screen real estate during heavy coding? Enable <strong>Mini Mode</strong> in Settings to compress companions into ultra-sleek, minimalist floating pills.
            </p>
            <div class="g-card-chip">Minimalist Design • Low Footprint</div>
          </div>

          <!-- Guide Card 4 -->
          <div class="guide-card">
            <div class="g-card-icon">💖</div>
            <h4>Petting & Mascot Affection</h4>
            <p>
              Hover over your companion or scratch their head back and forth with your cursor. They'll close their eyes, purr warmly, and spawn floating pink heart affection particles!
            </p>
            <div class="g-card-chip">Tactile Purrs • Interactive Quips</div>
          </div>

          <!-- Guide Card 5 -->
          <div class="guide-card">
            <div class="g-card-icon">🔔</div>
            <h4>Non-Intrusive Audio Synthesis</h4>
            <p>
              Zero MP3s or heavy media files! DevPet uses Web Audio oscillators to synthesize clean, resonant harmonic chimes and mechanical switch clacks with zero latency.
            </p>
            <div class="g-card-chip">Procedural Audio • Zero Latency</div>
          </div>

          <!-- Guide Card 6 -->
          <div class="guide-card">
            <div class="g-card-icon">⚡</div>
            <h4>Quick Header & Burger Toggles</h4>
            <p>
              Spawn or hide any pet instantly via the top header toggles or the scalable burger menu. Active companions display a glowing neon beacon dot.
            </p>
            <div class="g-card-chip">One-Click Toggles • Scalable Roster</div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- TAB 3: IDE & CODING AGENT HOOK SETUP                     -->
      <!-- ======================================================== -->
      <section v-else-if="activeCategory === 'hooks'" class="hooks-section">
        <div class="hook-status-card">
          <div class="hook-status-left">
            <div class="hook-icon-box" :class="{ ok: hookInstalled }">
              {{ hookInstalled ? '🟢' : '🟡' }}
            </div>
            <div>
              <h3>Google Antigravity Hook Status</h3>
              <p>
                {{
                  hookInstalled
                    ? 'Active & Integrated! Antigravity events will automatically reflect in Codi in real-time.'
                    : 'Hook not detected in global config. Click below to install or update the hook seamlessly.'
                }}
              </p>
            </div>
          </div>

          <button
            class="hook-toggle-btn"
            :class="{ installed: hookInstalled }"
            @click="toggleHook"
          >
            {{ hookInstalled ? '✓ Hook Installed & Active' : '⚡ One-Click Install Hook' }}
          </button>
        </div>

        <div class="hook-walkthrough-grid">
          <div class="walkthrough-step">
            <div class="step-num">1</div>
            <h4>Automatic Hook Integration</h4>
            <p>
              DevPet hooks into <code>.gemini/config/hooks.json</code>. When Antigravity executes steps, reads files, or asks for permissions, events are routed to DevPet via native IPC.
            </p>
          </div>

          <div class="walkthrough-step">
            <div class="step-num">2</div>
            <h4>Visual Agent Lifecycle</h4>
            <p>
              Codi translates agent states into visual animations:
            </p>
            <ul class="hook-lifecycle-list">
              <li><span class="hl-dot thinking"></span> <strong>Thinking:</strong> Agent planning & analyzing files</li>
              <li><span class="hl-dot working"></span> <strong>Working:</strong> Writing code & executing tools</li>
              <li><span class="hl-dot waiting"></span> <strong>Waiting:</strong> Awaiting your permission or input</li>
              <li><span class="hl-dot completed"></span> <strong>Completed:</strong> Prompt finished; celebratory chime!</li>
            </ul>
          </div>

          <div class="walkthrough-step">
            <div class="step-num">3</div>
            <h4>Manual / Other IDEs (VS Code, Cursor)</h4>
            <p>
              In addition to Antigravity, DevPet monitors active processes like VS Code and Codex via native process tracking. You can switch between active adapters anytime in the Codi Monitor tab.
            </p>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- TAB 4: INTERACTIVE GETTING STARTED CHECKLIST             -->
      <!-- ======================================================== -->
      <section v-else-if="activeCategory === 'checklist'" class="checklist-section">
        <div class="checklist-hero-card">
          <div class="checklist-progress-box">
            <div class="progress-ring-text">
              <span class="percent-val">{{ checklistPercent }}%</span>
              <span class="percent-lbl">COMPLETED</span>
            </div>
          </div>
          <div class="checklist-hero-text">
            <h3>DevPet Fleet Commander Milestones</h3>
            <p>
              Complete these milestones to unlock full mastery of your companion fleet. Each item checks off automatically as you explore!
            </p>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: `${checklistPercent}%` }"></div>
            </div>
          </div>
          <div v-if="checklistPercent === 100" class="badge-unlocked">
            <span class="trophy">🏆</span>
            <span>FLEET MASTER UNLOCKED!</span>
          </div>
        </div>

        <!-- Interactive Checklist Items -->
        <div class="checklist-items-list">
          <div
            v-for="item in checklistItems"
            :key="item.id"
            class="checklist-item-card"
            :class="{ checked: item.completed }"
            @click="toggleChecklistItem(item.id)"
          >
            <div class="custom-checkbox">
              <span v-if="item.completed">✓</span>
            </div>
            <div class="item-content">
              <div class="item-title-row">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-tag">{{ item.tag }}</span>
              </div>
              <p class="item-desc">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <div class="checklist-footer-actions">
          <button class="reset-checklist-btn" @click="resetChecklist">
            🔄 Reset Checklist Progress
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CompanionPet from './CompanionPet.vue';
import PomodoroPet from './PomodoroPet.vue';
import MokiPet from './MokiPet.vue';
import type { AgentStatus } from '../types/status';
import type { PomodoroPhase, PomodoroState } from '../types/pomodoro';
import type { KeyboardSoundProfile } from '../types/settings';
import { notificationService } from '../services/notifications';
import { native } from '../services/native';

const emit = defineEmits<{
  (e: 'replayOnboarding'): void;
  (e: 'startTour'): void;
  (e: 'testChime'): void;
  (e: 'testFocusSound'): void;
  (e: 'testKeySound'): void;
}>();

// Navigation Tabs
type CategoryId = 'playground' | 'desktop' | 'hooks' | 'checklist';
const activeCategory = ref<CategoryId>('playground');
const activeMascot = ref<'codi' | 'momo' | 'moki'>('codi');

// ============================================================================
// CODI PLAYGROUND STATE
// ============================================================================
const playgroundCodiStatus = ref<AgentStatus>('working');
const playgroundCodiDetail = ref('Writing high-performance Vue components...');
const playgroundCodiBubble = ref(true);

const codiStates: { id: AgentStatus; label: string; icon: string; detail: string }[] = [
  { id: 'idle', label: 'Idle / Ready', icon: '💤', detail: 'Ready for your instructions...' },
  { id: 'thinking', label: 'Thinking', icon: '💡', detail: 'Planning changes & analyzing architecture...' },
  { id: 'working', label: 'Working', icon: '⚡', detail: 'Writing code & compiling artifacts...' },
  { id: 'waiting', label: 'Waiting', icon: '⏳', detail: 'Awaiting permission to run command...' },
  { id: 'completed', label: 'Completed', icon: '🎉', detail: 'Task achieved with 100% test pass!' },
  { id: 'error', label: 'Error', icon: '⚠️', detail: 'Encountered unexpected test failure.' },
];

function setCodiState(status: AgentStatus, detail: string) {
  playgroundCodiStatus.value = status;
  playgroundCodiDetail.value = detail;
  if (status === 'completed') {
    notificationService.playChime();
  }
  markChecklist('try_playground');
}

const sampleQuips = [
  'Writing high-performance Vue components...',
  'Refactoring styling for extra sleek aesthetics! ✨',
  'All unit tests passed with flying colors! 🚀',
  'Thinking through optimal UI architectures... 💡',
  'Purrrrr~ Thanks for petting me! 💖',
];

function randomizeCodiQuip() {
  const current = playgroundCodiDetail.value;
  const filtered = sampleQuips.filter((q) => q !== current);
  playgroundCodiDetail.value = filtered[Math.floor(Math.random() * filtered.length)];
}

function testChime() {
  notificationService.playChime();
  markChecklist('test_audio');
}

function testPurr() {
  notificationService.playPurr();
  markChecklist('pet_affection');
}

// ============================================================================
// MOMO PLAYGROUND STATE
// ============================================================================
const playgroundMomoState = ref<PomodoroState>({
  phase: 'focus',
  status: 'running',
  timeRemaining: 25 * 60,
  totalDuration: 25 * 60,
  completedSessions: 1,
});

let timerInterval: any = null;

function setMomoPhase(phase: PomodoroPhase, minutes = 25) {
  const duration = minutes * 60;
  playgroundMomoState.value = {
    ...playgroundMomoState.value,
    phase,
    timeRemaining: duration,
    totalDuration: duration,
  };
  if (phase === 'focus') {
    notificationService.playFocusStartChime();
  } else {
    notificationService.playBreakBell();
  }
  markChecklist('try_playground');
}

function togglePlaygroundTimer() {
  if (playgroundMomoState.value.status === 'running') {
    playgroundMomoState.value.status = 'paused';
    if (timerInterval) clearInterval(timerInterval);
  } else {
    playgroundMomoState.value.status = 'running';
    startPlaygroundTimer();
  }
}

function startPlaygroundTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (playgroundMomoState.value.status === 'running') {
      if (playgroundMomoState.value.timeRemaining > 0) {
        playgroundMomoState.value.timeRemaining--;
      } else {
        clearInterval(timerInterval);
        playgroundMomoState.value.status = 'idle';
        notificationService.playBreakBell();
      }
    }
  }, 1000);
}

function resetPlaygroundTimer() {
  const duration =
    playgroundMomoState.value.phase === 'focus'
      ? 25 * 60
      : playgroundMomoState.value.phase === 'break'
      ? 5 * 60
      : 15 * 60;
  playgroundMomoState.value.timeRemaining = duration;
}

function formatPlaygroundTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function testFocusSound() {
  notificationService.playFocusStartChime();
  markChecklist('test_audio');
}

function testBreakSound() {
  notificationService.playBreakBell();
  markChecklist('test_audio');
}

// ============================================================================
// MOKI PLAYGROUND STATE (Interactive Typing Simulator)
// ============================================================================
const typingInput = ref('');
const typingKeystrokes = ref(0);
const typingWpm = ref(0);
let typingStartTime: number | null = null;
let wpmDecayInterval: any = null;

const activeTutorialProfile = ref<KeyboardSoundProfile>(
  notificationService.getSoundEffectsConfig().keyboardProfile || 'clicky'
);

const previewProfiles: { id: KeyboardSoundProfile; name: string; icon: string }[] = [
  { id: 'clicky', name: 'Blue Clicky', icon: '🔵' },
  { id: 'thock', name: 'Creamy Thock', icon: '🪵' },
  { id: 'marbly', name: 'Hi-Fi Marbly', icon: '🔮' },
  { id: 'creamy', name: 'Lubed Creamy', icon: '🍦' },
  { id: 'waterdrop', name: 'Waterdrop', icon: '💧' },
  { id: 'synthwave', name: '80s Synthwave', icon: '🕹️' },
  { id: 'wooden', name: 'Bamboo Wood', icon: '🪵' },
  { id: 'typewriter', name: 'Typewriter', icon: '📜' },
  { id: 'bubble', name: 'Bubble Pop', icon: '🫧' },
  { id: 'arcade', name: '8-Bit Arcade', icon: '👾' },
  { id: 'cyber', name: 'Cyberpunk', icon: '⚡' },
  { id: 'muted', name: 'Muted Silent', icon: '🔇' },
];

function setTutorialProfile(prof: KeyboardSoundProfile) {
  activeTutorialProfile.value = prof;
  notificationService.setKeyboardProfile(prof);
  notificationService.playKeyClick(' ', prof);
  markChecklist('test_audio');
}

function onTypingKeyDown(e: KeyboardEvent) {
  notificationService.playKeyClick(e.key, activeTutorialProfile.value);
  markChecklist('test_typing');
}

function onTypingInput() {
  typingKeystrokes.value++;

  const now = Date.now();
  if (!typingStartTime) {
    typingStartTime = now;
  }

  const elapsedMinutes = Math.max(0.01, (now - typingStartTime) / 60000);
  const words = typingInput.value.length / 5;
  typingWpm.value = Math.min(180, Math.round(words / elapsedMinutes));
}

function testKeySound() {
  notificationService.playKeyboardProfileSound(activeTutorialProfile.value);
  markChecklist('test_audio');
}

function testSpaceSound() {
  notificationService.playSpacebarSound(activeTutorialProfile.value);
  markChecklist('test_audio');
}

function testEnterSound() {
  notificationService.playEnterSound(activeTutorialProfile.value);
  markChecklist('test_audio');
}

function testBackspaceSound() {
  notificationService.playBackspaceSound(activeTutorialProfile.value);
  markChecklist('test_audio');
}

function testStreakSound() {
  notificationService.playComboMilestone(50);
  markChecklist('test_audio');
}

function testBoopSound() {
  notificationService.playMascotBoop();
  markChecklist('test_audio');
}

function testStretchAlert() {
  notificationService.playStretchZenChime();
}

function resetTypingStats() {
  typingInput.value = '';
  typingKeystrokes.value = 0;
  typingWpm.value = 0;
  typingStartTime = null;
}

// ============================================================================
// HOOK STATUS
// ============================================================================
const hookInstalled = ref(false);

async function checkHook() {
  try {
    const res = await native.getHookStatus();
    hookInstalled.value = res.installed && res.upToDate;
  } catch {
    hookInstalled.value = false;
  }
}

async function toggleHook() {
  try {
    if (hookInstalled.value) {
      await native.uninstallAntigravityHook();
    } else {
      await native.installAntigravityHook();
    }
    await checkHook();
    markChecklist('check_hook');
  } catch (err) {
    console.error('Failed to toggle hook:', err);
  }
}

// ============================================================================
// CHECKLIST PERSISTENCE
// ============================================================================
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  completed: boolean;
}

const CHECKLIST_STORAGE_KEY = 'devpet:checklist:v1';

const defaultChecklist: ChecklistItem[] = [
  {
    id: 'welcome_tour',
    title: 'Complete Onboarding Wizard or Spotlight Tour',
    description: 'Learn the core philosophy and features of your desktop fleet.',
    tag: 'ONBOARDING',
    completed: true,
  },
  {
    id: 'try_playground',
    title: 'Test Live Mascot Reactions in Pet Playground',
    description: 'Switch states on Codi, change Pomodoro sprint phases, or test audio.',
    tag: 'PLAYGROUND',
    completed: false,
  },
  {
    id: 'test_audio',
    title: 'Audition Synthesized Web Audio Chimes',
    description: 'Test the agent victory arpeggio, focus gong, and mechanical switch sounds.',
    tag: 'AUDIO',
    completed: false,
  },
  {
    id: 'test_typing',
    title: 'Try Interactive Keystroke Arena with Moki',
    description: 'Type in the interactive arena to test real-time WPM calculation and clacks.',
    tag: 'TYPING',
    completed: false,
  },
  {
    id: 'pet_affection',
    title: 'Pet / Scratch a Mascot for Affection',
    description: 'Scratch a pet to hear affectionate purrs and see floating heart particles.',
    tag: 'INTERACTION',
    completed: false,
  },
  {
    id: 'check_hook',
    title: 'Inspect or Install Coding Agent Hook',
    description: 'Check Google Antigravity hook integration for zero-latency turn alerts.',
    tag: 'INTEGRATION',
    completed: false,
  },
];

const checklistItems = ref<ChecklistItem[]>([]);

function loadChecklist() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      checklistItems.value = defaultChecklist.map((def) => {
        const found = saved.find((s: ChecklistItem) => s.id === def.id);
        return found ? { ...def, completed: found.completed } : def;
      });
      return;
    }
  } catch {}
  checklistItems.value = [...defaultChecklist];
}

function saveChecklist() {
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistItems.value));
  } catch {}
}

function toggleChecklistItem(id: string) {
  const item = checklistItems.value.find((i) => i.id === id);
  if (item) {
    item.completed = !item.completed;
    saveChecklist();
    if (item.completed) {
      notificationService.playChime();
    }
  }
}

function markChecklist(id: string) {
  const item = checklistItems.value.find((i) => i.id === id);
  if (item && !item.completed) {
    item.completed = true;
    saveChecklist();
  }
}

function resetChecklist() {
  checklistItems.value = defaultChecklist.map((i) => ({ ...i, completed: false }));
  saveChecklist();
}

const completedChecklistCount = computed(() => {
  return checklistItems.value.filter((i) => i.completed).length;
});

const checklistPercent = computed(() => {
  if (checklistItems.value.length === 0) return 0;
  return Math.round((completedChecklistCount.value / checklistItems.value.length) * 100);
});

onMounted(async () => {
  loadChecklist();
  await checkHook();
  startPlaygroundTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (wpmDecayInterval) clearInterval(wpmDecayInterval);
});
</script>

<style scoped>
.tutorials-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ==========================================================================
   Hero Banner
   ========================================================================== */
.tutorials-hero {
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(20, 22, 28, 0.8) 100%);
  border: 1px solid rgba(88, 101, 242, 0.25);
  border-radius: 18px;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.tutorials-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(88, 101, 242, 0.2);
  border: 1px solid rgba(88, 101, 242, 0.4);
  color: #818cf8;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.tutorials-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.tutorials-subtitle {
  font-size: 13px;
  color: #b5bac1;
  max-width: 650px;
  line-height: 1.5;
  margin: 0;
}

.tutorials-header-actions {
  display: flex;
  gap: 12px;
}

.hero-action-btn {
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 18px;
  transition: all 0.2s ease;
}

.hero-action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.hero-action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.hero-action-btn.primary {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.35);
}

.hero-action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(88, 101, 242, 0.5);
}

/* ==========================================================================
   Navigation Bar
   ========================================================================== */
.tutorials-nav-bar {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tut-nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #949ba4;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tut-nav-tab:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.tut-nav-tab.active {
  background: rgba(88, 101, 242, 0.18);
  border-color: rgba(88, 101, 242, 0.4);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(88, 101, 242, 0.2);
}

.checklist-count-chip {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #818cf8;
}

/* ==========================================================================
   Playground View
   ========================================================================== */
.mascot-selector-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.mascot-select-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 18px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.mascot-select-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.m-card-avatar {
  font-size: 26px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
}

.m-card-meta strong {
  font-size: 14px;
  color: #ffffff;
  display: block;
}

.m-card-meta span {
  font-size: 11px;
  color: #949ba4;
}

.mascot-select-card.codi.active {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.12);
}

.mascot-select-card.momo.active {
  border-color: #f43f5e;
  background: rgba(244, 63, 94, 0.12);
}

.mascot-select-card.moki.active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}

.mascot-playground-box {
  background: rgba(20, 22, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
}

.playground-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: start;
}

.mascot-stage {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 280px;
  justify-content: center;
}

.stage-tag {
  position: absolute;
  top: 12px;
  left: 14px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #818cf8;
  background: rgba(88, 101, 242, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
}

.pet-wrapper {
  margin: 20px 0;
  transform: scale(1.15);
}

.stage-tip {
  font-size: 11px;
  color: #949ba4;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 12px;
  border-radius: 8px;
  margin-top: 10px;
}

.live-wpm-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 6px 16px;
  border-radius: 12px;
}

.wpm-val {
  font-size: 22px;
  font-weight: 800;
  color: #fbbf24;
}

.wpm-lbl {
  font-size: 9px;
  font-weight: 700;
  color: #949ba4;
}

.mascot-controls-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.panel-header p {
  font-size: 13px;
  color: #949ba4;
  margin: 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  font-size: 12px;
  font-weight: 700;
  color: #dbdee1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.group-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #949ba4;
  cursor: pointer;
}

.mini-toggle input {
  accent-color: #5865f2;
}

.state-buttons-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.state-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 12px;
  color: #dbdee1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.state-btn.active {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.2);
  color: #ffffff;
  box-shadow: 0 0 10px rgba(88, 101, 242, 0.3);
}

.quip-input-row {
  display: flex;
  gap: 8px;
}

.quip-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 14px;
  color: #ffffff;
  font-size: 12px;
  outline: none;
}

.quip-input:focus {
  border-color: #5865f2;
}

.random-quip-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
}

.random-quip-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.action-buttons-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pg-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pg-action-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
}

.pg-action-btn.chime {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.15);
}

.pg-action-btn.purr {
  border-color: #f43f5e;
  background: rgba(244, 63, 94, 0.15);
}

.pg-action-btn.focus-snd {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

.pg-action-btn.break-snd {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.pg-action-btn.key-snd {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}

.pg-action-btn.space-snd {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

.pg-action-btn.enter-snd {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.15);
}

.pg-action-btn.backspace-snd {
  border-color: #f43f5e;
  background: rgba(244, 63, 94, 0.15);
}

.pg-action-btn.streak-snd {
  border-color: #eab308;
  background: rgba(234, 179, 8, 0.15);
}

.pg-action-btn.boop-snd {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.15);
}

.profile-pills-row {
  flex-wrap: wrap;
}

.profile-pill-btn {
  font-size: 11px;
  padding: 6px 12px;
}

.profile-pill-btn.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.25);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.35);
  color: #ffffff;
}

/* Momo Phase controls */
.phase-buttons-row {
  display: flex;
  gap: 10px;
}

.phase-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px;
  color: #b5bac1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.phase-btn.active.focus {
  background: rgba(244, 63, 94, 0.18);
  border-color: #f43f5e;
  color: #ffffff;
}

.phase-btn.active.break,
.phase-btn.active.long-break {
  background: rgba(34, 197, 94, 0.18);
  border-color: #22c55e;
  color: #ffffff;
}

.timer-simulation-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock-display {
  font-family: monospace;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.35);
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timer-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.timer-action-btn.toggle {
  background: #5865f2;
  border-color: #5865f2;
}

/* Moki typing area */
.typing-stats-text {
  font-size: 11px;
  color: #949ba4;
}

.typing-stats-text strong {
  color: #fbbf24;
}

.interactive-typing-area {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 12px;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.interactive-typing-area:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
}

/* ==========================================================================
   Desktop Companion Guide
   ========================================================================== */
.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.guide-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.g-card-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-card h4 {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.guide-card p {
  font-size: 12px;
  color: #949ba4;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.g-card-chip {
  font-size: 10px;
  font-weight: 700;
  color: #818cf8;
  background: rgba(88, 101, 242, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
}

/* ==========================================================================
   IDE Hook Setup
   ========================================================================== */
.hook-status-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.hook-status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hook-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.hook-icon-box.ok {
  background: rgba(34, 197, 94, 0.15);
}

.hook-status-left h3 {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.hook-status-left p {
  font-size: 12px;
  color: #949ba4;
  margin: 0;
}

.hook-toggle-btn {
  background: #5865f2;
  border: none;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hook-toggle-btn.installed {
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid #22c55e;
  color: #86efac;
}

.hook-walkthrough-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.walkthrough-step {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(88, 101, 242, 0.2);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.walkthrough-step h4 {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.walkthrough-step p {
  font-size: 12px;
  color: #949ba4;
  line-height: 1.5;
  margin: 0;
}

.hook-lifecycle-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  color: #dbdee1;
}

.hl-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.hl-dot.thinking { background: #38bdf8; }
.hl-dot.working { background: #f59e0b; }
.hl-dot.waiting { background: #a855f7; }
.hl-dot.completed { background: #22c55e; }

/* ==========================================================================
   Checklist Section
   ========================================================================== */
.checklist-hero-card {
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(20, 22, 28, 0.8) 100%);
  border: 1px solid rgba(88, 101, 242, 0.25);
  border-radius: 16px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.checklist-progress-box {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(88, 101, 242, 0.2);
  border: 3px solid #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-ring-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.percent-val {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.percent-lbl {
  font-size: 8px;
  font-weight: 700;
  color: #818cf8;
}

.checklist-hero-text {
  flex: 1;
}

.checklist-hero-text h3 {
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.checklist-hero-text p {
  font-size: 12px;
  color: #b5bac1;
  margin: 0 0 12px 0;
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #5865f2, #22c55e);
  transition: width 0.3s ease;
}

.badge-unlocked {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  color: #86efac;
  letter-spacing: 0.05em;
  gap: 4px;
}

.trophy {
  font-size: 22px;
}

.checklist-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checklist-item-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.checklist-item-card.checked {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.3);
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  transition: all 0.2s ease;
}

.checklist-item-card.checked .custom-checkbox {
  background: #22c55e;
  border-color: #22c55e;
}

.item-content {
  flex: 1;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.checklist-item-card.checked .item-title {
  color: #949ba4;
  text-decoration: line-through;
}

.item-tag {
  font-size: 9px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.08);
  color: #818cf8;
  padding: 2px 6px;
  border-radius: 4px;
}

.item-desc {
  font-size: 12px;
  color: #949ba4;
  margin: 0;
}

.checklist-footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.reset-checklist-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #949ba4;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  cursor: pointer;
}

.reset-checklist-btn:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
