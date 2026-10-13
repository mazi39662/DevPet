//! Window management and the system tray. Platform-specific window behaviour
//! is isolated here; the frontend only calls these commands.

use serde::Serialize;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, LogicalSize, Manager, Runtime, WebviewWindow};

pub const DASHBOARD: &str = "main";
pub const COMPANION: &str = "companion";
pub const POMODORO_COMPANION: &str = "companion-pomodoro";
pub const EVT_COMPANION_VISIBILITY: &str = "devpet://companion-visibility";
pub const EVT_POMODORO_COMPANION_VISIBILITY: &str = "devpet://pomodoro-companion-visibility";

const COMPANION_SIZE: (f64, f64) = (168.0, 184.0);
const COMPANION_MINI_SIZE: (f64, f64) = (92.0, 100.0);

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CompanionVisibility {
    pub visible: bool,
}

fn companion<R: Runtime>(app: &AppHandle<R>) -> Result<WebviewWindow<R>, String> {
    app.get_webview_window(COMPANION).ok_or_else(|| "companion window not found".into())
}

fn pomodoro_companion<R: Runtime>(app: &AppHandle<R>) -> Result<WebviewWindow<R>, String> {
    app.get_webview_window(POMODORO_COMPANION).ok_or_else(|| "pomodoro companion window not found".into())
}

pub fn set_companion_visible<R: Runtime>(app: &AppHandle<R>, visible: bool) -> Result<bool, String> {
    let win = companion(app)?;
    if visible {
        win.show().map_err(|e| e.to_string())?;
        // Re-assert topmost after showing; some shells drop it on hide/show.
        let _ = win.set_always_on_top(true);
    } else {
        win.hide().map_err(|e| e.to_string())?;
    }
    let _ = app.emit(EVT_COMPANION_VISIBILITY, CompanionVisibility { visible });
    Ok(visible)
}

pub fn is_companion_visible<R: Runtime>(app: &AppHandle<R>) -> bool {
    companion(app).ok().and_then(|w| w.is_visible().ok()).unwrap_or(false)
}

pub fn set_companion_mini<R: Runtime>(app: &AppHandle<R>, mini: bool) -> Result<(), String> {
    let (w, h) = if mini { COMPANION_MINI_SIZE } else { COMPANION_SIZE };
    companion(app)?.set_size(LogicalSize::new(w, h)).map_err(|e| e.to_string())
}

pub fn set_pomodoro_companion_visible<R: Runtime>(app: &AppHandle<R>, visible: bool) -> Result<bool, String> {
    let win = pomodoro_companion(app)?;
    if visible {
        // If main companion is visible, offset pomodoro companion to the left so they don't overlap
        if let Ok(main_win) = companion(app) {
            if let Ok(main_pos) = main_win.outer_position() {
                if let Ok(cur_pos) = win.outer_position() {
                    // If at the exact same spot, offset pomodoro companion by 180px to the left
                    if (cur_pos.x - main_pos.x).abs() < 10 && (cur_pos.y - main_pos.y).abs() < 10 {
                        let _ = win.set_position(tauri::PhysicalPosition::new(main_pos.x - 180, main_pos.y));
                    }
                }
            }
        }
        win.show().map_err(|e| e.to_string())?;
        let _ = win.set_always_on_top(true);
    } else {
        win.hide().map_err(|e| e.to_string())?;
    }
    let _ = app.emit(EVT_POMODORO_COMPANION_VISIBILITY, CompanionVisibility { visible });
    Ok(visible)
}

pub fn is_pomodoro_companion_visible<R: Runtime>(app: &AppHandle<R>) -> bool {
    pomodoro_companion(app).ok().and_then(|w| w.is_visible().ok()).unwrap_or(false)
}

pub fn set_pomodoro_companion_mini<R: Runtime>(app: &AppHandle<R>, mini: bool) -> Result<(), String> {
    let (w, h) = if mini { COMPANION_MINI_SIZE } else { COMPANION_SIZE };
    pomodoro_companion(app)?.set_size(LogicalSize::new(w, h)).map_err(|e| e.to_string())
}

pub fn show_dashboard<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let win = app.get_webview_window(DASHBOARD).ok_or("dashboard window not found")?;
    let _ = win.unminimize();
    win.show().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())
}

