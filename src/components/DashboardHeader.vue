<template>
  <header class="app-header">
    <!-- Brand / Fleet Identity -->
    <div class="brand">
      <div class="brand-avatar" @click="$emit('update:currentTab', 'pets')">
        <span class="pixel-pet-icon">🐾</span>
        <span class="avatar-sparkle">✨</span>
      </div>
      <div class="brand-text">
        <div class="brand-title-row">
          <h1 class="brand-title">DevPet</h1>
          <span class="fleet-chip">
            <span class="pulse-indicator"></span>
            ARCADE HUB
          </span>
        </div>
        <p class="brand-subtitle">Desktop Companion Fleet & Productivity Mascots</p>
      </div>
    </div>

    <!-- Scalable Pet Navigation Track (Scrollable if many pets, sleek pill styling) -->
    <nav class="nav-container" ref="navContainerRef" @wheel.passive="onNavWheel">
      <div class="nav-tabs-track">
        <!-- Always Present: Pet Manager Overview Hub -->
        <button
          class="tab-btn hub-btn"
          :class="{ active: currentTab === 'pets' }"
          @click="$emit('update:currentTab', 'pets')"
          title="Pet Manager Hub (Overview & Settings)"
        >
          <span class="tab-icon hub-icon">🎮</span>
          <span class="tab-name">Pet Manager</span>
          <span class="tab-count-badge">{{ activePetsCount }} Active</span>
        </button>

        <div class="tab-divider"></div>

        <!-- Dynamic Scalable Pet Tabs List -->
        <button
          v-for="pet in allPets"
          :key="pet.id"
          class="tab-btn pet-tab-btn"
          :class="{
            active: currentTab === pet.id,
            'is-floating': pet.companionVisible,
          }"
          :style="{
            '--pet-accent': pet.accentColor,
          }"
          @click="$emit('update:currentTab', pet.id)"
          :title="`${pet.name} — ${pet.role}`"
        >
          <span class="pet-tab-avatar" :style="{ borderColor: pet.accentColor }">
            <span class="pet-icon">{{ pet.icon }}</span>
          </span>
          <span class="tab-name">{{ pet.name }}</span>

          <!-- Dynamic Badge (Status, Timer, WPM, or Info) -->
          <span
            v-if="pet.badge"
            class="tab-badge"
            :class="[pet.badgeClass, { pulse: pet.badgePulse }]"
          >
            {{ pet.badge }}
          </span>

          <!-- Mini Desktop Indicator Dot -->
          <span
            class="pet-status-dot"
            :class="{ active: pet.companionVisible }"
            :title="pet.companionVisible ? 'Active on desktop' : 'Hidden from desktop'"
          ></span>
        </button>
      </div>
    </nav>

    <!-- Scalable Desktop Companions Quick-Toggles Strip -->
    <div class="header-actions">
      <div class="fleet-control-group">
        <div class="fleet-label-row">
          <span class="fleet-control-title">DESKTOP COMPANIONS</span>
          <span class="fleet-count-chip">{{ activeDesktopPetsCount }}/{{ allPets.length }}</span>
        </div>

        <div class="header-toggles-track">
          <button
            v-for="pet in allPets"
            :key="`toggle-${pet.id}`"
            class="pet-pill-btn"
            :class="{ active: pet.companionVisible }"
            :style="{
              '--pet-accent': pet.accentColor,
            }"
            @click="onPetToggle(pet)"
            :title="`Toggle ${pet.name} (${pet.role}) on Desktop`"
          >
            <span class="pill-ico">{{ pet.icon }}</span>
            <span class="pill-name">{{ pet.name }}</span>
            <span class="pill-toggle-dot"></span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface PetConfigItem {
  id: 'pets' | 'monitor' | 'pomodoro' | 'moki' | string;
  name: string;
  icon: string;
  role: string;
  accentColor: string;
  badge?: string;
  badgeClass?: string;
  badgePulse?: boolean;
  companionVisible: boolean;
  toggleEvent: 'toggle-agent' | 'toggle-pomo' | 'toggle-moki' | string;
}

