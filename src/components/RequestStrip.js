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
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FriendRequest } from '../types/friends';
import { formatTimeAgo } from '../utils/friendsTransformers';

// =====================================================
// CONSTANTS
// =====================================================

const AVATAR_SIZE = 48;
const ACTION_BUTTON_SIZE = 44;
const STRIP_HEIGHT = 80;

// =====================================================
// TIME AGO COMPONENT
// =====================================================

const TimeAgoText = ({ createdAt, colors }) => {
  const timeAgo = formatTimeAgo(createdAt);

  return (
    <Text style={styles.timeAgo}>
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
          backgroundColor: '#10B981',
        };
      case 'decline':
        return {
          backgroundColor: '#EF4444',
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
        return '#065F46';
      case 'decline':
        return '#7F1D1D';
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    console.log('ActionButton: onPress triggered for variant:', variant);
    console.log('ActionButton: disabled:', disabled, 'loading:', loading);
    if (onPress) {
      onPress();
    } else {
      console.log('ActionButton: No onPress handler provided!');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        getButtonStyle(),
        (disabled || loading) && styles.disabledActionButton
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <Ionicons name={icon} size={20} color={getIconColor()} />
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
    console.log('RequestStrip: handleAccept CALLED - START');
    console.log('RequestStrip: State check:', { disabled, loading, actionLoading });
    
    if (disabled || loading || actionLoading.accept || actionLoading.decline) {
      console.log('RequestStrip: handleAccept BLOCKED by state check');
      return;
    }

    // For web, use window.confirm; for native, use Alert.alert
    if (Platform.OS === 'web') {
      console.log('RequestStrip: Using window.confirm for web');
      const confirmed = window.confirm(`Accept friend request from ${request.from_user.full_name || request.from_user.username}?`);
      
      if (!confirmed) {
        console.log('RequestStrip: User cancelled accept');
        return;
      }

      console.log('RequestStrip: User confirmed accept');
      try {
        setActionLoading(prev => ({ ...prev, accept: true }));
        
        console.log('RequestStrip: Calling onAccept with request.id:', request.id);
        const success = await onAccept(request.id);
        console.log('RequestStrip: onAccept returned:', success);
        
        if (!success) {
          window.alert('Failed to accept friend request. Please try again.');
        }
      } catch (error) {
        console.error('RequestStrip: Error accepting friend request:', error);
        window.alert('Failed to accept friend request. Please try again.');
      } finally {
        setActionLoading(prev => ({ ...prev, accept: false }));
      }
    } else {
      console.log('RequestStrip: Showing Alert for accept');
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
              try {
                setActionLoading(prev => ({ ...prev, accept: true }));
                
                // Haptic feedback for accept action
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                
                console.log('RequestStrip: Calling onAccept with request.id:', request.id);
                const success = await onAccept(request.id);
                console.log('RequestStrip: onAccept returned:', success);
                
                if (success) {
                  // Success haptic feedback
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error) {
                console.error('RequestStrip: Error accepting friend request:', error);
                Alert.alert('Error', 'Failed to accept friend request. Please try again.');
              } finally {
                setActionLoading(prev => ({ ...prev, accept: false }));
              }
            },
          },
        ]
      );
    }
  };

  const handleDecline = async () => {
    console.log('RequestStrip: handleDecline CALLED - START');
    console.log('RequestStrip: State check:', { disabled, loading, actionLoading });
    
    if (disabled || loading || actionLoading.accept || actionLoading.decline) {
      console.log('RequestStrip: handleDecline BLOCKED by state check');
      return;
    }

    // For web, use window.confirm; for native, use Alert.alert
    if (Platform.OS === 'web') {
      console.log('RequestStrip: Using window.confirm for web');
      const confirmed = window.confirm(`Decline friend request from ${request.from_user.full_name || request.from_user.username}?`);
      
      if (!confirmed) {
        console.log('RequestStrip: User cancelled decline');
        return;
      }

      console.log('RequestStrip: User confirmed decline');
      try {
        setActionLoading(prev => ({ ...prev, decline: true }));
        
        console.log('RequestStrip: Calling onDecline with request.id:', request.id);
        const success = await onDecline(request.id);
        console.log('RequestStrip: onDecline returned:', success);
        
        if (!success) {
          window.alert('Failed to decline friend request. Please try again.');
        }
      } catch (error) {
        console.error('RequestStrip: Error declining friend request:', error);
        window.alert('Failed to decline friend request. Please try again.');
      } finally {
        setActionLoading(prev => ({ ...prev, decline: false }));
      }
    } else {
      console.log('RequestStrip: Showing Alert for decline');
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
              try {
                setActionLoading(prev => ({ ...prev, decline: true }));
                
                // Haptic feedback for decline action
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                
                console.log('RequestStrip: Calling onDecline with request.id:', request.id);
                const success = await onDecline(request.id);
                console.log('RequestStrip: onDecline returned:', success);
                
                if (success) {
                  // Success haptic feedback
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              } catch (error) {
                console.error('RequestStrip: Error declining friend request:', error);
                Alert.alert('Error', 'Failed to decline friend request. Please try again.');
              } finally {
                setActionLoading(prev => ({ ...prev, decline: false }));
              }
            },
          },
        ]
      );
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
          style={styles.userName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {request.from_user.full_name || request.from_user.username}
        </Text>

        <TimeAgoText createdAt={request.created_at} colors={colors} />
      </View>

      <Text
        style={styles.requestText}
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
          backgroundColor: colors.primary + '40',
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    minHeight: STRIP_HEIGHT + 8,
    borderRadius: 24,
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledContainer: {
    opacity: 0.6,
  },

  // Avatar
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // User Info
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeAgo: {
    fontSize: 13,
    marginLeft: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  requestText: {
    fontSize: 15,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE + 4,
    height: ACTION_BUTTON_SIZE + 4,
    borderRadius: (ACTION_BUTTON_SIZE + 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyIcon: {
    marginRight: 12,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  
  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  requestsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  requestsBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  requestsList: {
    paddingHorizontal: 24,
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