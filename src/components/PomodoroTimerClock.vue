<template>
  <div class="arcade-panel pomo-hero-card">
    <!-- Phase Selector (Discord Channel Pill Style) -->
    <div class="phase-selector">
      <button
        class="phase-btn focus-tab"
        :class="{ active: phase === 'focus' }"
        @click="$emit('switch-phase', 'focus')"
      >
        <span class="phase-icon">🍅</span>
        Focus Sprint
        <span class="phase-min">{{ focusMinutes }}m</span>
      </button>
      <button
        class="phase-btn break-tab"
        :class="{ active: phase === 'break' }"
        @click="$emit('switch-phase', 'break')"
      >
        <span class="phase-icon">☕</span>
        Break Time
        <span class="phase-min">{{ breakMinutes }}m</span>
      </button>
    </div>

    <!-- Glowing Circular Countdown Timer -->
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
            :class="[phase, { pulsing: status === 'running' }]"
            cx="100"
            cy="100"
            r="88"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="clockDashOffset"
          />
        </svg>

        <div class="clock-content">
          <span class="phase-label" :class="phase">
            {{ phase === 'focus' ? '⚡ DEEP FLOW' : '🌿 REST & RESET' }}
          </span>
          <span class="clock-digits">{{ formatMmSs(timeRemaining) }}</span>
          <span class="clock-status-tag" :class="status">
            {{ status === 'running' ? (phase === 'focus' ? 'Session In Progress' : 'Break In Progress') : (status === 'paused' ? 'Paused' : 'Ready to Start') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Primary Timer Action Buttons -->
    <div class="timer-controls">
      <button
        class="arcade-btn play-btn"
        :class="{ running: status === 'running' }"
        @click="$emit('toggle-timer')"
      >
        <span class="ctrl-icon">{{ status === 'running' ? '⏸' : '▶' }}</span>
        {{ status === 'running' ? 'Pause' : (phase === 'focus' ? 'Start Focus' : 'Start Break') }}
      </button>
      <button class="arcade-btn secondary" @click="$emit('skip-phase')" title="Skip to next phase">
        ⏭ Skip
      </button>
      <button class="arcade-btn outline" @click="$emit('reset-timer')" title="Reset current phase timer">
        ↺ Reset
      </button>
    </div>

    <!-- Duration Customizer Presets -->
    <div class="duration-presets-panel">
      <div class="presets-header">
        <span class="presets-title">
          {{ phase === 'focus' ? 'Sprint Duration' : 'Break Duration' }}:
        </span>
        <div class="stepper-controls">
          <button class="step-btn" @click="$emit('step-duration', -1)">−</button>
          <span class="step-value">{{ activePhaseMinutes }}m</span>
          <button class="step-btn" @click="$emit('step-duration', 1)">+</button>
        </div>
      </div>

      <!-- Quick Preset Chips -->
      <div class="preset-chips" v-if="phase === 'focus'">
        <button
          v-for="m in [15, 20, 25, 30, 45, 50, 60]"
          :key="m"
          class="chip"
          :class="{ active: focusMinutes === m }"
          @click="$emit('set-duration', m)"
        >
          {{ m }}m
        </button>
      </div>
      <div class="preset-chips" v-else>
        <button
          v-for="m in [3, 5, 10, 15]"
          :key="m"
          class="chip"
          :class="{ active: breakMinutes === m }"
          @click="$emit('set-duration', m)"
        >
          {{ m }}m
        </button>
      </div>
    </div>

    <!-- Sprints Summary Box -->
    <div class="sprint-summary-box">
      <span class="sprint-label">Sessions Completed Today:</span>
      <span class="sprint-count-val">{{ completedSessions }} 🍅</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PomodoroPhase, PomodoroStatus } from '../types/pomodoro';

/**
 * Props for the Pomodoro Timer Hero Card
 */
const props = withDefaults(
  defineProps<{
    phase: PomodoroPhase;
    status: PomodoroStatus;
    timeRemaining: number;
    totalDuration: number;
    completedSessions: number;
    focusMinutes: number;
    breakMinutes: number;
  }>(),
  {
    phase: 'focus',
    status: 'idle',
    timeRemaining: 1500,
    totalDuration: 1500,
    completedSessions: 0,
    focusMinutes: 25,
    breakMinutes: 5,
  }
);

defineEmits<{
  (e: 'toggle-timer'): void;
  (e: 'skip-phase'): void;
  (e: 'reset-timer'): void;
  (e: 'switch-phase', phase: PomodoroPhase): void;
  (e: 'set-duration', minutes: number): void;
  (e: 'step-duration', delta: number): void;
}>();

// Circumference for r=88 is 2 * PI * 88 ~= 552.92
const circumference = 2 * Math.PI * 88;

const clockDashOffset = computed(() => {
  const total = props.totalDuration || 1;
  const remaining = props.timeRemaining;
  const progress = Math.max(0, Math.min(1, remaining / total));
  return circumference * (1 - progress);
});

const activePhaseMinutes = computed(() => {
  return props.phase === 'focus' ? props.focusMinutes : props.breakMinutes;
});

function formatMmSs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
</script>

<style scoped>
.arcade-panel {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
}

.phase-selector {
  display: flex;
  background: #111214;
  border: 1px solid #313338;
  border-radius: 12px;
  padding: 4px;
  gap: 6px;
  width: 100%;
  max-width: 360px;
  margin-bottom: 24px;
}

.phase-btn {
  flex: 1;
  padding: 9px 14px;
  background: transparent;
  border: none;
  color: #949ba4;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
}

.phase-btn:hover {
  color: #ffffff;
}

.phase-btn.focus-tab.active {
  background: #f23f43;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(242, 63, 67, 0.4);
}

.phase-btn.break-tab.active {
  background: #23a55a;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(35, 165, 90, 0.4);
}

.phase-min {
  font-size: 11px;
  opacity: 0.8;
  font-family: 'JetBrains Mono', monospace;
}

/* Clock Ring */
.timer-clock-hero {
  position: relative;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
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
  stroke: #1e1f22;
  stroke-width: 9;
}

.clock-progress-ring {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.clock-progress-ring.focus {
  stroke: #f23f43;
  filter: drop-shadow(0 0 10px rgba(242, 63, 67, 0.7));
}

.clock-progress-ring.break {
  stroke: #23a55a;
  filter: drop-shadow(0 0 10px rgba(35, 165, 90, 0.7));
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
  font-weight: 800;
  letter-spacing: 1px;
  color: #949ba4;
}

.phase-label.focus {
  color: #f23f43;
}

.phase-label.break {
  color: #23a55a;
}

.clock-digits {
  font-size: 46px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: #ffffff;
  letter-spacing: -1px;
  line-height: 1.1;
}

.clock-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  background: #1e1f22;
  color: #949ba4;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.clock-status-tag.running {
  background: rgba(242, 63, 67, 0.18);
  color: #f23f43;
  border: 1px solid rgba(242, 63, 67, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
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

.play-btn {
  min-width: 160px;
  background: #f23f43;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(242, 63, 67, 0.35);
}

.play-btn:hover {
  background: #da373b;
}

.play-btn.running {
  background: #f0b232;
  color: #111214;
  box-shadow: 0 4px 14px rgba(240, 178, 50, 0.35);
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

.ctrl-icon {
  margin-right: 4px;
}

/* Duration Customizer Presets */
.duration-presets-panel {
  width: 100%;
  max-width: 460px;
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.presets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.presets-title {
  font-size: 13px;
  font-weight: 700;
  color: #949ba4;
}

.stepper-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-btn {
  background: #2b2d31;
  border: 1px solid #383a40;
  color: #ffffff;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.step-btn:hover {
  background: #5865f2;
  border-color: #5865f2;
}

.step-value {
  font-size: 13px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: #ffffff;
  min-width: 50px;
  text-align: center;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: #2b2d31;
  border: 1px solid #383a40;
  color: #dbdee1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'JetBrains Mono', monospace;
}

.chip:hover {
  background: #383a40;
  color: #ffffff;
}

.chip.active {
  background: #f23f43;
  border-color: #f23f43;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(242, 63, 67, 0.35);
}

.sprint-summary-box {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #949ba4;
  background: #1e1f22;
  border: 1px solid #383a40;
  padding: 10px 18px;
  border-radius: 10px;
}

.sprint-count-val {
  font-weight: 800;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
}
</style>
