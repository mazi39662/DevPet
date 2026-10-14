<template>
  <div class="pets-manager-container">
    <!-- Arcade Roster Hero Banner -->
    <div class="arcade-hero-banner">
      <div class="arcade-banner-content">
        <div class="arcade-badge-tag">
          <span>DESKTOP ARCADE ROSTER</span>
        </div>
        <h2 class="arcade-title">Companion Pet Manager</h2>
        <p class="arcade-subtitle">
          Deploy your desktop companions side-by-side! <strong>Codi</strong> tracks coding agents, <strong>Momo</strong> keeps you in pomodoro flow, and <strong>Moki</strong> bursts typing particles & reminds you to stretch.
        </p>
      </div>
      <div class="arcade-status-pill">
        <span class="pill-count-text">{{ activePetsCount }} / 3 PETS DEPLOYED</span>
      </div>
    </div>

    <!-- Pet Cards Grid (Discord Server Cards) -->
    <div class="pet-cards-grid">
      <!-- PET 1: Codi (Coding Agent Mascot) -->
      <PetManagerCard
        pet-name="Codi"
        role-tag="Code Companion"
        banner-tag="CODING AGENT"
        theme-class="codi"
        :deployed="agentCompanionVisible"
        @toggle-deploy="$emit('toggle-agent')"
      >
        <template #avatar>
          <CompanionPet
            :status="currentStatus.status"
            :label="currentStatus.detail"
            agent-name="Codi"
            :show-bubble="false"
            :sound-enabled="soundEnabled"
          />
        </template>

        <template #description>
          Monitors live activity across Antigravity, VS Code, and Codex. Displays live thinking, typing at a miniature glowing laptop, and celebratory chimes!
        </template>

        <template #stats>
          <div class="stat-badge">
            <span class="stat-lbl">AGENT</span>
            <span class="stat-val">{{ activeAgentName || 'Antigravity' }}</span>
          </div>
          <div class="stat-badge">
            <span class="stat-lbl">STATUS</span>
            <span class="stat-val capitalize">{{ currentStatus.status }}</span>
          </div>
        </template>

        <template #actions>
          <button class="arcade-btn secondary" @click="$emit('test-chime')" title="Play test celebration chime">
            🔊 Test Sound
          </button>
          <!-- <button class="arcade-btn primary" @click="$emit('focus-app')" title="Focus AI coding application window">
            🚀 Focus App
          </button> -->
          <button class="arcade-btn primary" @click="$emit('open-monitor')" title="Open Codi monitor channel">
            🐾 Settings
          </button>
        </template>
      </PetManagerCard>

      <!-- PET 2: Momo (Pomodoro Mascot) -->
      <PetManagerCard
        pet-name="Momo"
        role-tag="Sprint Mascot"
        banner-tag="POMODORO FOCUS"
        theme-class="momo"
        :deployed="pomodoroCompanionVisible"
        @toggle-deploy="$emit('toggle-pomo')"
      >
        <template #avatar>
          <PomodoroPet
            :interactive="false"
            :sound-enabled="soundEnabled"
          />
        </template>

        <template #description>
          Dedicated focus buddy! Types furiously on a glowing laptop during deep focus sprints, and sips cozy tea during refreshing breaks.
        </template>

        <template #stats>
          <div class="stat-badge">
            <span class="stat-lbl">PHASE</span>
            <span class="stat-val">{{ pomoPhase === 'focus' ? 'Deep Work' : 'Break Time' }}</span>
          </div>
          <div class="stat-badge">
            <span class="stat-lbl">TIMER</span>
            <span class="stat-val font-mono">{{ formattedTime }}</span>
          </div>
        </template>

        <template #actions>
          <button class="arcade-btn secondary" @click="$emit('test-focus-sound')" title="Play test focus chime">
            🔔 Test Sound
          </button>
          <button class="arcade-btn accent" @click="$emit('open-timer')" title="Open Momo sprint station">
            🍅 Settings
          </button>
        </template>
      </PetManagerCard>

      <!-- PET 3: Moki (Keyboard & Wellness Mascot) -->
      <PetManagerCard
        pet-name="Moki"
        role-tag="Wellness & Typing"
        banner-tag="KEYBOARD & STRETCH"
        theme-class="moki"
        :deployed="mokiCompanionVisible"
        @toggle-deploy="$emit('toggle-moki')"
      >
        <template #avatar>
          <MokiPet
            :interactive="false"
            :sound-enabled="soundEnabled"
          />
        </template>

        <template #description>
          Spawns colorful letter particles with every key typed, tracks live WPM typing speed, expresses playful animations, and manages sticky notes & quick checklists!
        </template>

        <template #stats>
          <div class="stat-badge">
            <span class="stat-lbl">TYPING</span>
            <span class="stat-val font-mono">{{ mokiWpm }} WPM</span>
          </div>
          <div class="stat-badge">
            <span class="stat-lbl">KEYS TYPED</span>
            <span class="stat-val font-mono">{{ mokiKeystrokes }}</span>
          </div>
        </template>

        <template #actions>
          <button class="arcade-btn secondary" @click="$emit('test-key-sound')" title="Play test mechanical key sound">
            ⌨️ Test Sound
          </button>
          <button class="arcade-btn primary" @click="$emit('open-moki')" title="Open Moki keyboard & wellness station">
            ✨ Settings
          </button>
        </template>
      </PetManagerCard>
    </div>

    <!-- Bottom Configuration Dock -->
    <div class="arcade-dock-card">
      <div class="dock-header">
        <span class="dock-icon">🕹️</span>
        <div class="dock-title-group">
          <h4 class="dock-title">Global Companion Configuration</h4>
          <p class="dock-desc">Adjust window footprint and audio feedback settings for floating mascots</p>
        </div>
      </div>

      <div class="dock-settings-row">
        <label class="discord-toggle-row">
          <div class="toggle-desc-group">
            <span class="discord-toggle-label">Compact Mascot Mode</span>
            <span class="discord-toggle-sub">Shrinks floating window footprint for low distraction</span>
          </div>
          <input
            type="checkbox"
            class="custom-check"
            :checked="companionMini"
            @change="$emit('update:companionMini', ($event.target as HTMLInputElement).checked)"
          />
        </label>

        <label class="discord-toggle-row">
          <div class="toggle-desc-group">
            <span class="discord-toggle-label">Master Audio Chimes</span>
            <span class="discord-toggle-sub">Enable game-style chimes and break bells</span>
          </div>
          <input
            type="checkbox"
            class="custom-check"
            :checked="soundEnabled"
            @change="$emit('update:soundEnabled', ($event.target as HTMLInputElement).checked)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PetManagerView Component
 * The default landing page in DevPet. Displays both Codi and Momo roster cards,
 * deployment statuses, and global desktop companion controls.
 */
