<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="onboarding-overlay" @click.self="onDismiss">
        <div class="onboarding-modal" role="dialog" aria-modal="true">
          <!-- Ambient Glow Backgrounds -->
          <div class="ambient-glow glow-1"></div>
          <div class="ambient-glow glow-2"></div>

          <!-- Top Progress Bar & Header Controls -->
          <div class="modal-top-bar">
            <div class="stepper-dots">
              <button
                v-for="(s, idx) in steps"
                :key="s.id"
                class="step-dot"
                :class="{ active: currentStep === idx, completed: currentStep > idx }"
                @click="goToStep(idx)"
                :title="s.title"
              >
                <span class="dot-num">{{ idx + 1 }}</span>
                <span class="dot-label">{{ s.shortName }}</span>
              </button>
            </div>

            <button class="modal-close-btn" @click="onDismiss" title="Skip or close tutorial">
              ✕
            </button>
          </div>

          <!-- Modal Body with Step Transitions -->
          <div class="modal-body">
            <!-- ======================================================== -->
            <!-- STEP 0: WELCOME & FLEET INTRO                            -->
            <!-- ======================================================== -->
            <transition name="step-slide" mode="out-in">
              <div v-if="currentStep === 0" key="step-0" class="step-view welcome-step">
                <div class="hero-badge">
                  <span class="sparkle-ico">✨</span>
                  <span>WELCOME TO DEVPET FLEET</span>
                </div>
                <h2 class="hero-title">Your Ultimate Desktop Companion Ecosystem</h2>
                <p class="hero-subtitle">
                  Say goodbye to boring code sessions! DevPet gives you floating pixel-art companions that live on your desktop, track your AI coding agents, guide pomodoro sprints, and keep you energized.
                </p>

                <!-- Trio Mascot Preview Cards -->
                <div class="welcome-trio-grid">
                  <div class="trio-card codi" @click="selectedPreviewPet = 'codi'">
                    <div class="trio-avatar">🐾</div>
                    <div class="trio-info">
                      <h4>Codi</h4>
                      <span class="trio-role">Coding Agent Companion</span>
                      <p>Watches Antigravity, VS Code, and Codex. Celebrates when your prompt finishes!</p>
                    </div>
                  </div>

                  <div class="trio-card momo" @click="selectedPreviewPet = 'momo'">
                    <div class="trio-avatar">🍅</div>
                    <div class="trio-info">
                      <h4>Momo</h4>
                      <span class="trio-role">Sprint & Focus Mascot</span>
                      <p>Keeps you in deep work flow with circular sprint timers and refreshing tea breaks.</p>
                    </div>
                  </div>

                  <div class="trio-card moki" @click="selectedPreviewPet = 'moki'">
                    <div class="trio-avatar">✨</div>
                    <div class="trio-info">
                      <h4>Moki</h4>
                      <span class="trio-role">Typing Velocity & Ergonomics</span>
                      <p>Measures your real-time WPM, triggers tactile keystroke particles, and alerts you to stretch.</p>
                    </div>
                  </div>
                </div>

                <div class="hero-highlights">
                  <div class="highlight-chip">
                    <span class="chip-ico">🪟</span>
                    <span>Always-on-top transparent desktop overlays</span>
                  </div>
                  <div class="highlight-chip">
                    <span class="chip-ico">🖱️</span>
                    <span>Draggable anywhere on multi-monitor setups</span>
                  </div>
                  <div class="highlight-chip">
                    <span class="chip-ico">💖</span>
                    <span>Pet & scratch them for affection purrs!</span>
                  </div>
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- STEP 1: MEET THE COMPANIONS IN DETAIL                    -->
              <!-- ======================================================== -->
              <div v-else-if="currentStep === 1" key="step-1" class="step-view meet-step">
                <div class="step-header">
                  <span class="step-tag">PET DOSSIER</span>
                  <h3 class="step-title">Meet Your Companion Roster</h3>
                  <p class="step-desc">Click each pet below to inspect their special abilities, mood changes, and audio cues.</p>
                </div>

                <!-- Tabs to switch pet detail -->
                <div class="pet-tab-switcher">
                  <button
                    class="pet-tab-btn codi"
                    :class="{ active: selectedPreviewPet === 'codi' }"
                    @click="selectedPreviewPet = 'codi'"
                  >
                    <span>🐾</span> Codi
                  </button>
                  <button
                    class="pet-tab-btn momo"
                    :class="{ active: selectedPreviewPet === 'momo' }"
                    @click="selectedPreviewPet = 'momo'"
                  >
                    <span>🍅</span> Momo
                  </button>
                  <button
                    class="pet-tab-btn moki"
                    :class="{ active: selectedPreviewPet === 'moki' }"
                    @click="selectedPreviewPet = 'moki'"
                  >
                    <span>✨</span> Moki
                  </button>
                </div>

                <!-- Pet Detail Showcase -->
                <div class="pet-showcase-box" :class="selectedPreviewPet">
                  <div v-if="selectedPreviewPet === 'codi'" class="showcase-content">
                    <div class="showcase-left">
                      <div class="showcase-badge-banner">AI CODE MONITOR</div>
                      <div class="big-avatar-box">
                        <span class="big-avatar">🐾</span>
                        <div class="status-aura codi-glow"></div>
                      </div>
                      <span class="showcase-name">Codi</span>
                      <span class="showcase-sub">Active Coding Agent Watchdog</span>
                    </div>
                    <div class="showcase-right">
                      <h4>How Codi Works:</h4>
                      <ul class="features-list">
                        <li>
                          <strong>Autonomous Status Tracking:</strong> Reads prompt completions, errors, and thinking phases from Google Antigravity, VS Code, or Codex.
                        </li>
                        <li>
                          <strong>Dynamic Mascot Reactions:</strong> Types furiously at a tiny glowing laptop while your agent codes; dances and pops confetti when the task succeeds!
                        </li>
                        <li>
                          <strong>Harmonic Chimes:</strong> Plays a resonant 4-note bell chime so you never miss a finished task while working in another window.
                        </li>
                      </ul>
                      <div class="sample-action-row">
                        <button class="sample-btn" @click="$emit('testChime')">
                          🔊 Audition Completion Chime
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="selectedPreviewPet === 'momo'" class="showcase-content">
                    <div class="showcase-left">
                      <div class="showcase-badge-banner">FOCUS & SPRINT</div>
                      <div class="big-avatar-box">
                        <span class="big-avatar">🍅</span>
                        <div class="status-aura momo-glow"></div>
                      </div>
                      <span class="showcase-name">Momo</span>
                      <span class="showcase-sub">Pomodoro Rhythm Mascot</span>
                    </div>
                    <div class="showcase-right">
                      <h4>How Momo Works:</h4>
                      <ul class="features-list">
                        <li>
                          <strong>Visual Sprint Clocks:</strong> Customizable focus blocks (e.g. 25m) and break intervals (5m / 15m) visible right on your screen.
                        </li>
                        <li>
                          <strong>Cozy Transitions:</strong> Clacks on keyboard during focus time, then peacefully sips hot matcha tea with steam during breaks.
                        </li>
                        <li>
                          <strong>Zen Sound Effects:</strong> Upbeat focus start chime and soothing brass singing bowl bell for stress-free transitions.
                        </li>
                      </ul>
                      <div class="sample-action-row">
                        <button class="sample-btn" @click="$emit('testFocusSound')">
                          🔔 Audition Focus Gong
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="selectedPreviewPet === 'moki'" class="showcase-content">
                    <div class="showcase-left">
                      <div class="showcase-badge-banner">KEYBOARD VELOCITY</div>
                      <div class="big-avatar-box">
                        <span class="big-avatar">✨</span>
                        <div class="status-aura moki-glow"></div>
                      </div>
                      <span class="showcase-name">Moki</span>
                      <span class="showcase-sub">Typing & Ergonomics Buddy</span>
                    </div>
                    <div class="showcase-right">
                      <h4>How Moki Works:</h4>
                      <ul class="features-list">
                        <li>
                          <strong>Real-Time WPM Speedometer:</strong> Measures keystrokes per minute. Speed past 60 WPM to trigger Turbo Mode with speed auras!
                        </li>
                        <li>
                          <strong>Tactile Mechanical Feedback:</strong> Spawns bouncy pixel keystroke bursts and optional mechanical switch sound clicks.
                        </li>
                        <li>
                          <strong>Wellness & Posture Checks:</strong> Reminds you to take eye rests, stretch wrists, and drink water to stay healthy during marathon coding.
                        </li>
                      </ul>
                      <div class="sample-action-row">
                        <button class="sample-btn" @click="$emit('testKeySound')">
                          ⌨️ Audition Key Click
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- STEP 2: CHOOSE DESKTOP COMPANIONS                        -->
              <!-- ======================================================== -->
              <div v-else-if="currentStep === 2" key="step-2" class="step-view deploy-step">
                <div class="step-header">
                  <span class="step-tag">QUICK DEPLOY</span>
                  <h3 class="step-title">Choose Who Joins You on Screen</h3>
                  <p class="step-desc">
                    Toggle which companions you want floating on your desktop screen right now. You can adjust this anytime from the top header!
                  </p>
                </div>

                <div class="deploy-cards-list">
                  <!-- Codi Deploy Card -->
                  <div class="deploy-card" :class="{ active: agentCompanionVisible }">
                    <div class="deploy-card-left">
                      <div class="deploy-icon-box codi-box">🐾</div>
                      <div class="deploy-text">
                        <div class="deploy-title-line">
                          <span class="deploy-name">Codi</span>
                          <span class="deploy-tag">CODING AGENT</span>
                        </div>
                        <p class="deploy-desc">Monitors AI turns and celebrates success.</p>
                      </div>
                    </div>
                    <button
                      class="toggle-deploy-btn"
                      :class="{ deployed: agentCompanionVisible }"
                      @click="$emit('toggleAgent')"
                    >
                      <span class="toggle-circle"></span>
                      <span>{{ agentCompanionVisible ? 'Deployed' : 'Deploy to Desktop' }}</span>
                    </button>
                  </div>

                  <!-- Momo Deploy Card -->
                  <div class="deploy-card" :class="{ active: pomodoroCompanionVisible }">
                    <div class="deploy-card-left">
                      <div class="deploy-icon-box momo-box">🍅</div>
                      <div class="deploy-text">
                        <div class="deploy-title-line">
                          <span class="deploy-name">Momo</span>
                          <span class="deploy-tag">POMODORO FOCUS</span>
                        </div>
                        <p class="deploy-desc">Shows circular timer sprints and break phases.</p>
                      </div>
                    </div>
                    <button
                      class="toggle-deploy-btn"
                      :class="{ deployed: pomodoroCompanionVisible }"
                      @click="$emit('togglePomo')"
                    >
                      <span class="toggle-circle"></span>
                      <span>{{ pomodoroCompanionVisible ? 'Deployed' : 'Deploy to Desktop' }}</span>
                    </button>
                  </div>

                  <!-- Moki Deploy Card -->
                  <div class="deploy-card" :class="{ active: mokiCompanionVisible }">
                    <div class="deploy-card-left">
                      <div class="deploy-icon-box moki-box">✨</div>
                      <div class="deploy-text">
                        <div class="deploy-title-line">
                          <span class="deploy-name">Moki</span>
                          <span class="deploy-tag">WPM & WELLNESS</span>
                        </div>
                        <p class="deploy-desc">Visualizes typing velocity and sends health reminders.</p>
                      </div>
                    </div>
                    <button
                      class="toggle-deploy-btn"
                      :class="{ deployed: mokiCompanionVisible }"
                      @click="$emit('toggleMoki')"
                    >
                      <span class="toggle-circle"></span>
                      <span>{{ mokiCompanionVisible ? 'Deployed' : 'Deploy to Desktop' }}</span>
                    </button>
                  </div>
                </div>

                <div class="deploy-tip-box">
                  <span class="tip-ico">💡</span>
                  <p>
                    <strong>Pro-Tip:</strong> Pets are transparent and always on top. You can click & drag them to anywhere on your monitors (e.g. next to your code editor or bottom right tray area).
                  </p>
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- STEP 3: AUDIO & VOLUME CALIBRATION                       -->
              <!-- ======================================================== -->
              <div v-else-if="currentStep === 3" key="step-3" class="step-view audio-step">
                <div class="step-header">
                  <span class="step-tag">SOUND EFFECTS</span>
                  <h3 class="step-title">Audio & Synthesized Chimes</h3>
                  <p class="step-desc">
                    DevPet uses purely procedural Web Audio oscillators for zero-latency, beautiful retro chimes. Customize your sound preferences:
                  </p>
                </div>

                <div class="audio-control-card">
                  <div class="audio-header-row">
                    <div class="audio-title-group">
                      <span class="audio-icon-badge">🔊</span>
                      <div>
                        <h4>Master Sound Level</h4>
                        <span class="audio-sub">Controls volume across all companion chimes & alerts</span>
                      </div>
                    </div>
                    <span class="volume-percent">{{ settings.volume }}%</span>
                  </div>

                  <!-- Volume Slider -->
                  <div class="volume-slider-track">
                    <span class="vol-min">🔈</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      v-model.number="settings.volume"
                      class="custom-range"
                      @input="onVolumeChange"
                    />
                    <span class="vol-max">🔊</span>
                  </div>

                  <!-- Audition Buttons -->
                  <div class="audition-grid">
                    <button class="audition-card" @click="$emit('testChime')">
                      <span class="aud-ico">🎉</span>
                      <div class="aud-text">
                        <span class="aud-name">Agent Victory Chime</span>
                        <span class="aud-pet">Codi • 4-Note Resonant Arpeggio</span>
                      </div>
                      <span class="play-tag">▶ Test</span>
                    </button>

                    <button class="audition-card" @click="$emit('testFocusSound')">
                      <span class="aud-ico">🔔</span>
                      <div class="aud-text">
                        <span class="aud-name">Focus Bell & Gong</span>
                        <span class="aud-pet">Momo • Crystal Upbeat Chime</span>
                      </div>
                      <span class="play-tag">▶ Test</span>
                    </button>

                    <button class="audition-card" @click="$emit('testKeySound')">
                      <span class="aud-ico">⌨️</span>
                      <div class="aud-text">
                        <span class="aud-name">Mechanical Key Click</span>
                        <span class="aud-pet">Moki • Tactile Switch Click</span>
                      </div>
                      <span class="play-tag">▶ Test</span>
                    </button>
                  </div>
                </div>

                <div class="audio-quick-toggles">
                  <label class="toggle-row">
                    <input type="checkbox" v-model="settings.soundEnabled" />
                    <span class="checkbox-box"></span>
                    <span class="toggle-txt">Enable audible sound effects</span>
                  </label>
                  <label class="toggle-row">
                    <input type="checkbox" v-model="settings.notificationsEnabled" />
                    <span class="checkbox-box"></span>
                    <span class="toggle-txt">Enable Windows desktop notifications</span>
                  </label>
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- STEP 4: READY TO CODE!                                   -->
              <!-- ======================================================== -->
              <div v-else-if="currentStep === 4" key="step-4" class="step-view finish-step">
                <div class="finish-celebration">
                  <div class="celebration-badge">🚀</div>
                  <h2 class="finish-title">Fleet Deployment Ready!</h2>
                  <p class="finish-desc">
                    Your companions are prepped and ready to accompany your coding journey. You can access the dedicated <strong>Tutorials & Guides Hub</strong> anytime from the menu.
                  </p>

                  <div class="finish-summary-card">
                    <div class="summary-item">
                      <span class="sum-ico">🐾</span>
                      <div class="sum-info">
                        <strong>Codi</strong>
                        <span>{{ agentCompanionVisible ? 'Active on Desktop' : 'In Roster' }}</span>
                      </div>
                      <span class="sum-status" :class="{ on: agentCompanionVisible }">
                        {{ agentCompanionVisible ? '● Live' : '○ Standby' }}
                      </span>
                    </div>

                    <div class="summary-item">
                      <span class="sum-ico">🍅</span>
                      <div class="sum-info">
                        <strong>Momo</strong>
                        <span>{{ pomodoroCompanionVisible ? 'Active on Desktop' : 'In Roster' }}</span>
                      </div>
                      <span class="sum-status" :class="{ on: pomodoroCompanionVisible }">
                        {{ pomodoroCompanionVisible ? '● Live' : '○ Standby' }}
                      </span>
                    </div>

                    <div class="summary-item">
                      <span class="sum-ico">✨</span>
                      <div class="sum-info">
                        <strong>Moki</strong>
                        <span>{{ mokiCompanionVisible ? 'Active on Desktop' : 'In Roster' }}</span>
                      </div>
                      <span class="sum-status" :class="{ on: mokiCompanionVisible }">
                        {{ mokiCompanionVisible ? '● Live' : '○ Standby' }}
                      </span>
                    </div>
                  </div>

                  <div class="finish-actions">
                    <button class="tour-btn" @click="startSpotlightTour">
                      ✨ Take UI Spotlight Tour
                    </button>
                    <button class="primary-launch-btn" @click="finishOnboarding">
                      🚀 Launch Dashboard & Code
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Bottom Footer Navigation Buttons -->
          <div class="modal-footer">
            <button
              v-if="currentStep > 0"
              class="footer-nav-btn prev"
              @click="prevStep"
            >
              ← Back
            </button>
            <div v-else></div>

            <div class="footer-right">
              <button
                v-if="currentStep < steps.length - 1"
                class="skip-btn"
                @click="onDismiss"
              >
                Skip Tutorial
              </button>

              <button
                v-if="currentStep < steps.length - 1"
                class="footer-nav-btn next"
                @click="nextStep"
              >
                Continue →
              </button>
              <button
                v-else
                class="footer-nav-btn finish"
                @click="finishOnboarding"
              >
                Get Started 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Settings } from '../types/settings';
