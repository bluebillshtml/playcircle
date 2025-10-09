import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DropdownMenu = ({ 
  visible, 
  onClose, 
  options = [], 
  anchorPosition = { x: 0, y: 0 } 
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (option) => {
    onClose();
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  const styles = createStyles(colors, anchorPosition);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.dropdown,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: -8 },
                { translateY: 8 },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id || index}
              style={[
                styles.option,
                index === options.length - 1 && styles.lastOption,
                option.destructive && styles.destructiveOption,
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              {option.icon && (
                <Ionicons 
                  name={option.icon} 
                  size={18} 
                  color={option.destructive ? colors.error : colors.text} 
                  style={styles.optionIcon}
                />
              )}
              <Text 
                style={[
                  styles.optionText, 
                  { color: option.destructive ? colors.error : colors.text }
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (colors, anchorPosition) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: anchorPosition.y,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  destructiveOption: {
    // Additional styling for destructive options if needed
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DropdownMenu;