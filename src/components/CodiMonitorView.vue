<template>
  <div class="dashboard-grid">
    <!-- Left: Active Status Hero Card & Codi Preview -->
    <section class="arcade-panel status-hero-card">
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-icon">🐾</span>
          <h2 class="panel-title">Codi Status Feed</h2>
        </div>
        <span class="last-updated" v-if="lastUpdateTime">
          {{ lastUpdateTime }}
        </span>
      </div>

      <div class="hero-body">
        <div class="hero-pet-preview codi-glow">
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
            <span class="label-muted">Active Agent</span>
            <span class="value-highlight">{{ activeAgentAdapter?.displayName || 'None' }}</span>
          </div>

          <div class="status-row">
            <span class="label-muted">Current State</span>
            <StatusBadge :status="currentStatus.status" size="lg" />
          </div>

          <div class="status-row">
            <span class="label-muted">Confidence</span>
            <span class="badge-confidence" :class="currentStatus.confidence">
              {{ currentStatus.confidence }}
            </span>
          </div>

          <div class="status-row">
            <span class="label-muted">Signal Source</span>
            <span class="source-text">{{ currentStatus.source }}</span>
          </div>

          <div class="detail-box" v-if="currentStatus.detail">
            <span class="detail-label">Status Summary</span>
            <p class="detail-content">{{ currentStatus.detail }}</p>
          </div>
        </div>
      </div>

      <!-- Dev Simulator (Local Testing) -->
      <div class="mock-simulator" v-if="isDevMode">
        <span class="mock-title">⚡ Dev Simulator (Local State Testing):</span>
        <div class="mock-buttons">
          <button
            v-for="st in testStates"
            :key="st"
            class="mock-btn"
            :class="{ active: currentStatus.status === st }"
            @click="$emit('simulate-state', st)"
          >
            {{ st }}
          </button>
        </div>
      </div>
    </section>

    <!-- Right: Monitored Agents & System Integrations -->
    <section class="arcade-panel agents-card">
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-icon">🔌</span>
          <h2 class="panel-title">Coding Tool Integrations</h2>
        </div>
        <button class="arcade-btn btn-sm secondary" @click="$emit('refresh-integrations')">
          Refresh
        </button>
      </div>

      <div class="agents-list">
        <div
          v-for="adapter in adapters"
          :key="adapter.id"
          class="agent-item"
          :class="{ active: activeAgentId === adapter.id }"
          @click="$emit('select-agent', adapter.id)"
        >
          <div class="agent-item-top">
            <div class="agent-name-group">
              <span class="agent-title">{{ adapter.displayName }}</span>
              <span
                class="process-indicator"
                :class="{ running: getApp(adapter.id)?.running }"
                :title="getApp(adapter.id)?.running ? 'Process running' : 'Process not detected'"
              >
                {{ getApp(adapter.id)?.running ? 'App Open' : 'Closed' }}
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
              class="arcade-btn btn-xs"
              :class="antigravityHookInstalled ? 'danger' : 'primary'"
              @click.stop="$emit('toggle-hook')"
            >
              {{ antigravityHookInstalled ? 'Uninstall Hook' : 'Install Hook' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom-Left: Activity Feed -->
    <section class="arcade-panel history-card">
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-icon">📜</span>
          <h2 class="panel-title">Activity Feed</h2>
        </div>
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
    <section class="arcade-panel settings-card">
      <div class="panel-header">
        <div class="panel-title-group">
          <span class="panel-icon">⚙️</span>
          <h2 class="panel-title">Codi Preferences</h2>
        </div>
      </div>

      <div class="settings-list">
        <label class="setting-toggle">
          <div class="toggle-info">
            <span class="toggle-label">Monitoring Active</span>
            <span class="toggle-desc">Enable event listening and agent status updates</span>
          </div>
          <input
            type="checkbox"
            class="custom-check"
            :checked="settings.monitoringEnabled"
            @change="$emit('update:monitoringEnabled', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="setting-toggle">
          <div class="toggle-info">
            <span class="toggle-label">Task Desktop Notifications</span>
            <span class="toggle-desc">Show notification when agent finishes</span>
          </div>
          <input
            type="checkbox"
            class="custom-check"
            :checked="settings.notificationsEnabled"
            @change="$emit('update:notificationsEnabled', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <div class="setting-toggle">
          <div class="toggle-info">
            <div class="toggle-title-row">
              <span class="toggle-label">Completion Audio Chime</span>
              <button
                type="button"
                class="arcade-btn btn-xs secondary"
                @click="$emit('test-chime')"
              >
                🔊 Test Chime
              </button>
            </div>
            <span class="toggle-desc">Play chime on task completion</span>
          </div>
          <input
            type="checkbox"
            class="custom-check"
            :checked="settings.soundEnabled"
            @change="$emit('update:soundEnabled', ($event.target as HTMLInputElement).checked)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * CodiMonitorView Component
 * Displays live tracking for AI coding agents (Antigravity, Codex, VS Code),
 * tool hook integrations, activity timeline, and local dev simulator.
 */
import CompanionPet from './CompanionPet.vue';
import StatusBadge from './StatusBadge.vue';
import type { AgentAdapter } from '../adapters/types';
import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from '../types/status';
import type { Settings } from '../types/settings';

defineProps<{
  currentStatus: StatusUpdate;
  activeAgentId: AgentId;
  activeAgentAdapter?: AgentAdapter;
  adapters: AgentAdapter[];
  history: HistoryEntry[];
  settings: Settings;
  antigravityHookInstalled: boolean;
  lastUpdateTime: string;
  isDevMode: boolean;
  testStates: readonly AgentStatus[];
  getStatus: (id: AgentId) => StatusUpdate;
  getApp: (id: AgentId) => AppDetection | undefined;
  getAgentName: (id: AgentId | 'system') => string;
  formatTime: (ts: number) => string;
}>();

defineEmits<{
  (e: 'select-agent', id: AgentId): void;
  (e: 'refresh-integrations'): void;
  (e: 'toggle-hook'): void;
  (e: 'simulate-state', status: AgentStatus): void;
  (e: 'test-chime'): void;
  (e: 'update:monitoringEnabled', val: boolean): void;
  (e: 'update:notificationsEnabled', val: boolean): void;
  (e: 'update:soundEnabled', val: boolean): void;
}>();
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

.arcade-panel {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #313338;
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  font-size: 16px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.hero-body {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hero-pet-preview {
  width: 140px;
  height: 140px;
  background: #1e1f22;
  border-radius: 16px;
  border: 2px solid #383a40;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.hero-pet-preview.codi-glow {
  box-shadow: inset 0 0 20px rgba(88, 101, 242, 0.2);
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
  gap: 14px;
  font-size: 13px;
}

.label-muted {
  width: 95px;
  color: #949ba4;
  font-weight: 700;
  font-size: 12px;
}

.value-highlight {
  font-weight: 700;
  color: #ffffff;
}

.badge-confidence {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
}
.badge-confidence.high { background: rgba(35, 165, 90, 0.2); color: #23a55a; border: 1px solid rgba(35, 165, 90, 0.4); }
.badge-confidence.medium { background: rgba(88, 101, 242, 0.2); color: #5865f2; border: 1px solid rgba(88, 101, 242, 0.4); }
.badge-confidence.low { background: rgba(240, 178, 50, 0.2); color: #f0b232; border: 1px solid rgba(240, 178, 50, 0.4); }
.badge-confidence.none { background: rgba(78, 80, 88, 0.3); color: #949ba4; }

.source-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #dbdee1;
  background: #111214;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #383a40;
}

.detail-box {
  margin-top: 6px;
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 10px;
  padding: 10px 14px;
}
.detail-label {
  font-size: 11px;
  color: #949ba4;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-content {
  margin: 4px 0 0;
  font-size: 13px;
  color: #dbdee1;
  line-height: 1.4;
}

.last-updated {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #949ba4;
}

.mock-simulator {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #383a40;
}
.mock-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #949ba4;
  margin-bottom: 10px;
}
.mock-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mock-btn {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #dbdee1;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s ease;
  font-family: inherit;
}
.mock-btn:hover {
  background: #313338;
  color: #ffffff;
}
.mock-btn.active {
  background: #5865f2;
  border-color: #5865f2;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(88, 101, 242, 0.4);
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agent-item {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.agent-item:hover {
  border-color: #5865f2;
  background: #232428;
}
.agent-item.active {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.08);
  box-shadow: 0 0 12px rgba(88, 101, 242, 0.2);
}

.agent-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.agent-name-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.agent-title {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}
.process-indicator {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: #2b2d31;
  color: #949ba4;
}
.process-indicator.running {
  background: rgba(35, 165, 90, 0.18);
  color: #23a55a;
  border: 1px solid rgba(35, 165, 90, 0.4);
}

.agent-integration-summary {
  margin: 8px 0 0;
  font-size: 12px;
  color: #949ba4;
}

.agent-controls {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #313338;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hook-status-tag {
  font-size: 11px;
  font-weight: 700;
}
.hook-status-tag.success { color: #23a55a; }
.hook-status-tag.warning { color: #f0b232; }

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
  gap: 12px;
  font-size: 12px;
  padding: 8px 12px;
  background: #1e1f22;
  border-radius: 8px;
  border: 1px solid #383a40;
}
.history-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #949ba4;
}
.history-agent {
  font-weight: 700;
  color: #ffffff;
  min-width: 80px;
}
.history-transition {
  display: flex;
  align-items: center;
  gap: 6px;
}
.transition-from {
  color: #949ba4;
  font-size: 11px;
  text-transform: capitalize;
}
.arrow {
  color: #4e5058;
}
.history-detail {
  margin-left: auto;
  color: #949ba4;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.empty-state {
  padding: 36px 0;
  text-align: center;
  color: #949ba4;
  font-size: 13px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 6px 0;
}
.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.toggle-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toggle-label {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}
.toggle-desc {
  font-size: 11px;
  color: #949ba4;
}

.arcade-btn {
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 13px;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  user-select: none;
}

.arcade-btn.primary {
  background: #5865f2;
  color: #ffffff;
}
.arcade-btn.primary:hover {
  background: #4752c4;
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
}

.arcade-btn.secondary {
  background: #1e1f22;
  border-color: #383a40;
  color: #dbdee1;
}
.arcade-btn.secondary:hover {
  background: #313338;
  border-color: #4e5058;
  color: #ffffff;
}

.arcade-btn.danger {
  background: rgba(242, 63, 67, 0.18);
  border-color: rgba(242, 63, 67, 0.4);
  color: #f23f43;
}
.arcade-btn.danger:hover {
  background: #f23f43;
  color: #ffffff;
}

.arcade-btn.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}

.arcade-btn.btn-xs {
  padding: 4px 9px;
  font-size: 11px;
}

.count-badge {
  font-size: 11px;
  font-weight: 700;
  background: #1e1f22;
  color: #949ba4;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid #383a40;
}

.custom-check {
  width: 18px;
  height: 18px;
  accent-color: #5865f2;
  cursor: pointer;
}
</style>
