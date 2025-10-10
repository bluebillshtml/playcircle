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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { groupChats } from '../services/chatUtils';
import ChatCard from '../components/ChatCard';
import AnimatedBackground from '../components/AnimatedBackground';

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
export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Mock chat data for now (will be replaced with real hook later)
  const [chats, setChats] = useState([]);
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

  // Load mock data
  useEffect(() => {
    const loadMockData = async () => {
      try {
        console.log('Loading mock data...');
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('User:', user);
        if (user) {
          // Create mock chat data with enhanced fields
          const mockChats = createMockChatListScenario(8).map(chat => ({
            ...chat,
            last_message_type: Math.random() > 0.7 ? 
              ['photo', 'location', 'status'][Math.floor(Math.random() * 3)] : 'text',
            last_message_status: Math.random() > 0.8 ? 
              ['on-my-way', 'running-late', 'arrived'][Math.floor(Math.random() * 3)] : null,
          }));
          console.log('Mock chats created:', mockChats.length);
          setChats(mockChats);
        } else {
          console.log('No user, setting empty chats');
          setChats([]);
        }
      } catch (err) {
        console.error('Error loading mock data:', err);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, [user]);

  const refreshChats = useCallback(async () => {
    try {
      if (user) {
        const mockChats = createMockChatListScenario(8).map(chat => ({
          ...chat,
          last_message_type: Math.random() > 0.7 ? 
            ['photo', 'location', 'status'][Math.floor(Math.random() * 3)] : 'text',
          last_message_status: Math.random() > 0.8 ? 
            ['on-my-way', 'running-late', 'arrived'][Math.floor(Math.random() * 3)] : null,
        }));
        setChats(mockChats);
      }
    } catch (err) {
      setError('Failed to refresh chats');
    }
  }, [user]);

  // Group chats into sections
  const groupedChats = React.useMemo(() => {
    if (!chats || chats.length === 0) {
      return { happeningSoon: [], recent: [] };
    }
    return groupChats(chats);
  }, [chats]);

  // Filter chats based on search query
  const filteredGroupedChats = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedChats;
    }

    const query = searchQuery.toLowerCase();
    const filterChats = (chatList) => 
      chatList.filter(chat => 
        chat.session_title.toLowerCase().includes(query) ||
        chat.court_name.toLowerCase().includes(query) ||
        chat.last_message_content?.toLowerCase().includes(query)
      );

    return {
      happeningSoon: filterChats(groupedChats.happeningSoon),
      recent: filterChats(groupedChats.recent),
    };
  }, [groupedChats, searchQuery]);

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
  const handleChatPress = useCallback((chatId, sessionTitle) => {
    navigation.navigate('ChatThread', { 
      chatId, 
      sessionTitle 
    });
  }, [navigation]);

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
              onPress={() => console.log('Settings pressed')}
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

  // Empty state
  const totalChats = groupedChats.happeningSoon.length + groupedChats.recent.length;
  if (totalChats === 0 && !loading) {
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
          <ScrollView
            contentContainerStyle={styles.emptyScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No chats yet</Text>
              <Text style={styles.emptyMessage}>
                Join a session to start chatting with other players!
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="search-outline" size={20} color="#FFFFFF" />
                <Text style={styles.exploreButtonText}>Find Sessions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
            onPress={() => console.log('Settings pressed')}
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
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.friendsScrollContent}
              >
                {[
                  { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?img=1' },
                  { name: 'Mike', avatar: 'https://i.pravatar.cc/150?img=12' },
                  { name: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5' },
                  { name: 'James', avatar: 'https://i.pravatar.cc/150?img=13' },
                  { name: 'Lisa', avatar: 'https://i.pravatar.cc/150?img=9' },
                  { name: 'David', avatar: 'https://i.pravatar.cc/150?img=14' },
                ].map((friend, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.friendCard}
                    onPress={() => console.log('Friend pressed:', friend.name)}
                  >
                    <View style={styles.friendAvatar}>
                      <Image 
                        source={{ uri: friend.avatar }} 
                        style={styles.friendAvatarImage}
                      />
                    </View>
                    <Text style={styles.friendName}>{friend.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Upcoming Matches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Matches</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>3</Text>
                </View>
              </View>
              {[
                { court: 'Elite Padel Club', time: 'Today 7:00 PM', players: 4, sport: 'Padel', icon: 'tennisball' },
                { court: 'Downtown Tennis Court', time: 'Tomorrow 9:30 AM', players: 4, sport: 'Tennis', icon: 'tennisball' },
                { court: 'City Basketball Arena', time: 'Sat 6:00 PM', players: 8, sport: 'Basketball', icon: 'basketball' },
              ].map((match, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.matchCard}
                  onPress={() => console.log('Match pressed:', match.court)}
                >
                  <View style={styles.matchIcon}>
                    <Ionicons name={match.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>{match.court}</Text>
                    <Text style={styles.matchDetails}>{match.time} • {match.players} players</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Past Chats Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Past Chats</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {filteredGroupedChats.recent.length}
                  </Text>
                </View>
              </View>
              {filteredGroupedChats.recent.length > 0 ? (
                filteredGroupedChats.recent.map((chat, index) => (
                  <ChatCard
                    key={chat.chat_id}
                    chat={chat}
                    onPress={handleChatPress}
                    isHappeningSoon={false}
                    style={styles.chatCard}
                  />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptySectionText}>No past chats yet</Text>
                </View>
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>
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
});