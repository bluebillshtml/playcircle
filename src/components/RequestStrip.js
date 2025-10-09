/**
 * RequestStrip Component
 * 
 * Compact strip component for displaying pending friend requests with inline actions.
 * Features user info and Accept/Decline buttons with haptic feedback.
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
import { FriendRequest } from '../types/friends';
import { formatTimeAgo } from '../utils/friendsTransformers';

// =====================================================
// CONSTANTS
// =====================================================

const AVATAR_SIZE = 32;
const ACTION_BUTTON_SIZE = 36;
const STRIP_HEIGHT = 56;

// =====================================================
// TIME AGO COMPONENT
// =====================================================

const TimeAgoText = ({ createdAt, colors }) => {
  const timeAgo = formatTimeAgo(createdAt);
  
  return (
    <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
      {timeAgo}
    </Text>
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
      case 'accept':
        return {
          backgroundColor: colors.success,
        };
      case 'decline':
        return {
          backgroundColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.border,
        };
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'accept':
      case 'decline':
        return colors.surface;
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
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <Ionicons name={icon} size={18} color={getIconColor()} />
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const RequestStrip = ({
  request,
  onAccept,
  onDecline,
  loading = false,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [actionLoading, setActionLoading] = useState({
    accept: false,
    decline: false,
  });

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleAccept = async () => {
    if (disabled || loading || actionLoading.accept || actionLoading.decline) return;

    try {
      setActionLoading(prev => ({ ...prev, accept: true }));
      
      // Show confirmation for important action
      Alert.alert(
        'Accept Friend Request',
        `Accept friend request from ${request.from_user.full_name || request.from_user.username}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Accept',
            style: 'default',
            onPress: async () => {
              // Haptic feedback for accept action
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              const success = await onAccept(request.id);
              
              if (success) {
                // Success haptic feedback
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, accept: false }));
    }
  };

  const handleDecline = async () => {
    if (disabled || loading || actionLoading.accept || actionLoading.decline) return;

    try {
      setActionLoading(prev => ({ ...prev, decline: true }));
      
      // Show confirmation for destructive action
      Alert.alert(
        'Decline Friend Request',
        `Decline friend request from ${request.from_user.full_name || request.from_user.username}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: async () => {
              // Haptic feedback for decline action
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              
              const success = await onDecline(request.id);
              
              if (success) {
                // Success haptic feedback
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, decline: false }));
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      {request.from_user.avatar_url ? (
        <Image
          source={{ uri: request.from_user.avatar_url }}
          style={styles.avatar}
          onError={() => {
            // Handle image load error gracefully
          }}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="person" size={16} color={colors.textSecondary} />
        </View>
      )}
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
          {request.from_user.full_name || request.from_user.username}
        </Text>
        
        <TimeAgoText createdAt={request.created_at} colors={colors} />
      </View>
      
      <Text 
        style={[styles.requestText, { color: colors.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        wants to be friends
      </Text>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionsContainer}>
      {/* Decline Button */}
      <ActionButton
        icon="close"
        onPress={handleDecline}
        disabled={disabled || loading}
        loading={actionLoading.decline}
        colors={colors}
        variant="decline"
        accessibilityLabel={`Decline friend request from ${request.from_user.full_name || request.from_user.username}`}
      />
      
      {/* Accept Button */}
      <ActionButton
        icon="checkmark"
        onPress={handleAccept}
        disabled={disabled || loading}
        loading={actionLoading.accept}
        colors={colors}
        variant="accept"
        accessibilityLabel={`Accept friend request from ${request.from_user.full_name || request.from_user.username}`}
      />
    </View>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
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
// EMPTY STATE COMPONENT
// =====================================================

export const EmptyRequestsState = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
      <Ionicons 
        name="people-outline" 
        size={24} 
        color={colors.textSecondary} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No pending friend requests
      </Text>
    </View>
  );
};

// =====================================================
// REQUESTS SECTION COMPONENT
// =====================================================

export const RequestsSection = ({ 
  requests, 
  onAccept, 
  onDecline, 
  loading = false,
  disabled = false 
}) => {
  const { colors } = useTheme();

  if (!requests || requests.length === 0) {
    return null; // Don't show section if no requests
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Friend Requests
        </Text>
        <View style={[styles.requestsBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.requestsBadgeText, { color: colors.surface }]}>
            {requests.length}
          </Text>
        </View>
      </View>
      
      <View style={styles.requestsList}>
        {requests.map((request, index) => (
          <RequestStrip
            key={request.id}
            request={request}
            onAccept={onAccept}
            onDecline={onDecline}
            loading={loading}
            disabled={disabled}
          />
        ))}
      </View>
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
    paddingVertical: 8,
    minHeight: STRIP_HEIGHT,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  
  // Avatar
  avatarContainer: {
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
  
  // User Info
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    marginLeft: 8,
  },
  requestText: {
    fontSize: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyIcon: {
    marginRight: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  requestsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestsList: {
    paddingHorizontal: 16,
  },
});

// =====================================================
// PROP TYPES (for development)
// =====================================================

RequestStrip.defaultProps = {
  loading: false,
  disabled: false,
};

RequestsSection.defaultProps = {
  loading: false,
  disabled: false,
};

export default RequestStrip;