import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import MessageTypeIndicator from './MessageTypeIndicator';
import ProfilePicture from './ProfilePicture';

const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onRetry,
  onLongPress
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    // Gentle bubble pop animation on message appearance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    return date.toLocaleDateString();
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'photo':
        return (
          <View style={styles.photoContainer}>
            {message.metadata?.photo?.photo_url && (
              <Image 
                source={{ uri: message.metadata.photo.photo_url }}
                style={styles.photoMessage}
                resizeMode="cover"
              />
            )}
            {message.content && (
              <Text style={[styles.messageText, { color: colors.text }]}>
                {message.content}
              </Text>
            )}
          </View>
        );
      
      case 'location':
        return (
          <View style={styles.locationContainer}>
            <View style={styles.locationHeader}>
              <Ionicons 
                name="location" 
                size={16} 
                color={colors.primary} 
              />
              <Text style={[styles.locationTitle, { color: colors.text }]}>
                Location Shared
              </Text>
            </View>
            {message.metadata?.location?.address && (
              <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                {message.metadata.location.address}
              </Text>
            )}
          </View>
        );
      
      case 'status':
        return (
          <View style={styles.statusContainer}>
            <MessageTypeIndicator
              messageType={message.message_type}
              messageStatus={message.metadata?.status?.status}
              size="large"
              showText={false}
            />
            <Text style={[styles.messageText, { color: colors.text }]}>
              {message.content}
            </Text>
          </View>
        );
      
      default:
        return (
          <Text style={[styles.messageText, { color: colors.text }]}>
            {message.content}
          </Text>
        );
    }
  };

  const renderDeliveryStatus = () => {
    if (!isOwn || !message.delivery_status) return null;

    const whiteColor = '#FFFFFF';
    const greenColor = '#25D366'; // WhatsApp green

    switch (message.delivery_status) {
      case 'sending':
        // Single white checkmark
        return (
          <View style={styles.deliveryStatus}>
            <Ionicons name="checkmark" size={14} color={whiteColor} />
          </View>
        );

      case 'sent':
        // Double white checkmark
        return (
          <View style={styles.deliveryStatus}>
            <View style={styles.doubleCheck}>
              <Ionicons name="checkmark" size={14} color={whiteColor} style={styles.checkmark1} />
              <Ionicons name="checkmark" size={14} color={whiteColor} style={styles.checkmark2} />
            </View>
          </View>
        );

      case 'read':
        // Double green checkmark
        return (
          <View style={styles.deliveryStatus}>
            <View style={styles.doubleCheck}>
              <Ionicons name="checkmark" size={14} color={greenColor} style={styles.checkmark1} />
              <Ionicons name="checkmark" size={14} color={greenColor} style={styles.checkmark2} />
            </View>
          </View>
        );

      case 'failed':
        return (
          <TouchableOpacity
            onPress={() => onRetry?.(message)}
            style={styles.deliveryStatus}
          >
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const handlePressIn = (event) => {
    longPressTimer.current = setTimeout(() => {
      // Get the touch position for the reaction overlay
      const { pageX, pageY } = event.nativeEvent;
      onLongPress?.(message, { x: pageX, y: pageY });
    }, 500); // 0.5 seconds
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    return (
      <View style={styles.reactionsContainer}>
        {message.reactions.map((reaction, index) => (
          <View key={`${reaction.emoji}-${index}`} style={styles.reactionBubble}>
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const styles = createStyles(colors, isOwn);

  return (
    <Animated.View 
      ref={messageRef}
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.messageRow}>
        {/* Avatar for other users */}
        {!isOwn && showAvatar && (
          <View style={styles.avatarContainer}>
            <ProfilePicture
              imageUrl={message.user?.avatar_url}
              size={32}
              fallbackText={message.user?.full_name?.charAt(0) || message.user?.name?.charAt(0)}
              showBorder={false}
            />
          </View>
        )}

        {/* Message bubble */}
        <View style={styles.bubbleContainer}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            style={styles.touchableArea}
          >
            <View style={styles.bubble}>
              {renderMessageContent()}
            </View>

            {/* Reactions */}
            {renderReactions()}

            {/* Timestamp and delivery status */}
            {showTimestamp && (
              <View style={styles.messageFooter}>
                <Text style={styles.timestamp}>
                  {formatTimestamp(message.created_at)}
                </Text>
                {renderDeliveryStatus()}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Spacer for own messages to push them right */}
        {isOwn && <View style={styles.spacer} />}
      </View>
    </Animated.View>
  );
};

const createStyles = (colors, isOwn) => StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },

  bubbleContainer: {
    maxWidth: '75%',
    alignItems: isOwn ? 'flex-end' : 'flex-start',
  },
  touchableArea: {
    width: '100%',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: isOwn ? colors.card : colors.surface,
    // Subtle gradient effect using shadow
    shadowColor: colors.border,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Asymmetric border radius for chat bubble effect
    borderBottomLeftRadius: isOwn ? 20 : 4,
    borderBottomRightRadius: isOwn ? 4 : 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  photoContainer: {
    gap: 8,
  },
  photoMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  locationContainer: {
    gap: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 13,
    marginLeft: 22,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deliveryStatus: {
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doubleCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 18,
  },
  checkmark1: {
    position: 'absolute',
    left: 0,
  },
  checkmark2: {
    position: 'absolute',
    left: 5,
  },
  spacer: {
    width: 40, // Space for avatar on the other side
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    alignItems: isOwn ? 'flex-end' : 'flex-start',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border + '40',
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default MessageBubble;