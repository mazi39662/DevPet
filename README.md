<div align="center">

# 🐾 DevPet

### *Your quirky, interactive cyber-companion for high-focus coding sessions.*

[![Built with Tauri](https://img.shields.io/badge/Tauri-v2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Powered by Rust](https://img.shields.io/badge/Rust-1.70+-orange?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vite + TS](https://img.shields.io/badge/Vite-TypeScript-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Active%20%26%20Purring-brightgreen?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#)

<p align="center">
  <img src="https://media.giphy.com/media/LmN8OYiY4m0X85QbZ8/giphy.gif" alt="DevPet Mascot Animation" width="220" />
</p>

> **"Because coding alone is dangerous. Take this desktop buddy with you!"**  
> *DevPet* is a lightweight, screen-floating virtual pet built with **Tauri + Rust** that keeps you company, celebrates your commits, reacts to your clicks, and makes your development workflow 10x more delightful.

---

</div>

## ✨ Highlights & Features

- 🖥️ **Desktop Companion Mode**  
  Lives directly on your desktop with a transparent window, borderless UI, and always-on-top option so it never gets lost behind tabs.
- 🎭 **Dynamic Moods & Expressions**  
  Happy, sleepy, hyper-focused, or dramatically bored when you stare at a stack trace for too long.
- 🎵 **Interactive Soundscapes & SFX**  
  Procedural synthesizers, 8-bit retro blips, soothing purrs, and playful chimes when you pet, poke, or feed your companion.
- ⚡ **Ultra Lightweight & Fast**  
  Zero Electron bloat! Powered by native Rust & Tauri for near-instant boot times and sub-50MB RAM usage.
- 🍅 **Focus & Coding Buddy**  
  Built-in Pomodoro cycles, streak celebrations, and idle reminders to stretch and drink water.
- 🖱️ **Playful Physics & Dragging**  
  Pick up your pet, drag them across your multi-monitor setup, or watch them take a nap in the corner of your screen.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Core Runtime** | [Tauri v2](https://tauri.app/) | Native windowing, OS event loop & transparent desktop overlay |
| **Backend Engine** | [Rust](https://www.rust-lang.org/) | Blazing fast background tasks, system tray & window management |
| **Frontend UI** | [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) | Responsive UI components, state management & reactivity |
| **Audio System** | Web Audio API / Custom SFX Synth | Dynamic sound engine & interactive sound feedback |
| **Animations** | CSS Keyframes & Canvas | Smooth sprite transitions & particle celebrations |

---

## 🚀 Getting Started

### 📋 Prerequisites

Before running DevPet locally, make sure you have installed:

1. **Node.js** (v18 or newer) — [nodejs.org](https://nodejs.org/)
2. **Rust & Cargo** (stable) — [rustup.rs](https://rustup.rs/)
3. **Platform Dependencies for Tauri**:
   - **Windows**: Microsoft C++ Build Tools & WebView2 (included in Windows 10/11)
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, etc.

---

### 📥 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mazi39662/DevPet.git
   cd DevPet
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Launch DevPet in development mode:**
   ```bash
   npm run tauri dev
   ```
   *Your pet will compile and pop up right on your screen!* 🎉

4. **Build the production release:**
   ```bash
   npm run tauri build
   ```
   *The standalone executable will be located in `src-tauri/target/release/bundle/`.*

---

## 🎮 How to Interact with Your Pet

```
          (\__/)
          (o^.^)  ~ "Feed me commits!"
         z(_(")(")
```

| Action | How to Trigger | Reaction |
|---|---|---|
| **Pet / Scratch** | Click & drag cursor over pet head | Plays happy purr SFX & spawns hearts 💕 |
| **Poke / Wake Up** | Single Left-Click | Bounces with a cute 8-bit squeak 🎶 |
| **Move Around** | Click and drag the pet window | Floats with you across monitors 🚀 |
| **Quick Menu** | Right-Click on pet | Open settings, mute audio, or choose pet skins ⚙️ |
| **Feed Snack** | Double-Click or Hotkey | Nom-nom animations & boosts pet energy 🍎 |

---

## 📂 Project Structure

```plaintext
DevPet/
├── src-tauri/             # 🦀 Rust Backend
│   ├── src/               # Native windowing, commands & tray logic
│   ├── Cargo.toml         # Rust dependencies & metadata
│   └── tauri.conf.json    # Tauri configuration (transparent window, permissions)
├── src/                   # 🎨 Frontend Web App
│   ├── assets/            # Sprites, icons & SFX audio files
│   ├── components/        # Pet canvas, control modal & animations
│   ├── audio/             # Sound design synthesizer & sound effect triggers
│   ├── App.tsx            # Root application layout & state machine
│   └── main.tsx           # Entrypoint
├── package.json           # Scripts & frontend dependencies
└── README.md              # You are here!
```

---

## ⚙️ Configuration & Customization

You can fine-tune window transparency, dimensions, and shortcuts in `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [
      {
        "title": "DevPet",
        "width": 320,
        "height": 320,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "resizable": false
      }
    ]
  }
}
```

---

## 🗺️ Roadmap & Upcoming Treats

- [ ] 🎨 **Custom Pet Outfits & Skins** (Cyberpunk, Pixel Art, Retro GigaPet)
- [ ] 🐙 **Git Hook Integration** (Happy dances on `git push`, crying on failed CI/CD)
- [ ] 💤 **Sleep Mode** synchronized with your OS idle state
- [ ] 🗣️ **Mini AI Quips & Chat Bubble Advice**
- [ ] 🏆 **Gamified Dev Achievements** (e.g. *"Midnight Coder"*, *"Refactor Wizard"*)

---

## 🤝 Contributing

Contributions, issues, and ideas are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingNewPetSkin`)
3. Commit your Changes (`git commit -m 'Add some playful sparkles'`)
4. Push to the Branch (`git push origin feature/AmazingNewPetSkin`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Made with ❤️ and plenty of coffee for developers worldwide ☕🐾  
*Don't forget to star ⭐ the repo if your DevPet made you smile today!*

</div>
