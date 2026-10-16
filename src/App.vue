<template>
  <div class="dashboard-layout">
    <!-- Header with Discord Channel Navigation and Quick Pet Toggles -->
    <DashboardHeader
      v-model:current-tab="currentTab"
      :active-pets-count="activePetsCount"
      :agent-status="currentStatus.status"
      :pomo-running="pomoState.status === 'running'"
      :formatted-time="formatMmSs(pomoState.timeRemaining)"
      :moki-wpm="mokiState.currentWpm"
      :agent-companion-visible="agentCompanionVisible"
      :pomodoro-companion-visible="pomodoroCompanionVisible"
      :moki-companion-visible="mokiCompanionVisible"
      @toggle-agent="toggleAgentCompanion"
      @toggle-pomo="togglePomodoroCompanion"
      @toggle-moki="toggleMokiCompanion"
      @open-onboarding="openOnboardingModal"
    />

    <!-- Main Content Tabs -->
    <main class="dashboard-main">
      <!-- ======================================================== -->
      <!-- TAB 1: PET MANAGER (DEFAULT PAGE - ARCADE ROSTER)        -->
      <!-- ======================================================== -->
      <section v-if="currentTab === 'pets'" class="tab-content pets-view">
        <PetManagerView
          :active-pets-count="activePetsCount"
          :agent-companion-visible="agentCompanionVisible"
          :pomodoro-companion-visible="pomodoroCompanionVisible"
          :moki-companion-visible="mokiCompanionVisible"
          :current-status="currentStatus"
          :active-agent-name="activeAgentAdapter?.displayName"
          :pomo-phase="pomoState.phase"
          :formatted-time="formatMmSs(pomoState.timeRemaining)"
          :moki-wpm="mokiState.currentWpm"
          :moki-keystrokes="mokiKeystrokesFormatted"
          :sound-enabled="settings.soundEnabled"
          :companion-mini="settings.companionMini"
          @toggle-agent="toggleAgentCompanion"
          @toggle-pomo="togglePomodoroCompanion"
          @toggle-moki="toggleMokiCompanion"
          @test-chime="testChime"
          @test-focus-sound="testFocusSound"
          @test-key-sound="testKeySound"
          @focus-app="focusAgentApp"
          @open-monitor="currentTab = 'monitor'"
          @open-timer="currentTab = 'pomodoro'"
          @open-moki="currentTab = 'moki'"
          @open-tutorials="currentTab = 'tutorials'"
          @open-onboarding="openOnboardingModal"
          @update:companion-mini="onMiniToggle"
          @update:sound-enabled="settings.soundEnabled = $event"
        />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 2: POMODORO FOCUS TRACKER (MOMO ARCADE)              -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'pomodoro'" class="tab-content pomodoro-view">
        <MomoFocusView
          :pomo-state="pomoState"
          :settings="settings"
          :pomodoro-companion-visible="pomodoroCompanionVisible"
          @toggle-timer="togglePomodoroTimer"
          @skip-phase="skipPomodoroPhase"
          @reset-timer="resetPomodoroTimer"
          @switch-phase="switchPhase"
          @set-duration="setDurationMinutes"
          @step-duration="stepDuration"
          @toggle-pomo="togglePomodoroCompanion"
          @test-focus-sound="testFocusSound"
          @test-break-sound="testBreakSound"
          @update:sound-enabled="settings.soundEnabled = $event"
        />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 3: CODI MONITOR (AGENT TRACKING)                     -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'monitor'" class="tab-content monitor-view">
        <CodiMonitorView
          :current-status="currentStatus"
          :active-agent-id="activeAgentId"
          :active-agent-adapter="activeAgentAdapter"
          :adapters="adapters"
          :history="history"
          :settings="settings"
          :antigravity-hook-installed="antigravityHookInstalled"
          :last-update-time="lastUpdateTime"
          :is-dev-mode="isDevMode"
          :test-states="testStates"
          :get-status="getStatus"
          :get-app="getApp"
          :get-agent-name="getAgentName"
          :format-time="formatTime"
          @select-agent="selectAgent"
          @refresh-integrations="refreshAllIntegrations"
          @toggle-hook="toggleAntigravityHook"
          @simulate-state="simulateState"
          @test-chime="testChime"
          @update:monitoring-enabled="settings.monitoringEnabled = $event"
          @update:notifications-enabled="settings.notificationsEnabled = $event"
          @update:sound-enabled="settings.soundEnabled = $event"
        />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 4: MOKI KEYBOARD & WELLNESS STATION                  -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'moki'" class="tab-content moki-view">
        <MokiStationView :sound-enabled="settings.soundEnabled" :settings="settings" />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 5: APP SETTINGS & AUDIO CONFIGURATIONS               -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'settings'" class="tab-content settings-view">
        <SettingsView
          :settings="settings"
          @update:companion-mini="onMiniToggle"
          @open-onboarding="openOnboardingModal"
          @start-tour="startSpotlightTour"
          @open-tutorials="currentTab = 'tutorials'"
        />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 6: ABOUT DEVPET & DEVELOPER PROFILE                  -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'about'" class="tab-content about-view">
        <AboutView />
      </section>

      <!-- ======================================================== -->
      <!-- TAB 7: TUTORIALS & INTERACTIVE PLAYGROUND ACADEMY        -->
      <!-- ======================================================== -->
      <section v-else-if="currentTab === 'tutorials'" class="tab-content tutorials-view">
        <TutorialsView
          @replay-onboarding="openOnboardingModal"
          @start-tour="startSpotlightTour"
          @test-chime="testChime"
          @test-focus-sound="testFocusSound"
          @test-key-sound="testKeySound"
        />
      </section>
    </main>

    <!-- First-Time Onboarding Wizard Modal -->
    <OnboardingModal
      :is-open="isOnboardingOpen"
      :settings="settings"
      :agent-companion-visible="agentCompanionVisible"
      :pomodoro-companion-visible="pomodoroCompanionVisible"
      :moki-companion-visible="mokiCompanionVisible"
      @close="isOnboardingOpen = false"
      @complete="onOnboardingComplete"
      @start-tour="startSpotlightTour"
      @toggle-agent="toggleAgentCompanion"
      @toggle-pomo="togglePomodoroCompanion"
      @toggle-moki="toggleMokiCompanion"
      @test-chime="testChime"
      @test-focus-sound="testFocusSound"
      @test-key-sound="testKeySound"
    />

    <!-- Interactive UI Spotlight Tour Overlay -->
    <AppSpotlightTour
      :is-open="isTourOpen"
      @close="isTourOpen = false"
      @complete="onTourComplete"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue - Root Dashboard Container
 * Cleanly orchestrates sub-views:
 *   1. DashboardHeader - Channel tabs, pet counts, and instant desktop toggles.
 *   2. PetManagerView  - (Default) Roster for deploying Codi, Momo, Moki.
 *   3. MomoFocusView   - Pomodoro Sprint timer, circular clock, and presets.
 *   4. CodiMonitorView - Real-time AI agent status feed and IDE hook integrations.
 *   5. MokiStationView - Keystroke velocity, typing stats, and wellness breaks.
 *   6. SettingsView    - Master audio volume slider, sound effect toggles, and configs.
 *   7. AboutView       - Developer profile (Terence Franz Indenerio) and fleet architecture.
 */
