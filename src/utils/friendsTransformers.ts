/**
 * Friends Data Transformers
 * 
 * Utility functions for transforming API responses and database data
 * into the proper TypeScript interfaces for the Friends feature.
 */

import {
  User,
  SuggestedFriend,
  RecentMember,
  FriendRequest,
  Friend,
  PrivacySettings,
  InteractionContext,
  InteractionType,
  FriendshipStatus,
  SportTag,
} from '../types/friends';

// =====================================================
// DATABASE TO INTERFACE TRANSFORMERS
// =====================================================

/**
 * Transform database user record to User interface
 */
export const transformUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    username: dbUser.username || '',
    full_name: dbUser.full_name || '',
    avatar_url: dbUser.avatar_url || null,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at,
  };
};

/**
 * Transform database suggested friend record to SuggestedFriend interface
 */
export const transformSuggestedFriend = (dbRecord: any): SuggestedFriend => {
  return {
    id: dbRecord.id,
    username: dbRecord.username || '',
    full_name: dbRecord.full_name || '',
    avatar_url: dbRecord.avatar_url || null,
    mutual_sessions: parseInt(dbRecord.mutual_sessions) || 0,
    sport_tags: Array.isArray(dbRecord.sport_tags) ? dbRecord.sport_tags : [],
    last_played_together: dbRecord.last_played_together,
    friendship_status: dbRecord.friendship_status || 'none',
  };
};

/**
 * Transform database recent member record to RecentMember interface
 */
export const transformRecentMember = (dbRecord: any): RecentMember => {
  const interactionContext: InteractionContext = {
    type: dbRecord.interaction_type as InteractionType,
    location: dbRecord.location || 'Unknown Location',
    court_name: dbRecord.court_name || undefined,
    session_title: dbRecord.session_title || undefined,
    time_ago: formatTimeAgo(dbRecord.last_interaction),
    interaction_date: dbRecord.interaction_date,
    interaction_time: dbRecord.interaction_time || undefined,
  };

  return {
    id: dbRecord.id,
    username: dbRecord.username || '',
    full_name: dbRecord.full_name || '',
    avatar_url: dbRecord.avatar_url || null,
    last_interaction: interactionContext,
    friendship_status: dbRecord.friendship_status || 'none',
    online_status: dbRecord.online_status || undefined,
  };
};

/**
 * Transform database friend request record to FriendRequest interface
 */
export const transformFriendRequest = (dbRecord: any): FriendRequest => {
  return {
    id: dbRecord.request_id || dbRecord.id,
    from_user: {
      id: dbRecord.from_user_id,
      username: dbRecord.from_username || '',
      full_name: dbRecord.from_full_name || '',
      avatar_url: dbRecord.from_avatar_url || null,
      created_at: dbRecord.from_user_created_at || '',
      updated_at: dbRecord.from_user_updated_at || '',
    },
    to_user_id: dbRecord.to_user_id || '',
    status: dbRecord.status as FriendshipStatus,
    created_at: dbRecord.requested_at || dbRecord.created_at,
    updated_at: dbRecord.updated_at || dbRecord.requested_at,
  };
};

/**
 * Transform database friend record to Friend interface
 */
export const transformFriend = (dbRecord: any): Friend => {
  return {
    id: dbRecord.friend_id || dbRecord.id,
    username: dbRecord.username || '',
    full_name: dbRecord.full_name || '',
    avatar_url: dbRecord.avatar_url || null,
    friendship_date: dbRecord.friendship_date || dbRecord.added_at,
    online_status: dbRecord.online_status || undefined,
  };
};

/**
 * Transform database privacy settings record to PrivacySettings interface
 */
export const transformPrivacySettings = (dbRecord: any): PrivacySettings => {
  return {
    user_id: dbRecord.user_id,
    allow_friend_requests: dbRecord.allow_friend_requests || 'everyone',
    show_online_status: dbRecord.show_online_status !== false, // Default to true
    created_at: dbRecord.created_at,
    updated_at: dbRecord.updated_at,
  };
};

