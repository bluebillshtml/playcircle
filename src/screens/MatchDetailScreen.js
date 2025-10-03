import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  const [modalVisible, setModalVisible] = useState(false);

  // Get the matchId from navigation params, default to 1
  const matchId = route.params?.matchId || 1;
  const match = MOCK_MATCHES_DATA[matchId] || MOCK_MATCHES_DATA[1];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleJoinMatch = () => {
    setModalVisible(true);
  };

  const confirmPayment = () => {
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
              <View style={styles.courtTypeIcon}>
                <Ionicons
                  name={match.courtDetails.indoor ? 'home' : 'sunny'}
                  size={24}
                  color={colors.primary}
                />
              </View>
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>
              You're about to join this match and pay your share of the court
              rental.
            </Text>
            <View style={styles.modalPriceRow}>
              <Text style={styles.modalPriceLabel}>Amount to pay:</Text>
              <Text style={styles.modalPrice}>${match.pricePerPlayer}</Text>
            </View>
            <Text style={styles.modalNote}>
              Payment will be processed immediately. You can cancel up to 24
              hours before the match for a full refund.
            </Text>
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
                <Text style={styles.modalButtonConfirmText}>
                  Confirm & Pay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalPriceLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  modalNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
