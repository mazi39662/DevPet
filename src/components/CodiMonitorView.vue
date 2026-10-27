<template>
  <div class="codi-page-wrapper">
    <!-- Codi HD Mascot Spotlight & Lore Banner -->
    <PetProfileBanner
      pet-id="codi"
      name="Codi"
      title="Autonomous AI Agent Watchdog"
      badge-text="AI PAIR PROGRAMMER"
      image-src="/pets/codi-hd.jpg"
      image-alt="Codi High-Definition Cyber Mascot"
      description="Codi is your cybernetic AI pair programming companion. Floating on your desktop, Codi hooks directly into Google Antigravity and Codex lifecycles in real-time—radiating curiosity while reasoning, typing with electric particles during tool execution, sounding pulsing radar pings when your approval is needed, and launching victory fanfare when tasks succeed."
      :deployed="agentCompanionVisible"
      :traits="[
        { icon: '💡', label: 'Reasoning Aura', desc: 'Glows when the agent is reasoning through prompts' },
        { icon: '⚡', label: 'Tool Execution', desc: 'Types rapidly on glowing laptop while running tools' },
        { icon: '🚨', label: 'Action Radar', desc: 'Pulsing radar alert when tool approval is required' },
        { icon: '🚀', label: '1-Click IDE Focus', desc: 'Double-click mascot to instantly foreground your editor' }
      ]"
      @toggle-deploy="$emit('toggle-agent')"
    />

    <div class="monitor-columns">
      <!-- Left Column: Status Hero + Activity Feed -->
      <div class="monitor-col primary-col">
        <!-- Active Status Hero Card & Codi Preview (Fitted, Compact) -->
        <section class="arcade-panel status-hero-card">
          <div class="panel-header compact-header">
            <div class="panel-title-group">
              <span class="panel-icon">🐾</span>
              <h2 class="panel-title">Codi Status Feed</h2>
              <span class="live-dot" :class="currentStatus.status" title="Real-time status stream active"></span>
            </div>
            <div class="header-actions">
              <span class="last-updated" v-if="lastUpdateTime">
                <span class="time-icon">🕒</span> {{ lastUpdateTime }}
              </span>
              <button
                class="arcade-btn btn-xs ghost-deploy"
                :class="{ active: agentCompanionVisible }"
                @click="$emit('toggle-agent')"
                title="Toggle desktop floating Codi"
              >
                {{ agentCompanionVisible ? '🐾 Floating' : '🪟 Docked' }}
              </button>
            </div>
          </div>

          <div class="hero-body fitted-hero">
            <div class="hero-pet-preview codi-glow fitted-pet">
              <CompanionPet
                :status="currentStatus.status"
                :label="currentStatus.detail"
                agent-name="Codi"
                :show-bubble="false"
                :sound-enabled="settings.soundEnabled"
                mini
              />
            </div>

            <div class="hero-details fitted-details">
              <!-- 2x2 Fitted Metadata Grid -->
              <div class="meta-grid">
                <div class="meta-card">
                  <span class="meta-label">Active Agent</span>
                  <div class="meta-val">
                    <span class="agent-avatar-mini">{{ activeAgentAdapter?.id === 'antigravity' ? '🪐' : '🔷' }}</span>
                    <span class="value-highlight">{{ activeAgentAdapter?.displayName || 'None' }}</span>
                  </div>
                </div>

                <div class="meta-card">
                  <span class="meta-label">Current State</span>
                  <div class="meta-val">
                    <StatusBadge :status="currentStatus.status" size="sm" />
                  </div>
                </div>

                <div class="meta-card">
                  <span class="meta-label">Confidence</span>
                  <div class="meta-val">
                    <span class="badge-confidence" :class="currentStatus.confidence">
                      {{ currentStatus.confidence }}
                    </span>
                  </div>
                </div>

                <div class="meta-card">
                  <span class="meta-label">Signal Source</span>
                  <div class="meta-val">
                    <span class="source-text" :title="currentStatus.source">{{ currentStatus.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Compact Status Summary Banner -->
              <div class="compact-detail-banner" :class="currentStatus.status" v-if="currentStatus.detail">
                <span class="detail-lead">💬</span>
                <span class="detail-lead-text">{{ currentStatus.detail }}</span>
              </div>
            </div>
          </div>

          <!-- Actionable Micro-Controls Banner when WAITING for approval -->
          <div class="approval-action-banner compact-approval" v-if="currentStatus.status === 'waiting'">
            <div class="banner-header">
              <span class="banner-badge">⏳ ACTION REQUIRED</span>
              <span class="banner-title">{{ currentStatus.approval?.title || 'Waiting for Approval' }}</span>
            </div>
            <p class="banner-summary">{{ currentStatus.approval?.summary || currentStatus.detail }}</p>
            <div class="banner-controls">
              <button
                class="banner-btn primary btn-sm"
                @click="$emit('focus-app'); $emit('approval-action', 'open')"
              >
                🚀 Open
              </button>
            </div>
          </div>

          <!-- Dev Simulator (Local Testing) - Fitted Strip -->
          <div class="mock-simulator compact-sim" v-if="isDevMode">
            <span class="mock-title">⚡ Test Simulation:</span>
            <div class="mock-buttons">
              <button
                v-for="st in testStates"
                :key="st"
                class="mock-btn mini"
                :class="{ active: currentStatus.status === st }"
                @click="$emit('simulate-state', st)"
              >
                {{ st }}
              </button>
            </div>
          </div>
        </section>

        <!-- Activity Feed (Rich Details) -->
        <section class="arcade-panel history-card rich-feed">
          <div class="panel-header feed-header">
            <div class="panel-title-group">
              <span class="panel-icon">📜</span>
              <h2 class="panel-title">Activity Feed</h2>
              <span class="count-badge">{{ filteredHistory.length }} of {{ history.length }}</span>
            </div>
            <div class="feed-header-actions">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Filter events, tools, files..."
                  class="search-input"
                />
                <button
                  v-if="searchQuery"
                  class="clear-search-btn"
                  @click="searchQuery = ''"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
              <button
                v-if="history.length > 0"
                class="arcade-btn btn-xs secondary clear-feed-btn"
                @click="$emit('clear-history')"
                title="Clear activity feed"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="feed-filters">
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
            >
              All ({{ counts.all }})
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'working' }"
              @click="activeFilter = 'working'"
            >
              ⚡ Working ({{ counts.working }})
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'waiting' }"
              @click="activeFilter = 'waiting'"
            >
              ⏳ Approvals ({{ counts.waiting }})
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'completed' }"
              @click="activeFilter = 'completed'"
            >
              ✅ Completed ({{ counts.completed }})
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'error' }"
              @click="activeFilter = 'error'"
            >
              ❌ Errors ({{ counts.error }})
            </button>
          </div>

          <!-- Rich History List -->
          <div class="history-list detailed-list" v-if="filteredHistory.length > 0">
            <div
              v-for="item in filteredHistory"
              :key="item.id"
              class="rich-history-card"
              :class="item.to"
            >
              <!-- Top Row: Time, Agent, Status Transition, Duration, Origin -->
              <div class="card-top-row">
                <div class="card-left-group">
                  <span class="event-icon" :title="item.to">{{ getStateIcon(item.to) }}</span>
                  <div class="time-block">
                    <span class="full-time">{{ formatTime(item.timestamp) }}</span>
                    <span class="rel-time">({{ formatRelativeTime(item.timestamp) }})</span>
                  </div>
                  <span class="agent-tag-pill" :class="item.agentId">
                    {{ getAgentName(item.agentId) }}
                  </span>
                  <div class="status-flow">
                    <span class="flow-from" v-if="item.from">{{ item.from }}</span>
                    <span class="flow-arrow" v-if="item.from">➔</span>
                    <StatusBadge :status="item.to" size="sm" />
                  </div>
                </div>

                <div class="card-right-group">
                  <!-- Duration badge if available -->
                  <span class="duration-badge" v-if="item.durationMs" title="Task execution duration">
                    ⏱️ {{ formatDuration(item.durationMs) }}
                  </span>
                  <!-- Method / Source badge -->
                  <span class="source-badge" :title="'Source: ' + item.source">
                    {{ item.method ? item.method : item.source.split(' ')[0] }}
                  </span>
                  <!-- Confidence tag -->
                  <span
                    v-if="item.confidence && item.confidence !== 'none'"
                    class="badge-confidence-mini"
                    :class="item.confidence"
                  >
                    {{ item.confidence }}
                  </span>
                </div>
              </div>

              <!-- Detail / Body Row -->
              <div class="card-detail-body" v-if="item.detail || item.approvalTitle">
                <!-- Approval Lead Callout -->
                <div class="approval-callout" v-if="item.approvalTitle">
                  <span class="callout-icon">🚨</span>
                  <span class="callout-title">{{ item.approvalTitle }}</span>
                </div>

                <!-- Detail Text / Code block -->
                <div
                  v-if="item.detail"
                  class="detail-text-box"
                  :class="{
                    'command-style': isCommandLike(item.detail),
                    expanded: expandedEntries.has(item.id)
                  }"
                >
                  <code class="code-snippet">{{ item.detail }}</code>
                  <button
                    v-if="item.detail.length > 130"
                    class="expand-toggle"
                    @click.stop="toggleExpand(item.id)"
                  >
                    {{ expandedEntries.has(item.id) ? '▲ Less' : '▼ More' }}
                  </button>
                </div>

                <!-- Metadata Footer (Session ID / File Origin) -->
                <div class="card-meta-footer" v-if="item.sessionId || (item.source && item.source !== item.method)">
                  <span class="meta-tag session" v-if="item.sessionId">
                    🆔 {{ item.sessionId.slice(0, 10) }}...
                  </span>
                  <span class="meta-tag origin" v-if="item.source && item.source !== item.method">
                    📡 {{ item.source }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" v-else>
            <div class="empty-icon">🐾</div>
            <p class="empty-title">{{ history.length === 0 ? 'No activity events recorded yet' : 'No matching events found' }}</p>
            <p class="empty-sub">
              {{ history.length === 0
                ? 'Events will stream in live as you code with Antigravity, Codex, or VS Code.'
                : 'Try clearing your search query or selecting a different status filter.'
              }}
            </p>
            <button
              v-if="history.length > 0"
              class="arcade-btn btn-xs secondary reset-btn"
              @click="activeFilter = 'all'; searchQuery = ''"
            >
              Reset Filters
            </button>
          </div>
        </section>
    </div>

    <!-- Right Column: Monitored Agents & System Integrations + Preferences -->
    <div class="monitor-col secondary-col">
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
            :class="{
              active: activeAgentId === adapter.id,
              'featured-hook': adapter.id === 'antigravity'
            }"
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

      <!-- Codi Preferences -->
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
  </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CodiMonitorView Component
 * Displays live tracking for AI coding agents (Antigravity, Codex, VS Code),
 * tool hook integrations, activity timeline with rich details, and local dev simulator.
 */
