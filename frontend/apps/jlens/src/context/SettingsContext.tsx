import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface SettingsData {
  models: any[];
  system_workspaces: any[];
  current_user: {
    email: string;
    name: string;
    access: {
      models: string[];
      workspaces: any[];
    };
  };
}

interface SettingsContextType {
  settingsData: SettingsData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettingsData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-access/settings-data`, {
        withCredentials: true
      });
      setSettingsData(response.data);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed useEffect - only fetch when explicitly called

  return (
    <SettingsContext.Provider value={{ settingsData, isLoading, refetch: fetchSettingsData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