import { notificationService } from '../services/notifications';

const props = defineProps<{
  isOpen: boolean;
  settings: Settings;
  agentCompanionVisible: boolean;
  pomodoroCompanionVisible: boolean;
  mokiCompanionVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete'): void;
  (e: 'startTour'): void;
  (e: 'toggleAgent'): void;
  (e: 'togglePomo'): void;
  (e: 'toggleMoki'): void;
  (e: 'testChime'): void;
  (e: 'testFocusSound'): void;
  (e: 'testKeySound'): void;
}>();

const currentStep = ref(0);
const selectedPreviewPet = ref<'codi' | 'momo' | 'moki'>('codi');

const steps = [
  { id: 'welcome', title: 'Welcome to DevPet', shortName: 'Welcome' },
  { id: 'meet', title: 'Meet The Companions', shortName: 'Mascots' },
  { id: 'deploy', title: 'Choose Desktop Pets', shortName: 'Deploy' },
  { id: 'audio', title: 'Audio & Volume', shortName: 'Audio' },
  { id: 'finish', title: 'Ready to Code', shortName: 'Launch' },
];

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function goToStep(idx: number) {
  currentStep.value = idx;
}

function onVolumeChange() {
  notificationService.setVolume(props.settings.volume / 100);
}

function finishOnboarding() {
  emit('complete');
  emit('close');
}

function startSpotlightTour() {
  emit('complete');
  emit('close');
  emit('startTour');
}

function onDismiss() {
  emit('close');
}
</script>

<style scoped>
/* ==========================================================================
   Modal Backdrop & Containers
   ========================================================================== */
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 16, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.onboarding-modal {
  position: relative;
  background: #181a20;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  width: 100%;
  max-width: 780px;
  min-height: 560px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(88, 101, 242, 0.15);
  overflow: hidden;
}

/* Ambient glow accents */
.ambient-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.15;
}

.glow-1 {
  top: -80px;
  left: -60px;
  background: #5865f2;
}

.glow-2 {
  bottom: -80px;
  right: -60px;
  background: #f59e0b;
}

/* ==========================================================================
   Top Header & Stepper Dots
   ========================================================================== */
.modal-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(20, 22, 28, 0.85);
  position: relative;
  z-index: 2;
}

.stepper-dots {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 5px 12px;
  color: #949ba4;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 600;
}

.step-dot:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.step-dot.active {
  background: rgba(88, 101, 242, 0.2);
  border-color: #5865f2;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(88, 101, 242, 0.35);
}

.step-dot.completed {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.dot-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-size: 10px;
}

.step-dot.active .dot-num {
  background: #5865f2;
  color: #ffffff;
}

