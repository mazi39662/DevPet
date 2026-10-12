/**
 * Thin typed wrappers around Tauri commands/events. All native access from the
 * frontend goes through here so platform code stays isolated.
 */
import { invoke } from '@tauri-apps/api/core';
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { EventName, EventPayloads, HookStatus, MonitorInfo } from '../types/events';

export const native = {
  startMonitoring: () => invoke<MonitorInfo>('start_monitoring'),
  getHookStatus: () => invoke<HookStatus>('get_hook_status'),
  installAntigravityHook: () => invoke<HookStatus>('install_antigravity_hook'),
  uninstallAntigravityHook: () => invoke<HookStatus>('uninstall_antigravity_hook'),
  setCompanionVisible: (visible: boolean) => invoke<boolean>('set_companion_visible', { visible }),
  isCompanionVisible: () => invoke<boolean>('is_companion_visible'),
  setCompanionMini: (mini: boolean) => invoke<void>('set_companion_mini', { mini }),
  showDashboard: () => invoke<void>('show_dashboard'),
  focusTargetApp: (agentId?: string | null) => invoke<boolean>('focus_target_app', { agentId: agentId || null }),
  playSystemSound: () => invoke<void>('play_system_sound'),
  quitApp: () => invoke<void>('quit_app'),
};

export function onEvent<E extends EventName>(
  name: E,
  handler: (payload: EventPayloads[E]) => void,
): Promise<UnlistenFn> {
  return listen<EventPayloads[E]>(name, (e) => handler(e.payload));
}

export function emitEvent<E extends EventName>(name: E, payload: EventPayloads[E]): Promise<void> {
  return emit(name, payload);
}
