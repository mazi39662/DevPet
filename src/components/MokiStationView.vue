<template>
  <div class="moki-station-container">
    <!-- Top Hero Banner: Moki Status & Live Speedometer -->
    <div class="moki-hero-banner">
      <div class="hero-left">
        <div class="hero-badge">
          <span class="badge-dot" :class="state.speedTier"></span>
          <span>KEYBOARD & WELLNESS ARCADE</span>
        </div>
        <h2 class="hero-title">Moki Station</h2>
        <p class="hero-sub">
          Your idle desktop typing companion! Spawns letter particle bursts, tracks typing speed, expresses playful emotions, and keeps floating sticky notes & quick checklists handy.
        </p>

        <div class="hero-stats-row">
          <div class="h-stat-card">
            <span class="stat-label">CURRENT SPEED</span>
            <div class="stat-main">
              <span class="stat-num">{{ state.currentWpm }}</span>
              <span class="stat-unit">WPM</span>
              <span class="stat-tier-tag" :class="state.speedTier">{{ state.speedTier.toUpperCase() }}</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">TODAY'S PEAK</span>
            <div class="stat-main">
              <span class="stat-num">{{ state.peakWpm }}</span>
              <span class="stat-unit">WPM</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">KEYSTROKES</span>
            <div class="stat-main">
              <span class="stat-num font-mono">{{ state.totalKeystrokes.toLocaleString() }}</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">MAX COMBO</span>
            <div class="stat-main">
              <span class="stat-num combo-num">x{{ state.maxCombo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mascot Live Preview in Hero -->
      <div class="hero-mascot-preview">
        <MokiPet :interactive="true" :sound-enabled="soundEnabled" />
      </div>
    </div>

    <!-- Main Grid: 2 Columns -->
    <div class="moki-grid">
      <!-- COLUMN 1: Typing Sandbox & Prolonged Usage Stretch Coach -->
      <div class="grid-col left-col">
        <!-- Panel 1: Interactive Keystroke & Particle Playground -->
        <div class="moki-card playground-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon">⌨️</span>
              <div>
                <h3 class="card-title">Typing Sandbox & Particle Lab</h3>
                <p class="card-desc">Type anything below to see letter particles fly, test WPM, and clack RGB keys!</p>
              </div>
            </div>
            <div class="live-combo-pill" v-if="state.combo > 0">
              <span>🔥 COMBO x{{ state.combo }}</span>
            </div>
          </div>

          <div class="sandbox-input-area">
            <textarea
              v-model="sandboxText"
              rows="3"
              class="sandbox-textarea"
              placeholder="Start clacking your keyboard here! Letters will burst as floating particles... ✨"
              @keydown="onSandboxKeydown"
            ></textarea>

            <div class="sandbox-actions">
              <button class="action-btn-clean" @click="sandboxText = ''" :disabled="!sandboxText">
                Clear Text
              </button>
              <div class="sandbox-hint">
                <span>Tip: Global keyboard hook also detects typing in any application!</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 2: Moki Emotion & Animation Laboratory -->
        <div class="moki-card emotion-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon">🎭</span>
              <div>
                <h3 class="card-title">Moki Emotion & Reaction Showcase</h3>
                <p class="card-desc">Click any emotion to test Moki's dynamic facial expressions and body animations!</p>
              </div>
            </div>
          </div>

          <div class="emotions-preview-grid">
            <button class="emotion-trigger-btn" @click="testMokiEmotion('happy')">
              <span class="e-icon">✨</span>
              <span class="e-label">Happy</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('typing')">
              <span class="e-icon">💻</span>
              <span class="e-label">Typing Focus</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('turbo')">
              <span class="e-icon">🔥</span>
              <span class="e-label">Turbo 60+ WPM</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('thinking')">
              <span class="e-icon">🧠</span>
              <span class="e-label">Thinking</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('waiting')">
              <span class="e-icon">⏳</span>
              <span class="e-label">Waiting</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('celebrating')">
              <span class="e-icon">🎉</span>
              <span class="e-label">Victory Jump</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('error')">
              <span class="e-icon">⚠️</span>
              <span class="e-label">Panic / Bug</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('sleepy')">
              <span class="e-icon">💤</span>
              <span class="e-label">Sleepy</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('stretching')">
              <span class="e-icon">🌸</span>
              <span class="e-label">Cat Stretch</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('blissful')">
              <span class="e-icon">💖</span>
              <span class="e-label">Pet / Purr</span>
            </button>
            <button class="emotion-trigger-btn" @click="testMokiEmotion('boop')">
              <span class="e-icon">🐾</span>
              <span class="e-label">Nose Boop</span>
            </button>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: Quick Tasks Checklist & Sticky Notes -->
      <div class="grid-col right-col">
        <!-- Panel 3: Quick Tasks & Checklist -->
        <div class="moki-card tasks-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon">✅</span>
              <div>
                <h3 class="card-title">Quick Tasks & Checklist</h3>
                <p class="card-desc">Fast checklist with celebratory fanfare & Moki victory jumps!</p>
              </div>
            </div>
            <div class="tasks-counter">
              <span>{{ completedTasksCount }}/{{ state.tasks.length }} DONE</span>
            </div>
          </div>

          <!-- Task Fast Input -->
          <form @submit.prevent="addNewTask" class="new-task-form">
            <input
              v-model="newTaskText"
              type="text"
              placeholder="+ Add a quick task & press Enter..."
              class="task-input"
            />
            <select v-model="newTaskPriority" class="task-prio-select">
              <option value="normal">Normal</option>
              <option value="high">High ⚡</option>
              <option value="urgent">Urgent 🔥</option>
            </select>
            <button type="submit" class="task-add-btn" :disabled="!newTaskText.trim()">Add</button>
          </form>

          <!-- Task List -->
          <div class="tasks-scroll-list">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="task-row-item"
              :class="{ completed: task.completed, [task.priority]: true }"
            >
              <label class="task-checkbox-label">
                <input
                  type="checkbox"
                  class="task-chk"
                  :checked="task.completed"
                  @change="toggleTask(task.id)"
                />
                <span class="task-chk-custom"></span>
              </label>

              <span class="task-text-content">{{ task.text }}</span>

              <span class="prio-tag" :class="task.priority">{{ task.priority }}</span>

              <button class="task-del-btn" @click="deleteTask(task.id)" title="Delete task">
                ✕
              </button>
            </div>

            <div v-if="state.tasks.length === 0" class="tasks-empty-state">
              <span>🎉 All tasks cleared! Add your next mini-goal above.</span>
            </div>
          </div>

          <!-- Bottom Task Filters -->
          <div class="tasks-footer">
            <div class="filter-pills">
              <button
                class="f-pill"
                :class="{ active: taskFilter === 'all' }"
                @click="taskFilter = 'all'"
              >
                All ({{ state.tasks.length }})
              </button>
              <button
                class="f-pill"
                :class="{ active: taskFilter === 'active' }"
                @click="taskFilter = 'active'"
              >
                Active ({{ pendingTasksCount }})
              </button>
              <button
                class="f-pill"
                :class="{ active: taskFilter === 'completed' }"
                @click="taskFilter = 'completed'"
              >
                Done ({{ completedTasksCount }})
              </button>
            </div>

            <button
              v-if="completedTasksCount > 0"
              class="clear-completed-btn"
              @click="clearCompleted"
            >
              Clear Done
            </button>
          </div>
        </div>

        <!-- Panel 4: Colorful Sticky Notes -->
        <div class="moki-card notes-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-icon">📌</span>
              <div>
                <h3 class="card-title">Sticky Notes</h3>
                <p class="card-desc">Draggable colorful desktop stickies for quick scratchpads</p>
              </div>
            </div>
            <div class="notes-add-actions">
              <button class="add-note-btn yellow" @click="createNote('yellow')" title="Add Yellow Sticky">+</button>
              <button class="add-note-btn pink" @click="createNote('pink')" title="Add Pink Sticky">+</button>
              <button class="add-note-btn mint" @click="createNote('mint')" title="Add Mint Sticky">+</button>
              <button class="add-note-btn cyan" @click="createNote('cyan')" title="Add Cyan Sticky">+</button>
              <button class="add-note-btn lavender" @click="createNote('lavender')" title="Add Lavender Sticky">+</button>
            </div>
          </div>

          <!-- Notes Grid -->
          <div class="sticky-notes-grid">
            <div
              v-for="note in state.stickyNotes"
              :key="note.id"
              class="sticky-note-card"
              :class="note.color"
            >
              <div class="sticky-note-top">
                <span class="sticky-pin" :class="{ pinned: note.pinned }" @click="togglePinNote(note)">
                  📌
                </span>
                <div class="sticky-color-dots">
                  <span
                    v-for="c in (['yellow', 'pink', 'mint', 'cyan', 'lavender'] as const)"
                    :key="c"
                    class="color-dot"
                    :class="[c, { active: note.color === c }]"
                    @click="changeNoteColor(note, c)"
                  ></span>
                </div>
                <button class="sticky-del" @click="deleteNote(note.id)">✕</button>
              </div>

              <textarea
                v-model="note.content"
                class="sticky-content-textarea"
                rows="4"
                placeholder="Write your note here..."
                @blur="updateNote(note)"
              ></textarea>
            </div>

            <div v-if="state.stickyNotes.length === 0" class="notes-empty-state">
              <span>No sticky notes yet. Click any color above to pin a note! 📌</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MokiPet from './MokiPet.vue';
import { mokiCoordinator } from '../services/mokiCoordinator';
import type { MokiStickyNote } from '../types/moki';

defineProps<{
  soundEnabled: boolean;
}>();

const state = mokiCoordinator.getState();

const sandboxText = ref('');
const newTaskText = ref('');
const newTaskPriority = ref<'normal' | 'high' | 'urgent'>('normal');
const taskFilter = ref<'all' | 'active' | 'completed'>('all');

function testMokiEmotion(emotion: string) {
  switch (emotion) {
    case 'happy':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 4000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Moki is so happy typing with you! ✨🐾',
        durationMs: 3500,
      });
      break;
    case 'typing':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'typing', durationMs: 4500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Focus mode locked in! Coding frenzy! 💻⚡',
        durationMs: 3500,
      });
      break;
    case 'turbo':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'turbo', durationMs: 4500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'TURBO SPEED UNLOCKED! 🚀⚡ 85+ WPM!',
        durationMs: 4000,
      });
      break;
    case 'thinking':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'thinking', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Pondering deep algorithms... 🧠💡',
        durationMs: 4000,
      });
      break;
    case 'waiting':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'waiting', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Waiting for your action! Ready when you are! ⏳🐾',
        durationMs: 4000,
      });
      break;
    case 'celebrating':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'celebrating', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Task complete! High five victory! 🎉🐾',
        durationMs: 4000,
      });
      break;
    case 'error':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'error', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Bug detected! Don\'t panic, we can fix it! ⚠️⚡',
        durationMs: 4000,
      });
      break;
    case 'sleepy':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'sleepy', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Zzz... Snoozing on the keyboard... 💤',
        durationMs: 3500,
      });
      break;
    case 'stretching':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'stretching', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Cat stretch break! Stretch paws & breathe! 🌸🐾',
        durationMs: 3500,
      });
      break;
    case 'blissful':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'blissful', durationMs: 4000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Purrrrr~ that feels wonderful! 💕✨',
        durationMs: 3500,
      });
      break;
    case 'boop':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle' });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Hehe you booped my snoot! 🐾❤️',
        durationMs: 3000,
      });
      break;
  }
}

