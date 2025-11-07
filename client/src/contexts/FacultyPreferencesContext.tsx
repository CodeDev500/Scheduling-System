import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface FacultyPreferencesContextType {
  preferences: TimeSlot[];
  setPreferences: (preferences: TimeSlot[]) => void;
  addPreference: (preference: TimeSlot) => void;
  removePreference: (day: string, startTime: string, endTime: string) => void;
  clearPreferences: () => void;
  isPreferredTime: (day: string, startTime: string, endTime: string) => boolean;
  getPreferencesForDay: (day: string) => TimeSlot[];
  hasPreferences: boolean;
}

const FacultyPreferencesContext = createContext<FacultyPreferencesContextType | undefined>(undefined);

interface FacultyPreferencesProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'faculty-preferences';

export function FacultyPreferencesProvider({ children }: FacultyPreferencesProviderProps) {
  const [preferences, setPreferencesState] = useState<TimeSlot[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPreferences = JSON.parse(stored) as TimeSlot[];
        setPreferencesState(parsedPreferences);
      }
    } catch (error) {
      console.error('Failed to load faculty preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save faculty preferences:', error);
    }
  }, [preferences]);

  const setPreferences = (newPreferences: TimeSlot[]) => {
    setPreferencesState(newPreferences);
  };

  const addPreference = (preference: TimeSlot) => {
    setPreferencesState(prev => {
      // Check if preference already exists
      const exists = prev.some(
        p => p.day === preference.day && 
             p.startTime === preference.startTime && 
             p.endTime === preference.endTime
      );
      
      if (exists) {
        return prev;
      }
      
      return [...prev, preference];
    });
  };

  const removePreference = (day: string, startTime: string, endTime: string) => {
    setPreferencesState(prev => 
      prev.filter(
        p => !(p.day === day && p.startTime === startTime && p.endTime === endTime)
      )
    );
  };

  const clearPreferences = () => {
    setPreferencesState([]);
  };

  const isPreferredTime = (day: string, startTime: string, endTime: string): boolean => {
    return preferences.some(
      p => p.day === day && p.startTime === startTime && p.endTime === endTime
    );
  };

  const getPreferencesForDay = (day: string): TimeSlot[] => {
    return preferences.filter(p => p.day === day);
  };

  const hasPreferences = preferences.length > 0;

  const value: FacultyPreferencesContextType = {
    preferences,
    setPreferences,
    addPreference,
    removePreference,
    clearPreferences,
    isPreferredTime,
    getPreferencesForDay,
    hasPreferences,
  };

  return (
    <FacultyPreferencesContext.Provider value={value}>
      {children}
    </FacultyPreferencesContext.Provider>
  );
}

export function useFacultyPreferences(): FacultyPreferencesContextType {
  const context = useContext(FacultyPreferencesContext);
  if (context === undefined) {
    throw new Error('useFacultyPreferences must be used within a FacultyPreferencesProvider');
  }
  return context;
}