const props = withDefaults(
  defineProps<{
    currentTab: 'pets' | 'monitor' | 'pomodoro' | 'moki' | string;
    activePetsCount: number;
    agentStatus: string;
    pomoRunning: boolean;
    formattedTime: string;
    mokiWpm: number;
    agentCompanionVisible: boolean;
    pomodoroCompanionVisible: boolean;
    mokiCompanionVisible: boolean;
    /**
     * Optional extra pets to easily scale to 5, 8, 10+ pets in the future
     */
    customPets?: PetConfigItem[];
  }>(),
  {
    customPets: () => [],
  }
);

const emit = defineEmits<{
  (e: 'update:currentTab', tab: any): void;
  (e: 'toggle-agent'): void;
  (e: 'toggle-pomo'): void;
  (e: 'toggle-moki'): void;
  (e: 'toggle-pet', petId: string): void;
}>();

const navContainerRef = ref<HTMLElement | null>(null);

function onNavWheel(e: WheelEvent) {
  if (navContainerRef.value && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    navContainerRef.value.scrollLeft += e.deltaY;
  }
}

// Unified Scalable Pet Roster
const allPets = computed<PetConfigItem[]>(() => {
  const basePets: PetConfigItem[] = [
    {
      id: 'monitor',
      name: 'Codi',
      icon: '🐾',
      role: 'Coding Agent Assistant',
      accentColor: '#38bdf8',
      badge: props.agentStatus,
      badgeClass: props.agentStatus,
      badgePulse: props.agentStatus === 'working',
      companionVisible: props.agentCompanionVisible,
      toggleEvent: 'toggle-agent',
    },
    {
      id: 'pomodoro',
      name: 'Momo',
      icon: '🍅',
      role: 'Focus & Pomodoro Timer',
      accentColor: '#f43f5e',
      badge: props.pomoRunning ? props.formattedTime : undefined,
      badgeClass: props.pomoRunning ? 'pomo-running' : undefined,
      badgePulse: props.pomoRunning,
      companionVisible: props.pomodoroCompanionVisible,
      toggleEvent: 'toggle-pomo',
    },
    {
      id: 'moki',
      name: 'Moki',
      icon: '✨',
      role: 'Keyboard & Wellness Buddy',
      accentColor: '#f59e0b',
      badge: props.mokiWpm > 0 ? `${props.mokiWpm} WPM` : undefined,
      badgeClass: 'moki-speed',
      badgePulse: props.mokiWpm >= 60,
      companionVisible: props.mokiCompanionVisible,
      toggleEvent: 'toggle-moki',
    },
  ];

  if (props.customPets && props.customPets.length > 0) {
    return [...basePets, ...props.customPets];
  }
  return basePets;
});

const activeDesktopPetsCount = computed(() => {
  return allPets.value.filter((p) => p.companionVisible).length;
});

