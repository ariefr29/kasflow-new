import { useState, useEffect, useCallback } from 'react';

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

  // Save to localStorage - separate effect that watches entire settings object
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply dark mode - only when darkMode changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply display size - only when displaySize changes
  useEffect(() => {
    document.documentElement.setAttribute('data-scale', settings.displaySize);
  }, [settings.displaySize]);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setDisplaySize = useCallback((size) => {
    setSettings(prev => ({ ...prev, displaySize: size }));
  }, []);

  const setActiveFundId = useCallback((fundId) => {
    setSettings(prev => ({ ...prev, activeFundId: fundId }));
  }, []);

  return {
    settings,
    toggleDarkMode,
    setDisplaySize,
    activeFundId: settings.activeFundId,
    setActiveFundId
  };
}

export default useSettings;
