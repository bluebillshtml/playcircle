import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ScreenHeader = ({ 
  title, 
  rightButton = null, 
  onRightButtonPress = null,
  rightButtonIcon = null,
  showRightButton = false,
  style = {},
  titleStyle = {}
}) => {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={[styles.header, style]}>
      <Text style={[styles.headerTitle, titleStyle]}>
        {title}
      </Text>
      
      {showRightButton && (
        <TouchableOpacity 
          style={styles.rightButton}
          onPress={onRightButtonPress}
        >
          {rightButton || (
            <Ionicons 
              name={rightButtonIcon || "ellipsis-horizontal"} 
              size={24} 
              color={colors.text} 
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 140 : (StatusBar.currentHeight ? StatusBar.currentHeight + 100 : 140),
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  rightButton: {
    padding: 8,
    marginRight: -8, // Compensate for padding to align with screen edge
  },
});

export default ScreenHeader;