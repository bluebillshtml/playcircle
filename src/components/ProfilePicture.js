import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

/**
 * ProfilePicture Component
 * 
 * A centralized component for displaying profile pictures consistently across the app.
 * Handles fallbacks, loading states, and different sizes.
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - URL of the profile picture
 * @param {number} props.size - Size of the profile picture (default: 40)
 * @param {string} props.fallbackText - Text to show when no image (usually first letter of name)
 * @param {string} props.fallbackColor - Background color for fallback (optional)
 * @param {boolean} props.showBorder - Whether to show border (default: true)
 * @param {Object} props.style - Additional styles
 * @param {string} props.borderColor - Custom border color
 * @param {number} props.borderWidth - Custom border width
 * @param {boolean} props.useCurrentUser - Use current user's profile picture (default: false)
 */
const ProfilePicture = ({
  imageUrl,
  size = 40,
  fallbackText,
  fallbackColor,
  showBorder = true,
  style,
  borderColor,
  borderWidth = 2,
  useCurrentUser = false,
}) => {
  const { colors } = useTheme();
  const { profile } = useAuth();

  // Use current user's profile picture if requested
  const finalImageUrl = useCurrentUser ? profile?.profile_picture_url : imageUrl;
  
  // Generate fallback text from current user if needed
  const finalFallbackText = useCurrentUser 
    ? (profile?.first_name?.charAt(0) || profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '?')
    : fallbackText;

  const styles = createStyles(colors, size, showBorder, borderColor, borderWidth, fallbackColor);

  return (
    <View style={[styles.container, style]}>
      {finalImageUrl ? (
        <Image
          source={{ uri: finalImageUrl }}
          style={styles.image}
          onError={() => {
            // Could add error handling here
            console.log('Failed to load profile picture:', finalImageUrl);
          }}
        />
      ) : (
        <View style={styles.fallback}>
          {finalFallbackText ? (
            <Text style={styles.fallbackText}>
              {finalFallbackText.toUpperCase()}
            </Text>
          ) : (
            <Ionicons 
              name="person" 
              size={size * 0.6} 
              color={colors.textSecondary} 
            />
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors, size, showBorder, borderColor, borderWidth, fallbackColor) => StyleSheet.create({
  container: {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    backgroundColor: fallbackColor || colors.surface,
    ...(showBorder && {
      borderWidth: borderWidth,
      borderColor: borderColor || colors.glassBorder,
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: size / 2,
  },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: fallbackColor || colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: size / 2,
  },
  fallbackText: {
    fontSize: size * 0.4,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});

export default ProfilePicture;