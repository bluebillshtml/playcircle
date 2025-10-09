import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  ActionSheetIOS,
  Platform,
  ImageBackground,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { matchService, paymentService } from '../services/supabase';
import TeamBracketOverlay from '../components/TeamBracketOverlay';
import BracketButton from '../components/BracketButton';
import PadelMatchDetailScreen from './PadelMatchDetailScreen';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

// Mock match detail data - multiple matches
const MOCK_MATCHES_DATA = {
  1: {
    id: 1,
    courtName: 'Downtown Padel Club',
    courtAddress: '123 Main St, San Francisco, CA 94102',
    coordinates: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    courtImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    date: '2025-10-03',
    time: '18:00',
    duration: 90,
    type: 'competitive',
    skillLevel: 'Intermediate',
    totalPlayers: 4,
    joinedPlayers: 2,
    pricePerPlayer: 10,
    totalCost: 40,
    host: {
      name: 'John Doe',
      rating: 4.5,
      matchesPlayed: 47,
    },
    players: [
      {
        id: 1,
        name: 'John Doe',
        rating: 4.5,
        isHost: true,
      },
      {
        id: 2,
        name: 'Jane Smith',
        rating: 4.3,
        isHost: false,
      },
    ],
    description:
      'Looking for 2 more players for a fun competitive match! Intermediate level preferred. Let\'s have a great game!',
    courtDetails: {
      facilities: ['Lockers', 'Showers', 'Parking', 'Pro Shop'],
      surface: 'Artificial Grass',
      indoor: true,
      rating: 4.8,
      phone: '+1 (555) 123-4567',
    },
  },
  2: {
    id: 2,
    courtName: 'Sunset Sports Center',
    courtAddress: '456 Beach Ave, San Francisco, CA 94121',
    coordinates: {
      latitude: 37.78925,
      longitude: -122.4334,
    },
    courtImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    date: '2025-10-05',
    time: '10:00',
    duration: 60,
    type: 'casual',
    skillLevel: 'Beginner',
    totalPlayers: 4,
    joinedPlayers: 3,
    pricePerPlayer: 8.75,
    totalCost: 35,
    host: {
      name: 'Sarah Smith',
      rating: 4.8,
      matchesPlayed: 63,
    },
    players: [
      {
        id: 1,
        name: 'Sarah Smith',
        rating: 4.8,
        isHost: true,
      },
      {
        id: 2,
        name: 'Mike Davis',
        rating: 4.2,
        isHost: false,
      },
      {
        id: 3,
        name: 'Lisa Chen',
        rating: 4.4,
        isHost: false,
      },
    ],
    description:
      'Casual morning game for beginners! Come join us for a relaxed and fun match. Perfect for those just getting into padel.',
    courtDetails: {
      facilities: ['Lockers', 'Showers', 'Parking', 'Cafe'],
      surface: 'Synthetic Turf',
      indoor: false,
      rating: 4.6,
      phone: '+1 (555) 234-5678',
    },
  },
};

