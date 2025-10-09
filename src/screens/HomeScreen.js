import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { matchService, profileService } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PadelMatchHistory from '../components/PadelMatchHistory';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

// Mock data for upcoming matches - delete this later
const UPCOMING_MATCHES = [
  {
    id: 1,
    courtName: 'Center City Padel Club',
    location: 'Phield House',
    distance: '85.2 mi away',
    date: '2025-10-09',
    time: '7:30pm to 8:30pm',
    duration: 60,
    type: 'casual',
    sport: 'padel',
    skillLevel: 'Intermediate',
    joinedPlayers: 3,
    totalPlayers: 4,
    pricePerPlayer: 17.50,
    gameType: 'Doubles',
    organizer: 'Plei',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    courtName: 'Elite Padel Academy',
    location: 'Downtown Arena',
    distance: '12.3 mi away',
    date: '2025-10-10',
    time: '6:00pm to 7:00pm',
    duration: 60,
    type: 'competitive',
    sport: 'padel',
    skillLevel: 'Advanced',
    joinedPlayers: 2,
    totalPlayers: 4,
    pricePerPlayer: 15.00,
    gameType: 'Doubles',
    organizer: 'PlayCircle',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    courtName: 'Riverside Basketball Court',
    location: 'City Park',
    distance: '5.8 mi away',
    date: '2025-10-09',
    time: '5:00pm to 6:30pm',
    duration: 90,
    type: 'casual',
    sport: 'basketball',
    skillLevel: 'Beginner',
    joinedPlayers: 4,
    totalPlayers: 8,
    pricePerPlayer: 10.00,
    gameType: '4v4',
    organizer: 'Community',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  },
  {
    id: 4,
    courtName: 'Elite Tennis Academy',
    location: 'Tennis Center',
    distance: '18.5 mi away',
    date: '2025-10-11',
    time: '4:00pm to 6:00pm',
    duration: 120,
    type: 'competitive',
    sport: 'tennis',
    skillLevel: 'Intermediate',
    joinedPlayers: 2,
    totalPlayers: 4,
    pricePerPlayer: 25.00,
    gameType: 'Doubles',
    organizer: 'Elite Academy',
    image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&h=600&fit=crop',
  },
  {
    id: 5,
    courtName: 'Sunset Tennis Club',
    location: 'Memorial Park',
    distance: '7.2 mi away',
    date: '2025-10-09',
    time: '7:00pm to 9:00pm',
    duration: 120,
    type: 'casual',
    sport: 'tennis',
    skillLevel: 'All Levels',
    joinedPlayers: 2,
    totalPlayers: 4,
    pricePerPlayer: 12.50,
    gameType: 'Doubles',
    organizer: 'Sunset Club',
    image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&h=600&fit=crop',
  },
  {
    id: 6,
    courtName: 'Downtown Pickleball Courts',
    location: 'City Sports Complex',
    distance: '3.2 mi away',
    date: '2025-10-10',
    time: '10:00am to 11:30am',
    duration: 90,
    type: 'casual',
    sport: 'pickleball',
    skillLevel: 'Beginner',
    joinedPlayers: 3,
    totalPlayers: 4,
    pricePerPlayer: 8.00,
    gameType: 'Doubles',
    organizer: 'Pickleball Club',
    image: 'https://images.unsplash.com/photo-1617882252239-ce6fc579ced4?w=800&h=600&fit=crop',
  },
  {
    id: 7,
    courtName: 'Victory Basketball Arena',
    location: 'Sports Center',
    distance: '6.5 mi away',
    date: '2025-10-11',
    time: '8:00pm to 9:30pm',
    duration: 90,
    type: 'competitive',
    sport: 'basketball',
    skillLevel: 'Advanced',
    joinedPlayers: 6,
    totalPlayers: 10,
    pricePerPlayer: 15.00,
    gameType: '5v5',
    organizer: 'Victory Sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  },
];

// Mock data for past matches here. Delete later.
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

// Stats data fadsfsd
const USER_STATS = {
  totalMatches: 24,
  winRate: 67,
  hoursPlayed: 36,
  favoritePartner: 'Sarah Smith',
};

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { user, profile } = useAuth();
  const { selectedSport } = useSport();

  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [navModalVisible, setNavModalVisible] = useState(false);
  const [showSkipNotification, setShowSkipNotification] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter states
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [distanceRange, setDistanceRange] = useState(100);
  const [sortBy, setSortBy] = useState('nearest');

  // Generate 7 days starting from today
  const generateDateButtons = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const dateButtons = generateDateButtons();

  const formatDateButton = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, '0');
    return `${day} ${dateNum}`;
  };

  const isSameDate = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Filter matches by selected date, sport, difficulty, time, and distance
  const filteredMatches = upcomingMatches.filter(match => {
    const matchDate = new Date(match.date);
    const dateMatches = isSameDate(matchDate, selectedDate);

    // Filter by sport - if selectedSport exists, only show matches for that sport
    const sportMatches = !selectedSport ||
                        match.sport?.toLowerCase() === selectedSport.id?.toLowerCase();

    // Filter by difficulty (skill level)
    const difficultyMatches = selectedDifficulties.length === 0 ||
                             selectedDifficulties.includes(match.skillLevel);

    // Filter by time
    let timeMatches = selectedTimes.length === 0;
    if (selectedTimes.length > 0) {
      const matchTime = match.time.split(' ')[0]; // Get start time like "7:30pm"
      const hour = parseInt(matchTime.split(':')[0]);
      const isPM = matchTime.toLowerCase().includes('pm');
      const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

      timeMatches = selectedTimes.some(timeRange => {
        if (timeRange === 'Morning' && hour24 >= 6 && hour24 < 12) return true;
        if (timeRange === 'Afternoon' && hour24 >= 12 && hour24 < 17) return true;
        if (timeRange === 'Evening' && hour24 >= 17 && hour24 < 21) return true;
        if (timeRange === 'Night' && (hour24 >= 21 || hour24 < 6)) return true;
        return false;
      });
    }

    // Filter by distance (in this mock we'll assume all are within range)
    // In production, you'd calculate actual distance
    const distanceMatches = true;

    return dateMatches && sportMatches && difficultyMatches && timeMatches && distanceMatches;
  });

  // Sort filtered matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'nearest') {
      // Sort by distance (parse the distance string)
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    } else if (sortBy === 'earliest') {
      // Sort by time
      return a.time.localeCompare(b.time);
    } else if (sortBy === 'price-low') {
      return a.pricePerPlayer - b.pricePerPlayer;
    } else if (sortBy === 'price-high') {
      return b.pricePerPlayer - a.pricePerPlayer;
    }
    return 0;
  });

  // Group matches by sport for display
  const groupedMatches = sortedMatches.reduce((groups, match) => {
    const sport = match.sport || 'other';
    if (!groups[sport]) {
      groups[sport] = [];
    }
    groups[sport].push(match);
    return groups;
  }, {});

  const sportNames = {
    padel: 'Padel',
    tennis: 'Tennis',
    pickleball: 'Pickleball',
    basketball: 'Basketball',
    other: 'Other'
  };

  // Navigation animation refs
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Skip notification animation refs
  const skipFadeAnim = useRef(new Animated.Value(0)).current;
  const skipScaleAnim = useRef(new Animated.Value(0.8)).current;
  const skipSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
  }, [user]);

  // Check for skip notification flag
  useEffect(() => {
    const checkSkipNotification = async () => {
      const shouldShow = await AsyncStorage.getItem('show_skip_notification');
      if (shouldShow === 'true') {
        await AsyncStorage.removeItem('show_skip_notification');
        setShowSkipNotification(true);

        // Animate in - instant
        skipFadeAnim.setValue(1);
        skipScaleAnim.setValue(1);
        skipSlideAnim.setValue(0);
      }
    };
    checkSkipNotification();
  }, []);

  const navItems = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Leaderboard', icon: 'trophy', screen: 'Dashboard' },
    { name: 'Friends', icon: 'people', screen: 'Friends' },
    { name: 'Messages', icon: 'chatbubbles', screen: 'Messages' },
    { name: 'Profile', icon: 'person', screen: 'Profile' },
  ];

  const openNavModal = () => {
    setNavModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeNavModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -width,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNavModalVisible(false);
    });
  };

  const closeSkipNotification = () => {
    Animated.parallel([
      Animated.timing(skipFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(skipScaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(skipSlideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSkipNotification(false);
    });
  };



  const loadData = async () => {
    try {
      setLoading(true);

      // Load upcoming matches for selected sport
      try {
        const matches = await matchService.getUpcomingMatches(20, selectedSport.id);
        const transformedMatches = matches.map(match => ({
          id: match.id,
          courtName: match.court?.name || 'Unknown Court',
          location: match.court?.address || 'Location',
          distance: '5 mi away',
          date: match.match_date,
          time: match.match_time,
          duration: match.duration_minutes,
          type: match.match_type,
          skillLevel: match.skill_level,
          joinedPlayers: match.current_players,
          totalPlayers: match.max_players,
          pricePerPlayer: parseFloat(match.price_per_player),
          gameType: `${match.max_players/2}v${match.max_players/2}`,
          organizer: 'PlayCircle',
          image: match.court?.image_url || 'https://images.unsplash.com/photo-1554068865-24cd4e34b8?w=400&h=300&fit=crop',
        }));
        setUpcomingMatches(transformedMatches.length > 0 ? transformedMatches : UPCOMING_MATCHES);
      } catch (matchError) {
        console.error('Error loading matches:', matchError);
        setUpcomingMatches(UPCOMING_MATCHES);
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
    if (profile?.full_name && profile.full_name.trim() !== '' && profile.full_name !== 'User') {
      return `Welcome back, ${profile.full_name}`;
    } else if (profile?.first_name && profile.first_name.trim() !== '') {
      return `Welcome back, ${profile.first_name}`;
    } else if (profile?.username && profile.username.trim() !== '') {
      return `Welcome back, ${profile.username}`;
    } else if (user?.user_metadata?.full_name) {
      // Check user metadata for name
      return `Welcome back, ${user.user_metadata.full_name}`;
    } else if (user?.user_metadata?.first_name) {
      return `Welcome back, ${user.user_metadata.first_name}`;
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
        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
          {/* Header with Menu, Search, and Notification */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={openNavModal}>
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search games</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <Ionicons name="options-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotificationModal(true)}
            >
              <Ionicons name="notifications-outline" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Date Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateFilterContainer}
            contentContainerStyle={styles.dateFilterContent}
          >
            {dateButtons.map((date, index) => {
              const isSelected = isSameDate(date, selectedDate);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateFilterPill,
                    isSelected && styles.dateFilterPillActive
                  ]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateFilterText,
                      isSelected && styles.dateFilterTextActive
                    ]}
                  >
                    {formatDateButton(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollableContent}
          showsVerticalScrollIndicator={false}
        >

      {/* Available Games Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Games</Text>
        </View>

        {filteredMatches.length > 0 ? (
          <>
            {Object.entries(groupedMatches).map(([sport, matches]) => (
              <View key={sport}>
                {Object.keys(groupedMatches).length > 1 && (
                  <Text style={styles.sportCategoryTitle}>
                    {sportNames[sport] || sport}
                  </Text>
                )}
                {matches.map((match, index) => (
                  <View key={match.id}>
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
            </View>
                ))}
              </View>
            ))}
          </>
        ) : (
           <View style={styles.emptyState}>
             <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
             <Text style={styles.emptyStateText}>
               No {selectedSport.name.toLowerCase()} matches on {formatDateButton(selectedDate)}
             </Text>
             <TouchableOpacity
               style={styles.createButton}
               onPress={() => navigation.navigate('Create')}
             >
               <Text style={styles.createButtonText}>Create a Match</Text>
             </TouchableOpacity>
           </View>
        )}
      </View>


          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Navigation Modal */}
        <Modal
          visible={navModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeNavModal}
          statusBarTranslucent={true}
        >
          <Animated.View style={[styles.navModalOverlay, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.navBackdrop}
              activeOpacity={1}
              onPress={closeNavModal}
            />
            <Animated.View 
              style={[
                styles.navDrawer, 
                { 
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              <BlurView intensity={25} style={styles.navBlurContainer}>
                <View style={styles.navDrawerHeader}>
                  <View style={styles.navDrawerHeaderContent}>
                    <View style={styles.navAppIcon}>
                      <Ionicons name="tennisball" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.navAppInfo}>
                      <Text style={styles.navAppName}>PlayCircle</Text>
                      <Text style={styles.navAppSubtitle}>Sport Community</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeNavModal}
                    style={styles.navCloseButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.navItemsContainer}>
                  {navItems.map((item, index) => (
                    <Animated.View
                      key={item.screen}
                      style={{
                        transform: [{
                          translateX: slideAnim.interpolate({
                            inputRange: [-width, 0],
                            outputRange: [-50 - (index * 20), 0],
                            extrapolate: 'clamp',
                          })
                        }],
                        opacity: slideAnim.interpolate({
                          inputRange: [-width, -width + 100, 0],
                          outputRange: [0, 0, 1],
                          extrapolate: 'clamp',
                        })
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.navItem,
                          'Home' === item.screen && styles.navItemActive
                        ]}
                        onPress={() => {
                          closeNavModal();
                          navigation.navigate(item.screen);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.navItemIcon,
                          'Home' === item.screen && styles.navItemIconActive
                        ]}>
                          <Ionicons 
                            name={item.icon} 
                            size={24} 
                            color={'Home' === item.screen ? colors.primary : colors.text} 
                          />
                        </View>
                        <Text style={[
                          styles.navItemText,
                          'Home' === item.screen && styles.navItemTextActive
                        ]}>
                          {item.name}
                        </Text>
                        {'Home' === item.screen && (
                          <View style={styles.navItemIndicator}>
                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                <View style={styles.navDrawerFooter}>
                  <View style={styles.navUserInfo}>
                    <View style={styles.navUserAvatar}>
                      <Ionicons name="person" size={20} color={colors.text} />
                    </View>
                    <View style={styles.navUserDetails}>
                      <Text style={styles.navUserName}>Player</Text>
                      <Text style={styles.navUserStatus}>Online</Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
            style={styles.filterModal}
          >
            {/* Header with glassmorphism */}
            <BlurView intensity={60} tint="dark" style={styles.filterHeader}>
              <View style={styles.filterHeaderRow}>
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.filterCloseButton}
                >
                  <Ionicons name="close-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.filterTitleContainer}>
                  <View style={styles.filterIconBadge}>
                    <Ionicons name="options" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.filterTitle}>Filters</Text>
                    <Text style={styles.filterSubtitle}>Customize your search</Text>
                  </View>
                </View>
              </View>
            </BlurView>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Preferred Time */}
              <View style={styles.filterSectionCard}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Preferred Time</Text>
                </View>
                <View style={styles.filterChipsContainer}>
                  {[
                    { label: 'Morning', icon: 'sunny', value: 'Morning' },
                    { label: 'Afternoon', icon: 'partly-sunny', value: 'Afternoon' },
                    { label: 'Evening', icon: 'moon', value: 'Evening' },
                    { label: 'Night', icon: 'moon-outline', value: 'Night' }
                  ].map((time) => (
                    <TouchableOpacity
                      key={time.value}
                      style={[
                        styles.filterChip,
                        selectedTimes.includes(time.value) && styles.filterChipActive
                      ]}
                      onPress={() => {
                        if (selectedTimes.includes(time.value)) {
                          setSelectedTimes(selectedTimes.filter(t => t !== time.value));
                        } else {
                          setSelectedTimes([...selectedTimes, time.value]);
                        }
                      }}
                    >
                      <Ionicons
                        name={time.icon}
                        size={18}
                        color={selectedTimes.includes(time.value) ? '#FFFFFF' : colors.primary}
                      />
                      <Text style={[
                        styles.filterChipText,
                        selectedTimes.includes(time.value) && styles.filterChipTextActive
                      ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Distance Slider */}
              <View style={styles.filterSectionCard}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Distance Away</Text>
                </View>
                <View style={styles.distanceValueContainer}>
                  <View style={styles.distanceValueBadge}>
                    <Text style={styles.distanceValue}>{distanceRange} miles</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={100}
                  step={5}
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                  thumbTintColor={colors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>5 mi</Text>
                  <Text style={styles.sliderLabel}>100 mi</Text>
                </View>
              </View>

              {/* Game Difficulty */}
              <View style={styles.filterSectionCard}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="trophy" size={20} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Skill Level</Text>
                </View>
                <View style={styles.filterChipsContainer}>
                  {[
                    { label: 'Beginner', color: '#3B82F6' },
                    { label: 'Intermediate', color: '#10B981' },
                    { label: 'Advanced', color: '#F59E0B' },
                    { label: 'Expert', color: '#EF4444' }
                  ].map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty.label}
                      style={[
                        styles.filterChip,
                        selectedDifficulties.includes(difficulty.label) && styles.filterChipActive,
                        selectedDifficulties.includes(difficulty.label) && { backgroundColor: difficulty.color }
                      ]}
                      onPress={() => {
                        if (selectedDifficulties.includes(difficulty.label)) {
                          setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty.label));
                        } else {
                          setSelectedDifficulties([...selectedDifficulties, difficulty.label]);
                        }
                      }}
                    >
                      <View style={[
                        styles.difficultyDot,
                        { backgroundColor: selectedDifficulties.includes(difficulty.label) ? '#FFFFFF' : difficulty.color }
                      ]} />
                      <Text style={[
                        styles.filterChipText,
                        selectedDifficulties.includes(difficulty.label) && styles.filterChipTextActive
                      ]}>
                        {difficulty.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View style={styles.filterSectionCard}>
                <View style={styles.filterSectionHeader}>
                  <Ionicons name="swap-vertical" size={20} color={colors.primary} />
                  <Text style={styles.filterSectionTitle}>Sort By</Text>
                </View>
                <View style={styles.sortOptionsGrid}>
                  {[
                    { label: 'Nearest', icon: 'navigate', value: 'nearest' },
                    { label: 'Earliest', icon: 'time', value: 'earliest' },
                    { label: 'Price Low', icon: 'arrow-down', value: 'price-low' },
                    { label: 'Price High', icon: 'arrow-up', value: 'price-high' }
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.value}
                      style={[
                        styles.sortOption,
                        sortBy === sort.value && styles.sortOptionActive
                      ]}
                      onPress={() => setSortBy(sort.value)}
                    >
                      <Ionicons
                        name={sort.icon}
                        size={22}
                        color={sortBy === sort.value ? '#FFFFFF' : colors.primary}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        sortBy === sort.value && styles.sortOptionTextActive
                      ]}>
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Buttons with Blur */}
            <BlurView intensity={80} tint="dark" style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedDifficulties([]);
                  setSelectedTimes([]);
                  setDistanceRange(100);
                  setSortBy('nearest');
                }}
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </BlurView>
          </LinearGradient>
        </Modal>

        {/* Skip Notification Modal */}
        <Modal
          visible={showSkipNotification}
          transparent={true}
          animationType="none"
          onRequestClose={closeSkipNotification}
          statusBarTranslucent={true}
        >
          <Animated.View
            style={[
              styles.skipModalOverlay,
              { opacity: skipFadeAnim }
            ]}
          >
            {/* Blurred background */}
            <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" />
            <TouchableOpacity
              style={styles.skipModalBackdrop}
              activeOpacity={1}
              onPress={closeSkipNotification}
            />
            <Animated.View
              style={[
                styles.skipModalContainer,
                {
                  opacity: skipFadeAnim,
                  transform: [
                    { scale: skipScaleAnim },
                    { translateY: skipSlideAnim }
                  ]
                }
              ]}
            >
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.skipCardBlur}
              >
                <View style={styles.skipCard}>
                  <View style={styles.skipIconContainer}>
                    <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
                  </View>
                  <Text style={styles.skipTitle}>Onboarding Skipped</Text>
                  <Text style={styles.skipMessage}>
                    You can set up your sport preferences anytime in your Profile settings.
                  </Text>
                  <TouchableOpacity
                    style={styles.skipContinueButton}
                    onPress={closeSkipNotification}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.skipContinueText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Notification Modal */}
        <Modal
          visible={showNotificationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNotificationModal(false)}
          statusBarTranslucent={true}
        >
          <View style={styles.skipModalOverlay}>
            <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" />
            <TouchableOpacity
              style={styles.skipModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowNotificationModal(false)}
            />
            <View style={styles.skipModalContainer}>
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.skipCardBlur}
              >
                <View style={styles.skipCard}>
                  <View style={styles.skipIconContainer}>
                    <Ionicons name="notifications" size={56} color={colors.primary} />
                  </View>
                  <Text style={styles.skipTitle}>Notifications</Text>
                  <Text style={styles.skipMessage}>
                    Notifications feature coming soon!
                  </Text>
                  <TouchableOpacity
                    style={styles.skipContinueButton}
                    onPress={() => setShowNotificationModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.skipContinueText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </View>
        </Modal>
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fixedHeader: {
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  scrollableContent: {
    flex: 1,
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
  notificationButton: {
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
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  dateFilterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateFilterPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  dateFilterPillActive: {
    backgroundColor: colors.text,
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dateFilterTextActive: {
    color: colors.background,
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
  sportCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  matchCard: {
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0,
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
    color: colors.white,
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
  // Navigation Modal Styles
  navModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  navBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navDrawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 320,
  },
  navBlurContainer: {
    flex: 1,
    backgroundColor: colors.glass,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderLeftWidth: 0,
  },
  navDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  navDrawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navAppIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navAppInfo: {
    flex: 1,
  },
  navAppName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  navAppSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  navCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginVertical: 6,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  navItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navItemIconActive: {
    backgroundColor: colors.primary + '20',
  },
  navItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  navItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  navItemIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDrawerFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  navUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navUserDetails: {
    flex: 1,
  },
  navUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  navUserStatus: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
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
  filterModal: {
    flex: 1,
  },
  filterHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  filterSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  radioButtonSelected: {
    borderWidth: 7,
    borderColor: '#10B981',
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  distanceSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  filterFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 0,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipModalContainer: {
    width: '85%',
    maxWidth: 380,
  },
  skipCardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  skipCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(6, 95, 70, 0.4)',
  },
  skipIconContainer: {
    marginBottom: 20,
  },
  skipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  skipMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  skipContinueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  skipContinueText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  filterSectionCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  filterIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 0,
  },
  filterCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  filterChipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  distanceValueContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceValueBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  sortOptionText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    flex: 1,
  },
  sortOptionTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
});