import { ref, computed, onMounted } from 'vue';
import DashboardHeader from './components/DashboardHeader.vue';
import PetManagerView from './components/PetManagerView.vue';
import MomoFocusView from './components/MomoFocusView.vue';
import CodiMonitorView from './components/CodiMonitorView.vue';
import MokiStationView from './components/MokiStationView.vue';
import SettingsView from './components/SettingsView.vue';
import AboutView from './components/AboutView.vue';
import TutorialsView from './components/TutorialsView.vue';
import OnboardingModal from './components/OnboardingModal.vue';
import AppSpotlightTour from './components/AppSpotlightTour.vue';

import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from './types/status';
import { AGENT_STATUSES } from './types/status';
import { AntigravityAdapter } from './adapters/antigravity';
import { CodexAdapter } from './adapters/codex';
import { VSCodeAdapter } from './adapters/vscode';
import { CursorAdapter } from './adapters/cursor';
import { OpenCodeAdapter } from './adapters/opencode';
import { OllamaAdapter } from './adapters/ollama';
import { MonitoringCoordinator } from './services/coordinator';
import { PomodoroCoordinator } from './services/pomodoro';
import { mokiCoordinator } from './services/mokiCoordinator';
import { native, onEvent } from './services/native';
import { notificationService } from './services/notifications';
import { useSettings } from './composables/useSettings';
import { EVENTS } from './types/events';
import type { PomodoroPhase } from './types/pomodoro';

// Dev mode and simulator states
const isDevMode = import.meta.env.DEV;
const testStates = AGENT_STATUSES;

// Active Navigation Tab
const currentTab = ref<'pets' | 'monitor' | 'pomodoro' | 'moki' | 'settings' | 'about' | 'tutorials'>('pets');

// Onboarding & Guided Tour State
const isOnboardingOpen = ref(false);
const isTourOpen = ref(false);

function openOnboardingModal() {
  isOnboardingOpen.value = true;
}

