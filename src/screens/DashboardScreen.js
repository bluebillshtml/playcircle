import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSport } from '../context/SportContext';
import { leaderboardService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';

import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

// Mock leaderboard data for different sports
const LEADERBOARD_TEST_DATA = {
  padel: [
    { id: 1, name: 'Carlos Rodriguez', username: '@carlos_padel', points: 2850, rank: 1, avatar: null, color: '#FF6B35', trend: 'up' },
    { id: 2, name: 'Maria Garcia', username: '@maria_ace', points: 2640, rank: 2, avatar: null, color: '#4A90E2', trend: 'up' },
    { id: 3, name: 'Juan Martinez', username: '@juan_smash', points: 2420, rank: 3, avatar: null, color: '#7ED321', trend: 'down' },
    { id: 4, name: 'Sofia Lopez', username: '@sofia_spin', points: 2180, rank: 4, avatar: null, trend: 'up' },
    { id: 5, name: 'Diego Santos', username: '@diego_master', points: 1950, rank: 5, avatar: null, trend: 'up' },
    { id: 6, name: 'Ana Torres', username: '@ana_volleys', points: 1820, rank: 6, avatar: null, trend: 'down' },
    { id: 7, name: 'Luis Hernandez', username: '@luis_power', points: 1690, rank: 7, avatar: null, trend: 'up' },
    { id: 8, name: 'Elena Ruiz', username: '@elena_drop', points: 1540, rank: 8, avatar: null, trend: 'down' },
  ],
  tennis: [
    { id: 1, name: 'Serena Williams Jr', username: '@serena_jr', points: 3200, rank: 1, avatar: null, color: '#FF6B35', trend: 'up' },
    { id: 2, name: 'Rafael Nadal Jr', username: '@rafa_clay', points: 3050, rank: 2, avatar: null, color: '#4A90E2', trend: 'up' },
    { id: 3, name: 'Emma Raducanu', username: '@emma_ace', points: 2890, rank: 3, avatar: null, color: '#7ED321', trend: 'up' },
    { id: 4, name: 'Felix Auger', username: '@felix_serve', points: 2720, rank: 4, avatar: null, trend: 'down' },
    { id: 5, name: 'Coco Gauff', username: '@coco_power', points: 2580, rank: 5, avatar: null, trend: 'up' },
    { id: 6, name: 'Carlos Alcaraz', username: '@carlos_beast', points: 2440, rank: 6, avatar: null, trend: 'up' },
    { id: 7, name: 'Iga Swiatek', username: '@iga_queen', points: 2310, rank: 7, avatar: null, trend: 'down' },
    { id: 8, name: 'Holger Rune', username: '@holger_smash', points: 2180, rank: 8, avatar: null, trend: 'up' },
  ],
  basketball: [
    { id: 1, name: 'LeBron James Jr', username: '@king_jr', points: 3850, rank: 1, avatar: null, color: '#FF6B35', trend: 'up' },
    { id: 2, name: 'Stephen Curry Jr', username: '@chef_curry_jr', points: 3720, rank: 2, avatar: null, color: '#4A90E2', trend: 'up' },
    { id: 3, name: 'Kevin Durant Jr', username: '@kd_slim', points: 3590, rank: 3, avatar: null, color: '#7ED321', trend: 'down' },
    { id: 4, name: 'Luka Doncic', username: '@luka_magic', points: 3420, rank: 4, avatar: null, trend: 'up' },
    { id: 5, name: 'Giannis A.', username: '@greek_freak', points: 3280, rank: 5, avatar: null, trend: 'up' },
    { id: 6, name: 'Jayson Tatum', username: '@jt_bucket', points: 3140, rank: 6, avatar: null, trend: 'down' },
    { id: 7, name: 'Damian Lillard', username: '@dame_time', points: 3020, rank: 7, avatar: null, trend: 'up' },
    { id: 8, name: 'Joel Embiid', username: '@joel_process', points: 2890, rank: 8, avatar: null, trend: 'down' },
  ],
  soccer: [
    { id: 1, name: 'Cristiano Jr', username: '@cr7_jr', points: 4100, rank: 1, avatar: null, color: '#FF6B35', trend: 'up' },
    { id: 2, name: 'Lionel Messi Jr', username: '@messi_magic', points: 3980, rank: 2, avatar: null, color: '#4A90E2', trend: 'up' },
    { id: 3, name: 'Kylian Mbappe', username: '@kylian_speed', points: 3850, rank: 3, avatar: null, color: '#7ED321', trend: 'up' },
    { id: 4, name: 'Erling Haaland', username: '@erling_goal', points: 3720, rank: 4, avatar: null, trend: 'up' },
    { id: 5, name: 'Neymar Jr', username: '@neymar_skill', points: 3590, rank: 5, avatar: null, trend: 'down' },
    { id: 6, name: 'Mohamed Salah', username: '@mo_pharaoh', points: 3440, rank: 6, avatar: null, trend: 'up' },
    { id: 7, name: 'Kevin De Bruyne', username: '@kdb_assist', points: 3310, rank: 7, avatar: null, trend: 'down' },
    { id: 8, name: 'Vinicius Jr', username: '@vini_dribble', points: 3180, rank: 8, avatar: null, trend: 'up' },
  ],
  volleyball: [
    { id: 1, name: 'Jordan Larson', username: '@jordan_spike', points: 2750, rank: 1, avatar: null, color: '#FF6B35', trend: 'up' },
    { id: 2, name: 'Wilfredo Leon', username: '@wilfredo_power', points: 2620, rank: 2, avatar: null, color: '#4A90E2', trend: 'up' },
    { id: 3, name: 'Paola Egonu', username: '@paola_queen', points: 2490, rank: 3, avatar: null, color: '#7ED321', trend: 'down' },
    { id: 4, name: 'Yuji Nishida', username: '@yuji_jump', points: 2340, rank: 4, avatar: null, trend: 'up' },
    { id: 5, name: 'Tijana Boskovic', username: '@tijana_ace', points: 2210, rank: 5, avatar: null, trend: 'up' },
    { id: 6, name: 'Matt Anderson', username: '@matt_beast', points: 2080, rank: 6, avatar: null, trend: 'down' },
    { id: 7, name: 'Zhu Ting', username: '@zhu_smash', points: 1950, rank: 7, avatar: null, trend: 'up' },
    { id: 8, name: 'Bruno Rezende', username: '@bruno_set', points: 1820, rank: 8, avatar: null, trend: 'down' },
  ],
};

const SPORTS_LIST = [
  { id: 'padel', name: 'Padel', icon: 'tennisball', gradient: ['#10B981', '#059669'] },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball', gradient: ['#3B82F6', '#1D4ED8'] },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', gradient: ['#F97316', '#C2410C'] },
  { id: 'soccer', name: 'Soccer', icon: 'football', gradient: ['#8B5CF6', '#6D28D9'] },
  { id: 'volleyball', name: 'Volleyball', icon: 'tennisball', gradient: ['#EC4899', '#BE185D'] },
];

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { selectedSport } = useSport();
  const [activeTab, setActiveTab] = useState('Region');
  const [activeSport, setActiveSport] = useState(selectedSport?.id || 'padel');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveSport(selectedSport?.id || 'padel');
  }, [selectedSport]);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, activeSport]);

  const loadLeaderboard = async () => {
    // Use test data
    const testData = LEADERBOARD_TEST_DATA[activeSport] || LEADERBOARD_TEST_DATA.padel;
    setLeaderboardData(testData);
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
        <NavigationButton navigation={navigation} currentScreen="Dashboard" />

        {/* Header with Sport Selector */}
        <View style={styles.headerContainer}>
          <View style={styles.sportSelectorWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sportSelector}
              contentContainerStyle={styles.sportSelectorContent}
            >
              {SPORTS_LIST.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportCard,
                    activeSport === sport.id && styles.sportCardActive
                  ]}
                  onPress={() => setActiveSport(sport.id)}
                >
                  <Ionicons
                    name={sport.icon}
                    size={18}
                    color={activeSport === sport.id ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.sportCardText,
                    activeSport === sport.id && styles.sportCardTextActive
                  ]}>
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <LinearGradient
              colors={[colors.background, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sportFadeLeft}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['transparent', colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sportFadeRight}
              pointerEvents="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>

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
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>{user.rank}</Text>
              </View>

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
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 16,
    justifyContent: 'center',
    minHeight: 48,
  },
  sportSelectorWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  sportSelector: {
  },
  sportSelectorContent: {
    gap: 8,
    paddingLeft: 100,
    paddingRight: 80,
    alignItems: 'center',
    paddingVertical: 8,
  },
  sportFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 10,
  },
  sportFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 10,
  },
  sportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 6,
  },
  sportCardActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  sportCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sportCardTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  notificationButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    zIndex: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    marginBottom: 20,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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
