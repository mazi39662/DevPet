<template>
  <div class="pet-profile-banner" :class="`theme-${petId}`">
    <!-- Ambient glowing backdrop gradient -->
    <div class="banner-ambient-glow" />

    <!-- Left: HD Portrait Showcase -->
    <div class="portrait-container">
      <div class="portrait-frame" @click="showImageModal = true" :title="'Click to view ' + name + ' in full HD'">
        <img :src="imageSrc" :alt="imageAlt || name" class="portrait-img" loading="eager" />
        <div class="portrait-overlay">
          <span class="zoom-hint">🔍 Zoom HD</span>
        </div>
        <div class="hd-badge">
          <span class="hd-dot"></span>
          <span>HD MASCOT</span>
        </div>
      </div>
    </div>

    <!-- Center/Right: Information, Lore & Traits -->
    <div class="banner-content">
      <!-- Top meta row: Badge & Title -->
      <div class="meta-header">
        <div class="title-cluster">
          <div class="badge-chip">
            <span class="chip-dot"></span>
            <span>{{ badgeText }}</span>
          </div>
          <h2 class="pet-name">
            {{ name }}
            <span class="pet-species-tag">{{ title }}</span>
          </h2>
        </div>

        <!-- Optional Desktop Toggle / Status Button -->
        <div v-if="deployed !== undefined" class="deploy-action-box">
          <button
            class="deploy-toggle-btn"
            :class="{ active: deployed }"
            @click="$emit('toggle-deploy')"
            :title="deployed ? 'Hide desktop companion' : 'Deploy companion to your desktop'"
          >
            <span class="status-indicator-dot" :class="{ on: deployed }"></span>
            <span>{{ deployed ? 'Desktop Active' : 'Deploy Mascot' }}</span>
          </button>
        </div>
      </div>

      <!-- About / Description Paragraph -->
      <p class="about-text">
        {{ description }}
      </p>

      <!-- Key Capabilities & Trait Badges -->
      <div class="traits-row">
        <div
          v-for="(trait, idx) in traits"
          :key="idx"
          class="trait-chip"
          :title="trait.desc || trait.label"
        >
          <span class="trait-icon">{{ trait.icon }}</span>
          <span class="trait-label">{{ trait.label }}</span>
        </div>
      </div>

      <!-- Bottom Custom Stats or Action Slot -->
      <div v-if="$slots.stats || (stats && stats.length > 0)" class="stats-ribbon">
        <slot name="stats">
          <div v-for="(s, idx) in stats" :key="idx" class="stat-pill">
            <span class="stat-lbl">{{ s.label }}</span>
            <span class="stat-val font-mono">{{ s.value }} <small v-if="s.unit">{{ s.unit }}</small></span>
          </div>
        </slot>
      </div>
    </div>

    <!-- Right Side Optional Slot (e.g., interactive live preview or widget) -->
    <div v-if="$slots.side" class="banner-side-container">
      <slot name="side" />
    </div>

    <!-- Fullscreen HD Image Lightbox Modal -->
    <Transition name="fade-modal">
      <div v-if="showImageModal" class="image-modal-backdrop" @click="showImageModal = false">
        <div class="image-modal-content" @click.stop>
          <div class="modal-header">
            <div class="modal-pet-title">
              <span class="modal-icon">✨</span>
              <h3>{{ name }} — High Resolution Portrait</h3>
            </div>
            <button class="modal-close-btn" @click="showImageModal = false" aria-label="Close">✕</button>
          </div>
          <div class="modal-image-wrap">
            <img :src="imageSrc" :alt="name" class="modal-img" />
          </div>
          <div class="modal-footer">
            <p class="modal-lore">{{ description }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface PetTrait {
  icon: string;
  label: string;
  desc?: string;
}

export interface PetStat {
  label: string;
  value: string | number;
  unit?: string;
}

withDefaults(
  defineProps<{
    petId: 'codi' | 'momo' | 'moki';
    name: string;
    title: string;
    badgeText: string;
    imageSrc: string;
    imageAlt?: string;
    description: string;
    traits: PetTrait[];
    deployed?: boolean;
    stats?: PetStat[];
  }>(),
  {
    imageAlt: '',
    deployed: undefined,
    stats: () => [],
  }
);

defineEmits<{
  (e: 'toggle-deploy'): void;
}>();

const showImageModal = ref(false);
</script>

<style scoped>
.pet-profile-banner {
  position: relative;
  border-radius: 18px;
  padding: 22px 26px;
  display: flex;
  align-items: center;
  gap: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  transition: transform 0.25s ease, border-color 0.25s ease;
  margin-bottom: 24px;
}

/* Themes */
.theme-codi {
  background: linear-gradient(135deg, rgba(23, 27, 44, 0.96) 0%, rgba(32, 34, 45, 0.98) 100%);
  border: 1px solid rgba(88, 101, 242, 0.35);
}
.theme-codi .banner-ambient-glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, transparent 70%);
  pointer-events: none;
}
.theme-codi .portrait-frame {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);
}
.theme-codi .badge-chip {
  background: rgba(88, 101, 242, 0.15);
  border-color: rgba(88, 101, 242, 0.4);
  color: #a5b4fc;
}
.theme-codi .chip-dot {
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.theme-momo {
  background: linear-gradient(135deg, rgba(39, 20, 26, 0.96) 0%, rgba(32, 28, 33, 0.98) 100%);
  border: 1px solid rgba(244, 63, 94, 0.35);
}
.theme-momo .banner-ambient-glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(251, 113, 133, 0.16) 0%, transparent 70%);
  pointer-events: none;
}
.theme-momo .portrait-frame {
  border-color: rgba(251, 113, 133, 0.5);
  box-shadow: 0 0 24px rgba(251, 113, 133, 0.25);
}
.theme-momo .badge-chip {
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.4);
  color: #fda4af;
}
.theme-momo .chip-dot {
  background: #fb7185;
  box-shadow: 0 0 8px #fb7185;
}

