import { ref, watch } from 'vue';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { emitEvent } from '../services/native';
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

  watch(
    settings,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
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
