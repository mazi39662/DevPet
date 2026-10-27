<template>
  <header class="app-header">
    <!-- Left: Brand Identity -->
    <div class="brand">
      <div class="brand-avatar" @click="selectTab('pets')" title="Return to Pet Manager">
        <span class="pixel-pet-icon">🐾</span>
        <span class="avatar-sparkle">✨</span>
      </div>
      <div class="brand-text">
        <div class="brand-title-row">
          <h1 class="brand-title" @click="selectTab('pets')">DevPet</h1>
          <span class="fleet-status-chip">
            <span class="status-live-beacon"></span>
            Developer's Desktop Companion
          </span>
        </div>
        <p class="brand-subtitle">Desktop Companions & Productivity Ecosystem</p>
      </div>
    </div>

    <!-- Right: Header Quick Toggles for Adding Pets on Desktop + Burger Button -->
    <div class="header-actions">
      <!-- Desktop Companions Quick-Toggles Strip (Header) -->
      <div class="fleet-control-group">
        <div class="fleet-label-row">
          <span class="fleet-control-title">DESKTOP PETS</span>
          <span class="fleet-count-chip">{{ activeDesktopPetsCount }}/{{ allPets.length }}</span>
        </div>

        <div class="header-toggles-track">
          <button
            v-for="pet in allPets"
            :key="`hdr-toggle-${pet.id}`"
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

      <!-- Burger Menu Button -->
      <button
        class="burger-toggle-btn"
        :class="{ open: isBurgerOpen }"
        @click="toggleBurgerMenu"
        title="Open Navigation & Fleet Menu"
        aria-label="Toggle navigation drawer"
      >
        <span class="burger-bar top"></span>
        <span class="burger-bar mid"></span>
        <span class="burger-bar bot"></span>
      </button>
    </div>

    <!-- Scalable Burger Menu Drawer & Backdrop Overlay -->
    <teleport to="body">
      <transition name="drawer-fade">
        <div v-if="isBurgerOpen" class="burger-backdrop" @click="closeBurger">
          <aside class="burger-drawer" @click.stop>
            <!-- Drawer Header -->
            <div class="drawer-header">
              <div class="drawer-title-group">
                <div class="drawer-avatar">🐾</div>
                <div>
                  <h3 class="drawer-title">Menu</h3>
                  <p class="drawer-subtitle">Dashboard & Companion Controls</p>
                </div>
              </div>
              <button class="drawer-close-btn" @click="closeBurger" title="Close menu">✕</button>
            </div>

            <!-- Drawer Body -->
            <div class="drawer-content">
              <!-- SECTION: Desktop Companions & Pet Manager -->
              <div class="drawer-section">
                <div class="section-label-row">
                  <span class="section-tag">DESKTOP COMPANIONS</span>
                  <span class="section-status-pill">{{ activeDesktopPetsCount }} DEPLOYED</span>
                </div>
                <p class="section-hint">Toggle floating companions directly to your desktop screen</p>

                <!-- Pet Manager Button in Desktop Companions -->
                <button
                  class="burger-pet-manager-btn"
                  :class="{ active: currentTab === 'pets' }"
                  @click="navigateFromBurger('pets')"
                  title="Open Pet Manager Roster & Overview"
                >
                  <div class="bpm-left">
                    <div class="bpm-icon-box">
                      <span class="bpm-icon">🎮</span>
                    </div>
                    <div class="bpm-meta">
                      <div class="bpm-title-line">
                        <span class="bpm-title">Pet Manager</span>
                        <span class="bpm-badge">OVERVIEW</span>
                      </div>
                      <span class="bpm-sub">Fleet Roster, Stats & Habitats</span>
                    </div>
                  </div>
                  <span class="bpm-arrow">➔</span>
                </button>

                <div class="burger-pets-list">
                  <div
                    v-for="pet in allPets"
                    :key="`burger-pet-${pet.id}`"
                    class="burger-pet-card"
                    :class="{ deployed: pet.companionVisible }"
                    :style="{ '--pet-accent': pet.accentColor }"
                  >
                    <div class="burger-pet-left" @click="navigateFromBurger(pet.id)">
                      <div class="burger-pet-ico-box">
                        <span class="burger-pet-ico">{{ pet.icon }}</span>
                        <span class="burger-pet-glow"></span>
                      </div>
                      <div class="burger-pet-meta">
                        <div class="burger-pet-title-line">
                          <span class="burger-pet-name">{{ pet.name }}</span>
                          <span v-if="pet.badge" class="burger-pet-badge" :class="pet.badgeClass">
                            {{ pet.badge }}
                          </span>
                        </div>
                        <span class="burger-pet-role">{{ pet.role }}</span>
                      </div>
                    </div>

                    <!-- Direct Desktop Toggle Switch -->
                    <button
                      class="burger-toggle-action-btn"
                      :class="{ active: pet.companionVisible }"
                      @click="onPetToggle(pet)"
                      :title="pet.companionVisible ? `Remove ${pet.name} from desktop` : `Add ${pet.name} to desktop`"
                    >
                      <span class="toggle-dot"></span>
                      <span class="toggle-text">{{ pet.companionVisible ? 'Active' : 'Add' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION 2: System, Settings & Info -->
              <div class="drawer-section">
                <div class="section-label-row">
                  <span class="section-tag">SYSTEM & PREFERENCES</span>
                </div>

                <div class="burger-menu-list">
                  <button
                    class="burger-menu-item"
                    :class="{ active: currentTab === 'settings' }"
                    @click="navigateFromBurger('settings')"
                  >
                    <div class="bmi-left">
                      <span class="bmi-icon">⚙️</span>
                      <div class="bmi-meta">
                        <span class="bmi-title">Settings & Audio</span>
                        <span class="bmi-sub">Volume, Window & Preferences</span>
                      </div>
                    </div>
                    <span class="bmi-arrow">➔</span>
                  </button>

                  <button
                    class="burger-menu-item"
                    :class="{ active: currentTab === 'tutorials' }"
                    @click="navigateFromBurger('tutorials')"
                  >
                    <div class="bmi-left">
                      <span class="bmi-icon">🎓</span>
                      <div class="bmi-meta">
                        <span class="bmi-title">Tutorials & Academy</span>
                        <span class="bmi-sub">Interactive Guides & Shortcuts</span>
                      </div>
                    </div>
                    <span class="bmi-arrow">➔</span>
                  </button>

                  <button
                    class="burger-menu-item"
                    :class="{ active: currentTab === 'about' }"
                    @click="navigateFromBurger('about')"
                  >
                    <div class="bmi-left">
                      <span class="bmi-icon">ℹ️</span>
                      <div class="bmi-meta">
                        <span class="bmi-title">About DevPet</span>
                        <span class="bmi-sub">Creator: Terence Franz Indenerio</span>
                      </div>
                    </div>
                    <span class="bmi-arrow">➔</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Drawer Footer -->
            <div class="drawer-footer">
              <button class="drawer-onboarding-btn" @click="triggerOnboardingTour" title="Replay Welcome & Onboarding Wizard">
                <span>🚀</span> Replay Onboarding
              </button>
              <div class="drawer-dev-tag" @click="navigateFromBurger('about')">
                <span class="heart-pulse">💖</span>
                <span>Crafted by <strong>Terence Franz Indenerio</strong></span>
              </div>
              <span class="drawer-version">v0.2.0</span>
            </div>
          </aside>
        </div>
      </transition>
    </teleport>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export interface PetConfigItem {
  id: 'pets' | 'monitor' | 'pomodoro' | 'moki' | 'settings' | 'about' | 'tutorials' | string;
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
    currentTab: 'pets' | 'monitor' | 'pomodoro' | 'moki' | 'settings' | 'about' | 'tutorials' | string;
    activePetsCount: number;
    agentStatus: string;
    pomoRunning: boolean;
    formattedTime: string;
    mokiWpm: number;
    agentCompanionVisible: boolean;
    pomodoroCompanionVisible: boolean;
    mokiCompanionVisible: boolean;
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
  (e: 'open-onboarding'): void;
}>();

const isBurgerOpen = ref(false);

function toggleBurgerMenu() {
  isBurgerOpen.value = !isBurgerOpen.value;
}

function closeBurger() {
  isBurgerOpen.value = false;
}

function triggerOnboardingTour() {
  closeBurger();
  emit('open-onboarding');
}

function selectTab(tab: any) {
  emit('update:currentTab', tab);
}

function navigateFromBurger(tab: any) {
  selectTab(tab);
  closeBurger();
}

// Unified Scalable Pet Roster
const allPets = computed<PetConfigItem[]>(() => {
  const basePets: PetConfigItem[] = [
    {
      id: 'moki',
      name: 'Moki',
      icon: '✨',
      role: 'Desktop Keyboard Mascot (Default)',
      accentColor: '#f59e0b',
      badge: props.mokiWpm > 0 ? `${props.mokiWpm} WPM` : undefined,
      badgeClass: 'moki-speed',
      badgePulse: props.mokiWpm >= 60,
      companionVisible: props.mokiCompanionVisible,
      toggleEvent: 'toggle-moki',
    },
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
  padding: 10px 22px;
  background: rgba(18, 20, 26, 0.94);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 16px;
  min-height: 66px;
  box-sizing: border-box;
}

/* ==========================================================================
   Brand & Fleet Status
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
  background: linear-gradient(135deg, #38bdf8 0%, #8b5cf6 50%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.brand-avatar:hover {
  transform: scale(1.08) rotate(4deg);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.6);
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
  font-size: 19px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.5px;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: opacity 0.2s;
}

.brand-title:hover {
  opacity: 0.9;
}

.fleet-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 800;
  color: #34d399;
  letter-spacing: 0.6px;
  font-family: 'JetBrains Mono', monospace;
}

.status-live-beacon {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: beaconPulse 1.8s infinite ease-in-out;
}

@keyframes beaconPulse {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.3); }
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #949ba4;
  font-weight: 500;
  white-space: nowrap;
}

/* ==========================================================================
   Scalable Navigation Track
   ========================================================================== */
.nav-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 680px;
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
  background: rgba(14, 16, 22, 0.92);
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
  padding: 6px 12px;
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
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(56, 189, 248, 0.4);
}

.tab-btn.pet-tab-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  box-shadow: 0 0 14px color-mix(in srgb, var(--pet-accent) 35%, transparent),
              inset 0 0 0 1px color-mix(in srgb, var(--pet-accent) 60%, transparent);
}

.tab-btn.extra-tab-btn.active {
  background: rgba(139, 92, 246, 0.25);
  border: 1px solid rgba(139, 92, 246, 0.5);
  color: #ffffff;
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
  background: #10b981;
  color: #ffffff;
  padding: 1px 6px;
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
   Header Actions (Quick Toggles & Burger Menu Button)
   ========================================================================== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.pet-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  background: color-mix(in srgb, var(--pet-accent, #6366f1) 20%, rgba(20, 22, 28, 0.95));
  border-color: var(--pet-accent, #6366f1);
  color: #ffffff;
  box-shadow: 0 0 12px color-mix(in srgb, var(--pet-accent, #6366f1) 40%, transparent);
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

/* Burger Toggle Button */
.burger-toggle-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.burger-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: scale(1.04);
}

.burger-bar {
  display: block;
  width: 18px;
  height: 2px;
  background: #cbd5e1;
  border-radius: 2px;
  transition: all 0.25s ease;
}

.burger-toggle-btn.open .burger-bar.top {
  transform: translateY(6px) rotate(45deg);
}

.burger-toggle-btn.open .burger-bar.mid {
  opacity: 0;
  transform: translateX(-4px);
}

.burger-toggle-btn.open .burger-bar.bot {
  transform: translateY(-6px) rotate(-45deg);
}

/* ==========================================================================
   Teleported Burger Drawer Overlay
   ========================================================================== */
.burger-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
}

.burger-drawer {
  width: 380px;
  max-width: 90vw;
  height: 100%;
  background: #16181f;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #dbdee1;
  -webkit-font-smoothing: antialiased;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.drawer-title {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.drawer-subtitle {
  margin: 2px 0 0;
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.1px;
}

.drawer-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-family: 'Outfit', sans-serif;
}

.drawer-close-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.section-status-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  letter-spacing: 0.4px;
}

.section-hint {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
  line-height: 1.45;
}

/* Burger Pets List (Quick Toggles in Burger Menu) */
.burger-pets-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.burger-pet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.burger-pet-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.burger-pet-card.deployed {
  border-color: color-mix(in srgb, var(--pet-accent) 40%, transparent);
  background: color-mix(in srgb, var(--pet-accent) 8%, rgba(255, 255, 255, 0.02));
}

.burger-pet-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.burger-pet-ico-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--pet-accent);
  font-size: 17px;
}

.burger-pet-meta {
  display: flex;
  flex-direction: column;
}

.burger-pet-title-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.burger-pet-name {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.burger-pet-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.burger-pet-role {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: #94a3b8;
}

.burger-toggle-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.burger-toggle-action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.burger-toggle-action-btn.active {
  background: var(--pet-accent, #38bdf8);
  border-color: var(--pet-accent, #38bdf8);
  color: #0f172a;
  box-shadow: 0 0 10px color-mix(in srgb, var(--pet-accent) 50%, transparent);
}

.burger-toggle-action-btn .toggle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
}

.burger-toggle-action-btn.active .toggle-dot {
  background: #0f172a;
}

/* Pet Manager Action Card in Desktop Companions */
.burger-pet-manager-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.12), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(88, 101, 242, 0.35);
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  user-select: none;
  font-family: 'Outfit', sans-serif;
  margin-bottom: 2px;
}

.burger-pet-manager-btn:hover {
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.22), rgba(139, 92, 246, 0.2));
  border-color: rgba(88, 101, 242, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(88, 101, 242, 0.25);
}

.burger-pet-manager-btn:active {
  transform: translateY(0);
}

.burger-pet-manager-btn.active {
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.3), rgba(139, 92, 246, 0.32));
  border-color: #5865f2;
  box-shadow: 0 0 16px rgba(88, 101, 242, 0.45);
}

.bpm-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bpm-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(88, 101, 242, 0.2);
  border: 1px solid rgba(88, 101, 242, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.burger-pet-manager-btn:hover .bpm-icon-box {
  transform: scale(1.06);
}

.bpm-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bpm-title-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bpm-title {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.bpm-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(88, 101, 242, 0.25);
  color: #a5b4fc;
  letter-spacing: 0.5px;
}

.bpm-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 500;
}

.bpm-arrow {
  font-size: 14px;
  color: #818cf8;
  transition: transform 0.2s ease;
}

.burger-pet-manager-btn:hover .bpm-arrow {
  transform: translateX(3px);
  color: #ffffff;
}

/* System & Preferences Items in Menu */
.burger-menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.burger-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: #cbd5e1;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Outfit', sans-serif;
  user-select: none;
}

