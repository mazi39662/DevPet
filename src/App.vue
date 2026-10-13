<template>
  <div class="dashboard-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="brand">
        <div class="brand-avatar">
          <span class="pixel-pet-icon">🐾</span>
        </div>
        <div>
          <h1 class="brand-title">DevPet</h1>
          <p class="brand-subtitle">Codi (Coding) & Momo (Pomodoro)</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'pomodoro' }"
          @click="currentTab = 'pomodoro'"
        >
          <span class="tab-icon">🍅</span>
          Pomodoro Focus
          <span v-if="pomoState.status === 'running'" class="tab-badge pulse">
            {{ formatMmSs(pomoState.timeRemaining) }}
          </span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'monitor' }"
          @click="currentTab = 'monitor'"
        >
          <span class="tab-icon">🤖</span>
          Codi Monitor
          <span class="tab-badge" :class="currentStatus.status">
            {{ currentStatus.status }}
          </span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'pets' }"
          @click="currentTab = 'pets'"
        >
          <span class="tab-icon">🐾</span>
          Pet Manager
          <span class="tab-count">{{ activePetsCount }} Active</span>
        </button>
      </nav>

      <!-- Header Quick Pet Toggles -->
      <div class="header-actions">
        <div class="header-toggles">
          <button
            class="pet-pill-btn"
            :class="{ active: agentCompanionVisible }"
            @click="toggleAgentCompanion"
            title="Toggle Codi (Coding Pet) on Desktop"
          >
            <span class="pill-ico">🐾</span>
            <span class="pill-name">Codi</span>
            <span class="pill-toggle-dot"></span>
          </button>
          <button
            class="pet-pill-btn pomo"
            :class="{ active: pomodoroCompanionVisible }"
            @click="togglePomodoroCompanion"
            title="Toggle Momo (Pomodoro Pet) on Desktop"
          >
            <span class="pill-ico">🍅</span>
            <span class="pill-name">Momo</span>
            <span class="pill-toggle-dot"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Tabs -->
    <main class="dashboard-main">
      <!-- ======================================================== -->
      <!-- TAB 1: POMODORO FOCUS TRACKER                            -->
      <!-- ======================================================== -->
      <section v-if="currentTab === 'pomodoro'" class="tab-content pomodoro-view">
        <div class="pomodoro-grid">
          <!-- Left: Focus Timer Hero & Controls -->
          <div class="card pomo-hero-card">
            <!-- Phase selector tabs -->
            <div class="phase-selector">
              <button
                class="phase-btn"
                :class="{ active: pomoState.phase === 'focus' }"
                @click="switchPhase('focus')"
              >
                🍅 Focus Work
                <span class="phase-min">({{ settings.pomodoroConfig.focusMinutes }}m)</span>
              </button>
              <button
                class="phase-btn"
                :class="{ active: pomoState.phase === 'break' }"
                @click="switchPhase('break')"
              >
                ☕ Break
                <span class="phase-min">({{ settings.pomodoroConfig.breakMinutes }}m)</span>
              </button>
            </div>

            <!-- Timer Clock Ring -->
            <div class="timer-clock-hero">
              <div class="clock-ring-wrapper">
                <svg class="clock-svg" viewBox="0 0 200 200">
                  <circle
                    class="clock-bg-ring"
                    cx="100"
                    cy="100"
                    r="88"
                  />
                  <circle
                    class="clock-progress-ring"
                    :class="[pomoState.phase, { pulsing: pomoState.status === 'running' }]"
                    cx="100"
                    cy="100"
                    r="88"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="clockDashOffset"
                  />
                </svg>

                <div class="clock-content">
                  <span class="phase-label">
                    {{ pomoState.phase === 'focus' ? 'Deep Work Session' : 'Break Time' }}
                  </span>
                  <span class="clock-digits">{{ formatMmSs(pomoState.timeRemaining) }}</span>
                  <span class="clock-status-tag" :class="pomoState.status">
                    <span class="status-dot"></span>
                    {{ pomoState.status === 'running' ? (pomoState.phase === 'focus' ? 'Deep Flow Active' : 'On Break') : (pomoState.status === 'paused' ? 'Paused' : 'Ready') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Primary Timer Controls -->
            <div class="timer-controls">
              <button
                class="btn btn-primary btn-lg play-btn"
                :class="{ running: pomoState.status === 'running' }"
                @click="togglePomodoroTimer"
              >
                <span class="ctrl-icon">{{ pomoState.status === 'running' ? '⏸' : '▶' }}</span>
                {{ pomoState.status === 'running' ? 'Pause' : (pomoState.phase === 'focus' ? 'Start Focus' : 'Start Break') }}
              </button>
              <button class="btn btn-secondary btn-md" @click="skipPomodoroPhase" title="Skip to next phase">
                ⏭ Skip
              </button>
              <button class="btn btn-outline btn-md" @click="resetPomodoroTimer" title="Reset current phase timer">
                ↺ Reset
              </button>
            </div>

            <!-- Duration Customizer Presets (Configurable!) -->
            <div class="duration-presets-panel">
              <div class="presets-header">
                <span class="presets-title">
                  {{ pomoState.phase === 'focus' ? 'Focus Work Duration' : 'Break Duration' }}:
                </span>
                <div class="stepper-controls">
                  <button class="step-btn" @click="stepDuration(-1)">−</button>
                  <span class="step-value">{{ activePhaseMinutes }} min</span>
                  <button class="step-btn" @click="stepDuration(1)">+</button>
                </div>
              </div>

              <!-- Quick preset chips -->
              <div class="preset-chips" v-if="pomoState.phase === 'focus'">
                <button
                  v-for="m in [15, 20, 25, 30, 45, 50, 60]"
                  :key="m"
                  class="chip"
                  :class="{ active: settings.pomodoroConfig.focusMinutes === m }"
                  @click="setDurationMinutes(m)"
                >
                  {{ m }}m
                </button>
              </div>
              <div class="preset-chips" v-else>
                <button
                  v-for="m in [3, 5, 10, 15]"
                  :key="m"
                  class="chip"
                  :class="{ active: settings.pomodoroConfig.breakMinutes === m }"
                  @click="setDurationMinutes(m)"
                >
                  {{ m }}m
                </button>
              </div>
            </div>

            <!-- Sprints Completed -->
            <div class="sprint-summary-box">
              <span class="sprint-label">Completed Focus Sessions:</span>
              <span class="sprint-count-val">{{ pomoState.completedSessions }} 🍅</span>
            </div>
          </div>

          <!-- Right: Momo Preview & Toggle -->
          <div class="pomodoro-sidebar">
            <div class="card pomo-pet-card">
              <div class="card-header">
                <h3 class="card-title">Momo (Pomodoro Pet)</h3>
                <span class="badge-tag" :class="{ running: pomoState.status === 'running' }">
                  {{ pomoState.status === 'running' ? (pomoState.phase === 'focus' ? 'Deep Work Typing' : 'Resting') : 'Idle' }}
                </span>
              </div>

              <div class="pet-showcase-row">
                <div class="pet-avatar-wrapper">
                  <PomodoroPet
                    :interactive="false"
                    :sound-enabled="settings.soundEnabled"
                  />
                </div>

                <div class="pet-showcase-meta">
                  <h4 class="meta-title">Momo</h4>
                  <p class="meta-desc">
                    Enters <strong>deep work / laptop typing mode</strong> during focus sessions, clacking away on a glowing laptop!
                  </p>

                  <div class="pet-desktop-toggle-row">
                    <span class="toggle-status-label">
                      Desktop Window: <strong>{{ pomodoroCompanionVisible ? 'On Desktop' : 'Hidden / Removed' }}</strong>
                    </span>
                    <button
                      class="btn btn-sm"
                      :class="pomodoroCompanionVisible ? 'btn-danger' : 'btn-primary'"
                      @click="togglePomodoroCompanion"
                    >
                      {{ pomodoroCompanionVisible ? 'Remove Momo' : 'Add to Desktop' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Focus Preferences -->
            <div class="card settings-card">
              <div class="card-header">
                <h3 class="card-title">Focus Sound Preferences</h3>
              </div>
              <div class="settings-list">
                <label class="setting-toggle">
                  <div class="toggle-info">
                    <span class="toggle-label">Audio Chimes</span>
                    <span class="toggle-desc">Chimes on focus completion and break alerts</span>
                  </div>
                  <input type="checkbox" v-model="settings.soundEnabled" />
                </label>
                <div class="sound-test-row">
                  <button class="btn btn-xs btn-outline" @click="testFocusSound">
                    🔔 Test Focus Chime
                  </button>
                  <button class="btn btn-xs btn-outline" @click="testBreakSound">
                    🛎️ Test Break Bell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- TAB 2: CODI MONITOR (AGENT TRACKING)                     -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'monitor'" class="tab-content monitor-view">
        <div class="dashboard-grid">
          <!-- Left: Active Status & Codi Preview -->
          <section class="card status-hero-card">
            <div class="card-header">
              <h2 class="card-title">Codi — Coding Companion Status</h2>
              <span class="last-updated" v-if="lastUpdateTime">
                Updated {{ lastUpdateTime }}
              </span>
            </div>

            <div class="hero-body">
              <div class="hero-pet-preview">
                <CompanionPet
                  :status="currentStatus.status"
                  :label="currentStatus.detail"
                  agent-name="Codi"
                  :show-bubble="false"
                  :sound-enabled="settings.soundEnabled"
                />
              </div>

              <div class="hero-details">
                <div class="status-row">
                  <span class="label-muted">Active Agent:</span>
                  <span class="value-highlight">{{ activeAgentAdapter?.displayName || 'None' }}</span>
                </div>

                <div class="status-row">
                  <span class="label-muted">State:</span>
                  <StatusBadge :status="currentStatus.status" size="lg" />
                </div>

                <div class="status-row">
                  <span class="label-muted">Confidence:</span>
                  <span class="badge-confidence" :class="currentStatus.confidence">
                    {{ currentStatus.confidence }}
                  </span>
                </div>

                <div class="status-row">
                  <span class="label-muted">Source:</span>
                  <span class="source-text">{{ currentStatus.source }}</span>
                </div>

                <div class="detail-box" v-if="currentStatus.detail">
                  <span class="detail-label">Status Summary:</span>
                  <p class="detail-content">{{ currentStatus.detail }}</p>
                </div>
              </div>
            </div>

            <!-- Dev Simulator -->
            <div class="mock-simulator" v-if="isDevMode">
              <span class="mock-title">Dev Simulator (Local State Testing):</span>
              <div class="mock-buttons">
                <button
                  v-for="st in testStates"
                  :key="st"
                  class="mock-btn"
                  :class="{ active: currentStatus.status === st }"
                  @click="simulateState(st)"
                >
                  {{ st }}
                </button>
              </div>
            </div>
          </section>

          <!-- Right: Monitored Agents & System Integrations -->
          <section class="card agents-card">
            <div class="card-header">
              <h2 class="card-title">Coding Tool Integrations</h2>
              <button class="btn btn-sm btn-outline" @click="refreshAllIntegrations">
                Refresh
              </button>
            </div>

            <div class="agents-list">
              <div
                v-for="adapter in adapters"
                :key="adapter.id"
                class="agent-item"
                :class="{ active: activeAgentId === adapter.id }"
                @click="selectAgent(adapter.id)"
              >
                <div class="agent-item-top">
                  <div class="agent-name-group">
                    <span class="agent-title">{{ adapter.displayName }}</span>
                    <span
                      class="process-indicator"
                      :class="{ running: getApp(adapter.id)?.running }"
                      :title="getApp(adapter.id)?.running ? 'Process running' : 'Process not detected'"
                    >
                      {{ getApp(adapter.id)?.running ? 'App Open' : 'App Closed' }}
                    </span>
                  </div>
                  <StatusBadge :status="getStatus(adapter.id).status" size="sm" />
                </div>

                <p class="agent-integration-summary">
                  {{ adapter.getIntegrationState().summary }}
                </p>

                <div class="agent-controls" v-if="adapter.id === 'antigravity'">
                  <div v-if="antigravityHookInstalled" class="hook-status-tag success">
                    ✓ Hook Registered in ~/.gemini/config/hooks.json
                  </div>
                  <div v-else class="hook-status-tag warning">
                    ⚠ Hook Not Installed
                  </div>
                  <button
                    class="btn btn-xs"
                    :class="antigravityHookInstalled ? 'btn-danger' : 'btn-primary'"
                    @click.stop="toggleAntigravityHook"
                  >
                    {{ antigravityHookInstalled ? 'Uninstall Hook' : 'Install Hook' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Bottom-Left: Activity History -->
          <section class="card history-card">
            <div class="card-header">
              <h2 class="card-title">Recent Activity Feed</h2>
              <span class="count-badge">{{ history.length }} events</span>
            </div>

            <div class="history-list" v-if="history.length > 0">
              <div v-for="item in history" :key="item.id" class="history-item">
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                <span class="history-agent">{{ getAgentName(item.agentId) }}</span>
                <div class="history-transition">
                  <span class="transition-from" v-if="item.from">{{ item.from }}</span>
                  <span class="arrow" v-if="item.from">→</span>
                  <StatusBadge :status="item.to" size="sm" />
                </div>
                <span class="history-detail" :title="item.detail || ''">{{ item.detail || '—' }}</span>
              </div>
            </div>
            <div class="empty-state" v-else>
              <p>No status changes recorded yet.</p>
            </div>
          </section>

          <!-- Bottom-Right: Codi Preferences -->
          <section class="card settings-card">
            <div class="card-header">
              <h2 class="card-title">Codi Preferences</h2>
            </div>

            <div class="settings-list">
              <label class="setting-toggle">
                <div class="toggle-info">
                  <span class="toggle-label">Monitoring Active</span>
                  <span class="toggle-desc">Enable event listening and agent status updates</span>
                </div>
                <input type="checkbox" v-model="settings.monitoringEnabled" />
              </label>

              <label class="setting-toggle">
                <div class="toggle-info">
                  <span class="toggle-label">Completion Desktop Notifications</span>
                  <span class="toggle-desc">Show toast when an agent finishes its task</span>
                </div>
                <input type="checkbox" v-model="settings.notificationsEnabled" />
              </label>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-title-row">
                    <span class="toggle-label">Notification Audio Chime</span>
                    <button
                      type="button"
                      class="btn btn-xs btn-outline test-chime-btn"
                      @click="testChime"
                    >
                      🔊 Test Chime
                    </button>
                  </div>
                  <span class="toggle-desc">Play chime on task completion</span>
                </div>
                <input type="checkbox" v-model="settings.soundEnabled" />
              </div>
            </div>
          </section>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- TAB 3: PET MANAGER (ADD / REMOVE TOGGLES)                -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'pets'" class="tab-content pets-view">
        <div class="pets-manager-container">
          <div class="pets-header-banner">
            <div>
              <h2 class="banner-title">Desktop Companion Pet Manager</h2>
              <p class="banner-subtitle">
                Toggle which companion pet is added or removed from your desktop. Both pets can run side-by-side or individually.
              </p>
            </div>
            <div class="banner-summary-badge">
              {{ activePetsCount }} Pets Active
            </div>
          </div>

          <!-- Pet Cards Grid -->
          <div class="pet-cards-grid">
            <!-- PET 1: Codi (Coding Agent Pet) -->
            <div class="card pet-manager-card" :class="{ active: agentCompanionVisible }">
              <div class="manager-card-top">
                <div class="manager-preview-box">
                  <CompanionPet
                    :status="currentStatus.status"
                    :label="currentStatus.detail"
                    agent-name="Codi"
                    :show-bubble="false"
                    :sound-enabled="settings.soundEnabled"
                  />
                </div>

                <div class="manager-info">
                  <div class="manager-title-row">
                    <h3 class="manager-pet-name">🐾 Codi — Coding Pet Tracker</h3>
                    <span class="pet-active-badge" :class="agentCompanionVisible ? 'on' : 'off'">
                      {{ agentCompanionVisible ? 'On Desktop' : 'Removed / Hidden' }}
                    </span>
                  </div>
                  <p class="manager-pet-desc">
                    Monitors Antigravity, Codex & VS Code agent status. Displays live thinking, working (typing at laptop), waiting approvals, and celebratory chimes.
                  </p>

                  <div class="manager-status-pills">
                    <span class="mini-pill">Agent: {{ activeAgentAdapter?.displayName || 'Antigravity' }}</span>
                    <span class="mini-pill">State: {{ currentStatus.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Toggle Switch Controls -->
              <div class="manager-card-bottom">
                <div class="toggle-switch-wrapper">
                  <label class="switch-label">
                    <input
                      type="checkbox"
                      :checked="agentCompanionVisible"
                      @change="toggleAgentCompanion"
                    />
                    <span class="slider round"></span>
                  </label>
                  <span class="switch-text">
                    {{ agentCompanionVisible ? 'Added to Desktop' : 'Removed from Desktop' }}
                  </span>
                </div>

                <div class="manager-btn-actions">
                  <button class="btn btn-sm btn-outline" @click="testChime">
                    🔊 Test Chime
                  </button>
                  <button class="btn btn-sm btn-primary" @click="focusAgentApp">
                    🚀 Focus Agent
                  </button>
                </div>
              </div>
            </div>

            <!-- PET 2: Momo (Pomodoro Pet) -->
            <div class="card pet-manager-card" :class="{ active: pomodoroCompanionVisible }">
              <div class="manager-card-top">
                <div class="manager-preview-box">
                  <PomodoroPet
                    :interactive="false"
                    :sound-enabled="settings.soundEnabled"
                  />
                </div>

                <div class="manager-info">
                  <div class="manager-title-row">
                    <h3 class="manager-pet-name">🍅 Momo — Pomodoro Pet</h3>
                    <span class="pet-active-badge" :class="pomodoroCompanionVisible ? 'on' : 'off'">
                      {{ pomodoroCompanionVisible ? 'On Desktop' : 'Removed / Hidden' }}
                    </span>
                  </div>
                  <p class="manager-pet-desc">
                    Dedicated companion for focus sprints. Enters <strong>deep work / laptop typing mode</strong> during work periods with paws clacking on the keyboard.
                  </p>

                  <div class="manager-status-pills">
                    <span class="mini-pill">Phase: {{ pomoState.phase === 'focus' ? 'Focus Work' : 'Break' }}</span>
                    <span class="mini-pill">Timer: {{ formatMmSs(pomoState.timeRemaining) }}</span>
                  </div>
                </div>
              </div>

              <!-- Toggle Switch Controls -->
              <div class="manager-card-bottom">
                <div class="toggle-switch-wrapper">
                  <label class="switch-label">
                    <input
                      type="checkbox"
                      :checked="pomodoroCompanionVisible"
                      @change="togglePomodoroCompanion"
                    />
                    <span class="slider round"></span>
                  </label>
                  <span class="switch-text">
                    {{ pomodoroCompanionVisible ? 'Added to Desktop' : 'Removed from Desktop' }}
                  </span>
                </div>

                <div class="manager-btn-actions">
                  <button class="btn btn-sm btn-outline" @click="testFocusSound">
                    🔔 Test Chime
                  </button>
                  <button class="btn btn-sm btn-primary" @click="togglePomodoroTimer">
                    {{ pomoState.status === 'running' ? '⏸ Pause' : '▶ Start Focus' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Mode Preference -->
          <div class="card global-preferences-card">
            <h3 class="card-title">Companion Footprint</h3>
            <label class="setting-toggle">
              <div class="toggle-info">
                <span class="toggle-label">Compact Companion Mode</span>
                <span class="toggle-desc">Reduce desktop footprint for both floating companions</span>
              </div>
              <input
                type="checkbox"
                v-model="settings.companionMini"
                @change="onMiniToggle"
              />
            </label>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CompanionPet from './components/CompanionPet.vue';
import PomodoroPet from './components/PomodoroPet.vue';
import StatusBadge from './components/StatusBadge.vue';
import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from './types/status';
import { AGENT_STATUSES } from './types/status';
import { AntigravityAdapter } from './adapters/antigravity';
import { CodexAdapter } from './adapters/codex';
import { VSCodeAdapter } from './adapters/vscode';
import { MonitoringCoordinator } from './services/coordinator';
import { PomodoroCoordinator } from './services/pomodoro';
import { native, onEvent } from './services/native';
import { notificationService } from './services/notifications';
import { useSettings } from './composables/useSettings';
import { EVENTS } from './types/events';
import type { PomodoroPhase } from './types/pomodoro';

const isDevMode = import.meta.env.DEV;
const testStates = AGENT_STATUSES;

// Active Navigation Tab
const currentTab = ref<'pomodoro' | 'monitor' | 'pets'>('pomodoro');

const { settings } = useSettings();

// Adapters & Coordinators
const antigravityAdapter = new AntigravityAdapter();
const codexAdapter = new CodexAdapter();
const vscodeAdapter = new VSCodeAdapter();

const coordinator = new MonitoringCoordinator([antigravityAdapter, codexAdapter, vscodeAdapter]);
const adapters = coordinator.getAdapters();

const pomodoro = new PomodoroCoordinator(() => settings.value, settings.value.pomodoroConfig);
const pomoState = pomodoro.getState();

const activeAgentId = ref<AgentId>('antigravity');
const agentCompanionVisible = ref(true);
const pomodoroCompanionVisible = ref(false);
const history = ref<HistoryEntry[]>([]);
const antigravityHookInstalled = ref(false);

const activeAgentAdapter = computed(() => coordinator.getAdapter(activeAgentId.value));

const activePetsCount = computed(() => {
  let count = 0;
  if (agentCompanionVisible.value) count++;
  if (pomodoroCompanionVisible.value) count++;
  return count;
});

// Clock Ring Math (r = 88 => Circumference = 2 * PI * 88 ~= 552.92)
const circumference = 2 * Math.PI * 88;
const clockDashOffset = computed(() => {
  const total = pomoState.value.totalDuration || 1;
  const remaining = pomoState.value.timeRemaining;
  const progress = Math.max(0, Math.min(1, remaining / total));
  return circumference * (1 - progress);
});

const activePhaseMinutes = computed(() => {
  if (pomoState.value.phase === 'focus') {
    return settings.value.pomodoroConfig.focusMinutes;
  }
  return settings.value.pomodoroConfig.breakMinutes;
});

const currentStatus = computed<StatusUpdate>(() => {
  return (
    coordinator.getStatus(activeAgentId.value) || {
      agentId: activeAgentId.value,
      status: 'idle',
      timestamp: Date.now(),
      source: 'init',
      method: 'none',
      confidence: 'none',
      detail: 'Awaiting events...',
    }
  );
});

const lastUpdateTime = computed(() => {
  const ts = currentStatus.value.timestamp;
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString();
});

function getStatus(id: AgentId): StatusUpdate {
  return (
    coordinator.getStatus(id) || {
      agentId: id,
      status: 'unknown',
      timestamp: Date.now(),
      source: 'init',
      method: 'none',
      confidence: 'none',
    }
  );
}

function getApp(id: AgentId): AppDetection | undefined {
  return coordinator.getAppDetection(id);
}

function selectAgent(id: AgentId) {
  coordinator.setActiveAgentId(id);
  activeAgentId.value = id;
}

function getAgentName(id: AgentId | 'system'): string {
  if (id === 'system') return 'System';
  return coordinator.getAdapter(id)?.displayName || id;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatMmSs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Pet Window Toggles
async function toggleAgentCompanion() {
  const next = !agentCompanionVisible.value;
  try {
    await native.setCompanionVisible(next);
  } catch {}
  agentCompanionVisible.value = next;
  settings.value.agentPetVisible = next;
}

async function togglePomodoroCompanion() {
  const next = !pomodoroCompanionVisible.value;
  try {
    await native.setPomodoroCompanionVisible(next);
  } catch {}
  pomodoroCompanionVisible.value = next;
  settings.value.pomodoroPetVisible = next;
  if (next) {
    pomodoro.broadcastState();
  }
}

async function onMiniToggle() {
  try {
    await native.setCompanionMini(settings.value.companionMini);
    await native.setPomodoroCompanionMini(settings.value.companionMini);
  } catch {}
}

async function focusAgentApp() {
  await native.focusTargetApp(activeAgentAdapter.value?.displayName?.toLowerCase() || 'antigravity');
}

// Pomodoro Timer Controls
function togglePomodoroTimer() {
  pomodoro.toggle();
}

function skipPomodoroPhase() {
  pomodoro.skip();
}

function resetPomodoroTimer() {
  pomodoro.reset();
}

function switchPhase(phase: PomodoroPhase) {
  pomodoro.setPhase(phase);
}

function setDurationMinutes(min: number) {
  if (pomoState.value.phase === 'focus') {
    settings.value.pomodoroConfig.focusMinutes = min;
  } else {
    settings.value.pomodoroConfig.breakMinutes = min;
  }
  pomodoro.updateConfig(settings.value.pomodoroConfig);
}

function stepDuration(delta: number) {
  let val = activePhaseMinutes.value + delta;
  if (val < 1) val = 1;
  if (val > 120) val = 120;
  setDurationMinutes(val);
}

function testFocusSound() {
  notificationService.playFocusStartChime();
}

function testBreakSound() {
  notificationService.playBreakBell();
}

function testChime() {
  notificationService.playChime();
}

// Integration checks
async function refreshAllIntegrations() {
  for (const ad of adapters) {
    await ad.refreshIntegration();
  }
  await checkHook();
}

async function checkHook() {
  try {
    const st = await native.getHookStatus();
    antigravityHookInstalled.value = st.installed && st.upToDate;
  } catch {
    antigravityHookInstalled.value = false;
  }
}

async function toggleAntigravityHook() {
  try {
    if (antigravityHookInstalled.value) {
      await native.uninstallAntigravityHook();
    } else {
      await native.installAntigravityHook();
    }
    await checkHook();
    await antigravityAdapter.refreshIntegration();
  } catch (err) {
    console.error('Failed to toggle Antigravity hook:', err);
  }
}

function simulateState(status: AgentStatus) {
  coordinator.handleStatusUpdate({
    agentId: activeAgentId.value,
    status,
    timestamp: Date.now(),
    source: 'Dev Simulator Mock',
    method: 'dev-mock',
    confidence: 'high',
    detail: `Simulated state: ${status}`,
  });
  if (status === 'completed') {
    notificationService.notifyCompletion(
      activeAgentAdapter.value?.displayName || 'Codi',
      settings.value,
      'Mock task celebration'
    );
  }
}

onMounted(async () => {
  await notificationService.init();
  // Listen for actions sent by the Momo pet window!
  pomodoro.initListeners();

  // Coordinator reactivity
  coordinator.registerListener({
    onHistoryAdd: () => {
      history.value = coordinator.getHistory();
    },
    onActiveAgentChange: (id) => {
      activeAgentId.value = id;
    },
  });

  // Check initial pet visibilities
  try {
    agentCompanionVisible.value = await native.isCompanionVisible();
  } catch {
    agentCompanionVisible.value = settings.value.agentPetVisible ?? true;
  }

  try {
    pomodoroCompanionVisible.value = await native.isPomodoroCompanionVisible();
  } catch {
    pomodoroCompanionVisible.value = settings.value.pomodoroPetVisible ?? false;
  }

  // Hook checks
  await checkHook();

  // Listen for visibility events from tray
  await onEvent(EVENTS.companionVisibility, (payload) => {
    agentCompanionVisible.value = payload.visible;
  });
  await onEvent(EVENTS.pomodoroVisibility, (payload) => {
    pomodoroCompanionVisible.value = payload.visible;
  });

  // Listen for agent completion celebrations
  await onEvent(EVENTS.celebrate, (ev) => {
    notificationService.notifyCompletion(ev.agentName, settings.value);
  });

  // Start native monitoring
  try {
    const info = await native.startMonitoring();
    codexAdapter.setMonitorInfo(info);
    await coordinator.start();
  } catch (e) {
    console.warn('Native monitoring backend not connected (running in browser?):', e);
  }
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: #161b22;
  border-bottom: 1px solid #21262d;
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6c5ce7, #ff7675);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.brand-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #f0f6fc;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #8b949e;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 3px;
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: #8b949e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #f0f6fc;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: #21262d;
  color: #f0f6fc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.tab-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: #30363d;
  color: #c9d1d9;
}
.tab-badge.pulse {
  background: rgba(255, 118, 117, 0.25);
  color: #ff7675;
  animation: badgeBlink 1.2s infinite alternate;
}
@keyframes badgeBlink {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

.tab-count {
  font-size: 10px;
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
  padding: 1px 6px;
  border-radius: 8px;
}

/* Header Quick Toggles */
.header-toggles {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pet-pill-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: #21262d;
  border: 1px solid #30363d;
  color: #8b949e;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pet-pill-btn:hover {
  background: #30363d;
  color: #f0f6fc;
}

.pet-pill-btn.active {
  background: rgba(108, 92, 231, 0.15);
  border-color: #6c5ce7;
  color: #a29bfe;
}

.pet-pill-btn.pomo.active {
  background: rgba(255, 118, 117, 0.15);
  border-color: #ff7675;
  color: #ff7675;
}

.pill-toggle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #484f58;
}

.pet-pill-btn.active .pill-toggle-dot {
  background: #a29bfe;
  box-shadow: 0 0 6px #6c5ce7;
}

.pet-pill-btn.pomo.active .pill-toggle-dot {
  background: #ff7675;
  box-shadow: 0 0 6px #ff7675;
}

/* Main Layout */
.dashboard-main {
  flex: 1;
  padding: 24px 28px;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* ======================================================== */
/* POMODORO VIEW STYLES                                     */
/* ======================================================== */
.pomodoro-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 24px;
}

.pomo-hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.phase-selector {
  display: flex;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 4px;
  gap: 6px;
  width: 100%;
  max-width: 360px;
  margin-bottom: 24px;
}

.phase-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.phase-btn:hover {
  color: #f0f6fc;
}

.phase-btn.active {
  background: #21262d;
  color: #ff7675;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.phase-min {
  font-size: 11px;
  opacity: 0.7;
}

/* Clock Ring */
.timer-clock-hero {
  position: relative;
  width: 230px;
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.clock-ring-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.clock-bg-ring {
  fill: none;
  stroke: #21262d;
  stroke-width: 8;
}

.clock-progress-ring {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.clock-progress-ring.focus {
  stroke: #ff7675;
  filter: drop-shadow(0 0 8px rgba(255, 118, 117, 0.6));
}

.clock-progress-ring.break {
  stroke: #00cec9;
  filter: drop-shadow(0 0 8px rgba(0, 206, 201, 0.6));
}

.clock-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.phase-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8b949e;
}

.clock-digits {
  font-size: 44px;
  font-weight: 800;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: #f0f6fc;
  letter-spacing: -1px;
}

.clock-status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: #21262d;
  color: #8b949e;
  display: flex;
  align-items: center;
  gap: 5px;
}

.clock-status-tag.running {
  background: rgba(255, 118, 117, 0.15);
  color: #ff7675;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

/* Timer Controls */
.timer-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.play-btn {
  min-width: 150px;
  background: #eb4d4b;
  border-color: #eb4d4b;
}

.play-btn:hover {
  background: #ff5252;
}

.play-btn.running {
  background: #e67e22;
  border-color: #e67e22;
}

.ctrl-icon {
  margin-right: 4px;
}

/* Presets & Stepper */
.duration-presets-panel {
  width: 100%;
  max-width: 440px;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 18px;
}

.presets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.presets-title {
  font-size: 12px;
  font-weight: 600;
  color: #8b949e;
}

.stepper-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #f0f6fc;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn:hover {
  background: #30363d;
}

.step-value {
  font-size: 12px;
  font-weight: 700;
  color: #f0f6fc;
  min-width: 48px;
  text-align: center;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  background: #30363d;
  color: #fff;
}

.chip.active {
  background: #eb4d4b;
  border-color: #ff7675;
  color: #fff;
}

.sprint-summary-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8b949e;
  background: #0d1117;
  border: 1px solid #21262d;
  padding: 8px 16px;
  border-radius: 8px;
}

.sprint-count-val {
  font-weight: 700;
  color: #f0f6fc;
}

/* Sidebar */
.pomodoro-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pomo-pet-card {
  padding: 18px;
}

.badge-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #21262d;
  color: #8b949e;
}
.badge-tag.running {
  background: rgba(255, 118, 117, 0.2);
  color: #ff7675;
}

.pet-showcase-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pet-avatar-wrapper {
  width: 115px;
  height: 115px;
  background: radial-gradient(circle, #21262d 0%, #161b22 80%);
  border-radius: 12px;
  border: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pet-showcase-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #f0f6fc;
}

.meta-desc {
  margin: 0;
  font-size: 11px;
  color: #8b949e;
  line-height: 1.4;
}

.pet-desktop-toggle-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #21262d;
}

.toggle-status-label {
  font-size: 11px;
  color: #c9d1d9;
}

.sound-test-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* ======================================================== */
/* PET MANAGER VIEW STYLES                                  */
/* ======================================================== */
.pets-manager-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pets-header-banner {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f0f6fc;
}

.banner-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8b949e;
}

.banner-summary-badge {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.4);
  color: #2ed573;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.pet-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pet-manager-card {
  padding: 20px;
  border-color: #30363d;
  transition: all 0.2s ease;
}

.pet-manager-card.active {
  border-color: #6c5ce7;
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.15);
}

.manager-card-top {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}

.manager-preview-box {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #21262d 0%, #161b22 80%);
  border-radius: 14px;
  border: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.manager-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manager-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.manager-pet-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f0f6fc;
}

.pet-active-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}
.pet-active-badge.on {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}
.pet-active-badge.off {
  background: rgba(139, 148, 158, 0.2);
  color: #8b949e;
}

.manager-pet-desc {
  margin: 0;
  font-size: 12px;
  color: #8b949e;
  line-height: 1.45;
}

.manager-status-pills {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.mini-pill {
  font-size: 10px;
  background: #0d1117;
  border: 1px solid #21262d;
  padding: 2px 7px;
  border-radius: 4px;
  color: #c9d1d9;
}

.manager-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #21262d;
}

.toggle-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch-label input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #21262d;
  border: 1px solid #30363d;
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #8b949e;
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #238636;
  border-color: #2ea043;
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: #ffffff;
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.switch-text {
  font-size: 13px;
  font-weight: 600;
  color: #f0f6fc;
}

.manager-btn-actions {
  display: flex;
  gap: 8px;
}

.global-preferences-card {
  padding: 18px 22px;
}

/* ======================================================== */
/* MONITOR VIEW STYLES                                      */
/* ======================================================== */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #21262d;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #f0f6fc;
}

.last-updated {
  font-size: 11px;
  color: #8b949e;
}

.hero-body {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hero-pet-preview {
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, #21262d 0%, #161b22 80%);
  border-radius: 16px;
  border: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.label-muted {
  width: 90px;
  color: #8b949e;
}

.value-highlight {
  font-weight: 600;
  color: #f0f6fc;
}

.badge-confidence {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-confidence.high { background: rgba(0, 184, 148, 0.2); color: #55efc4; }
.badge-confidence.medium { background: rgba(9, 132, 227, 0.2); color: #74b9ff; }
.badge-confidence.low { background: rgba(225, 112, 85, 0.2); color: #fab1a0; }
.badge-confidence.none { background: rgba(178, 190, 195, 0.2); color: #b2bec3; }

.source-text {
  font-family: monospace;
  font-size: 11px;
  color: #8b949e;
  background: #0d1117;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #21262d;
}

.detail-box {
  margin-top: 6px;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 8px 12px;
}
.detail-label {
  font-size: 11px;
  color: #8b949e;
  font-weight: 600;
}
.detail-content {
  margin: 3px 0 0;
  font-size: 12px;
  color: #c9d1d9;
}

.mock-simulator {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed #30363d;
}
.mock-title {
  display: block;
  font-size: 11px;
  color: #8b949e;
  margin-bottom: 8px;
}
.mock-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mock-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  border-radius: 4px;
  font-size: 11px;
  padding: 3px 8px;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s ease;
}
.mock-btn:hover {
  background: #30363d;
  color: #f0f6fc;
}
.mock-btn.active {
  background: #6c5ce7;
  border-color: #a29bfe;
  color: #ffffff;
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-item {
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.agent-item:hover {
  border-color: #388bfd;
}
.agent-item.active {
  border-color: #6c5ce7;
  background: rgba(108, 92, 231, 0.05);
}

.agent-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.agent-name-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-title {
  font-size: 13px;
  font-weight: 600;
  color: #f0f6fc;
}
.process-indicator {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #21262d;
  color: #8b949e;
}
.process-indicator.running {
  background: rgba(0, 184, 148, 0.15);
  color: #55efc4;
}

.agent-integration-summary {
  margin: 6px 0 0;
  font-size: 11px;
  color: #8b949e;
}

.agent-controls {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #161b22;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hook-status-tag {
  font-size: 11px;
}
.hook-status-tag.success { color: #55efc4; }
.hook-status-tag.warning { color: #ffeaa7; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 6px 8px;
  background: #0d1117;
  border-radius: 6px;
  border: 1px solid #21262d;
}
.history-time {
  font-family: monospace;
  font-size: 11px;
  color: #8b949e;
}
.history-agent {
  font-weight: 600;
  color: #f0f6fc;
  min-width: 75px;
}
.history-transition {
  display: flex;
  align-items: center;
  gap: 4px;
}
.transition-from {
  color: #8b949e;
  font-size: 11px;
  text-transform: capitalize;
}
.arrow {
  color: #484f58;
}
.history-detail {
  margin-left: auto;
  color: #8b949e;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.empty-state {
  padding: 30px 0;
  text-align: center;
  color: #8b949e;
  font-size: 13px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
}
.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.toggle-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.test-chime-btn {
  padding: 1px 7px;
  font-size: 11px;
}
.toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: #f0f6fc;
}
.toggle-desc {
  font-size: 11px;
  color: #8b949e;
}

/* Base Buttons */
.btn {
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  padding: 7px 14px;
  font-size: 13px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}
.btn-primary {
  background: #238636;
  color: #ffffff;
}
.btn-primary:hover {
  background: #2ea043;
}
.btn-secondary {
  background: #21262d;
  border-color: #30363d;
  color: #c9d1d9;
}
.btn-secondary:hover {
  background: #30363d;
  color: #f0f6fc;
}
.btn-danger {
  background: rgba(214, 48, 49, 0.15);
  border-color: rgba(214, 48, 49, 0.4);
  color: #ff7675;
}
.btn-danger:hover {
  background: rgba(214, 48, 49, 0.25);
}
.btn-outline {
  background: transparent;
  border-color: #30363d;
  color: #c9d1d9;
}
.btn-outline:hover {
  background: #21262d;
}
.btn-lg {
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
}
.btn-md {
  padding: 8px 16px;
  font-size: 12px;
}
.btn-sm {
  padding: 4px 10px;
  font-size: 11px;
}
.btn-xs {
  padding: 3px 8px;
  font-size: 10px;
}
.count-badge {
  font-size: 11px;
  background: #21262d;
  color: #8b949e;
  padding: 2px 6px;
  border-radius: 10px;
}
</style>