<template>
  <div class="moki-station-container">
    <!-- Top HD Mascot Showcase & Lore Banner -->
    <PetProfileBanner
      pet-id="moki"
      name="Moki"
      title="Live Typing Arcade Mascot"
      badge-text="KEYBOARD COMPANION"
      image-src="/pets/moki-hd.jpg"
      image-alt="Moki High-Definition Keyboard Mascot"
      description="Moki is your ultra-responsive desktop keyboard pet! Perched right on your screen, Moki reacts to every keystroke with colorful floating letter particles, tracks live & peak WPM velocity tiers (Casual → Flow → Fast → Godspeed), and plays 12 synthesized acoustic switch profiles. Boop Moki's nose or scratch its ears for loving purrs!"
      :deployed="mokiCompanionVisible"
      :traits="[
        { icon: '⌨️', label: 'WPM Velocity Tracker', desc: 'Real-time typing speed and speed tiers' },
        { icon: '🌈', label: '12 Switch Profiles', desc: 'Mechanical, thock, typewriter, and arcade sounds' },
        { icon: '✨', label: 'Keystroke Particles', desc: 'Floating letter and burst particle physics' },
        { icon: '🐾', label: 'Interactive Boops', desc: 'Petting purrs, affection hearts & sleep cycles' }
      ]"
      @toggle-deploy="$emit('toggle-moki')"
    >
      <template #stats>
        <div class="stat-pill">
          <span class="stat-lbl">CURRENT SPEED</span>
          <span class="stat-val font-mono">{{ state.currentWpm }} <small>WPM</small></span>
          <span class="stat-tier-tag" :class="state.speedTier">{{ state.speedTier.toUpperCase() }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-lbl">TODAY'S PEAK</span>
          <span class="stat-val font-mono">{{ state.peakWpm }} <small>WPM</small></span>
        </div>
        <div class="stat-pill">
          <span class="stat-lbl">KEYSTROKES</span>
          <span class="stat-val font-mono">{{ state.totalKeystrokes.toLocaleString() }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-lbl">PET MOOD</span>
          <span class="stat-val mood-pill-text">{{ state.mood.toUpperCase() }} 🐾</span>
        </div>
      </template>

      <!-- Live interactive pixel pet preview on the right -->
      <template #side>
        <div class="hero-mascot-preview">
          <MokiPet :interactive="true" :sound-enabled="soundEnabled" />
        </div>
      </template>
    </PetProfileBanner>

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
          <button class="emotion-trigger-btn" @click="testMokiEmotion('ear-twitch')">
            <span class="e-icon">👂</span>
            <span class="e-label">Ear Twitch</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('curious-look')">
            <span class="e-icon">👀</span>
            <span class="e-label">Curious Look</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('tail-wag')">
            <span class="e-icon">🐾</span>
            <span class="e-label">Tail Wag</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('bouncy-hop')">
            <span class="e-icon">💫</span>
            <span class="e-label">Bouncy Hop</span>
          </button>
          <button class="emotion-trigger-btn" @click="testMokiEmotion('paw-clean')">
            <span class="e-icon">🐾</span>
            <span class="e-label">Paw Groom</span>
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

      <!-- Panel 3: RAM Memory Sentinel & 4 Animation Suite -->
      <div class="moki-card ram-sentinel-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon ram-icon">🧠</span>
            <div>
              <div class="title-with-badge">
                <h3 class="card-title">RAM Sentinel & Memory Load Animations</h3>
                <span class="active-ram-tag" :class="ramState.tier">
                  {{ ramState.tier.toUpperCase() }} ({{ ramState.percentage }}%)
                </span>
              </div>
              <p class="card-desc">
                Moki dynamically reacts to system memory pressure across 4 distinct animations! Test any animation state below or toggle live system tracking.
              </p>
            </div>
          </div>

          <div class="card-header-actions">
            <button
              class="auto-ram-toggle-pill"
              :class="{ active: ramState.autoTracking }"
              @click="toggleRamAutoTracking"
              :title="ramState.autoTracking ? 'Live Windows System RAM tracking is ACTIVE. Click for manual test mode.' : 'Manual test mode is active. Click to resume auto system tracking.'"
            >
              <span class="track-dot" :class="{ on: ramState.autoTracking }"></span>
              <span>{{ ramState.autoTracking ? 'Auto Sync: ON' : 'Manual Mode' }}</span>
            </button>
          </div>
        </div>

        <!-- Live RAM Progress Meter -->
        <div class="ram-meter-box">
          <div class="ram-meter-top">
            <div class="ram-meter-stat">
              <span class="ram-large-pct font-mono">{{ ramState.percentage }}%</span>
              <span class="ram-tier-pill" :class="ramState.tier">{{ ramState.tier.toUpperCase() }}</span>
              <span class="ram-bytes-label">
                {{ formatRamBytes(ramState.usedBytes) }} used of {{ formatRamBytes(ramState.totalBytes) }} total
              </span>
            </div>
            <span class="ram-state-hint">
              {{ ramState.autoTracking ? '🛰️ Real-Time System RAM' : '🧪 Manual Simulation State' }}
            </span>
          </div>

          <!-- Progress Bar Fill -->
          <div class="ram-track-bar">
            <div
              class="ram-fill-bar"
              :class="ramState.tier"
              :style="{ width: `${Math.min(Math.max(ramState.percentage, 4), 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- 4 Animation Cards Grid -->
        <div class="ram-tiers-grid">
          <div
            v-for="t in ramTiersList"
            :key="t.id"
            class="ram-tier-card"
            :class="[t.id, { active: ramState.tier === t.id }]"
            @click="selectRamTier(t.id)"
          >
            <div class="tier-card-header">
              <span class="tier-card-icon">{{ t.icon }}</span>
              <span class="tier-range-chip">{{ t.range }}</span>
            </div>
            <h4 class="tier-card-title">{{ t.name }}</h4>
            <p class="tier-card-desc">{{ t.animDetails }}</p>
            <div class="tier-card-action">
              <span v-if="ramState.tier === t.id" class="now-active-tag">● ACTIVE ANIMATION</span>
              <span v-else class="play-cue">Play Animation ▶</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 4: Keyboard Sound Studio & Switch Acoustics -->
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

        <!-- Keyboard Sound Volume Slider Control -->
        <div class="studio-volume-card">
          <div class="vol-card-left">
            <div class="vol-icon-box">🎚️</div>
            <div class="vol-text-block">
              <div class="vol-header-row">
                <span class="vol-title">Keyboard Sound Volume</span>
                <span class="vol-badge">{{ keyboardVolumeVal }}%</span>
              </div>
              <p class="vol-desc">Dedicated sliding bar to fine-tune tactile mechanical switch clicks and special key sound effects</p>
            </div>
          </div>

          <div class="vol-card-right">
            <div class="vol-slider-wrapper">
              <span class="vol-sub-label">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                v-model.number="keyboardVolumeVal"
                :disabled="!soundEnabled"
                class="range-slider vol-range-slider"
                @input="onKeyboardVolumeInput"
                aria-label="Keyboard sound volume"
              />
              <span class="vol-sub-label">100%</span>
            </div>
            <button
              class="vol-audition-btn"
              :disabled="!soundEnabled"
              @click="testKeyboardVolumeSound"
              title="Test current keyboard switch volume"
            >
              🔊 Test Sound
            </button>
          </div>
        </div>

        <!-- 12 Acoustic Switch Profiles Grid -->
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
import PetProfileBanner from './PetProfileBanner.vue';
import { mokiCoordinator } from '../services/mokiCoordinator';
import { notificationService } from '../services/notifications';
import { emitEvent } from '../services/native';
import { EVENTS } from '../types/events';
import type { KeyboardSoundProfile, Settings } from '../types/settings';
import type { MokiRamTier } from '../types/moki';
import { DEFAULT_MOKI_STATE } from '../types/moki';

const props = defineProps<{
  soundEnabled: boolean;
  settings?: Settings;
  mokiCompanionVisible?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-moki'): void;
}>();

const state = mokiCoordinator.getState();

const ramState = computed(() => {
  return state.ramUsage || DEFAULT_MOKI_STATE.ramUsage!;
});

const ramTiersList: {
  id: MokiRamTier;
  name: string;
  range: string;
  icon: string;
  animDetails: string;
}[] = [
  {
    id: 'breeze',
    name: 'Cool Breeze',
    range: '< 45% RAM',
    icon: '🍃',
    animDetails: 'Gentle mint cooling fan, floating leaves & sparkles, peaceful content eyes',
  },
  {
    id: 'warm',
    name: 'Active Flow',
    range: '45% – 70% RAM',
    icon: '⚙️',
    animDetails: 'Amber energy aura, revolving memory gear, electric data sparks & focused screen glint',
  },
  {
    id: 'heavy',
    name: 'Heavy Load',
    range: '70% – 85% RAM',
    icon: '💦',
    animDetails: 'High-speed exhaust fan, puffing side steam, cartoon sweat droplets & panting cheeks',
  },
  {
    id: 'meltdown',
    name: 'Meltdown Panic',
    range: '> 85% RAM',
    icon: '🚨',
    animDetails: 'Flashing emergency siren beacon, shockwave radar rings, sizzle sparks & frantic earthquake jitter!',
  },
];

function selectRamTier(tier: MokiRamTier) {
  mokiCoordinator.dispatchAction({
    type: 'set-ram-tier',
    tier,
    autoTracking: false,
  });
  if (props.soundEnabled) {
    if (tier === 'meltdown') {
      notificationService.playAlertChime();
    } else if (tier === 'heavy') {
      notificationService.playKeyClick('Enter');
    } else {
      notificationService.playKeyClick(' ');
    }
  }
}

function toggleRamAutoTracking() {
  const current = ramState.value.autoTracking;
  mokiCoordinator.dispatchAction({
    type: 'set-ram-tracking',
    autoTracking: !current,
  });
}

function formatRamBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 GB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

const sandboxText = ref('');
const sandboxLastKey = ref('');

// 12 Keyboard Switch Acoustic Profiles
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
    id: 'marbly' as KeyboardSoundProfile,
    name: 'Hi-Fi Marbly',
    badge: 'PE Foam / Jelly Epoch',
    icon: '🔮',
    desc: 'Rich resonant marbly clack with high-frequency pop and hollow chamber snap',
  },
  {
    id: 'creamy' as KeyboardSoundProfile,
    name: 'Lubed Creamy',
    badge: 'Milky Yellow / Alpaca',
    icon: '🍦',
    desc: 'Silky butter-smooth linear switch with cushioned bottom-out and warm tone',
  },
  {
    id: 'waterdrop' as KeyboardSoundProfile,
    name: 'Waterdrop',
    badge: 'Crystal Dewdrop',
    icon: '💧',
    desc: 'Soothing clean water droplet plink with crisp crystal acoustic resonance',
  },
  {
    id: 'synthwave' as KeyboardSoundProfile,
    name: '80s Synthwave',
    badge: 'Analog Poly-Synth',
    icon: '🕹️',
    desc: 'Neon 80s retro FM synth keyboard clack with dual-harmonic vintage tone',
  },
  {
    id: 'wooden' as KeyboardSoundProfile,
    name: 'Bamboo Wood',
    badge: 'Natural Woodblock',
    icon: '🪵',
    desc: 'Organic hollow bamboo tap with dry percussive mechanical knock',
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

const keyboardVolumeVal = computed<number>({
  get() {
    if (props.settings && typeof props.settings.keyboardVolume === 'number') {
      return props.settings.keyboardVolume;
    }
    return Math.round(notificationService.getKeyboardVolume() * 100);
  },
  set(val: number) {
    if (props.settings) {
      props.settings.keyboardVolume = val;
    }
    notificationService.setKeyboardVolume(val / 100);
    try {
      const raw = localStorage.getItem('devpet:settings:v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.keyboardVolume = val;
        localStorage.setItem('devpet:settings:v1', JSON.stringify(parsed));
        emitEvent(EVENTS.settings, parsed).catch(() => {});
      }
    } catch {}
  },
});

function onKeyboardVolumeInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const val = Number(target.value);
  keyboardVolumeVal.value = val;
}

function testKeyboardVolumeSound() {
  if (props.soundEnabled) {
    notificationService.playKeyClick(' ', currentProfile.value);
  }
}

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
    case 'ear-twitch':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 3500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: '👂 *ear twitch* Listening closely to keystrokes! ✨',
        durationMs: 3000,
      });
      break;
    case 'curious-look':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 3500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: '👀 *curious look* What will you write next? 🐾',
        durationMs: 3000,
      });
      break;
    case 'tail-wag':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 3500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: '🐾 *wag wag* Super happy to code together! ✨',
        durationMs: 3000,
      });
      break;
    case 'bouncy-hop':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 3500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: '✨ *boing!* Little stretch hop for focus!',
        durationMs: 3000,
      });
      break;
    case 'paw-clean':
      mokiCoordinator.dispatchAction({ type: 'set-mood', mood: 'idle', durationMs: 3500 });
      mokiCoordinator.dispatchAction({
        type: 'set-speech-bubble',
        text: '🐾 *grooming* Polishing my typing paws!',
        durationMs: 3000,
      });
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
.badge-dot.fast { background: #0284c7; box-shadow: 0 0 8px #0284c7; }
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
.stat-tier-tag.fast { background: #0284c7; color: #ffffff; }
.stat-tier-tag.godspeed { background: #db2777; color: #ffffff; }

.mood-pill-text {
  font-size: 16px;
  font-weight: 900;
  color: #38bdf8;
  letter-spacing: 0.5px;
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

/* Studio Dedicated Keyboard Volume Slider Card */
.studio-volume-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: #18191c;
  border: 1.5px solid rgba(168, 85, 247, 0.35);
  border-radius: 12px;
  padding: 14px 18px;
  margin: 10px 0 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  flex-wrap: wrap;
}

.vol-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
  flex: 1;
}

.vol-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.vol-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vol-title {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
}

.vol-badge {
  font-size: 11px;
  font-weight: 800;
  color: #c084fc;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 1px 8px;
  border-radius: 10px;
}

.vol-desc {
  margin: 3px 0 0;
  font-size: 11px;
  color: #949ba4;
}

.vol-card-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1.2;
  min-width: 280px;
  justify-content: flex-end;
}

.vol-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 320px;
}

