//! Background monitor thread.
//!
//! Responsibilities (native side only — no status interpretation here):
//! * Tail the Antigravity hook event file (`antigravity-events.jsonl`).
//! * Tail Codex session rollout logs (`~/.codex/sessions/YYYY/MM/DD/*.jsonl`).
//! * Scan running processes for *application presence* (never agent status).
//!
//! Raw records are forwarded to the frontend coordinator via typed events, where
//! the per-tool adapters normalize them. Records read from history at startup
//! are flagged `replay: true` so they can rebuild state without notifying.

use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use serde::Serialize;
use serde_json::{json, Value};
use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, System};
use tauri::{AppHandle, Emitter};

use crate::paths;

pub const EVT_RAW: &str = "devpet://raw-events";
pub const EVT_TICK: &str = "devpet://tick";

const LOOP_INTERVAL: Duration = Duration::from_millis(500);
const PROCESS_INTERVAL: Duration = Duration::from_secs(3);
const CODEX_RESCAN_INTERVAL: Duration = Duration::from_secs(3);
const ANTIGRAVITY_REPLAY_BYTES: u64 = 64 * 1024;
const CODEX_REPLAY_BYTES: u64 = 256 * 1024;
/// Only rollout files touched this recently are replayed / followed.
const CODEX_RECENT_SECS: u64 = 15 * 60;

