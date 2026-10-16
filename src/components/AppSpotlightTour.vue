<template>
  <teleport to="body">
    <transition name="tour-fade">
      <div v-if="isOpen" class="spotlight-tour-overlay" @click.self="skipTour">
        <!-- SVG Mask Cutout for Spotlight Glow -->
        <svg class="spotlight-mask-svg" width="100%" height="100%">
          <defs>
            <mask id="spotlight-mask">
              <!-- Everything white is opaque/dimmed -->
              <rect width="100%" height="100%" fill="white" />
              <!-- Cutout area is black (transparent) -->
              <rect
                v-if="targetRect"
                :x="targetRect.left - padding"
                :y="targetRect.top - padding"
                :width="targetRect.width + padding * 2"
                :height="targetRect.height + padding * 2"
                :rx="borderRadius"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(10, 12, 16, 0.78)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        <!-- Highlight Glow Border Ring -->
        <div
          v-if="targetRect"
          class="spotlight-highlight-ring"
          :style="{
            left: `${targetRect.left - padding}px`,
            top: `${targetRect.top - padding}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
            borderRadius: `${borderRadius}px`,
          }"
        >
          <div class="spotlight-pulse"></div>
        </div>

        <!-- Tooltip Floating Card -->
        <div
          v-if="targetRect"
          class="tour-tooltip-card"
          :style="tooltipStyle"
          role="dialog"
        >
          <!-- Tooltip Header -->
          <div class="tooltip-header">
            <span class="tooltip-badge">
              <span class="sparkle-dot">✨</span>
              STEP {{ currentStepIndex + 1 }} OF {{ tourSteps.length }}
            </span>
            <button class="tooltip-close" @click="skipTour" title="End tour">✕</button>
          </div>

          <!-- Tooltip Content -->
          <div class="tooltip-body">
            <div class="tooltip-title-row">
              <span class="tooltip-icon">{{ currentStep.icon }}</span>
              <h4 class="tooltip-title">{{ currentStep.title }}</h4>
            </div>
            <p class="tooltip-desc">{{ currentStep.description }}</p>
          </div>

          <!-- Tooltip Footer Controls -->
          <div class="tooltip-footer">
            <button class="tour-btn skip" @click="skipTour">Skip Tour</button>
            <div class="tour-nav-group">
              <button
                v-if="currentStepIndex > 0"
                class="tour-btn back"
                @click="prevStep"
              >
                ← Back
              </button>
              <button
                v-if="currentStepIndex < tourSteps.length - 1"
                class="tour-btn next"
                @click="nextStep"
              >
                Next →
              </button>
              <button
                v-else
                class="tour-btn finish"
                @click="finishTour"
              >
                Done 🎉
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  icon: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete'): void;
}>();

const padding = 8;
const borderRadius = 14;

const currentStepIndex = ref(0);
const targetRect = ref<DOMRect | null>(null);

const tourSteps: TourStep[] = [
  {
    selector: '.brand',
    title: 'Fleet Identity & Hub',
    description: 'Welcome to DevPet! Clicking the avatar or DevPet title at any time brings you back to the central Pet Manager roster.',
    icon: '🐾',
    placement: 'bottom',
  },
  {
    selector: '.fleet-control-group',
    title: 'Instant Desktop Companions',
    description: 'Spawn or hide floating companions directly to your screen with a single click. Green glowing dots indicate which pets are currently active.',
    icon: '🚀',
    placement: 'bottom',
  },
  {
    selector: '.burger-toggle-btn',
    title: 'Navigation & Fleet Menu',
    description: 'Open this scalable menu to jump between Codi AI Monitor, Momo Pomodoro Focus, Moki Typing Station, Settings, and Tutorials!',
    icon: '🍔',
    placement: 'bottom',
  },
  {
    selector: '.pet-cards-grid',
    title: 'Companion Control Roster',
    description: 'Here you can inspect each pet, test synthesized sounds, calibrate timers, or jump into dedicated configuration views.',
    icon: '🎮',
    placement: 'top',
  },
  {
    selector: '.arcade-hero-banner',
    title: 'Petting & Interactive Affection',
    description: 'All pets love attention! Gently hover over any companion or scratch their head with your mouse to trigger joyful purrs and floating hearts.',
    icon: '💖',
    placement: 'bottom',
  },
];

const currentStep = computed(() => tourSteps[currentStepIndex.value]);

function updateTargetPosition() {
  if (!props.isOpen) return;

  const step = currentStep.value;
  if (!step) return;

  const el = document.querySelector(step.selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      targetRect.value = el.getBoundingClientRect();
    }, 150);
  } else {
    // If element is not in view (e.g., hidden in another tab), fall back to center
    targetRect.value = new DOMRect(
      window.innerWidth / 2 - 150,
      window.innerHeight / 2 - 100,
      300,
      200
    );
  }
}

const tooltipStyle = computed(() => {
  if (!targetRect.value) return {};

  const rect = targetRect.value;
  const cardWidth = 340;
  const cardHeight = 220;
  const margin = 16;

  let top = rect.bottom + margin;
  let left = rect.left + rect.width / 2 - cardWidth / 2;

  // Clamp within viewport
  if (left < margin) left = margin;
  if (left + cardWidth > window.innerWidth - margin) {
    left = window.innerWidth - cardWidth - margin;
  }

  // If too low, place above target
  if (top + cardHeight > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - cardHeight - margin);
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${cardWidth}px`,
  };
});

