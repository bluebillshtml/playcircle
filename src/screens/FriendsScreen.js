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
import AnimatedBackground from '../components/AnimatedBackground';

const FriendsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track which action is loading
  const [isOffline, setIsOffline] = useState(false);
  
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
  };

  const handleClearSearch = () => {
    clearSearch();
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
    try {
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
    // Use search results if searching, otherwise use regular data
    const friendsToShow = hasSearchResults ? searchResults.suggested_friends : suggestedFriends;
    const isLoading = loading.search || (loading.suggested_friends && suggestedFriends.length === 0);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {hasSearchResults ? 'Searching...' : 'Finding suggested friends...'}
          </Text>
        </View>
      );
    }

    if (friendsToShow.length === 0) {
      const emptyTitle = hasSearchResults ? 'No friends found' : 'No suggestions yet';
      const emptySubtitle = hasSearchResults 
        ? 'Try a different search term' 
        : 'Play more games to discover new friends';

      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
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
    // Use search results if searching, otherwise use regular data
    const membersToShow = hasSearchResults ? searchResults.recent_members : recentMembers;
    const isLoading = loading.search || (loading.recent_members && recentMembers.length === 0);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {hasSearchResults ? 'Searching...' : 'Loading recent members...'}
          </Text>
        </View>
      );
    }

    if (membersToShow.length === 0) {
      const emptyTitle = hasSearchResults ? 'No members found' : 'No recent interactions';
      const emptySubtitle = hasSearchResults 
        ? 'Try a different search term' 
        : 'Members you\'ve played with will appear here';

      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
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
            onInvite={handleInvite}
            showSeparator={index < membersToShow.length - 1}
            isMessageLoading={actionLoading === `message-${member.id}`}
            isInviteLoading={actionLoading === `invite-${member.id}`}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search friends and members..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

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
          {/* Friend Requests Section */}
          {renderFriendRequests()}

          {/* Search Results Indicator */}
          {hasSearchResults && (
            <View style={styles.searchResultsHeader}>
              <Text style={[styles.searchResultsText, { color: colors.textSecondary }]}>
                Search results for "{searchQuery}"
              </Text>
              <TouchableOpacity onPress={handleClearSearch}>
                <Text style={[styles.clearSearchText, { color: colors.primary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Suggested Friends Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {hasSearchResults ? 'Friends' : 'Suggested Friends'}
            </Text>
            {renderSuggestedFriends()}
          </View>

          {/* Recent Members Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {hasSearchResults ? 'Members' : 'Recent Members'}
            </Text>
            {renderRecentMembers()}
          </View>

          {/* Empty State */}
          {!hasAnyData && !loading.suggested_friends && !loading.recent_members && (
            <View style={styles.globalEmptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.globalEmptyTitle, { color: colors.text }]}>
                Welcome to Friends!
              </Text>
              <Text style={[styles.globalEmptySubtitle, { color: colors.textSecondary }]}>
                Start playing games to discover and connect with other players
              </Text>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  membersContainer: {
    paddingHorizontal: 20,
  },
  requestsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  globalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 20,
    gap: 12,
  },
  globalEmptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  globalEmptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FriendsScreen;