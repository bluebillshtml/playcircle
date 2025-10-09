// =====================================================
// CHAT UTILITIES
// =====================================================
// Helper functions and utilities for the chat system

// Message type constants
export const MESSAGE_TYPES = {
  TEXT: 'text',
  LOCATION: 'location',
  STATUS: 'status',
  PHOTO: 'photo',
};

// Quick action types
export const QUICK_ACTIONS = {
  ON_MY_WAY: 'on-my-way',
  RUNNING_LATE: 'running-late',
  ARRIVED: 'arrived',
  SHARE_LOCATION: 'share-location',
  TAKE_PHOTO: 'take-photo',
};

// Chat visibility constants
export const CHAT_VISIBILITY = {
  HAPPENING_SOON_DAYS: 2,
  RECENT_DAYS: 14,
};

// =====================================================
// MESSAGE FORMATTING UTILITIES
// =====================================================

/**
 * Format message timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @param {boolean} showDate - Whether to show date
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp, showDate = false) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (!showDate) {
    return timeString;
  }

  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today ${timeString}`;
  } else if (diffDays === 1) {
    return `Yesterday ${timeString}`;
  } else if (diffDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })} ${timeString}`;
  } else {
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} ${timeString}`;
  }
};

/**
 * Format session title for chat display
 * @param {Object} session - Session/match object
 * @returns {string} Formatted session title
 */
export const formatSessionTitle = (session) => {
  if (!session) return 'Session';
  
  const courtName = session.court?.name || session.court_name || 'Court';
  const date = new Date(session.match_date || session.session_date);
  const time = session.match_time || session.session_time;
  
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const timeStr = time ? formatTime(time) : '';
  
  return `${courtName} – ${dateStr}${timeStr ? ` ${timeStr}` : ''}`;
};

/**
 * Format time string for display
 * @param {string} timeString - Time string (HH:MM format)
 * @returns {string} Formatted time
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

// =====================================================
// CHAT ORGANIZATION UTILITIES
// =====================================================

/**
 * Check if a session is happening soon (within 48 hours)
 * @param {Object} session - Session/match object
 * @returns {boolean} True if happening soon
 */
export const isHappeningSoon = (session) => {
  if (!session?.match_date && !session?.session_date) return false;
  
  const sessionDate = new Date(session.match_date || session.session_date);
  const now = new Date();
  const diffTime = sessionDate.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays >= 0 && diffDays <= CHAT_VISIBILITY.HAPPENING_SOON_DAYS;
};

/**
 * Check if a chat should be visible (within 14 days)
 * @param {Object} session - Session/match object
 * @returns {boolean} True if should be visible
 */
export const isChatVisible = (session) => {
  if (!session?.match_date && !session?.session_date) return false;
  
  const sessionDate = new Date(session.match_date || session.session_date);
  const now = new Date();
  const diffTime = now.getTime() - sessionDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Show if session is in the future or ended within 14 days
  return diffDays <= CHAT_VISIBILITY.RECENT_DAYS;
};

/**
 * Sort chats by priority (happening soon first, then by last message)
 * @param {Array} chats - Array of chat objects
 * @returns {Array} Sorted chats
 */
export const sortChats = (chats) => {
  return chats.sort((a, b) => {
    const aHappeningSoon = a.is_happening_soon || isHappeningSoon(a);
    const bHappeningSoon = b.is_happening_soon || isHappeningSoon(b);
    
    // Happening soon chats first
    if (aHappeningSoon && !bHappeningSoon) return -1;
    if (!aHappeningSoon && bHappeningSoon) return 1;
    
    // Then sort by last message time (most recent first)
    const aTime = new Date(a.last_message_at || a.created_at || 0);
    const bTime = new Date(b.last_message_at || b.created_at || 0);
    
    return bTime.getTime() - aTime.getTime();
  });
};

/**
 * Group chats into sections
 * @param {Array} chats - Array of chat objects
 * @returns {Object} Grouped chats { happeningSoon: [], recent: [] }
 */
export const groupChats = (chats) => {
  const happeningSoon = [];
  const recent = [];
  
  chats.forEach(chat => {
    if (chat.is_happening_soon || isHappeningSoon(chat)) {
      happeningSoon.push(chat);
    } else {
      recent.push(chat);
    }
  });
  
  return {
    happeningSoon: sortChats(happeningSoon),
    recent: sortChats(recent),
  };
};

