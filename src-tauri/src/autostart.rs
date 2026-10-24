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

#[cfg(not(target_os = "windows"))]
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
