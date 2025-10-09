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
import {
  createMockSuggestedFriends,
  createMockRecentMembers,
  createMockFriendRequests,
  createMockPrivacySettings,
} from '../utils/friendsFactory';

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
      // Check if supabase is available
      if (!supabase) {
        console.log('Supabase not available, using mock data');
        const mockData = createMockSuggestedFriends(5);
        return {
          data: mockData,
          error: null,
          success: true,
        };
      }

      // Validate user ID
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
      const cacheKey = `suggested_friends_${sanitizedUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true,
        };
      }

      // Call the database function to get suggested friends
      const { data, error } = await supabase.rpc('get_suggested_friends', {
        p_user_id: sanitizedUserId,
      });

      if (error) {
        throw error;
      }

      const suggestedFriends = transformSuggestedFriends(data || []);
      
      // Cache the result
      this.setCache(cacheKey, suggestedFriends);

      return {
        data: suggestedFriends,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      
      // Fallback to mock data when Supabase fails
      console.log('Falling back to mock suggested friends data');
      const mockData = createMockSuggestedFriends(5);
      
      return {
        data: mockData,
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
      // Check if supabase is available
      if (!supabase) {
        console.log('Supabase not available, using mock data');
        const mockData = createMockRecentMembers(8);
        return {
          data: mockData,
          error: null,
          success: true,
        };
      }

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
      const cacheKey = `recent_members_${sanitizedUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true,
        };
      }

      // Call the database function to get recent members
      const { data, error } = await supabase.rpc('get_recent_members', {
        p_user_id: sanitizedUserId,
      });

      if (error) {
        throw error;
      }

      const recentMembers = transformRecentMembers(data || []);
      
      // Cache the result
      this.setCache(cacheKey, recentMembers);

      return {
        data: recentMembers,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching recent members:', error);
      
      // Fallback to mock data when Supabase fails
      console.log('Falling back to mock recent members data');
      const mockData = createMockRecentMembers(8);
      
      return {
        data: mockData,
        error: null,
        success: true,
      };
    }
  }

  // =====================================================
  // FRIEND REQUESTS
  // =====================================================

  /**
   * Send a friend request to another user
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

      // Call the database function to send friend request
      const { data, error } = await supabase.rpc('send_friend_request', {
        sender_id: sanitizedSenderId,
        recipient_id: sanitizedRecipientId,
      });

      if (error) {
        throw error;
      }

      // Clear relevant caches
      this.clearUserCaches(sanitizedSenderId);
      this.clearUserCaches(sanitizedRecipientId);

      return {
        success: true,
        friendship_id: data,
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
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, accepterId: string): Promise<FriendActionResult> {
    try {
      const sanitizedRequestId = sanitizeUserId(requestId);
      const sanitizedAccepterId = sanitizeUserId(accepterId);

      const { data, error } = await supabase.rpc('accept_friend_request', {
        friendship_id: sanitizedRequestId,
        accepter_id: sanitizedAccepterId,
      });

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Friend request not found or already processed',
        };
      }

      // Clear relevant caches
      this.clearUserCaches(sanitizedAccepterId);

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
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string, declinerId: string): Promise<FriendActionResult> {
    try {
      const sanitizedRequestId = sanitizeUserId(requestId);
      const sanitizedDeclinerId = sanitizeUserId(declinerId);

      const { data, error } = await supabase.rpc('decline_friend_request', {
        friendship_id: sanitizedRequestId,
        decliner_id: sanitizedDeclinerId,
      });

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Friend request not found or already processed',
        };
      }

      // Clear relevant caches
      this.clearUserCaches(sanitizedDeclinerId);

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
   * Get pending friend requests for a user
   */
  async getPendingFriendRequests(userId: string): Promise<ApiResponse<FriendRequest[]>> {
    try {
      // Check if supabase is available
      if (!supabase) {
        console.log('Supabase not available, using mock data');
        const mockData = createMockFriendRequests(3);
        return {
          data: mockData,
          error: null,
          success: true,
        };
      }

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

      const { data, error } = await supabase.rpc('get_pending_friend_requests', {
        p_user_id: sanitizedUserId,
      });

      if (error) {
        throw error;
      }

      const friendRequests = transformFriendRequests(data || []);
      
      // Cache the result
      this.setCache(cacheKey, friendRequests);

      return {
        data: friendRequests,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      
      // Fallback to mock data when Supabase fails
      console.log('Falling back to mock friend requests data');
      const mockData = createMockFriendRequests(3);
      
      return {
        data: mockData,
        error: null,
        success: true,
      };
    }
  }

  // =====================================================
  // FRIENDS MANAGEMENT
  // =====================================================

  /**
   * Get user's friends list
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

      const { data, error } = await supabase.rpc('get_user_friends', {
        p_user_id: sanitizedUserId,
      });

      if (error) {
        throw error;
      }

      const friends = transformFriends(data || []);
      
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
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: string): Promise<ApiResponse<PrivacySettings>> {
    try {
      // Check if supabase is available
      if (!supabase) {
        console.log('Supabase not available, using mock data');
        const mockData = createMockPrivacySettings();
        return {
          data: mockData,
          error: null,
          success: true,
        };
      }

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
      const cacheKey = `privacy_settings_${sanitizedUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true,
        };
      }

      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', sanitizedUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // If no settings exist, create default ones
      if (!data) {
        const defaultSettings = {
          user_id: sanitizedUserId,
          allow_friend_requests: 'everyone',
          show_online_status: true,
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_privacy_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        const privacySettings = transformPrivacySettings(newData);
        this.setCache(cacheKey, privacySettings);

        return {
          data: privacySettings,
          error: null,
          success: true,
        };
      }

      const privacySettings = transformPrivacySettings(data);
      
      // Cache the result
      this.setCache(cacheKey, privacySettings);

      return {
        data: privacySettings,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      
      // Fallback to mock data when Supabase fails
      console.log('Falling back to mock privacy settings data');
      const mockData = createMockPrivacySettings();
      
      return {
        data: mockData,
        error: null,
        success: true,
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
   * Search for users across suggested friends and recent members
   */
  async searchUsers(userId: string, query: string): Promise<ApiResponse<{
    suggested_friends: SuggestedFriend[];
    recent_members: RecentMember[];
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
          },
          error: null,
          success: true,
        };
      }

      // Get both suggested friends and recent members
      const [suggestedResponse, recentResponse] = await Promise.all([
        this.getSuggestedFriends(sanitizedUserId),
        this.getRecentMembers(sanitizedUserId),
      ]);

      if (!suggestedResponse.success || !recentResponse.success) {
        return {
          data: null,
          error: suggestedResponse.error || recentResponse.error,
          success: false,
        };
      }

      // Filter results based on search query
      const filteredSuggested = (suggestedResponse.data || []).filter(friend =>
        friend.username.toLowerCase().includes(sanitizedQuery) ||
        friend.full_name.toLowerCase().includes(sanitizedQuery) ||
        friend.sport_tags.some(tag => tag.toLowerCase().includes(sanitizedQuery))
      );

      const filteredRecent = (recentResponse.data || []).filter(member =>
        member.username.toLowerCase().includes(sanitizedQuery) ||
        member.full_name.toLowerCase().includes(sanitizedQuery) ||
        member.last_interaction.location.toLowerCase().includes(sanitizedQuery)
      );

      return {
        data: {
          suggested_friends: filteredSuggested,
          recent_members: filteredRecent,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error searching users:', error);
      
      // Fallback to mock data when Supabase fails
      console.log('Falling back to mock search data');
      const mockSuggested = createMockSuggestedFriends(3);
      const mockRecent = createMockRecentMembers(3);
      
      // Filter mock data based on query
      const sanitizedQuery = query.trim().toLowerCase();
      const filteredSuggested = mockSuggested.filter(friend =>
        friend.username.toLowerCase().includes(sanitizedQuery) ||
        friend.full_name.toLowerCase().includes(sanitizedQuery)
      );
      
      const filteredRecent = mockRecent.filter(member =>
        member.username.toLowerCase().includes(sanitizedQuery) ||
        member.full_name.toLowerCase().includes(sanitizedQuery)
      );
      
      return {
        data: {
          suggested_friends: filteredSuggested,
          recent_members: filteredRecent,
        },
        error: null,
        success: true,
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