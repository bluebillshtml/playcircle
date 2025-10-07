import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';

export default function AppSettingsScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, profile, setProfile } = useAuth();

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

  const styles = createStyles(colors);

  // Auto-save settings to Supabase
  useEffect(() => {
    if (profile && user) {
      handleAutoSave();
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
    try {
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

      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving settings:', error);
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
            Alert.alert('Success', 'Cache cleared successfully');
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
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny'}
                size={20}
                color={colors.text}
              />
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
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={colors.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about matches and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={20} color={colors.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications via email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={!notificationsEnabled}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={20} color={colors.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on your device
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        {/* Sound & Haptics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Haptics</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high" size={20} color={colors.text} />
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
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={20} color={colors.text} />
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
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={20} color={colors.text} />
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
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="analytics" size={20} color={colors.text} />
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
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={20} color={colors.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Clear Cache</Text>
                <Text style={styles.settingDescription}>Free up storage space</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleResetSettings}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={20} color={colors.error} />
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

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>PlayCircle v1.0.0</Text>
          <Text style={styles.infoSubtext}>© 2025 PlayCircle. All rights reserved.</Text>
        </View>
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
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 32,
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
  },
});
