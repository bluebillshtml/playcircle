// =====================================================
// CHAT SYSTEM CONSTANTS
// =====================================================
// Configuration constants and enums for the chat system

import { ChatConfig, MessageType, QuickActionType } from '../types/chat';

// =====================================================
// MESSAGE CONSTANTS
// =====================================================

export const MESSAGE_TYPES: Record<string, MessageType> = {
  TEXT: 'text',
  LOCATION: 'location',
  STATUS: 'status',
  PHOTO: 'photo',
} as const;

export const QUICK_ACTIONS: Record<string, QuickActionType> = {
  ON_MY_WAY: 'on-my-way',
  RUNNING_LATE: 'running-late',
  ARRIVED: 'arrived',
  SHARE_LOCATION: 'share-location',
  TAKE_PHOTO: 'take-photo',
} as const;

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

// =====================================================
// QUICK ACTION CONFIGURATIONS
// =====================================================

export const QUICK_ACTION_CONFIG = {
  [QUICK_ACTIONS.ON_MY_WAY]: {
    label: 'On my way',
    icon: 'car-outline',
    message: 'On my way! 🏃‍♂️',
    color: '#10B981', // Green
  },
  [QUICK_ACTIONS.RUNNING_LATE]: {
    label: 'Running late',
    icon: 'time-outline',
    message: 'Running late, be there soon! ⏰',
    color: '#F59E0B', // Amber
  },
  [QUICK_ACTIONS.ARRIVED]: {
    label: 'Arrived',
    icon: 'checkmark-circle-outline',
    message: 'I\'ve arrived! 📍',
    color: '#059669', // Emerald
  },
  [QUICK_ACTIONS.SHARE_LOCATION]: {
    label: 'Share location',
    icon: 'location-outline',
    message: '📍 Shared location',
    color: '#3B82F6', // Blue
  },
  [QUICK_ACTIONS.TAKE_PHOTO]: {
    label: 'Take photo',
    icon: 'camera-outline',
    message: '📷 Shared a photo',
    color: '#8B5CF6', // Purple
  },
} as const;

// =====================================================
// SPORT CONFIGURATIONS
// =====================================================

export const SPORT_CONFIG = {
  padel: {
    name: 'Padel',
    icon: 'tennisball',
    color: '#10B981',
  },
  tennis: {
    name: 'Tennis',
    icon: 'tennisball-outline',
    color: '#3B82F6',
  },
  basketball: {
    name: 'Basketball',
    icon: 'basketball',
    color: '#F59E0B',
  },
  volleyball: {
    name: 'Volleyball',
    icon: 'football',
    color: '#EF4444',
  },
  soccer: {
    name: 'Soccer',
    icon: 'football-outline',
    color: '#059669',
  },
  pickleball: {
    name: 'Pickleball',
    icon: 'baseball',
    color: '#8B5CF6',
  },
  squash: {
    name: 'Squash',
    icon: 'tennisball',
    color: '#DC2626',
  },
  badminton: {
    name: 'Badminton',
    icon: 'tennisball-outline',
    color: '#7C3AED',
  },
} as const;

// =====================================================
// CHAT CONFIGURATION
// =====================================================

export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  maxMessageLength: 1000,
  messagePageSize: 50,
  typingTimeoutMs: 3000,
  retryAttempts: 3,
  retryDelayMs: 1000,
  happeningSoonDays: 2,
  recentDays: 14,
};

// =====================================================
// UI CONSTANTS
// =====================================================

export const UI_CONSTANTS = {
  // Animation durations (ms)
  ANIMATION_DURATION_SHORT: 200,
  ANIMATION_DURATION_MEDIUM: 300,
  ANIMATION_DURATION_LONG: 500,
  
  // Timing
  TYPING_INDICATOR_DELAY: 500,
  MESSAGE_RETRY_DELAY: 2000,
  SCROLL_TO_BOTTOM_DELAY: 100,
  
  // Dimensions
  AVATAR_SIZE_SMALL: 24,
  AVATAR_SIZE_MEDIUM: 32,
  AVATAR_SIZE_LARGE: 40,
  
  MESSAGE_BUBBLE_MAX_WIDTH: 280,
  MESSAGE_BUBBLE_MIN_HEIGHT: 40,
  
  CHAT_CARD_HEIGHT: 80,
  CHAT_HEADER_HEIGHT: 60,
  MESSAGE_INPUT_HEIGHT: 50,
  
  // Spacing
  MESSAGE_SPACING: 8,
  MESSAGE_GROUP_SPACING: 16,
  SECTION_SPACING: 24,
  
  // Border radius
  BORDER_RADIUS_SMALL: 8,
  BORDER_RADIUS_MEDIUM: 12,
  BORDER_RADIUS_LARGE: 16,
  BORDER_RADIUS_XL: 24,
  
  // Opacity
  OPACITY_DISABLED: 0.5,
  OPACITY_LOADING: 0.7,
  OPACITY_OVERLAY: 0.8,
} as const;

// =====================================================
// ERROR MESSAGES
// =====================================================

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Authentication errors
  AUTH_REQUIRED: 'You must be logged in to send messages.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Permission errors
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  CHAT_ACCESS_DENIED: 'You don\'t have access to this chat.',
  
  // Validation errors
  MESSAGE_EMPTY: 'Message cannot be empty.',
  MESSAGE_TOO_LONG: 'Message is too long.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select an image.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  
  // Chat errors
  CHAT_NOT_FOUND: 'Chat not found.',
  SESSION_NOT_FOUND: 'Session not found.',
  USER_NOT_IN_CHAT: 'You are not a member of this chat.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  RETRY_FAILED: 'Failed to send message after multiple attempts.',
} as const;

