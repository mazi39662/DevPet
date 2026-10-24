import { ref, watch } from 'vue';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS, DEFAULT_SOUND_EFFECTS } from '../types/settings';
import { emitEvent, native } from '../services/native';
import { notificationService } from '../services/notifications';
import { EVENTS } from '../types/events';

const STORAGE_KEY = 'devpet:settings:v1';

function loadStored(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_SETTINGS.volume,
        keyboardVolume: typeof parsed.keyboardVolume === 'number' ? parsed.keyboardVolume : DEFAULT_SETTINGS.keyboardVolume,
        autostartEnabled: typeof parsed.autostartEnabled === 'boolean' ? parsed.autostartEnabled : DEFAULT_SETTINGS.autostartEnabled,
        soundEffects: {
          ...DEFAULT_SOUND_EFFECTS,
          ...(parsed.soundEffects || {}),
        },
        pomodoroConfig: {
          focusMinutes: parsed.pomodoroConfig?.focusMinutes ?? DEFAULT_SETTINGS.pomodoroConfig.focusMinutes,
          breakMinutes:
            parsed.pomodoroConfig?.breakMinutes ??
            parsed.pomodoroConfig?.shortBreakMinutes ??
            DEFAULT_SETTINGS.pomodoroConfig.breakMinutes,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function useSettings() {
  const settings = ref<Settings>(loadStored());

  // Apply initial volume & sound configs
  notificationService.setVolume(settings.value.volume / 100);
  notificationService.setKeyboardVolume((settings.value.keyboardVolume ?? 80) / 100);
  notificationService.setSoundEffectsConfig(settings.value.soundEffects);

  // Sync initial autostart status with backend
  native
    .isAutostartEnabled()
    .then((enabled) => {
      // If system autostart state is known, align with settings
      if (settings.value.autostartEnabled !== enabled) {
        native.setAutostartEnabled(settings.value.autostartEnabled).catch(() => {});
      }
    })
    .catch(() => {});

  watch(
    settings,
    (val, oldVal) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
        notificationService.setVolume(val.volume / 100);
        notificationService.setKeyboardVolume((val.keyboardVolume ?? 80) / 100);
        notificationService.setSoundEffectsConfig(val.soundEffects);
        if (oldVal && val.autostartEnabled !== oldVal.autostartEnabled) {
          native.setAutostartEnabled(val.autostartEnabled).catch((err) => {
            console.error('Failed to toggle autostart:', err);
          });
        }
        emitEvent(EVENTS.settings, val);
      } catch (e) {
        console.error('Failed to persist settings:', e);
      }
    },
    { deep: true }
  );

  return {
    settings,
  };
}
