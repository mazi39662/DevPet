//! Installs / removes DevPet's entry in Antigravity's global `hooks.json`.
//!
//! Safety rules:
//! * Only the top-level `"devpet"` key is ever added, replaced or removed —
//!   other entries (e.g. Coucou's) are preserved byte-for-byte in order.
//! * The original file is backed up once before the first modification.
//! * Writes are atomic (temp file + rename).
//! * Invalid JSON in an existing file aborts the operation instead of
//!   overwriting it.

use std::path::{Path, PathBuf};

use serde::Serialize;
use serde_json::{json, Map, Value};

use crate::paths;

pub const HOOK_KEY: &str = "devpet";
const HOOK_TIMEOUT_SECS: u64 = 5;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HookStatus {
    pub hooks_file: Option<String>,
    pub hooks_file_exists: bool,
    pub installed: bool,
    /// Installed entry points at the expected executable with all events.
    pub up_to_date: bool,
    pub hook_exe: String,
    pub hook_exe_exists: bool,
    pub events_file: String,
    pub events_file_exists: bool,
    /// Names of other hook entries in the file (informational only).
    pub other_hooks: Vec<String>,
    pub warning: Option<String>,
}

fn hook_command(exe: &Path, event: &str) -> String {
    let exe_str = exe.to_string_lossy();
    if exe_str.contains(' ') {
        format!("\"{exe_str}\" hook {event}")
    } else {
        format!("{exe_str} hook {event}")
    }
}

/// Builds DevPet's hook spec. PreToolUse and PostToolUse use the grouped (matcher) format,
/// the invocation/stop events use the flat format, per Antigravity docs.
pub fn devpet_hook_spec(exe: &Path) -> Value {
    let handler = |event: &str| {
        json!({ "type": "command", "command": hook_command(exe, event), "timeout": HOOK_TIMEOUT_SECS })
    };
    json!({
        "PreInvocation": [handler("PreInvocation")],
        "PreToolUse": [{ "matcher": "*", "hooks": [handler("PreToolUse")] }],
        "PostToolUse": [{ "matcher": "*", "hooks": [handler("PostToolUse")] }],
        "PostInvocation": [handler("PostInvocation")],
        "Stop": [handler("Stop")],
    })
}

pub fn merge_devpet_hooks(existing: Option<Value>, exe: &Path) -> Result<Value, String> {
    let mut root = match existing {
        None => Map::new(),
        Some(Value::Object(m)) => m,
        Some(_) => return Err("hooks.json root is not a JSON object; refusing to modify it".into()),
    };
    root.insert(HOOK_KEY.to_string(), devpet_hook_spec(exe));
    Ok(Value::Object(root))
}

pub fn remove_devpet_hooks(existing: Value) -> (Value, bool) {
    match existing {
        Value::Object(mut m) => {
            let removed = m.shift_remove(HOOK_KEY).is_some();
            (Value::Object(m), removed)
        }
        other => (other, false),
    }
}

fn strip_json_comments(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut in_string = false;
    let mut escape = false;
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        if in_string {
            out.push(c);
            if escape {
                escape = false;
            } else if c == '\\' {
                escape = true;
            } else if c == '"' {
                in_string = false;
            }
        } else if c == '"' {
            in_string = true;
            out.push(c);
        } else if c == '/' && chars.peek() == Some(&'/') {
            // Line comment: skip until newline
            chars.next();
            while let Some(&next) = chars.peek() {
                if next == '\n' {
                    break;
                }
                chars.next();
            }
        } else if c == '/' && chars.peek() == Some(&'*') {
            // Block comment: skip until */
            chars.next();
            while let Some(ch) = chars.next() {
                if ch == '*' && chars.peek() == Some(&'/') {
                    chars.next();
                    break;
                }
            }
        } else {
            out.push(c);
        }
    }
    out
}

fn read_json(path: &Path) -> Result<Option<Value>, String> {
    match std::fs::read_to_string(path) {
        Ok(text) if text.trim().is_empty() => Ok(None),
        Ok(text) => {
            let cleaned = strip_json_comments(&text);
            serde_json::from_str(&cleaned)
                .map(Some)
                .map_err(|e| format!("Existing {} is not valid JSON ({e}); not modified", path.display()))
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(format!("Cannot read {}: {e}", path.display())),
    }
}

fn write_json_atomic(path: &Path, value: &Value) -> Result<(), String> {
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let text = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("json.devpet-tmp");
    std::fs::write(&tmp, text + "\n").map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, path).map_err(|e| e.to_string())
}

fn backup_once(path: &Path) -> Result<(), String> {
    let backup = path.with_extension("json.devpet-backup");
    if path.exists() && !backup.exists() {
        std::fs::copy(path, &backup).map_err(|e| format!("Backup failed: {e}"))?;
    }
    Ok(())
}

/// Copies the running executable to the stable hook location.
fn deploy_hook_exe() -> Result<PathBuf, String> {
    let target = paths::hook_exe_path();
    let current = std::env::current_exe().map_err(|e| e.to_string())?;
    if let Some(dir) = target.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    // Copy to a temp name, then swap in, so a hook that is executing right now
    // keeps its image while the new one is placed.
    let tmp = target.with_extension("exe.new");
    std::fs::copy(&current, &tmp).map_err(|e| format!("Copy hook exe failed: {e}"))?;
    if target.exists() {
        let old = target.with_extension("exe.old");
        let _ = std::fs::remove_file(&old);
        let _ = std::fs::rename(&target, &old);
    }
    std::fs::rename(&tmp, &target).map_err(|e| format!("Place hook exe failed: {e}"))?;
    Ok(target)
}