// =====================================================
// ARRAY TRANSFORMERS
// =====================================================

/**
 * Transform array of database suggested friends to SuggestedFriend array
 */
export const transformSuggestedFriends = (dbRecords: any[]): SuggestedFriend[] => {
  if (!Array.isArray(dbRecords)) return [];
  return dbRecords.map(transformSuggestedFriend);
};

/**
 * Transform array of database recent members to RecentMember array
 */
export const transformRecentMembers = (dbRecords: any[]): RecentMember[] => {
  if (!Array.isArray(dbRecords)) return [];
  return dbRecords.map(transformRecentMember);
};

/**
 * Transform array of database friend requests to FriendRequest array
 */
export const transformFriendRequests = (dbRecords: any[]): FriendRequest[] => {
  if (!Array.isArray(dbRecords)) return [];
  return dbRecords.map(transformFriendRequest);
};

/**
 * Transform array of database friends to Friend array
 */
export const transformFriends = (dbRecords: any[]): Friend[] => {
  if (!Array.isArray(dbRecords)) return [];
  return dbRecords.map(transformFriend);
};

// =====================================================
// SPORT TAGS TRANSFORMERS
// =====================================================

/**
 * Transform sport ID to SportTag interface
 */
export const transformSportTag = (sportId: string): SportTag => {
  // Sport configuration mapping
  const sportConfig: Record<string, { name: string; color: string; icon: string }> = {
    tennis: { name: 'Tennis', color: '#4CAF50', icon: '🎾' },
    badminton: { name: 'Badminton', color: '#FF9800', icon: '🏸' },
    squash: { name: 'Squash', color: '#2196F3', icon: '🎯' },
    pickleball: { name: 'Pickleball', color: '#9C27B0', icon: '🏓' },
    basketball: { name: 'Basketball', color: '#FF5722', icon: '🏀' },
    volleyball: { name: 'Volleyball', color: '#607D8B', icon: '🏐' },
  };

  const config = sportConfig[sportId] || { 
    name: sportId.charAt(0).toUpperCase() + sportId.slice(1), 
    color: '#757575', 
    icon: '⚽' 
  };

  return {
    id: sportId,
    name: config.name,
    color: config.color,
    icon: config.icon,
  };
};

/**
 * Transform array of sport IDs to SportTag array
 */
export const transformSportTags = (sportIds: string[]): SportTag[] => {
  if (!Array.isArray(sportIds)) return [];
  return sportIds.map(transformSportTag);
};

// =====================================================
// INTERACTION CONTEXT TRANSFORMERS
// =====================================================

/**
 * Format interaction context for display
 */
export const formatInteractionContext = (interaction: InteractionContext): string => {
  switch (interaction.type) {
    case 'session':
      if (interaction.court_name && interaction.location) {
        return `Played at ${interaction.location} – ${interaction.court_name} • ${interaction.time_ago}`;
      } else if (interaction.location) {
        return `Played at ${interaction.location} • ${interaction.time_ago}`;
      } else {
        return `Played together • ${interaction.time_ago}`;
      }
    
    case 'chat':
      return `Chat message • ${interaction.time_ago}`;
    
    default:
      return `Interacted • ${interaction.time_ago}`;
  }
};

/**
 * Format time ago string from date
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  // For dates older than 4 weeks, show the actual date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

// =====================================================
// SEARCH AND FILTERING TRANSFORMERS
// =====================================================

/**
 * Filter suggested friends by search query
 */
