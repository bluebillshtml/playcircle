import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPORTS } from '../constants/sports';

const SportContext = createContext();

export const useSport = () => {
  const context = useContext(SportContext);
  if (!context) {
    throw new Error('useSport must be used within a SportProvider');
  }
  return context;
};

export const SportProvider = ({ children }) => {
  const [selectedSport, setSelectedSport] = useState(SPORTS.PADEL);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected sport from storage on app start
  useEffect(() => {
    loadSelectedSport();
  }, []);

  const loadSelectedSport = async () => {
    try {
      const savedSportId = await AsyncStorage.getItem('selectedSport');
      if (savedSportId && SPORTS[savedSportId.toUpperCase()]) {
        setSelectedSport(SPORTS[savedSportId.toUpperCase()]);
      }
    } catch (error) {
      console.error('Error loading selected sport:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeSport = async (sportId) => {
    try {
      const sport = SPORTS[sportId.toUpperCase()];
      if (sport) {
        setSelectedSport(sport);
        await AsyncStorage.setItem('selectedSport', sportId);
      }
    } catch (error) {
      console.error('Error saving selected sport:', error);
    }
  };

  const value = {
    selectedSport,
    changeSport,
    isLoading,
    allSports: Object.values(SPORTS)
  };

  return (
    <SportContext.Provider value={value}>
      {children}
    </SportContext.Provider>
  );
};