.burger-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  transform: translateX(2px);
}

.burger-menu-item.active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(139, 92, 246, 0.15));
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
}

.bmi-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bmi-icon {
  font-size: 18px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bmi-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bmi-title {
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.bmi-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.bmi-arrow {
  font-size: 12px;
  color: #64748b;
  transition: all 0.2s ease;
}

.burger-menu-item:hover .bmi-arrow {
  color: #38bdf8;
  transform: translateX(3px);
}

/* Drawer Footer */
.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(14, 16, 22, 0.6);
  font-family: 'Outfit', sans-serif;
  flex-wrap: wrap;
}

.drawer-onboarding-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.35);
  color: #818cf8;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Outfit', sans-serif;
}

.drawer-onboarding-btn:hover {
  background: rgba(88, 101, 242, 0.28);
  color: #ffffff;
  transform: translateY(-1px);
}

.drawer-dev-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.drawer-dev-tag:hover {
  color: #c4b5fd;
}

.drawer-dev-tag strong {
  color: #e2e8f0;
  font-weight: 700;
}

.heart-pulse {
  animation: heartBeat 1.5s infinite;
  display: inline-block;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.drawer-version {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
}

/* Drawer Transition */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
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
    padding: 10px 16px;
    gap: 10px;
  }
  .nav-container {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  .fleet-control-group {
    display: none; /* Accessible in the burger menu! */
  }
}
</style>
