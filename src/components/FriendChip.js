/**
 * FriendChip Component
 * 
 * Horizontal card component for displaying suggested friends with glass effect styling.
 * Features avatar, sport tags, mutual sessions count, and action buttons.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SuggestedFriend } from '../types/friends';

// =====================================================
// CONSTANTS
// =====================================================

const { width: screenWidth } = Dimensions.get('window');
const CHIP_WIDTH = screenWidth * 0.45; // ~45% of screen width
const AVATAR_SIZE = 80;
const SPORT_TAG_HEIGHT = 24;

// =====================================================
// SPORT TAG COMPONENT
// =====================================================

const SportTag = ({ sportId, colors }) => {
  const sportConfig = {
    tennis: { name: 'Tennis', color: '#4CAF50', icon: '🎾' },
    badminton: { name: 'Badminton', color: '#FF9800', icon: '🏸' },
    squash: { name: 'Squash', color: '#2196F3', icon: '🎯' },
    pickleball: { name: 'Pickleball', color: '#9C27B0', icon: '🏓' },
    basketball: { name: 'Basketball', color: '#FF5722', icon: '🏀' },
    volleyball: { name: 'Volleyball', color: '#607D8B', icon: '🏐' },
  };

  const config = sportConfig[sportId] || { 
    name: sportId.charAt(0).toUpperCase() + sportId.slice(1), 
    color: colors.primary, 
    icon: '⚽' 
  };

  return (
    <View style={[styles.sportTag, { backgroundColor: config.color + '20' }]}>
      <Text style={[styles.sportTagText, { color: config.color }]}>
        {config.icon} {config.name}
      </Text>
    </View>
  );
};

// =====================================================
// MUTUAL SESSIONS BADGE
// =====================================================

const MutualSessionsBadge = ({ count, colors }) => {
  if (count <= 0) return null;

  return (
    <View style={[styles.mutualBadge, { backgroundColor: colors.primary }]}>
      <Text style={[styles.mutualBadgeText, { color: colors.surface }]}>
        {count} session{count !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

// =====================================================
// OVERFLOW MENU COMPONENT
// =====================================================

const OverflowMenu = ({ visible, onClose, onMessage, onInvite, colors, disabled, isMessageLoading, isInviteLoading }) => {
  if (!visible) return null;

  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity 
        style={styles.menuBackdrop} 
        onPress={onClose}
        activeOpacity={1}
      />
      <BlurView intensity={80} style={[styles.menu, { backgroundColor: colors.surface + 'E6' }]}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => {
            onClose();
            onMessage();
          }}
          disabled={disabled || isMessageLoading}
        >
          {isMessageLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          )}
          <Text style={[styles.menuItemText, { color: colors.text, opacity: isMessageLoading ? 0.6 : 1 }]}>
            {isMessageLoading ? 'Opening...' : 'Message'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            onClose();
            onInvite();
          }}
          disabled={disabled || isInviteLoading}
        >
          {isInviteLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="person-add-outline" size={20} color={colors.text} />
          )}
          <Text style={[styles.menuItemText, { color: colors.text, opacity: isInviteLoading ? 0.6 : 1 }]}>
            {isInviteLoading ? 'Opening...' : 'Invite to Game'}
          </Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const FriendChip = ({
  user,
  onAddFriend,
  onMessage,
  onInvite,
  loading = false,
  disabled = false,
  isMessageLoading = false,
  isInviteLoading = false,
}) => {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleAddFriend = async () => {
    if (disabled || actionLoading || loading) return;

    try {
      // Haptic feedback for add friend action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setActionLoading(true);
      const success = await onAddFriend(user.id);
      
      if (success) {
        // Haptic feedback could be added here
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = async () => {
    if (disabled || loading || isMessageLoading) return;
    
    // Haptic feedback for message action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMessage(user.id);
  };

  const handleInvite = async () => {
    if (disabled || loading || isInviteLoading) return;
    
    // Haptic feedback for invite action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInvite(user.id);
  };

  const handleOverflowPress = () => {
    if (disabled || loading) return;
    setMenuVisible(true);
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
            // Handle image load error by showing placeholder
          }}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons name="person" size={24} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <Text
        style={styles.userName}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {user.full_name || user.username}
      </Text>

      {user.username !== user.full_name && (
        <Text
          style={styles.userHandle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          @{user.username}
        </Text>
      )}
    </View>
  );

  const renderSportTags = () => {
    if (!user.sport_tags || user.sport_tags.length === 0) return null;

    // Show maximum 2 sport tags to prevent overflow
    const displayTags = user.sport_tags.slice(0, 2);
    const hasMore = user.sport_tags.length > 2;

    return (
      <View style={styles.sportTagsContainer}>
        {displayTags.map((sportId, index) => (
          <SportTag key={`${sportId}-${index}`} sportId={sportId} colors={colors} />
        ))}
        {hasMore && (
          <View style={[styles.sportTag, { backgroundColor: colors.border }]}>
            <Text style={[styles.sportTagText, { color: colors.textSecondary }]}>
              +{user.sport_tags.length - 2}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderActionButton = () => {
    const isRequested = user.friendship_status === 'pending';
    const isFriend = user.friendship_status === 'friends';

    if (isFriend) {
      return (
        <View style={[styles.actionButton, styles.friendButton, { backgroundColor: colors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={[styles.actionButtonText, { color: colors.success }]}>
            Friends
          </Text>
        </View>
      );
    }

    if (isRequested) {
      return (
        <View style={[styles.actionButton, styles.requestedButton, { backgroundColor: colors.warning + '20' }]}>
          <Ionicons name="time-outline" size={18} color={colors.warning} />
          <Text style={[styles.actionButtonText, { color: colors.warning }]}>
            Requested
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.addFriendButton,
          { backgroundColor: '#10B981' },
          (disabled || loading || actionLoading) && styles.disabledButton
        ]}
        onPress={handleAddFriend}
        disabled={disabled || loading || actionLoading}
        activeOpacity={0.8}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color="#065F46" />
        ) : (
          <>
            <Ionicons name="person-add" size={18} color="#065F46" />
            <Text style={styles.actionButtonText}>
              Add Friend
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderOverflowButton = () => (
    <TouchableOpacity
      style={[styles.overflowButton, { backgroundColor: '#10B981' }]}
      onPress={handleOverflowPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Ionicons name="ellipsis-horizontal" size={18} color="#065F46" />
    </TouchableOpacity>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.primary + '40' },
          disabled && styles.disabledContainer
        ]}
      >
        {/* Mutual Sessions Badge */}
        <MutualSessionsBadge count={user.mutual_sessions} colors={colors} />

        {/* Avatar */}
        {renderAvatar()}

        {/* User Info */}
        {renderUserInfo()}

        {/* Sport Tags */}
        {renderSportTags()}

        {/* Spacer to push buttons to bottom */}
        <View style={styles.spacer} />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {renderActionButton()}
          {renderOverflowButton()}
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {/* Overflow Menu */}
      <OverflowMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onMessage={handleMessage}
        onInvite={handleInvite}
        colors={colors}
        disabled={disabled || loading}
        isMessageLoading={isMessageLoading}
        isInviteLoading={isInviteLoading}
      />
    </>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    width: CHIP_WIDTH,
    minHeight: CHIP_WIDTH * 1.25,
    borderRadius: 28,
    padding: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledContainer: {
    opacity: 0.6,
  },

  // Mutual Sessions Badge
  mutualBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mutualBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  // User Info
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userHandle: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },

  // Sport Tags
  sportTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sportTag: {
    height: SPORT_TAG_HEIGHT + 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sportTagText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  addFriendButton: {
    // Primary button styles applied via backgroundColor
  },
  friendButton: {
    // Success state styles applied via backgroundColor
  },
  requestedButton: {
    // Pending state styles applied via backgroundColor
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  overflowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Overflow Menu
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -90 }, { translateY: -60 }],
    width: 180,
    borderRadius: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// =====================================================
// PROP TYPES (for development)
// =====================================================

FriendChip.defaultProps = {
  loading: false,
  disabled: false,
};

export default FriendChip;