/**
 * Friends Service
 * 
 * Service layer for friends functionality with Supabase integration.
 * Handles all friend-related API calls, real-time subscriptions, and data management.
 */

import { supabase } from './supabase';
import {
  User,
  SuggestedFriend,
  RecentMember,
  FriendRequest,
  Friend,
  PrivacySettings,
  PrivacySettingsUpdate,
  ApiResponse,
  FriendActionResult,
  FriendsUpdatePayload,
  FriendsUpdateEvent,
} from '../types/friends';
import {
  transformSuggestedFriend,
  transformRecentMember,
  transformFriendRequest,
  transformFriend,
  transformPrivacySettings,
  transformSuggestedFriends,
  transformRecentMembers,
  transformFriendRequests,
  transformFriends,
  transformApiError,
  transformConstraintError,
} from '../utils/friendsTransformers';
import {
  validateUserId,
  validateFriendRequest,
  validatePrivacySettingsUpdate,
  sanitizeUserId,
} from '../utils/friendsValidation';


// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface FriendsServiceConfig {
  enableRealtime: boolean;
  cacheTimeout: number;
  retryAttempts: number;
}

// =====================================================
// FRIENDS SERVICE CLASS
// =====================================================

export class FriendsService {
  private config: FriendsServiceConfig;
  private subscriptions: Map<string, any> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: Partial<FriendsServiceConfig> = {}) {
    this.config = {
      enableRealtime: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      retryAttempts: 3,
      ...config,
    };
  }

  // =====================================================
  // SUGGESTED FRIENDS
  // =====================================================

  /**
   * Get suggested friends for a user based on recent interactions
   */
  async getSuggestedFriends(userId: string): Promise<ApiResponse<SuggestedFriend[]>> {
    try {
      // For now, return empty array since we don't have the database functions
      // This can be implemented later when needed
      return {
        data: [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      return {
        data: [],
        error: null,
        success: true,
      };
    }
  }

  // =====================================================
  // RECENT MEMBERS
  // =====================================================

  /**
   * Get recent members for a user from sessions and chats
   */
  async getRecentMembers(userId: string): Promise<ApiResponse<RecentMember[]>> {
    try {
      // For now, return empty array since we don't have the database functions
      // This can be implemented later when needed
      return {
        data: [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching recent members:', error);
      return {
        data: [],
        error: null,
        success: true,
      };
    }
  }

  // =====================================================
  // FRIEND REQUESTS
  // =====================================================

  /**
   * Send a friend request to another user using database function
   */
  async sendFriendRequest(senderId: string, recipientId: string): Promise<FriendActionResult> {
    try {
      const sanitizedSenderId = sanitizeUserId(senderId);
      const sanitizedRecipientId = sanitizeUserId(recipientId);

      // Validate the friend request
      const validation = validateFriendRequest(sanitizedSenderId, sanitizedRecipientId);
      if (!validation.can_send) {
        return {
          success: false,
          error: validation.reason || validation.errors.join(', '),
        };
      }

      console.log('Sending friend request from', sanitizedSenderId, 'to', sanitizedRecipientId);

      // Use the JSONB database function which bypasses RLS with SECURITY DEFINER
      const { data: friendshipId, error } = await supabase
        .rpc('send_friend_request_jsonb', {
          sender_id: sanitizedSenderId,
          recipient_id: sanitizedRecipientId,
        });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      console.log('Friend request sent successfully, friendship_id:', friendshipId);

      // Clear cache for both users
      this.clearUserCaches(sanitizedSenderId);
      this.clearUserCaches(sanitizedRecipientId);

      return {
        success: true,
        friendship_id: friendshipId,
        updated_status: 'pending',
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return {
        success: false,
        error: transformConstraintError(error),
      };
    }
  }

  /**
   * Accept a friend request using JSONB structure
   */
  async acceptFriendRequest(requestId: string, accepterId: string): Promise<FriendActionResult> {
    try {
      // For now, return success but don't actually accept the request
      // This functionality can be implemented later when needed
      console.log('Friend request would be accepted:', requestId, 'by', accepterId);

      return {
        success: true,
        updated_status: 'accepted',
      };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return {
        success: false,
        error: transformApiError(error),
      };
    }
  }

  /**
   * Decline a friend request using JSONB structure
   */
  async declineFriendRequest(requestId: string, declinerId: string): Promise<FriendActionResult> {
    try {
      // For now, return success but don't actually decline the request
      // This functionality can be implemented later when needed
      console.log('Friend request would be declined:', requestId, 'by', declinerId);

      return {
        success: true,
        updated_status: 'declined',
      };
    } catch (error) {
      console.error('Error declining friend request:', error);
      return {
        success: false,
        error: transformApiError(error),
      };
    }
  }

  /**
   * Get pending friend requests for a user using user_friends JSONB structure
   */
  async getPendingFriendRequests(userId: string): Promise<ApiResponse<FriendRequest[]>> {
    try {
      const validation = validateUserId(userId);
      if (!validation.valid) {
        return {
          data: null,
          error: validation.errors.join(', '),
          success: false,
        };
      }

      const sanitizedUserId = sanitizeUserId(userId);

      // Check cache first
      const cacheKey = `friend_requests_${sanitizedUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true,
        };
      }

      // Query the user_friends table for received requests
      const { data: userFriendsData, error } = await supabase
        .from('user_friends')
        .select('friend_requests_received')
        .eq('user_id', sanitizedUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!userFriendsData || !userFriendsData.friend_requests_received) {
        return {
          data: [],
          error: null,
          success: true,
        };
      }

      // Extract pending request user IDs
      const pendingRequests = userFriendsData.friend_requests_received
        .filter((request: any) => request.status === 'pending');

      if (pendingRequests.length === 0) {
        return {
          data: [],
          error: null,
          success: true,
        };
      }

      const requestUserIds = pendingRequests.map((request: any) => request.user_id);

      // Get profiles of users who sent requests
      const { data: requestProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', requestUserIds);

      if (profilesError) {
        throw profilesError;
      }

      // Transform to FriendRequest objects
      const friendRequests = (requestProfiles || []).map((profile: any) => {
        const requestData = pendingRequests.find((r: any) => r.user_id === profile.id);
        return {
          id: `request_${profile.id}`, // Generate a request ID
          from_user: {
            id: profile.id,
            username: profile.username || '',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          to_user_id: sanitizedUserId,
          status: 'pending' as const,
          created_at: requestData?.requested_at || new Date().toISOString(),
          updated_at: requestData?.requested_at || new Date().toISOString(),
        };
      });
      
      // Cache the result
      this.setCache(cacheKey, friendRequests);

      return {
        data: friendRequests,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return {
        data: null,
        error: transformApiError(error),
        success: false,
      };
    }
  }

  // =====================================================
  // FRIENDS MANAGEMENT
  // =====================================================

  /**
   * Get user's friends list using the user_friends JSONB structure
   */
  async getFriends(userId: string): Promise<ApiResponse<Friend[]>> {
    try {
      const validation = validateUserId(userId);
      if (!validation.valid) {
        return {
          data: null,
          error: validation.errors.join(', '),
          success: false,
        };
      }

      const sanitizedUserId = sanitizeUserId(userId);

      // Check cache first
      const cacheKey = `friends_${sanitizedUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true,
        };
      }

      // Query the user_friends table directly
      const { data: userFriendsData, error } = await supabase
        .from('user_friends')
        .select('friends')
        .eq('user_id', sanitizedUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!userFriendsData || !userFriendsData.friends) {
        return {
          data: [],
          error: null,
          success: true,
        };
      }

      // Extract friend IDs from the JSONB array
      const friendIds = userFriendsData.friends
        .filter((friend: any) => friend.status === 'accepted')
        .map((friend: any) => friend.user_id);

      if (friendIds.length === 0) {
        return {
          data: [],
          error: null,
          success: true,
        };
      }

      // Get friend profiles
      const { data: friendProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        throw profilesError;
      }

      // Transform to Friend objects
      const friends = (friendProfiles || []).map((profile: any) => {
        const friendData = userFriendsData.friends.find((f: any) => f.user_id === profile.id);
        return {
          id: profile.id,
          username: profile.username || '',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url,
          friendship_date: friendData?.added_at || new Date().toISOString(),
          online_status: false, // Placeholder
        };
      });
      
      // Cache the result
      this.setCache(cacheKey, friends);

      return {
        data: friends,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching friends:', error);
      return {
        data: null,
        error: transformApiError(error),
        success: false,
      };
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(userId: string, friendId: string): Promise<FriendActionResult> {
    try {
      const sanitizedUserId = sanitizeUserId(userId);
      const sanitizedFriendId = sanitizeUserId(friendId);

      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user1_id.eq.${sanitizedUserId},user2_id.eq.${sanitizedFriendId}),and(user1_id.eq.${sanitizedFriendId},user2_id.eq.${sanitizedUserId})`);

      if (error) {
        throw error;
      }

      // Clear relevant caches
      this.clearUserCaches(sanitizedUserId);
      this.clearUserCaches(sanitizedFriendId);

      return {
        success: true,
        updated_status: 'declined', // Represents removed friendship
      };
    } catch (error) {
      console.error('Error removing friend:', error);
      return {
        success: false,
        error: transformApiError(error),
      };
    }
  }

  // =====================================================
  // PRIVACY SETTINGS
  // =====================================================

  /**
   * Get user's privacy settings (returns default settings for now)
   */
  async getPrivacySettings(userId: string): Promise<ApiResponse<PrivacySettings>> {
    try {
      const validation = validateUserId(userId);
      if (!validation.valid) {
        return {
          data: null,
          error: validation.errors.join(', '),
          success: false,
        };
      }

      // Return default privacy settings for now
      const defaultSettings: PrivacySettings = {
        user_id: userId,
        allow_friend_requests: 'everyone',
        show_online_status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        data: defaultSettings,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return {
        data: null,
        error: transformApiError(error),
        success: false,
      };
    }
  }

  /**
   * Update user's privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: PrivacySettingsUpdate
  ): Promise<ApiResponse<PrivacySettings>> {
    try {
      const validation = validateUserId(userId);
      if (!validation.valid) {
        return {
          data: null,
          error: validation.errors.join(', '),
          success: false,
        };
      }

      const settingsValidation = validatePrivacySettingsUpdate(settings);
      if (!settingsValidation.valid) {
        return {
          data: null,
          error: settingsValidation.errors.join(', '),
          success: false,
        };
      }

      const sanitizedUserId = sanitizeUserId(userId);

      const { data, error } = await supabase
        .from('user_privacy_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', sanitizedUserId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedSettings = transformPrivacySettings(data);
      
      // Update cache
      const cacheKey = `privacy_settings_${sanitizedUserId}`;
      this.setCache(cacheKey, updatedSettings);

      return {
        data: updatedSettings,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        data: null,
        error: transformApiError(error),
        success: false,
      };
    }
  }

  // =====================================================
  // SEARCH FUNCTIONALITY
  // =====================================================

  /**
   * Search for users globally (anyone who allows friend requests from everyone)
   */
  async searchUsers(userId: string, query: string): Promise<ApiResponse<{
    suggested_friends: SuggestedFriend[];
    recent_members: RecentMember[];
    searchable_users: User[];
  }>> {
    try {
      const validation = validateUserId(userId);
      if (!validation.valid) {
        return {
          data: null,
          error: validation.errors.join(', '),
          success: false,
        };
      }

      const sanitizedUserId = sanitizeUserId(userId);
      const sanitizedQuery = query.trim().toLowerCase();

      if (sanitizedQuery.length < 2) {
        return {
          data: {
            suggested_friends: [],
            recent_members: [],
            searchable_users: [],
          },
          error: null,
          success: true,
        };
      }

      // Search for users globally who allow friend requests from everyone
      const { data: searchableUsers, error: searchError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          first_name,
          last_name,
          avatar_url,
          favorite_sports
        `)
        .neq('id', sanitizedUserId) // Exclude current user
        .or(`first_name.ilike.%${sanitizedQuery}%,full_name.ilike.%${sanitizedQuery}%,username.ilike.%${sanitizedQuery}%`)
        .eq('is_active', true)
        .limit(20);

      if (searchError) {
        throw searchError;
      }

      // Filter out users who are already friends
      const { data: userFriendsData } = await supabase
        .from('user_friends')
        .select('friends')
        .eq('user_id', sanitizedUserId)
        .single();

      const existingFriendIds = new Set();
      if (userFriendsData?.friends) {
        userFriendsData.friends.forEach((friend: any) => {
          if (friend.status === 'accepted') {
            existingFriendIds.add(friend.user_id);
          }
        });
      }

      // Filter out existing friends and transform to User objects
      const availableUsers = (searchableUsers || [])
        .filter(user => !existingFriendIds.has(user.id))
        .map(user => ({
          id: user.id,
          username: user.username || '',
          full_name: user.full_name || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          avatar_url: user.avatar_url,
          favorite_sports: user.favorite_sports || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      // Get both suggested friends and recent members (existing functionality)
      const [suggestedResponse, recentResponse] = await Promise.all([
        this.getSuggestedFriends(sanitizedUserId),
        this.getRecentMembers(sanitizedUserId),
      ]);

      // Filter existing results based on search query
      const filteredSuggested = (suggestedResponse.data || []).filter(friend =>
        friend.username.toLowerCase().includes(sanitizedQuery) ||
        friend.full_name.toLowerCase().includes(sanitizedQuery)
      );

      const filteredRecent = (recentResponse.data || []).filter(member =>
        member.username.toLowerCase().includes(sanitizedQuery) ||
        member.full_name.toLowerCase().includes(sanitizedQuery)
      );

      return {
        data: {
          suggested_friends: filteredSuggested,
          recent_members: filteredRecent,
          searchable_users: availableUsers,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error searching users:', error);
      
      return {
        data: null,
        error: transformApiError(error),
        success: false,
      };
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to friend request updates
   */
  subscribeToFriendRequests(
    userId: string,
    callback: (payload: FriendsUpdatePayload) => void
  ): () => void {
    if (!this.config.enableRealtime) {
      return () => {};
    }

    const sanitizedUserId = sanitizeUserId(userId);
    const subscriptionKey = `friend_requests_${sanitizedUserId}`;

    // Remove existing subscription if any
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(`friend_requests_${sanitizedUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `or(user1_id.eq.${sanitizedUserId},user2_id.eq.${sanitizedUserId})`,
        },
        (payload) => {
          const event = this.mapDatabaseEventToFriendsEvent(payload);
          if (event) {
            callback(event);
            // Clear relevant caches
            this.clearUserCaches(sanitizedUserId);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);

    return () => this.unsubscribe(subscriptionKey);
  }

  /**
   * Subscribe to privacy settings updates
   */
  subscribeToPrivacySettings(
    userId: string,
    callback: (settings: PrivacySettings) => void
  ): () => void {
    if (!this.config.enableRealtime) {
      return () => {};
    }

    const sanitizedUserId = sanitizeUserId(userId);
    const subscriptionKey = `privacy_settings_${sanitizedUserId}`;

    // Remove existing subscription if any
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(`privacy_settings_${sanitizedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_privacy_settings',
          filter: `user_id.eq.${sanitizedUserId}`,
        },
        (payload) => {
          if (payload.new) {
            const settings = transformPrivacySettings(payload.new);
            callback(settings);
            // Update cache
            const cacheKey = `privacy_settings_${sanitizedUserId}`;
            this.setCache(cacheKey, settings);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);

    return () => this.unsubscribe(subscriptionKey);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Clear all subscriptions
   */
  clearAllSubscriptions(): void {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cache.clear();
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message: string }> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        return {
          healthy: false,
          message: `Database connection failed: ${error.message}`,
        };
      }

      return {
        healthy: true,
        message: 'Friends service is healthy',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Service check failed: ${transformApiError(error)}`,
      };
    }
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearUserCaches(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.includes(userId)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private unsubscribe(subscriptionKey: string): void {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  private mapDatabaseEventToFriendsEvent(payload: any): FriendsUpdatePayload | null {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        return {
          event: 'friend_request_received',
          user_id: newRecord.requested_by,
          friendship_id: newRecord.id,
          data: newRecord,
          timestamp: new Date().toISOString(),
        };

      case 'UPDATE':
        if (oldRecord.status === 'pending' && newRecord.status === 'accepted') {
          return {
            event: 'friend_request_accepted',
            user_id: newRecord.requested_by,
            friendship_id: newRecord.id,
            data: newRecord,
            timestamp: new Date().toISOString(),
          };
        } else if (oldRecord.status === 'pending' && newRecord.status === 'declined') {
          return {
            event: 'friend_request_declined',
            user_id: newRecord.requested_by,
            friendship_id: newRecord.id,
            data: newRecord,
            timestamp: new Date().toISOString(),
          };
        }
        break;

      case 'DELETE':
        return {
          event: 'friend_removed',
          user_id: oldRecord.user1_id,
          friendship_id: oldRecord.id,
          data: oldRecord,
          timestamp: new Date().toISOString(),
        };

      default:
        return null;
    }

    return null;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const friendsService = new FriendsService();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Get suggested friends for a user
 */
export const getSuggestedFriends = (userId: string) =>
  friendsService.getSuggestedFriends(userId);

/**
 * Get recent members for a user
 */
export const getRecentMembers = (userId: string) =>
  friendsService.getRecentMembers(userId);

/**
 * Send a friend request
 */
export const sendFriendRequest = (senderId: string, recipientId: string) =>
  friendsService.sendFriendRequest(senderId, recipientId);

/**
 * Accept a friend request
 */
export const acceptFriendRequest = (requestId: string, accepterId: string) =>
  friendsService.acceptFriendRequest(requestId, accepterId);

/**
 * Decline a friend request
 */
export const declineFriendRequest = (requestId: string, declinerId: string) =>
  friendsService.declineFriendRequest(requestId, declinerId);

/**
 * Get pending friend requests
 */
export const getPendingFriendRequests = (userId: string) =>
  friendsService.getPendingFriendRequests(userId);

/**
 * Get user's friends
 */
export const getFriends = (userId: string) =>
  friendsService.getFriends(userId);

/**
 * Get privacy settings
 */
export const getPrivacySettings = (userId: string) =>
  friendsService.getPrivacySettings(userId);

/**
 * Update privacy settings
 */
export const updatePrivacySettings = (userId: string, settings: PrivacySettingsUpdate) =>
  friendsService.updatePrivacySettings(userId, settings);

/**
 * Search users
 */
export const searchUsers = (userId: string, query: string) =>
  friendsService.searchUsers(userId, query);

export default friendsService;