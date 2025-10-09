import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ParticipantStack = ({ 
  participants = [], 
  maxVisible = 3, 
  size = 24,
  showCount = true 
}) => {
  const { colors } = useTheme();
  
  // Limit participants to maxVisible
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(0, participants.length - maxVisible);
  
  const styles = createStyles(colors, size);

  if (participants.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyAvatar}>
          <Ionicons name="people-outline" size={size * 0.5} color={colors.textSecondary} />
        </View>
        {showCount && (
          <Text style={styles.countText}>0</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarStack}>
        {visibleParticipants.map((participant, index) => (
          <View
            key={participant.id || index}
            style={[
              styles.avatarContainer,
              { 
                zIndex: maxVisible - index,
                marginLeft: index > 0 ? -size * 0.3 : 0,
              }
            ]}
          >
            {participant.avatar_url ? (
              <Image
                source={{ uri: participant.avatar_url }}
                style={styles.avatar}
                onError={() => {
                  // Handle image load error gracefully
                  console.log('Failed to load avatar image');
                }}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarInitial}>
                  {getInitial(participant.full_name || participant.username)}
                </Text>
              </View>
            )}
            
            {/* Online indicator for first participant */}
            {index === 0 && participant.is_online && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
        ))}
        
        {/* Show remaining count if there are more participants */}
        {remainingCount > 0 && (
          <View style={[styles.avatarContainer, styles.remainingContainer, { marginLeft: -size * 0.3 }]}>
            <Text style={styles.remainingText}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
      
      {showCount && (
        <Text style={styles.countText}>
          {participants.length}
        </Text>
      )}
    </View>
  );
};

// Helper function to get initial from name
const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const createStyles = (colors, size) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  defaultAvatar: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarInitial: {
    fontSize: size * 0.4,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyAvatar: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  remainingContainer: {
    backgroundColor: colors.textSecondary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontSize: size * 0.3,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: size * 0.3,
    height: size * 0.3,
    borderRadius: size * 0.15,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default ParticipantStack;