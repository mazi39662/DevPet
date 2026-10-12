# DevPet — AI Coding Companion Monitor (MVP)

DevPet is a lightweight desktop companion application for Windows inspired by Coucou, engineered to monitor AI coding agents (Google Antigravity, OpenAI Codex, and Visual Studio Code) rather than acting as a chat interface.

---

## Architecture Overview

```
DevPet/
├── src/
│   ├── adapters/            # Modular coding tool integrations
│   │   ├── antigravity.ts   # Documented lifecycle hooks (~/.gemini/config/hooks.json)
│   │   ├── codex.ts         # Rollout session logs (~/.codex/sessions/**/*.jsonl)
│   │   ├── vscode.ts        # Detection fallback (process scan only, status unknown)
│   │   ├── sessionTracker.ts# Deduplication and decay logic
│   │   └── types.ts         # Common adapter contract
│   ├── components/
│   │   ├── CompanionPet.vue # Custom pixel art character with 7 animation states & drag
│   │   └── StatusBadge.vue  # Normalized status badges
│   ├── composables/
│   │   └── useSettings.ts   # Persistent settings (localStorage + IPC broadcast)
│   ├── services/
│   │   ├── coordinator.ts   # MonitoringCoordinator: aggregates statuses and feed
│   │   ├── native.ts        # Type-safe IPC bridge to Tauri backend
│   │   └── notifications.ts # Desktop notifications + Web Audio synthesized chime
│   ├── types/
│   │   ├── status.ts        # Normalized status model (idle | thinking | working | waiting | completed | error | unknown)
│   │   ├── events.ts        # Typed IPC events
│   │   └── settings.ts      # Settings interface
│   ├── App.vue              # Main Dashboard window (dark theme, integrations, feed)
│   ├── CompanionApp.vue     # Always-on-top transparent floating companion window
│   ├── main.ts              # Dashboard entry point
│   └── companionMain.ts     # Companion window entry point
├── src-tauri/
│   ├── src/
│   │   ├── hook_cli.rs      # High-speed `devpet hook <Event>` command executed by Antigravity
│   │   ├── hook_install.rs  # Safe merge/remove into ~/.gemini/config/hooks.json
│   │   ├── monitor.rs       # Background tailing thread & process presence scanner
│   │   ├── paths.rs         # Path resolution utilities
│   │   ├── windows.rs       # Multi-window management and system tray
│   │   ├── lib.rs           # Tauri app configuration & commands
│   │   └── main.rs          # App bootstrap
│   ├── Cargo.toml
│   └── tauri.conf.json
```

---

## Monitoring: What Genuinely Works

DevPet adheres strictly to honest monitoring:
1. **Google Antigravity**:
   - Uses documented lifecycle hooks (`PreInvocation`, `PostToolUse`, `PostInvocation`, `Stop`).
   - `PreToolUse` is deliberately excluded so DevPet never interferes with agent permission gates.
   - Accurately captures `thinking` (model invocation), `working` (tool execution), `completed` (clean model finish), and `error`.
   - `waiting` (awaiting approval) is not claimed since it cannot be cleanly isolated without hooking `PreToolUse`.
2. **OpenAI Codex**:
   - Reads local session rollout JSONL logs from `~/.codex/sessions/`.
   - Detects `working` via `task_started` and `completed` / `error` via `task_complete`.
   - Leaves the user's `config.toml` `notify` hook intact.
3. **Visual Studio Code**:
   - Detects application process presence only.
   - Always marks agent task status as `unknown` to avoid fake monitoring claims.

---

## Running the Application

### Frontend Development / Web Preview
```bash
npm install
npm run dev
```

### Full Desktop Native Build
Ensure the MSVC C++ Build Tools workload is installed via the Visual Studio Installer (`Microsoft.VisualStudio.Workload.NativeDesktop`), then execute:
```bash
npm run tauri dev
```
