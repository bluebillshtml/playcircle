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
import { useAuth } from '../context/AuthContext';
import { leaderboardService, profileService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';
import ScrollableSportSelector from '../components/ScrollableSportSelector';
import ProfilePicture from '../components/ProfilePicture';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Local');
  const [activeSport, setActiveSport] = useState(selectedSport?.id || 'padel');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSports, setUserSports] = useState([]);

  useEffect(() => {
    setActiveSport(selectedSport?.id || 'padel');
  }, [selectedSport]);

  useEffect(() => {
    loadUserSports();
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, activeSport]);

  const loadUserSports = async () => {
    if (!user) return;

    try {
      console.log('🏆 Loading user sports for leaderboard...');
      const sportProfiles = await profileService.getUserSportProfiles(user.id);
      
      if (sportProfiles && sportProfiles.length > 0) {
        // Map sport profiles to sport objects with icons
        const sportsMap = {
          'padel': { id: 'padel', name: 'Padel', icon: 'tennisball' },
          'tennis': { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
          'pickleball': { id: 'pickleball', name: 'Pickleball', icon: 'baseball' },
          'basketball': { id: 'basketball', name: 'Basketball', icon: 'basketball' },
          'volleyball': { id: 'volleyball', name: 'Volleyball', icon: 'football' },
          'soccer': { id: 'soccer', name: 'Soccer', icon: 'football-outline' },
        };

        const userSportsList = sportProfiles
          .map(profile => sportsMap[profile.sport_id])
          .filter(Boolean); // Remove any undefined sports

        console.log('✅ User sports loaded for leaderboard:', userSportsList.map(s => s.name));
        setUserSports(userSportsList);

        // If current active sport is not in user's sports, switch to first available
        if (userSportsList.length > 0 && !userSportsList.find(s => s.id === activeSport)) {
          setActiveSport(userSportsList[0].id);
          console.log(`🔄 Switched active sport to: ${userSportsList[0].name}`);
        }
      } else {
        console.log('📭 No sport profiles found, using default sports');
        // Fallback to default sports if no profiles found
        const defaultSports = [
          { id: 'padel', name: 'Padel', icon: 'tennisball' },
          { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
          { id: 'basketball', name: 'Basketball', icon: 'basketball' },
        ];
        setUserSports(defaultSports);
      }
    } catch (error) {
      console.error('❌ Error loading user sports:', error);
      // Fallback to default sports on error
      const defaultSports = [
        { id: 'padel', name: 'Padel', icon: 'tennisball' },
        { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
        { id: 'basketball', name: 'Basketball', icon: 'basketball' },
      ];
      setUserSports(defaultSports);
    }
  };

  const loadLeaderboard = async () => {
    // Get base data for the sport
    const baseData = LEADERBOARD_TEST_DATA[activeSport] || LEADERBOARD_TEST_DATA.padel;

    // Modify data based on active tab
    let filteredData = [...baseData];

    if (activeTab === 'Local') {
      // Show local players (within 200 miles) - simulate by showing top 8
      filteredData = baseData.slice(0, 8);
    } else if (activeTab === 'National') {
      // Show national rankings - shuffle order slightly for variety
      filteredData = [...baseData].sort((a, b) => {
        // Adjust rankings slightly for national view
        return (a.rank + Math.random() * 2) - (b.rank + Math.random() * 2);
      }).map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.points + Math.floor(Math.random() * 100)
      }));
    } else if (activeTab === 'Global') {
      // Show global rankings - different order and higher points
      filteredData = [...baseData].reverse().map((user, index) => ({
        ...user,
        rank: index + 1,
        points: user.points + Math.floor(Math.random() * 500),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }));
    }

    setLeaderboardData(filteredData);
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

        {/* Scrollable Sport Selector with Fade */}
        <ScrollableSportSelector
          activeSport={activeSport}
          onSportChange={setActiveSport}
          colors={colors}
          sports={userSports}
          onNotificationPress={() => console.log('Notification pressed')}
        />

        {/* Empty State - No Sports */}
        {userSports.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Sports Selected</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add sports to your profile to see leaderboards
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Preferences')}
            >
              <Text style={styles.emptyStateButtonText}>Add Sports</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Local' && styles.activeTab]}
            onPress={() => setActiveTab('Local')}
          >
            <Text style={[styles.tabText, activeTab === 'Local' && styles.activeTabText]}>Local</Text>
            <Text style={[styles.tabSubtext, activeTab === 'Local' && styles.activeTabSubtext]}>200 mi</Text>
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
              <View style={styles.top3AvatarContainer}>
                <ProfilePicture
                  imageUrl={top3Data[1]?.avatar}
                  size={80}
                  fallbackText={top3Data[1]?.name?.charAt(0)}
                  fallbackColor={top3Data[1]?.color || '#4A90E2'}
                  showBorder={false}
                />
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
              <View style={styles.top3AvatarContainer}>
                <ProfilePicture
                  imageUrl={top3Data[0]?.avatar}
                  size={100}
                  fallbackText={top3Data[0]?.name?.charAt(0)}
                  fallbackColor={top3Data[0]?.color || '#FF6B35'}
                  showBorder={false}
                />
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
              <View style={styles.top3AvatarContainer}>
                <ProfilePicture
                  imageUrl={top3Data[2]?.avatar}
                  size={80}
                  fallbackText={top3Data[2]?.name?.charAt(0)}
                  fallbackColor={top3Data[2]?.color || '#7ED321'}
                  showBorder={false}
                />
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
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => navigation.navigate('UserProfile', { userId: user.id, userData: user })}
              activeOpacity={0.7}
            >
              <View style={styles.rankNumber}>
                <Text style={styles.rankNumberText}>{user.rank}</Text>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <ProfilePicture
                    imageUrl={user.avatar}
                    size={40}
                    fallbackText={user.name?.charAt(0)}
                    fallbackColor={user.color}
                    showBorder={false}
                  />
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
            </TouchableOpacity>
          ))}
        </ScrollView>
          </>
        )}
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  tabSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeTabSubtext: {
    color: colors.primary,
    fontWeight: '500',
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
  top3AvatarContainer: {
    position: 'relative',
    marginBottom: 12,
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