export const filterSuggestedFriends = (
  friends: SuggestedFriend[], 
  query: string
): SuggestedFriend[] => {
  if (!query.trim()) return friends;
  
  const searchTerm = query.toLowerCase().trim();
  
  return friends.filter(friend => 
    friend.username.toLowerCase().includes(searchTerm) ||
    friend.full_name.toLowerCase().includes(searchTerm) ||
    friend.sport_tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

/**
 * Filter recent members by search query
 */
export const filterRecentMembers = (
  members: RecentMember[], 
  query: string
): RecentMember[] => {
  if (!query.trim()) return members;
  
  const searchTerm = query.toLowerCase().trim();
  
  return members.filter(member => 
    member.username.toLowerCase().includes(searchTerm) ||
    member.full_name.toLowerCase().includes(searchTerm) ||
    member.last_interaction.location.toLowerCase().includes(searchTerm)
  );
};

// =====================================================
// VALIDATION TRANSFORMERS
// =====================================================

/**
 * Validate and sanitize user input for friend requests
 */
export const sanitizeUserId = (userId: string): string => {
  // Remove any non-UUID characters and validate format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  return userId.toLowerCase();
};

/**
 * Validate friendship status
 */
export const validateFriendshipStatus = (status: string): FriendshipStatus => {
  const validStatuses: FriendshipStatus[] = ['pending', 'accepted', 'declined', 'blocked'];
  
  if (!validStatuses.includes(status as FriendshipStatus)) {
    throw new Error(`Invalid friendship status: ${status}`);
  }
  
  return status as FriendshipStatus;
};

// =====================================================
// SORTING AND GROUPING TRANSFORMERS
// =====================================================

/**
 * Sort suggested friends by relevance (mutual sessions, then recency)
 */
export const sortSuggestedFriends = (friends: SuggestedFriend[]): SuggestedFriend[] => {
  return [...friends].sort((a, b) => {
    // First sort by mutual sessions (descending)
    if (a.mutual_sessions !== b.mutual_sessions) {
      return b.mutual_sessions - a.mutual_sessions;
    }
    
    // Then sort by last played together (most recent first)
    const dateA = new Date(a.last_played_together).getTime();
    const dateB = new Date(b.last_played_together).getTime();
    return dateB - dateA;
  });
};

/**
 * Sort recent members by interaction recency
 */
export const sortRecentMembers = (members: RecentMember[]): RecentMember[] => {
  return [...members].sort((a, b) => {
    const dateA = new Date(a.last_interaction.interaction_date).getTime();
    const dateB = new Date(b.last_interaction.interaction_date).getTime();
    return dateB - dateA;
  });
};

/**
 * Group recent members by interaction type
 */
export const groupRecentMembersByType = (members: RecentMember[]): Record<InteractionType, RecentMember[]> => {
  return members.reduce((groups, member) => {
    const type = member.last_interaction.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(member);
    return groups;
  }, {} as Record<InteractionType, RecentMember[]>);
};

// =====================================================
// DEDUPLICATION TRANSFORMERS
// =====================================================

/**
 * Remove duplicate users from suggested friends and recent members
 */
export const deduplicateUsers = <T extends { id: string }>(users: T[]): T[] => {
  const seen = new Set<string>();
  return users.filter(user => {
    if (seen.has(user.id)) {
      return false;
    }
    seen.add(user.id);
    return true;
  });
};

/**
 * Merge and deduplicate suggested friends and recent members for search results
 */
export const mergeAndDeduplicateForSearch = (
  suggestedFriends: SuggestedFriend[],
  recentMembers: RecentMember[]
): { suggested: SuggestedFriend[]; recent: RecentMember[] } => {
  const suggestedIds = new Set(suggestedFriends.map(f => f.id));
  
  // Remove recent members who are already in suggested friends
  const filteredRecent = recentMembers.filter(member => !suggestedIds.has(member.id));
  
  return {
    suggested: deduplicateUsers(suggestedFriends),
    recent: deduplicateUsers(filteredRecent),
  };
};

// =====================================================
// ERROR HANDLING TRANSFORMERS
// =====================================================

/**
 * Transform API error to user-friendly message
 */
export const transformApiError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  if (error?.details) {
    return error.details;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Transform database constraint error to user-friendly message
 */
export const transformConstraintError = (error: any): string => {
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('unique_violation')) {
    return 'This action has already been performed.';
  }
  
  if (errorMessage.includes('foreign_key_violation')) {
    return 'The requested user could not be found.';
  }
  
  if (errorMessage.includes('check_violation')) {
    return 'Invalid data provided. Please check your input.';
  }
  
  return transformApiError(error);
};