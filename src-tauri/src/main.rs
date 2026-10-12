// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    // `devpet hook <Event>` is invoked by Antigravity lifecycle hooks. It must
    // return before any GUI/webview initialisation to stay fast.
    if args.first().map(String::as_str) == Some("hook") {
        std::process::exit(devpet_lib::run_hook_cli(&args[1..]));
    }
    devpet_lib::run()
}