import { ref, computed } from 'vue';
import CompanionPet from './CompanionPet.vue';
import StatusBadge from './StatusBadge.vue';
import PetProfileBanner from './PetProfileBanner.vue';
import type { AgentAdapter } from '../adapters/types';
import type { AgentId, AgentStatus, AppDetection, HistoryEntry, StatusUpdate } from '../types/status';
import type { Settings } from '../types/settings';

const props = defineProps<{
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
  agentCompanionVisible?: boolean;
}>();

defineEmits<{
  (e: 'select-agent', id: AgentId): void;
  (e: 'refresh-integrations'): void;
  (e: 'toggle-hook'): void;
  (e: 'toggle-agent'): void;
  (e: 'simulate-state', status: AgentStatus): void;
  (e: 'test-chime'): void;
  (e: 'approval-action', actionId: string): void;
  (e: 'focus-app'): void;
  (e: 'update:monitoringEnabled', val: boolean): void;
  (e: 'update:notificationsEnabled', val: boolean): void;
  (e: 'update:soundEnabled', val: boolean): void;
  (e: 'clear-history'): void;
}>();

// Filter and search state for Activity Feed
type HistoryFilter = 'all' | 'working' | 'waiting' | 'completed' | 'error';
const activeFilter = ref<HistoryFilter>('all');
const searchQuery = ref('');
const expandedEntries = ref<Set<number>>(new Set());