.step-dot.completed .dot-num {
  background: #22c55e;
  color: #0b2e13;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #949ba4;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

/* ==========================================================================
   Modal Body & Step Content
   ========================================================================== */
.modal-body {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.step-view {
  display: flex;
  flex-direction: column;
}

/* STEP 0: Welcome */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.35);
  color: #818cf8;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: fit-content;
  margin-bottom: 12px;
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 10px 0;
  line-height: 1.25;
}

.hero-subtitle {
  font-size: 14px;
  color: #b5bac1;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.welcome-trio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.trio-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trio-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
}

.trio-card.codi:hover {
  border-color: #5865f2;
  box-shadow: 0 8px 24px rgba(88, 101, 242, 0.25);
}

.trio-card.momo:hover {
  border-color: #f43f5e;
  box-shadow: 0 8px 24px rgba(244, 63, 94, 0.25);
}

.trio-card.moki:hover {
  border-color: #f59e0b;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
}

.trio-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
}

.trio-card.codi .trio-avatar {
  background: rgba(88, 101, 242, 0.2);
}

.trio-card.momo .trio-avatar {
  background: rgba(244, 63, 94, 0.2);
}

.trio-card.moki .trio-avatar {
  background: rgba(245, 158, 11, 0.2);
}

.trio-info h4 {
  margin: 0 0 2px 0;
  font-size: 16px;
  color: #ffffff;
  font-weight: 700;
}