static RUNNING: AtomicBool = AtomicBool::new(false);
static REPLAY_REQUESTED: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RawSourceEvent {
    pub source: &'static str,
    pub replay: bool,
    pub file: Option<String>,
    pub payload: Value,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppDetection {
    pub agent_id: &'static str,
    pub running: bool,
    pub process_count: usize,
    pub process_names: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SystemMemoryInfo {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub used_percent: f64,
}

pub fn get_memory_info(sys: &mut System) -> SystemMemoryInfo {
    sys.refresh_memory();
    let total = sys.total_memory();
    let used = sys.used_memory();
    let percent = if total > 0 {
        (used as f64 / total as f64) * 100.0
    } else {
        0.0
    };
    SystemMemoryInfo {
        total_bytes: total,
        used_bytes: used,
        used_percent: percent,
    }
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TickPayload {
    pub at: u64,
    pub apps: Vec<AppDetection>,
    pub memory: Option<SystemMemoryInfo>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MonitorInfo {
    pub already_running: bool,
    pub antigravity_events_file: String,
    pub codex_sessions_dir: Option<String>,
    pub codex_sessions_dir_exists: bool,
}

fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

// ---------------------------------------------------------------------------
// File tailing
// ---------------------------------------------------------------------------

/// Follows a JSONL file, returning only complete new lines.
pub struct FileTail {
    path: PathBuf,
    offset: u64,
    partial: Vec<u8>,
}

impl FileTail {
    pub fn at_start(path: PathBuf) -> Self {
        Self { path, offset: 0, partial: Vec::new() }
    }

    /// Starts at the end of the file; returns the tail (last `replay_bytes`)
    /// as complete lines for state replay.
    pub fn at_end_with_replay(path: PathBuf, replay_bytes: u64) -> (Self, Vec<String>) {
        let len = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        let replay = read_tail_lines(&path, len, replay_bytes);
        (Self { path, offset: len, partial: Vec::new() }, replay)
    }

    pub fn replay(&self, replay_bytes: u64) -> Vec<String> {
        read_tail_lines(&self.path, self.offset, replay_bytes)
    }

    pub fn read_new_lines(&mut self) -> Vec<String> {
        let Ok(meta) = std::fs::metadata(&self.path) else { return vec![] };
        let len = meta.len();
        if len < self.offset {
            // Truncated or rotated: start over.
            self.offset = 0;
            self.partial.clear();
        }
        if len == self.offset {
            return vec![];
        }
        let Ok(mut f) = File::open(&self.path) else { return vec![] };
        if f.seek(SeekFrom::Start(self.offset)).is_err() {
            return vec![];
        }
        let mut buf = Vec::with_capacity((len - self.offset) as usize);
        if f.take(len - self.offset).read_to_end(&mut buf).is_err() {
            return vec![];
        }
        self.offset += buf.len() as u64;
        self.partial.extend_from_slice(&buf);

        let mut lines = Vec::new();
        while let Some(pos) = self.partial.iter().position(|b| *b == b'\n') {
            let line: Vec<u8> = self.partial.drain(..=pos).collect();
            let text = String::from_utf8_lossy(&line).trim().to_string();
            if !text.is_empty() {
                lines.push(text);
            }
        }
        lines
    }
}

fn read_tail_lines(path: &Path, end: u64, max_bytes: u64) -> Vec<String> {
    let start = end.saturating_sub(max_bytes);
    let Ok(mut f) = File::open(path) else { return vec![] };
    if f.seek(SeekFrom::Start(start)).is_err() {
        return vec![];
    }
    let mut buf = Vec::new();
    if f.take(end - start).read_to_end(&mut buf).is_err() {
        return vec![];
    }
    let text = String::from_utf8_lossy(&buf);
    let mut lines: Vec<&str> = text.split('\n').collect();
    if start > 0 && !lines.is_empty() {
        lines.remove(0); // first line is probably cut in half
    }
    // Last element is either "" (file ended with newline) or an incomplete line.
    lines.pop();
    lines.into_iter().map(|l| l.trim().to_string()).filter(|l| !l.is_empty()).collect()
}

// ---------------------------------------------------------------------------
// Codex rollout handling
// ---------------------------------------------------------------------------

/// Reduces a Codex rollout line to the fields adapters need, dropping message
/// content. Returns `None` for record types irrelevant to status.
pub fn reduce_codex_line(line: &str) -> Option<Value> {
    let v: Value = serde_json::from_str(line).ok()?;
    let kind = v.get("type")?.as_str()?;
    if !matches!(kind, "event_msg" | "response_item" | "session_meta") {
        return None;
    }
    let payload = v.get("payload");
    let ptype = payload.and_then(|p| p.get("type")).and_then(Value::as_str);
    if ptype == Some("token_count") {
        return None;
    }
    let error = payload.and_then(|p| p.get("error")).and_then(|e| {
        if e.is_null() {
            None
        } else {
            Some(e.get("message").and_then(Value::as_str).map(str::to_owned).unwrap_or_else(|| e.to_string()))
        }
    });
    let session_id = payload
        .and_then(|p| p.get("id").or_else(|| p.get("session_id")))
        .and_then(Value::as_str)
        .filter(|_| kind == "session_meta");
    let turn_id = payload.and_then(|p| p.get("turn_id")).and_then(Value::as_str);
    Some(json!({
        "timestamp": v.get("timestamp").and_then(Value::as_str),
        "type": kind,
        "payloadType": ptype,
        "turnId": turn_id,
        "sessionId": session_id,
        "error": error,
    }))
}

fn sorted_subdirs(dir: &Path) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = std::fs::read_dir(dir)
        .map(|rd| rd.filter_map(|e| e.ok()).map(|e| e.path()).filter(|p| p.is_dir()).collect())
        .unwrap_or_default();
    out.sort();
    out
}

/// Returns the most recent `n` day directories (sessions/YYYY/MM/DD), newest first.
fn recent_day_dirs(root: &Path, n: usize) -> Vec<PathBuf> {
    let mut days = Vec::new();
    for year in sorted_subdirs(root).into_iter().rev() {
        for month in sorted_subdirs(&year).into_iter().rev() {
            for day in sorted_subdirs(&month).into_iter().rev() {
                days.push(day);
                if days.len() >= n {
                    return days;
                }
            }
        }
    }
    days
}

fn modified_within(path: &Path, secs: u64) -> bool {
    std::fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| SystemTime::now().duration_since(t).ok())
        .is_some_and(|age| age.as_secs() <= secs)
}

struct CodexWatcher {
    root: PathBuf,
    tails: HashMap<PathBuf, FileTail>,
    initialized: bool,
    last_scan: Option<Instant>,
}

impl CodexWatcher {
    fn new(root: PathBuf) -> Self {
        Self { root, tails: HashMap::new(), initialized: false, last_scan: None }
    }

    fn candidate_files(&self) -> Vec<PathBuf> {
        recent_day_dirs(&self.root, 2)
            .into_iter()
            .flat_map(|d| {
                std::fs::read_dir(d)
                    .map(|rd| rd.filter_map(|e| e.ok()).map(|e| e.path()).collect::<Vec<_>>())
                    .unwrap_or_default()
            })
            .filter(|p| p.extension().is_some_and(|e| e == "jsonl"))
            .collect()
    }

    fn poll(&mut self, out: &mut Vec<RawSourceEvent>, force_replay: bool) {
        let rescan = self.last_scan.is_none_or(|t| t.elapsed() >= CODEX_RESCAN_INTERVAL);
        if rescan {
            self.last_scan = Some(Instant::now());
            for path in self.candidate_files() {
                if self.tails.contains_key(&path) || !modified_within(&path, CODEX_RECENT_SECS) {
                    continue;
                }
                if self.initialized {
                    // Session created after DevPet started: read it in full, live.
                    self.tails.insert(path.clone(), FileTail::at_start(path));
                } else {
                    let (tail, replay) = FileTail::at_end_with_replay(path.clone(), CODEX_REPLAY_BYTES);
                    push_codex(out, &path, replay, true);
                    self.tails.insert(path, tail);
                }
            }
            self.initialized = true;
        }
        if force_replay {
            for (path, tail) in &self.tails {
                push_codex(out, path, tail.replay(CODEX_REPLAY_BYTES), true);
            }
        }
        for (path, tail) in self.tails.iter_mut() {
            let lines = tail.read_new_lines();
            push_codex(out, path, lines, false);
        }
    }
}

fn push_codex(out: &mut Vec<RawSourceEvent>, path: &Path, lines: Vec<String>, replay: bool) {
    let file = path.to_string_lossy().into_owned();
    for line in lines {
        if let Some(payload) = reduce_codex_line(&line) {
            out.push(RawSourceEvent { source: "codex-rollout", replay, file: Some(file.clone()), payload });
        }
    }
}

fn push_antigravity(out: &mut Vec<RawSourceEvent>, lines: Vec<String>, replay: bool) {
    for line in lines {
        if let Ok(payload) = serde_json::from_str::<Value>(&line) {
            out.push(RawSourceEvent { source: "antigravity-hook", replay, file: None, payload });
        }
    }
}

// ---------------------------------------------------------------------------
// Process detection (application presence only)
// ---------------------------------------------------------------------------

const APP_PATTERNS: [(&str, &[&str]); 6] = [
    ("antigravity", &["antigravity ide.exe", "antigravity.exe", "antigravity", "antigravity ide"]),
    ("vscode", &["code.exe", "code", "visual studio code"]),
    ("codex", &["codex.exe", "codex"]),
    ("cursor", &["cursor.exe", "cursor"]),
    ("opencode", &["opencode.exe", "opencode", "claude.exe", "claude"]),
    ("ollama", &["ollama.exe", "ollama_app.exe", "ollama", "ollama_app"]),
];

pub fn scan_apps(sys: &mut System) -> Vec<AppDetection> {
    sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing());
    let names: Vec<String> =
        sys.processes().values().map(|p| p.name().to_string_lossy().to_lowercase()).collect();
    APP_PATTERNS
        .iter()
        .map(|(id, patterns)| {
            let matched: Vec<&String> = names.iter().filter(|n| patterns.contains(&n.as_str())).collect();
            let mut unique: Vec<String> = matched.iter().map(|s| s.to_string()).collect();
            unique.sort();
            unique.dedup();
            AppDetection { agent_id: id, running: !matched.is_empty(), process_count: matched.len(), process_names: unique }
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Thread
// ---------------------------------------------------------------------------

pub fn info(already_running: bool) -> MonitorInfo {
    let codex = paths::codex_sessions_dir();
    MonitorInfo {
        already_running,
        antigravity_events_file: paths::antigravity_events_file().to_string_lossy().into_owned(),
        codex_sessions_dir_exists: codex.as_ref().is_some_and(|p| p.is_dir()),
        codex_sessions_dir: codex.map(|p| p.to_string_lossy().into_owned()),
    }
}

/// Starts the monitor thread once. Subsequent calls (e.g. after a dashboard
/// reload) request a replay so the frontend can rebuild its state.
pub fn start(app: AppHandle) -> MonitorInfo {
    if RUNNING.swap(true, Ordering::SeqCst) {
        REPLAY_REQUESTED.store(true, Ordering::SeqCst);
        return info(true);
    }
    std::thread::Builder::new()
        .name("devpet-monitor".into())
        .spawn(move || run_loop(app))
        .expect("failed to spawn monitor thread");
    info(false)
}

fn run_loop(app: AppHandle) {
    let ag_path = paths::antigravity_events_file();
    let (mut ag_tail, ag_replay) = FileTail::at_end_with_replay(ag_path, ANTIGRAVITY_REPLAY_BYTES);
    let mut codex = paths::codex_sessions_dir().map(CodexWatcher::new);
    let mut sys = System::new();
    let mut last_process_scan: Option<Instant> = None;

    let mut first = Vec::new();
    push_antigravity(&mut first, ag_replay, true);
    let mut pending_first = Some(first);

    loop {
        let force_replay = REPLAY_REQUESTED.swap(false, Ordering::SeqCst);
        let mut batch = pending_first.take().unwrap_or_default();
        if force_replay {
            push_antigravity(&mut batch, ag_tail.replay(ANTIGRAVITY_REPLAY_BYTES), true);
        }
        push_antigravity(&mut batch, ag_tail.read_new_lines(), false);
        if let Some(cw) = codex.as_mut() {
            cw.poll(&mut batch, force_replay);
        }
        if !batch.is_empty() {
            let _ = app.emit(EVT_RAW, &batch);
        }

        if force_replay || last_process_scan.is_none_or(|t| t.elapsed() >= PROCESS_INTERVAL) {
            last_process_scan = Some(Instant::now());
            let memory = get_memory_info(&mut sys);
            let _ = app.emit(EVT_TICK, TickPayload { at: now_ms(), apps: scan_apps(&mut sys), memory: Some(memory) });
        }
        std::thread::sleep(LOOP_INTERVAL);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn temp_file(name: &str) -> PathBuf {
        let p = std::env::temp_dir().join(format!("devpet-test-{}-{name}", std::process::id()));
        let _ = std::fs::remove_file(&p);
        p
    }

    #[test]
    fn tail_returns_only_complete_new_lines() {
        let p = temp_file("tail.jsonl");
        std::fs::write(&p, "{\"old\":1}\n").unwrap();
        let (mut tail, replay) = FileTail::at_end_with_replay(p.clone(), 1024);
        assert_eq!(replay, vec!["{\"old\":1}"]);
        assert!(tail.read_new_lines().is_empty());

        let mut f = std::fs::OpenOptions::new().append(true).open(&p).unwrap();
        f.write_all(b"{\"a\":1}\n{\"b\":").unwrap();
        assert_eq!(tail.read_new_lines(), vec!["{\"a\":1}"]);
        f.write_all(b"2}\n").unwrap();
        assert_eq!(tail.read_new_lines(), vec!["{\"b\":2}"]);
        let _ = std::fs::remove_file(&p);
    }

    #[test]
    fn tail_recovers_from_truncation() {
        let p = temp_file("trunc.jsonl");
        std::fs::write(&p, "{\"x\":1}\n{\"x\":2}\n").unwrap();
        let (mut tail, _) = FileTail::at_end_with_replay(p.clone(), 1024);
        std::fs::write(&p, "{\"y\":1}\n").unwrap();
        assert_eq!(tail.read_new_lines(), vec!["{\"y\":1}"]);
        let _ = std::fs::remove_file(&p);
    }

    #[test]
    fn replay_drops_cut_first_line() {
        let p = temp_file("cut.jsonl");
        std::fs::write(&p, "{\"long_line_here\":1}\n{\"b\":2}\n").unwrap();
        let (_, replay) = FileTail::at_end_with_replay(p.clone(), 12);
        assert_eq!(replay, vec!["{\"b\":2}"]);
        let _ = std::fs::remove_file(&p);
    }

    #[test]
    fn reduces_real_codex_task_complete_with_error() {
        // Shape copied from a real ~/.codex/sessions rollout file (content trimmed).
        let line = r#"{"timestamp":"2026-09-19T07:40:44.027Z","ordinal":11,"type":"event_msg","payload":{"type":"task_complete","turn_id":"t-1","last_agent_message":null,"error":{"message":"usage limit","codex_error_info":"usage_limit_exceeded"}}}"#;
        let r = reduce_codex_line(line).unwrap();
        assert_eq!(r["payloadType"], "task_complete");
        assert_eq!(r["turnId"], "t-1");
        assert_eq!(r["error"], "usage limit");
    }

    #[test]
    fn reduces_codex_task_started_and_drops_noise() {
        let started = r#"{"timestamp":"t","type":"event_msg","payload":{"type":"task_started","turn_id":"t-2"}}"#;
        let r = reduce_codex_line(started).unwrap();
        assert_eq!(r["payloadType"], "task_started");
        assert!(r["error"].is_null());
        let tokens = r#"{"timestamp":"t","type":"event_msg","payload":{"type":"token_count"}}"#;
        assert!(reduce_codex_line(tokens).is_none());
        assert!(reduce_codex_line(r#"{"type":"world_state"}"#).is_none());
        assert!(reduce_codex_line("garbage").is_none());
    }
}
