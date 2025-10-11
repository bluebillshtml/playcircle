import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { groupChats } from '../services/chatUtils';
import { chatService, profileService } from '../services/supabase';
import { friendsService } from '../services/friendsService';
import ChatCard from '../components/ChatCard';
import AnimatedBackground from '../components/AnimatedBackground';
import MessagesSettingsModal from '../components/MessagesSettingsModal';

// Simple mock data function as fallback
const createMockChatListScenario = (count = 8) => {
  const mockMessages = [
    'See you there!',
    'On my way!',
    'Great game everyone!',
    'Running 5 minutes late',
    'Who is bringing the balls?',
    'Same time next week?',
    'Thanks for the match!',
    'Court 2 is available',
    'Lets do doubles next time',
    'Anyone up for a rematch?',
  ];

  const mockNames = [
    'Sarah M.', 'Mike J.', 'Emma W.', 'James L.',
    'Lisa K.', 'David R.', 'Anna P.', 'Tom H.'
  ];

  const courtNames = [
    'Elite Padel Club', 'Downtown Tennis Court', 'City Sports Center',
    'Riverside Courts', 'Premium Padel Arena', 'Metro Tennis Club',
    'Sunset Sports Complex', 'Athletic Center Court'
  ];

  const mockChats = [];
  for (let i = 0; i < count; i++) {
    mockChats.push({
      chat_id: `chat_${i}`,
      court_session_id: `session_${i}`,
      session_title: `${courtNames[i % courtNames.length]} – ${i % 2 === 0 ? 'Yesterday' : '2 days ago'}`,
      session_date: new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0],
      session_time: `${14 + (i % 6)}:${i % 2 === 0 ? '00' : '30'}`,
      session_duration: 90,
      court_name: courtNames[i % courtNames.length],
      sport_id: i % 3 === 0 ? 'padel' : i % 3 === 1 ? 'tennis' : 'basketball',
      last_message_content: mockMessages[i % mockMessages.length],
      last_message_at: new Date(Date.now() - i * 3600000).toISOString(),
      last_message_user_name: mockNames[i % mockNames.length],
      unread_count: i % 5 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
      member_count: 4,
      is_happening_soon: false,
      sport_icon: i % 3 === 0 ? 'tennisball' : i % 3 === 1 ? 'tennisball' : 'basketball',
      time_display: `${14 + (i % 6)}:${i % 2 === 0 ? '00' : '30'}`,
      relative_time: i === 0 ? '1h ago' : i === 1 ? '3h ago' : `${i}h ago`,
    });
  }
  return mockChats;
};
// Friends list data
const FRIENDS_LIST = [
  { id: 'friend_1', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online', isPinned: true, unreadCount: 2 },
  { id: 'friend_2', name: 'Mike', avatar: 'https://i.pravatar.cc/150?img=12', status: 'online', isPinned: true, unreadCount: 0 },
  { id: 'friend_3', name: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5', status: 'offline', isPinned: true, unreadCount: 1 },
  { id: 'friend_4', name: 'James', avatar: 'https://i.pravatar.cc/150?img=13', status: 'online', isPinned: true, unreadCount: 0 },
  { id: 'friend_5', name: 'Lisa', avatar: 'https://i.pravatar.cc/150?img=9', status: 'offline', isPinned: true, unreadCount: 3 },
  { id: 'friend_6', name: 'David', avatar: 'https://i.pravatar.cc/150?img=14', status: 'online', isPinned: true, unreadCount: 0 },
  { id: 'friend_7', name: 'Anna', avatar: 'https://i.pravatar.cc/150?img=47', status: 'online', isPinned: true, unreadCount: 1 },
  { id: 'friend_8', name: 'Tom', avatar: 'https://i.pravatar.cc/150?img=33', status: 'offline', isPinned: true, unreadCount: 0 },
  { id: 'friend_9', name: 'Sophie', avatar: 'https://i.pravatar.cc/150?img=44', status: 'online', isPinned: false, unreadCount: 0 },
  { id: 'friend_10', name: 'Chris', avatar: 'https://i.pravatar.cc/150?img=15', status: 'offline', isPinned: false, unreadCount: 2 },
  { id: 'friend_11', name: 'Alex', avatar: 'https://i.pravatar.cc/150?img=16', status: 'online', isPinned: false, unreadCount: 0 },
  { id: 'friend_12', name: 'Maya', avatar: 'https://i.pravatar.cc/150?img=17', status: 'offline', isPinned: false, unreadCount: 1 },
];

// Upcoming matches data
const UPCOMING_MATCHES = [
  {
    id: 'match_1',
    chatId: 'session_chat_1',
    court_session_id: 'session_1',
    court: 'Elite Padel Club',
    time: 'Today 7:00 PM',
    players: 4,
    sport: 'Padel',
    icon: 'tennisball',
    sessionTitle: 'Elite Padel Club – Today 7:00 PM'
  },
  {
    id: 'match_2',
    chatId: 'session_chat_2',
    court_session_id: 'session_2',
    court: 'Downtown Tennis Court',
    time: 'Tomorrow 9:30 AM',
    players: 4,
    sport: 'Tennis',
    icon: 'tennisball',
    sessionTitle: 'Downtown Tennis Court – Tomorrow 9:30 AM'
  },
  {
    id: 'match_3',
    chatId: 'session_chat_3',
    court_session_id: 'session_3',
    court: 'City Basketball Arena',
    time: 'Sat 6:00 PM',
    players: 8,
    sport: 'Basketball',
    icon: 'basketball',
    sessionTitle: 'City Basketball Arena – Sat 6:00 PM'
  },
];

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [showAllFriendsModal, setShowAllFriendsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);


  // Settings state
  const [messagesSettings, setMessagesSettings] = useState({
    pushNotifications: true,
    soundNotifications: true,
    vibration: true,
    readReceipts: true,
    onlineStatus: true,
    typingIndicators: true,
    autoSaveMedia: false,
    messageReactions: true,
    quickActions: true,
    autoDeleteChats: false,
    friendMessagesDeleteDuration: '30days', // Options: '24hours', '7days', '30days', '1year', 'never'
    gameChatsDeleteDuration: '7days', // Separate duration for game chats
  });

  // Real chat data
  const [friendChats, setFriendChats] = useState([]);
  const [upcomingMatchChats, setUpcomingMatchChats] = useState([]);
  const [pastMatchChats, setPastMatchChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure we have valid colors
  if (!colors) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  // Load real data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = useCallback(async () => {
    try {
      console.log('📱 Loading messages data for user:', user.id);
      setLoading(true);
      setError(null);

      // Load all data in parallel with individual error handling
      const loadFriendChats = async () => {
        try {
          if (chatService && chatService.getFriendChats) {
            return await chatService.getFriendChats(user.id);
          }
          return [];
        } catch (err) {
          console.error('❌ Error loading friend chats:', err);
          return [];
        }
      };

      const loadUpcomingChats = async () => {
        try {
          if (chatService && chatService.getMatchChats) {
            return await chatService.getMatchChats(user.id, true);
          }
          return [];
        } catch (err) {
          console.error('❌ Error loading upcoming match chats:', err);
          return [];
        }
      };

      const loadPastChats = async () => {
        try {
          if (chatService && chatService.getMatchChats) {
            return await chatService.getMatchChats(user.id, false);
          }
          return [];
        } catch (err) {
          console.error('❌ Error loading past match chats:', err);
          return [];
        }
      };

      const loadFriends = async () => {
        try {
          if (friendsService && friendsService.getFriends) {
            const result = await friendsService.getFriends(user.id);
            return Array.isArray(result) ? result : [];
          }
          return []; // Return empty array if service doesn't exist
        } catch (err) {
          console.error('❌ Error loading friends:', err);
          return []; // Return empty array on error
        }
      };

      const [friendChatsData, upcomingChatsData, pastChatsData, friendsData] = await Promise.all([
        loadFriendChats(),
        loadUpcomingChats(),
        loadPastChats(),
        loadFriends(),
      ]);

      console.log('✅ Loaded data:', {
        friendChats: Array.isArray(friendChatsData) ? friendChatsData.length : 'not array',
        upcomingChats: Array.isArray(upcomingChatsData) ? upcomingChatsData.length : 'not array',
        pastChats: Array.isArray(pastChatsData) ? pastChatsData.length : 'not array',
        friends: Array.isArray(friendsData) ? friendsData.length : 'not array',
        friendsType: typeof friendsData,
        friendsValue: friendsData,
      });

      setFriendChats(Array.isArray(friendChatsData) ? friendChatsData : []);
      setUpcomingMatchChats(Array.isArray(upcomingChatsData) ? upcomingChatsData : []);
      setPastMatchChats(Array.isArray(pastChatsData) ? pastChatsData : []);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
    } catch (err) {
      console.error('❌ Error loading messages data:', err);
      setError('Failed to load messages');

      // Set empty arrays instead of mock data
      console.log('🔄 Setting empty states...');
      setFriendChats([]);
      setUpcomingMatchChats([]);
      setPastMatchChats([]);
      setFriends([]); // Start with empty friends list
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle friend click - create direct chat if it doesn't exist
  const handleFriendPress = async (friend) => {
    try {
      console.log('💬 Creating/opening chat with friend:', friend.full_name || friend.name);

      // Create or get existing direct chat
      const chat = await chatService.createDirectChat(user.id, friend.id);

      // Navigate to chat thread
      navigation.navigate('ChatThread', {
        chatId: chat.id,
        chatTitle: friend.full_name || friend.name,
        chatType: 'direct',
        otherUser: friend,
      });
    } catch (error) {
      console.error('❌ Error creating direct chat:', error);
      // Still navigate with mock data for now
      navigation.navigate('ChatThread', {
        chatId: `direct_${friend.id}`,
        chatTitle: friend.full_name || friend.name,
        chatType: 'direct',
        otherUser: friend,
      });
    }
  };

  // Handle match chat press
  const handleMatchChatPress = (matchChat) => {
    navigation.navigate('ChatThread', {
      chatId: matchChat.chat_id,
      chatTitle: matchChat.session_title,
      chatType: 'match',
      matchData: matchChat,
    });
  };

  const refreshChats = useCallback(async () => {
    if (user) {
      await loadAllData();
    }
  }, [user, loadAllData]);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    // Ensure all data is arrays
    const safeFriends = Array.isArray(friends) ? friends : [];
    const safeUpcomingChats = Array.isArray(upcomingMatchChats) ? upcomingMatchChats : [];
    const safePastChats = Array.isArray(pastMatchChats) ? pastMatchChats : [];

    if (!searchQuery.trim()) {
      return {
        friends: safeFriends,
        upcomingMatchChats: safeUpcomingChats,
        pastMatchChats: safePastChats,
      };
    }

    const query = searchQuery.toLowerCase();

    return {
      friends: safeFriends.filter(friend =>
        (friend.full_name || friend.username || friend.name || '').toLowerCase().includes(query)
      ),
      upcomingMatchChats: safeUpcomingChats.filter(match =>
        (match.session_title || '').toLowerCase().includes(query) ||
        (match.court_name || '').toLowerCase().includes(query)
      ),
      pastMatchChats: safePastChats.filter(match =>
        (match.session_title || '').toLowerCase().includes(query) ||
        (match.court_name || '').toLowerCase().includes(query)
      ),
    };
  }, [friends, upcomingMatchChats, pastMatchChats, searchQuery]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshChats();
    } catch (err) {
      console.error('Error refreshing chats:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshChats]);

  // Handle chat card press
  const handleChatPress = useCallback((chatId, sessionTitle, chat) => {
    navigation.navigate('ChatThread', {
      chatId,
      court_session_id: chat?.court_session_id,
      sessionTitle,
      chatType: 'group'
    });
  }, [navigation]);



  // Handle settings update
  const handleSettingsUpdate = (newSettings) => {
    setMessagesSettings(newSettings);
    // In a real app, you would save these to AsyncStorage or send to server
    console.log('Settings updated:', newSettings);
  };

  // Animate in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const styles = createStyles(colors);

  // Loading state
  if (loading && !refreshing) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={() => console.log('Menu pressed')}>
              <Ionicons name="menu" size={28} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search chats</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => console.log('Settings pressed')}
            >
              <Ionicons name="settings-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your chats...</Text>
          </View>
        </View>
      </AnimatedBackground>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={() => console.log('Menu pressed')}>
              <Ionicons name="menu" size={28} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search chats</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Ionicons name="settings-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.errorTitle}>Unable to load chats</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshChats}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedBackground>
    );
  }



  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Header with Menu, Search, and Settings */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => console.log('Menu pressed')}>
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search chats</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Ionicons name="settings-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* Friends Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Friends</Text>
                <TouchableOpacity onPress={() => setShowAllFriendsModal(true)}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {filteredData.friends.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.friendsScrollContent}
                >
                  {filteredData.friends.slice(0, 8).map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      style={styles.friendCard}
                      onPress={() => handleFriendPress(friend)}
                    >
                      <View style={styles.friendAvatar}>
                        <Image
                          source={{ uri: friend.avatar_url || friend.avatar || `https://i.pravatar.cc/150?u=${friend.id}` }}
                          style={styles.friendAvatarImage}
                        />
                        {friend.status === 'online' && (
                          <View style={styles.onlineIndicator} />
                        )}
                        {friend.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.friendName}>{friend.full_name || friend.username || friend.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptySectionText}>No friends yet</Text>
                  <TouchableOpacity
                    style={styles.addFriendsButton}
                    onPress={() => navigation.navigate('Friends')}
                  >
                    <Ionicons name="person-add" size={18} color="#FFFFFF" />
                    <Text style={styles.addFriendsButtonText}>Add Friends</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Upcoming Matches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Matches</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{filteredData.upcomingMatchChats.length}</Text>
                </View>
              </View>
              {filteredData.upcomingMatchChats.length > 0 ? (
                filteredData.upcomingMatchChats.map((match) => (
                  <TouchableOpacity
                    key={match.chat_id}
                    style={styles.matchCard}
                    onPress={() => handleMatchChatPress(match)}
                  >
                    <View style={styles.matchIcon}>
                      <Ionicons
                        name={match.sport_id === 'padel' ? 'tennisball' :
                          match.sport_id === 'tennis' ? 'tennisball-outline' :
                            match.sport_id === 'basketball' ? 'basketball' : 'tennisball'}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>{match.court_name}</Text>
                      <Text style={styles.matchDetails}>
                        {new Date(match.session_date).toLocaleDateString()} {match.session_time}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptySectionText}>No upcoming matches yet</Text>
                  <TouchableOpacity
                    style={styles.joinMatchesButton}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.joinMatchesButtonText}>Join Matches</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Past Matches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Past Matches</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {filteredData.pastMatchChats.length}
                  </Text>
                </View>
              </View>
              {filteredData.pastMatchChats.length > 0 ? (
                filteredData.pastMatchChats.map((match) => (
                  <TouchableOpacity
                    key={match.chat_id}
                    style={styles.matchCard}
                    onPress={() => handleMatchChatPress(match)}
                  >
                    <View style={styles.matchIcon}>
                      <Ionicons
                        name={match.sport_id === 'padel' ? 'tennisball' :
                          match.sport_id === 'tennis' ? 'tennisball-outline' :
                            match.sport_id === 'basketball' ? 'basketball' : 'tennisball'}
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>{match.court_name}</Text>
                      <Text style={styles.matchDetails}>
                        {new Date(match.session_date).toLocaleDateString()} {match.session_time}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptySectionText}>No past matches yet</Text>
                </View>
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>

        {/* All Friends Modal */}
        <Modal
          visible={showAllFriendsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAllFriendsModal(false)}
          statusBarTranslucent={true}
        >
          <BlurView intensity={80} style={styles.modalOverlay} tint="dark">
            <View style={styles.modalDarkOverlay} />
            <View style={styles.allFriendsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>All Friends</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowAllFriendsModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.friendsListContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Pinned Friends Section */}
                <View style={styles.pinnedSection}>
                  <Text style={styles.pinnedSectionTitle}>Pinned Friends ({Math.min(filteredData.friends.length, 8)}/8)</Text>
                  <View style={styles.pinnedGrid}>
                    {Array.from({ length: 8 }, (_, index) => {
                      const friend = filteredData.friends[index];
                      return (
                        <TouchableOpacity
                          key={friend?.id || `empty_${index}`}
                          style={[styles.pinnedFriendCard, !friend && styles.emptyPinnedCard]}
                          onPress={() => {
                            if (friend) {
                              setShowAllFriendsModal(false);
                              handleFriendPress(friend);
                            }
                          }}
                          disabled={!friend}
                        >
                          {friend ? (
                            <>
                              <View style={styles.pinnedFriendAvatar}>
                                <Image
                                  source={{ uri: friend.avatar_url || friend.avatar || `https://i.pravatar.cc/150?u=${friend.id}` }}
                                  style={styles.pinnedFriendAvatarImage}
                                />
                                {friend.status === 'online' && (
                                  <View style={styles.pinnedOnlineIndicator} />
                                )}
                                {friend.unreadCount > 0 && (
                                  <View style={styles.pinnedUnreadBadge}>
                                    <Text style={styles.pinnedUnreadBadgeText}>
                                      {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.pinnedFriendName}>{friend.full_name || friend.username || friend.name}</Text>
                            </>
                          ) : (
                            <View style={styles.emptyPinnedSlot}>
                              <Ionicons name="add" size={24} color="rgba(255, 255, 255, 0.4)" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* All Friends Section */}
                <View style={styles.allFriendsSection}>
                  <Text style={styles.allFriendsSectionTitle}>All Friends</Text>
                  {filteredData.friends.map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      style={styles.friendListItem}
                      onPress={() => {
                        setShowAllFriendsModal(false);
                        handleFriendPress(friend);
                      }}
                    >
                      <View style={styles.friendListAvatar}>
                        <Image
                          source={{ uri: friend.avatar_url || friend.avatar || `https://i.pravatar.cc/150?u=${friend.id}` }}
                          style={styles.friendListAvatarImage}
                        />
                        {friend.status === 'online' && (
                          <View style={styles.onlineIndicatorLarge} />
                        )}
                        {friend.unreadCount > 0 && (
                          <View style={styles.friendListUnreadBadge}>
                            <Text style={styles.friendListUnreadBadgeText}>
                              {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.friendListInfo}>
                        <Text style={styles.friendListName}>{friend.full_name || friend.username || friend.name}</Text>
                        <Text style={styles.friendListStatus}>
                          {friend.status === 'online' ? 'Active now' : 'Offline'}
                        </Text>
                      </View>

                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BlurView>
        </Modal>

        {/* Messages Settings Modal */}
        <MessagesSettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={messagesSettings}
          onUpdateSettings={handleSettingsUpdate}
        />
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 12,
    height: 48,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 0,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  sectionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Friends Section
  friendsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  friendCard: {
    alignItems: 'center',
    width: 70,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  friendAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  // Upcoming Matches Section
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  matchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  matchDetails: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Past Chats Section
  chatCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptySubText: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
    marginTop: 4,
  },
  addFriendsButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  addFriendsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinMatchesButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  joinMatchesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty state
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyMessage: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Search empty state
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
    marginTop: 40,
  },
  searchEmptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  searchEmptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  bottomPadding: {
    height: 40,
  },

  // Online indicator
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.background,
  },
  onlineIndicatorLarge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // All Friends Modal
  modalOverlay: {
    flex: 1,
  },
  modalDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  allFriendsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendsListContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Pinned Friends Section
  pinnedSection: {
    marginBottom: 32,
  },
  pinnedSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  pinnedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  pinnedFriendCard: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyPinnedCard: {
    backgroundColor: colors.background + '60',
    borderStyle: 'dashed',
    borderColor: colors.border + '60',
  },
  pinnedFriendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
  },
  pinnedFriendAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  pinnedOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.background,
  },
  pinnedUnreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  pinnedUnreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pinnedFriendName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    numberOfLines: 1,
  },
  emptyPinnedSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  // All Friends Section
  allFriendsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
    paddingTop: 24,
  },
  allFriendsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  friendListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  friendListAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    overflow: 'hidden',
    position: 'relative',
  },
  friendListAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendListUnreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  friendListUnreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  friendListInfo: {
    flex: 1,
  },
  friendListName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  friendListStatus: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  pinButton: {
    padding: 8,
  },

  // Unread badge for main friends section
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});