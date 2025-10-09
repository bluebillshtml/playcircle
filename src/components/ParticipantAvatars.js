import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
              styles.avatar,
              { zIndex: visibleParticipants.length - index }
            ]}
          >
            {participant.avatar_url ? (
              <Image
                source={{ uri: participant.avatar_url }}
                style={styles.avatarImage}
                onError={() => {
                  // Could set a fallback state here
                }}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons 
                  name="person" 
                  size={size * 0.6} 
                  color={colors.textSecondary} 
                />
              </View>
            )}
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
  avatar: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.surface,
    marginLeft: -size * 0.25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: size - 4,
    height: size - 4,
    borderRadius: (size - 4) / 2,
  },
  avatarFallback: {
    width: size - 4,
    height: size - 4,
    borderRadius: (size - 4) / 2,
    backgroundColor: colors.surfaceLight,
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