import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const ThemeContext = createContext();

const DARK_COLORS = {
  // Primary colors
  primary: '#3DD598',
  primaryDark: '#2BC486',

  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#98989F',

  // Border colors
  border: '#38383A',

  // Status colors
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',

  // Additional colors
  lightGray: '#38383A',
  white: '#FFFFFF',

  // Badge colors
  badgeCompetitive: '#3A2020',
  badgeCasual: '#1A2A3A',

  // Match result colors
  winBackground: '#1E3A1E',
  winText: '#4ADE80',
  lossBackground: '#3A1E1E',
  lossText: '#F87171',
};

const LIGHT_COLORS = {
  // Primary colors
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,

  // Background colors
  background: COLORS.background,
  surface: COLORS.white,
  card: COLORS.white,

  // Text colors
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,

  // Border colors
  border: COLORS.border,

  // Status colors
  error: COLORS.error,
  success: COLORS.success,
  warning: COLORS.warning,

  // Additional colors
  lightGray: COLORS.lightGray,
  white: COLORS.white,

  // Badge colors
  badgeCompetitive: '#FFE5E5',
  badgeCasual: '#E5F5FF',

  // Match result colors
  winBackground: '#E8F5E9',
  winText: '#2E7D32',
  lossBackground: '#FFEBEE',
  lossText: '#C62828',
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