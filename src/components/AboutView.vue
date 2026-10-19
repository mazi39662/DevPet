<template>
  <div class="about-container">
    <!-- Hero / Developer Spotlight Banner -->
    <section class="dev-spotlight-card">
      <div class="spotlight-glow"></div>
      <div class="dev-header-row">
        <div class="dev-avatar-container">
          <div class="avatar-ring">
            <span class="dev-avatar-icon">👨‍💻</span>
          </div>
          <span class="avatar-badge">DEV</span>
        </div>

        <div class="dev-identity">
          <div class="dev-role-chip">
            <span class="role-dot"></span>
            CREATOR & LEAD DEVELOPER
          </div>
          <h2 class="dev-name">Terence Franz Indenerio</h2>
          <p class="dev-tagline">Architecting delightful desktop companions & developer flow tools</p>
        </div>

        <div class="dev-quick-actions">
          <button class="action-btn cheer-btn" @click="sendCheer" title="Send developer cheers & sparkles">
            <span class="btn-icon">✨</span>
            <span>Send Cheers</span>
          </button>
        </div>
      </div>

      <div class="dev-bio-section">
        <p class="bio-text">
          DevPet was created by <strong>Terence Franz Indenerio</strong> to bring life, joy, and mindfulness to the developer's desktop. Rather than working in isolation, DevPet provides an interactive fleet of mascots that monitor autonomous AI coding agents, guide Pomodoro focus sprints, and keep your typing rhythm healthy.
        </p>

        <div class="dev-skills-row">
          <span class="skill-tag">Tauri 2.0</span>
          <span class="skill-tag">Rust</span>
          <span class="skill-tag">Vue 3</span>
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">Web Audio API</span>
          <span class="skill-tag">Multi-Window Desktop OS</span>
        </div>
      </div>
    </section>

    <!-- Companion Roster Philosophy -->
    <section class="companions-showcase">
      <div class="section-title-row">
        <h3 class="section-title">The DevPet Fleet</h3>
        <span class="section-subtitle">Three specialized mascots tailored for deep developer focus</span>
      </div>

      <div class="fleet-grid">
        <!-- Codi Card -->
        <div class="pet-bio-card codi-card">
          <div class="pet-card-head">
            <div class="pet-card-avatar codi-bg">🐾</div>
            <div>
              <h4 class="pet-title">Codi</h4>
              <span class="pet-subtitle">Autonomous AI Agent Monitor</span>
            </div>
          </div>
          <p class="pet-desc">
            Monitors Antigravity, VS Code, and OpenAI Codex in real time. Codi types furiously at a glowing laptop while agents think, and rings cheerful celebration chimes when tasks finish.
          </p>
          <div class="pet-tags">
            <span class="mini-tag">Hook Integrations</span>
            <span class="mini-tag">State Visualizer</span>
          </div>
        </div>

        <!-- Momo Card -->
        <div class="pet-bio-card momo-card">
          <div class="pet-card-head">
            <div class="pet-card-avatar momo-bg">🍅</div>
            <div>
              <h4 class="pet-title">Momo</h4>
              <span class="pet-subtitle">Pomodoro Sprint Buddy</span>
            </div>
          </div>
          <p class="pet-desc">
            Your dedicated focus companion. Drives timed 25-minute sprints and cozy tea breaks, playing soothing harmonic singing bowls to reset your mental bandwidth.
          </p>
          <div class="pet-tags">
            <span class="mini-tag">Focus Pacing</span>
            <span class="mini-tag">Harmonic Chimes</span>
          </div>
        </div>

        <!-- Moki Card -->
        <div class="pet-bio-card moki-card">
          <div class="pet-card-head">
            <div class="pet-card-avatar moki-bg">✨</div>
            <div>
              <h4 class="pet-title">Moki</h4>
              <span class="pet-subtitle">Default Keyboard Companion</span>
            </div>
          </div>
          <p class="pet-desc">
            Tracks real-time WPM and keystroke velocity with kinetic typing sparkles, rewarding steady typing flow and playing rich procedural mechanical switch acoustics with dedicated volume control.
          </p>
          <div class="pet-tags">
            <span class="mini-tag">Default Pet</span>
            <span class="mini-tag">Speedometer</span>
            <span class="mini-tag">Mechanical Switches</span>
          </div>
        </div>
      </div>
    </section>

    <!-- System Specs & Architecture Info -->
    <section class="specs-section">
      <div class="specs-grid">
        <div class="spec-item">
          <div class="spec-label">APP VERSION</div>
          <div class="spec-val">DevPet v0.2.0 <span class="badge-pill">Alpha</span></div>
        </div>
        <div class="spec-item">
          <div class="spec-label">RUNTIME ENGINE</div>
          <div class="spec-val">Tauri 2.0 (Rust backend)</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">AUDIO ENGINE</div>
          <div class="spec-val">Web Audio API Procedural Synth</div>
        </div>
        <div class="spec-item">
          <div class="spec-label">DEVELOPER</div>
          <div class="spec-val highlight-author">Terence Franz Indenerio</div>
        </div>
      </div>
    </section>

    <!-- Interactive Easter Egg Toast -->
    <transition name="fade">
      <div v-if="cheerCount > 0" class="cheer-toast">
        💖 {{ cheerCount }} cheers sent to Terence Franz Indenerio! DevPet is happy!
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { notificationService } from '../services/notifications';

const cheerCount = ref(0);

function sendCheer() {
  cheerCount.value++;
  notificationService.playTaskCelebration();
  setTimeout(() => {
    if (cheerCount.value > 0) cheerCount.value = 0;
  }, 4000);
}
</script>

<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   Developer Spotlight Card
   ========================================================================== */
.dev-spotlight-card {
  position: relative;
  background: linear-gradient(135deg, rgba(30, 32, 42, 0.95), rgba(20, 22, 28, 0.98));
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.spotlight-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.dev-header-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.dev-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #38bdf8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);
}

.dev-avatar-icon {
  font-size: 38px;
}

.avatar-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #10b981;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 12px;
  border: 2px solid #14161c;
  letter-spacing: 0.5px;
}

.dev-identity {
  flex: 1;
  min-width: 250px;
}

.dev-role-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(139, 92, 246, 0.16);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

.role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  box-shadow: 0 0 8px #a78bfa;
}

.dev-name {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 40%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dev-tagline {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 14px;
}

.dev-quick-actions {
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.cheer-btn {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
}

.cheer-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.cheer-btn:active {
  transform: translateY(0);
}

.dev-bio-section {
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
}

.bio-text {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.65;
  margin: 0 0 16px;
}

.dev-skills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
}

/* ==========================================================================
   Companions Showcase
   ========================================================================== */
.companions-showcase {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.section-subtitle {
  font-size: 13px;
  color: #94a3b8;
}

.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.pet-bio-card {
  background: rgba(26, 28, 36, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.pet-bio-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.18);
}

.pet-card-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pet-card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.codi-bg { background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); }
.momo-bg { background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); }
.moki-bg { background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.4); }

.pet-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.pet-subtitle {
  font-size: 11px;
  color: #94a3b8;
}

.pet-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.55;
  flex: 1;
}

.pet-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mini-tag {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
}

/* ==========================================================================
   Specs Section
   ========================================================================== */
.specs-section {
  background: rgba(18, 20, 26, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px 24px;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
}

.spec-val {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-author {
  color: #a78bfa;
  font-weight: 700;
}

.badge-pill {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

/* Cheer Toast */
.cheer-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #8b5cf6;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
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
</style>
