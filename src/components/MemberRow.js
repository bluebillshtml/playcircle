/**
 * MemberRow Component
 * 
 * Vertical list item component for displaying recent members with interaction context.
 * Features avatar, user info, interaction details, and action buttons.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { RecentMember } from '../types/friends';
import { formatInteractionContext } from '../utils/friendsTransformers';

// =====================================================
// CONSTANTS
// =====================================================

const AVATAR_SIZE = 40;
const ACTION_BUTTON_SIZE = 32;
const ROW_HEIGHT = 72;

// =====================================================
// ONLINE STATUS INDICATOR
// =====================================================

const OnlineStatusIndicator = ({ isOnline, colors }) => {
  if (!isOnline) return null;

  return (
    <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
  );
};

// =====================================================
// INTERACTION CONTEXT COMPONENT
// =====================================================

const InteractionContext = ({ interaction, colors }) => {
  const getInteractionIcon = () => {
    switch (interaction.type) {
      case 'session':
        return 'tennisball-outline';
      case 'chat':
        return 'chatbubble-outline';
      default:
        return 'time-outline';
    }
  };

  const getInteractionColor = () => {
    switch (interaction.type) {
      case 'session':
        return colors.primary;
      case 'chat':
        return colors.info || colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.interactionContext}>
      <Ionicons 
        name={getInteractionIcon()} 
        size={12} 
        color={getInteractionColor()} 
        style={styles.interactionIcon}
      />
      <Text 
        style={[styles.interactionText, { color: colors.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {formatInteractionContext(interaction)}
      </Text>
    </View>
  );
};

// =====================================================
// ACTION BUTTON COMPONENT
// =====================================================

const ActionButton = ({ 
  icon, 
  onPress, 
  disabled, 
  loading, 
  colors, 
  variant = 'default',
  accessibilityLabel 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'success':
        return {
          backgroundColor: colors.success + '20',
          borderColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '20',
          borderColor: colors.warning,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return colors.surface;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        getButtonStyle(),
        (disabled || loading) && styles.disabledActionButton
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <Ionicons name={icon} size={16} color={getIconColor()} />
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const MemberRow = ({
  user,
  onAddFriend,
  onMessage,
  loading = false,
  disabled = false,
  isMessageLoading = false,
  showSeparator = true,
}) => {
  const { colors } = useTheme();
  const [actionLoading, setActionLoading] = useState({
    addFriend: false,
    message: false,
  });

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleAddFriend = async () => {
    if (disabled || loading || actionLoading.addFriend) return;

    try {
      // Haptic feedback for add friend action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setActionLoading(prev => ({ ...prev, addFriend: true }));
      const success = await onAddFriend(user.id);
      
      if (success) {
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, addFriend: false }));
    }
  };

  const handleMessage = async () => {
    if (disabled || loading || actionLoading.message || isMessageLoading) return;

    try {
      // Haptic feedback for message action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setActionLoading(prev => ({ ...prev, message: true }));
      await onMessage(user.id);
    } catch (error) {
      console.error('Error opening message:', error);
      Alert.alert('Error', 'Failed to open message. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, message: false }));
    }
  };



  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={styles.avatar}
          onError={() => {
            // Handle image load error gracefully
          }}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="person" size={20} color={colors.textSecondary} />
        </View>
      )}
      
      <OnlineStatusIndicator isOnline={user.online_status} colors={colors} />
    </View>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <View style={styles.userNameRow}>
        <Text 
          style={[styles.userName, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user.full_name || user.username}
        </Text>
        
        {user.friendship_status === 'friends' && (
          <View style={[styles.friendBadge, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
          </View>
        )}
      </View>
      
      <InteractionContext interaction={user.last_interaction} colors={colors} />
    </View>
  );

  const renderActionButtons = () => {
    const isFriend = user.friendship_status === 'friends';
    const isPending = user.friendship_status === 'pending';

    return (
      <View style={styles.actionsContainer}>
        {/* Message Button */}
        <ActionButton
          icon="chatbubble-outline"
          onPress={handleMessage}
          disabled={disabled || loading}
          loading={actionLoading.message || isMessageLoading}
          colors={colors}
          variant="default"
          accessibilityLabel={`Message ${user.full_name || user.username}`}
        />
        
        {/* Add Friend Button */}
        {!isFriend && (
          <ActionButton
            icon={isPending ? "time-outline" : "person-add"}
            onPress={isPending ? undefined : handleAddFriend}
            disabled={disabled || loading || isPending}
            loading={actionLoading.addFriend}
            colors={colors}
            variant={isPending ? "warning" : "primary"}
            accessibilityLabel={
              isPending 
                ? `Friend request pending for ${user.full_name || user.username}`
                : `Add ${user.full_name || user.username} as friend`
            }
          />
        )}
      </View>
    );
  };

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        disabled && styles.disabledContainer
      ]}
    >
      {/* Avatar */}
      {renderAvatar()}
      
      {/* User Info */}
      {renderUserInfo()}
      
      {/* Action Buttons */}
      {renderActionButtons()}
      
      {/* Loading Overlay */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.surface + 'CC' }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: ROW_HEIGHT,
    borderRadius: 16,
    marginBottom: 8,
    position: 'relative',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  
  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  // User Info
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  friendBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Interaction Context
  interactionContext: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionIcon: {
    marginRight: 4,
  },
  interactionText: {
    fontSize: 14,
    flex: 1,
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// =====================================================
// PROP TYPES (for development)
// =====================================================

MemberRow.defaultProps = {
  loading: false,
  disabled: false,
};

export default MemberRow;