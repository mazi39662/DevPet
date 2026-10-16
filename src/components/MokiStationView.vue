<template>
  <div class="moki-station-container">
    <!-- Top Hero Banner: Moki Status & Live Speedometer -->
    <div class="moki-hero-banner">
      <div class="hero-left">
        <div class="hero-badge">
          <span class="badge-dot" :class="state.speedTier"></span>
          <span>KEYBOARD & WELLNESS ARCADE</span>
        </div>
        <h2 class="hero-title">Moki Station</h2>
        <p class="hero-sub">
          Your idle desktop typing companion! Spawns letter particle bursts, tracks typing speed, and expresses playful animations & emotions.
        </p>

        <div class="hero-stats-row">
          <div class="h-stat-card">
            <span class="stat-label">CURRENT SPEED</span>
            <div class="stat-main">
              <span class="stat-num">{{ state.currentWpm }}</span>
              <span class="stat-unit">WPM</span>
              <span class="stat-tier-tag" :class="state.speedTier">{{ state.speedTier.toUpperCase() }}</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">TODAY'S PEAK</span>
            <div class="stat-main">
              <span class="stat-num">{{ state.peakWpm }}</span>
              <span class="stat-unit">WPM</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">KEYSTROKES</span>
            <div class="stat-main">
              <span class="stat-num font-mono">{{ state.totalKeystrokes.toLocaleString() }}</span>
            </div>
          </div>

          <div class="h-stat-card">
            <span class="stat-label">MAX COMBO</span>
            <div class="stat-main">
              <span class="stat-num combo-num">x{{ state.maxCombo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mascot Live Preview in Hero -->
      <div class="hero-mascot-preview">
        <MokiPet :interactive="true" :sound-enabled="soundEnabled" />
      </div>
    </div>

    <!-- Main Grid: Typing Sandbox & Emotion Showcase -->
    <div class="moki-grid">
      <!-- Panel 1: Interactive Keystroke & Particle Playground -->
      <div class="moki-card playground-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">⌨️</span>
            <div>
              <h3 class="card-title">Typing Sandbox & Particle Lab</h3>
              <p class="card-desc">Type anything below to see letter particles fly, test WPM, and clack RGB keys!</p>
            </div>
          </div>
          <div class="card-header-actions">
            <button
              class="sound-profile-quick-pill"
              :title="`Current switch sound: ${activeProfileMeta.name}. Click to cycle.`"
              @click="cycleKeyboardProfile"
            >
              <span>{{ activeProfileMeta.icon }}</span>
              <span class="pill-name">{{ activeProfileMeta.name }}</span>
              <span class="pill-switch-tag">Switch 🔄</span>
            </button>
            <div class="live-combo-pill" v-if="state.combo > 0">
              <span>🔥 COMBO x{{ state.combo }}</span>
            </div>
          </div>
        </div>

        <div class="sandbox-input-area">
          <textarea
            v-model="sandboxText"
            rows="5"
            class="sandbox-textarea"
            placeholder="Start clacking your keyboard here! Letters will burst as floating particles... ✨"
            @keydown="onSandboxKeydown"
          ></textarea>

          <div class="sandbox-actions">
            <div class="sandbox-left-actions">
              <button class="action-btn-clean" @click="sandboxText = ''" :disabled="!sandboxText">
                Clear Text
              </button>
              <span v-if="sandboxLastKey" class="last-key-badge">Key: {{ sandboxLastKey }}</span>
            </div>
            <div class="sandbox-hint">
              <span>Tip: Global keyboard hook also detects typing in any application!</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 2: Moki Emotion & Animation Laboratory -->
      <div class="moki-card emotion-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">🎭</span>
            <div>
              <h3 class="card-title">Moki Emotion & Reaction Showcase</h3>
              <p class="card-desc">Click any emotion to test Moki's dynamic facial expressions and body animations!</p>
            </div>
          </div>
        </div>

        <div class="emotions-preview-grid">
          <button class="emotion-trigger-btn" @click="testMokiEmotion('happy')">
            <span class="e-icon">✨</span>
            <span class="e-label">Happy</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('typing')">
            <span class="e-icon">💻</span>
            <span class="e-label">Typing Focus</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('turbo')">
            <span class="e-icon">🔥</span>
            <span class="e-label">Turbo 60+ WPM</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('thinking')">
            <span class="e-icon">🧠</span>
            <span class="e-label">Thinking</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('waiting')">
            <span class="e-icon">⏳</span>
            <span class="e-label">Waiting</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('celebrating')">
            <span class="e-icon">🎉</span>
            <span class="e-label">Victory Jump</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('error')">
            <span class="e-icon">⚠️</span>
            <span class="e-label">Panic / Bug</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('sleepy')">
            <span class="e-icon">💤</span>
            <span class="e-label">Sleepy</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('stretching')">
            <span class="e-icon">🌸</span>
            <span class="e-label">Cat Stretch</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('blissful')">
            <span class="e-icon">💖</span>
            <span class="e-label">Pet / Purr</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('boop')">
            <span class="e-icon">🐾</span>
            <span class="e-label">Nose Boop</span>
          </button>
        </div>
      </div>

      <!-- Panel 3: Keyboard Sound Studio & Switch Acoustics -->
      <div class="moki-card keyboard-studio-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon studio-icon">🎧</span>
            <div>
              <div class="title-with-badge">
                <h3 class="card-title">Keyboard Sound Studio & Switch Acoustics</h3>
                <span class="active-profile-indicator">Active: {{ activeProfileMeta.name }} {{ activeProfileMeta.icon }}</span>
              </div>
              <p class="card-desc">
                Customize Moki's tactile typing acoustics, spacebar stabilizer clacks, carriage return bells, and backspace blips.
              </p>
            </div>
          </div>
        </div>

        <!-- 7 Acoustic Profiles Grid -->
        <div class="profiles-section-title">
          <span>Acoustic Switch Profiles (Click to Select & Audition)</span>
          <span class="profiles-hint">Procedural Web Audio synthesis • Zero asset latency</span>
        </div>

        <div class="studio-profiles-grid">
          <div
            v-for="prof in keyboardProfiles"
            :key="prof.id"
            class="studio-profile-card"
            :class="{
              active: currentProfile === prof.id,
              disabled: !soundEnabled
            }"
            @click="setProfile(prof.id)"
          >
            <div class="prof-top-bar">
              <span class="prof-icon">{{ prof.icon }}</span>
              <span v-if="currentProfile === prof.id" class="active-tag">ACTIVE</span>
            </div>
            <div class="prof-name">{{ prof.name }}</div>
            <div class="prof-badge">{{ prof.badge }}</div>
            <p class="prof-desc">{{ prof.desc }}</p>

            <div class="prof-footer">
              <button
                class="audition-btn"
                :disabled="!soundEnabled"
                @click.stop="auditionProfile(prof.id)"
                title="Play sound audition"
              >
                🔊 Audition
              </button>
              <span class="prof-status">
                {{ currentProfile === prof.id ? '✓ Selected' : 'Tap to select' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dedicated Key Sound Effects Row -->
        <div class="studio-sub-panels-grid">
          <div class="studio-sub-panel full-width">
            <h4 class="sub-panel-title">Dedicated Key Sound Effects</h4>

            <div class="dedicated-keys-list">
              <div class="studio-fx-item">
                <div class="fx-info">
                  <span class="fx-label">⎵ Spacebar Stabilizer Clack</span>
                  <span class="fx-sub">Deeper resonance & stabilizer wire clack</span>
                </div>
                <div class="fx-ctrls">
                  <button class="mini-snd-btn" :disabled="!soundEnabled" @click="testSpacebar">Play</button>
                  <label class="switch mini-switch">
                    <input type="checkbox" v-model="soundConfig.spacebarSound" :disabled="!soundEnabled" @change="saveConfig" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>

              <div class="studio-fx-item">
                <div class="fx-info">
                  <span class="fx-label">↵ Enter Carriage Return & Chime</span>
                  <span class="fx-sub">Typewriter bell ding or harmonic chime</span>
                </div>
                <div class="fx-ctrls">
                  <button class="mini-snd-btn" :disabled="!soundEnabled" @click="testEnter">Play</button>
                  <label class="switch mini-switch">
                    <input type="checkbox" v-model="soundConfig.enterSound" :disabled="!soundEnabled" @change="saveConfig" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>

              <div class="studio-fx-item">
                <div class="fx-info">
                  <span class="fx-label">⌫ Backspace Deletion Blip</span>
                  <span class="fx-sub">Downward blip when erasing characters</span>
                </div>
                <div class="fx-ctrls">
                  <button class="mini-snd-btn" :disabled="!soundEnabled" @click="testBackspace">Play</button>
                  <label class="switch mini-switch">
                    <input type="checkbox" v-model="soundConfig.backspaceSound" :disabled="!soundEnabled" @change="saveConfig" />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MokiPet from './MokiPet.vue';
import { mokiCoordinator } from '../services/mokiCoordinator';
import { notificationService } from '../services/notifications';
import { emitEvent } from '../services/native';
import { EVENTS } from '../types/events';
import type { KeyboardSoundProfile, Settings } from '../types/settings';

const props = defineProps<{
  soundEnabled: boolean;
  settings?: Settings;
}>();

const state = mokiCoordinator.getState();

const sandboxText = ref('');
const sandboxLastKey = ref('');

// 7 Keyboard Switch Acoustic Profiles
const keyboardProfiles = [
  {
    id: 'clicky' as KeyboardSoundProfile,
    name: 'Mechanical Blue',
    badge: 'Cherry MX / Box White',
    icon: '🔵',
    desc: 'Crisp snappy dual-stage click with tactile click-leaf snap',
  },
  {
    id: 'thock' as KeyboardSoundProfile,
    name: 'Creamy Thock',
    badge: 'Lubed Linear / Holy Panda',
    icon: '🪵',
    desc: 'Deep acoustic wooden resonance and rich low-frequency bottom-out',
  },
  {
    id: 'typewriter' as KeyboardSoundProfile,
    name: 'Vintage Typewriter',
    badge: 'Remington Metal',
    icon: '📜',
    desc: 'Authentic metallic striker impact with classic brass carriage return bell',
  },
  {
    id: 'bubble' as KeyboardSoundProfile,
    name: 'Bubble Pop',
    badge: 'Water Droplets',
    icon: '🫧',
    desc: 'Satisfying upward acoustic bubble pops and organic water chirps',
  },
  {
    id: 'arcade' as KeyboardSoundProfile,
    name: '8-Bit Arcade',
    badge: 'Retro Chiptune',
    icon: '👾',
    desc: 'Square-wave arpeggio blips stepping through classic gaming scales',
  },
  {
    id: 'cyber' as KeyboardSoundProfile,
    name: 'Cyberpunk Neon',
    badge: 'Sci-Fi Laser',
    icon: '⚡',
    desc: 'Resonant sweeping lowpass synth pulse for futuristic neon coders',
  },
  {
    id: 'muted' as KeyboardSoundProfile,
    name: 'Muted Silent',
    badge: 'Topre / Quiet Membrane',
    icon: '🔇',
    desc: 'Soft cushioned rubber-dome bottom-out for quiet late-night sessions',
  },
];

const currentProfile = computed<KeyboardSoundProfile>({
  get() {
    return (
      props.settings?.soundEffects?.keyboardProfile ||
      notificationService.getSoundEffectsConfig().keyboardProfile ||
      'clicky'
    );
  },
  set(val: KeyboardSoundProfile) {
    if (props.settings?.soundEffects) {
      props.settings.soundEffects.keyboardProfile = val;
    }
    notificationService.setKeyboardProfile(val);
    saveConfig();
  },
});

const activeProfileMeta = computed(() => {
  return keyboardProfiles.find((p) => p.id === currentProfile.value) || keyboardProfiles[0];
});

const soundConfig = computed(() => {
  if (props.settings?.soundEffects) {
    return props.settings.soundEffects;
  }
  return notificationService.getSoundEffectsConfig();
});

function saveConfig() {
  notificationService.setSoundEffectsConfig(soundConfig.value);
  try {
    const raw = localStorage.getItem('devpet:settings:v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.soundEffects = parsed.soundEffects || {};
      Object.assign(parsed.soundEffects, soundConfig.value);
      localStorage.setItem('devpet:settings:v1', JSON.stringify(parsed));
      emitEvent(EVENTS.settings, parsed).catch(() => {});
    }
  } catch {}
}

function setProfile(prof: KeyboardSoundProfile) {
  currentProfile.value = prof;
  if (props.soundEnabled) {
    notificationService.playKeyClick(' ', prof);
  }
}

function cycleKeyboardProfile() {
  const currentIndex = keyboardProfiles.findIndex((p) => p.id === currentProfile.value);
  const nextProfile = keyboardProfiles[(currentIndex + 1) % keyboardProfiles.length];
  setProfile(nextProfile.id);
  mokiCoordinator.showSpeechBubble(`Sound: ${nextProfile.name} ${nextProfile.icon}`, 2600);
}

function auditionProfile(prof: KeyboardSoundProfile) {
  if (props.soundEnabled) {
    notificationService.playKeyboardProfileSound(prof);
  }
}

function testSpacebar() {
  if (props.soundEnabled) {
    notificationService.playSpacebarSound(currentProfile.value);
  }
}

function testEnter() {
  if (props.soundEnabled) {
    notificationService.playEnterSound(currentProfile.value);
  }
}

function testBackspace() {
  if (props.soundEnabled) {
    notificationService.playBackspaceSound(currentProfile.value);
  }
}

function testMokiEmotion(emotion: string) {
  switch (emotion) {
    case 'happy':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 4000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Moki is so happy typing with you! ✨🐾',
        durationMs: 3500,
      });
      break;
    case 'typing':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'typing', durationMs: 4500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Focus mode locked in! Coding frenzy! 💻⚡',
        durationMs: 3500,
      });
      break;
    case 'turbo':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'turbo', durationMs: 4500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'TURBO SPEED UNLOCKED! 🚀⚡ 85+ WPM!',
        durationMs: 4000,
      });
      if (props.soundEnabled) {
        notificationService.playTurboPowerup();
      }
      break;
    case 'thinking':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'thinking', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Pondering deep algorithms... 🧠💡',
        durationMs: 4000,
      });
      break;
    case 'waiting':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'waiting', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Waiting for your action! Ready when you are! ⏳🐾',
        durationMs: 4000,
      });
      break;
    case 'celebrating':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'celebrating', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Task complete! High five victory! 🎉🐾',
        durationMs: 4000,
      });
      if (props.soundEnabled) {
        notificationService.playTaskCelebration();
      }
      break;
    case 'error':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'error', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Bug detected! Don\'t panic, we can fix it! ⚠️⚡',
        durationMs: 4000,
      });
      if (props.soundEnabled) {
        notificationService.playAlertChime();
      }
      break;
    case 'sleepy':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'sleepy', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Zzz... Snoozing on the keyboard... 💤',
        durationMs: 3500,
      });
      break;
    case 'stretching':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'stretching', durationMs: 5000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Cat stretch break! Stretch paws & breathe! 🌸🐾',
        durationMs: 3500,
      });
      if (props.soundEnabled) {
        notificationService.playStretchZenChime();
      }
      break;
    case 'blissful':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'blissful', durationMs: 4000 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Purrrrr~ that feels wonderful! 💕✨',
        durationMs: 3500,
      });
      if (props.soundEnabled) {
        notificationService.playPurr();
      }
      break;
    case 'boop':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle' });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: 'Hehe you booped my snoot! 🐾❤️',
        durationMs: 3000,
      });
      if (props.soundEnabled) {
        notificationService.playMascotBoop();
      }
      break;
  }
}

