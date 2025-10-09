import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ChatSettingsModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    messageNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showTypingIndicator: true,
    showReadReceipts: true,
    allowPhotoSharing: true,
    allowLocationSharing: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    icon, 
    type = 'switch' 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={value ? colors.primary : colors.lightGray}
        />
      )}
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.settingSection}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Settings</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Settings Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SettingSection title="NOTIFICATIONS">
            <SettingItem
              title="All Notifications"
              subtitle="Receive notifications for this chat"
              icon="notifications-outline"
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
            />
            
            <SettingItem
              title="Message Notifications"
              subtitle="Get notified when new messages arrive"
              icon="chatbubble-outline"
              value={settings.messageNotifications && settings.notifications}
              onValueChange={(value) => updateSetting('messageNotifications', value)}
            />
            
            <SettingItem
              title="Sound"
              subtitle="Play sound for notifications"
              icon="volume-high-outline"
              value={settings.soundEnabled && settings.notifications}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
            />
            
            <SettingItem
              title="Vibration"
              subtitle="Vibrate for notifications"
              icon="phone-portrait-outline"
              value={settings.vibrationEnabled && settings.notifications}
              onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            />
          </SettingSection>

          <SettingSection title="PRIVACY">
            <SettingItem
              title="Typing Indicator"
              subtitle="Show when you're typing to others"
              icon="create-outline"
              value={settings.showTypingIndicator}
              onValueChange={(value) => updateSetting('showTypingIndicator', value)}
            />
            
            <SettingItem
              title="Read Receipts"
              subtitle="Show when you've read messages"
              icon="checkmark-done-outline"
              value={settings.showReadReceipts}
              onValueChange={(value) => updateSetting('showReadReceipts', value)}
            />
          </SettingSection>

          <SettingSection title="MEDIA & SHARING">
            <SettingItem
              title="Photo Sharing"
              subtitle="Allow sharing photos in this chat"
              icon="camera-outline"
              value={settings.allowPhotoSharing}
              onValueChange={(value) => updateSetting('allowPhotoSharing', value)}
            />
            
            <SettingItem
              title="Location Sharing"
              subtitle="Allow sharing location in this chat"
              icon="location-outline"
              value={settings.allowLocationSharing}
              onValueChange={(value) => updateSetting('allowLocationSharing', value)}
            />
          </SettingSection>

          {/* Additional Options */}
          <View style={styles.additionalOptions}>
            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                // Handle clear chat history
                onClose();
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.textSecondary }]}>
                Clear Chat History
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                // Handle export chat
                onClose();
              }}
            >
              <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.textSecondary }]}>
                Export Chat
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  settingSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  additionalOptions: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
});

export default ChatSettingsModal;