pub fn status() -> HookStatus {
    let hooks_file = paths::antigravity_hooks_file();
    let hook_exe = paths::hook_exe_path();
    let events_file = paths::antigravity_events_file();

    let mut st = HookStatus {
        hooks_file: hooks_file.as_ref().map(|p| p.to_string_lossy().into_owned()),
        hooks_file_exists: hooks_file.as_ref().is_some_and(|p| p.exists()),
        installed: false,
        up_to_date: false,
        hook_exe: hook_exe.to_string_lossy().into_owned(),
        hook_exe_exists: hook_exe.exists(),
        events_file: events_file.to_string_lossy().into_owned(),
        events_file_exists: events_file.exists(),
        other_hooks: vec![],
        warning: None,
    };

    let Some(path) = hooks_file else {
        st.warning = Some("Could not resolve the user home directory".into());
        return st;
    };
    match read_json(&path) {
        Ok(Some(Value::Object(map))) => {
            st.other_hooks = map.keys().filter(|k| *k != HOOK_KEY).cloned().collect();
            if let Some(entry) = map.get(HOOK_KEY) {
                st.installed = true;
                st.up_to_date = *entry == devpet_hook_spec(&hook_exe) && st.hook_exe_exists;
            }
        }
        Ok(_) => {}
        Err(e) => st.warning = Some(e),
    }
    if hook_exe.to_string_lossy().contains(' ') {
        st.warning = Some("Hook path contains spaces; Antigravity's cmd /c invocation may fail".into());
    }
    st
}

pub fn install() -> Result<HookStatus, String> {
    let path = paths::antigravity_hooks_file().ok_or("Could not resolve home directory")?;
    let existing = read_json(&path)?;
    let exe = deploy_hook_exe()?;
    let merged = merge_devpet_hooks(existing, &exe)?;
    backup_once(&path)?;
    write_json_atomic(&path, &merged)?;
    Ok(status())
}

pub fn uninstall() -> Result<HookStatus, String> {
    let path = paths::antigravity_hooks_file().ok_or("Could not resolve home directory")?;
    if let Some(existing) = read_json(&path)? {
        let (updated, removed) = remove_devpet_hooks(existing);
        if removed {
            backup_once(&path)?;
            write_json_atomic(&path, &updated)?;
        }
    }
    Ok(status())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::hook_cli::SUPPORTED_EVENTS;

    fn exe() -> PathBuf {
        PathBuf::from(r"C:\Users\me\AppData\Local\DevPet\bin\devpet-hook.exe")
    }

    #[test]
    fn merge_preserves_other_entries_and_order() {
        let existing: Value = serde_json::from_str(
            r#"{"coucou":{"Stop":[{"command":"coucou-hook.exe Stop"}]},"zeta":{"enabled":false}}"#,
        )
        .unwrap();
        let merged = merge_devpet_hooks(Some(existing.clone()), &exe()).unwrap();
        let keys: Vec<_> = merged.as_object().unwrap().keys().cloned().collect();
        assert_eq!(keys, vec!["coucou", "zeta", "devpet"]);
        assert_eq!(merged["coucou"], existing["coucou"]);
        assert_eq!(merged["zeta"], existing["zeta"]);
    }

    #[test]
    fn spec_registers_all_supported_events() {
        let spec = devpet_hook_spec(&exe());
        for ev in SUPPORTED_EVENTS {
            assert!(spec.get(ev).is_some(), "missing {ev}");
        }
        assert_eq!(spec["PostToolUse"][0]["matcher"], "*");
        assert_eq!(
            spec["Stop"][0]["command"],
            r"C:\Users\me\AppData\Local\DevPet\bin\devpet-hook.exe hook Stop"
        );
    }

    #[test]
    fn merge_is_idempotent() {
        let once = merge_devpet_hooks(None, &exe()).unwrap();
        let twice = merge_devpet_hooks(Some(once.clone()), &exe()).unwrap();
        assert_eq!(once, twice);
    }

    #[test]
    fn remove_only_touches_devpet() {
        let merged = merge_devpet_hooks(
            Some(serde_json::from_str(r#"{"coucou":{}}"#).unwrap()),
            &exe(),
        )
        .unwrap();
        let (after, removed) = remove_devpet_hooks(merged);
        assert!(removed);
        assert_eq!(after, serde_json::from_str::<Value>(r#"{"coucou":{}}"#).unwrap());
    }

    #[test]
    fn non_object_root_is_rejected() {
        assert!(merge_devpet_hooks(Some(json!([1, 2])), &exe()).is_err());
    }

    #[test]
    fn quotes_paths_with_spaces() {
        let cmd = hook_command(Path::new(r"C:\Program Files\DevPet\devpet.exe"), "Stop");
        assert_eq!(cmd, r#""C:\Program Files\DevPet\devpet.exe" hook Stop"#);
    }

    #[test]
    fn strips_line_and_block_comments_cleanly() {
        let raw = r#"{
            // Line comment
            "devpet": { /* inline block comment */ "enabled": true },
            "url": "http://example.com/test//not_a_comment"
        }"#;
        let cleaned = strip_json_comments(raw);
        let val: Value = serde_json::from_str(&cleaned).expect("valid json after stripping");
        assert_eq!(val["devpet"]["enabled"], true);
    }

    #[test]
    fn live_status_check() {
        let st = status();
        assert!(st.hook_exe.len() > 0);
    }
}
