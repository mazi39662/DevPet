<template>
  <div class="momo-page-wrapper">
    <!-- Momo HD Mascot Spotlight & Lore Banner -->
    <PetProfileBanner
      pet-id="momo"
      name="Momo"
      title="Pomodoro Flow Guardian"
      badge-text="DEEP WORK & FOCUS"
      image-src="/pets/momo-hd.jpg"
      image-alt="Momo High-Definition Pomodoro Mascot"
      description="Momo is your cozy deep-work companion who protects your focus state. Wearing glowing noise-canceling headphones with fresh tomato leaves, Momo keeps you locked into intense 25-minute coding sprints and gently reminds you to rest your eyes, stretch, and sip warm tea during restorative breaks."
      :deployed="pomodoroCompanionVisible"
      :traits="[
        { icon: '🍅', label: '25m Focus Sprint', desc: 'Deep work interval with laptop typing animation' },
        { icon: '🍵', label: '5m Restorative Break', desc: 'Warm tea drinking animation and eye rest nudges' },
        { icon: '🎧', label: 'Distraction Shield', desc: 'Promotes uninterrupted coding flow' },
        { icon: '🔔', label: 'Acoustic Chimes', desc: 'Procedural Web Audio bell notifications' }
      ]"
      @toggle-deploy="$emit('toggle-pomo')"
    />

    <div class="pomodoro-grid">
      <!-- Left: Focus Timer Clock & Stepper Controls -->
      <PomodoroTimerClock
      :phase="pomoState.phase"
      :status="pomoState.status"
      :time-remaining="pomoState.timeRemaining"
      :total-duration="pomoState.totalDuration"
      :completed-sessions="pomoState.completedSessions"
      :focus-minutes="settings.pomodoroConfig.focusMinutes"
      :break-minutes="settings.pomodoroConfig.breakMinutes"
      @toggle-timer="$emit('toggle-timer')"
      @skip-phase="$emit('skip-phase')"
      @reset-timer="$emit('reset-timer')"
      @switch-phase="$emit('switch-phase', $event)"
      @set-duration="$emit('set-duration', $event)"
      @step-duration="$emit('step-duration', $event)"
    />

    <!-- Right: Momo Preview, Desktop Deploy & Focus Chimes -->
    <div class="pomodoro-sidebar">
      <!-- Mascot Preview Box -->
      <div class="arcade-panel pomo-pet-card">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">🐱</span>
            <h3 class="panel-title">Momo Mascot Preview</h3>
          </div>
          <span class="badge-tag" :class="{ running: pomoState.status === 'running' }">
            {{ pomoState.status === 'running' ? (pomoState.phase === 'focus' ? 'Deep Work Mode' : 'Resting') : 'Idle' }}
          </span>
        </div>

        <div class="pet-showcase-row">
          <div class="pet-avatar-wrapper momo-glow">
            <PomodoroPet
              :interactive="false"
              :sound-enabled="settings.soundEnabled"
            />
          </div>

          <div class="pet-showcase-meta">
            <h4 class="meta-title">Momo</h4>
            <p class="meta-desc">
              Momo enters <strong>laptop typing mode</strong> with energetic paws during focus sprints, and holds warm tea when it's break time.
            </p>

            <div class="pet-desktop-toggle-row">
              <span class="toggle-status-label">
                Desktop Window: <strong>{{ pomodoroCompanionVisible ? 'Active' : 'Hidden' }}</strong>
              </span>
              <button
                class="arcade-btn btn-sm"
                :class="pomodoroCompanionVisible ? 'danger' : 'accent'"
                @click="$emit('toggle-pomo')"
              >
                {{ pomodoroCompanionVisible ? '✕ Dock Momo' : '✦ Deploy Momo' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Focus Audio Preferences -->
      <div class="arcade-panel settings-card">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-icon">🔊</span>
            <h3 class="panel-title">Audio Chimes</h3>
          </div>
        </div>
        <div class="settings-list">
          <label class="setting-toggle">
            <div class="toggle-info">
              <span class="toggle-label">Focus Notifications</span>
              <span class="toggle-desc">Sound alert on session completions</span>
            </div>
            <input
              type="checkbox"
              class="custom-check"
              :checked="settings.soundEnabled"
              @change="$emit('update:soundEnabled', ($event.target as HTMLInputElement).checked)"
            />
          </label>
          <div class="sound-test-row">
            <button class="arcade-btn btn-sm secondary" @click="$emit('test-focus-sound')">
              🔔 Test Chime
            </button>
            <button class="arcade-btn btn-sm secondary" @click="$emit('test-break-sound')">
              🛎️ Test Bell
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MomoFocusView Component
 * Dedicated page for the Pomodoro Sprint Timer, duration customizations,
 * and Momo's mascot preview and audio configuration.
 */
import PomodoroPet from './PomodoroPet.vue';
import PomodoroTimerClock from './PomodoroTimerClock.vue';
import PetProfileBanner from './PetProfileBanner.vue';
import type { PomodoroPhase, PomodoroState } from '../types/pomodoro';
import type { Settings } from '../types/settings';

defineProps<{
  pomoState: PomodoroState;
  settings: Settings;
  pomodoroCompanionVisible: boolean;
}>();

defineEmits<{
  (e: 'toggle-timer'): void;
  (e: 'skip-phase'): void;
  (e: 'reset-timer'): void;
  (e: 'switch-phase', phase: PomodoroPhase): void;
  (e: 'set-duration', minutes: number): void;
  (e: 'step-duration', delta: number): void;
  (e: 'toggle-pomo'): void;
  (e: 'test-focus-sound'): void;
  (e: 'test-break-sound'): void;
  (e: 'update:soundEnabled', val: boolean): void;
}>();
</script>

<style scoped>
.pomodoro-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 24px;
}

.pomodoro-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.pomo-pet-card {
  padding: 20px;
}

.badge-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  background: #1e1f22;
  color: #949ba4;
}

.badge-tag.running {
  background: rgba(242, 63, 67, 0.2);
  color: #f23f43;
  border: 1px solid rgba(242, 63, 67, 0.3);
}

.pet-showcase-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.pet-avatar-wrapper {
  width: 125px;
  height: 125px;
  background: #1e1f22;
  border-radius: 14px;
  border: 2px solid #383a40;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.pet-avatar-wrapper.momo-glow {
  box-shadow: inset 0 0 18px rgba(242, 63, 67, 0.2);
}

.pet-showcase-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.meta-desc {
  margin: 0;
  font-size: 12px;
  color: #949ba4;
  line-height: 1.45;
}

.pet-desktop-toggle-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #313338;
}

.toggle-status-label {
  font-size: 12px;
  color: #dbdee1;
}

.sound-test-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
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

.custom-check {
  width: 18px;
  height: 18px;
  accent-color: #5865f2;
  cursor: pointer;
}
</style>