function onSandboxKeydown(e: KeyboardEvent) {
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  mokiCoordinator.recordKeystroke(key);
}

// Tasks Filtering
const completedTasksCount = computed(() => state.tasks.filter((t) => t.completed).length);
const pendingTasksCount = computed(() => state.tasks.filter((t) => !t.completed).length);

const filteredTasks = computed(() => {
  if (taskFilter.value === 'active') return state.tasks.filter((t) => !t.completed);
  if (taskFilter.value === 'completed') return state.tasks.filter((t) => t.completed);
  return state.tasks;
});

// Tasks Actions
function addNewTask() {
  if (!newTaskText.value.trim()) return;
  mokiCoordinator.dispatchAction({
    type: 'add-task',
    text: newTaskText.value.trim(),
    priority: newTaskPriority.value,
  });
  newTaskText.value = '';
}

function toggleTask(id: string) {
  mokiCoordinator.dispatchAction({ type: 'toggle-task', id });
}

function deleteTask(id: string) {
  mokiCoordinator.dispatchAction({ type: 'delete-task', id });
}

function clearCompleted() {
  mokiCoordinator.dispatchAction({ type: 'clear-completed-tasks' });
}

// Sticky Notes Actions
function createNote(color: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender') {
  mokiCoordinator.dispatchAction({
    type: 'add-sticky-note',
    content: 'Quick thought...',
    color,
  });
}