.trio-role {
  font-size: 11px;
  color: #818cf8;
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.trio-card.momo .trio-role {
  color: #fb7185;
}

.trio-card.moki .trio-role {
  color: #fbbf24;
}

.trio-info p {
  margin: 0;
  font-size: 12px;
  color: #949ba4;
  line-height: 1.45;
}

.hero-highlights {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.highlight-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #dbdee1;
}

/* STEP 1: Meet Step */
.step-header {
  margin-bottom: 20px;
}

.step-tag {
  font-size: 11px;
  font-weight: 700;
  color: #5865f2;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 4px;
}

.step-title {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.step-desc {
  font-size: 13px;
  color: #949ba4;
  margin: 0;
  line-height: 1.5;
}

.pet-tab-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.pet-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 18px;
  color: #b5bac1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.pet-tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.pet-tab-btn.codi.active {
  background: rgba(88, 101, 242, 0.2);
  border-color: #5865f2;
  color: #ffffff;
  box-shadow: 0 0 14px rgba(88, 101, 242, 0.35);
}

.pet-tab-btn.momo.active {
  background: rgba(244, 63, 94, 0.2);
  border-color: #f43f5e;
  color: #ffffff;
  box-shadow: 0 0 14px rgba(244, 63, 94, 0.35);
}

.pet-tab-btn.moki.active {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
  color: #ffffff;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
}

.pet-showcase-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}

