/**
 * Friends Validation Utilities
 * 
 * Validation functions for friends functionality including input validation,
 * business rule validation, and type guards.
 */

import {
  User,
  SuggestedFriend,
  RecentMember,
  FriendRequest,
  PrivacySettings,
  PrivacySettingsUpdate,
  FriendRequestPermission,
  FriendshipStatus,
  ValidationResult,
  FriendRequestValidation,
  SearchQuery,
} from '../types/friends';

// =====================================================
// INPUT VALIDATION
// =====================================================

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate user ID
 */
export const validateUserId = (userId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!userId) {
    errors.push('User ID is required');
  } else if (typeof userId !== 'string') {
    errors.push('User ID must be a string');
  } else if (!isValidUUID(userId)) {
    errors.push('User ID must be a valid UUID');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
  } else if (typeof username !== 'string') {
    errors.push('Username must be a string');
  } else {
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    if (username.length > 30) {
      errors.push('Username must be no more than 30 characters long');
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, dots, hyphens, and underscores');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate full name format
 */
export const validateFullName = (fullName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!fullName) {
    errors.push('Full name is required');
  } else if (typeof fullName !== 'string') {
    errors.push('Full name must be a string');
  } else {
    if (fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }
    if (fullName.length > 100) {
      errors.push('Full name must be no more than 100 characters long');
    }
    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
      errors.push('Full name can only contain letters, spaces, hyphens, and apostrophes');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof query !== 'string') {
    errors.push('Search query must be a string');
  } else if (query.length > 100) {
    errors.push('Search query must be no more than 100 characters long');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// =====================================================
// BUSINESS RULE VALIDATION
// =====================================================

/**
 * Validate if user can send friend request to another user
 */
export const validateFriendRequest = (
  senderId: string,
  recipientId: string,
  recipientPrivacySettings?: PrivacySettings,
  existingFriendship?: { status: FriendshipStatus }
): FriendRequestValidation => {
  const errors: string[] = [];
  let canSend = true;
  let reason: string | undefined;

  // Basic validation
  const senderValidation = validateUserId(senderId);
  const recipientValidation = validateUserId(recipientId);
  
  if (!senderValidation.valid) {
    errors.push(...senderValidation.errors);
    canSend = false;
  }
  
  if (!recipientValidation.valid) {
    errors.push(...recipientValidation.errors);
    canSend = false;
  }

  // Self-friendship check
  if (senderId === recipientId) {
    errors.push('Cannot send friend request to yourself');
    canSend = false;
    reason = 'Cannot add yourself as a friend';
  }

  // Existing friendship check
  if (existingFriendship) {
    switch (existingFriendship.status) {
      case 'accepted':
        errors.push('Users are already friends');
        canSend = false;
        reason = 'Already friends';
        break;
      case 'pending':
        errors.push('Friend request already pending');
        canSend = false;
        reason = 'Request already sent';
        break;
      case 'blocked':
        errors.push('Cannot send friend request to blocked user');
        canSend = false;
        reason = 'User is blocked';
        break;
    }
  }

  // Privacy settings check
  if (recipientPrivacySettings && canSend) {
    switch (recipientPrivacySettings.allow_friend_requests) {
      case 'no-one':
        errors.push('User does not accept friend requests');
        canSend = false;
        reason = 'User does not accept friend requests';
        break;
      case 'friends-of-friends':
        // This would require additional logic to check mutual friends
        // For now, we'll assume it's allowed and let the backend handle it
        break;
      case 'everyone':
        // Always allowed
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    can_send: canSend,
    reason,
  };
};

/**
 * Validate privacy settings update
 */
export const validatePrivacySettingsUpdate = (
  settings: PrivacySettingsUpdate
): ValidationResult => {
  const errors: string[] = [];

  if (settings.allow_friend_requests !== undefined) {
    const validPermissions: FriendRequestPermission[] = ['everyone', 'friends-of-friends', 'no-one'];
    if (!validPermissions.includes(settings.allow_friend_requests)) {
      errors.push('Invalid friend request permission setting');
    }
  }

  if (settings.show_online_status !== undefined) {
    if (typeof settings.show_online_status !== 'boolean') {
      errors.push('Online status visibility must be a boolean');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Type guard to check if object is a valid User
 */
export const isValidUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    isValidUUID(obj.id) &&
    typeof obj.username === 'string' &&
    typeof obj.full_name === 'string' &&
    (obj.avatar_url === null || typeof obj.avatar_url === 'string') &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
};

/**
 * Type guard to check if object is a valid SuggestedFriend
 */
export const isValidSuggestedFriend = (obj: any): obj is SuggestedFriend => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    isValidUUID(obj.id) &&
    typeof obj.username === 'string' &&
    typeof obj.full_name === 'string' &&
    (obj.avatar_url === null || typeof obj.avatar_url === 'string') &&
    typeof obj.mutual_sessions === 'number' &&
    obj.mutual_sessions >= 0 &&
    Array.isArray(obj.sport_tags) &&
    typeof obj.last_played_together === 'string' &&
    typeof obj.friendship_status === 'string' &&
    ['none', 'pending', 'friends'].includes(obj.friendship_status)
  );
};

/**
 * Type guard to check if object is a valid RecentMember
 */
export const isValidRecentMember = (obj: any): obj is RecentMember => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    isValidUUID(obj.id) &&
    typeof obj.username === 'string' &&
    typeof obj.full_name === 'string' &&
    (obj.avatar_url === null || typeof obj.avatar_url === 'string') &&
    obj.last_interaction &&
    typeof obj.last_interaction === 'object' &&
    ['session', 'chat'].includes(obj.last_interaction.type) &&
    typeof obj.last_interaction.location === 'string' &&
    typeof obj.last_interaction.time_ago === 'string' &&
    typeof obj.friendship_status === 'string' &&
    ['none', 'pending', 'friends'].includes(obj.friendship_status)
  );
};

/**
 * Type guard to check if object is a valid FriendRequest
 */
export const isValidFriendRequest = (obj: any): obj is FriendRequest => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    isValidUUID(obj.id) &&
    obj.from_user &&
    isValidUser(obj.from_user) &&
    typeof obj.to_user_id === 'string' &&
    isValidUUID(obj.to_user_id) &&
    typeof obj.status === 'string' &&
    ['pending', 'accepted', 'declined', 'blocked'].includes(obj.status) &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
};

/**
 * Type guard to check if object is valid PrivacySettings
 */
export const isValidPrivacySettings = (obj: any): obj is PrivacySettings => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.user_id === 'string' &&
    isValidUUID(obj.user_id) &&
    typeof obj.allow_friend_requests === 'string' &&
    ['everyone', 'friends-of-friends', 'no-one'].includes(obj.allow_friend_requests) &&
    typeof obj.show_online_status === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
};

