/**
 * Friends Factory Utilities
 * 
 * Factory functions for creating mock data and test fixtures
 * for the Friends feature during development and testing.
 */

import {
  User,
  SuggestedFriend,
  RecentMember,
  FriendRequest,
  Friend,
  PrivacySettings,
  InteractionContext,
  FriendshipStatus,
  FriendRequestPermission,
  InteractionType,
} from '../types/friends';

// =====================================================
// MOCK DATA GENERATORS
// =====================================================

/**
 * Generate a mock user
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  const defaultUser: User = {
    id: generateUUID(),
    username: `user${Math.floor(Math.random() * 1000)}`,
    full_name: generateRandomName(),
    avatar_url: generateRandomAvatar(),
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { ...defaultUser, ...overrides };
};

/**
 * Generate a mock suggested friend
 */
export const createMockSuggestedFriend = (overrides: Partial<SuggestedFriend> = {}): SuggestedFriend => {
  const user = createMockUser();
  const defaultSuggestedFriend: SuggestedFriend = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    mutual_sessions: Math.floor(Math.random() * 10) + 1,
    sport_tags: generateRandomSportTags(),
    last_played_together: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    friendship_status: 'none',
  };

  return { ...defaultSuggestedFriend, ...overrides };
};

/**
 * Generate a mock recent member
 */
export const createMockRecentMember = (overrides: Partial<RecentMember> = {}): RecentMember => {
  const user = createMockUser();
  const interactionType: InteractionType = Math.random() > 0.5 ? 'session' : 'chat';
  
  const defaultRecentMember: RecentMember = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    last_interaction: createMockInteractionContext(interactionType),
    friendship_status: generateRandomFriendshipStatus(),
    online_status: Math.random() > 0.3,
  };

  return { ...defaultRecentMember, ...overrides };
};

/**
 * Generate a mock friend request
 */
export const createMockFriendRequest = (overrides: Partial<FriendRequest> = {}): FriendRequest => {
  const fromUser = createMockUser();
  const defaultFriendRequest: FriendRequest = {
    id: generateUUID(),
    from_user: fromUser,
    to_user_id: generateUUID(),
    status: 'pending',
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { ...defaultFriendRequest, ...overrides };
};

/**
 * Generate a mock friend
 */
export const createMockFriend = (overrides: Partial<Friend> = {}): Friend => {
  const user = createMockUser();
  const defaultFriend: Friend = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    friendship_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    online_status: Math.random() > 0.4,
  };

  return { ...defaultFriend, ...overrides };
};

/**
 * Generate mock privacy settings
 */
export const createMockPrivacySettings = (overrides: Partial<PrivacySettings> = {}): PrivacySettings => {
  const defaultPrivacySettings: PrivacySettings = {
    user_id: generateUUID(),
    allow_friend_requests: generateRandomFriendRequestPermission(),
    show_online_status: Math.random() > 0.2,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { ...defaultPrivacySettings, ...overrides };
};

/**
 * Generate mock interaction context
 */
export const createMockInteractionContext = (type?: InteractionType): InteractionContext => {
  const interactionType = type || (Math.random() > 0.5 ? 'session' : 'chat');
  const interactionDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
  
  if (interactionType === 'session') {
    return {
      type: 'session',
      location: generateRandomVenue(),
      court_name: generateRandomCourtName(),
      session_title: `${generateRandomVenue()} – ${generateRandomCourtName()}`,
      time_ago: formatTimeAgo(interactionDate),
      interaction_date: interactionDate.toISOString(),
      interaction_time: interactionDate.toTimeString().slice(0, 5),
    };
  } else {
    return {
      type: 'chat',
      location: 'Chat Message',
      time_ago: formatTimeAgo(interactionDate),
      interaction_date: interactionDate.toISOString(),
    };
  }
};

// =====================================================
// ARRAY GENERATORS
// =====================================================

/**
 * Generate array of mock suggested friends
 */
export const createMockSuggestedFriends = (count: number = 5): SuggestedFriend[] => {
  return Array.from({ length: count }, () => createMockSuggestedFriend());
};

/**
 * Generate array of mock recent members
 */
export const createMockRecentMembers = (count: number = 8): RecentMember[] => {
  return Array.from({ length: count }, () => createMockRecentMember());
};

/**
 * Generate array of mock friend requests
 */
export const createMockFriendRequests = (count: number = 3): FriendRequest[] => {
  return Array.from({ length: count }, () => createMockFriendRequest());
};

/**
 * Generate array of mock friends
 */
export const createMockFriends = (count: number = 10): Friend[] => {
  return Array.from({ length: count }, () => createMockFriend());
};

// =====================================================
// RANDOM DATA GENERATORS
// =====================================================

/**
 * Generate a random UUID (mock version for testing)
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a random name
 */
export const generateRandomName = (): string => {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
    'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Harper', 'Hayden', 'Jamie',
    'Kendall', 'Logan', 'Marley', 'Parker', 'Peyton', 'Reese', 'Sage', 'Skyler'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

/**
 * Generate a random avatar URL
 */
export const generateRandomAvatar = (): string => {
  const avatarServices = [
    'https://i.pravatar.cc/150?img=',
    'https://randomuser.me/api/portraits/lego/',
  ];
  
  const service = avatarServices[0]; // Use pravatar for consistency
  const imageNumber = Math.floor(Math.random() * 70) + 1;
  
  return `${service}${imageNumber}`;
};

/**
 * Generate random sport tags
 */
export const generateRandomSportTags = (): string[] => {
  const sports = ['tennis', 'badminton', 'squash', 'pickleball', 'basketball', 'volleyball'];
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 sports
  const selectedSports = [];
  
  for (let i = 0; i < count; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    if (!selectedSports.includes(sport)) {
      selectedSports.push(sport);
    }
  }
  
  return selectedSports;
};

/**
 * Generate random venue name
 */
export const generateRandomVenue = (): string => {
  const venues = [
    'Riverside Sports Club',
    'Downtown Tennis Center',
    'Oakwood Recreation Center',
    'Sunset Sports Complex',
    'Metro Athletic Club',
    'Parkside Courts',
    'Elite Sports Academy',
    'Community Sports Center',
    'Westside Tennis Club',
    'Central Park Courts'
  ];
  
  return venues[Math.floor(Math.random() * venues.length)];
};

/**
 * Generate random court name
 */
export const generateRandomCourtName = (): string => {
  const courtTypes = ['Court', 'Field', 'Arena'];
  const courtType = courtTypes[Math.floor(Math.random() * courtTypes.length)];
  const courtNumber = Math.floor(Math.random() * 10) + 1;
  
  return `${courtType} ${courtNumber}`;
};

/**
 * Generate random friendship status
 */
export const generateRandomFriendshipStatus = (): 'none' | 'pending' | 'friends' => {
  const statuses: ('none' | 'pending' | 'friends')[] = ['none', 'pending', 'friends'];
  const weights = [0.7, 0.2, 0.1]; // 70% none, 20% pending, 10% friends
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return statuses[i];
    }
  }
  
  return 'none';
};

