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
          <p class="brand-subtitle">AI Coding Companion Monitor</p>
        </div>
      </div>

      <div class="header-actions">
        <button
          class="btn"
          :class="companionVisible ? 'btn-secondary' : 'btn-primary'"
          @click="toggleCompanion"
        >
          {{ companionVisible ? 'Hide Companion' : 'Show Companion' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-grid">
      <!-- Left Column: Active Status & Companion Preview -->
      <section class="card status-hero-card">
        <div class="card-header">
          <h2 class="card-title">Active Companion Status</h2>
          <span class="last-updated" v-if="lastUpdateTime">
            Updated {{ lastUpdateTime }}
          </span>
        </div>

        <div class="hero-body">
          <div class="hero-pet-preview">
            <CompanionPet
              :status="currentStatus.status"
              :label="currentStatus.detail"
              :agent-name="activeAgentAdapter?.displayName || 'DevPet'"
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

        <!-- Dev Mode Mock State Simulator (Only in dev/test) -->
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

      <!-- Right Column: Monitored Agents & System Integrations -->
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
                {{ antigravityHookInstalled ? 'Uninstall Hook' : 'Install Antigravity Hook' }}
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

      <!-- Bottom-Right: Settings -->
      <section class="card settings-card">
        <div class="card-header">
          <h2 class="card-title">Companion Preferences</h2>
        </div>

        <div class="settings-list">
          <label class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">Monitoring Active</span>
              <span class="toggle-desc">Enable event listening and companion status updates</span>
            </div>
            <input type="checkbox" v-model="settings.monitoringEnabled" />
          </label>

          <label class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">Completion Desktop Notifications</span>
              <span class="toggle-desc">Show Windows toast when an agent finishes its task</span>
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
                  title="Play sample chime"
                >
                  🔊 Test Sound
                </button>
              </div>
              <span class="toggle-desc">Play synthesized chime on task completion</span>
            </div>
            <input type="checkbox" v-model="settings.soundEnabled" />
          </div>

          <label class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">Compact Companion Mode</span>
              <span class="toggle-desc">Reduce the floating companion's desktop footprint</span>
            </div>
            <input
              type="checkbox"
              v-model="settings.companionMini"
              @change="onMiniToggle"
            />
          </label>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CompanionPet from './components/CompanionPet.vue';
import StatusBadge from './components/StatusBadge.vue';
import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from './types/status';
import { AGENT_STATUSES } from './types/status';
import { AntigravityAdapter } from './adapters/antigravity';
import { CodexAdapter } from './adapters/codex';
import { VSCodeAdapter } from './adapters/vscode';
import { MonitoringCoordinator } from './services/coordinator';
import { native, onEvent } from './services/native';
import { notificationService } from './services/notifications';
import { useSettings } from './composables/useSettings';
import { EVENTS } from './types/events';

const isDevMode = import.meta.env.DEV;
const testStates = AGENT_STATUSES;

const { settings } = useSettings();

// Adapters
const antigravityAdapter = new AntigravityAdapter();
const codexAdapter = new CodexAdapter();
const vscodeAdapter = new VSCodeAdapter();

const coordinator = new MonitoringCoordinator([antigravityAdapter, codexAdapter, vscodeAdapter]);
const adapters = coordinator.getAdapters();

const activeAgentId = ref<AgentId>('antigravity');
const companionVisible = ref(true);
const history = ref<HistoryEntry[]>([]);
const antigravityHookInstalled = ref(false);

const activeAgentAdapter = computed(() => coordinator.getAdapter(activeAgentId.value));

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

async function toggleCompanion() {
  const next = !companionVisible.value;
  await native.setCompanionVisible(next);
  companionVisible.value = next;
}

async function onMiniToggle() {
  await native.setCompanionMini(settings.value.companionMini);
}

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
      activeAgentAdapter.value?.displayName || 'DevPet',
      settings.value,
      'Mock task celebration'
    );
  }
}

function testChime() {
  notificationService.playChime();
}

onMounted(async () => {
  // Init notification system permissions
  await notificationService.init();

  // Register coordinator listener for UI reactivity
  coordinator.registerListener({
    onHistoryAdd: () => {
      history.value = coordinator.getHistory();
    },
    onActiveAgentChange: (id) => {
      activeAgentId.value = id;
    },
  });

  // Check initial companion visibility
  try {
    companionVisible.value = await native.isCompanionVisible();
  } catch {
    // web preview mode fallback
    companionVisible.value = true;
  }

  // Check Antigravity hook status
  await checkHook();

  // Listen for companion visibility events from tray
  await onEvent(EVENTS.companionVisibility, (payload) => {
    companionVisible.value = payload.visible;
  });

  // Listen for completion celebrations
  await onEvent(EVENTS.celebrate, (ev) => {
    notificationService.notifyCompletion(ev.agentName, settings.value);
  });

  // Start monitoring backend
  try {
    const info = await native.startMonitoring();
    codexAdapter.setMonitorInfo(info);
    await coordinator.start();
  } catch (e) {
    console.warn('Native monitoring backend not connected (running in browser preview?):', e);
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
  padding: 16px 28px;
  background: #161b22;
  border-bottom: 1px solid #21262d;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.brand-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #f0f6fc;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #8b949e;
}

/* Dashboard Grid */
.dashboard-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  padding: 24px 28px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Cards */
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

/* Hero Section */
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

/* Mock Simulator */
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

/* Agents List */
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

/* History Card */
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

/* Settings Card */
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

/* Buttons */
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