function nextStep() {
  if (currentStepIndex.value < tourSteps.length - 1) {
    currentStepIndex.value++;
    nextTick(updateTargetPosition);
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    nextTick(updateTargetPosition);
  }
}

function finishTour() {
  emit('complete');
  emit('close');
}

function skipTour() {
  emit('close');
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      currentStepIndex.value = 0;
      nextTick(() => {
        setTimeout(updateTargetPosition, 200);
      });
    }
  }
);

onMounted(() => {
  window.addEventListener('resize', updateTargetPosition);
  window.addEventListener('scroll', updateTargetPosition, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTargetPosition);
  window.removeEventListener('scroll', updateTargetPosition, true);
});
</script>

<style scoped>
.spotlight-tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  pointer-events: auto;
}

.spotlight-mask-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spotlight-highlight-ring {
  position: absolute;
  pointer-events: none;
  box-shadow: 0 0 0 2px #5865f2, 0 0 30px rgba(88, 101, 242, 0.45);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1051;
}

.spotlight-pulse {
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 2px solid rgba(88, 101, 242, 0.6);
  animation: spotlight-pulse-anim 1.8s infinite ease-out;
}

@keyframes spotlight-pulse-anim {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.08);
    opacity: 0;
  }
}

/* Tooltip Card */
.tour-tooltip-card {
  position: absolute;
  background: #181a20;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 30px rgba(88, 101, 242, 0.25);
  padding: 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1052;
  transition: top 0.3s ease, left 0.3s ease;
  backdrop-filter: blur(12px);
}

.tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tooltip-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #818cf8;
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.3);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.sparkle-dot {
  font-size: 11px;
}

.tooltip-close {
  background: none;
  border: none;
  color: #949ba4;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.tooltip-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.tooltip-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tooltip-icon {
  font-size: 20px;
}

.tooltip-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.tooltip-desc {
  font-size: 12px;
  color: #b5bac1;
  line-height: 1.5;
  margin: 0;
}

.tooltip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tour-nav-group {
  display: flex;
  gap: 8px;
}

.tour-btn {
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 14px;
  transition: all 0.2s ease;
}

.tour-btn.skip {
  background: none;
  color: #949ba4;
  padding: 6px 8px;
}

.tour-btn.skip:hover {
  color: #ffffff;
}

.tour-btn.back {
  background: rgba(255, 255, 255, 0.08);
  color: #dbdee1;
}

.tour-btn.back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.tour-btn.next {
  background: #5865f2;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(88, 101, 242, 0.35);
}

.tour-btn.next:hover {
  background: #4752c4;
}

.tour-btn.finish {
  background: #22c55e;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.35);
}

.tour-btn.finish:hover {
  background: #16a34a;
}

/* Animations */
.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.25s ease;
}
.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}
</style>
