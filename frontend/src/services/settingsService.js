import api from './api';
import { emitStorageEvent, STORAGE_EVENTS } from '../utils/storageEvents';

export const defaultSettings = {
  theme: 'light',
  units: 'metric',
  notifications: true,
  reminders: true,
};

let settingsCache = { ...defaultSettings };
let settingsLoaded = false;

const mergeSettings = (settings = {}) => ({
  ...defaultSettings,
  ...settings,
  theme: 'light',
});

const syncSettings = (nextSettings) => {
  settingsCache = mergeSettings(nextSettings);
  settingsLoaded = true;
  emitStorageEvent(STORAGE_EVENTS.settings);
  return settingsCache;
};

export const settingsService = {
  async refreshSettings() {
    try {
      const response = await api.get('/settings');
      return syncSettings(response.data);
    } catch {
      settingsLoaded = true;
      return settingsCache;
    }
  },

  getSettings() {
    return mergeSettings(settingsCache);
  },

  async saveSettings(settings) {
    try {
      const response = await api.patch('/settings', { ...settingsCache, ...settings, theme: 'light' });
      return syncSettings(response.data);
    } catch {
      throw new Error('Unable to save settings');
    }
  },

  async resetSettings() {
    try {
      const response = await api.patch('/settings', defaultSettings);
      return syncSettings(response.data);
    } catch {
      throw new Error('Unable to reset settings');
    }
  },

  isLoaded() {
    return settingsLoaded;
  },
};
