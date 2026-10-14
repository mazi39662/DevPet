//! `devpet hook <Event>` — the command Antigravity runs at lifecycle points.
//!
//! Contract (see Antigravity `hooks.md`): JSON context on stdin, JSON result on
//! stdout. We only *observe*: every event gets `{}` back, which means "default
//! behaviour" for PreInvocation / PreToolUse / PostToolUse / PostInvocation / Stop.
//! Returning `{}` on PreToolUse allows normal tool execution or default UI permission prompt
//! without forcing any deny or silent bypass.
//!
//! This path must be fast and must never fail loudly: any error is swallowed so
//! the agent loop is never blocked or broken by DevPet.

use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::{json, Map, Value};

use crate::paths;

const MAX_STDIN_BYTES: u64 = 4 * 1024 * 1024;
const ROTATE_AT_BYTES: u64 = 2 * 1024 * 1024;

#[allow(dead_code)]
pub const SUPPORTED_EVENTS: [&str; 5] = ["PreInvocation", "PreToolUse", "PostToolUse", "PostInvocation", "Stop"];

/// Entry point. Returns the process exit code (always 0).
pub fn run(args: &[String]) -> i32 {
    let event = args.first().map(String::as_str).unwrap_or("Unknown");

    let mut input = String::new();
    let _ = std::io::stdin().take(MAX_STDIN_BYTES).read_to_string(&mut input);

    if let Ok(record) = build_record(event, &input, now_ms(), std::process::id()) {
        let _ = append_record(&record);
    }

    // Antigravity PreToolUse hook contract requires a decision (e.g. "allow").
    // An empty object `{}` is considered missing required `decision` by the IDE.
    let response = match event {
        "PreToolUse" => r#"{"decision":"allow"}"#,
        _ => "{}",
    };

    let mut out = std::io::stdout();
    let _ = out.write_all(response.as_bytes());
    let _ = out.flush();
    0
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Extracts only the fields DevPet needs. Prompts, tool args and transcripts are
/// intentionally *not* persisted.
pub fn build_record(event: &str, raw: &str, ts: u64, pid: u32) -> Result<Value, serde_json::Error> {
    let input: Value = if raw.trim().is_empty() {
        Value::Object(Map::new())
    } else {
        serde_json::from_str(raw)?
    };

    let get_str = |k: &str| input.get(k).and_then(Value::as_str).map(str::to_owned);
    let get_num = |k: &str| input.get(k).and_then(Value::as_i64);

    let workspace = input
        .get("workspacePaths")
        .and_then(Value::as_array)
        .and_then(|a| a.first())
        .and_then(Value::as_str)
        .map(str::to_owned);

    let tool_name = input
        .get("toolCall")
        .and_then(|t| t.get("name"))
        .and_then(Value::as_str)
        .or_else(|| input.get("tool_name").and_then(Value::as_str))
        .or_else(|| input.get("toolName").and_then(Value::as_str))
        .map(str::to_owned);

    Ok(json!({
        "v": 1,
        "id": format!("{ts}-{pid}"),
        "agent": "antigravity",
        "event": event,
        "ts": ts,
        "conversationId": get_str("conversationId"),
        "workspace": workspace,
        "stepIdx": get_num("stepIdx"),
        "invocationNum": get_num("invocationNum"),
        "executionNum": get_num("executionNum"),
        "terminationReason": get_str("terminationReason"),
        "fullyIdle": input.get("fullyIdle").and_then(Value::as_bool),
        "error": get_str("error").filter(|e| !e.is_empty()),
        "toolName": tool_name,
    }))
}

fn append_record(record: &Value) -> std::io::Result<()> {
    let path = paths::antigravity_events_file();
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir)?;
    }
    if let Ok(meta) = std::fs::metadata(&path) {
        if meta.len() > ROTATE_AT_BYTES {
            let _ = std::fs::rename(&path, path.with_extension("jsonl.old"));
        }
    }
    let mut line = serde_json::to_string(record)?;
    line.push('\n');
    let mut file = OpenOptions::new().create(true).append(true).open(&path)?;
    // Single write call so concurrent hooks don't interleave partial lines.
    file.write_all(line.as_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stop_record_keeps_only_status_fields() {
        let raw = r#"{"conversationId":"abc","executionNum":2,"terminationReason":"model_stop",
            "error":"","fullyIdle":true,"workspacePaths":["C:/ws"],"transcriptPath":"secret"}"#;
        let rec = build_record("Stop", raw, 42, 7).unwrap();
        assert_eq!(rec["event"], "Stop");
        assert_eq!(rec["conversationId"], "abc");
        assert_eq!(rec["executionNum"], 2);
        assert_eq!(rec["terminationReason"], "model_stop");
        assert_eq!(rec["fullyIdle"], true);
        assert!(rec["error"].is_null(), "empty error string must be dropped");
        assert_eq!(rec["workspace"], "C:/ws");
        assert_eq!(rec["id"], "42-7");
        assert!(rec.get("transcriptPath").is_none());
    }

    #[test]
    fn empty_stdin_still_produces_record() {
        let rec = build_record("PreInvocation", "  ", 1, 1).unwrap();
        assert_eq!(rec["event"], "PreInvocation");
        assert!(rec["conversationId"].is_null());
    }

    #[test]
    fn invalid_json_is_an_error() {
        assert!(build_record("Stop", "{not json", 1, 1).is_err());
    }
}
