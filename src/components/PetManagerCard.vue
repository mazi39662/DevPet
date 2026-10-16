<template>
  <div class="discord-pet-card" :class="{ 'card-deployed': deployed }">
    <!-- Card Top Header Banner -->
    <div class="pet-card-banner" :class="themeClass + '-banner'">
      <div class="pet-banner-chip" :class="themeClass">
        <span>{{ bannerTag }}</span>
      </div>
      <div class="pet-badge-status" :class="deployed ? 'deployed' : 'docked'">
        {{ deployed ? '● ON DESKTOP' : '○ DOCKED / OFF' }}
      </div>
    </div>

    <!-- Pet Body Content & Slot for Avatar Preview -->
    <div class="pet-card-body">
      <div class="pet-avatar-arcade" :class="themeClass + '-theme'">
        <slot name="avatar" />
      </div>

      <div class="pet-info-column">
        <div class="pet-name-row">
          <h3 class="pet-display-name">{{ petName }}</h3>
          <span class="pet-role-tag" :class="themeClass">{{ roleTag }}</span>
        </div>
        <p class="pet-desc-text">
          <slot name="description">{{ description }}</slot>
        </p>

        <!-- Dynamic Stat Badges -->
        <div class="pet-stats-badges">
          <slot name="stats" />
        </div>
      </div>
    </div>

    <!-- Pet Action Footer With Arcade Toggle Switch -->
    <div class="pet-card-footer">
      <div class="arcade-switch-control" @click="$emit('toggle-deploy')">
        <div class="arcade-toggle" :class="{ on: deployed }">
          <span class="toggle-knob"></span>
        </div>
        <span class="toggle-text">
          {{ deployed ? 'Desktop Window Active' : 'Desktop Window Hidden' }}
        </span>
      </div>

      <!-- Footer Buttons -->
      <div class="footer-btn-group">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PetManagerCard Component
 * Reusable Discord-server style mascot showcase card for Codi and Momo.
 */
withDefaults(
  defineProps<{
    petName: string;
    roleTag: string;
    bannerTag: string;
    themeClass?: 'codi' | 'momo' | 'moki';
    deployed: boolean;
    description?: string;
  }>(),
  {
    themeClass: 'codi',
    deployed: false,
    description: '',
  }
);

defineEmits<{
  (e: 'toggle-deploy'): void;
}>();
</script>

<style scoped>
.discord-pet-card {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.discord-pet-card:hover {
  transform: translateY(-2px);
  border-color: #4e5058;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

.discord-pet-card.card-deployed {
  border-color: rgba(88, 101, 242, 0.6);
  box-shadow: 0 8px 30px rgba(88, 101, 242, 0.15);
}

.pet-card-banner {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.pet-card-banner.codi-banner {
  background: linear-gradient(90deg, rgba(88, 101, 242, 0.25) 0%, rgba(30, 31, 34, 0.4) 100%);
}

.pet-card-banner.momo-banner {
  background: linear-gradient(90deg, rgba(242, 63, 67, 0.25) 0%, rgba(30, 31, 34, 0.4) 100%);
}

.pet-card-banner.moki-banner {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.25) 0%, rgba(30, 31, 34, 0.4) 100%);
}

.pet-banner-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #5865f2;
}

.pet-banner-chip.momo {
  color: #f23f43;
}

.pet-banner-chip.moki {
  color: #f97316;
}

.banner-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5865f2;
}

.banner-chip-dot.momo {
  background: #f23f43;
}

.banner-chip-dot.moki {
  background: #f97316;
}

.pet-badge-status {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.pet-badge-status.deployed {
  background: rgba(35, 165, 90, 0.2);
  color: #23a55a;
  border: 1px solid rgba(35, 165, 90, 0.4);
}

.pet-badge-status.docked {
  background: rgba(78, 80, 88, 0.3);
  color: #949ba4;
  border: 1px solid #383a40;
}

.pet-card-body {
  padding: 20px;
  display: flex;
  gap: 20px;
  flex: 1;
}

.pet-avatar-arcade {
  width: 130px;
  height: 130px;
  border-radius: 16px;
  background: #1e1f22;
  border: 2px solid #383a40;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.pet-avatar-arcade.codi-theme {
  box-shadow: inset 0 0 20px rgba(88, 101, 242, 0.15);
}

.pet-avatar-arcade.momo-theme {
  box-shadow: inset 0 0 20px rgba(242, 63, 67, 0.15);
}

.pet-avatar-arcade.moki-theme {
  box-shadow: inset 0 0 20px rgba(249, 115, 22, 0.2);
}

.pet-info-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pet-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pet-display-name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}

.pet-role-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(88, 101, 242, 0.18);
  color: #5865f2;
  border: 1px solid rgba(88, 101, 242, 0.3);
}

.pet-role-tag.momo {
  background: rgba(242, 63, 67, 0.18);
  color: #f23f43;
  border-color: rgba(242, 63, 67, 0.3);
}

.pet-role-tag.moki {
  background: rgba(249, 115, 22, 0.18);
  color: #fb923c;
  border-color: rgba(249, 115, 22, 0.3);
}

.pet-desc-text {
  margin: 0;
  font-size: 13px;
  color: #949ba4;
  line-height: 1.45;
}

.pet-stats-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}

:deep(.stat-badge) {
  background: #1e1f22;
  border: 1px solid #383a40;
  padding: 5px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

:deep(.stat-lbl) {
  font-size: 10px;
  font-weight: 800;
  color: #949ba4;
  letter-spacing: 0.5px;
}

:deep(.stat-val) {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}

:deep(.stat-val.capitalize) {
  text-transform: capitalize;
}

:deep(.font-mono) {
  font-family: 'JetBrains Mono', monospace;
}

.pet-card-footer {
  padding: 14px 20px;
  background: #232428;
  border-top: 1px solid #313338;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.arcade-switch-control {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.arcade-toggle {
  width: 44px;
  height: 24px;
  background: #4e5058;
  border-radius: 14px;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.arcade-toggle.on {
  background: #23a55a;
}

.toggle-knob {
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.arcade-toggle.on .toggle-knob {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 13px;
  font-weight: 700;
  color: #dbdee1;
  white-space: nowrap;
}

.footer-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
</style>