.theme-moki {
  background: linear-gradient(135deg, rgba(38, 28, 18, 0.96) 0%, rgba(32, 30, 31, 0.98) 100%);
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.theme-moki .banner-ambient-glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.16) 0%, transparent 70%);
  pointer-events: none;
}
.theme-moki .portrait-frame {
  border-color: rgba(251, 146, 60, 0.5);
  box-shadow: 0 0 24px rgba(251, 146, 60, 0.25);
}
.theme-moki .badge-chip {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fcd34d;
}
.theme-moki .chip-dot {
  background: #fb923c;
  box-shadow: 0 0 8px #fb923c;
}

/* Portrait */
.portrait-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portrait-frame {
  width: 140px;
  height: 140px;
  border-radius: 18px;
  border: 2px solid;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #111214;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}

.portrait-frame:hover {
  transform: scale(1.04) rotate(-0.5deg);
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.portrait-frame:hover .portrait-img {
  transform: scale(1.08);
}

.portrait-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.portrait-frame:hover .portrait-overlay {
  opacity: 1;
}

.zoom-hint {
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hd-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #f1f2f4;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.hd-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

/* Banner Content */
.banner-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.title-cluster {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-chip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid;
  text-transform: uppercase;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pet-name {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  color: #ffffff;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.pet-species-tag {
  font-size: 12px;
  font-weight: 600;
  color: #949ba4;
  letter-spacing: 0.2px;
}

/* Deploy Button */
.deploy-action-box {
  display: flex;
  align-items: center;
}

.deploy-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #dbdee1;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deploy-toggle-btn:hover {
  background: #2b2d31;
  border-color: #4e5058;
  color: #ffffff;
  transform: translateY(-1px);
}

.deploy-toggle-btn.active {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.status-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #80848e;
}

.status-indicator-dot.on {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

/* About Text */
.about-text {
  margin: 0;
  font-size: 13px;
  color: #c4c9ce;
  line-height: 1.55;
  max-width: 820px;
}

/* Traits Row */
.traits-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trait-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(17, 18, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #e3e5e8;
  transition: all 0.2s ease;
}

.trait-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.trait-icon {
  font-size: 13px;
}

/* Stats Ribbon */
.stats-ribbon {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.stat-pill {
  background: #111214;
  border: 1px solid #313338;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}

.stat-lbl {
  font-size: 10px;
  font-weight: 800;
  color: #949ba4;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat-val {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
}

.stat-val small {
  font-size: 10px;
  color: #949ba4;
  font-weight: 600;
}

/* Lightbox Modal */
.image-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.image-modal-content {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 20px;
  max-width: 640px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2b2d31;
}

.modal-pet-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-pet-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.modal-close-btn {
  background: #2b2d31;
  border: 1px solid #383a40;
  color: #949ba4;
  font-size: 14px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: #da373c;
  color: #ffffff;
  border-color: #da373c;
}

.modal-image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #111214;
  overflow: hidden;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-footer {
  padding: 14px 20px;
  background: #18191c;
  border-top: 1px solid #2b2d31;
}

.modal-lore {
  margin: 0;
  font-size: 13px;
  color: #c4c9ce;
  line-height: 1.5;
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.banner-side-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 900px) {
  .banner-side-container {
    display: none;
  }
}

@media (max-width: 768px) {
  .pet-profile-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .portrait-container {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
