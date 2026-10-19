/**
 * Thin typed wrappers around Tauri commands/events. All native access from the
 * frontend goes through here so platform code stays isolated.
 */
import { invoke } from '@tauri-apps/api/core';
import { emit, emitTo, listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { EventName, EventPayloads, HookStatus, MonitorInfo } from '../types/events';

export const native = {
  startMonitoring: () => invoke<MonitorInfo>('start_monitoring'),
  getHookStatus: () => invoke<HookStatus>('get_hook_status'),
  installAntigravityHook: () => invoke<HookStatus>('install_antigravity_hook'),
  uninstallAntigravityHook: () => invoke<HookStatus>('uninstall_antigravity_hook'),
  setCompanionVisible: (visible: boolean) => invoke<boolean>('set_companion_visible', { visible }),
  isCompanionVisible: () => invoke<boolean>('is_companion_visible'),
  setCompanionMini: (mini: boolean) => invoke<void>('set_companion_mini', { mini }),
  setPomodoroCompanionVisible: (visible: boolean) => invoke<boolean>('set_pomodoro_companion_visible', { visible }),
  isPomodoroCompanionVisible: () => invoke<boolean>('is_pomodoro_companion_visible'),
  setPomodoroCompanionMini: (mini: boolean) => invoke<void>('set_pomodoro_companion_mini', { mini }),
  setMokiCompanionVisible: (visible: boolean) => invoke<boolean>('set_moki_companion_visible', { visible }),
  isMokiCompanionVisible: () => invoke<boolean>('is_moki_companion_visible'),
  setMokiCompanionMini: (mini: boolean) => invoke<void>('set_moki_companion_mini', { mini }),
  showDashboard: () => invoke<void>('show_dashboard'),
  focusTargetApp: (agentId?: string | null) => invoke<boolean>('focus_target_app', { agentId: agentId || null }),
  playSystemSound: () => invoke<void>('play_system_sound'),
  setKeyboardHookEnabled: (enabled: boolean) => invoke<void>('set_keyboard_hook_enabled', { enabled }),
  quitApp: () => invoke<void>('quit_app'),
  startWindowDragging: () => invoke<void>('start_window_dragging'),
};

export function onEvent<E extends EventName>(
  name: E,
  handler: (payload: EventPayloads[E]) => void,
): Promise<UnlistenFn> {
  return listen<EventPayloads[E]>(name, (e) => handler(e.payload));
}

export async function emitEvent<E extends EventName>(name: E, payload: EventPayloads[E]): Promise<void> {
  try {
    await emit(name, payload);
  } catch {}
  try {
    await emitTo('main', name, payload);
  } catch {}
  try {
    await emitTo('companion', name, payload);
  } catch {}
  try {
    await emitTo('companion-pomodoro', name, payload);
  } catch {}
  try {
    await emitTo('companion-moki', name, payload);
  } catch {}
}
