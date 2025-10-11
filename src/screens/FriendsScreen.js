import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useFriends from '../hooks/useFriends';
import FriendChip from '../components/FriendChip';
import MemberRow from '../components/MemberRow';
import RequestStrip from '../components/RequestStrip';
import SettingsBottomSheet from '../components/SettingsBottomSheet';
import ScreenHeader from '../components/ScreenHeader';
import AnimatedBackground from '../components/AnimatedBackground';
import SearchDropdown from '../components/SearchDropdown';

const FriendsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [isOffline, setIsOffline] = useState(false);
  const [searchDropdownVisible, setSearchDropdownVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const {
    // Data
    suggestedFriends,
    recentMembers,
    friendRequests,
    privacySettings,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Search
    searchQuery,
    searchResults,
    handleSearch,
    clearSearch,
    hasSearchResults,
    
    // Actions
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    updatePrivacySettings,
    
    // Settings modal
    settingsVisible,
    setSettingsVisible,
    
    // Utility
    refreshAll,
    hasAnyData,
    hasPendingRequests,
  } = useFriends();

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle search input changes
  const handleSearchInput = (query) => {
    handleSearch(query);
    const shouldShow = query.trim().length > 0;
    console.log('Search input:', query, 'Should show dropdown:', shouldShow);
    setSearchDropdownVisible(shouldShow);
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchDropdownVisible(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setSearchDropdownVisible(true);
    }
  };

  const handleSearchBlur = () => {
    // Keep dropdown visible for a brief moment to allow clicks
    setTimeout(() => setSearchDropdownVisible(false), 150);
  };

  const handleDropdownUserSelect = (user) => {
    // Close dropdown when user is selected
    setSearchDropdownVisible(false);
  };

  // Enhanced error handling utilities
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  };

  const isNetworkError = (error) => {
    const errorMessage = getErrorMessage(error).toLowerCase();
    return errorMessage.includes('network') || 
           errorMessage.includes('connection') || 
           errorMessage.includes('timeout') ||
           errorMessage.includes('fetch');
  };

  const showErrorWithRetry = (title, message, retryAction) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retry', 
          onPress: retryAction,
          style: 'default'
        }
      ]
    );
  };

  const showNetworkError = (retryAction) => {
    Alert.alert(
      'Connection Error',
      'Please check your internet connection and try again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retry', 
          onPress: retryAction,
          style: 'default'
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Haptic feedback for refresh
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await refreshAll();
      // Success haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error refreshing friends data:', error);
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = getErrorMessage(error);
      if (isNetworkError(error)) {
        showNetworkError(() => handleRefresh());
      } else {
        showErrorWithRetry(
          'Refresh Failed',
          errorMessage,
          () => handleRefresh()
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFriend = async (userId) => {
    if (actionLoading === `add-${userId}`) return;
    
    try {
      setActionLoading(`add-${userId}`);
      
      // Haptic feedback for add friend action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const success = await sendFriendRequest(userId);
      if (success) {
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Friend request sent!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = getErrorMessage(error);
      if (isNetworkError(error)) {
        showNetworkError(() => handleAddFriend(userId));
      } else {
        showErrorWithRetry(
          'Friend Request Failed',
          errorMessage,
          () => handleAddFriend(userId)
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessage = async (userId) => {
    if (actionLoading === `message-${userId}`) return;
    
    try {
      setActionLoading(`message-${userId}`);
      
      // Check if user has messaging permissions based on privacy settings
      if (privacySettings && !canMessageUser(userId, privacySettings)) {
        Alert.alert(
          'Cannot Message',
          'This user has restricted messaging to friends only.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show loading feedback
      Alert.alert('Opening Message', 'Loading chat...', [], { cancelable: false });

      // Navigate to chat thread - this will create a new chat or open existing one
      navigation.navigate('ChatThread', { 
        recipientId: userId,
        chatType: 'direct'
      });

      // Dismiss loading alert after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Chat opened successfully!');
      }, 500);

    } catch (error) {
      console.error('Error opening message thread:', error);
      Alert.alert(
        'Error',
        'Unable to open message thread. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleMessage(userId) }
        ]
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleInvite = async (userId) => {
    if (actionLoading === `invite-${userId}`) return;
    
    try {
      setActionLoading(`invite-${userId}`);
      
      // Check if user has invitation permissions based on privacy settings
      if (privacySettings && !canInviteUser(userId, privacySettings)) {
        Alert.alert(
          'Cannot Invite',
          'This user has restricted invitations to friends only.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show loading feedback
      Alert.alert('Opening Invitation', 'Loading invitation flow...', [], { cancelable: false });

      // Navigate to create match screen with pre-selected invitee
      navigation.navigate('CreateMatch', { 
        preSelectedInvitees: [userId]
      });

      // Dismiss loading alert after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Invitation flow opened successfully!');
      }, 500);

    } catch (error) {
      console.error('Error opening invitation flow:', error);
      Alert.alert(
        'Error',
        'Unable to open invitation flow. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleInvite(userId) }
        ]
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Helper functions to check privacy permissions
  const canMessageUser = (userId, settings) => {
    // If no privacy settings, allow messaging
    if (!settings) return true;
    
    // Check if messaging is restricted
    if (settings.allowMessaging === 'no_one') return false;
    if (settings.allowMessaging === 'friends_only') {
      // Would need to check if user is a friend - for now allow all
      return true;
    }
    
    return true;
  };

  const canInviteUser = (userId, settings) => {
    // If no privacy settings, allow invitations
    if (!settings) return true;
    
    // Check if invitations are restricted
    if (settings.allowInvitations === 'no_one') return false;
    if (settings.allowInvitations === 'friends_only') {
      // Would need to check if user is a friend - for now allow all
      return true;
    }
    
    return true;
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // Haptic feedback for accept action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const success = await acceptFriendRequest(requestId);
      if (success) {
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Friend request accepted!');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const success = await declineFriendRequest(requestId);
      if (success) {
        Alert.alert('Success', 'Friend request declined.');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const handleUpdatePrivacySettings = async (newSettings) => {
    try {
      await updatePrivacySettings(newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const renderSuggestedFriends = () => {
    // Always show regular suggested friends, never search results
    const friendsToShow = suggestedFriends;
    const isLoading = loading.suggested_friends && suggestedFriends.length === 0;

    if (isLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface + '40', borderRadius: 24, marginHorizontal: 24 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {hasSearchResults ? 'Searching...' : 'Finding suggested friends...'}
          </Text>
        </View>
      );
    }

    if (friendsToShow.length === 0) {
      const emptyTitle = 'No suggestions yet';
      const emptySubtitle = 'Play more games to discover new friends';

      return (
        <View style={[styles.emptyContainer, { backgroundColor: colors.surface + '40', borderRadius: 24, marginHorizontal: 24, borderWidth: 1, borderColor: colors.glassBorder }]}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="people-outline" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {emptyTitle}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {emptySubtitle}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {friendsToShow.map((friend) => (
          <FriendChip
            key={friend.id}
            user={friend}
            onAddFriend={handleAddFriend}
            onMessage={handleMessage}
            onInvite={handleInvite}
            isMessageLoading={actionLoading === `message-${friend.id}`}
            isInviteLoading={actionLoading === `invite-${friend.id}`}
          />
        ))}
      </ScrollView>
    );
  };

  const renderRecentMembers = () => {
    // Always show regular recent members, never search results
    const membersToShow = recentMembers;
    const isLoading = loading.recent_members && recentMembers.length === 0;

    if (isLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface + '40', borderRadius: 24, marginHorizontal: 24 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {hasSearchResults ? 'Searching...' : 'Loading recent members...'}
          </Text>
        </View>
      );
    }

    if (membersToShow.length === 0) {
      const emptyTitle = 'No recent interactions';
      const emptySubtitle = 'Members you\'ve played with will appear here';

      return (
        <View style={[styles.emptyContainer, { backgroundColor: colors.surface + '40', borderRadius: 24, marginHorizontal: 24, borderWidth: 1, borderColor: colors.glassBorder }]}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="time-outline" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {emptyTitle}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {emptySubtitle}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.membersContainer}>
        {membersToShow.map((member, index) => (
          <MemberRow
            key={member.id}
            user={member}
            onAddFriend={handleAddFriend}
            onMessage={handleMessage}
            showSeparator={index < membersToShow.length - 1}
            isMessageLoading={actionLoading === `message-${member.id}`}
          />
        ))}
      </View>
    );
  };


  const renderFriendRequests = () => {
    if (!hasPendingRequests) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
            Friend Requests
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{friendRequests.length}</Text>
          </View>
        </View>
        
        <View style={styles.requestsContainer}>
          {friendRequests.map((request) => (
            <RequestStrip
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          ))}
        </View>
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Header with Search Bar and Settings */}
        <View style={styles.header}>
          <View style={styles.searchBarContainer}>
            <View style={[styles.headerSearchBar, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.headerSearchInput, { color: colors.text }]}
                placeholder="Search friends"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchInput}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Dropdown - Outside of ScrollView to appear on top */}
        <SearchDropdown
          users={searchResults?.searchable_users || []}
          loading={loading.search}
          onUserSelect={handleDropdownUserSelect}
          onAddFriend={handleAddFriend}
          actionLoading={actionLoading}
          visible={searchDropdownVisible}
          style={styles.searchDropdownAbsolute}
        />

        {/* Content */}
        <Animated.ScrollView 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Empty State */}
          {!hasAnyData && !loading.suggested_friends && !loading.recent_members && (
            <View style={[styles.globalEmptyContainer, { backgroundColor: colors.surface + '40', borderRadius: 32, marginHorizontal: 24, borderWidth: 1, borderColor: colors.glassBorder }]}>
              <View style={[styles.globalEmptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="people-outline" size={72} color={colors.primary} />
              </View>
              <Text style={[styles.globalEmptyTitle, { color: colors.text }]}>
                Welcome to Friends!
              </Text>
              <Text style={[styles.globalEmptySubtitle, { color: colors.textSecondary }]}>
                Start playing games to discover and connect with other players
              </Text>
              <TouchableOpacity 
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Matches')}
              >
                <Ionicons name="search" size={20} color="#065F46" />
                <Text style={[styles.exploreButtonText, { color: '#065F46' }]}>
                  Explore Games
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Friend Requests Section */}
          {renderFriendRequests()}

          {/* Suggested Friends Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suggested Friends
            </Text>
            {renderSuggestedFriends()}
          </View>

          {/* Recent Members Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Members
            </Text>
            {renderRecentMembers()}
          </View>
        </Animated.ScrollView>

        {/* Settings Bottom Sheet */}
        <SettingsBottomSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          privacySettings={privacySettings}
          onUpdateSettings={handleUpdatePrivacySettings}
        />
      </View>
    </AnimatedBackground>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingLeft: 76,
    gap: 16,
    width: '100%',
  },
  searchBarContainer: {
    flex: 1,
  },
  searchDropdownAbsolute: {
    position: 'absolute',
    top: 130, // Position below the header
    left: 96, // Align with search bar (76 + 20)
    right: 88, // Account for settings button and padding
    zIndex: 99999,
  },
  headerSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 32,
    gap: 12,
    borderWidth: 1.5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  settingsButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 24,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sectionHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  membersContainer: {
    paddingHorizontal: 24,
    gap: 4,
  },
  requestsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 20,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  globalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 24,
  },
  globalEmptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  globalEmptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  globalEmptySubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: colors.surface + '80',
    borderRadius: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  searchResultsText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Searchable Users Styles
  searchUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  searchUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  searchUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchUserAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchUserDetails: {
    flex: 1,
    gap: 2,
  },
  searchUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchUserUsername: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchUserSports: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  sportTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sportTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FriendsScreen;