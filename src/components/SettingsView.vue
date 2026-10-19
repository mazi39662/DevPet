<template>
  <div class="settings-container">
    <!-- Header Banner -->
    <div class="settings-hero">
      <div class="settings-hero-content">
        <div class="settings-badge">
          <span>PREFERENCES & AUDIO</span>
        </div>
        <h2 class="settings-title">App Settings & Audio Configurations</h2>
        <p class="settings-subtitle">
          Customize sound effects, volume slider levels, companion behaviors, and focus intervals.
        </p>
      </div>

      <div class="settings-header-actions">
        <button class="btn secondary" @click="resetDefaults" title="Reset all settings to default values">
          🔄 Reset Defaults
        </button>
        <button class="btn primary" @click="saveFeedback" title="Confirm and save configurations">
          💾 Save Changes
        </button>
      </div>
    </div>

    <!-- Main Settings Sections -->
    <div class="settings-grid">
      <!-- ======================================================== -->
      <!-- SECTION 1: AUDIO & SOUND EFFECTS                         -->
      <!-- ======================================================== -->
      <div class="settings-card audio-card">
        <div class="card-header">
          <div class="card-icon audio-icon">🔊</div>
          <div>
            <h3 class="card-title">Audio & Sound Effects</h3>
            <p class="card-desc">Control procedural Web Audio synthesis and volume levels</p>
          </div>
        </div>

        <div class="card-body">
          <!-- Master Sound Toggle -->
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Master Sound Effects</span>
              <span class="setting-sub">Enable or mute all audible sound feedback across DevPet</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.soundEnabled" />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Volume Slider -->
          <div class="setting-row volume-slider-row" :class="{ disabled: !settings.soundEnabled }">
            <div class="setting-info">
              <div class="label-with-val">
                <span class="setting-label">Master Volume</span>
                <span class="volume-val-badge">{{ settings.volume }}%</span>
              </div>
              <span class="setting-sub">Adjust synthesized chime and notification volume</span>
            </div>

            <div class="slider-control-group">
              <span class="vol-icon">{{ volumeIcon }}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                v-model.number="settings.volume"
                :disabled="!settings.soundEnabled"
                class="range-slider"
                @input="onVolumeInput"
              />
              <button
                class="test-btn"
                :disabled="!settings.soundEnabled"
                @click="testVolume"
                title="Test volume"
              >
                Audition
              </button>
            </div>
          </div>

          <!-- Keyboard Volume Slider -->
          <div class="setting-row volume-slider-row" :class="{ disabled: !settings.soundEnabled || !settings.soundEffects.typing }">
            <div class="setting-info">
              <div class="label-with-val">
                <span class="setting-label">Keyboard Sound Volume</span>
                <span class="volume-val-badge">{{ settings.keyboardVolume ?? 80 }}%</span>
              </div>
              <span class="setting-sub">Dedicated volume slider for mechanical typing switch clicks & key sounds</span>
            </div>

            <div class="slider-control-group">
              <span class="vol-icon">⌨️</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                v-model.number="settings.keyboardVolume"
                :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                class="range-slider"
                @input="onKeyboardVolumeInput"
              />
              <button
                class="test-btn"
                :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                @click="testKeyboardSound"
                title="Test keyboard sound"
              >
                Audition
              </button>
            </div>
          </div>

          <!-- Granular Sound Effects -->
          <div class="sound-effects-group">
            <h4 class="subgroup-title">Individual Sound Effects</h4>

            <div class="fx-item">
              <div class="fx-info">
                <span class="fx-name">🎉 Task Completion Fanfare</span>
                <span class="fx-sub">Play celebratory chimes when Codi finishes an AI turn</span>
              </div>
              <div class="fx-actions">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.completion"
                  @click="testCompletionSound"
                >
                  Play
                </button>
                <label class="switch mini-switch">
                  <input
                    type="checkbox"
                    v-model="settings.soundEffects.completion"
                    :disabled="!settings.soundEnabled"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="fx-item">
              <div class="fx-info">
                <span class="fx-name">🍅 Pomodoro Bells & Singing Bowl</span>
                <span class="fx-sub">Focus start chimes and relaxing break singing bowls</span>
              </div>
              <div class="fx-actions">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.pomodoro"
                  @click="testPomodoroSound"
                >
                  Play
                </button>
                <label class="switch mini-switch">
                  <input
                    type="checkbox"
                    v-model="settings.soundEffects.pomodoro"
                    :disabled="!settings.soundEnabled"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="fx-item">
              <div class="fx-info">
                <span class="fx-name">⌨️ Mechanical Typing Switch Clicks</span>
                <span class="fx-sub">Tactile micro-clicks when Moki observes keystroke velocity</span>
              </div>
              <div class="fx-actions">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                  @click="testTypingSound"
                >
                  Play
                </button>
                <label class="switch mini-switch">
                  <input
                    type="checkbox"
                    v-model="settings.soundEffects.typing"
                    :disabled="!settings.soundEnabled"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="fx-item">
              <div class="fx-info">
                <span class="fx-name">🐾 Mascot Purr & Interaction</span>
                <span class="fx-sub">Affectionate purrs and chirps when petting companions</span>
              </div>
              <div class="fx-actions">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.purr"
                  @click="testPurrSound"
                >
                  Play
                </button>
                <label class="switch mini-switch">
                  <input
                    type="checkbox"
                    v-model="settings.soundEffects.purr"
                    :disabled="!settings.soundEnabled"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="fx-item">
              <div class="fx-info">
                <span class="fx-name">⚠️ Attention & Action Required Alerts</span>
                <span class="fx-sub">Two-tone alerts when Antigravity requires approval</span>
              </div>
              <div class="fx-actions">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.alerts"
                  @click="testAlertSound"
                >
                  Play
                </button>
                <label class="switch mini-switch">
                  <input
                    type="checkbox"
                    v-model="settings.soundEffects.alerts"
                    :disabled="!settings.soundEnabled"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 2: MOKI KEYBOARD SOUND CUSTOMIZATION & PROFILES  -->
      <!-- ======================================================== -->
      <div class="settings-card keyboard-sound-card">
        <div class="card-header">
          <div class="card-icon keyboard-icon">⌨️</div>
          <div class="card-header-meta">
            <div class="header-tag-row">
              <h3 class="card-title">Moki Keyboard Sound Customization</h3>
              <span class="kb-profile-badge">Active: {{ activeProfileName }}</span>
            </div>
            <p class="card-desc">Choose tactile mechanical switch acoustics, special key sound effects, and streak fanfares</p>
          </div>
        </div>

        <div class="card-body">
          <!-- Switch Profiles Carousel / Grid -->
          <div class="section-sub-header">
            <div>
              <h4 class="subgroup-title">Acoustic Switch Profiles (Click to Select & Audition)</h4>
              <span class="subgroup-hint">Real-time procedural Web Audio synthesis • Zero asset latency</span>
            </div>
          </div>

          <div class="profiles-carousel-grid">
            <div
              v-for="prof in keyboardProfiles"
              :key="prof.id"
              class="profile-card"
              :class="{
                active: settings.soundEffects.keyboardProfile === prof.id,
                disabled: !settings.soundEnabled || !settings.soundEffects.typing
              }"
              @click="selectKeyboardProfile(prof.id)"
            >
              <div class="prof-card-top">
                <span class="prof-icon">{{ prof.icon }}</span>
                <span v-if="settings.soundEffects.keyboardProfile === prof.id" class="active-pill">ACTIVE</span>
              </div>
              <div class="prof-title">{{ prof.name }}</div>
              <div class="prof-badge">{{ prof.badge }}</div>
              <p class="prof-desc">{{ prof.desc }}</p>

              <div class="prof-card-footer">
                <button
                  class="audition-chip-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                  @click.stop="testKeyboardProfile(prof.id)"
                  title="Audition sound effect"
                >
                  🔊 Audition
                </button>
                <span class="select-indicator">
                  {{ settings.soundEffects.keyboardProfile === prof.id ? '✓ Selected' : 'Tap to set' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Dedicated Keys Section -->
          <div class="kb-features-split single-panel">
            <div class="kb-feature-panel full-width">
              <h4 class="subgroup-title">Dedicated Key Sound Effects</h4>

              <div class="kb-keys-grid">
                <div class="fx-item">
                  <div class="fx-info">
                    <span class="fx-name">⎵ Stabilized Spacebar Clack</span>
                    <span class="fx-sub">Deeper resonance & stabilizer wire acoustics</span>
                  </div>
                  <div class="fx-actions">
                    <button
                      class="mini-audition-btn"
                      :disabled="!settings.soundEnabled || !settings.soundEffects.typing || !settings.soundEffects.spacebarSound"
                      @click="testSpacebarSound"
                    >
                      Play
                    </button>
                    <label class="switch mini-switch">
                      <input
                        type="checkbox"
                        v-model="settings.soundEffects.spacebarSound"
                        :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>

                <div class="fx-item">
                  <div class="fx-info">
                    <span class="fx-name">↵ Enter Carriage Return & Chime</span>
                    <span class="fx-sub">Authentic carriage return bell or affirmative chord</span>
                  </div>
                  <div class="fx-actions">
                    <button
                      class="mini-audition-btn"
                      :disabled="!settings.soundEnabled || !settings.soundEffects.typing || !settings.soundEffects.enterSound"
                      @click="testEnterSound"
                    >
                      Play
                    </button>
                    <label class="switch mini-switch">
                      <input
                        type="checkbox"
                        v-model="settings.soundEffects.enterSound"
                        :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>

                <div class="fx-item">
                  <div class="fx-info">
                    <span class="fx-name">⌫ Backspace Deletion Blip</span>
                    <span class="fx-sub">Soft downward blip when deleting characters</span>
                  </div>
                  <div class="fx-actions">
                    <button
                      class="mini-audition-btn"
                      :disabled="!settings.soundEnabled || !settings.soundEffects.typing || !settings.soundEffects.backspaceSound"
                      @click="testBackspaceSound"
                    >
                      Play
                    </button>
                    <label class="switch mini-switch">
                      <input
                        type="checkbox"
                        v-model="settings.soundEffects.backspaceSound"
                        :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Keyboard Audio Audition Sandbox -->
          <div class="interactive-sandbox-container">
            <div class="sandbox-header">
              <span class="sandbox-title">⌨️ Interactive Typing Audition Sandbox</span>
              <span class="sandbox-stats">
                Keystrokes: <strong>{{ sandboxKeystrokeCount }}</strong>
                <span v-if="sandboxLastKey" class="last-key-pill">Key: {{ sandboxLastKey }}</span>
              </span>
            </div>
            <div class="sandbox-input-wrapper">
              <input
                type="text"
                v-model="sandboxText"
                placeholder="Type here to test switch sounds, spacebar, and enter in real time..."
                class="sandbox-input"
                @keydown="onSandboxKeyDown"
              />
              <button class="sandbox-clear-btn" @click="sandboxText = ''; sandboxKeystrokeCount = 0" title="Clear test input">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 3: DESKTOP COMPANION BEHAVIORS                   -->
      <!-- ======================================================== -->
      <div class="settings-card companions-card">
        <div class="card-header">
          <div class="card-icon companion-icon">🪟</div>
          <div>
            <h3 class="card-title">Desktop Companion Windows</h3>
            <p class="card-desc">Configure floating transparent window layout & appearance</p>
          </div>
        </div>

        <div class="card-body">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Compact / Mini Mode</span>
              <span class="setting-sub">Reduce window size to save desktop screen real estate</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.companionMini" @change="$emit('update:companionMini', settings.companionMini)" />
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Always On Top</span>
              <span class="setting-sub">Keep floating companion mascots pinned above all applications</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.alwaysOnTop" />
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">OS Desktop Notifications</span>
              <span class="setting-sub">Show native Windows notifications on task completion</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.notificationsEnabled" />
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">AI Agent Background Monitoring</span>
              <span class="setting-sub">Poll and listen for IDE events from Antigravity & VS Code</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.monitoringEnabled" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 3: POMODORO & PRODUCTIVITY CONFIGURATIONS        -->
      <!-- ======================================================== -->
      <div class="settings-card pomodoro-card">
        <div class="card-header">
          <div class="card-icon pomo-icon">⏱️</div>
          <div>
            <h3 class="card-title">Pomodoro & Focus Timers</h3>
            <p class="card-desc">Fine-tune sprint durations and automatic phase intervals</p>
          </div>
        </div>

        <div class="card-body">
          <div class="slider-field">
            <div class="field-label-row">
              <span class="setting-label">Focus Sprint Duration</span>
              <span class="field-val">{{ settings.pomodoroConfig.focusMinutes }} minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              v-model.number="settings.pomodoroConfig.focusMinutes"
              class="range-slider"
            />
            <div class="preset-pills">
              <button
                v-for="min in [20, 25, 45, 50]"
                :key="min"
                class="preset-pill"
                :class="{ active: settings.pomodoroConfig.focusMinutes === min }"
                @click="settings.pomodoroConfig.focusMinutes = min"
              >
                {{ min }}m
              </button>
            </div>
          </div>

          <div class="slider-field">
            <div class="field-label-row">
              <span class="setting-label">Break Duration</span>
              <span class="field-val">{{ settings.pomodoroConfig.breakMinutes }} minutes</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              v-model.number="settings.pomodoroConfig.breakMinutes"
              class="range-slider"
            />
            <div class="preset-pills">
              <button
                v-for="min in [3, 5, 10, 15]"
                :key="min"
                class="preset-pill"
                :class="{ active: settings.pomodoroConfig.breakMinutes === min }"
                @click="settings.pomodoroConfig.breakMinutes = min"
              >
                {{ min }}m
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Auto-Start Breaks</span>
              <span class="setting-sub">Automatically initiate break timer when focus sprint concludes</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.autoStartBreaks" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 4: MOKI KEYBOARD TARGETS                         -->
      <!-- ======================================================== -->
      <div class="settings-card moki-card">
        <div class="card-header">
          <div class="card-icon moki-icon">⌨️</div>
          <div>
            <h3 class="card-title">Moki Keyboard Targets</h3>
            <p class="card-desc">Keystroke targets, velocity thresholds, and typing audio</p>
          </div>
        </div>

        <div class="card-body">
          <div class="slider-field">
            <div class="field-label-row">
              <span class="setting-label">Target Typing Speed</span>
              <span class="field-val">{{ settings.targetWpm || 75 }} WPM</span>
            </div>
            <input
              type="range"
              min="30"
              max="140"
              step="5"
              v-model.number="settings.targetWpm"
              class="range-slider"
            />
            <span class="setting-sub">Speed above this threshold triggers joyful particle bursts!</span>
          </div>

          <div class="slider-field">
            <div class="field-label-row">
              <span class="setting-label">Keyboard Sound Volume</span>
              <div class="field-action-group">
                <button
                  class="mini-audition-btn"
                  :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
                  @click="testKeyboardSound"
                  title="Audition keyboard switch sound"
                >
                  Play
                </button>
                <span class="field-val">{{ settings.keyboardVolume ?? 80 }}%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              v-model.number="settings.keyboardVolume"
              :disabled="!settings.soundEnabled || !settings.soundEffects.typing"
              class="range-slider"
              @input="onKeyboardVolumeInput"
            />
            <span class="setting-sub">Dedicated volume slider for mechanical typing switch clicks</span>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SECTION 5: ONBOARDING, TOURS & TUTORIALS                 -->
      <!-- ======================================================== -->
      <div class="settings-card onboarding-card">
        <div class="card-header">
          <div class="card-icon tour-icon">🎓</div>
          <div>
            <h3 class="card-title">Onboarding & Guided Tours</h3>
            <p class="card-desc">Replay introductory wizards and discover companion secrets</p>
          </div>
        </div>

        <div class="card-body">
          <div class="onboarding-actions-grid">
            <button class="settings-action-tile" @click="$emit('open-onboarding')">
              <span class="tile-icon">🚀</span>
              <div class="tile-text">
                <strong>Replay Onboarding Wizard</strong>
                <span>Step-by-step introduction to DevPet & mascots</span>
              </div>
            </button>

            <button class="settings-action-tile" @click="$emit('start-tour')">
              <span class="tile-icon">✨</span>
              <div class="tile-text">
                <strong>Interactive UI Spotlight Tour</strong>
                <span>Guided walkthrough highlighting buttons & shortcuts</span>
              </div>
            </button>

            <button class="settings-action-tile" @click="$emit('open-tutorials')">
              <span class="tile-icon">🎮</span>
              <div class="tile-text">
                <strong>Interactive Pet Playground & Guides</strong>
                <span>Live mascot sandbox, WPM arena & hook walkthrough</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Feedback -->
    <transition name="fade">
      <div v-if="toastMessage" class="settings-toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Settings, KeyboardSoundProfile } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { notificationService } from '../services/notifications';

const props = defineProps<{
  settings: Settings;
}>();

const emit = defineEmits<{
  (e: 'update:companionMini', val: boolean): void;
  (e: 'open-onboarding'): void;
  (e: 'start-tour'): void;
  (e: 'open-tutorials'): void;
}>();

const toastMessage = ref('');

const volumeIcon = computed(() => {
  if (!props.settings.soundEnabled || props.settings.volume === 0) return '🔇';
  if (props.settings.volume < 45) return '🔉';
  return '🔊';
});

// 12 Keyboard Switch Acoustic Profiles
const keyboardProfiles = [
  {
    id: 'clicky' as KeyboardSoundProfile,
    name: 'Mechanical Blue',
    badge: 'Cherry MX / Box White',
    icon: '🔵',
    desc: 'Crisp snappy dual-stage click with tactile click-leaf snap',
    soundColor: '#38bdf8',
  },
  {
    id: 'thock' as KeyboardSoundProfile,
    name: 'Creamy Thock',
    badge: 'Lubed Linear / Holy Panda',
    icon: '🪵',
    desc: 'Deep acoustic wooden resonance and rich low-frequency bottom-out',
    soundColor: '#fb923c',
  },
  {
    id: 'marbly' as KeyboardSoundProfile,
    name: 'Hi-Fi Marbly',
    badge: 'PE Foam / Jelly Epoch',
    icon: '🔮',
    desc: 'Rich resonant marbly clack with high-frequency pop and hollow chamber snap',
    soundColor: '#c084fc',
  },
  {
    id: 'creamy' as KeyboardSoundProfile,
    name: 'Lubed Creamy',
    badge: 'Milky Yellow / Alpaca',
    icon: '🍦',
    desc: 'Silky butter-smooth linear switch with cushioned bottom-out and warm tone',
    soundColor: '#fde047',
  },
  {
    id: 'waterdrop' as KeyboardSoundProfile,
    name: 'Waterdrop',
    badge: 'Crystal Dewdrop',
    icon: '💧',
    desc: 'Soothing clean water droplet plink with crisp crystal acoustic resonance',
    soundColor: '#06b6d4',
  },
  {
    id: 'synthwave' as KeyboardSoundProfile,
    name: '80s Synthwave',
    badge: 'Analog Poly-Synth',
    icon: '🕹️',
    desc: 'Neon 80s retro FM synth keyboard clack with dual-harmonic vintage tone',
    soundColor: '#ec4899',
  },
  {
    id: 'wooden' as KeyboardSoundProfile,
    name: 'Bamboo Wood',
    badge: 'Natural Woodblock',
    icon: '🪵',
    desc: 'Organic hollow bamboo tap with dry percussive mechanical knock',
    soundColor: '#a16207',
  },
  {
    id: 'typewriter' as KeyboardSoundProfile,
    name: 'Vintage Typewriter',
    badge: 'Remington Metal',
    icon: '📜',
    desc: 'Authentic metallic striker impact with classic brass carriage return bell',
    soundColor: '#facc15',
  },
  {
    id: 'bubble' as KeyboardSoundProfile,
    name: 'Bubble Pop',
    badge: 'Water Droplets',
    icon: '🫧',
    desc: 'Satisfying upward acoustic bubble pops and organic water chirps',
    soundColor: '#a855f7',
  },
  {
    id: 'arcade' as KeyboardSoundProfile,
    name: '8-Bit Arcade',
    badge: 'Retro Chiptune',
    icon: '👾',
    desc: 'Square-wave arpeggio blips stepping through classic gaming scales',
    soundColor: '#22c55e',
  },
  {
    id: 'cyber' as KeyboardSoundProfile,
    name: 'Cyberpunk Neon',
    badge: 'Sci-Fi Laser',
    icon: '⚡',
    desc: 'Resonant sweeping lowpass synth pulse for futuristic neon coders',
    soundColor: '#f43f5e',
  },
  {
    id: 'muted' as KeyboardSoundProfile,
    name: 'Muted Silent',
    badge: 'Topre / Quiet Membrane',
    icon: '🔇',
    desc: 'Soft cushioned rubber-dome bottom-out for quiet late-night sessions',
    soundColor: '#94a3b8',
  },
];

const activeProfileName = computed(() => {
  const current = keyboardProfiles.find(
    (p) => p.id === props.settings.soundEffects.keyboardProfile
  );
  return current ? `${current.name} ${current.icon}` : 'Mechanical Blue 🔵';
});

// Interactive Typing Audition Sandbox
const sandboxText = ref('');
const sandboxLastKey = ref('');
const sandboxKeystrokeCount = ref(0);

function onSandboxKeyDown(e: KeyboardEvent) {
  sandboxLastKey.value = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
  sandboxKeystrokeCount.value++;
  if (props.settings.soundEnabled && props.settings.soundEffects.typing) {
    notificationService.playKeyClick(e.key, props.settings.soundEffects.keyboardProfile);
  }
}

function selectKeyboardProfile(profile: KeyboardSoundProfile) {
  props.settings.soundEffects.keyboardProfile = profile;
  notificationService.setKeyboardProfile(profile);
  if (props.settings.soundEnabled) {
    notificationService.playKeyClick(' ', profile);
  }
}

function testKeyboardProfile(profile: KeyboardSoundProfile) {
  if (props.settings.soundEnabled) {
    notificationService.playKeyboardProfileSound(profile);
  }
}

function testSpacebarSound() {
  notificationService.playSpacebarSound(props.settings.soundEffects.keyboardProfile);
}

function testEnterSound() {
  notificationService.playEnterSound(props.settings.soundEffects.keyboardProfile);
}

function testBackspaceSound() {
  notificationService.playBackspaceSound(props.settings.soundEffects.keyboardProfile);
}

function onVolumeInput() {
  notificationService.setVolume(props.settings.volume / 100);
}

function onKeyboardVolumeInput() {
  notificationService.setKeyboardVolume((props.settings.keyboardVolume ?? 80) / 100);
}

function testKeyboardSound() {
  notificationService.setKeyboardVolume((props.settings.keyboardVolume ?? 80) / 100);
  notificationService.playKeyClick(' ', props.settings.soundEffects.keyboardProfile);
}

function testVolume() {
  notificationService.setVolume(props.settings.volume / 100);
  notificationService.playPreviewSound();
}

function testCompletionSound() {
  notificationService.playChime();
}

function testPomodoroSound() {
  notificationService.playBreakBell();
}

function testTypingSound() {
  notificationService.playKeyClick('A', props.settings.soundEffects.keyboardProfile);
}

function testPurrSound() {
  notificationService.playPurr();
}

function testAlertSound() {
  notificationService.playAlertChime();
}

function saveFeedback() {
  showToast('✓ Settings configurations saved successfully!');
}

function resetDefaults() {
  Object.assign(props.settings, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
  notificationService.setVolume(props.settings.volume / 100);
  notificationService.setSoundEffectsConfig(props.settings.soundEffects);
  showToast('✓ Restored all configurations to default values');
}

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3500);
}
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   Hero Banner
   ========================================================================== */
.settings-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(26, 28, 36, 0.95), rgba(18, 20, 26, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  gap: 20px;
  flex-wrap: wrap;
}

.settings-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  border-radius: 20px;
  margin-bottom: 6px;
}

