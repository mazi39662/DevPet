//! Filesystem locations used by DevPet. Kept in one place so the hook CLI,
//! the installer and the monitor always agree on paths.

use std::path::PathBuf;

/// Stable application data directory:
/// - Windows: `%LOCALAPPDATA%\DevPet`
/// - macOS: `~/Library/Application Support/DevPet`
/// - Linux: `$XDG_DATA_HOME/devpet` or `~/.local/share/devpet`
/// (falls back to system temp dir if unset)
pub fn data_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Some(val) = std::env::var_os("LOCALAPPDATA") {
            return PathBuf::from(val).join("DevPet");
        }
        if let Some(home) = home_dir() {
            return home.join("AppData").join("Local").join("DevPet");
        }
    }
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = home_dir() {
            return home.join("Library").join("Application Support").join("DevPet");
        }
    }
    #[cfg(target_os = "linux")]
    {
        if let Some(val) = std::env::var_os("XDG_DATA_HOME") {
            return PathBuf::from(val).join("devpet");
        }
        if let Some(home) = home_dir() {
            return home.join(".local").join("share").join("devpet");
        }
    }
    std::env::temp_dir().join("DevPet")
}

/// JSONL file the Antigravity hook appends lifecycle events to.
pub fn antigravity_events_file() -> PathBuf {
    data_dir().join("antigravity-events.jsonl")
}

/// Stable location the hook executable is copied to.
/// Uses .exe on Windows and no extension on Unix/macOS/Linux.
pub fn hook_exe_path() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        data_dir().join("bin").join("devpet-hook.exe")
    }
    #[cfg(not(target_os = "windows"))]
    {
        data_dir().join("bin").join("devpet-hook")
    }
}

pub fn home_dir() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
        .map(PathBuf::from)
}

/// Antigravity's global customization root (`~/.gemini/config/hooks.json`).
pub fn antigravity_hooks_file() -> Option<PathBuf> {
    home_dir().map(|h| h.join(".gemini").join("config").join("hooks.json"))
}

/// Codex CLI / desktop session rollout logs.
pub fn codex_sessions_dir() -> Option<PathBuf> {
    if let Some(custom) = std::env::var_os("CODEX_HOME") {
        return Some(PathBuf::from(custom).join("sessions"));
    }
    home_dir().map(|h| h.join(".codex").join("sessions"))
}