import CompanionPet from './CompanionPet.vue';
import PomodoroPet from './PomodoroPet.vue';
import MokiPet from './MokiPet.vue';
import PetManagerCard from './PetManagerCard.vue';
import type { StatusUpdate } from '../types/status';
import type { PomodoroPhase } from '../types/pomodoro';

defineProps<{
  activePetsCount: number;
  agentCompanionVisible: boolean;
  pomodoroCompanionVisible: boolean;
  mokiCompanionVisible: boolean;
  currentStatus: StatusUpdate;
  activeAgentName?: string;
  pomoPhase: PomodoroPhase;
  formattedTime: string;
  mokiWpm: number;
  mokiKeystrokes: string;
  soundEnabled: boolean;
  companionMini: boolean;
}>();

defineEmits<{
  (e: 'toggle-agent'): void;
  (e: 'toggle-pomo'): void;
  (e: 'toggle-moki'): void;
  (e: 'test-chime'): void;
  (e: 'test-focus-sound'): void;
  (e: 'test-key-sound'): void;
  (e: 'focus-app'): void;
  (e: 'open-monitor'): void;
  (e: 'open-timer'): void;
  (e: 'open-moki'): void;
  (e: 'update:companionMini', val: boolean): void;
  (e: 'update:soundEnabled', val: boolean): void;
}>();
</script>

<style scoped>
.pets-manager-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.arcade-hero-banner {
  background: linear-gradient(135deg, #2b2d31 0%, #1e1f22 100%);
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
}

.arcade-hero-banner::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; width: 140px;
  background: radial-gradient(circle at top right, rgba(88, 101, 242, 0.15), transparent 70%);
  pointer-events: none;
}

.arcade-badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #5865f2;
  background: rgba(88, 101, 242, 0.12);
  border: 1px solid rgba(88, 101, 242, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.arcade-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.arcade-led.green {
  background: #23a55a;
  box-shadow: 0 0 6px #23a55a;
}

.arcade-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
}

.arcade-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #949ba4;
  max-width: 680px;
  line-height: 1.5;
}

.arcade-status-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #111214;
  border: 1px solid #383a40;
  padding: 10px 18px;
  border-radius: 30px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
}

.pill-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4e5058;
}
.pill-dot.active {
  background: #23a55a;
  box-shadow: 0 0 10px #23a55a;
}

.pill-count-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.pet-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
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

.arcade-btn.accent {
  background: #f23f43;
  color: #ffffff;
}
.arcade-btn.accent:hover {
  background: #da373b;
  box-shadow: 0 4px 12px rgba(242, 63, 67, 0.4);
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

.arcade-btn.outline {
  background: transparent;
  border-color: #383a40;
  color: #dbdee1;
}
.arcade-btn.outline:hover {
  background: #1e1f22;
  border-color: #4e5058;
}

.arcade-dock-card {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.dock-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #313338;
}

.dock-icon {
  font-size: 24px;
}

.dock-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.dock-desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: #949ba4;
}

.dock-settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.discord-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e1f22;
  border: 1px solid #383a40;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.discord-toggle-row:hover {
  border-color: #5865f2;
}

.toggle-desc-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.discord-toggle-label {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.discord-toggle-sub {
  font-size: 11px;
  color: #949ba4;
}

.custom-check {
  width: 18px;
  height: 18px;
  accent-color: #5865f2;
  cursor: pointer;
}
</style>