function onSandboxKeydown(e: KeyboardEvent) {
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  sandboxLastKey.value = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
  mokiCoordinator.recordKeystroke(key);

  if (props.soundEnabled) {
    notificationService.playKeyClick(e.key, currentProfile.value);
  }
}
</script>

<style scoped>
.moki-station-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero Banner */
.moki-hero-banner {
  background: linear-gradient(135deg, #1e1f22 0%, #2b2d31 100%);
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.hero-left {
  max-width: 680px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #fdba74;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}
.badge-dot.turbo { background: #f97316; box-shadow: 0 0 8px #f97316; }
.badge-dot.godspeed { background: #ec4899; box-shadow: 0 0 10px #ec4899; }

.hero-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
}

.hero-sub {
  margin: 6px 0 16px;
  font-size: 13px;
  color: #949ba4;
  line-height: 1.5;
}

.hero-stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.h-stat-card {
  background: #111214;
  border: 1px solid #383a40;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 110px;
}

.stat-label {
  font-size: 10px;
  font-weight: 800;
  color: #949ba4;
  letter-spacing: 0.5px;
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.stat-num {
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
}

.stat-unit {
  font-size: 11px;
  color: #949ba4;
  font-weight: 700;
}

.stat-tier-tag {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: #313338;
  color: #dbdee1;
}
.stat-tier-tag.turbo { background: #ea580c; color: #ffffff; }
.stat-tier-tag.godspeed { background: #db2777; color: #ffffff; }

.combo-num {
  color: #f43f5e;
  text-shadow: 0 0 8px rgba(244, 63, 94, 0.4);
}

.hero-mascot-preview {
  width: 170px;
  height: 170px;
  position: relative;
}

/* 2-Column Grid */
.moki-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 960px) {
  .moki-grid {
    grid-template-columns: 1fr;
  }
}

.moki-card {
  background: #2b2d31;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 22px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.card-desc {
  margin: 2px 0 0;
  font-size: 11px;
  color: #949ba4;
}

/* Panel 1: Playground */
.sandbox-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #111214;
  border: 1.5px solid #383a40;
  border-radius: 10px;
  padding: 12px 14px;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
}
.sandbox-textarea:focus {
  border-color: #fdba74;
  box-shadow: 0 0 12px rgba(253, 186, 116, 0.25);
}

.sandbox-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.action-btn-clean {
  background: #1e1f22;
  border: 1px solid #383a40;
  color: #949ba4;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.action-btn-clean:hover:not(:disabled) {
  color: #ffffff;
  background: #313338;
}

.sandbox-hint {
  font-size: 11px;
  color: #949ba4;
}

.live-combo-pill {
  background: linear-gradient(135deg, #f43f5e 0%, #ea580c 100%);
  color: #ffffff;
  font-weight: 900;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 14px;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
  animation: pulseCombo 0.7s infinite alternate;
}
@keyframes pulseCombo {
  0% { transform: scale(0.96); }
  100% { transform: scale(1.04); }
}

/* Panel 2: Emotion Showcase */
.emotions-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.emotion-trigger-btn {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 10px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emotion-trigger-btn:hover {
  background: #313338;
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.e-icon {
  font-size: 22px;
}

.e-label {
  font-size: 11px;
  font-weight: 700;
  color: #dbdee1;
  text-align: center;
}

/* Header Actions & Quick Switcher Pill */
.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sound-profile-quick-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #e9d5ff;
  border-radius: 20px;
  padding: 4px 11px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sound-profile-quick-pill:hover {
  background: rgba(168, 85, 247, 0.28);
  border-color: #c084fc;
  transform: translateY(-1px);
}

.pill-switch-tag {
  font-size: 10px;
  color: #c084fc;
  font-weight: 800;
  margin-left: 3px;
}

.sandbox-left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.last-key-badge {
  font-size: 10px;
  font-family: monospace;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}

/* Panel 3: Keyboard Studio Card */
.keyboard-studio-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2b2d31 0%, #1f2024 100%);
  border-color: rgba(168, 85, 247, 0.3);
}

.studio-icon {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.35);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.active-profile-indicator {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
  font-size: 11px;
  font-weight: 800;
}

.profiles-section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 12px 0 10px;
  font-size: 12px;
  font-weight: 800;
  color: #dbdee1;
  letter-spacing: 0.5px;
}

.profiles-hint {
  font-size: 11px;
  color: #949ba4;
  font-weight: normal;
}

.studio-profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.studio-profile-card {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.studio-profile-card:hover:not(.disabled) {
  border-color: rgba(168, 85, 247, 0.45);
  transform: translateY(-2px);
  background: #232428;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.studio-profile-card.active {
  border-color: #a855f7;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(88, 28, 135, 0.25));
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.3);
}

.studio-profile-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.prof-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prof-icon {
  font-size: 22px;
}

.active-tag {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  background: #a855f7;
  color: #ffffff;
}

.prof-name {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  margin-top: 3px;
}

.prof-badge {
  font-size: 10px;
  font-weight: 700;
  color: #c084fc;
}

.prof-desc {
  font-size: 11px;
  color: #949ba4;
  line-height: 1.4;
  margin: 3px 0 8px;
  flex: 1;
}

.prof-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}

.audition-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #dbdee1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.audition-btn:hover:not(:disabled) {
  background: #a855f7;
  color: #ffffff;
  border-color: #c084fc;
}

.prof-status {
  font-size: 10px;
  color: #64748b;
  font-weight: 700;
}

.studio-profile-card.active .prof-status {
  color: #c084fc;
}

/* Sub-panels Grid */
.studio-sub-panels-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.dedicated-keys-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.studio-sub-panel {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-panel-title {
  font-size: 12px;
  font-weight: 800;
  color: #dbdee1;
  margin: 0 0 6px;
  letter-spacing: 0.5px;
}

.studio-fx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.fx-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fx-label {
  font-size: 12px;
  font-weight: 700;
  color: #f2f3f5;
}

.fx-sub {
  font-size: 10px;
  color: #949ba4;
}

.fx-ctrls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-snd-btn {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-snd-btn:hover:not(:disabled) {
  background: #a855f7;
  color: #ffffff;
}

/* Switches */
.switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
}

.switch.mini-switch {
  width: 32px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #383a40;
  transition: 0.25s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: #ffffff;
  transition: 0.25s;
}

.switch.mini-switch .slider:before {
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
}

input:checked + .slider {
  background-color: #a855f7;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.switch.mini-switch input:checked + .slider:before {
  transform: translateX(14px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