function onOnboardingComplete() {
  try {
    localStorage.setItem('devpet:onboarding_completed', 'true');
  } catch {}
  settings.value.hasSeenOnboarding = true;
}

function startSpotlightTour() {
  currentTab.value = 'pets';
  isTourOpen.value = true;
}

function onTourComplete() {
  notificationService.playChime();
}

// App settings
const { settings } = useSettings();

// Adapters & Coordinators
const antigravityAdapter = new AntigravityAdapter();
const codexAdapter = new CodexAdapter();
const cursorAdapter = new CursorAdapter();
const opencodeAdapter = new OpenCodeAdapter();
const ollamaAdapter = new OllamaAdapter();
const vscodeAdapter = new VSCodeAdapter();

const coordinator = new MonitoringCoordinator([
  antigravityAdapter,
  codexAdapter,
  cursorAdapter,
  opencodeAdapter,
  ollamaAdapter,
  vscodeAdapter,
]);
const adapters = coordinator.getAdapters();

const pomodoro = new PomodoroCoordinator(() => settings.value, settings.value.pomodoroConfig);
const pomoState = pomodoro.getState();

const activeAgentId = ref<AgentId>('antigravity');
const agentCompanionVisible = ref(true);
const pomodoroCompanionVisible = ref(false);
const mokiCompanionVisible = ref(false);
const mokiState = mokiCoordinator.getState();
const history = ref<HistoryEntry[]>([]);
const antigravityHookInstalled = ref(false);

const activeAgentAdapter = computed(() => coordinator.getAdapter(activeAgentId.value));

/** Count how many floating pets are currently active on the desktop */
const activePetsCount = computed(() => {
  let count = 0;
  if (agentCompanionVisible.value) count++;
  if (pomodoroCompanionVisible.value) count++;
  if (mokiCompanionVisible.value) count++;
  return count;
});

const mokiKeystrokesFormatted = computed(() => {
  return mokiState.totalKeystrokes.toLocaleString();
});

/** Active agent status representation */
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

/** Formatted last update time */
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

/** Toggle Codi floating pet window */
async function toggleAgentCompanion() {
  const next = !agentCompanionVisible.value;
  try {
    await native.setCompanionVisible(next);
  } catch {}
  agentCompanionVisible.value = next;
  settings.value.agentPetVisible = next;
}

/** Toggle Momo floating pet window */
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

/** Toggle compact mode on both companions */
async function onMiniToggle(val: boolean) {
  settings.value.companionMini = val;
  try {
    await native.setCompanionMini(val);
    await native.setPomodoroCompanionMini(val);
  } catch {}
}

/** Focus the external coding agent app (e.g. Antigravity) */
async function focusAgentApp() {
  await native.focusTargetApp(activeAgentAdapter.value?.displayName?.toLowerCase() || 'antigravity');
}

/** Pomodoro timer actions */
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
  const currentVal = pomoState.value.phase === 'focus'
    ? settings.value.pomodoroConfig.focusMinutes
    : settings.value.pomodoroConfig.breakMinutes;
  let val = currentVal + delta;
  if (val < 1) val = 1;
  if (val > 120) val = 120;
  setDurationMinutes(val);
}

/** Audio feedback tests */
async function toggleMokiCompanion() {
  const next = !mokiCompanionVisible.value;
  mokiCompanionVisible.value = next;
  try {
    await native.setMokiCompanionVisible(next);
  } catch {}
}

function testKeySound() {
  notificationService.playKeyClick();
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

/** Integration checks */
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

  try {
    mokiCompanionVisible.value = await native.isMokiCompanionVisible();
  } catch {
    mokiCompanionVisible.value = false;
  }

  // Hook checks
  await checkHook();

  // Initialize Moki host coordinator
  mokiCoordinator.init(true);

  // Listen for visibility events from tray
  await onEvent(EVENTS.companionVisibility, (payload) => {
    agentCompanionVisible.value = payload.visible;
  });
  await onEvent(EVENTS.pomodoroVisibility, (payload) => {
    pomodoroCompanionVisible.value = payload.visible;
  });
  await onEvent(EVENTS.mokiVisibility, (payload) => {
    mokiCompanionVisible.value = payload.visible;
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

  // First launch onboarding check
  try {
    const hasSeen = localStorage.getItem('devpet:onboarding_completed') || settings.value.hasSeenOnboarding;
    if (!hasSeen) {
      isOnboardingOpen.value = true;
    }
  } catch {}
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #1e1f22;
  color: #dbdee1;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

.dashboard-main {
  flex: 1;
  padding: 24px 28px;
  max-width: 1380px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>