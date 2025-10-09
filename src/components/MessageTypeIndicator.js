import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
// Simple fallback constants
const MESSAGE_TYPES = {
  TEXT: 'text',
  LOCATION: 'location',
  STATUS: 'status',
  PHOTO: 'photo',
};

const QUICK_ACTION_CONFIG = {
  'on-my-way': {
    label: 'On my way',
    icon: 'car-outline',
    message: 'On my way! 🏃‍♂️',
    color: '#10B981',
  },
  'running-late': {
    label: 'Running late',
    icon: 'time-outline',
    message: 'Running late, be there soon! ⏰',
    color: '#F59E0B',
  },
  'arrived': {
    label: 'Arrived',
    icon: 'checkmark-circle-outline',
    message: 'I\'ve arrived! 📍',
    color: '#059669',
  },
};

const MessageTypeIndicator = ({ 
  messageType, 
  messageStatus, 
  size = 'small',
  showText = false 
}) => {
  const { colors } = useTheme();

  const getIndicatorConfig = () => {
    switch (messageType) {
      case MESSAGE_TYPES.PHOTO:
        return {
          icon: 'camera',
          color: colors.primary,
          text: 'Photo',
          emoji: '📷'
        };
      case MESSAGE_TYPES.LOCATION:
        return {
          icon: 'location',
          color: colors.success,
          text: 'Location',
          emoji: '📍'
        };
      case MESSAGE_TYPES.STATUS:
        const statusConfig = QUICK_ACTION_CONFIG[messageStatus];
        return {
          icon: statusConfig?.icon || 'information-circle',
          color: statusConfig?.color || colors.primary,
          text: statusConfig?.label || 'Status',
          emoji: getStatusEmoji(messageStatus)
        };
      default:
        return null;
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'on-my-way':
        return '🏃‍♂️';
      case 'running-late':
        return '⏰';
      case 'arrived':
        return '📍';
      default:
        return '💬';
    }
  };

  const config = getIndicatorConfig();
  
  if (!config) {
    return null;
  }

  const styles = createStyles(colors, size);
  const isLarge = size === 'large';
  const iconSize = isLarge ? 16 : 12;

  if (size === 'emoji') {
    return (
      <Text style={styles.emoji}>
        {config.emoji}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
        <Ionicons 
          name={config.icon} 
          size={iconSize} 
          color={config.color} 
        />
      </View>
      {showText && (
        <Text style={[styles.text, { color: config.color }]}>
          {config.text}
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors, size) => {
  if (!colors || !size) {
    // Return default styles if parameters are missing
    return StyleSheet.create({
      container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
      iconContainer: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
      text: { fontSize: 10, fontWeight: '600' },
      emoji: { fontSize: 12 },
    });
  }

  const isLarge = size === 'large';
  const containerSize = isLarge ? 24 : 18;
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconContainer: {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: isLarge ? 12 : 10,
      fontWeight: '600',
    },
    emoji: {
      fontSize: size === 'large' ? 16 : 12,
    },
  });
};

export default MessageTypeIndicator;