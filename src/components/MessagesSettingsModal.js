import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const MessagesSettingsModal = ({ visible, onClose, settings, onUpdateSettings }) => {
  const { colors } = useTheme();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showAutoDeleteModal, setShowAutoDeleteModal] = useState(false);

  const handleSettingChange = (key, value) => {
    // Special handling for auto-delete feature
    if (key === 'autoDeleteChats' && value === true) {
      Alert.alert(
        'Enable Auto-Delete?',
        'This will automatically delete messages older than the selected duration. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'destructive',
            onPress: () => {
              const newSettings = { ...localSettings, [key]: value };
              setLocalSettings(newSettings);
              onUpdateSettings(newSettings);
              // Show the duration selection modal
              setShowAutoDeleteModal(true);
            },
          },
        ]
      );
      return;
    }

    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const autoDeleteOptions = [
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '1year', label: '1 Year' },
    { value: 'never', label: 'Never' },
  ];

  const handleDurationChange = (type, duration) => {
    const key = type === 'friend' ? 'friendMessagesDeleteDuration' : 'gameChatsDeleteDuration';
    handleSettingChange(key, duration);
  };

  const getDurationLabel = (duration) => {
    const option = autoDeleteOptions.find(opt => opt.value === duration);
    return option ? option.label : '30 Days';
  };

  const handleAutoDeleteSettingsPress = () => {
    setShowAutoDeleteModal(true);
  };

  const handleClearAllChats = () => {
    Alert.alert(
      'Clear All Chats',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            // Implement clear all chats logic
            Alert.alert('Success', 'All chats have been cleared.');
            onClose();
          },
        },
      ]
    );
  };

  const handleExportChats = () => {
    Alert.alert(
      'Export Chats',
      'Export all your chat history to a file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Implement export logic
            Alert.alert('Success', 'Chat history exported successfully.');
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <BlurView intensity={80} style={styles.modalOverlay} tint="dark">
        <View style={styles.modalDarkOverlay} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Messages Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications for new messages
                  </Text>
                </View>
                <Switch
                  value={localSettings.pushNotifications}
                  onValueChange={(value) => handleSettingChange('pushNotifications', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sound Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Play sound for new messages
                  </Text>
                </View>
                <Switch
                  value={localSettings.soundNotifications}
                  onValueChange={(value) => handleSettingChange('soundNotifications', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate on new messages
                  </Text>
                </View>
                <Switch
                  value={localSettings.vibration}
                  onValueChange={(value) => handleSettingChange('vibration', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>
            </View>

            {/* Privacy Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Read Receipts</Text>
                  <Text style={styles.settingDescription}>
                    Let others know when you've read their messages
                  </Text>
                </View>
                <Switch
                  value={localSettings.readReceipts}
                  onValueChange={(value) => handleSettingChange('readReceipts', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Online Status</Text>
                  <Text style={styles.settingDescription}>
                    Show when you're active to other users
                  </Text>
                </View>
                <Switch
                  value={localSettings.onlineStatus}
                  onValueChange={(value) => handleSettingChange('onlineStatus', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Typing Indicators</Text>
                  <Text style={styles.settingDescription}>
                    Show when you're typing to others
                  </Text>
                </View>
                <Switch
                  value={localSettings.typingIndicators}
                  onValueChange={(value) => handleSettingChange('typingIndicators', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>
            </View>

            {/* Chat Features Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chat Features</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-Save Media</Text>
                  <Text style={styles.settingDescription}>
                    Automatically save photos and videos
                  </Text>
                </View>
                <Switch
                  value={localSettings.autoSaveMedia}
                  onValueChange={(value) => handleSettingChange('autoSaveMedia', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Message Reactions</Text>
                  <Text style={styles.settingDescription}>
                    Enable emoji reactions on messages
                  </Text>
                </View>
                <Switch
                  value={localSettings.messageReactions}
                  onValueChange={(value) => handleSettingChange('messageReactions', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Quick Actions</Text>
                  <Text style={styles.settingDescription}>
                    Show quick action buttons in chats
                  </Text>
                </View>
                <Switch
                  value={localSettings.quickActions}
                  onValueChange={(value) => handleSettingChange('quickActions', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-Delete Messages</Text>
                  <Text style={styles.settingDescription}>
                    Automatically delete old messages after a set time
                  </Text>
                </View>
                <Switch
                  value={localSettings.autoDeleteChats}
                  onValueChange={(value) => handleSettingChange('autoDeleteChats', value)}
                  trackColor={{ false: colors.glassBorder, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.glassBorder}
                />
              </View>

              {localSettings.autoDeleteChats && (
                <TouchableOpacity style={styles.actionItem} onPress={handleAutoDeleteSettingsPress}>
                  <View style={[styles.actionIconContainer, { backgroundColor: colors.warning + '20' }]}>
                    <Ionicons name="time-outline" size={22} color={colors.warning} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionLabel}>Auto-Delete Settings</Text>
                    <Text style={styles.actionDescription}>
                      Configure deletion times for different chat types
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Data & Storage Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data & Storage</Text>
              
              <TouchableOpacity style={styles.actionItem} onPress={handleExportChats}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="download-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>Export Chat History</Text>
                  <Text style={styles.actionDescription}>
                    Download all your messages
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleClearAllChats}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.error + '20' }]}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={[styles.actionLabel, { color: colors.error }]}>Clear All Chats</Text>
                  <Text style={styles.actionDescription}>
                    Delete all chat history permanently
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Bottom Padding */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </BlurView>

      {/* Auto-Delete Settings Sub-Modal */}
      <Modal
        visible={showAutoDeleteModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowAutoDeleteModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.skipModalOverlay}>
          <BlurView intensity={50} style={StyleSheet.absoluteFillObject} tint="dark" />
          <TouchableOpacity
            style={styles.skipModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAutoDeleteModal(false)}
          />
          <View style={styles.skipModalContainer}>
            <BlurView
              intensity={80}
              tint="dark"
              style={styles.skipCardBlur}
            >
              <View style={styles.skipCard}>
                <View style={styles.skipIconContainer}>
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.skipTitle}>Auto-Delete Enabled</Text>
                <Text style={styles.skipMessage}>
                  You can configure deletion times for different chat types in your settings anytime.
                </Text>

                <TouchableOpacity
                  style={styles.skipContinueButton}
                  onPress={() => setShowAutoDeleteModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipContinueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '92%',
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 24,
    backgroundColor: '#3A3A3A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 16,
    letterSpacing: -0.4,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#3A3A3A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Skip Modal Styles (matching onboarding)
  skipModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipModalContainer: {
    width: '85%',
    maxWidth: 380,
  },
  skipCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  skipCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(6, 95, 70, 0.4)',
  },
  skipIconContainer: {
    marginBottom: 20,
  },
  skipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  skipMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  skipContinueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  skipContinueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default MessagesSettingsModal;