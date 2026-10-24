mod autostart;
mod hook_cli;
mod hook_install;
mod monitor;
mod paths;
mod windows;

use tauri::{AppHandle, Manager, WindowEvent};

pub use hook_cli::run as run_hook_cli;

// ----------------------------------------------------------------- commands

#[tauri::command]
fn start_monitoring(app: AppHandle) -> monitor::MonitorInfo {
    monitor::start(app)
}

#[tauri::command]
fn get_hook_status() -> hook_install::HookStatus {
    hook_install::status()
}

#[tauri::command]
fn install_antigravity_hook() -> Result<hook_install::HookStatus, String> {
    hook_install::install()
}

#[tauri::command]
fn uninstall_antigravity_hook() -> Result<hook_install::HookStatus, String> {
    hook_install::uninstall()
}

#[tauri::command]
fn set_companion_visible(app: AppHandle, visible: bool) -> Result<bool, String> {
    windows::set_companion_visible(&app, visible)
}

#[tauri::command]
fn is_companion_visible(app: AppHandle) -> bool {
    windows::is_companion_visible(&app)
}

#[tauri::command]
fn set_companion_mini(app: AppHandle, mini: bool) -> Result<(), String> {
    windows::set_companion_mini(&app, mini)
}

#[tauri::command]
fn set_pomodoro_companion_mini(app: AppHandle, mini: bool) -> Result<(), String> {
    windows::set_pomodoro_companion_mini(&app, mini)
}

#[tauri::command]
fn set_pomodoro_companion_visible(app: AppHandle, visible: bool) -> Result<bool, String> {
    windows::set_pomodoro_companion_visible(&app, visible)
}

#[tauri::command]
fn is_pomodoro_companion_visible(app: AppHandle) -> bool {
    windows::is_pomodoro_companion_visible(&app)
}

#[tauri::command]
fn set_moki_companion_mini(app: AppHandle, mini: bool) -> Result<(), String> {
    windows::set_moki_companion_mini(&app, mini)
}

#[tauri::command]
fn set_moki_companion_visible(app: AppHandle, visible: bool) -> Result<bool, String> {
    windows::set_moki_companion_visible(&app, visible)
}

#[tauri::command]
fn is_moki_companion_visible(app: AppHandle) -> bool {
    windows::is_moki_companion_visible(&app)
}

#[tauri::command]
fn show_dashboard(app: AppHandle) -> Result<(), String> {
    windows::show_dashboard(&app)
}

#[tauri::command]
fn focus_target_app(agent_id: Option<String>) -> Result<bool, String> {
    Ok(windows::focus_app(agent_id.as_deref()))
}

#[tauri::command]
fn play_system_sound() {
    windows::play_system_alert();
}

#[tauri::command]
fn set_keyboard_hook_enabled(app: AppHandle, enabled: bool) {
    windows::set_keyboard_hook_enabled(&app, enabled);
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn start_window_dragging(window: tauri::WebviewWindow) -> Result<(), String> {
    windows::start_window_dragging(&window)
}

#[tauri::command]
fn get_system_memory() -> monitor::SystemMemoryInfo {
    let mut sys = sysinfo::System::new();
    monitor::get_memory_info(&mut sys)
}

#[tauri::command]
fn snap_pets_to_bottom_right(app: AppHandle) -> Result<(), String> {
    windows::snap_pets_to_bottom_right(&app)
}

#[tauri::command]
fn is_autostart_enabled() -> bool {
    autostart::is_autostart_enabled()
}

#[tauri::command]
fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
    autostart::set_autostart_enabled(enabled)
}

// ---------------------------------------------------------------------- app

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            start_monitoring,
            get_hook_status,
            get_system_memory,
            install_antigravity_hook,
            uninstall_antigravity_hook,
            set_companion_visible,
            is_companion_visible,
            set_companion_mini,
            set_pomodoro_companion_visible,
            is_pomodoro_companion_visible,
            set_pomodoro_companion_mini,
            set_moki_companion_visible,
            is_moki_companion_visible,
            set_moki_companion_mini,
            show_dashboard,
            focus_target_app,
            play_system_sound,
            set_keyboard_hook_enabled,
            quit_app,
            start_window_dragging,
            snap_pets_to_bottom_right,
            is_autostart_enabled,
            set_autostart_enabled,
        ])
        .setup(|app| {
            windows::build_tray(app.handle())?;

            // Task 3: Initialize all companion windows to bottom-right default positions
            if let Some(m) = app.get_webview_window(windows::MOKI_COMPANION) {
                let _ = windows::position_companion_bottom_right(&m, 0);
                let _ = m.set_always_on_top(true);
                let _ = m.show();
            }
            if let Some(p) = app.get_webview_window(windows::POMODORO_COMPANION) {
                let _ = windows::position_companion_bottom_right(&p, 1);
                let _ = p.set_always_on_top(true);
            }
            if let Some(c) = app.get_webview_window(windows::COMPANION) {
                let _ = windows::position_companion_bottom_right(&c, 2);
                let _ = c.set_always_on_top(true);
            }

            // Task 4: Ensure DevPet is configured to run on Windows startup
            let _ = autostart::set_autostart_enabled(true);

            let st = hook_install::status();
            if st.installed && !st.up_to_date {
                let _ = hook_install::install();
            }
            // The keyboard hook is started by the dashboard via
            // `set_keyboard_hook_enabled` once the user's setting is loaded.
            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing either window only hides it: the dashboard hosts the single
            // monitoring coordinator, so it must stay alive. Quit via tray/menu.
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
                if window.label() == windows::COMPANION {
                    let _ = windows::set_companion_visible(window.app_handle(), false);
                } else if window.label() == windows::POMODORO_COMPANION {
                    let _ = windows::set_pomodoro_companion_visible(window.app_handle(), false);
                } else if window.label() == windows::MOKI_COMPANION {
                    let _ = windows::set_moki_companion_visible(window.app_handle(), false);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
