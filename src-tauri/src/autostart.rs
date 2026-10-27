//! Windows startup / autostart manager.
//! Manages DevPet automatic execution on system startup via
//! HKCU\Software\Microsoft\Windows\CurrentVersion\Run.

#[cfg(target_os = "windows")]
mod platform {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    const CREATE_NO_WINDOW: u32 = 0x08000000;
    const REG_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
    const APP_NAME: &str = "DevPet";

    pub fn is_autostart_enabled() -> bool {
        let output = Command::new("reg")
            .args(["query", REG_KEY, "/v", APP_NAME])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match output {
            Ok(out) => out.status.success(),
            Err(_) => false,
        }
    }

    pub fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
        if enabled {
            let current_exe = std::env::current_exe()
                .map_err(|e| format!("Failed to get executable path: {e}"))?;
            let exe_str = current_exe.to_string_lossy().to_string();
            let value = format!("\"{}\"", exe_str);

            let output = Command::new("reg")
                .args(["add", REG_KEY, "/v", APP_NAME, "/t", "REG_SZ", "/d", &value, "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("Failed to execute reg.exe: {e}"))?;

            if output.status.success() {
                Ok(())
            } else {
                let err = String::from_utf8_lossy(&output.stderr);
                Err(format!("Failed to register startup key: {err}"))
            }
        } else {
            let output = Command::new("reg")
                .args(["delete", REG_KEY, "/v", APP_NAME, "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("Failed to execute reg.exe: {e}"))?;

            if output.status.success() || !is_autostart_enabled() {
                Ok(())
            } else {
                let err = String::from_utf8_lossy(&output.stderr);
                Err(format!("Failed to remove startup key: {err}"))
            }
        }
    }
}

#[cfg(target_os = "macos")]
mod platform {
    use std::path::PathBuf;
    use crate::paths;

    fn plist_path() -> Option<PathBuf> {
        paths::home_dir().map(|h| h.join("Library").join("LaunchAgents").join("com.devpet.app.plist"))
    }

    pub fn is_autostart_enabled() -> bool {
        plist_path().map(|p| p.exists()).unwrap_or(false)
    }

    pub fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
        let path = plist_path().ok_or("Cannot resolve home directory")?;
        if enabled {
            let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let exe_str = current_exe.to_string_lossy();
            if let Some(parent) = path.parent() {
                std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let plist_content = format!(
                r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.devpet.app</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>"#,
                exe_str
            );
            std::fs::write(&path, plist_content).map_err(|e| e.to_string())?;
        } else if path.exists() {
            let _ = std::fs::remove_file(&path);
        }
        Ok(())
    }
}

#[cfg(target_os = "linux")]
mod platform {
    use std::path::PathBuf;
    use crate::paths;

    fn desktop_path() -> Option<PathBuf> {
        paths::home_dir().map(|h| h.join(".config").join("autostart").join("devpet.desktop"))
    }

    pub fn is_autostart_enabled() -> bool {
        desktop_path().map(|p| p.exists()).unwrap_or(false)
    }

    pub fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
        let path = desktop_path().ok_or("Cannot resolve home directory")?;
        if enabled {
            let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let exe_str = current_exe.to_string_lossy();
            if let Some(parent) = path.parent() {
                std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let desktop_content = format!(
                "[Desktop Entry]\nType=Application\nName=DevPet\nExec=\"{}\"\nTerminal=false\nX-GNOME-Autostart-enabled=true\n",
                exe_str
            );
            std::fs::write(&path, desktop_content).map_err(|e| e.to_string())?;
        } else if path.exists() {
            let _ = std::fs::remove_file(&path);
        }
        Ok(())
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
mod platform {
    pub fn is_autostart_enabled() -> bool {
        false
    }

    pub fn set_autostart_enabled(_enabled: bool) -> Result<(), String> {
        Ok(())
    }
}

pub fn is_autostart_enabled() -> bool {
    platform::is_autostart_enabled()
}

pub fn set_autostart_enabled(enabled: bool) -> Result<(), String> {
    platform::set_autostart_enabled(enabled)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(target_os = "windows")]
    fn test_autostart_cycle() {
        let original = is_autostart_enabled();
        // Enable
        let res_set = set_autostart_enabled(true);
        assert!(res_set.is_ok(), "Failed to enable autostart: {:?}", res_set);
        assert!(is_autostart_enabled(), "Autostart should be enabled");

        // Restore original state
        if !original {
            let res_unset = set_autostart_enabled(false);
            assert!(res_unset.is_ok(), "Failed to restore autostart: {:?}", res_unset);
        }
    }
}