.showcase-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  align-items: center;
}

.showcase-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.showcase-badge-banner {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.08);
  padding: 3px 8px;
  border-radius: 6px;
  color: #ffffff;
  margin-bottom: 12px;
}

.big-avatar-box {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.big-avatar {
  font-size: 48px;
  position: relative;
  z-index: 2;
}

.status-aura {
  position: absolute;
  inset: -6px;
  border-radius: 24px;
  filter: blur(14px);
  opacity: 0.6;
}

.codi-glow {
  background: #5865f2;
}

.momo-glow {
  background: #f43f5e;
}

.moki-glow {
  background: #f59e0b;
}

.showcase-name {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.showcase-sub {
  font-size: 11px;
  color: #949ba4;
  margin-top: 2px;
}

.showcase-right h4 {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.features-list li {
  font-size: 12px;
  color: #b5bac1;
  line-height: 1.5;
  position: relative;
  padding-left: 18px;
}

.features-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #5865f2;
  font-size: 14px;
}

.sample-action-row {
  display: flex;
  gap: 10px;
}

.sample-btn {
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.35);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sample-btn:hover {
  background: rgba(88, 101, 242, 0.3);
  transform: translateY(-2px);
}

/* STEP 2: Deploy Step */
.deploy-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.deploy-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  transition: all 0.2s ease;
}

.deploy-card.active {
  background: rgba(88, 101, 242, 0.08);
  border-color: rgba(88, 101, 242, 0.4);
}

.deploy-card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.deploy-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.codi-box {
  background: rgba(88, 101, 242, 0.2);
}

.momo-box {
  background: rgba(244, 63, 94, 0.2);
}

.moki-box {
  background: rgba(245, 158, 11, 0.2);
}

.deploy-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.deploy-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.deploy-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #818cf8;
}