.settings-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.settings-subtitle {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.settings-header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.3);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ==========================================================================
   Settings Grid & Cards
   ========================================================================== */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 22px;
}

@media (max-width: 600px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.settings-card {
  background: rgba(26, 28, 36, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.audio-icon { background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.35); }
.companion-icon { background: rgba(139, 92, 246, 0.16); border: 1px solid rgba(139, 92, 246, 0.35); }
.pomo-icon { background: rgba(244, 63, 94, 0.16); border: 1px solid rgba(244, 63, 94, 0.35); }
.moki-icon { background: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.35); }
.tour-icon { background: rgba(88, 101, 242, 0.16); border: 1px solid rgba(88, 101, 242, 0.35); }

.onboarding-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.settings-action-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: inherit;
}

.settings-action-tile:hover {
  background: rgba(88, 101, 242, 0.15);
  border-color: #5865f2;
  transform: translateY(-2px);
}

.tile-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tile-text strong {
  display: block;
  font-size: 13px;
  color: #ffffff;
  margin-bottom: 2px;
}

.tile-text span {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

.card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.card-desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==========================================================================
   Setting Rows & Fields
   ========================================================================== */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.setting-sub {
  font-size: 12px;
  color: #828c9b;
}

.label-with-val {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-val-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
}

/* Volume Slider Controls */
.slider-control-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.vol-icon {
  font-size: 16px;
}

.range-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #38bdf8;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
  transition: transform 0.1s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.test-btn {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.25);
}