pub fn build_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show_dashboard", "Open Dashboard", true, None::<&str>)?;
    let toggle_agent = MenuItem::with_id(app, "toggle_agent", "Toggle Codi (Coding Pet)", true, None::<&str>)?;
    let toggle_pomo = MenuItem::with_id(app, "toggle_pomo", "Toggle Momo (Pomodoro Pet)", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit DevPet", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &toggle_agent, &toggle_pomo, &sep, &quit])?;

    let mut builder = TrayIconBuilder::with_id("devpet-tray")
        .tooltip("DevPet")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_dashboard" => {
                let _ = show_dashboard(app);
            }
            "toggle_agent" => {
                let visible = is_companion_visible(app);
                let _ = set_companion_visible(app, !visible);
            }
            "toggle_pomo" => {
                let visible = is_pomodoro_companion_visible(app);
                let _ = set_pomodoro_companion_visible(app, !visible);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                let _ = show_dashboard(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    Ok(())
}

#[cfg(target_os = "windows")]
mod win_focus {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;

    type HWND = isize;
    type BOOL = i32;
    type LPARAM = isize;
    type DWORD = u32;

    extern "system" {
        fn EnumWindows(lpEnumFunc: unsafe extern "system" fn(HWND, LPARAM) -> BOOL, lParam: LPARAM) -> BOOL;
        fn GetWindowTextW(hWnd: HWND, lpString: *mut u16, nMaxCount: i32) -> i32;
        fn IsWindowVisible(hWnd: HWND) -> BOOL;
        fn ShowWindow(hWnd: HWND, nCmdShow: i32) -> BOOL;
        fn SetForegroundWindow(hWnd: HWND) -> BOOL;
        fn BringWindowToTop(hWnd: HWND) -> BOOL;
        fn SetWindowPos(hWnd: HWND, hWndInsertAfter: HWND, X: i32, Y: i32, cx: i32, cy: i32, uFlags: u32) -> BOOL;
        fn GetWindowThreadProcessId(hWnd: HWND, lpdwProcessId: *mut DWORD) -> DWORD;
        fn GetCurrentThreadId() -> DWORD;
        fn AttachThreadInput(idAttach: DWORD, idAttachTo: DWORD, fAttach: BOOL) -> BOOL;
        fn IsIconic(hWnd: HWND) -> BOOL;
    }

    const SW_RESTORE: i32 = 9;
    const HWND_TOPMOST: HWND = -1;
    const HWND_NOTOPMOST: HWND = -2;
    const SWP_NOMOVE: u32 = 0x0002;
    const SWP_NOSIZE: u32 = 0x0001;

    struct Context {
        my_pid: u32,
        target_pids: Vec<u32>,
        target_titles: Vec<String>,
        found: Option<HWND>,
    }

    unsafe extern "system" fn enum_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let ctx = &mut *(lparam as *mut Context);
        if IsWindowVisible(hwnd) == 0 {
            return 1;
        }

        let mut pid: DWORD = 0;
        let _ = GetWindowThreadProcessId(hwnd, &mut pid);

        if pid == ctx.my_pid {
            return 1;
        }

        let mut buf = [0u16; 512];
        let len = GetWindowTextW(hwnd, buf.as_mut_ptr(), 512);
        let title = if len > 0 {
            OsString::from_wide(&buf[..len as usize]).to_string_lossy().to_lowercase()
        } else {
            String::new()
        };

        if title == "devpet" || title == "devpet companion" {
            return 1;
        }

        // Check target PIDs
        if ctx.target_pids.contains(&pid) {
            ctx.found = Some(hwnd);
            return 0;
        }

        // Check target title keywords
        for keyword in &ctx.target_titles {
            if !title.is_empty() && title.contains(keyword) {
                ctx.found = Some(hwnd);
                return 0;
            }
        }

        1
    }

    pub fn focus(target_agent: Option<&str>) -> bool {
        let agent = target_agent.unwrap_or("antigravity").to_lowercase();
        let (proc_patterns, title_patterns): (Vec<&str>, Vec<&str>) = match agent.as_str() {
            "vscode" => (vec!["code.exe", "code"], vec!["visual studio code"]),
            "codex" => (vec!["codex.exe", "codex", "windowsterminal.exe"], vec!["codex", "powershell", "terminal"]),
            _ => (
                vec!["antigravity ide.exe", "antigravity.exe", "antigravity", "code.exe"],
                vec!["antigravity", "visual studio code"],
            ),
        };

        let my_pid = std::process::id();

        let mut sys = sysinfo::System::new();
        sys.refresh_processes_specifics(
            sysinfo::ProcessesToUpdate::All,
            true,
            sysinfo::ProcessRefreshKind::nothing(),
        );

        let mut target_pids = Vec::new();
        for (pid, proc) in sys.processes() {
            let p_name = proc.name().to_string_lossy().to_lowercase();
            if proc_patterns.iter().any(|pat| p_name.contains(pat)) {
                if let Ok(p) = pid.to_string().parse::<u32>() {
                    target_pids.push(p);
                }
            }
        }

        let mut ctx = Context {
            my_pid,
            target_pids,
            target_titles: title_patterns.into_iter().map(String::from).collect(),
            found: None,
        };

        unsafe {
            EnumWindows(enum_proc, &mut ctx as *mut _ as LPARAM);
            if let Some(hwnd) = ctx.found {
                let cur_thread = GetCurrentThreadId();
                let mut target_pid: DWORD = 0;
                let target_thread = GetWindowThreadProcessId(hwnd, &mut target_pid);

                let attached = if cur_thread != target_thread {
                    AttachThreadInput(cur_thread, target_thread, 1) != 0
                } else {
                    false
                };

                if IsIconic(hwnd) != 0 {
                    ShowWindow(hwnd, SW_RESTORE);
                } else {
                    ShowWindow(hwnd, SW_RESTORE);
                }

                SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                BringWindowToTop(hwnd);
                SetForegroundWindow(hwnd);

                if attached {
                    AttachThreadInput(cur_thread, target_thread, 0);
                }
                return true;
            }
        }
        false
    }
}

#[cfg(not(target_os = "windows"))]
mod win_focus {
    pub fn focus(_: Option<&str>) -> bool {
        false
    }
}

pub fn focus_app(target_agent: Option<&str>) -> bool {
    win_focus::focus(target_agent)
}

pub fn play_system_alert() {
    #[cfg(target_os = "windows")]
    unsafe {
        extern "system" {
            fn MessageBeep(uType: u32) -> i32;
        }
        let _ = MessageBeep(0x00000040); // MB_ICONASTERISK (Notification chime)
    }
}

