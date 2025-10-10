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
const CHIP_WIDTH = screenWidth * 0.42; // ~42% of screen width
const AVATAR_SIZE = 48;
const SPORT_TAG_HEIGHT = 20;

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
        style={[styles.userName, { color: colors.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {user.full_name || user.username}
      </Text>
      
      {user.username !== user.full_name && (
        <Text 
          style={[styles.userHandle, { color: colors.textSecondary }]}
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
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.actionButtonText, { color: colors.success }]}>
            Friends
          </Text>
        </View>
      );
    }

    if (isRequested) {
      return (
        <View style={[styles.actionButton, styles.requestedButton, { backgroundColor: colors.warning + '20' }]}>
          <Ionicons name="time-outline" size={16} color={colors.warning} />
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
          { backgroundColor: colors.primary },
          (disabled || loading || actionLoading) && styles.disabledButton
        ]}
        onPress={handleAddFriend}
        disabled={disabled || loading || actionLoading}
        activeOpacity={0.8}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <>
            <Ionicons name="person-add" size={16} color={colors.surface} />
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>
              Add Friend
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderOverflowButton = () => (
    <TouchableOpacity
      style={[styles.overflowButton, { backgroundColor: colors.border }]}
      onPress={handleOverflowPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <>
      <BlurView 
        intensity={20} 
        style={[
          styles.container,
          { backgroundColor: colors.surface + 'CC' },
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
      </BlurView>

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
    height: CHIP_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  
  // Mutual Sessions Badge
  mutualBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  mutualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Sport Tags
  sportTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 4,
  },
  sportTag: {
    height: SPORT_TAG_HEIGHT,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
    fontSize: 12,
    fontWeight: '600',
  },
  overflowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
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
    transform: [{ translateX: -80 }, { translateY: -50 }],
    width: 160,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
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