/* Granular Sound Effects */
.sound-effects-group {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subgroup-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.fx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 10px 14px;
  border-radius: 12px;
}

.fx-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fx-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.fx-sub {
  font-size: 11px;
  color: #828c9b;
}

.fx-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-audition-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.mini-audition-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
}

/* Slider Fields (Pomo & Moki) */
.slider-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.slider-field:last-child {
  border-bottom: none;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-val {
  color: #38bdf8;
  font-weight: 700;
  font-size: 13px;
}

.preset-pills {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.preset-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-pill:hover,
.preset-pill.active {
  background: #38bdf8;
  color: #0f172a;
  border-color: #38bdf8;
}

/* ==========================================================================
   Switch Toggle
   ========================================================================== */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.mini-switch {
  width: 36px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.15);
  transition: 0.2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
}

.mini-switch .slider:before {
  height: 14px;
  width: 14px;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.mini-switch input:checked + .slider:before {
  transform: translateX(16px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Toast */
.settings-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #10b981;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  z-index: 100;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ==========================================================================
   Section 2: Keyboard Sound Customization & Profiles
   ========================================================================== */
.keyboard-sound-card {
  grid-column: 1 / -1;
  border-color: rgba(168, 85, 247, 0.25);
  background: linear-gradient(135deg, rgba(26, 28, 36, 0.95), rgba(22, 20, 32, 0.95));
}

.keyboard-icon {
  background: rgba(168, 85, 247, 0.16);
  border: 1px solid rgba(168, 85, 247, 0.35);
}

.card-header-meta {
  flex: 1;
}

.header-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.kb-profile-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
  font-size: 11px;
  font-weight: 800;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.section-sub-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.subgroup-hint {
  font-size: 11px;
  color: #94a3b8;
}

.profiles-carousel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.profile-card {
  position: relative;
  background: rgba(18, 20, 26, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-card:hover:not(.disabled) {
  border-color: rgba(168, 85, 247, 0.45);
  transform: translateY(-2px);
  background: rgba(30, 32, 44, 0.85);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.profile-card.active {
  border-color: #a855f7;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(88, 28, 135, 0.25));
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.25), inset 0 0 12px rgba(168, 85, 247, 0.1);
}

.profile-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.prof-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prof-icon {
  font-size: 24px;
}

.active-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 2px 7px;
  border-radius: 10px;
  background: #a855f7;
  color: #ffffff;
}

.prof-title {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  margin-top: 4px;
}

.prof-badge {
  font-size: 10px;
  font-weight: 700;
  color: #c084fc;
}

.prof-desc {
  font-size: 11px;
  line-height: 1.4;
  color: #94a3b8;
  margin: 4px 0 10px;
  flex: 1;
}

.prof-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}

.audition-chip-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.audition-chip-btn:hover:not(:disabled) {
  background: #a855f7;
  color: #ffffff;
  border-color: #c084fc;
}

.select-indicator {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
}

.profile-card.active .select-indicator {
  color: #a855f7;
}

.kb-features-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 6px;
}

.kb-features-split.single-panel {
  grid-template-columns: 1fr;
}

.kb-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .kb-features-split {
    grid-template-columns: 1fr;
  }
}

.kb-feature-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(18, 20, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 16px;
}

/* Interactive Sandbox Container */
.interactive-sandbox-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(18, 20, 26, 0.7);
  border: 1px dashed rgba(168, 85, 247, 0.4);
  border-radius: 14px;
  padding: 16px;
  margin-top: 6px;
}

.sandbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.sandbox-title {
  font-size: 13px;
  font-weight: 800;
  color: #f1f5f9;
}

.sandbox-stats {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.last-key-pill {
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-weight: 800;
  font-family: monospace;
}

.sandbox-input-wrapper {
  display: flex;
  gap: 8px;
}

.sandbox-input {
  flex: 1;
  background: rgba(15, 17, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.sandbox-input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.35);
}

.sandbox-clear-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sandbox-clear-btn:hover {
  background: rgba(244, 63, 94, 0.2);
  border-color: #f43f5e;
  color: #f43f5e;
}
</style>
