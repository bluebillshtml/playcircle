/**
 * Friends System Type Definitions
 * 
 * Core TypeScript interfaces and types for the Friends page functionality.
 * These types ensure type safety across the friends feature implementation.
 */

// =====================================================
// CORE USER TYPES
// =====================================================

/**
 * Base user interface for friends functionality
 */
export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended user interface with online status
 */
export interface UserWithStatus extends User {
  online_status?: boolean;
  last_seen?: string;
  sport_preferences?: string[];
}

// =====================================================
// FRIENDSHIP TYPES
// =====================================================

/**
 * Friendship status enumeration
 */
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

/**
 * Friendship relationship interface
 */
export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  status: FriendshipStatus;
  requested_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Friend request interface for UI display
 */
export interface FriendRequest {
  id: string;
  from_user: User;
  to_user_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Simplified friend interface for lists
 */
export interface Friend {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  friendship_date: string;
  online_status?: boolean;
}

// =====================================================
// SUGGESTED FRIENDS TYPES
// =====================================================

/**
 * Suggested friend interface with interaction context
 */
export interface SuggestedFriend {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  mutual_sessions: number;
  sport_tags: string[];
  last_played_together: string;
  friendship_status: 'none' | 'pending' | 'friends';
}

/**
 * Sport tag interface for suggested friends
 */
export interface SportTag {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

// =====================================================
// RECENT MEMBERS TYPES
// =====================================================

/**
 * Interaction type enumeration
 */
export type InteractionType = 'session' | 'chat';

/**
 * Interaction context interface
 */
export interface InteractionContext {
  type: InteractionType;
  location: string;
  court_name?: string;
  session_title?: string;
  time_ago: string;
  interaction_date: string;
  interaction_time?: string;
}

/**
 * Recent member interface with interaction details
 */
export interface RecentMember {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  last_interaction: InteractionContext;
  friendship_status: 'none' | 'pending' | 'friends';
  online_status?: boolean;
}

// =====================================================
// PRIVACY SETTINGS TYPES
// =====================================================

/**
 * Friend request permission levels
 */
export type FriendRequestPermission = 'everyone' | 'friends-of-friends' | 'no-one';

/**
 * Privacy settings interface
 */
export interface PrivacySettings {
  user_id: string;
  allow_friend_requests: FriendRequestPermission;
  show_online_status: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Privacy settings update payload
 */
export interface PrivacySettingsUpdate {
  allow_friend_requests?: FriendRequestPermission;
  show_online_status?: boolean;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Friends API responses
 */
export type SuggestedFriendsResponse = ApiResponse<SuggestedFriend[]>;
export type RecentMembersResponse = ApiResponse<RecentMember[]>;
export type FriendRequestsResponse = ApiResponse<FriendRequest[]>;
export type FriendsListResponse = ApiResponse<Friend[]>;
export type PrivacySettingsResponse = ApiResponse<PrivacySettings>;

// =====================================================
// SEARCH AND FILTERING TYPES
// =====================================================

/**
 * Search query interface
 */
export interface SearchQuery {
  query: string;
  filters?: {
    sport_tags?: string[];
    interaction_type?: InteractionType[];
    friendship_status?: FriendshipStatus[];
  };
}

/**
 * Search results interface
 */
export interface SearchResults {
  suggested_friends: SuggestedFriend[];
  recent_members: RecentMember[];
  searchable_users: User[];
  total_count: number;
}

// =====================================================
// UI STATE TYPES
// =====================================================

/**
 * Loading states for different sections
 */
export interface LoadingStates {
  suggested_friends: boolean;
  recent_members: boolean;
  friend_requests: boolean;
  privacy_settings: boolean;
  search: boolean;
}

/**
 * Error states for different sections
 */
export interface ErrorStates {
  suggested_friends: string | null;
  recent_members: string | null;
  friend_requests: string | null;
  privacy_settings: string | null;
  search: string | null;
}

/**
 * Friends page state interface
 */
export interface FriendsPageState {
  suggested_friends: SuggestedFriend[];
  recent_members: RecentMember[];
  friend_requests: FriendRequest[];
  privacy_settings: PrivacySettings | null;
  search_query: string;
  search_results: SearchResults | null;
  loading: LoadingStates;
  errors: ErrorStates;
  settings_visible: boolean;
}

// =====================================================
// ACTION TYPES
// =====================================================

/**
 * Friend action types for user interactions
 */
export type FriendAction = 'add_friend' | 'message' | 'invite' | 'accept_request' | 'decline_request';

/**
 * Friend action payload interface
 */
export interface FriendActionPayload {
  action: FriendAction;
  user_id: string;
  request_id?: string;
  additional_data?: Record<string, any>;
}

/**
 * Friend action result interface
 */
export interface FriendActionResult {
  success: boolean;
  error?: string;
  updated_status?: FriendshipStatus;
  friendship_id?: string;
}

// =====================================================
// VALIDATION TYPES
// =====================================================

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Friend request validation interface
 */
export interface FriendRequestValidation extends ValidationResult {
  can_send: boolean;
  reason?: string;
}

// =====================================================
// REAL-TIME UPDATE TYPES
// =====================================================

/**
 * Real-time update event types
 */
export type FriendsUpdateEvent = 
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'friend_request_declined'
  | 'friend_removed'
  | 'user_online_status_changed';

/**
 * Real-time update payload interface
 */
export interface FriendsUpdatePayload {
  event: FriendsUpdateEvent;
  user_id: string;
  friendship_id?: string;
  request_id?: string;
  data?: Record<string, any>;
  timestamp: string;
}

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

/**
 * FriendChip component props
 */
export interface FriendChipProps {
  user: SuggestedFriend;
  onAddFriend: (userId: string) => Promise<void>;
  onMessage: (userId: string) => void;
  onInvite: (userId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * MemberRow component props
 */
export interface MemberRowProps {
  user: RecentMember;
  onAddFriend: (userId: string) => Promise<void>;
  onMessage: (userId: string) => void;
  onInvite: (userId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * RequestStrip component props
 */
export interface RequestStripProps {
  request: FriendRequest;
  onAccept: (requestId: string) => Promise<void>;
  onDecline: (requestId: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * SettingsBottomSheet component props
 */
export interface SettingsBottomSheetProps {
  visible: boolean;
  settings: PrivacySettings | null;
  onClose: () => void;
  onUpdateSettings: (settings: PrivacySettingsUpdate) => Promise<void>;
  loading?: boolean;
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Type guard for checking if user is a suggested friend
 */
export const isSuggestedFriend = (user: any): user is SuggestedFriend => {
  return user && typeof user.mutual_sessions === 'number' && Array.isArray(user.sport_tags);
};

/**
 * Type guard for checking if user is a recent member
 */
export const isRecentMember = (user: any): user is RecentMember => {
  return user && user.last_interaction && typeof user.last_interaction.type === 'string';
};

/**
 * Type guard for checking if item is a friend request
 */
export const isFriendRequest = (item: any): item is FriendRequest => {
  return item && item.from_user && typeof item.status === 'string';
};

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Default privacy settings
 */
export const DEFAULT_PRIVACY_SETTINGS: Omit<PrivacySettings, 'user_id' | 'created_at' | 'updated_at'> = {
  allow_friend_requests: 'everyone',
  show_online_status: true,
};

/**
 * Friend request permission labels
 */
export const FRIEND_REQUEST_PERMISSION_LABELS: Record<FriendRequestPermission, string> = {
  everyone: 'Everyone',
  'friends-of-friends': 'Friends of friends',
  'no-one': 'No one',
};

/**
 * Friendship status labels
 */
export const FRIENDSHIP_STATUS_LABELS: Record<FriendshipStatus, string> = {
  pending: 'Pending',
  accepted: 'Friends',
  declined: 'Declined',
  blocked: 'Blocked',
};

/**
 * Interaction type labels
 */
export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  session: 'Played together',
  chat: 'Chatted',
};

/**
 * Maximum items per page for pagination
 */
export const FRIENDS_PAGE_SIZE = 20;

/**
 * Search debounce delay in milliseconds
 */
export const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * Cache duration for friends data in milliseconds
 */
export const FRIENDS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes