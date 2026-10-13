<div align="center">

# 🐾 DevPet

### *Your cyber-companion that watches your AI coding agents so you don't have to babysit them.*

[![Built with Tauri](https://img.shields.io/badge/Tauri-v2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Powered by Rust](https://img.shields.io/badge/Rust-1.70+-orange?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vue 3 + Vite](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Agent Monitor](https://img.shields.io/badge/Agents-Antigravity%20%7C%20Codex-7A58EC?style=for-the-badge)](#-how-devpet-keeps-tabs-on-your-agents)
[![Status](https://img.shields.io/badge/Status-Observing%20%26%20Active-brightgreen?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#)

<p align="center">
  <img src="https://raw.githubusercontent.com/gist/x1ah/1470a67fad1b6297a35a1828505ebb30/raw/7a909f5ecebcc454b0e37a2a0c42435ce8218a76/cat.gif" alt="DevPet Mascot Animation" width="230" />
</p>

> **"Stop tab-switching every 20 seconds to see if your AI agent finished or got stuck."**  
> **DevPet** is an ultra-lean desktop companion built on **Tauri + Rust + Vue 3**. It hooks directly into the lifecycles of autonomous coding agents like **Google Antigravity** and **Codex**, mirroring their real-time execution state—thinking, running tools, waiting for approvals, or celebrating completions—straight onto your screen.

---

</div>

## ⚡ Why DevPet?

When you dispatch agentic coding assistants like **Antigravity**, you typically switch tasks and lose visibility into what the agent is doing. You only realize 15 minutes later that:
- It was waiting for you to approve a shell command or reply to a question.
- It was grinding through tool steps.
- It finished long ago while you were still waiting.

**DevPet solves this.** It floats on your desktop as an animated cyber-familiar (**Codi** the agent monitor, or **Momo** the Pomodoro tracker), translating background agent telemetry into instant visual and audio cues.

---

## ✨ Features That Actually Matter

### 🤖 Live AI Coding Agent Monitoring
- **Real-Time Lifecycle Hooking**: Intercepts Antigravity hooks (`PreInvocation`, `PreToolUse`, `PostToolUse`, `Stop`) with zero friction and non-blocking observe-only pass-through.
- **Instant Action Alerts**: The moment your agent needs permission to run commands or answer user questions, your pet triggers a pulsing radar radar badge and alerts you right away.
- **One-Click Target App Focus**: Double-click or click the rocket launcher button on the mascot to immediately pop your agent's IDE window into focus.
- **State-Driven Mascot Expressions**:
  - 💡 **Thinking**: Radiating thoughts and curiosity aura while the agent reasons.
  - ⚡ **Working**: Digital particles and fast typing animations while executing tools.
  - ⏳ **Waiting / Needs Approval**: Pulsing radar alert when the agent needs your green light.
  - 🎉 **Completed**: Victory confetti and fanfare when the task succeeds.
  - ⚠️ **Error**: Panic sweat drops and warning indicator if the turn fails.

### 🍅 Dual-Pet Ecosystem
- **Codi (Agent Watchdog)**: Tails agent sessions, monitors tool execution, and warns of stuck turns.
- **Momo (Pomodoro Focus)**: Built-in productivity rhythm cycles, streak tracking, and break reminders.
- Run either pet—or both simultaneously across your multi-display setup!

### 🖥️ Zero-Distraction Floating Overlay
- **Sub-50MB RAM footprint**: Native Rust backend with WebView2/WebKit. No heavy Electron bloatware eating your dev machine's resources.
- **Click-Through / Mini Mode**: Collapse your pet into a compact stealth badge or expand it when you want full status bubbles.
- **Interactive Micro-Physics**: Scratch, boop, drag across monitors, and enjoy responsive procedural retro SFX synthesized via the Web Audio API.

---

## 🔍 How DevPet Keeps Tabs on Your Agents

DevPet talks to your development environment through clean, non-intrusive observation pipelines:

```
┌─────────────────────────────────┐
│     Google Antigravity / IDE    │
└────────────────┬────────────────┘
                 │ Lifecycle events (PreInvocation, PreToolUse, PostToolUse, Stop)
                 ▼
┌─────────────────────────────────┐
│  DevPet Rust Hook CLI & Engine  │ (Tails JSONL event streams with <5ms latency)
└────────────────┬────────────────┘
                 │ Emits normalized events (devpet://raw-events)
                 ▼
┌─────────────────────────────────┐
│    DevPet Floating Companion    │ (Real-time animations, audio blips, radar alerts)
└─────────────────────────────────┘
```

| Agent Lifecycle State | DevPet Reaction | What It Means |
|---|---|---|
| **`PreInvocation`** | 💡 Thinking Aura | Model is processing prompt & reasoning next steps |
| **`PreToolUse` (Prompt/Exec)** | ⏳ Pulsing Waiting Radar | Agent is blocked waiting for user input or command approval |
| **`PostToolUse`** | ⚡ Active Code Typing | Tool executed; agent parsing command output or file diffs |
| **`Stop` (Completed)** | 🎉 Confetti & Chime | Task finished successfully! Ready for your review |
| **`Stop` (Error)** | ⚠️ Alert Badge | Command failed or hit recursion limits |

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Core Desktop Engine** | [Tauri v2](https://tauri.app/) | Transparent, frameless windowing & OS tray management |
| **Native Backend** | [Rust](https://www.rust-lang.org/) | Multi-threaded file tailing, process detection & hook CLI |
| **Frontend UI** | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) | Reactive state engine, custom pixel art SVG renderer |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strictly typed adapter model & event coordinator |
| **Audio Synthesis** | Web Audio API | Procedural retro sound engine (no bulky external audio files) |

---

## 🚀 Quickstart

### 📋 Prerequisites

Ensure you have installed:
1. **Node.js** (v18+) — [nodejs.org](https://nodejs.org/)
2. **Rust & Cargo** (stable) — [rustup.rs](https://rustup.rs/)
3. **OS Build Tools**:
   - **Windows**: Microsoft C++ Build Tools & WebView2
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`

---

### 📥 Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mazi39662/DevPet.git
   cd DevPet
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start in development mode:**
   ```bash
   npm run tauri dev
   ```
   *Your pet companion and dashboard will boot up on your desktop immediately.*

4. **Build the production release:**
   ```bash
   npm run tauri build
   ```
   *Compiled binaries will be generated inside `src-tauri/target/release/`.*

---

## 🎮 Desktop Mascot Controls

```
        (\__/)
        (•ㅅ•)  ~ "Agent is thinking... Stand by!"
       c(  " ")
```

| Action | Gesture | Result |
|---|---|---|
| **Focus Agent IDE** | Double Left-Click (or click 🚀) | Brings Antigravity / your IDE directly to foreground |
| **Open Control Dashboard** | Triple Left-Click (or click ⚙️) | Opens full telemetry dashboard, logs & session tracker |
| **Affection / Scratch** | Click & drag over pet head | Plays warm purr SFX & triggers affection particles 💕 |
| **Wake / Boop** | Single Left-Click | Bounces with an 8-bit squeak and pops status bubble |
| **Relocate** | Click & drag companion body | Drags smoothly anywhere across multi-monitor setups |
| **Hide Mascot** | Click ✕ on hover bar | Sends companion to system tray (restore anytime from tray) |

---

## 📂 Project Architecture

```plaintext
DevPet/
├── src-tauri/             # 🦀 Rust Native Core
│   ├── src/
│   │   ├── hook_cli.rs    # Fast, non-blocking hook runner for agents
│   │   ├── hook_install.rs# Global hooks installer (~/.gemini/config/hooks.json)
│   │   ├── monitor.rs     # Multi-threaded file tailer & system process observer
│   │   ├── windows.rs     # Transparent desktop overlay & focus management
│   │   └── lib.rs         # Tauri IPC command definitions
│   └── tauri.conf.json    # Window geometry, transparency & permission caps
├── src/                   # 🎨 Vue 3 Frontend
│   ├── adapters/          # Agent-specific telemetry parsers (Antigravity, Codex)
│   ├── components/        # CompanionPet (Codi), PomodoroPet (Momo), StatusBadge
│   ├── services/          # Native IPC bridge, sound engine, notifications
│   ├── types/             # Normalized agent state machine types
│   ├── App.vue            # Main Management Dashboard
│   └── CompanionApp.vue   # Floating transparent desktop overlay
├── package.json
└── README.md
```

---

## 🗺️ What's Cooking Next

- [x] Antigravity lifecycle hook integration
- [x] Real-time "Action Required" permission alert radar
- [x] Interactive procedural sound synthesizer
- [x] Focus app window switcher on double-click
- [ ] 🤖 Claude Code & OpenCodeInterpreter adapter presets
- [ ] 📊 Token velocity & task time analytics in dashboard
- [ ] 🎨 Custom pixel skins & retro synthwave desktop themes

---

## 🤝 Contributing

Contributions, feature suggestions, and agent adapter requests are warmly welcomed!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AddClaudeCodeAdapter`)
3. Commit your Changes (`git commit -m 'feat: add adapter for Claude Code'`)
4. Push to the Branch (`git push origin feature/AddClaudeCodeAdapter`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">

Built for developers who pair program with AI agents. 🐾🚀  
*If DevPet saved you from babysitting your terminal, drop a ⭐ on the repo!*

</div>
