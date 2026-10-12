export interface Settings {
  monitoringEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  companionMini: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  monitoringEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
  companionMini: false,
};
