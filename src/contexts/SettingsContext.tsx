import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageTone } from '@/types/debate';

interface AppSettings {
  darkMode: boolean;
  enableTimer: boolean;
  enableCounterArguments: boolean;
  defaultTone: LanguageTone;
}

interface SettingsContextType {
  settings: AppSettings;
  setDarkMode: (enabled: boolean) => void;
  setEnableTimer: (enabled: boolean) => void;
  setEnableCounterArguments: (enabled: boolean) => void;
  setDefaultTone: (tone: LanguageTone) => void;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  enableTimer: false,
  enableCounterArguments: false,
  defaultTone: 'adult'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('debate-app-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('debate-app-settings', JSON.stringify(settings));
    
    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const setDarkMode = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: enabled }));
  };

  const setEnableTimer = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enableTimer: enabled }));
  };

  const setEnableCounterArguments = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enableCounterArguments: enabled }));
  };

  const setDefaultTone = (tone: LanguageTone) => {
    setSettings(prev => ({ ...prev, defaultTone: tone }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      setDarkMode,
      setEnableTimer,
      setEnableCounterArguments,
      setDefaultTone
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
