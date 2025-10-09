import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MessageTypeIndicator = ({ 
  messageType = 'text', 
  content = '', 
  size = 'small' 
}) => {
  const { colors } = useTheme();
  
  const getMessageTypeInfo = () => {
    switch (messageType) {
      case 'photo':
        return {
          icon: 'camera',
          color: colors.primary,
          text: '📷 Photo',
          showIcon: true,
        };
      case 'location':
        return {
          icon: 'location',
          color: colors.success,
          text: '📍 Location',
          showIcon: true,
        };
      case 'status':
        const statusEmoji = getStatusEmoji(content);
        return {
          icon: 'information-circle',
          color: colors.warning,
          text: statusEmoji + ' Status',
          showIcon: false, // Use emoji instead
        };
      case 'text':
      default:
        return {
          icon: null,
          color: colors.textSecondary,
          text: content,
          showIcon: false,
        };
    }
  };

  const getStatusEmoji = (content) => {
    if (content.includes('On my way') || content.includes('on my way')) return '🏃‍♂️';
    if (content.includes('Running late') || content.includes('running late')) return '⏰';
    if (content.includes('arrived') || content.includes('Arrived')) return '📍';
    return '💬';
  };

  const typeInfo = getMessageTypeInfo();
  const styles = createStyles(colors, size);

  if (messageType === 'text') {
    return (
      <Text style={styles.textContent} numberOfLines={2}>
        {content}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {typeInfo.showIcon && typeInfo.icon && (
        <Ionicons 
          name={typeInfo.icon} 
          size={styles.iconSize} 
          color={typeInfo.color} 
          style={styles.icon}
        />
      )}
      <Text 
        style={[
          styles.typeText, 
          { color: typeInfo.color }
        ]} 
        numberOfLines={1}
      >
        {typeInfo.text}
      </Text>
    </View>
  );
};

const createStyles = (colors, size) => {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 16 : 12;
  const fontSize = isLarge ? 14 : 12;
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    icon: {
      marginRight: 2,
    },
    iconSize: iconSize,
    typeText: {
      fontSize: fontSize,
      fontWeight: '600',
      flex: 1,
    },
    textContent: {
      fontSize: fontSize,
      color: colors.textSecondary,
      lineHeight: fontSize * 1.2,
    },
  });
};

export default MessageTypeIndicator;