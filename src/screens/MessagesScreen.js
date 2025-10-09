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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { groupChats } from '../services/chatUtils';
import { transformChatList } from '../utils/chatTransformers';
import { createMockChatListScenario } from '../utils/chatFactory';
import AnimatedBackground from '../components/AnimatedBackground';
import ChatCard from '../components/ChatCard';

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

  // Load mock data
  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (user) {
          // Create mock chat data
          const mockChats = createMockChatListScenario(8);
          setChats(mockChats);
        } else {
          setChats([]);
        }
      } catch (err) {
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
        const mockChats = createMockChatListScenario(8);
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
          <View style={styles.invisibleHeader} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
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
          <View style={styles.invisibleHeader} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
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
          <View style={styles.invisibleHeader} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
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
        {/* Invisible Header Spacer */}
        <View style={styles.invisibleHeader} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Chat List */}
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
            {/* Happening Soon Section */}
            {filteredGroupedChats.happeningSoon.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Happening Soon</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {filteredGroupedChats.happeningSoon.length}
                    </Text>
                  </View>
                </View>
                {filteredGroupedChats.happeningSoon.map((chat, index) => (
                  <ChatCard
                    key={chat.chat_id}
                    chat={chat}
                    onPress={() => handleChatPress(chat.chat_id, chat.session_title)}
                    style={[
                      styles.chatCard,
                      index === 0 && styles.firstChatCard,
                      index === filteredGroupedChats.happeningSoon.length - 1 && styles.lastChatCard,
                    ]}
                    isHappeningSoon={true}
                  />
                ))}
              </View>
            )}

            {/* Recent Section */}
            {filteredGroupedChats.recent.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {filteredGroupedChats.recent.length}
                    </Text>
                  </View>
                </View>
                {filteredGroupedChats.recent.map((chat, index) => (
                  <ChatCard
                    key={chat.chat_id}
                    chat={chat}
                    onPress={() => handleChatPress(chat.chat_id, chat.session_title)}
                    style={[
                      styles.chatCard,
                      index === 0 && styles.firstChatCard,
                      index === filteredGroupedChats.recent.length - 1 && styles.lastChatCard,
                    ]}
                    isHappeningSoon={false}
                  />
                ))}
              </View>
            )}

            {/* Search Results Empty State */}
            {searchQuery.trim() && 
             filteredGroupedChats.happeningSoon.length === 0 && 
             filteredGroupedChats.recent.length === 0 && (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.searchEmptyTitle}>No chats found</Text>
                <Text style={styles.searchEmptyMessage}>
                  Try searching with different keywords
                </Text>
              </View>
            )}

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
  invisibleHeader: {
    height: 90,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  searchButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  firstChatCard: {
    marginTop: 8,
  },
  lastChatCard: {
    marginBottom: 16,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Search empty state
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  searchEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  searchEmptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  bottomPadding: {
    height: 20,
  },
});