import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Settings {
  minDaysAhead: number;
  maxDaysAhead: number;
  earliestHour: number;
  latestHour: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (settings: Settings) => Promise<void>;
  loading: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  minDaysAhead: 1,
  maxDaysAhead: 4,
  earliestHour: 8,
  latestHour: 23
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call to your backend
      // For now, let's simulate by using localStorage
      const storedSettings = localStorage.getItem('settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('settings', JSON.stringify(newSettings));
      
      // In a real app, this would be an API call to your backend
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};