// =====================================================
// ARRAY VALIDATION
// =====================================================

/**
 * Validate array of suggested friends
 */
export const validateSuggestedFriendsArray = (arr: any[]): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(arr)) {
    errors.push('Suggested friends must be an array');
    return { valid: false, errors };
  }
  
  arr.forEach((item, index) => {
    if (!isValidSuggestedFriend(item)) {
      errors.push(`Invalid suggested friend at index ${index}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate array of recent members
 */
export const validateRecentMembersArray = (arr: any[]): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(arr)) {
    errors.push('Recent members must be an array');
    return { valid: false, errors };
  }
  
  arr.forEach((item, index) => {
    if (!isValidRecentMember(item)) {
      errors.push(`Invalid recent member at index ${index}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate array of friend requests
 */
export const validateFriendRequestsArray = (arr: any[]): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(arr)) {
    errors.push('Friend requests must be an array');
    return { valid: false, errors };
  }
  
  arr.forEach((item, index) => {
    if (!isValidFriendRequest(item)) {
      errors.push(`Invalid friend request at index ${index}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// =====================================================
// SEARCH VALIDATION
// =====================================================

/**
 * Validate search query object
 */
export const validateSearchQueryObject = (query: SearchQuery): ValidationResult => {
  const errors: string[] = [];
  
  if (!query || typeof query !== 'object') {
    errors.push('Search query must be an object');
    return { valid: false, errors };
  }
  
  const queryValidation = validateSearchQuery(query.query);
  if (!queryValidation.valid) {
    errors.push(...queryValidation.errors);
  }
  
  if (query.filters) {
    if (typeof query.filters !== 'object') {
      errors.push('Search filters must be an object');
    } else {
      if (query.filters.sport_tags && !Array.isArray(query.filters.sport_tags)) {
        errors.push('Sport tags filter must be an array');
      }
      
      if (query.filters.interaction_type && !Array.isArray(query.filters.interaction_type)) {
        errors.push('Interaction type filter must be an array');
      }
      
      if (query.filters.friendship_status && !Array.isArray(query.filters.friendship_status)) {
        errors.push('Friendship status filter must be an array');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// =====================================================
// SANITIZATION HELPERS
// =====================================================

/**
 * Sanitize search query string
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
};

/**
 * Sanitize user input for display
 */
export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>&"']/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return entities[char] || char;
    });
};

/**
 * Sanitize user ID to ensure it's a valid UUID string
 */
export const sanitizeUserId = (userId: string): string => {
  if (typeof userId !== 'string') return '';
  
  // Remove any whitespace and convert to lowercase
  const cleaned = userId.trim().toLowerCase();
  
  // Validate UUID format and return cleaned version
  if (isValidUUID(cleaned)) {
    return cleaned;
  }
  
  // If not a valid UUID, return empty string
  return '';
};

// =====================================================
// RATE LIMITING VALIDATION
// =====================================================

/**
 * Validate rate limiting for friend requests
 */
export const validateFriendRequestRateLimit = (
  recentRequests: number,
  timeWindow: number = 3600000, // 1 hour in milliseconds
  maxRequests: number = 10
): ValidationResult => {
  const errors: string[] = [];
  
  if (recentRequests >= maxRequests) {
    errors.push(`Too many friend requests. Please wait before sending more. (${recentRequests}/${maxRequests} in the last hour)`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// =====================================================
// COMPREHENSIVE VALIDATION
// =====================================================

/**
 * Comprehensive validation for friends page data
 */
export const validateFriendsPageData = (data: {
  suggested_friends?: any[];
  recent_members?: any[];
  friend_requests?: any[];
  privacy_settings?: any;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (data.suggested_friends) {
    const suggestedValidation = validateSuggestedFriendsArray(data.suggested_friends);
    if (!suggestedValidation.valid) {
      errors.push(...suggestedValidation.errors);
    }
  }
  
  if (data.recent_members) {
    const recentValidation = validateRecentMembersArray(data.recent_members);
    if (!recentValidation.valid) {
      errors.push(...recentValidation.errors);
    }
  }
  
  if (data.friend_requests) {
    const requestsValidation = validateFriendRequestsArray(data.friend_requests);
    if (!requestsValidation.valid) {
      errors.push(...requestsValidation.errors);
    }
  }
  
  if (data.privacy_settings) {
    if (!isValidPrivacySettings(data.privacy_settings)) {
      errors.push('Invalid privacy settings');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};