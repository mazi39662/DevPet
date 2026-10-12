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
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