function onPetToggle(pet: PetConfigItem) {
  if (pet.toggleEvent === 'toggle-agent') {
    emit('toggle-agent');
  } else if (pet.toggleEvent === 'toggle-pomo') {
    emit('toggle-pomo');
  } else if (pet.toggleEvent === 'toggle-moki') {
    emit('toggle-moki');
  } else {
    emit('toggle-pet', pet.id);
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: rgba(20, 22, 27, 0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 16px;
  min-height: 64px;
  box-sizing: border-box;
}

/* ==========================================================================
   Brand & Fleet Hub Tag
   ========================================================================== */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand-avatar {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.brand-avatar:hover {
  transform: scale(1.08) rotate(4deg);
  box-shadow: 0 0 24px rgba(236, 72, 153, 0.6);
}

.avatar-sparkle {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 11px;
  animation: sparkleTwinkle 2s infinite ease-in-out alternate;
}
@keyframes sparkleTwinkle {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.6; }
  100% { transform: scale(1.2) rotate(20deg); opacity: 1; }
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
  background: linear-gradient(180deg, #ffffff 30%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fleet-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 1px 7px;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 6px;
  font-size: 9px;
  font-weight: 800;
  color: #818cf8;
  letter-spacing: 0.6px;
  font-family: 'JetBrains Mono', monospace;
}

.pulse-indicator {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: pulseDot 1.6s infinite ease-in-out;
}
@keyframes pulseDot {
  0%, 100% { opacity: 0.7; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #949ba4;
  font-weight: 500;
  white-space: nowrap;
}

/* ==========================================================================
   Scalable Navigation Track (Scrollable if many pets)
   ========================================================================== */
.nav-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 620px;
  min-width: 200px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 2px 4px;
}
.nav-container::-webkit-scrollbar {
  display: none;
}

.nav-tabs-track {
  display: inline-flex;
  align-items: center;
  background: rgba(14, 16, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  background: transparent;
  border: none;
  color: #949ba4;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
  white-space: nowrap;
  user-select: none;
  position: relative;
}

.tab-btn:hover {
  color: #f1f2f6;
  background: rgba(255, 255, 255, 0.06);
}

.tab-btn.hub-btn.active {
  background: #6366f1;
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.45);
}

.tab-btn.pet-tab-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  box-shadow: 0 0 14px color-mix(in srgb, var(--pet-accent) 35%, transparent),
              inset 0 0 0 1px color-mix(in srgb, var(--pet-accent) 60%, transparent);
}

.tab-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
  flex-shrink: 0;
}

.pet-tab-avatar {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.tab-name {
  font-weight: 700;
}

.tab-count-badge {
  font-size: 10px;
  background: #22c55e;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.tab-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
}

.tab-badge.pulse {
  animation: badgePulse 1.2s infinite alternate;
}
@keyframes badgePulse {
  0% { transform: scale(0.96); opacity: 0.75; }
  100% { transform: scale(1.04); opacity: 1; }
}

.tab-badge.pomo-running {
  background: rgba(244, 63, 94, 0.25);
  border: 1px solid rgba(244, 63, 94, 0.6);
  color: #f43f5e;
}

.tab-badge.moki-speed {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fbbf24;
}

.tab-badge.working {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #38bdf8;
}

.pet-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #475569;
  transition: all 0.2s ease;
}
.pet-status-dot.active {
  background: var(--pet-accent, #22c55e);
  box-shadow: 0 0 6px var(--pet-accent, #22c55e);
}

/* ==========================================================================
   Scalable Desktop Fleet Quick-Toggles
   ========================================================================== */
.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.fleet-control-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.fleet-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fleet-control-title {
  font-size: 9.5px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.6px;
  font-family: 'JetBrains Mono', monospace;
}

.fleet-count-chip {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  font-family: 'JetBrains Mono', monospace;
}

.header-toggles-track {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  max-width: 420px;
  padding: 1px;
}

.pet-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 16px;
  background: rgba(30, 32, 38, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #949ba4;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  user-select: none;
}

.pet-pill-btn:hover {
  background: rgba(45, 48, 56, 0.95);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.pet-pill-btn.active {
  background: color-mix(in srgb, var(--pet-accent, #6366f1) 18%, rgba(20, 22, 28, 0.9));
  border-color: var(--pet-accent, #6366f1);
  color: #ffffff;
  box-shadow: 0 0 10px color-mix(in srgb, var(--pet-accent, #6366f1) 40%, transparent);
}

.pill-ico {
  font-size: 12px;
}

.pill-toggle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #475569;
  transition: all 0.2s ease;
}

.pet-pill-btn.active .pill-toggle-dot {
  background: var(--pet-accent, #22c55e);
  box-shadow: 0 0 8px var(--pet-accent, #22c55e);
}

/* ==========================================================================
   Responsive Adaptations
   ========================================================================== */
@media (max-width: 1080px) {
  .brand-subtitle {
    display: none;
  }
}

@media (max-width: 900px) {
  .app-header {
    flex-wrap: wrap;
    padding: 8px 14px;
    gap: 8px;
  }
  .nav-container {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  .fleet-control-group {
    align-items: flex-start;
  }
}
</style>
