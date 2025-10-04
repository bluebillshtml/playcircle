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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { matchService, paymentService } from '../services/supabase';
import TeamBracketOverlay from '../components/TeamBracketOverlay';
import BracketButton from '../components/BracketButton';
import PadelMatchDetailScreen from './PadelMatchDetailScreen';

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
    if (matchId) {
      loadMatchDetails();
    }
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      setLoading(true);
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
    const address = encodeURIComponent(match.courtAddress);

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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Glass Card Court Preview */}
        <View style={styles.courtPreviewSection}>
          <ImageBackground
            source={{ uri: match.courtImage }}
            style={styles.courtImage}
            imageStyle={styles.courtImageStyle}
          >
            <View style={styles.imageOverlay}>
              <View
                style={[
                  styles.typeBadge,
                  match.type === 'competitive'
                    ? styles.typeBadgeCompetitive
                    : styles.typeBadgeCasual,
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {match.type === 'competitive' ? 'COMPETITIVE' : 'CASUAL'}
                </Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.courtInfoCard}>
            <View style={styles.courtInfoHeader}>
              <View style={styles.courtInfoLeft}>
                <Text style={styles.courtName}>{match.courtName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.ratingText}>{match.courtDetails.rating}</Text>
                </View>
              </View>
              <BracketButton onPress={() => setBracketVisible(true)} />
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={styles.courtAddress}>{match.courtAddress}</Text>
            </View>
            <View style={styles.courtQuickInfo}>
              <View style={styles.quickInfoItem}>
                <Ionicons name="layers" size={14} color={colors.textSecondary} />
                <Text style={styles.quickInfoText}>{match.courtDetails.surface}</Text>
              </View>
              <View style={styles.quickInfoItem}>
                <Ionicons name="time" size={14} color={colors.textSecondary} />
                <Text style={styles.quickInfoText}>{match.duration} min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsSection}>
          <TouchableOpacity style={styles.primaryActionButton} onPress={openDirections}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionButtonText}>Get Directions</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={callCourt}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={styles.secondaryActionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={shareMatch}>
              <Ionicons name="share-social" size={20} color={colors.primary} />
              <Text style={styles.secondaryActionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionButton}>
              <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryActionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Details</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(match.date)} at {match.time}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Skill Level</Text>
              <Text style={styles.detailValue}>{match.skillLevel}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Players</Text>
              <Text style={styles.detailValue}>
                {match.joinedPlayers}/{match.totalPlayers} joined
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{match.description}</Text>
        </View>

        {/* Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({match.joinedPlayers})</Text>
          {match.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {player.isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>HOST</Text>
                    </View>
                  )}
                </View>
                <View style={styles.playerRatingRow}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.playerRating}>{player.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Court Facilities</Text>
          <View style={styles.facilitiesGrid}>
            {match.courtDetails.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Your share</Text>
          <Text style={styles.price}>${match.pricePerPlayer}</Text>
          <Text style={styles.totalCostText}>
            (${match.totalCost} total ÷ {match.totalPlayers} players)
          </Text>
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinMatch}
        >
          <Text style={styles.joinButtonText}>Join & Pay</Text>
        </TouchableOpacity>
      </View>

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
        onConfirm={(selectedTeams) => {
          // User confirmed their team selection, proceed to payment
          setModalVisible(true);
        }}
      />
    </View>
  );
}

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  courtPreviewSection: {
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  courtImage: {
    width: '100%',
    height: 200,
  },
  courtImageStyle: {
    borderRadius: 0,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.9)',
  },
  typeBadgeCompetitive: {
    backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 107, 107, 0.2)',
  },
  typeBadgeCasual: {
    backgroundColor: isDarkMode ? 'rgba(116, 192, 252, 0.3)' : 'rgba(116, 192, 252, 0.2)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courtInfoCard: {
    padding: 16,
    backgroundColor: colors.glass,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
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
    backgroundColor: colors.surface,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  secondaryActionButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  totalCostText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
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