.vol-sub-label {
  font-size: 11px;
  font-weight: 700;
  color: #6d6f78;
  font-family: monospace;
}

.vol-range-slider {
  flex: 1;
  accent-color: #a855f7;
  cursor: pointer;
  height: 6px;
  border-radius: 3px;
  background: #313338;
}

.vol-audition-btn {
  background: rgba(168, 85, 247, 0.18);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #e9d5ff;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.vol-audition-btn:hover:not(:disabled) {
  background: #a855f7;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);
}

.vol-audition-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* ======================================================== */
/* RAM SENTINEL & ANIMATION LAB PANEL                       */
/* ======================================================== */

.ram-sentinel-card {
  background: #1e1f22;
  border: 1px solid #383a40;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28);
}

.ram-icon {
  background: rgba(168, 85, 247, 0.14);
  color: #c084fc;
}

.active-ram-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 5px;
  letter-spacing: 0.5px;
}
.active-ram-tag.breeze { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
.active-ram-tag.warm { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); }
.active-ram-tag.heavy { background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.35); }
.active-ram-tag.meltdown { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.45); }

.auto-ram-toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #111214;
  border: 1px solid #383a40;
  color: #949ba4;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auto-ram-toggle-pill:hover {
  background: #2b2d31;
  color: #ffffff;
  border-color: #4e5058;
}

