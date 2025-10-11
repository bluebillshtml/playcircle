import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SettingsBottomSheet = ({ 
  visible, 
  onClose, 
  privacySettings = {}, 
  onUpdateSettings 
}) => {
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Local state for settings
  const [settings, setSettings] = useState({
    friendRequestPermission: 'everyone', // 'everyone', 'friends_of_friends', 'no_one'
    showOnlineStatus: true,
    ...privacySettings
  });

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const updateSetting = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
    
    // Immediately persist the change
    if (onUpdateSettings) {
      onUpdateSettings(newSettings);
    }
  };

  const getFriendRequestPermissionText = (permission) => {
    switch (permission) {
      case 'everyone':
        return 'Everyone';
      case 'friends_of_friends':
        return 'Friends of friends';
      case 'no_one':
        return 'No one';
      default:
        return 'Everyone';
    }
  };

  const getFriendRequestPermissionSubtext = (permission) => {
    switch (permission) {
      case 'everyone':
        return 'Anyone can send you friend requests';
      case 'friends_of_friends':
        return 'Only friends of your friends can send requests';
      case 'no_one':
        return 'No one can send you friend requests';
      default:
        return 'Anyone can send you friend requests';
    }
  };

  const handleFriendRequestPermissionPress = () => {
    const options = ['everyone', 'friends_of_friends', 'no_one'];
    const currentIndex = options.indexOf(settings.friendRequestPermission);
    const nextIndex = (currentIndex + 1) % options.length;
    updateSetting('friendRequestPermission', options[nextIndex]);
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    icon, 
    type = 'switch',
    onPress 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={type === 'switch' ? 1 : 0.7}
      disabled={type === 'switch'}
    >
      <View style={styles.settingInfo}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
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
          trackColor={{ false: colors.glassBorder, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.glassBorder}
        />
      )}
      
      {type === 'selector' && (
        <View style={styles.selectorValue}>
          <Text style={[styles.selectorText, { color: colors.primary }]}>
            {value}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.bottomSheet, 
                { 
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: colors.background 
                }
              ]}
            >
              {/* Handle */}
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Privacy Settings
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Settings Content */}
              <View style={styles.content}>
                <View style={styles.settingSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    FRIEND REQUESTS
                  </Text>
                  <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
                    <SettingItem
                      title="Who can send requests"
                      subtitle={getFriendRequestPermissionSubtext(settings.friendRequestPermission)}
                      icon="person-add-outline"
                      type="selector"
                      value={getFriendRequestPermissionText(settings.friendRequestPermission)}
                      onPress={handleFriendRequestPermissionPress}
                    />
                  </View>
                </View>

                <View style={styles.settingSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    ONLINE STATUS
                  </Text>
                  <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
                    <SettingItem
                      title="Show online status"
                      subtitle="Let others see when you're online"
                      icon="radio-outline"
                      value={settings.showOnlineStatus}
                      onValueChange={(value) => updateSetting('showOnlineStatus', value)}
                    />
                  </View>
                </View>

                {/* Info Text */}
                <View style={styles.infoSection}>
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    These settings control who can interact with you and what information is visible to others.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    paddingTop: 16,
  },
  settingSection: {
    marginBottom: 24,
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
    minHeight: 60,
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
    lineHeight: 18,
  },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default SettingsBottomSheet;