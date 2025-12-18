import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kasflow_settings';

const defaultSettings = {
  darkMode: false,
  displaySize: 'medium', // 'small' | 'medium' | 'large'
  activeFundId: null // null = "Semua Dana" (global view)
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply display size
    document.documentElement.setAttribute('data-scale', settings.displaySize);
  }, [settings.darkMode, settings.displaySize, settings.activeFundId]); // Include activeFundId to persist fund selection

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setDisplaySize = (size) => {
    setSettings(prev => ({ ...prev, displaySize: size }));
  };

  const setActiveFundId = (fundId) => {
    setSettings(prev => ({ ...prev, activeFundId: fundId }));
  };

  return {
    settings,
    updateSetting,
    toggleDarkMode,
    setDisplaySize,
    activeFundId: settings.activeFundId,
    setActiveFundId
  };
}

export default useSettings;
