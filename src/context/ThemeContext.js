import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const ThemeContext = createContext();

const DARK_COLORS = {
  // Primary colors - Using beige as accent
  primary: '#D2C1B6',
  primaryDark: '#C4B0A3',

  // Background colors - Using blue palette
  background: '#1B3C53',
  surface: '#234C6A',
  surfaceLight: '#456882',
  card: '#234C6A',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#D2C1B6',

  // Border colors
  border: '#456882',

  // Status colors
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD43B',

  // Additional colors
  lightGray: '#456882',
  white: '#FFFFFF',

  // Badge colors
  badgeCompetitive: 'rgba(210, 193, 182, 0.2)',
  badgeCompetitiveText: '#D2C1B6',
  badgeCasual: 'rgba(69, 104, 130, 0.3)',
  badgeCasualText: '#D2C1B6',

  // Match result colors
  winBackground: 'rgba(81, 207, 102, 0.15)',
  winText: '#51CF66',
  lossBackground: 'rgba(255, 107, 107, 0.15)',
  lossText: '#FF6B6B',

  // Glass effect colors
  glass: 'rgba(35, 76, 106, 0.95)',
  glassBorder: 'rgba(210, 193, 182, 0.15)',
};

const LIGHT_COLORS = {
  // Primary colors - Using darkest blue as primary
  primary: '#1B3C53',
  primaryDark: '#142D3F',

  // Background colors - Light palette
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#F0EBE8',
  card: '#FFFFFF',

  // Text colors
  text: '#1B3C53',
  textSecondary: '#456882',

  // Border colors
  border: '#E0E0E0',

  // Status colors
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',

  // Additional colors
  lightGray: '#F0EBE8',
  white: '#FFFFFF',

  // Badge colors
  badgeCompetitive: '#FFE5E5',
  badgeCompetitiveText: '#1B3C53',
  badgeCasual: '#E5F0F7',
  badgeCasualText: '#1B3C53',

  // Match result colors
  winBackground: '#E8F5E9',
  winText: '#2E7D32',
  lossBackground: '#FFEBEE',
  lossText: '#C62828',

  // Glass effect colors
  glass: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(27, 60, 83, 0.1)',
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default dark colors if context is not available
    return {
      colors: DARK_COLORS,
      isDarkMode: true,
      toggleTheme: () => {},
      themePreference: 'dark',
      setThemePreference: () => {},
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState('dark'); // 'light', 'dark', or 'system'

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('themePreference').then((value) => {
      if (value) {
        setThemePreferenceState(value);
      }
    });
  }, []);

  const setThemePreference = async (preference) => {
    setThemePreferenceState(preference);
    await AsyncStorage.setItem('themePreference', preference);
  };

  // Determine if dark mode should be active
  const isDarkMode = themePreference === 'system'
    ? systemColorScheme === 'dark'
    : themePreference === 'dark';

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const value = {
    colors,
    isDarkMode,
    themePreference,
    setThemePreference,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};