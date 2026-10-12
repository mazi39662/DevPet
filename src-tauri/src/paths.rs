//! Filesystem locations used by DevPet. Kept in one place so the hook CLI,
//! the installer and the monitor always agree on paths.

use std::path::PathBuf;

/// `%LOCALAPPDATA%\DevPet` (falls back to the temp dir if unset).
pub fn data_dir() -> PathBuf {
    std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir)
        .join("DevPet")
}

/// JSONL file the Antigravity hook appends lifecycle events to.
pub fn antigravity_events_file() -> PathBuf {
    data_dir().join("antigravity-events.jsonl")
}

/// Stable location the hook executable is copied to. Using a copy (instead of
/// pointing at the build output) means rebuilding DevPet never locks or breaks
/// a running agent's hook, and the path contains no spaces for `cmd /c`.
pub fn hook_exe_path() -> PathBuf {
    data_dir().join("bin").join("devpet-hook.exe")
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
