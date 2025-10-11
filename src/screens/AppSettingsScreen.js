import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';

export default function AppSettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, setProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notifications_enabled ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.email_notifications ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    profile?.push_notifications ?? true
  );
  const [soundEnabled, setSoundEnabled] = useState(profile?.sound_enabled ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(
    profile?.vibration_enabled ?? true
  );
  const [locationEnabled, setLocationEnabled] = useState(
    profile?.location_enabled ?? true
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    profile?.analytics_enabled ?? true
  );

  // Update state when profile changes
  useEffect(() => {
    if (profile) {
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setEmailNotifications(profile.email_notifications ?? true);
      setPushNotifications(profile.push_notifications ?? true);
      setSoundEnabled(profile.sound_enabled ?? true);
      setVibrationEnabled(profile.vibration_enabled ?? true);
      setLocationEnabled(profile.location_enabled ?? true);
      setAnalyticsEnabled(profile.analytics_enabled ?? true);
    }
  }, [profile]);

  const styles = createStyles(colors);

  // Auto-save settings to Supabase with debouncing
  useEffect(() => {
    if (profile && user) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [
    notificationsEnabled,
    emailNotifications,
    pushNotifications,
    soundEnabled,
    vibrationEnabled,
    locationEnabled,
    analyticsEnabled,
  ]);

  const handleAutoSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      const updates = {
        notifications_enabled: notificationsEnabled,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        sound_enabled: soundEnabled,
        vibration_enabled: vibrationEnabled,
        location_enabled: locationEnabled,
        analytics_enabled: analyticsEnabled,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving settings:', updates);
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile({ ...profile, ...updatedProfile });
    } catch (error) {
      console.error('Error saving settings:', error);
      // Don't show alert for auto-save failures to avoid interrupting user experience
    } finally {
      setSaving(false);
    }
  };

  // Enhanced toggle handlers with immediate feedback
  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    // If disabling notifications, also disable sub-notifications
    if (!value) {
      setEmailNotifications(false);
      setPushNotifications(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will free up storage space.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Simulate cache clearing
            setTimeout(() => {
              Alert.alert('Success', 'Cache cleared successfully');
            }, 1000);
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setNotificationsEnabled(true);
            setEmailNotifications(true);
            setPushNotifications(true);
            setSoundEnabled(true);
            setVibrationEnabled(true);
            setLocationEnabled(true);
            setAnalyticsEnabled(true);
            Alert.alert('Success', 'Settings reset to default values');
          },
        },
      ]
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.savingIndicator}>
            {saving && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Appearance</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons
                      name={isDarkMode ? 'moon' : 'sunny'}
                      size={20}
                      color={colors.text}
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Dark Mode</Text>
                    <Text style={styles.settingDescription}>
                      Use dark theme throughout the app
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
                
                {/* Permanent In Progress Overlay */}
                <View style={styles.inProgressOverlay}>
                  <View style={styles.inProgressButton}>
                    <Text style={styles.inProgressText}>In Progress</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="notifications" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Enable Notifications</Text>
                    <Text style={styles.settingDescription}>
                      Receive notifications about matches and updates
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, !notificationsEnabled && styles.disabledIcon]}>
                    <Ionicons 
                      name="mail" 
                      size={20} 
                      color={!notificationsEnabled ? colors.textSecondary : colors.text} 
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingText, !notificationsEnabled && styles.disabledText]}>
                      Email Notifications
                    </Text>
                    <Text style={styles.settingDescription}>
                      Receive notifications via email
                    </Text>
                  </View>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                  disabled={!notificationsEnabled}
                />
              </View>

              <View style={[styles.settingItem, styles.lastSettingItem]}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, !notificationsEnabled && styles.disabledIcon]}>
                    <Ionicons 
                      name="phone-portrait" 
                      size={20} 
                      color={!notificationsEnabled ? colors.textSecondary : colors.text} 
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingText, !notificationsEnabled && styles.disabledText]}>
                      Push Notifications
                    </Text>
                    <Text style={styles.settingDescription}>
                      Receive push notifications on your device
                    </Text>
                  </View>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                  disabled={!notificationsEnabled}
                />
              </View>
            </View>
          </View>

          {/* Sound & Haptics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Sound & Haptics</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="volume-high" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Sound Effects</Text>
                    <Text style={styles.settingDescription}>
                      Play sounds for app interactions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={[styles.settingItem, styles.lastSettingItem]}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="phone-portrait" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Vibration</Text>
                    <Text style={styles.settingDescription}>
                      Haptic feedback for interactions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>
            </View>
          </View>

          {/* Privacy & Data */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Privacy & Data</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="location" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Location Services</Text>
                    <Text style={styles.settingDescription}>
                      Allow app to access your location
                    </Text>
                  </View>
                </View>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={[styles.settingItem, styles.lastSettingItem]}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="analytics" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Analytics</Text>
                    <Text style={styles.settingDescription}>
                      Help improve the app by sharing usage data
                    </Text>
                  </View>
                </View>
                <Switch
                  value={analyticsEnabled}
                  onValueChange={setAnalyticsEnabled}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>
            </View>
          </View>

          {/* Advanced */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="settings-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Advanced</Text>
            </View>

            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="trash-outline" size={20} color={colors.text} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingText}>Clear Cache</Text>
                    <Text style={styles.settingDescription}>Free up storage space</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.lastSettingItem]}
                onPress={handleResetSettings}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconContainer, styles.dangerIconContainer]}>
                    <Ionicons name="refresh-outline" size={20} color={colors.error} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingText, { color: colors.error }]}>
                      Reset Settings
                    </Text>
                    <Text style={styles.settingDescription}>
                      Reset all settings to default
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>PlayCircle v1.0.0</Text>
            <Text style={styles.infoSubtext}>© 2025 PlayCircle. All rights reserved.</Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
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
  savingIndicator: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  settingsCard: {
    backgroundColor: colors.glass,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  disabledIcon: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  disabledText: {
    opacity: 0.5,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
  inProgressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    zIndex: 10,
  },
  inProgressButton: {
    backgroundColor: colors.glass,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
});