.auto-ram-toggle-pill.active {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.track-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
}

.track-dot.on {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
}

/* Meter Box */
.ram-meter-box {
  background: #111214;
  border: 1px solid #2b2d31;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ram-meter-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.ram-meter-stat {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.ram-large-pct {
  font-size: 26px;
  font-weight: 900;
  color: #ffffff;
}

.ram-tier-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
.ram-tier-pill.breeze { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.ram-tier-pill.warm { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.ram-tier-pill.heavy { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
.ram-tier-pill.meltdown { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.ram-bytes-label {
  font-size: 12px;
  color: #949ba4;
  font-weight: 600;
}

.ram-state-hint {
  font-size: 11px;
  color: #949ba4;
  font-weight: 700;
}

.ram-track-bar {
  width: 100%;
  height: 10px;
  background: #1e1f22;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #383a40;
}

.ram-fill-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
}

.ram-fill-bar.breeze {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
}
.ram-fill-bar.warm {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}
.ram-fill-bar.heavy {
  background: linear-gradient(90deg, #ea580c 0%, #fb923c 100%);
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.6);
}
.ram-fill-bar.meltdown {
  background: linear-gradient(90deg, #dc2626 0%, #f87171 100%);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.8);
}

/* 4 Tiers Grid */
.ram-tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}

.ram-tier-card {
  background: #111214;
  border: 1px solid #2b2d31;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.ram-tier-card:hover {
  transform: translateY(-2px);
  border-color: #4e5058;
}

.ram-tier-card.active.breeze {
  border-color: #10b981;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
  background: linear-gradient(135deg, #111214 0%, rgba(16, 185, 129, 0.08) 100%);
}

.ram-tier-card.active.warm {
  border-color: #f59e0b;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
  background: linear-gradient(135deg, #111214 0%, rgba(245, 158, 11, 0.08) 100%);
}

.ram-tier-card.active.heavy {
  border-color: #f97316;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.25);
  background: linear-gradient(135deg, #111214 0%, rgba(249, 115, 22, 0.08) 100%);
}

.ram-tier-card.active.meltdown {
  border-color: #ef4444;
  box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
  background: linear-gradient(135deg, #111214 0%, rgba(239, 68, 68, 0.12) 100%);
}

.tier-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tier-card-icon {
  font-size: 22px;
}

.tier-range-chip {
  font-size: 10px;
  font-weight: 800;
  color: #949ba4;
  background: #1e1f22;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid #383a40;
}

.tier-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.tier-card-desc {
  margin: 0;
  font-size: 12px;
  color: #949ba4;
  line-height: 1.45;
  flex: 1;
}

.tier-card-action {
  margin-top: 4px;
}

.now-active-tag {
  font-size: 10px;
  font-weight: 800;
  color: #4ade80;
  letter-spacing: 0.5px;
}

.ram-tier-card.meltdown .now-active-tag {
  color: #f87171;
}

.play-cue {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  transition: color 0.15s ease;
}

.ram-tier-card:hover .play-cue {
  color: #38bdf8;
}
</style>
