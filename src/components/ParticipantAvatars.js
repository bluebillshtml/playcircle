import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProfilePicture from './ProfilePicture';

const ParticipantAvatars = ({ 
  participants = [], 
  maxVisible = 3, 
  size = 24,
  showCount = true,
  style 
}) => {
  const { colors } = useTheme();
  
  const visibleParticipants = participants.slice(0, maxVisible);
  const hasMore = participants.length > maxVisible;
  const moreCount = participants.length - maxVisible;

  const styles = createStyles(colors, size);

  if (participants.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarsContainer}>
        {visibleParticipants.map((participant, index) => (
          <View
            key={participant.id || index}
            style={[
              styles.avatarWrapper,
              { zIndex: visibleParticipants.length - index }
            ]}
          >
            <ProfilePicture
              imageUrl={participant.avatar_url}
              size={size - 4}
              fallbackText={participant.name?.charAt(0)}
              borderColor={colors.surface}
              borderWidth={2}
            />
          </View>
        ))}
        
        {hasMore && (
          <View style={[styles.avatar, styles.moreAvatar]}>
            <Text style={styles.moreText}>
              +{moreCount}
            </Text>
          </View>
        )}
      </View>
      
      {showCount && (
        <Text style={styles.countText}>
          {participants.length} {participants.length === 1 ? 'player' : 'players'}
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors, size) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.surfaceLight,
    marginLeft: -size * 0.25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatar: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  moreText: {
    fontSize: size * 0.35,
    fontWeight: '700',
    color: colors.primary,
  },
  countText: {
    fontSize: size * 0.45,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default ParticipantAvatars;