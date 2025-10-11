/**
 * FriendGlassCard Component
 * 
 * Glass card component for displaying friends with profile management actions.
 * Features avatar, online status, unread messages, and action buttons for profile, message, block, etc.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProfilePicture from './ProfilePicture';

// =====================================================
// CONSTANTS
// =====================================================

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.42; // ~42% of screen width
const AVATAR_SIZE = 64;

// =====================================================
// ACTION MENU COMPONENT
// =====================================================

const ActionMenu = ({ 
  visible, 
  onClose, 
  onViewProfile,
  onMessage, 
  onUnfriend, 
  onBlock,
  colors, 
  disabled,
  friend
}) => {
  if (!visible) return null;

  const menuItems = [
    {
      id: 'profile',
      icon: 'person-outline',
      label: 'View Profile',
      action: onViewProfile,
      color: colors.text,
    },
    {
      id: 'message',
      icon: 'chatbubble-outline',
      label: 'Message',
      action: onMessage,
      color: colors.text,
    },
    {
      id: 'unfriend',
      icon: 'person-remove-outline',
      label: 'Unfriend',
      action: onUnfriend,
      color: colors.error,
      destructive: true,
    },
    {
      id: 'block',
      icon: 'ban-outline',
      label: 'Block',
      action: onBlock,
      color: colors.error,
      destructive: true,
    },
  ];

  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity 
        style={styles.menuBackdrop} 
        onPress={onClose}
        activeOpacity={1}
      />
      <BlurView intensity={80} style={[styles.menu, { backgroundColor: colors.surface + 'E6' }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
            ]}
            onPress={() => {
              onClose();
              item.action();
            }}
            disabled={disabled}
          >
            <Ionicons name={item.icon} size={20} color={item.color} />
            <Text style={[
              styles.menuItemText, 
              { color: item.color },
              item.destructive && styles.destructiveText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BlurView>
    </View>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const FriendGlassCard = ({
  friend,
  onViewProfile,
  onMessage,
  onUnfriend,
  onBlock,
  loading = false,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleViewProfile = async () => {
    if (disabled || loading) return;
    
    try {
      setActionLoading('profile');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onViewProfile(friend.id);
    } catch (error) {
      console.error('Error viewing profile:', error);
      Alert.alert('Error', 'Unable to view profile. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessage = async () => {
    if (disabled || loading) return;
    
    try {
      setActionLoading('message');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onMessage(friend.id);
    } catch (error) {
      console.error('Error opening message:', error);
      Alert.alert('Error', 'Unable to open message. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfriend = async () => {
    if (disabled || loading) return;
    
    Alert.alert(
      'Unfriend',
      `Are you sure you want to unfriend ${friend.name || friend.full_name || friend.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('unfriend');
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await onUnfriend(friend.id);
            } catch (error) {
              console.error('Error unfriending:', error);
              Alert.alert('Error', 'Unable to unfriend. Please try again.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleBlock = async () => {
    if (disabled || loading) return;
    
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${friend.name || friend.full_name || friend.username}? They won't be able to message you or see your activity.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('block');
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await onBlock(friend.id);
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', 'Unable to block user. Please try again.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = () => {
    if (disabled || loading) return;
    setMenuVisible(true);
  };

  const handleCardPress = () => {
    if (disabled || loading) return;
    handleViewProfile();
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <ProfilePicture
        imageUrl={friend.avatar_url || friend.avatar}
        size={AVATAR_SIZE}
        fallbackText={friend.name?.charAt(0) || friend.full_name?.charAt(0) || friend.username?.charAt(0)}
        borderColor="rgba(255, 255, 255, 0.3)"
        borderWidth={2}
        style={styles.profilePicture}
      />
      
      {/* Online Status Indicator */}
      {friend.status === 'online' && (
        <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
      )}
      
      {/* Unread Messages Badge */}
      {friend.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.unreadBadgeText}>
            {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
          </Text>
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
        {friend.name || friend.full_name || friend.username}
      </Text>

      {friend.status && (
        <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
          {friend.status === 'online' ? 'Active now' : 'Offline'}
        </Text>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.messageButton, { backgroundColor: colors.primary }]}
        onPress={handleMessage}
        disabled={disabled || loading || actionLoading === 'message'}
        activeOpacity={0.8}
      >
        {actionLoading === 'message' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.menuButton, { backgroundColor: colors.surface + '80' }]}
        onPress={handleMenuPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: colors.surface + '60', borderColor: colors.glassBorder },
          disabled && styles.disabledContainer
        ]}
        onPress={handleCardPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {/* Avatar */}
        {renderAvatar()}

        {/* User Info */}
        {renderUserInfo()}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Loading Overlay */}
        {(loading || actionLoading === 'profile') && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.surface + 'CC' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Action Menu */}
      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onViewProfile={handleViewProfile}
        onMessage={handleMessage}
        onUnfriend={handleUnfriend}
        onBlock={handleBlock}
        colors={colors}
        disabled={disabled || loading}
        friend={friend}
      />
    </>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    minHeight: CARD_WIDTH * 1.1,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    position: 'relative',
  },
  disabledContainer: {
    opacity: 0.6,
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profilePicture: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // User Info
  userInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButton: {
    flex: 2,
  },
  menuButton: {
    flex: 1,
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
  
  // Action Menu
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
    transform: [{ translateX: -100 }, { translateY: -80 }],
    width: 200,
    borderRadius: 20,
    paddingVertical: 8,
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
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveText: {
    fontWeight: '700',
  },
});

// =====================================================
// PROP TYPES (for development)
// =====================================================

FriendGlassCard.defaultProps = {
  loading: false,
  disabled: false,
};

export default FriendGlassCard;