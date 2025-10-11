import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../translations';

// Safely import expo-localization with fallback
let getLocales;
try {
  const localization = require('expo-localization');
  getLocales = localization.getLocales;
} catch (error) {
  console.warn('expo-localization not available, using fallback');
  getLocales = () => [{ languageCode: 'en' }];
}

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Supported languages (fully implemented)
  const supportedLanguages = ['en'];

  // Auto-detect device language on first launch
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // Check if user has previously selected a language
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      
      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      } else {
        // Auto-detect from device locale
        try {
          const deviceLocales = getLocales();
          const deviceLanguage = deviceLocales?.[0]?.languageCode;
          
          if (deviceLanguage && supportedLanguages.includes(deviceLanguage)) {
            setCurrentLanguage(deviceLanguage);
            // Save the auto-detected language
            await AsyncStorage.setItem('selectedLanguage', deviceLanguage);
          } else {
            // Default to English if device language not supported
            setCurrentLanguage('en');
            await AsyncStorage.setItem('selectedLanguage', 'en');
          }
        } catch (localeError) {
          console.warn('Error detecting device locale:', localeError);
          // Fallback to English
          setCurrentLanguage('en');
          await AsyncStorage.setItem('selectedLanguage', 'en');
        }
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      setCurrentLanguage('en');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    if (!supportedLanguages.includes(languageCode)) {
      console.warn(`Language ${languageCode} is not supported yet`);
      return false;
    }

    try {
      setCurrentLanguage(languageCode);
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    if (!translation) {
      // Fallback to English if translation not found
      translation = translations.en;
      for (const k of keys) {
        translation = translation?.[k];
      }
    }
    
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Replace parameters in translation
    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(`{{${param}}}`, params[param]);
    });
    
    return result;
  };

  const isLanguageSupported = (languageCode) => {
    return supportedLanguages.includes(languageCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isLanguageSupported,
    supportedLanguages,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};