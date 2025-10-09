import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSport } from '../context/SportContext';
import { leaderboardService } from '../services/supabase';

import AnimatedBackground from '../components/AnimatedBackground';
import ScreenHeader from '../components/ScreenHeader';

// Mock leaderboard data
const TOP_3_DATA = [
  {
    id: 1,
    name: 'Eiden',
    username: '@eiden_gamer',
    points: 2430,
    rank: 1,
    avatar: null,
    color: '#FF6B35',
  },
  {
    id: 2,
    name: 'Jackson',
    username: '@jackson_pro',
    points: 1847,
    rank: 2,
    avatar: null,
    color: '#4A90E2',
  },
  {
    id: 3,
    name: 'Emma Aria',
    username: '@emma_aria',
    points: 1674,
    rank: 3,
    avatar: null,
    color: '#7ED321',
  },
];

const LEADERBOARD_DATA = [
  {
    id: 4,
    name: 'Sebastian',
    username: '@sebastian_play',
    points: 1124,
    rank: 4,
    avatar: null,
    trend: 'up',
  },
  {
    id: 5,
    name: 'Jason',
    username: '@jason_master',
    points: 875,
    rank: 5,
    avatar: null,
    trend: 'down',
  },
  {
    id: 6,
    name: 'Natalie',
    username: '@natalie_ace',
    points: 774,
    rank: 6,
    avatar: null,
    trend: 'up',
  },
  {
    id: 7,
    name: 'Serenity',
    username: '@serenity_queen',
    points: 723,
    rank: 7,
    avatar: null,
    trend: 'up',
  },
  {
    id: 8,
    name: 'Hannah',
    username: '@hannah_flower',
    points: 559,
    rank: 8,
    avatar: null,
    trend: 'down',
  },
];

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { selectedSport } = useSport();
  const [activeTab, setActiveTab] = useState('Region');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const region = activeTab.toLowerCase();
      const data = await leaderboardService.getLeaderboard(region, 'all_time', 100);

      const transformed = data.map(entry => ({
        id: entry.user_id,
        name: entry.user?.full_name || entry.user?.username || 'Player',
        username: `@${entry.user?.username || 'player'}`,
        points: entry.points,
        rank: entry.rank,
        avatar: entry.user?.avatar_url,
        trend: entry.trend,
        color: entry.rank <= 3 ? ['#FF6B35', '#4A90E2', '#7ED321'][entry.rank - 1] : null,
      }));

      setLeaderboardData(transformed);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (trend) => {
    if (trend === 'up') {
      return <Ionicons name="trending-up" size={16} color={colors.success} />;
    } else if (trend === 'down') {
      return <Ionicons name="trending-down" size={16} color={colors.error} />;
    }
    return null;
  };

  const styles = createStyles(colors);

  const top3Data = leaderboardData.slice(0, 3);
  const restData = leaderboardData.slice(3);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
      {/* Header */}
      <ScreenHeader title={`${selectedSport.name} Leaderboard`} />

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Region' && styles.activeTab]}
          onPress={() => setActiveTab('Region')}
        >
          <Text style={[styles.tabText, activeTab === 'Region' && styles.activeTabText]}>Region</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'National' && styles.activeTab]}
          onPress={() => setActiveTab('National')}
        >
          <Text style={[styles.tabText, activeTab === 'National' && styles.activeTabText]}>National</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Global' && styles.activeTab]}
          onPress={() => setActiveTab('Global')}
        >
          <Text style={[styles.tabText, activeTab === 'Global' && styles.activeTabText]}>Global</Text>
        </TouchableOpacity>
      </View>

      {/* Top 3 Section */}
      {loading ? (
        <View style={[styles.top3Section, { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : top3Data.length >= 3 ? (
      <View style={styles.top3Section}>
        <View style={styles.top3Container}>
          {/* 2nd Place */}
          <View style={styles.top3Card}>
            <View style={[styles.top3Avatar, { backgroundColor: top3Data[1]?.color || '#4A90E2' }]}>
              {top3Data[1]?.avatar ? (
                <Image source={{ uri: top3Data[1].avatar }} style={styles.top3AvatarImage} />
              ) : (
                <Ionicons name="person" size={32} color={colors.text} />
              )}
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.top3Name}>{top3Data[1]?.name}</Text>
            <Text style={[styles.top3Points, { color: top3Data[1]?.color || '#4A90E2' }]}>{top3Data[1]?.points}</Text>
            <Text style={styles.top3Username}>{top3Data[1]?.username}</Text>
          </View>

          {/* 1st Place */}
          <View style={[styles.top3Card, styles.firstPlace]}>
            <View style={styles.crownIcon}>
              <Ionicons name="trophy" size={24} color={colors.warning} />
            </View>
            <View style={[styles.top3Avatar, { backgroundColor: top3Data[0]?.color || '#FF6B35' }]}>
              {top3Data[0]?.avatar ? (
                <Image source={{ uri: top3Data[0].avatar }} style={styles.top3AvatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={colors.text} />
              )}
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>1</Text>
              </View>
            </View>
            <Text style={styles.top3Name}>{top3Data[0]?.name}</Text>
            <Text style={[styles.top3Points, { color: top3Data[0]?.color || '#FF6B35' }]}>{top3Data[0]?.points}</Text>
            <Text style={styles.top3Username}>{top3Data[0]?.username}</Text>
          </View>

          {/* 3rd Place */}
          <View style={styles.top3Card}>
            <View style={[styles.top3Avatar, { backgroundColor: top3Data[2]?.color || '#7ED321' }]}>
              {top3Data[2]?.avatar ? (
                <Image source={{ uri: top3Data[2].avatar }} style={styles.top3AvatarImage} />
              ) : (
                <Ionicons name="person" size={32} color={colors.text} />
              )}
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.top3Name}>{top3Data[2]?.name}</Text>
            <Text style={[styles.top3Points, { color: top3Data[2]?.color || '#7ED321' }]}>{top3Data[2]?.points}</Text>
            <Text style={styles.top3Username}>{top3Data[2]?.username}</Text>
          </View>
        </View>
      </View>
      ) : null}

      {/* Leaderboard List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.leaderboardList}
        showsVerticalScrollIndicator={false}
      >
        {restData.map((user, index) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color={colors.text} />
                  </View>
                )}
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.username}>{user.username}</Text>
              </View>
            </View>
            
            <View style={styles.userStats}>
              <Text style={styles.pointsText}>{user.points}</Text>
              {renderTrendIcon(user.trend)}
            </View>
          </View>
        ))}
      </ScrollView>

    </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  top3Section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  top3Card: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  firstPlace: {
    alignItems: 'center',
  },
  crownIcon: {
    marginBottom: 8,
  },
  top3Avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  top3AvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.text,
  },
  rankBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  top3Name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  top3Points: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  top3Username: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  leaderboardList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});