function toggleExpand(id: number) {
  if (expandedEntries.value.has(id)) {
    expandedEntries.value.delete(id);
  } else {
    expandedEntries.value.add(id);
  }
}

const counts = computed(() => {
  const h = props.history;
  return {
    all: h.length,
    working: h.filter(e => e.to === 'working').length,
    waiting: h.filter(e => e.to === 'waiting').length,
    completed: h.filter(e => e.to === 'completed').length,
    error: h.filter(e => e.to === 'error').length,
  };
});

const filteredHistory = computed(() => {
  let list = props.history;

  if (activeFilter.value !== 'all') {
    list = list.filter(item => item.to === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(item => {
      const agent = props.getAgentName(item.agentId).toLowerCase();
      const detail = (item.detail || '').toLowerCase();
      const source = (item.source || '').toLowerCase();
      const toState = item.to.toLowerCase();
      const fromState = (item.from || '').toLowerCase();
      return (
        agent.includes(q) ||
        detail.includes(q) ||
        source.includes(q) ||
        toState.includes(q) ||
        fromState.includes(q)
      );
    });
  }

  return list;
});

function formatRelativeTime(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 8) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function getStateIcon(status: AgentStatus): string {
  switch (status) {
    case 'working': return '⚡';
    case 'thinking': return '💡';
    case 'waiting': return '⏳';
    case 'completed': return '✅';
    case 'error': return '❌';
    case 'idle': return '💤';
    default: return '🐾';
  }
}

function isCommandLike(text?: string): boolean {
  if (!text) return false;
  const t = text.trim();
  return (
    t.startsWith('npm ') ||
    t.startsWith('npx ') ||
    t.startsWith('cargo ') ||
    t.startsWith('git ') ||
    t.startsWith('node ') ||
    t.startsWith('pnpm ') ||
    t.startsWith('yarn ') ||
    t.includes('run ') ||
    t.includes('test') ||
    t.includes('.vue') ||
    t.includes('.ts') ||
    t.includes('.rs') ||
    t.includes('.json')
  );
}
</script>

<style scoped>
/* ==========================================================================
   Actionable Approval Banner
   ========================================================================== */
.approval-action-banner {
  margin-top: 10px;
  padding: 10px 12px;
  background: rgba(243, 156, 18, 0.08);
  border: 1px solid rgba(243, 156, 18, 0.4);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: bannerPulse 1.4s ease-in-out infinite alternate;
}
@keyframes bannerPulse {
  0% { box-shadow: 0 0 6px rgba(243, 156, 18, 0.2); }
  100% { box-shadow: 0 0 16px rgba(243, 156, 18, 0.45); }
}

.banner-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-badge {
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f39c12;
  color: #1e272e;
  letter-spacing: 0.5px;
}

.banner-title {
  font-size: 12px;
  font-weight: 700;
  color: #f1f2f6;
}

.banner-summary {
  margin: 0;
  font-size: 11.5px;
  color: #dfe6e9;
  line-height: 1.35;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 8px;
  border-radius: 5px;
  word-break: break-all;
}

.banner-controls {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.banner-btn {
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.banner-btn.primary {
  background: linear-gradient(135deg, #00b894, #00cec9);
  color: #0c2b23;
  box-shadow: 0 0 8px rgba(0, 206, 201, 0.35);
}
.banner-btn.primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
  box-shadow: 0 0 12px rgba(0, 206, 201, 0.55);
}

.banner-btn.danger {
  background: rgba(214, 48, 49, 0.2);
  color: #ff7675;
  border: 1px solid rgba(214, 48, 49, 0.5);
}
.banner-btn.danger:hover {
  background: rgba(214, 48, 49, 0.45);
  color: #fff;
}

.banner-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #dfe6e9;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.banner-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

/* ==========================================================================
   Layout Columns & Fitted Panels
   ========================================================================== */
.monitor-columns {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 18px;
  align-items: start;
}

.monitor-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.arcade-panel {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
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
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ghost-deploy {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #949ba4;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ghost-deploy.active {
  background: rgba(88, 101, 242, 0.2);
  border-color: #5865f2;
  color: #74b9ff;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #949ba4;
  display: inline-block;
  box-shadow: 0 0 6px rgba(148, 155, 164, 0.4);
}
.live-dot.working {
  background: #00b894;
  box-shadow: 0 0 8px #00b894;
  animation: livePulse 1.2s infinite alternate;
}
.live-dot.thinking {
  background: #0984e3;
  box-shadow: 0 0 8px #0984e3;
  animation: livePulse 1.2s infinite alternate;
}
.live-dot.waiting {
  background: #f39c12;
  box-shadow: 0 0 8px #f39c12;
  animation: livePulse 0.8s infinite alternate;
}
.live-dot.completed {
  background: #23a55a;
  box-shadow: 0 0 8px #23a55a;
}
.live-dot.error {
  background: #f23f43;
  box-shadow: 0 0 8px #f23f43;
}
@keyframes livePulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.3); opacity: 1; }
}

/* ==========================================================================
   Fitted Hero Card (Codi Status Feed)
   ========================================================================== */
.status-hero-card {
  padding: 14px 16px;
}

.hero-body.fitted-hero {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.hero-pet-preview.fitted-pet {
  width: 90px;
  height: 90px;
  min-width: 90px;
  background: #1e1f22;
  border-radius: 12px;
  border: 1.5px solid #383a40;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.hero-pet-preview.codi-glow {
  box-shadow: inset 0 0 16px rgba(88, 101, 242, 0.25);
}

.hero-details.fitted-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
}

.meta-card {
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.meta-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #949ba4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-val {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  min-width: 0;
  overflow: hidden;
}

.agent-avatar-mini {
  font-size: 12px;
}

.value-highlight {
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-confidence {
  text-transform: uppercase;
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}
.badge-confidence.high { background: rgba(35, 165, 90, 0.2); color: #23a55a; border: 1px solid rgba(35, 165, 90, 0.4); }
.badge-confidence.medium { background: rgba(88, 101, 242, 0.2); color: #5865f2; border: 1px solid rgba(88, 101, 242, 0.4); }
.badge-confidence.low { background: rgba(240, 178, 50, 0.2); color: #f0b232; border: 1px solid rgba(240, 178, 50, 0.4); }
.badge-confidence.none { background: rgba(78, 80, 88, 0.3); color: #949ba4; }

.source-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #dbdee1;
  background: #111214;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #383a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.compact-detail-banner {
  margin-top: 4px;
  padding: 5px 8px;
  background: rgba(0, 0, 0, 0.32);
  border-radius: 6px;
  border-left: 3px solid #5865f2;
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11.5px;
  color: #dbdee1;
  word-break: break-word;
}
.compact-detail-banner.working { border-left-color: #00b894; }
.compact-detail-banner.thinking { border-left-color: #0984e3; }
.compact-detail-banner.waiting { border-left-color: #f39c12; }
.compact-detail-banner.completed { border-left-color: #23a55a; }
.compact-detail-banner.error { border-left-color: #f23f43; }

.detail-lead {
  font-size: 11px;
  flex-shrink: 0;
}
.detail-lead-text {
  font-size: 11.5px;
  line-height: 1.35;
  color: #dbdee1;
}

.last-updated {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #949ba4;
  display: flex;
  align-items: center;
  gap: 4px;
}
.time-icon {
  font-size: 11px;
}

.mock-simulator.compact-sim {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #383a40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.mock-title {
  font-size: 11px;
  font-weight: 700;
  color: #949ba4;
}
.mock-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.mock-btn.mini {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #dbdee1;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 7px;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s ease;
  font-family: inherit;
}
.mock-btn.mini:hover {
  background: #313338;
  color: #ffffff;
}
.mock-btn.mini.active {
  background: #5865f2;
  border-color: #5865f2;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(88, 101, 242, 0.4);
}

/* ==========================================================================
   Activity Feed (Rich Details & Controls)
   ========================================================================== */
.history-card.rich-feed {
  padding: 14px 16px;
}

.feed-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.feed-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 6px;
  padding: 2px 7px;
}
.search-icon {
  font-size: 10px;
  opacity: 0.7;
}
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #dbdee1;
  font-size: 11px;
  width: 140px;
  font-family: inherit;
}
.search-input::placeholder {
  color: #6d727b;
}
.clear-search-btn {
  background: transparent;
  border: none;
  color: #949ba4;
  font-size: 10px;
  cursor: pointer;
  padding: 0 2px;
}
.clear-search-btn:hover {
  color: #fff;
}

.clear-feed-btn {
  background: transparent;
  border-color: #383a40;
  color: #949ba4;
  padding: 3px 7px;
}
.clear-feed-btn:hover {
  background: rgba(242, 63, 67, 0.15);
  border-color: rgba(242, 63, 67, 0.4);
  color: #f23f43;
}

.feed-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.filter-chip {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #949ba4;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.filter-chip:hover {
  border-color: #5865f2;
  color: #ffffff;
}
.filter-chip.active {
  background: #5865f2;
  border-color: #5865f2;
  color: #ffffff;
}

.history-list.detailed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 2px;
}

.rich-history-card {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 8px;
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 3px solid #383a40;
  transition: all 0.15s ease;
}
.rich-history-card:hover {
  border-color: #4e5058;
}
.rich-history-card.working {
  border-left-color: #00b894;
}
.rich-history-card.thinking {
  border-left-color: #0984e3;
}
.rich-history-card.waiting {
  border-left-color: #f39c12;
  background: rgba(243, 156, 18, 0.04);
}
.rich-history-card.completed {
  border-left-color: #23a55a;
}
.rich-history-card.error {
  border-left-color: #f23f43;
  background: rgba(242, 63, 67, 0.04);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.card-left-group {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.event-icon {
  font-size: 13px;
}

.time-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}
.full-time {
  color: #dbdee1;
  font-weight: 700;
}
.rel-time {
  color: #6d727b;
  font-size: 10px;
}

.agent-tag-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #f1f2f6;
}
.agent-tag-pill.antigravity {
  background: rgba(88, 101, 242, 0.2);
  color: #74b9ff;
}
.agent-tag-pill.codex {
  background: rgba(0, 184, 148, 0.2);
  color: #55efc4;
}

.status-flow {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.flow-from {
  color: #949ba4;
  font-size: 10.5px;
  text-transform: capitalize;
}
.flow-arrow {
  color: #4e5058;
  font-size: 9px;
}

.card-right-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.duration-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #55efc4;
  background: rgba(85, 239, 196, 0.12);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(85, 239, 196, 0.3);
}

.source-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: #949ba4;
  background: #111214;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid #383a40;
}

.badge-confidence-mini {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}
.badge-confidence-mini.high { background: rgba(35, 165, 90, 0.2); color: #23a55a; border: 1px solid rgba(35, 165, 90, 0.4); }
.badge-confidence-mini.medium { background: rgba(88, 101, 242, 0.2); color: #5865f2; border: 1px solid rgba(88, 101, 242, 0.4); }
.badge-confidence-mini.low { background: rgba(240, 178, 50, 0.2); color: #f0b232; border: 1px solid rgba(240, 178, 50, 0.4); }

.card-detail-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.approval-callout {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #fdcb6e;
  background: rgba(243, 156, 18, 0.12);
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.detail-text-box {
  font-size: 11.5px;
  line-height: 1.4;
  color: #dbdee1;
  word-break: break-word;
}
.detail-text-box.command-style {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0, 0, 0, 0.35);
  padding: 5px 8px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #00cec9;
}
.code-snippet {
  font-family: inherit;
}

.expand-toggle {
  background: none;
  border: none;
  color: #74b9ff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
  margin-left: 4px;
}
.expand-toggle:hover {
  text-decoration: underline;
}

.card-meta-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 9.5px;
  color: #6d727b;
  font-family: 'JetBrains Mono', monospace;
}
.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.empty-state {
  padding: 28px 0;
  text-align: center;
  color: #949ba4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.empty-icon {
  font-size: 24px;
  opacity: 0.6;
}
.empty-title {
  font-size: 13px;
  font-weight: 700;
  color: #dbdee1;
  margin: 0;
}
.empty-sub {
  font-size: 11.5px;
  color: #949ba4;
  margin: 0;
  max-width: 320px;
}
.reset-btn {
  margin-top: 6px;
}

/* ==========================================================================
   Monitored Agents List & Settings
   ========================================================================== */
.agents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.agent-item {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 10px;
  padding: 13px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.agent-item.featured-hook {
  grid-column: 1 / -1;
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
  padding: 4px 10px;
  font-size: 11.5px;
}

.arcade-btn.btn-xs {
  padding: 3px 8px;
  font-size: 10.5px;
}

.count-badge {
  font-size: 10.5px;
  font-weight: 700;
  background: #1e1f22;
  color: #949ba4;
  padding: 2px 7px;
  border-radius: 12px;
  border: 1px solid #383a40;
}

.custom-check {
  width: 18px;
  height: 18px;
  accent-color: #5865f2;
  cursor: pointer;
}

/* ==========================================================================
   Responsive Breakpoints
   ========================================================================== */
@media (max-width: 1080px) {
  .monitor-columns {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .arcade-panel {
    padding: 14px;
  }

  .hero-body.fitted-hero {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .hero-pet-preview.fitted-pet {
    margin: 0 auto;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .agents-list {
    grid-template-columns: 1fr;
  }

  .card-top-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-right-group {
    margin-left: 0;
  }
}
</style>