export default function MatchDetailScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { selectedSport } = useSport();

  // Use sport-specific match detail screen
  if (selectedSport.id === 'padel') {
    return <PadelMatchDetailScreen navigation={navigation} route={route} />;
  }
  const [modalVisible, setModalVisible] = useState(false);
  const [bracketVisible, setBracketVisible] = useState(false);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Get the matchId from navigation params
  const matchId = route.params?.matchId;

  useEffect(() => {
    // Hide the native navigation header
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (matchId) {
      loadMatchDetails();
    }
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      setLoading(true);

      // Try to fetch from Supabase first
      try {
        const matchData = await matchService.getMatch(matchId);

        const transformedMatch = {
          id: matchData.id,
          courtName: matchData.court?.name || 'Unknown Court',
          courtAddress: matchData.court?.address || '',
          coordinates: {
            latitude: matchData.court?.latitude || 37.78825,
            longitude: matchData.court?.longitude || -122.4324,
          },
          courtImage: matchData.court?.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
          date: matchData.match_date,
          time: matchData.match_time,
          duration: matchData.duration_minutes,
          type: matchData.match_type,
          skillLevel: matchData.skill_level,
          totalPlayers: matchData.max_players,
          joinedPlayers: matchData.current_players,
          pricePerPlayer: parseFloat(matchData.price_per_player),
          totalCost: parseFloat(matchData.total_cost),
          host: {
            name: matchData.host?.full_name || matchData.host?.username || 'Host',
            rating: 4.5,
            matchesPlayed: matchData.host?.total_matches || 0,
          },
          players: matchData.match_players?.map(mp => ({
            id: mp.user_id,
            name: mp.user?.full_name || mp.user?.username || 'Player',
            rating: 4.5,
            isHost: mp.is_host,
          })) || [],
          description: matchData.description || 'No description provided.',
          courtDetails: {
            facilities: [
              matchData.court?.has_lockers && 'Lockers',
              matchData.court?.has_showers && 'Showers',
              matchData.court?.has_parking && 'Parking',
              matchData.court?.has_pro_shop && 'Pro Shop',
            ].filter(Boolean),
            surface: matchData.court?.surface_type || 'Artificial Grass',
            indoor: matchData.court?.is_indoor || false,
            rating: matchData.court?.rating || 4.5,
            phone: matchData.court?.phone || '',
          },
        };

        setMatch(transformedMatch);
      } catch (dbError) {
        // If match not found in database, use mock data as fallback
        console.log('Match not in database, using mock data for matchId:', matchId);
        const mockMatch = MOCK_MATCHES_DATA[matchId];

        if (mockMatch) {
          setMatch(mockMatch);
        } else {
          throw new Error('Match not found');
        }
      }
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  const getDateDisplay = (dateString) => {
    if (isToday(dateString)) {
      return 'Today';
    }
    return formatDate(dateString);
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + durationMinutes;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    const finalHours = endHours % 24;
    return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
  };

  const handleJoinMatch = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a match');
      return;
    }

    try {
      // Join the match
      await matchService.joinMatch(matchId, user.id);

      // Reload match details
      await loadMatchDetails();

      // Show payment modal
      setModalVisible(true);
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert('Error', error.message || 'Failed to join match');
    }
  };

  const confirmPayment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a match');
      return;
    }

    try {
      // Create payment record
      const payment = await paymentService.createPayment(
        matchId,
        user.id,
        match.pricePerPlayer,
        'card'
      );

      // TODO: Integrate with Stripe here
      // For now, mark as succeeded
      await paymentService.updatePaymentStatus(payment.id, 'succeeded');

      setModalVisible(false);
      Alert.alert(
        'Success!',
        'You have successfully joined the match. Payment will be processed.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const openDirections = () => {
    const { latitude, longitude } = match.coordinates;

    const options = [
      { name: 'Apple Maps', url: `http://maps.apple.com/?daddr=${latitude},${longitude}` },
      { name: 'Google Maps', url: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}` },
      { name: 'Waze', url: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes` },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...options.map(o => o.name), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            Linking.openURL(options[buttonIndex].url);
          }
        }
      );
    } else {
      // For Android, show alert with options
      Alert.alert(
        'Choose Navigation App',
        'Select your preferred navigation service',
        [
          ...options.map(option => ({
            text: option.name,
            onPress: () => Linking.openURL(option.url),
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const callCourt = () => {
    Linking.openURL(`tel:${match.courtDetails.phone}`);
  };

  const shareMatch = () => {
    Alert.alert('Share', 'Share functionality would go here');
  };

  const styles = createStyles(colors, isDarkMode);

  if (loading || !match) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BlurView intensity={isDarkMode ? 30 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerButtonBlur}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Match Details</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} activeOpacity={0.7}>
              <BlurView intensity={isDarkMode ? 30 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerButtonBlur}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} activeOpacity={0.7}>
              <BlurView intensity={isDarkMode ? 30 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerButtonBlur}>
                <Ionicons name="location-outline" size={22} color={colors.text} />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={shareMatch} activeOpacity={0.7}>
              <BlurView intensity={isDarkMode ? 30 : 40} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerButtonBlur}>
                <Ionicons name="share-outline" size={22} color={colors.text} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.tabActive]} activeOpacity={0.7}>
              <Text style={[styles.tabText, styles.tabTextActive]}>ABOUT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
              <Text style={styles.tabText}>ROSTER</Text>
            </TouchableOpacity>
          </View>

          {/* Overview Section */}
          <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            
            {/* Single Card Container for Overview Info */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewRow}>
                <View style={styles.overviewItem}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                  <Text style={styles.overviewLabel}>{getDateDisplay(match.date)}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Ionicons name="cash-outline" size={24} color={colors.primary} />
                  <Text style={styles.overviewLabel}>${match.pricePerPlayer.toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.overviewRow}>
                <View style={styles.overviewItem}>
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                  <Text style={styles.overviewLabel}>{match.time} - {calculateEndTime(match.time, match.duration)}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Ionicons name="people-outline" size={24} color={colors.primary} />
                  <Text style={styles.overviewLabel}>{match.joinedPlayers}-{match.totalPlayers} Players</Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.spotsLabel}>Spots Available</Text>
                <Text style={styles.spotsCount}>{match.joinedPlayers} of {match.totalPlayers}</Text>
              </View>
              
              {match.totalPlayers - match.joinedPlayers > 0 && (
                <View style={styles.spotsToGoBadge}>
                  <Text style={styles.spotsToGoText}>{match.totalPlayers - match.joinedPlayers} more to go!</Text>
                </View>
              )}
              
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${(match.joinedPlayers / match.totalPlayers) * 100}%` }]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Scheduled</Text>
                <Text style={styles.progressLabel}>Confirmed</Text>
                <Text style={styles.progressLabel}>Game Full</Text>
              </View>
            </View>
          </BlurView>

          {/* Organized By */}
          <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.section}>
            <Text style={styles.sectionTitle}>Organized by</Text>
            <View style={styles.organizerCard}>
              <LinearGradient
                colors={[colors.primary + '40', colors.primary + '20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.organizerAvatar}
              >
                <Ionicons name="person" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{match.host.name}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'DD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.contactButtonGradient}
                >
                  <Text style={styles.contactButtonText}>Contact</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Location */}
          <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.locationCard} onPress={openDirections} activeOpacity={0.8}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="car" size={28} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Get Directions</Text>
                <Text style={styles.locationAddress}>{match.courtAddress}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Map Placeholder */}
            <ImageBackground
              source={{ uri: match.courtImage }}
              style={styles.mapImage}
              imageStyle={{ borderRadius: 16, marginTop: 16 }}
            />
          </BlurView>

          {/* About This Event */}
          <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT THIS EVENT</Text>
            <Text style={styles.aboutEventText}>{match.courtName}</Text>
            
            {match.description && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.eventDescription}>{match.description}</Text>
              </>
            )}
            
            {/* Facility Rules */}
            <View style={styles.sectionDivider} />
            <Text style={styles.facilityTitle}>Facility rules:</Text>
            <View style={styles.facilityRuleItem}>
              <View style={styles.idIcon}>
                <Text style={styles.idText}>ID</Text>
              </View>
              <Text style={styles.facilityRuleText}>ID required to check out game ball...</Text>
            </View>
            <TouchableOpacity style={styles.readMoreButton} activeOpacity={0.7}>
              <Text style={styles.readMoreText}>Read more</Text>
            </TouchableOpacity>
          </BlurView>

          {/* What to Expect */}
          <View style={styles.whatToExpectSection}>
            <Text style={styles.sectionTitleMain}>What to expect</Text>
            <View style={styles.expectCardsRow}>
              <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.expectCard}>
                <Text style={styles.expectTitle}>GAME TYPE</Text>
                <Text style={styles.expectValue}>• {match.type === 'competitive' ? 'Co-ed' : 'Casual'}</Text>
                <Text style={styles.expectValue}>• Min 4v4 - Max 5v5</Text>
              </BlurView>

              <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.expectCard}>
                <Text style={styles.expectTitle}>GAME SKILL LEVEL</Text>
                <View style={styles.skillLevelBadge}>
                  <Text style={styles.skillLevelText}>{match.skillLevel}</Text>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Payment & Cancellation Policy */}
          <BlurView intensity={isDarkMode ? 35 : 50} tint={isDarkMode ? 'dark' : 'light'} style={styles.section}>
            <Text style={styles.sectionTitle}>Payment & cancellation policy</Text>
            <Text style={styles.policyText}>
              Make sure you're comfortable with our policy before joining a game.
            </Text>
            <TouchableOpacity style={styles.readMoreButton} activeOpacity={0.7}>
              <Text style={styles.readMoreText}>Read more</Text>
            </TouchableOpacity>
          </BlurView>

        {/* Glassmorphic Bottom Bar */}
        <BlurView intensity={isDarkMode ? 50 : 70} tint={isDarkMode ? 'dark' : 'light'} style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinMatch}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary + 'DD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.joinButtonGradient}
            >
              <Text style={styles.joinButtonText}>Join Game</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Header with Icon */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="card" size={32} color={colors.primary} />
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <Text style={styles.modalText}>
                You're about to join this match and pay your share of the court
                rental.
              </Text>

              {/* Match Summary */}
              <View style={styles.modalMatchSummary}>
                <View style={styles.modalMatchRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={styles.modalMatchText}>{match.courtName}</Text>
                </View>
                <View style={styles.modalMatchRow}>
                  <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={styles.modalMatchText}>
                    {formatDate(match.date)} at {match.time}
                  </Text>
                </View>
                <View style={styles.modalMatchRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.modalMatchText}>{match.duration} minutes</Text>
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={styles.modalPriceRow}>
                <View>
                  <Text style={styles.modalPriceLabel}>Your share</Text>
                  <Text style={styles.modalPriceSubtext}>
                    ${match.totalCost} ÷ {match.totalPlayers} players
                  </Text>
                </View>
                <Text style={styles.modalPrice}>${match.pricePerPlayer}</Text>
              </View>

              <View style={styles.modalNoticeBox}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.modalNote}>
                  Payment will be processed immediately. Cancel up to 24 hours before
                  for a full refund.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={confirmPayment}
                >
                  <Ionicons name="card" size={20} color="#FFFFFF" />
                  <Text style={styles.modalButtonConfirmText}>
                    Confirm & Pay
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Modal>

      {/* Team Bracket Overlay */}
      <TeamBracketOverlay
        visible={bracketVisible}
        onClose={() => setBracketVisible(false)}
        matchData={match}
        onConfirm={() => {
          // User confirmed their team selection, proceed to payment
          setModalVisible(true);
        }}
      />
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 2,
    backgroundColor: 'transparent',
    height: 25,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  },
  headerButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
    marginHorizontal: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  tabTextActive: {
    color: colors.primary,
  },
  overviewSection: {
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  overviewCard: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  progressContainer: {
    marginTop: 0,
    position: 'relative',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spotsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  spotsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  spotsToGoBadge: {
    alignSelf: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  spotsToGoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  progressBarBg: {
    height: 24,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: 16,
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  policyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutEventText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    marginVertical: 16,
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  whatToExpectSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleMain: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  expectCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  expectCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  expectTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  expectValue: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  skillLevelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  facilityRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  idIcon: {
    width: 40,
    height: 28,
    backgroundColor: '#9333EA',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  facilityRuleText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  courtPreviewSection: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  courtImage: {
    width: '100%',
    height: 240,
  },
  courtImageStyle: {
    borderRadius: 24,
  },
  imageOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  typeBadgeBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  typeBadgeCompetitive: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  typeBadgeCasual: {
    borderWidth: 1,
    borderColor: 'rgba(116, 192, 252, 0.5)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  courtInfoCard: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  courtInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courtInfoLeft: {
    flex: 1,
  },
  courtName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  courtTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  courtAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  courtQuickInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionButtonsSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryActionBlur: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  secondaryActionButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  },
  playerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  playerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerRating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  facilitiesGrid: {
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facilityText: {
    fontSize: 15,
    color: colors.text,
  },
  spacer: {
    height: 20,
  },
  bottomBar: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  blurContainer: {
    flex: 1,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -250 }],
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalMatchSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  modalMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalMatchText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  modalPriceLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalPriceSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  modalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  modalNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonConfirm: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
