<template>
  <div class="companion-window-root">
    <!-- Pomodoro Companion Pet (Momo) -->
    <template v-if="activePetType === 'pomodoro'">
      <PomodoroPet
        :mini="settings.companionMini"
        :sound-enabled="settings.soundEnabled"
        :interactive="true"
        @open-dashboard="openDashboard"
        @hide-pet="hideCompanion"
      />
    </template>

    <!-- Keyboard & Wellness Companion Pet (Moki) -->
    <template v-else-if="activePetType === 'moki'">
      <MokiPet
        :mini="settings.companionMini"
        :sound-enabled="settings.soundEnabled"
        :interactive="true"
        @open-dashboard="openDashboard"
        @hide-pet="hideCompanion"
      />
    </template>

    <!-- Coding Agent Companion Pet (Codi) -->
    <template v-else>
      <CompanionPet
        :status="state.status"
        :label="state.label"
        :agent-name="state.agentName || 'Codi'"
        :show-bubble="showBubble"
        :mini="settings.companionMini"
        :sound-enabled="settings.soundEnabled"
        @open-dashboard="openDashboard"
        @focus-app="focusAgentApp"
        @peek-bubble="triggerBubble(3000)"
      />

      <!-- Quick action buttons on hover (Codi) -->
      <div class="hover-controls" @mousedown.stop @mouseup.stop>
        <button class="icon-btn" title="Focus AI App (2-click mascot)" @mousedown.stop @click.stop="focusAgentApp">
          🚀
        </button>
        <button class="icon-btn" title="Open Dashboard (3-click mascot)" @mousedown.stop @click.stop="openDashboard">
          ⚙️
        </button>
        <button class="icon-btn" title="Hide Codi" @mousedown.stop @click.stop="hideCompanion">
          ✕
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CompanionPet from './components/CompanionPet.vue';
import PomodoroPet from './components/PomodoroPet.vue';
import MokiPet from './components/MokiPet.vue';
import { mokiCoordinator } from './services/mokiCoordinator';
import type { CelebrationEvent, CompanionState } from './types/status';
import type { Settings } from './types/settings';
import { DEFAULT_SETTINGS } from './types/settings';
import { EVENTS } from './types/events';
import { native, onEvent } from './services/native';
import { notificationService } from './services/notifications';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

const activePetType = ref<'agent' | 'pomodoro' | 'moki'>('agent');

const state = ref<CompanionState>({
  status: 'idle',
  label: 'Codi Ready',
  agentName: 'Codi',
  monitoring: true,
});

const settings = ref<Settings>({ ...DEFAULT_SETTINGS });
const showBubble = ref(false);
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleCompletedToIdle(delayMs = 4000) {
  if (completionTimer) clearTimeout(completionTimer);
  completionTimer = setTimeout(() => {
    if (state.value.status === 'completed') {
      state.value.status = 'idle';
      state.value.label = 'Codi Ready';
    }
    completionTimer = null;
  }, delayMs);
}

function triggerBubble(durationMs = 3000) {
  showBubble.value = true;
  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
  }
  bubbleTimer = setTimeout(() => {
    showBubble.value = false;
    bubbleTimer = null;
  }, durationMs);
}

onMounted(async () => {
  mokiCoordinator.init(false);

  // Determine pet type from query param or window label
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const petParam = urlParams.get('pet');
    if (petParam === 'pomodoro') {
      activePetType.value = 'pomodoro';
    } else if (petParam === 'moki') {
      activePetType.value = 'moki';
    } else {
      const win = getCurrentWebviewWindow();
      if (win.label.includes('pomodoro')) {
        activePetType.value = 'pomodoro';
      } else if (win.label.includes('moki')) {
        activePetType.value = 'moki';
      }
    }
  } catch {}

  // Show initial status for 3 seconds then auto-hide
  triggerBubble(3000);

  // Listen for broadcasted companion state updates from the dashboard coordinator
  await onEvent(EVENTS.companionState, (newState: CompanionState) => {
    const hasChanged = state.value.label !== newState.label || state.value.status !== newState.status;
    const wasWaiting = state.value.status === 'waiting';
    state.value = {
      ...newState,
      agentName: newState.agentName || 'Codi',
    };
    if (newState.status === 'completed') {
      scheduleCompletedToIdle(4000);
    } else if (completionTimer) {
      clearTimeout(completionTimer);
      completionTimer = null;
    }
    if (newState.status === 'waiting' && !wasWaiting) {
      if (settings.value.soundEnabled) {
        notificationService.playAlertChime();
      }
      if (settings.value.notificationsEnabled) {
        notificationService.notifyActionRequired(newState.agentName || 'Antigravity', settings.value, newState.label);
      }
    }
    if (hasChanged || !showBubble.value || newState.status === 'waiting') {
      triggerBubble(newState.status === 'waiting' ? 10000 : 3000);
    }
  });

  // Listen for celebration events
  await onEvent(EVENTS.celebrate, (ev: CelebrationEvent) => {
    state.value.status = 'completed';
    state.value.label = `${ev.agentName || 'Codi'} Completed Task!`;
    triggerBubble(3500);
    scheduleCompletedToIdle(4000);
    if (ev.playSound && settings.value.soundEnabled) {
      notificationService.playChime();
    }
  });

  // Listen for settings synchronization
  await onEvent(EVENTS.settings, (newSettings: Settings) => {
    settings.value = newSettings;
  });
});

async function openDashboard() {
  await native.showDashboard();
}

async function focusAgentApp() {
  await native.focusTargetApp(state.value.agentName?.toLowerCase() || 'antigravity');
}

async function hideCompanion() {
  if (activePetType.value === 'pomodoro') {
    await native.setPomodoroCompanionVisible(false);
  } else if (activePetType.value === 'moki') {
    await native.setMokiCompanionVisible(false);
  } else {
    await native.setCompanionVisible(false);
  }
}
</script>

<style scoped>
.companion-window-root {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
}

.hover-controls {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 30;
}

.companion-window-root:hover .hover-controls {
  opacity: 1;
}

.icon-btn {
  background: rgba(30, 39, 46, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d2dae2;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}

.icon-btn:hover {
  background: rgba(45, 52, 54, 1);
  color: #fff;
}
</style>
