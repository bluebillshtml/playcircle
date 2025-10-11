import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { profileService } from '../services/supabase';

export default function LanguagesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile, setProfile } = useAuth();
  const { currentLanguage, changeLanguage, t, isLanguageSupported } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');
  const [region, setRegion] = useState('United States');
  const [showDateFormatModal, setShowDateFormatModal] = useState(false);
  const [showTimeFormatModal, setShowTimeFormatModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedLanguageInfo, setSelectedLanguageInfo] = useState(null);

  const styles = createStyles(colors);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '10/15/2024' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '15/10/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-10-15' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '15.10.2024' },
  ];

  const timeFormats = [
    { value: '12-hour', label: '12-hour', example: '2:30 PM' },
    { value: '24-hour', label: '24-hour', example: '14:30' },
  ];

  const regions = [
    { value: 'United States', label: 'United States', flag: '🇺🇸' },
    { value: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
    { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
    { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
    { value: 'France', label: 'France', flag: '🇫🇷' },
    { value: 'Spain', label: 'Spain', flag: '🇪🇸' },
    { value: 'Italy', label: 'Italy', flag: '🇮🇹' },
  ];

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync with language context
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const loadSettings = async () => {
    try {
      const savedDateFormat = await AsyncStorage.getItem('dateFormat');
      const savedTimeFormat = await AsyncStorage.getItem('timeFormat');
      const savedRegion = await AsyncStorage.getItem('region');

      if (savedDateFormat) setDateFormat(savedDateFormat);
      if (savedTimeFormat) setTimeFormat(savedTimeFormat);
      if (savedRegion) setRegion(savedRegion);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('dateFormat', dateFormat);
      await AsyncStorage.setItem('timeFormat', timeFormat);
      await AsyncStorage.setItem('region', region);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    // Check if language is supported
    if (!isLanguageSupported(languageCode)) {
      Alert.alert(
        t('languages.comingSoon'),
        `${languages.find(lang => lang.code === languageCode)?.name} ${t('languages.inProgress').toLowerCase()}`
      );
      return;
    }

    try {
      // Use the language context to change language
      const success = await changeLanguage(languageCode);
      
      if (success) {
        setSelectedLanguage(languageCode);
        
        // Update profile in Supabase
        const updates = {
          preferred_language: languageCode,
          updated_at: new Date().toISOString(),
        };

        const updatedProfile = await profileService.updateProfile(user.id, updates);
        setProfile(updatedProfile);
        
        // Find the selected language info for the confirmation modal
        const languageInfo = languages.find(lang => lang.code === languageCode);
        setSelectedLanguageInfo(languageInfo);
        
        // Show confirmation modal
        setShowConfirmationModal(true);
        
        // Auto-close after 2.5 seconds
        setTimeout(() => {
          setShowConfirmationModal(false);
        }, 2500);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert(t('common.error'), 'Failed to update language preference');
    }
  };

  const handleDateFormatChange = async (format) => {
    setDateFormat(format);
    setShowDateFormatModal(false);
    await saveSettings();
    Alert.alert('Date Format Updated', `Date format changed to ${format}`);
  };

  const handleTimeFormatChange = async (format) => {
    setTimeFormat(format);
    setShowTimeFormatModal(false);
    await saveSettings();
    Alert.alert('Time Format Updated', `Time format changed to ${format}`);
  };

  const handleRegionChange = async (regionValue) => {
    setRegion(regionValue);
    setShowRegionModal(false);
    await saveSettings();
    Alert.alert('Region Updated', `Region changed to ${regionValue}`);
  };

  const renderLanguage = (language) => {
    const isSupported = isLanguageSupported(language.code);
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageCard,
          !isSupported && styles.languageCardDisabled
        ]}
        onPress={() => handleLanguageChange(language.code)}
        activeOpacity={isSupported ? 0.7 : 1}
        disabled={!isSupported}
      >
        <View style={styles.languageLeft}>
          <Text style={[
            styles.languageFlag,
            !isSupported && styles.languageFlagDisabled
          ]}>
            {language.flag}
          </Text>
          <View style={styles.languageInfo}>
            <View style={styles.languageNameRow}>
              <Text style={[
                styles.languageName,
                !isSupported && styles.languageNameDisabled
              ]}>
                {language.name}
              </Text>
              {!isSupported && (
                <View style={styles.inProgressBadge}>
                  <Text style={styles.inProgressText}>{t('languages.inProgress')}</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.languageNative,
              !isSupported && styles.languageNativeDisabled
            ]}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        {isSelected && isSupported && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedBackground>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('languages.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        {/* Languages List */}
        <View style={styles.languageList}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconGlow}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('languages.availableLanguages')}</Text>
          </View>
          {languages.map(renderLanguage)}
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconGlow}>
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('languages.regionalSettings')}</Text>
          </View>

          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowDateFormatModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="calendar-outline" size={20} color={colors.text} />
                <Text style={styles.settingText}>{t('languages.dateFormat')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{dateFormat}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowTimeFormatModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="time-outline" size={20} color={colors.text} />
                <Text style={styles.settingText}>{t('languages.timeFormat')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{timeFormat}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { marginBottom: 0 }]}
              onPress={() => setShowRegionModal(true)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={20} color={colors.text} />
                <Text style={styles.settingText}>{t('languages.region')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{region}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>

    {/* Date Format Modal */}
    <Modal
      visible={showDateFormatModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDateFormatModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDateFormatModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="calendar-outline" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>{t('languages.dateFormatTitle')}</Text>
              <Text style={styles.modalMessage}>{t('languages.dateFormatMessage')}</Text>
              
              <View style={styles.optionsList}>
                {dateFormats.map((format) => (
                  <TouchableOpacity
                    key={format.value}
                    style={[
                      styles.optionItem,
                      dateFormat === format.value && styles.optionItemSelected
                    ]}
                    onPress={() => handleDateFormatChange(format.value)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{format.label}</Text>
                      <Text style={styles.optionExample}>{format.example}</Text>
                    </View>
                    {dateFormat === format.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Time Format Modal */}
    <Modal
      visible={showTimeFormatModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTimeFormatModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowTimeFormatModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="time-outline" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>{t('languages.timeFormatTitle')}</Text>
              <Text style={styles.modalMessage}>{t('languages.timeFormatMessage')}</Text>
              
              <View style={styles.optionsList}>
                {timeFormats.map((format) => (
                  <TouchableOpacity
                    key={format.value}
                    style={[
                      styles.optionItem,
                      timeFormat === format.value && styles.optionItemSelected
                    ]}
                    onPress={() => handleTimeFormatChange(format.value)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{format.label}</Text>
                      <Text style={styles.optionExample}>{format.example}</Text>
                    </View>
                    {timeFormat === format.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Region Modal */}
    <Modal
      visible={showRegionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRegionModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowRegionModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="location-outline" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>{t('languages.regionTitle')}</Text>
              <Text style={styles.modalMessage}>{t('languages.regionMessage')}</Text>
              
              <View style={styles.optionsList}>
                {regions.map((regionOption) => (
                  <TouchableOpacity
                    key={regionOption.value}
                    style={[
                      styles.optionItem,
                      region === regionOption.value && styles.optionItemSelected
                    ]}
                    onPress={() => handleRegionChange(regionOption.value)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionFlag}>{regionOption.flag}</Text>
                      <Text style={styles.optionLabel}>{regionOption.label}</Text>
                    </View>
                    {region === regionOption.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Language Change Confirmation Modal */}
    <Modal
      visible={showConfirmationModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowConfirmationModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowConfirmationModal(false)}
        />
        <View style={styles.confirmationModalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.confirmationModalCard}>
              <View style={styles.confirmationIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.confirmationTitle}>{t('languages.languageUpdated')}</Text>
              {selectedLanguageInfo && (
                <View style={styles.languageConfirmationInfo}>
                  <Text style={styles.languageFlag}>{selectedLanguageInfo.flag}</Text>
                  <Text style={styles.confirmationMessage}>
                    {t('languages.languageChangedTo', { language: selectedLanguageInfo.name })}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.confirmationButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.confirmationButtonText}>{t('common.gotIt')}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },

  languageList: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  iconGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  languageCardDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.6,
    shadowOpacity: 0.05,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageFlagDisabled: {
    opacity: 0.5,
  },
  languageInfo: {
    gap: 4,
    flex: 1,
  },
  languageNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  languageNameDisabled: {
    color: colors.textSecondary,
  },
  languageNative: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  languageNativeDisabled: {
    opacity: 0.6,
  },
  inProgressBadge: {
    backgroundColor: colors.textSecondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inProgressText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalBlur: {
    borderRadius: 24,
  },
  modalCard: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  optionsList: {
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  optionExample: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  // Confirmation Modal Styles
  confirmationModalContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  confirmationModalCard: {
    padding: 32,
    alignItems: 'center',
  },
  confirmationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  languageConfirmationInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  languageFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 120,
    alignItems: 'center',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
