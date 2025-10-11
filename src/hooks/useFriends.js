/**
 * useFriends Hook
 * 
 * Custom React hook for managing friends functionality state and operations.
 * Provides data fetching, search, friend request operations, and privacy settings management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { friendsService } from '../services/friendsService';
import {
  SuggestedFriend,
  RecentMember,
  FriendRequest,
  PrivacySettings,
  PrivacySettingsUpdate,
  LoadingStates,
  ErrorStates,
  SearchResults,
  FriendsUpdatePayload,
} from '../types/friends';
import {
  filterSuggestedFriends,
  filterRecentMembers,
  sortSuggestedFriends,
  sortRecentMembers,
  deduplicateUsers,
} from '../utils/friendsTransformers';

// =====================================================
// HOOK CONFIGURATION
// =====================================================

const SEARCH_DEBOUNCE_DELAY = 300;
const RETRY_DELAY = 1000;
const MAX_RETRY_ATTEMPTS = 3;

// =====================================================
// INITIAL STATES
// =====================================================

const initialLoadingStates = {
  suggested_friends: false,
  recent_members: false,
  friend_requests: false,
  privacy_settings: false,
  search: false,
};

const initialErrorStates = {
  suggested_friends: null,
  recent_members: null,
  friend_requests: null,
  privacy_settings: null,
  search: null,
};

// =====================================================
// MAIN HOOK
// =====================================================

export const useFriends = () => {
  const { user } = useAuth();
  
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(initialLoadingStates);
  const [errors, setErrors] = useState(initialErrorStates);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // =====================================================
  // REFS AND CLEANUP
  // =====================================================
  
  const searchTimeoutRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const retryAttemptsRef = useRef({});
  const mountedRef = useRef(true);

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const setLoadingState = useCallback((key, value) => {
    if (!mountedRef.current) return;
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setErrorState = useCallback((key, value) => {
    if (!mountedRef.current) return;
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearError = useCallback((key) => {
    setErrorState(key, null);
  }, [setErrorState]);

  const showErrorAlert = useCallback((title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  // =====================================================
  // DATA FETCHING FUNCTIONS
  // =====================================================

  const fetchSuggestedFriends = useCallback(async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoadingState('suggested_friends', true);
      clearError('suggested_friends');

      const response = await friendsService.getSuggestedFriends(user.id);
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        const sortedFriends = sortSuggestedFriends(response.data);
        setSuggestedFriends(sortedFriends);
        retryAttemptsRef.current.suggested_friends = 0;
      } else {
        throw new Error(response.error || 'Failed to fetch suggested friends');
      }
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      if (!mountedRef.current) return;
      
      setErrorState('suggested_friends', error.message);
      
      // Retry logic
      const attempts = retryAttemptsRef.current.suggested_friends || 0;
      if (attempts < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current.suggested_friends = attempts + 1;
        setTimeout(() => fetchSuggestedFriends(false), RETRY_DELAY * (attempts + 1));
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoadingState('suggested_friends', false);
      }
    }
  }, [user?.id, setLoadingState, clearError, setErrorState]);

  const fetchRecentMembers = useCallback(async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoadingState('recent_members', true);
      clearError('recent_members');

      const response = await friendsService.getRecentMembers(user.id);
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        const sortedMembers = sortRecentMembers(response.data);
        const deduplicatedMembers = deduplicateUsers(sortedMembers);
        setRecentMembers(deduplicatedMembers);
        retryAttemptsRef.current.recent_members = 0;
      } else {
        throw new Error(response.error || 'Failed to fetch recent members');
      }
    } catch (error) {
      console.error('Error fetching recent members:', error);
      if (!mountedRef.current) return;
      
      setErrorState('recent_members', error.message);
      
      // Retry logic
      const attempts = retryAttemptsRef.current.recent_members || 0;
      if (attempts < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current.recent_members = attempts + 1;
        setTimeout(() => fetchRecentMembers(false), RETRY_DELAY * (attempts + 1));
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoadingState('recent_members', false);
      }
    }
  }, [user?.id, setLoadingState, clearError, setErrorState]);

  const fetchFriendRequests = useCallback(async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoadingState('friend_requests', true);
      clearError('friend_requests');

      const response = await friendsService.getPendingFriendRequests(user.id);
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        setFriendRequests(response.data);
        retryAttemptsRef.current.friend_requests = 0;
      } else {
        throw new Error(response.error || 'Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      if (!mountedRef.current) return;
      
      setErrorState('friend_requests', error.message);
      
      // Retry logic
      const attempts = retryAttemptsRef.current.friend_requests || 0;
      if (attempts < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current.friend_requests = attempts + 1;
        setTimeout(() => fetchFriendRequests(false), RETRY_DELAY * (attempts + 1));
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoadingState('friend_requests', false);
      }
    }
  }, [user?.id, setLoadingState, clearError, setErrorState]);

  const fetchPrivacySettings = useCallback(async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoadingState('privacy_settings', true);
      clearError('privacy_settings');

      const response = await friendsService.getPrivacySettings(user.id);
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        setPrivacySettings(response.data);
        retryAttemptsRef.current.privacy_settings = 0;
      } else {
        throw new Error(response.error || 'Failed to fetch privacy settings');
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      if (!mountedRef.current) return;
      
      setErrorState('privacy_settings', error.message);
      
      // Retry logic
      const attempts = retryAttemptsRef.current.privacy_settings || 0;
      if (attempts < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current.privacy_settings = attempts + 1;
        setTimeout(() => fetchPrivacySettings(false), RETRY_DELAY * (attempts + 1));
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoadingState('privacy_settings', false);
      }
    }
  }, [user?.id, setLoadingState, clearError, setErrorState]);

  // =====================================================
  // FRIEND REQUEST OPERATIONS
  // =====================================================

  const sendFriendRequest = useCallback(async (recipientId) => {
    if (!user?.id) {
      showErrorAlert('Error', 'You must be logged in to send friend requests');
      return false;
    }

    try {
      const result = await friendsService.sendFriendRequest(user.id, recipientId);
      
      if (result.success) {
        // Optimistically update the UI
        setSuggestedFriends(prev => 
          prev.map(friend => 
            friend.id === recipientId 
              ? { ...friend, friendship_status: 'pending' }
              : friend
          )
        );
        
        setRecentMembers(prev => 
          prev.map(member => 
            member.id === recipientId 
              ? { ...member, friendship_status: 'pending' }
              : member
          )
        );

        // Refresh data to get accurate state
        setTimeout(() => {
          fetchSuggestedFriends(false);
          fetchRecentMembers(false);
        }, 500);

        return true;
      } else {
        showErrorAlert('Friend Request Failed', result.error || 'Unable to send friend request');
        return false;
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      showErrorAlert('Error', 'An unexpected error occurred');
      return false;
    }
  }, [user?.id, showErrorAlert, fetchSuggestedFriends, fetchRecentMembers]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    console.log('useFriends: acceptFriendRequest called with:', { requestId, userId: user?.id });
    if (!user?.id) {
      showErrorAlert('Error', 'You must be logged in to accept friend requests');
      return false;
    }

    try {
      const result = await friendsService.acceptFriendRequest(requestId, user.id);
      console.log('useFriends: acceptFriendRequest result:', result);
      
      if (result.success) {
        // Optimistically update the UI
        setFriendRequests(prev => prev.filter(request => request.id !== requestId));
        
        // Refresh data to get accurate state
        setTimeout(() => {
          fetchFriendRequests(false);
          fetchSuggestedFriends(false);
          fetchRecentMembers(false);
        }, 500);

        return true;
      } else {
        console.error('useFriends: acceptFriendRequest failed:', result.error);
        showErrorAlert('Accept Request Failed', result.error || 'Unable to accept friend request');
        return false;
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showErrorAlert('Error', 'An unexpected error occurred');
      return false;
    }
  }, [user?.id, showErrorAlert, fetchFriendRequests, fetchSuggestedFriends, fetchRecentMembers]);

  const declineFriendRequest = useCallback(async (requestId) => {
    console.log('useFriends: declineFriendRequest called with:', { requestId, userId: user?.id });
    if (!user?.id) {
      showErrorAlert('Error', 'You must be logged in to decline friend requests');
      return false;
    }

    try {
      const result = await friendsService.declineFriendRequest(requestId, user.id);
      console.log('useFriends: declineFriendRequest result:', result);
      
      if (result.success) {
        // Optimistically update the UI
        setFriendRequests(prev => prev.filter(request => request.id !== requestId));
        
        // Refresh data to get accurate state
        setTimeout(() => {
          fetchFriendRequests(false);
        }, 500);

        return true;
      } else {
        console.error('useFriends: declineFriendRequest failed:', result.error);
        showErrorAlert('Decline Request Failed', result.error || 'Unable to decline friend request');
        return false;
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      showErrorAlert('Error', 'An unexpected error occurred');
      return false;
    }
  }, [user?.id, showErrorAlert, fetchFriendRequests]);

  // =====================================================
  // PRIVACY SETTINGS OPERATIONS
  // =====================================================

  const updatePrivacySettings = useCallback(async (settings) => {
    if (!user?.id) {
      showErrorAlert('Error', 'You must be logged in to update privacy settings');
      return false;
    }

    try {
      setLoadingState('privacy_settings', true);
      
      const response = await friendsService.updatePrivacySettings(user.id, settings);
      
      if (!mountedRef.current) return false;

      if (response.success && response.data) {
        setPrivacySettings(response.data);
        return true;
      } else {
        showErrorAlert('Update Failed', response.error || 'Unable to update privacy settings');
        return false;
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      showErrorAlert('Error', 'An unexpected error occurred');
      return false;
    } finally {
      if (mountedRef.current) {
        setLoadingState('privacy_settings', false);
      }
    }
  }, [user?.id, showErrorAlert, setLoadingState]);

  // =====================================================
  // SEARCH FUNCTIONALITY
  // =====================================================

  const performSearch = useCallback(async (query) => {
    if (!user?.id || !query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setLoadingState('search', true);
      clearError('search');

      const response = await friendsService.searchUsers(user.id, query);
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        setSearchResults({
          suggested_friends: response.data.suggested_friends,
          recent_members: response.data.recent_members,
          searchable_users: response.data.searchable_users || [],
          total_count: response.data.suggested_friends.length + response.data.recent_members.length + (response.data.searchable_users?.length || 0),
        });
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      if (!mountedRef.current) return;
      
      setErrorState('search', error.message);
      setSearchResults(null);
    } finally {
      if (mountedRef.current) {
        setLoadingState('search', false);
      }
    }
  }, [user?.id, setLoadingState, clearError, setErrorState]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, clear results immediately
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, SEARCH_DEBOUNCE_DELAY);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    clearError('search');
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [clearError]);

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  const setupRealTimeSubscriptions = useCallback(() => {
    if (!user?.id) return;

    // Subscribe to friend request updates
    const friendRequestsUnsubscribe = friendsService.subscribeToFriendRequests(
      user.id,
      (payload) => {
        console.log('Friend request update:', payload);
        
        // Refresh friend requests when there's an update
        fetchFriendRequests(false);
        
        // Also refresh other data that might be affected
        if (payload.event === 'friend_request_accepted') {
          fetchSuggestedFriends(false);
          fetchRecentMembers(false);
        }
      }
    );

    // Subscribe to privacy settings updates
    const privacySettingsUnsubscribe = friendsService.subscribeToPrivacySettings(
      user.id,
      (settings) => {
        console.log('Privacy settings updated:', settings);
        setPrivacySettings(settings);
      }
    );

    subscriptionsRef.current = [
      friendRequestsUnsubscribe,
      privacySettingsUnsubscribe,
    ];
  }, [user?.id, fetchFriendRequests, fetchSuggestedFriends, fetchRecentMembers]);

  // =====================================================
  // REFRESH AND RETRY FUNCTIONS
  // =====================================================

  const refreshAll = useCallback(async () => {
    if (!user?.id) return;

    const promises = [
      fetchSuggestedFriends(),
      fetchRecentMembers(),
      fetchFriendRequests(),
      fetchPrivacySettings(),
    ];

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [user?.id, fetchSuggestedFriends, fetchRecentMembers, fetchFriendRequests, fetchPrivacySettings]);

  const retryFailedRequests = useCallback(() => {
    if (errors.suggested_friends) fetchSuggestedFriends();
    if (errors.recent_members) fetchRecentMembers();
    if (errors.friend_requests) fetchFriendRequests();
    if (errors.privacy_settings) fetchPrivacySettings();
  }, [errors, fetchSuggestedFriends, fetchRecentMembers, fetchFriendRequests, fetchPrivacySettings]);

  // =====================================================
  // EFFECTS
  // =====================================================

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      refreshAll();
      setupRealTimeSubscriptions();
    }
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Unsubscribe from real-time updates
      subscriptionsRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      
      // Clear service caches
      friendsService.clearAllCaches();
    };
  }, []);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const hasAnyData = suggestedFriends.length > 0 || recentMembers.length > 0;
  const hasAnyErrors = Object.values(errors).some(error => error !== null);
  const isAnyLoading = Object.values(loading).some(isLoading => isLoading);
  const hasSearchResults = searchResults && searchResults.total_count > 0;

  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================

  return {
    // Data
    suggestedFriends,
    recentMembers,
    friendRequests,
    privacySettings,
    
    // Search
    searchQuery,
    searchResults,
    handleSearch,
    clearSearch,
    hasSearchResults,
    
    // Loading states
    loading,
    isAnyLoading,
    
    // Error states
    errors,
    hasAnyErrors,
    clearError,
    retryFailedRequests,
    
    // Friend operations
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    
    // Privacy settings
    updatePrivacySettings,
    
    // Settings modal
    settingsVisible,
    setSettingsVisible,
    
    // Utility functions
    refreshAll,
    hasAnyData,
    
    // Computed values for UI
    hasPendingRequests: friendRequests.length > 0,
    suggestedFriendsCount: suggestedFriends.length,
    recentMembersCount: recentMembers.length,
    pendingRequestsCount: friendRequests.length,
  };
};

export default useFriends;