// =====================================================
// SUCCESS MESSAGES
// =====================================================

export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully.',
  PHOTO_UPLOADED: 'Photo uploaded successfully.',
  LOCATION_SHARED: 'Location shared successfully.',
  JOINED_CHAT: 'You joined the chat.',
  LEFT_CHAT: 'You left the chat.',
} as const;

// =====================================================
// PLACEHOLDER TEXTS
// =====================================================

export const PLACEHOLDER_TEXTS = {
  MESSAGE_INPUT: 'Type a message...',
  SEARCH_CHATS: 'Search chats...',
  NO_MESSAGES: 'No messages yet. Start the conversation!',
  NO_CHATS: 'No chats yet. Join a session to start chatting!',
  LOADING_MESSAGES: 'Loading messages...',
  LOADING_CHATS: 'Loading chats...',
  TYPING_SINGLE: 'is typing...',
  TYPING_MULTIPLE: 'are typing...',
} as const;

// =====================================================
// SECTION TITLES
// =====================================================

export const SECTION_TITLES = {
  HAPPENING_SOON: 'Happening Soon',
  RECENT: 'Recent',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  THIS_WEEK: 'This Week',
  OLDER: 'Older',
} as const;

// =====================================================
// ACCESSIBILITY LABELS
// =====================================================

export const ACCESSIBILITY_LABELS = {
  // Chat list
  CHAT_CARD: 'Chat with session',
  UNREAD_BADGE: 'unread messages',
  HAPPENING_SOON_BADGE: 'happening soon',
  
  // Chat thread
  MESSAGE_BUBBLE: 'Message from',
  MESSAGE_TIME: 'sent at',
  MESSAGE_FAILED: 'failed to send',
  MESSAGE_SENDING: 'sending',
  
  // Input
  MESSAGE_INPUT: 'Type your message',
  SEND_BUTTON: 'Send message',
  QUICK_ACTION_BUTTON: 'Quick action',
  PHOTO_BUTTON: 'Take photo',
  LOCATION_BUTTON: 'Share location',
  
  // Navigation
  BACK_BUTTON: 'Go back',
  CHAT_HEADER: 'Chat header',
  SCROLL_TO_BOTTOM: 'Scroll to bottom',
  
  // Actions
  RETRY_MESSAGE: 'Retry sending message',
  DELETE_MESSAGE: 'Delete message',
  COPY_MESSAGE: 'Copy message',
  LEAVE_CHAT: 'Leave chat',
  ADD_FRIEND: 'Add friend',
  GET_DIRECTIONS: 'Get directions',
} as const;

// =====================================================
// STORAGE KEYS
// =====================================================

export const STORAGE_KEYS = {
  CHAT_CACHE: 'chat_cache',
  MESSAGE_CACHE: 'message_cache',
  OFFLINE_MESSAGES: 'offline_messages',
  USER_PREFERENCES: 'chat_user_preferences',
  DRAFT_MESSAGES: 'draft_messages',
} as const;

// =====================================================
// API ENDPOINTS
// =====================================================

export const API_ENDPOINTS = {
  CHATS: '/chats',
  MESSAGES: '/messages',
  UPLOAD_PHOTO: '/upload/chat-photo',
  MARK_READ: '/chats/:chatId/read',
  TYPING: '/chats/:chatId/typing',
} as const;

// =====================================================
// REAL-TIME EVENTS
// =====================================================

export const REALTIME_EVENTS = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  CHAT_UPDATED: 'chat_updated',
} as const;

// =====================================================
// FEATURE FLAGS
// =====================================================

export const FEATURE_FLAGS = {
  ENABLE_TYPING_INDICATORS: true,
  ENABLE_MESSAGE_REACTIONS: false,
  ENABLE_MESSAGE_REPLIES: false,
  ENABLE_VOICE_MESSAGES: false,
  ENABLE_MESSAGE_ENCRYPTION: false,
  ENABLE_OFFLINE_SUPPORT: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
} as const;

// =====================================================
// PERFORMANCE CONSTANTS
// =====================================================

export const PERFORMANCE_CONSTANTS = {
  // Debounce delays
  TYPING_DEBOUNCE_MS: 300,
  SEARCH_DEBOUNCE_MS: 500,
  SCROLL_DEBOUNCE_MS: 100,
  
  // Cache settings
  CACHE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  MAX_CACHED_CHATS: 50,
  MAX_CACHED_MESSAGES_PER_CHAT: 200,
  
  // Batch sizes
  MESSAGE_BATCH_SIZE: 50,
  CHAT_BATCH_SIZE: 20,
  
  // Timeouts
  API_TIMEOUT_MS: 10000,
  UPLOAD_TIMEOUT_MS: 30000,
  REALTIME_RECONNECT_MS: 5000,
} as const;

// =====================================================
// THEME CONSTANTS
// =====================================================

export const THEME_CONSTANTS = {
  // Message bubble colors
  OWN_MESSAGE_BACKGROUND: '#007AFF',
  OTHER_MESSAGE_BACKGROUND: '#E5E5EA',
  OWN_MESSAGE_TEXT: '#FFFFFF',
  OTHER_MESSAGE_TEXT: '#000000',
  
  // Status colors
  SUCCESS_COLOR: '#10B981',
  ERROR_COLOR: '#EF4444',
  WARNING_COLOR: '#F59E0B',
  INFO_COLOR: '#3B82F6',
  
  // Opacity values
  DISABLED_OPACITY: 0.5,
  LOADING_OPACITY: 0.7,
  OVERLAY_OPACITY: 0.8,
  
  // Shadow values
  CARD_SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  MESSAGE_SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;