/**
 * Generate random friend request permission
 */
export const generateRandomFriendRequestPermission = (): FriendRequestPermission => {
  const permissions: FriendRequestPermission[] = ['everyone', 'friends-of-friends', 'no-one'];
  const weights = [0.6, 0.3, 0.1]; // 60% everyone, 30% friends-of-friends, 10% no-one
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < permissions.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return permissions[i];
    }
  }
  
  return 'everyone';
};

/**
 * Format time ago from date
 */
export const formatTimeAgo = (date: Date): string => {
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

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

// =====================================================
// SCENARIO GENERATORS
// =====================================================

/**
 * Generate a complete friends page data scenario
 */
export const createFriendsPageScenario = (scenario: 'empty' | 'light' | 'full' = 'full') => {
  switch (scenario) {
    case 'empty':
      return {
        suggested_friends: [],
        recent_members: [],
        friend_requests: [],
        privacy_settings: createMockPrivacySettings(),
      };
    
    case 'light':
      return {
        suggested_friends: createMockSuggestedFriends(2),
        recent_members: createMockRecentMembers(3),
        friend_requests: createMockFriendRequests(1),
        privacy_settings: createMockPrivacySettings(),
      };
    
    case 'full':
    default:
      return {
        suggested_friends: createMockSuggestedFriends(8),
        recent_members: createMockRecentMembers(12),
        friend_requests: createMockFriendRequests(4),
        privacy_settings: createMockPrivacySettings(),
      };
  }
};

/**
 * Generate test data for specific user scenarios
 */
export const createUserScenario = (userId: string, scenario: 'new_user' | 'active_user' | 'private_user') => {
  const basePrivacySettings = createMockPrivacySettings({ user_id: userId });
  
  switch (scenario) {
    case 'new_user':
      return {
        suggested_friends: createMockSuggestedFriends(1),
        recent_members: createMockRecentMembers(2),
        friend_requests: [],
        privacy_settings: { ...basePrivacySettings, allow_friend_requests: 'everyone' as FriendRequestPermission },
      };
    
    case 'active_user':
      return {
        suggested_friends: createMockSuggestedFriends(6),
        recent_members: createMockRecentMembers(10),
        friend_requests: createMockFriendRequests(3),
        privacy_settings: { ...basePrivacySettings, allow_friend_requests: 'friends-of-friends' as FriendRequestPermission },
      };
    
    case 'private_user':
      return {
        suggested_friends: createMockSuggestedFriends(2),
        recent_members: createMockRecentMembers(3),
        friend_requests: [],
        privacy_settings: { 
          ...basePrivacySettings, 
          allow_friend_requests: 'no-one' as FriendRequestPermission,
          show_online_status: false 
        },
      };
    
    default:
      return createFriendsPageScenario('full');
  }
};

// =====================================================
// DEVELOPMENT HELPERS
// =====================================================

/**
 * Create deterministic mock data for consistent testing
 */
export const createDeterministicMockData = (seed: string) => {
  // Simple seeded random number generator
  let seedValue = 0;
  for (let i = 0; i < seed.length; i++) {
    seedValue += seed.charCodeAt(i);
  }
  
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  // Override Math.random temporarily
  const originalRandom = Math.random;
  Math.random = seededRandom;
  
  const data = createFriendsPageScenario('full');
  
  // Restore original Math.random
  Math.random = originalRandom;
  
  return data;
};

/**
 * Log mock data for debugging
 */
export const logMockData = (data: any, label: string = 'Mock Data') => {
  if (__DEV__) {
    console.log(`[Friends Factory] ${label}:`, JSON.stringify(data, null, 2));
  }
};