function updateNote(note: MokiStickyNote) {
  mokiCoordinator.dispatchAction({
    type: 'update-sticky-note',
    id: note.id,
    content: note.content,
    color: note.color,
    pinned: note.pinned,
  });
}

function changeNoteColor(note: MokiStickyNote, color: 'yellow' | 'pink' | 'mint' | 'cyan' | 'lavender') {
  note.color = color;
  updateNote(note);
}

function togglePinNote(note: MokiStickyNote) {
  note.pinned = !note.pinned;
  updateNote(note);
}

function deleteNote(id: string) {
  mokiCoordinator.dispatchAction({ type: 'delete-sticky-note', id });
}
</script>

<style scoped>
.moki-station-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero Banner */
.moki-hero-banner {
  background: linear-gradient(135deg, #1e1f22 0%, #2b2d31 100%);
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.hero-left {
  max-width: 680px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #fdba74;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}
.badge-dot.turbo { background: #f97316; box-shadow: 0 0 8px #f97316; }
.badge-dot.godspeed { background: #ec4899; box-shadow: 0 0 10px #ec4899; }

.hero-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
}

.hero-sub {
  margin: 6px 0 16px;
  font-size: 13px;
  color: #949ba4;
  line-height: 1.5;
}

.hero-stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.h-stat-card {
  background: #111214;
  border: 1px solid #383a40;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 110px;
}

.stat-label {
  font-size: 10px;
  font-weight: 800;
  color: #949ba4;
  letter-spacing: 0.5px;
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.stat-num {
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
}

.stat-unit {
  font-size: 11px;
  color: #949ba4;
  font-weight: 700;
}

.stat-tier-tag {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: #313338;
  color: #dbdee1;
}
.stat-tier-tag.turbo { background: #ea580c; color: #ffffff; }
.stat-tier-tag.godspeed { background: #db2777; color: #ffffff; }

.combo-num {
  color: #f43f5e;
  text-shadow: 0 0 8px rgba(244, 63, 94, 0.4);
}

.hero-mascot-preview {
  width: 170px;
  height: 170px;
  position: relative;
}

/* 2-Column Grid */
.moki-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.grid-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.moki-card {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 22px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.card-desc {
  margin: 2px 0 0;
  font-size: 11px;
  color: #949ba4;
}

/* Panel 1: Playground */
.sandbox-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #111214;
  border: 1.5px solid #383a40;
  border-radius: 10px;
  padding: 12px 14px;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
}
.sandbox-textarea:focus {
  border-color: #fdba74;
  box-shadow: 0 0 12px rgba(253, 186, 116, 0.25);
}

.sandbox-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.action-btn-clean {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #949ba4;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.action-btn-clean:hover:not(:disabled) {
  color: #ffffff;
  background: #313338;
}

.sandbox-hint {
  font-size: 11px;
  color: #949ba4;
}

.live-combo-pill {
  background: linear-gradient(135deg, #f43f5e 0%, #ea580c 100%);
  color: #ffffff;
  font-weight: 900;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 14px;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
  animation: pulseCombo 0.7s infinite alternate;
}
@keyframes pulseCombo {
  0% { transform: scale(0.96); }
  100% { transform: scale(1.04); }
}

/* Panel 2: Emotion Showcase */
.emotions-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.emotion-trigger-btn {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 10px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emotion-trigger-btn:hover {
  background: #313338;
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.e-icon {
  font-size: 22px;
}

.e-label {
  font-size: 11px;
  font-weight: 700;
  color: #dbdee1;
  text-align: center;
}

/* Panel 3: Tasks Checklist */
.tasks-counter {
  font-size: 11px;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 3px 8px;
  border-radius: 6px;
}

.new-task-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.task-input {
  flex: 1;
  background: #111214;
  border: 1px solid #383a40;
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 12px;
}
.task-prio-select {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #dbdee1;
  border-radius: 8px;
  padding: 0 8px;
  font-size: 11px;
}
.task-add-btn {
  background: #5865f2;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  padding: 0 14px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.task-add-btn:hover:not(:disabled) {
  background: #4752c4;
}

.tasks-scroll-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.task-row-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.15s ease;
}
.task-row-item:hover {
  border-color: #4e5058;
}
.task-row-item.completed {
  opacity: 0.6;
}
.task-row-item.completed .task-text-content {
  text-decoration: line-through;
  color: #949ba4;
}

.task-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.task-chk {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
  cursor: pointer;
}

.task-text-content {
  flex: 1;
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
}

.prio-tag {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.prio-tag.normal { background: #313338; color: #949ba4; }
.prio-tag.high { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.prio-tag.urgent { background: rgba(244, 63, 94, 0.2); color: #f43f5e; }

.task-del-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 12px;
}
.task-del-btn:hover { color: #f43f5e; }

.tasks-empty-state {
  font-size: 12px;
  color: #949ba4;
  text-align: center;
  padding: 20px 0;
}

.tasks-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #313338;
  padding-top: 10px;
}
.filter-pills { display: flex; gap: 4px; }
.f-pill {
  background: transparent;
  border: none;
  font-size: 11px;
  color: #949ba4;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}
.f-pill.active { background: #313338; color: #ffffff; }
.clear-completed-btn {
  background: transparent;
  border: none;
  font-size: 11px;
  color: #f43f5e;
  cursor: pointer;
  font-weight: 700;
}

/* Panel 4: Sticky Notes */
.notes-add-actions {
  display: flex;
  gap: 5px;
}
.add-note-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-note-btn.yellow { background: #fef08a; color: #713f12; }
.add-note-btn.pink { background: #fbcfe8; color: #831843; }
.add-note-btn.mint { background: #a7f3d0; color: #064e3b; }
.add-note-btn.cyan { background: #bae6fd; color: #0c4a6e; }
.add-note-btn.lavender { background: #e9d5ff; color: #581c87; }

.sticky-notes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sticky-note-card {
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
.sticky-note-card:hover {
  transform: translateY(-2px);
}
.sticky-note-card.yellow { background: #fef08a; color: #713f12; }
.sticky-note-card.pink { background: #fbcfe8; color: #831843; }
.sticky-note-card.mint { background: #a7f3d0; color: #064e3b; }
.sticky-note-card.cyan { background: #bae6fd; color: #0c4a6e; }
.sticky-note-card.lavender { background: #e9d5ff; color: #581c87; }

.sticky-note-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.sticky-pin {
  cursor: pointer;
  opacity: 0.6;
  font-size: 12px;
}
.sticky-pin.pinned {
  opacity: 1;
}

.sticky-color-dots {
  display: flex;
  gap: 3px;
}
.color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.5;
}
.color-dot.active { opacity: 1; transform: scale(1.2); }
.color-dot.yellow { background: #eab308; }
.color-dot.pink { background: #ec4899; }
.color-dot.mint { background: #10b981; }
.color-dot.cyan { background: #0ea5e9; }
.color-dot.lavender { background: #a855f7; }

.sticky-del {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 11px;
  opacity: 0.6;
  color: inherit;
}
.sticky-del:hover { opacity: 1; }

.sticky-content-textarea {
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 11px;
  color: inherit;
  resize: vertical;
  outline: none;
  line-height: 1.4;
}

.notes-empty-state {
  grid-column: span 2;
  text-align: center;
  font-size: 12px;
  color: #949ba4;
  padding: 24px 0;
}
</style>
