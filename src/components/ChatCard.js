import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getSportIcon, formatTime, getRelativeTime } from '../services/chatUtils';
import ParticipantAvatars from './ParticipantAvatars';
import MessageTypeIndicator from './MessageTypeIndicator';

// Simple fallback constants
const MESSAGE_TYPES = {
  TEXT: 'text',
  LOCATION: 'location',
  STATUS: 'status',
  PHOTO: 'photo',
};

const QUICK_ACTION_CONFIG = {
  'on-my-way': {
    label: 'On my way',
    message: 'On my way! 🏃‍♂️',
  },
  'running-late': {
    label: 'Running late',
    message: 'Running late, be there soon! ⏰',
  },
  'arrived': {
    label: 'Arrived',
    message: 'I\'ve arrived! 📍',
  },
};

const ChatCard = ({ 
  chat, 
  onPress, 
  onLongPress, 
  style, 
  isHappeningSoon = false,
  showParticipants = true,
  showMessageType = true,
  maxParticipants = 3
}) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const unreadBadgeAnim = React.useRef(new Animated.Value(1)).current;
  const unreadBadgeAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    onPress?.(chat.chat_id);
  };

  const handleLongPress = () => {
    onLongPress?.(chat.chat_id);
  };

  // Format time display
  const timeDisplay = chat.session_time ? formatTime(chat.session_time) : '';
  const relativeTime = chat.last_message_at ? getRelativeTime(chat.last_message_at) : '';
  
  // Get sport icon
  const sportIcon = getSportIcon(chat.sport_id);
  
  // Determine if we should show unread badge
  const showUnreadBadge = chat.unread_count > 0;
  
  // Format last message preview with type indicators
  const getMessagePreview = () => {
    if (!chat.last_message_content) {
      return 'No messages yet';
    }

    let preview = chat.last_message_content;
    let icon = null;

    // Add icons for different message types
    if (chat.last_message_type) {
      switch (chat.last_message_type) {
        case MESSAGE_TYPES.PHOTO:
          icon = '📷';
          preview = 'Shared a photo';
          break;
        case MESSAGE_TYPES.LOCATION:
          icon = '📍';
          preview = 'Shared location';
          break;
        case MESSAGE_TYPES.STATUS:
          const statusConfig = QUICK_ACTION_CONFIG[chat.last_message_status];
          if (statusConfig) {
            preview = statusConfig.message;
          }
          break;
        default:
          break;
      }
    }

    // Truncate long messages
    if (preview.length > 45) {
      preview = `${preview.substring(0, 45)}...`;
    }

    return { preview, icon };
  };

  const { preview: lastMessagePreview, icon: messageIcon } = getMessagePreview();

  // Generate mock participant avatars (in real app, this would come from chat.participants)
  const generateParticipantAvatars = () => {
    const participants = [];
    const count = Math.min(chat.member_count || 0, maxParticipants);
    
    for (let i = 0; i < count; i++) {
      participants.push({
        id: `participant_${i}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=participant${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        name: `Player ${i + 1}`,
      });
    }
    
    return participants;
  };

  const participants = showParticipants ? generateParticipantAvatars() : [];
  const hasMoreParticipants = chat.member_count > maxParticipants;

  // Animate unread badge when count changes
  React.useEffect(() => {
    if (showUnreadBadge) {
      Animated.sequence([
        Animated.spring(unreadBadgeAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(unreadBadgeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    }
  }, [chat.unread_count, showUnreadBadge, unreadBadgeAnim]);

  const styles = createStyles(colors, isHappeningSoon);

  return (
    <Animated.View 
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={`Chat with ${chat.session_title}`}
        accessibilityHint="Double tap to open chat"
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <LinearGradient
            colors={isHappeningSoon 
              ? [colors.glass, colors.surfaceLight] 
              : [colors.surface, colors.glass]
            }
            style={styles.gradient}
          >
            <View style={styles.content}>
              {/* Left side - Sport icon and session info */}
              <View style={styles.leftSection}>
                <View style={[styles.sportIconContainer, isHappeningSoon && styles.sportIconContainerSoon]}>
                  <Ionicons 
                    name={sportIcon} 
                    size={24} 
                    color={isHappeningSoon ? colors.primary : colors.textSecondary} 
                  />
                </View>
                
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {chat.session_title}
                  </Text>
                  
                  <View style={styles.sessionDetails}>
                    <Text style={styles.timeText}>
                      {timeDisplay}
                    </Text>
                    {chat.session_duration && (
                      <>
                        <Text style={styles.separator}>•</Text>
                        <Text style={styles.durationText}>
                          {chat.session_duration}min
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Participant Avatars */}
                  {showParticipants && participants.length > 0 && (
                    <ParticipantAvatars
                      participants={participants}
                      maxVisible={maxParticipants}
                      size={20}
                      showCount={true}
                      style={styles.participantsContainer}
                    />
                  )}
                </View>
              </View>

              {/* Right side - Message preview and badges */}
              <View style={styles.rightSection}>
                <View style={styles.messagePreview}>
                  {chat.last_message_user_name && (
                    <Text style={styles.lastMessageUser} numberOfLines={1}>
                      {chat.last_message_user_name}
                    </Text>
                  )}
                  <View style={styles.lastMessageRow}>
                    {showMessageType && chat.last_message_type && chat.last_message_type !== MESSAGE_TYPES.TEXT && (
                      <MessageTypeIndicator
                        messageType={chat.last_message_type}
                        messageStatus={chat.last_message_status}
                        size="emoji"
                      />
                    )}
                    <Text style={styles.lastMessageContent} numberOfLines={2}>
                      {lastMessagePreview}
                    </Text>
                  </View>
                  {relativeTime && (
                    <Text style={styles.relativeTime}>
                      {relativeTime}
                    </Text>
                  )}
                </View>

                {/* Badges */}
                <View style={styles.badges}>
                  {isHappeningSoon && (
                    <View style={styles.happeningSoonBadge}>
                      <Ionicons name="time-outline" size={12} color={colors.primary} />
                      <Text style={styles.happeningSoonText}>Soon</Text>
                    </View>
                  )}
                  
                  {showUnreadBadge && (
                    <Animated.View 
                      style={[
                        styles.unreadBadge,
                        {
                          transform: [{ scale: unreadBadgeAnim }],
                        },
                      ]}
                    >
                    <Animated.View 
                      style={[
                        styles.unreadBadge,
                        {
                          transform: [{ scale: unreadBadgeAnim }],
                        },
                      ]}
                    >
                      <Text style={styles.unreadText}>
                        {chat.unread_count > 99 ? '99+' : chat.unread_count}
                      </Text>
                    </Animated.View>
                  )}
                </View>
              </View>
            </View>

            {/* Status indicators */}
            <View style={styles.statusIndicators}>
              {/* Happening soon indicator line */}
              {isHappeningSoon && (
                <View style={styles.happeningSoonIndicator} />
              )}
              
              {/* Online status indicator */}
              {chat.member_count > 0 && (
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                </View>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors, isHappeningSoon) => StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isHappeningSoon ? 0.15 : 0.08,
    shadowRadius: isHappeningSoon ? 12 : 8,
    elevation: isHappeningSoon ? 6 : 3,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isHappeningSoon ? colors.primary + '30' : colors.glassBorder,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportIconContainerSoon: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: isHappeningSoon ? colors.primary : colors.textSecondary,
  },
  separator: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  memberCountText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  participantsContainer: {
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  messagePreview: {
    alignItems: 'flex-end',
    maxWidth: 120,
    marginBottom: 8,
  },
  lastMessageUser: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },

  lastMessageContent: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 16,
    flex: 1,
  },
  relativeTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  happeningSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  happeningSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  happeningSoonIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});

export default ChatCard;