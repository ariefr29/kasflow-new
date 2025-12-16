import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kasflow_settings';

const defaultSettings = {
  darkMode: false,
  displaySize: 'medium' // 'small' | 'medium' | 'large'
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
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setDisplaySize = (size) => {
    setSettings(prev => ({ ...prev, displaySize: size }));
  };

  return {
    settings,
    updateSetting,
    toggleDarkMode,
    setDisplaySize
  };
}

export default useSettings;