// =====================================================
// MESSAGE UTILITIES
// =====================================================

/**
 * Check if two messages should be grouped together
 * @param {Object} currentMessage - Current message
 * @param {Object} previousMessage - Previous message
 * @returns {boolean} True if should be grouped
 */
export const shouldGroupMessages = (currentMessage, previousMessage) => {
  if (!previousMessage) return false;
  
  // Same user
  if (currentMessage.user_id !== previousMessage.user_id) return false;
  
  // Within 5 minutes
  const currentTime = new Date(currentMessage.created_at);
  const previousTime = new Date(previousMessage.created_at);
  const diffMinutes = (currentTime - previousTime) / (1000 * 60);
  
  return diffMinutes <= 5;
};

/**
 * Check if a day divider should be shown
 * @param {Object} currentMessage - Current message
 * @param {Object} previousMessage - Previous message
 * @returns {boolean} True if day divider needed
 */
export const shouldShowDayDivider = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.created_at).toDateString();
  const previousDate = new Date(previousMessage.created_at).toDateString();
  
  return currentDate !== previousDate;
};

/**
 * Get day divider text
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Day divider text
 */
export const getDayDividerText = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
};

// =====================================================
// SPORT UTILITIES
// =====================================================

/**
 * Get sport icon name for display
 * @param {string} sportId - Sport identifier
 * @returns {string} Icon name
 */
export const getSportIcon = (sportId) => {
  const sportIcons = {
    padel: 'tennisball',
    tennis: 'tennisball-outline',
    basketball: 'basketball',
    volleyball: 'football',
    soccer: 'football-outline',
    pickleball: 'baseball',
    squash: 'tennisball',
    badminton: 'tennisball-outline',
  };
  
  return sportIcons[sportId] || 'ellipse';
};

/**
 * Get sport display name
 * @param {string} sportId - Sport identifier
 * @returns {string} Display name
 */
export const getSportDisplayName = (sportId) => {
  const sportNames = {
    padel: 'Padel',
    tennis: 'Tennis',
    basketball: 'Basketball',
    volleyball: 'Volleyball',
    soccer: 'Soccer',
    pickleball: 'Pickleball',
    squash: 'Squash',
    badminton: 'Badminton',
  };
  
  return sportNames[sportId] || 'Sport';
};

// =====================================================
// VALIDATION UTILITIES
// =====================================================

/**
 * Validate message content
 * @param {string} content - Message content
 * @param {string} type - Message type
 * @returns {Object} Validation result { isValid: boolean, error?: string }
 */
export const validateMessage = (content, type = MESSAGE_TYPES.TEXT) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Message content is required' };
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmedContent.length > 1000) {
    return { isValid: false, error: 'Message is too long (max 1000 characters)' };
  }
  
  if (!Object.values(MESSAGE_TYPES).includes(type)) {
    return { isValid: false, error: 'Invalid message type' };
  }
  
  return { isValid: true };
};

/**
 * Sanitize message content
 * @param {string} content - Raw message content
 * @returns {string} Sanitized content
 */
export const sanitizeMessage = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 1000); // Limit length
};

// =====================================================
// OFFLINE SUPPORT UTILITIES
// =====================================================

/**
 * Generate temporary message ID for offline support
 * @returns {string} Temporary ID
 */
export const generateTempMessageId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if message is temporary (offline)
 * @param {Object} message - Message object
 * @returns {boolean} True if temporary
 */
export const isTempMessage = (message) => {
  return message.id && message.id.startsWith('temp_');
};

/**
 * Create optimistic message for immediate UI update
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @param {string} content - Message content
 * @param {string} type - Message type
 * @param {Object} metadata - Message metadata
 * @param {Object} user - User object
 * @returns {Object} Optimistic message
 */
export const createOptimisticMessage = (chatId, userId, content, type = MESSAGE_TYPES.TEXT, metadata = {}, user = null) => {
  return {
    id: generateTempMessageId(),
    chat_id: chatId,
    user_id: userId,
    content: sanitizeMessage(content),
    message_type: type,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    user: user || { id: userId, username: 'You', full_name: 'You' },
    delivery_status: 'sending',
  };
};