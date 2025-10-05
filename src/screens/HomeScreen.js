import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { matchService, profileService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';
import SportSelector from '../components/SportSelector';
import PadelMatchHistory from '../components/PadelMatchHistory';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

// Mock data for upcoming matches
const UPCOMING_MATCHES = [
  {
    id: 1,
    courtName: 'Downtown Padel Club',
    date: '2025-10-03',
    time: '18:00',
    duration: 90,
    type: 'competitive',
    skillLevel: 'Intermediate',
    joinedPlayers: 2,
    totalPlayers: 4,
    pricePerPlayer: 10,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    courtName: 'Sunset Sports Center',
    date: '2025-10-05',
    time: '10:00',
    duration: 60,
    type: 'casual',
    skillLevel: 'Beginner',
    joinedPlayers: 3,
    totalPlayers: 4,
    pricePerPlayer: 8.75,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop',
  },
];

// Mock data for past matches
const PAST_MATCHES = [
  {
    id: 1,
    courtName: 'Elite Padel Academy',
    date: '2025-09-28',
    time: '14:30',
    result: 'Win',
    score: '6-4, 6-3',
    partner: 'Sarah Smith',
  },
  {
    id: 2,
    courtName: 'Downtown Padel Club',
    date: '2025-09-25',
    time: '19:00',
    result: 'Loss',
    score: '4-6, 5-7',
    partner: 'Mike Johnson',
  },
  {
    id: 3,
    courtName: 'Sunset Sports Center',
    date: '2025-09-22',
    time: '11:00',
    result: 'Win',
    score: '6-2, 6-4',
    partner: 'Emily Davis',
  },
];

// Stats data
const USER_STATS = {
  totalMatches: 24,
  winRate: 67,
  hoursPlayed: 36,
  favoritePartner: 'Sarah Smith',
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const { selectedSport } = useSport();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load upcoming matches for selected sport
      try {
        const matches = await matchService.getUpcomingMatches(20, selectedSport.id);
        const transformedMatches = matches.map(match => ({
          id: match.id,
          courtName: match.court?.name || 'Unknown Court',
          date: match.match_date,
          time: match.match_time,
          duration: match.duration_minutes,
          type: match.match_type,
          skillLevel: match.skill_level,
          joinedPlayers: match.current_players,
          totalPlayers: match.max_players,
          pricePerPlayer: parseFloat(match.price_per_player),
          image: match.court?.image_url || 'https://images.unsplash.com/photo-1554068865-24cd4e34b8?w=400&h=300&fit=crop',
        }));
        setUpcomingMatches(transformedMatches);
      } catch (matchError) {
        console.error('Error loading matches:', matchError);
        setUpcomingMatches([]);
      }

      // Load user's past matches if logged in
      if (user) {
        try {
          const userMatches = await matchService.getUserMatches(user.id);
          const completed = userMatches
            .filter(um => um.match?.status === 'completed')
            .map(um => ({
              id: um.match.id,
              courtName: um.match.court?.name || 'Unknown Court',
              date: um.match.match_date,
              time: um.match.match_time,
              result: 'Win', // TODO: Calculate from team results
              score: '6-4, 6-3', // TODO: Get from match games
              partner: 'Partner', // TODO: Get from team
            }))
            .slice(0, 3);
          setPastMatches(completed);
        } catch (userMatchError) {
          console.error('Error loading user matches:', userMatchError);
          setPastMatches([]);
        }

        // Load user stats for selected sport
        try {
          const stats = await profileService.getUserStats(user.id, selectedSport.id);
          setUserStats({
            totalMatches: stats?.total_matches || 0,
            winRate: Math.round(stats?.win_rate || 0),
            hoursPlayed: Math.round(stats?.total_hours_played || 0),
            favoritePartner: 'Partner Name', // TODO: Calculate from matches
          });
        } catch (statsError) {
          console.error('Error loading user stats:', statsError);
          setUserStats({
            totalMatches: 0,
            winRate: 0,
            hoursPlayed: 0,
            favoritePartner: 'None',
          });
        }
      } else {
        // Use default stats for non-logged in users
        setUserStats({
          totalMatches: 0,
          winRate: 0,
          hoursPlayed: 0,
          favoritePartner: 'None',
        });
        setPastMatches([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set defaults on error
      setUpcomingMatches([]);
      setPastMatches([]);
      setUserStats({
        totalMatches: 0,
        winRate: 0,
        hoursPlayed: 0,
        favoritePartner: 'None',
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    if (profile?.full_name) {
      return `Welcome back, ${profile.full_name}`;
    } else if (profile?.first_name) {
      return `Welcome back, ${profile.first_name}`;
    } else if (profile?.username) {
      return `Welcome back, ${profile.username}`;
    } else if (user?.email) {
      // Fallback to email if no profile name is available
      const emailName = user.email.split('@')[0];
      return `Welcome back, ${emailName}`;
    }
    return 'Welcome back';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0.3],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <View style={styles.headerTop}>
          <NavigationButton navigation={navigation} currentScreen="Home" />
          <SportSelector navigation={navigation} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subGreeting}>Ready to play {selectedSport.name}?</Text>
        </View>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View
        style={[
          styles.quickStats,
          {
            opacity: scrollY.interpolate({
              inputRange: [50, 150],
              outputRange: [1, 0.2],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <View style={styles.statCard}>
          <Ionicons name={selectedSport.icon} size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{userStats?.totalMatches || 0}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color={colors.warning} />
          <Text style={styles.statNumber}>{userStats?.winRate || 0}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color={colors.success} />
          <Text style={styles.statNumber}>{userStats?.hoursPlayed || 0}h</Text>
          <Text style={styles.statLabel}>Played</Text>
        </View>
      </Animated.View>

      {/* Upcoming Matches Section */}
      <View style={styles.section}>
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [100, 250],
              outputRange: [1, 0.15],
              extrapolate: 'clamp',
            }),
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming {selectedSport.name} Matches</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {upcomingMatches.length > 0 ? (
          upcomingMatches.map((match, index) => (
            <Animated.View
              key={match.id}
              style={{
                opacity: scrollY.interpolate({
                  inputRange: [150 + (index * 100), 300 + (index * 100)],
                  outputRange: [1, 0.15],
                  extrapolate: 'clamp',
                }),
              }}
            >
              <TouchableOpacity
                style={styles.matchCard}
                onPress={() =>
                  navigation.navigate('MatchDetail', { matchId: match.id })
                }
              >
              <View style={styles.cardContent}>
                {/* Court Preview with Extended Blurred Background */}
                <View style={styles.courtPreview}>
                  <Image
                    source={{ uri: match.image }}
                    style={styles.courtImage}
                    resizeMode="cover"
                    blurRadius={3}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.3)', colors.card]}
                    locations={[0, 0.15, 0.55]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.imageGradient}
                  />
                  <View
                    style={[
                      styles.typeBadgeSmall,
                      match.type === 'competitive'
                        ? styles.typeBadgeCompetitive
                        : styles.typeBadgeCasual,
                    ]}
                  >
                    <Text style={styles.typeBadgeTextSmall}>
                      {match.type === 'competitive' ? 'COMP' : 'CASUAL'}
                    </Text>
                  </View>
                </View>

                {/* Match Details */}
                <View style={styles.matchDetails}>
                  <View style={styles.matchCardHeader}>
                    <Text style={styles.courtName}>{match.courtName}</Text>
                    <View style={styles.dateTimeContainer}>
                      <Text style={styles.dateText}>{formatDate(match.date)}</Text>
                      <Text style={styles.timeText}>{match.time}</Text>
                    </View>
                  </View>

                  <View style={styles.matchInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.infoText}>{match.duration} min</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.infoText}>
                        {match.joinedPlayers}/{match.totalPlayers}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>${match.pricePerPlayer}</Text>
                    <Text style={styles.perPlayer}>per player</Text>
                  </View>
                </View>
              </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
           <View style={styles.emptyState}>
             <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
             <Text style={styles.emptyStateText}>No upcoming {selectedSport.name.toLowerCase()} matches</Text>
             <TouchableOpacity
               style={styles.createButton}
               onPress={() => navigation.navigate('Create')}
             >
               <Text style={styles.createButtonText}>Create a Match</Text>
             </TouchableOpacity>
           </View>
        )}
      </View>

      {/* Past Matches Section */}
      <View style={styles.section}>
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [350, 500],
              outputRange: [1, 0.15],
              extrapolate: 'clamp',
            }),
          }}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </Animated.View>
        {selectedSport.id === 'padel' && user ? (
          <View style={styles.padelHistoryContainer}>
            <PadelMatchHistory
              userId={user.id}
              onMatchSelect={(match) => {
                // Navigate to match detail
                navigation.navigate('MatchDetail', { matchId: match.id });
              }}
            />
          </View>
        ) : (
          pastMatches.map((match, index) => (
            <Animated.View
              key={match.id}
              style={{
                opacity: scrollY.interpolate({
                  inputRange: [400 + (index * 80), 550 + (index * 80)],
                  outputRange: [1, 0.15],
                  extrapolate: 'clamp',
                }),
              }}
            >
              <TouchableOpacity style={styles.pastMatchCard}>
              <View style={styles.pastMatchLeft}>
                <View
                  style={[
                    styles.resultBadge,
                    match.result === 'Win'
                      ? styles.resultBadgeWin
                      : styles.resultBadgeLoss,
                  ]}
                >
                  <Text
                    style={[
                      styles.resultText,
                      match.result === 'Win'
                        ? styles.resultTextWin
                        : styles.resultTextLoss,
                    ]}
                  >
                    {match.result}
                  </Text>
                </View>
                <View style={styles.pastMatchInfo}>
                  <Text style={styles.pastCourtName}>{match.courtName}</Text>
                  <Text style={styles.pastMatchDetails}>
                    {formatDate(match.date)} • {match.time}
                  </Text>
                   <View style={styles.partnerRow}>
                     <Ionicons
                       name="person-outline"
                       size={12}
                       color={colors.textSecondary}
                     />
                     <Text style={styles.partnerText}>with {match.partner}</Text>
                   </View>
                </View>
              </View>
              <Text style={styles.scoreText}>{match.score}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </View>

      {/* Quick Action */}
      <Animated.View
        style={[
          styles.actionsSection,
          {
            opacity: scrollY.interpolate({
              inputRange: [500, 650],
              outputRange: [1, 0.15],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
         <TouchableOpacity
           style={styles.actionButton}
           onPress={() => navigation.navigate('Matches')}
         >
           <Ionicons name="search" size={26} color={colors.white} />
           <Text style={styles.actionButtonText}>Find {selectedSport.name} Players Near You</Text>
         </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomPadding} />
      </Animated.ScrollView>
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    width: '100%',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    minHeight: 120,
  },
  courtPreview: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  courtImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  typeBadgeSmall: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 3,
  },
  typeBadgeCompetitive: {
    backgroundColor: colors.badgeCompetitive,
  },
  typeBadgeCasual: {
    backgroundColor: colors.badgeCasual,
  },
  typeBadgeTextSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  matchDetails: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingLeft: 0,
    zIndex: 2,
  },
  matchCardHeader: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  matchInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    alignSelf: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  perPlayer: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pastMatchCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pastMatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  resultBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeWin: {
    backgroundColor: colors.winBackground,
  },
  resultBadgeLoss: {
    backgroundColor: colors.lossBackground,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultTextWin: {
    color: colors.winText,
  },
  resultTextLoss: {
    color: colors.lossText,
  },
  pastMatchInfo: {
    flex: 1,
  },
  pastCourtName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pastMatchDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 20,
    gap: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bottomPadding: {
    height: 20,
  },
  padelHistoryContainer: {
    height: 300, // Fixed height for the padel history component
  },
});
