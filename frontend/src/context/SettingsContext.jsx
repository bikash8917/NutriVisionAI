import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { settingsService } from '../services/settingsService';
import { STORAGE_EVENTS } from '../utils/storageEvents';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => settingsService.getSettings());

  useEffect(() => {
    const syncSettings = () => {
      const nextSettings = settingsService.getSettings();
      setSettings(nextSettings);
      document.documentElement.style.colorScheme = 'light';
    };

    window.addEventListener(STORAGE_EVENTS.settings, syncSettings);
    window.addEventListener('storage', syncSettings);
    void settingsService.refreshSettings().then((nextSettings) => {
      setSettings(nextSettings);
      document.documentElement.style.colorScheme = 'light';
    });

    return () => {
      window.removeEventListener(STORAGE_EVENTS.settings, syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      setSettings,
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