.deploy-desc {
  font-size: 12px;
  color: #949ba4;
  margin: 0;
}

.toggle-deploy-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #dbdee1;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  transition: all 0.2s ease;
}

.toggle-deploy-btn.deployed {
  background: rgba(34, 197, 94, 0.18);
  border-color: #22c55e;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
}

.toggle-deploy-btn.deployed .toggle-circle {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

.deploy-tip-box {
  display: flex;
  gap: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fde68a;
  font-size: 12px;
  line-height: 1.5;
}

/* STEP 3: Audio Step */
.audio-control-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.audio-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.audio-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.audio-icon-badge {
  font-size: 24px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(88, 101, 242, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-title-group h4 {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px 0;
}

.audio-sub {
  font-size: 12px;
  color: #949ba4;
}

.volume-percent {
  font-size: 16px;
  font-weight: 800;
  color: #818cf8;
  background: rgba(88, 101, 242, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
}

.volume-slider-track {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.custom-range {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  accent-color: #5865f2;
}

.audition-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.audition-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.audition-card:hover {
  background: rgba(88, 101, 242, 0.15);
  border-color: #5865f2;
  transform: translateY(-2px);
}

.aud-ico {
  font-size: 20px;
}

.aud-name {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  display: block;
}

.aud-pet {
  font-size: 10px;
  color: #949ba4;
  display: block;
}

.play-tag {
  font-size: 10px;
  font-weight: 700;
  color: #818cf8;
  margin-top: 4px;
}

.audio-quick-toggles {
  display: flex;
  gap: 20px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #dbdee1;
  cursor: pointer;
}

.toggle-row input {
  accent-color: #5865f2;
  width: 16px;
  height: 16px;
}

/* STEP 4: Finish Step */
.finish-celebration {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 0;
}

.celebration-badge {
  font-size: 54px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(88, 101, 242, 0.3) 0%, rgba(20, 22, 28, 0) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  animation: pulse-ring 2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.finish-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.finish-desc {
  font-size: 14px;
  color: #b5bac1;
  max-width: 520px;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.finish-summary-card {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 540px;
  margin-bottom: 28px;
}

.summary-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sum-ico {
  font-size: 24px;
}

.sum-info strong {
  font-size: 13px;
  color: #ffffff;
  display: block;
}

.sum-info span {
  font-size: 11px;
  color: #949ba4;
}

.sum-status {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  margin-top: 4px;
}

.sum-status.on {
  color: #22c55e;
}

.finish-actions {
  display: flex;
  gap: 14px;
}

.tour-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tour-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
}

.primary-launch-btn {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  border: none;
  color: #ffffff;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(88, 101, 242, 0.4);
  transition: all 0.2s ease;
}

.primary-launch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(88, 101, 242, 0.55);
}

/* ==========================================================================
   Modal Footer
   ========================================================================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(20, 22, 28, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  position: relative;
  z-index: 2;
}

.footer-nav-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-nav-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skip-btn {
  background: none;
  border: none;
  color: #949ba4;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
}

.skip-btn:hover {
  color: #ffffff;
}

.footer-nav-btn.next {
  background: #5865f2;
  border-color: #5865f2;
  box-shadow: 0 2px 10px rgba(88, 101, 242, 0.35);
}

.footer-nav-btn.next:hover {
  background: #4752c4;
}

.footer-nav-btn.finish {
  background: #22c55e;
  border-color: #22c55e;
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.35);
}

.footer-nav-btn.finish:hover {
  background: #16a34a;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
