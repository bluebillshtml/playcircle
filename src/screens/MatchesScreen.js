import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import NavigationButton from '../components/NavigationButton';

// Mock data for available matches
const MOCK_MATCHES = [
  {
    id: 1,
    courtName: 'Downtown Padel Club',
    courtAddress: '123 Main St',
    date: '2025-10-05',
    time: '18:00',
    duration: 90,
    type: 'competitive',
    skillLevel: 'Intermediate',
    totalPlayers: 4,
    joinedPlayers: 2,
    pricePerPlayer: 10,
    totalCost: 40,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
    host: {
      name: 'John Doe',
      rating: 4.5,
    },
  },
  {
    id: 2,
    courtName: 'Sunset Sports Center',
    courtAddress: '456 Beach Ave',
    date: '2025-10-03',
    time: '10:00',
    duration: 60,
    type: 'casual',
    skillLevel: 'Beginner',
    totalPlayers: 4,
    joinedPlayers: 3,
    pricePerPlayer: 8.75,
    totalCost: 35,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop',
    host: {
      name: 'Sarah Smith',
      rating: 4.8,
    },
  },
  {
    id: 3,
    courtName: 'Elite Padel Academy',
    courtAddress: '789 Sports Way',
    date: '2025-10-04',
    time: '14:30',
    duration: 90,
    type: 'competitive',
    skillLevel: 'Advanced',
    totalPlayers: 4,
    joinedPlayers: 1,
    pricePerPlayer: 12.5,
    totalCost: 50,
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&h=300&fit=crop',
    host: {
      name: 'Mike Johnson',
      rating: 4.9,
    },
  },
  {
    id: 4,
    courtName: 'Downtown Padel Club',
    courtAddress: '123 Main St',
    date: '2025-10-06',
    time: '20:00',
    duration: 60,
    type: 'casual',
    skillLevel: 'All Levels',
    totalPlayers: 4,
    joinedPlayers: 2,
    pricePerPlayer: 10,
    totalCost: 40,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    host: {
      name: 'Emily Davis',
      rating: 4.6,
    },
  },
];

export default function MatchesScreen({ navigation }) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('all'); // 'all', 'casual', 'competitive'

  const filteredMatches =
    filter === 'all'
      ? MOCK_MATCHES
      : MOCK_MATCHES.filter((match) => match.type === filter);

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

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      {/* Header */}
      <View style={styles.header}>
        <NavigationButton navigation={navigation} currentScreen="Matches" />
        <Text style={styles.headerTitle}>Available Matches</Text>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'casual' && styles.filterActive,
          ]}
          onPress={() => setFilter('casual')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'casual' && styles.filterTextActive,
            ]}
          >
            Casual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'competitive' && styles.filterActive,
          ]}
          onPress={() => setFilter('competitive')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'competitive' && styles.filterTextActive,
            ]}
          >
            Competitive
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.matchesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredMatches.map((match) => (
          <TouchableOpacity
            key={match.id}
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
                  blurRadius={2}
                />
                <View style={styles.imageOverlay} />
              </View>

              {/* Match Details */}
              <View style={styles.matchDetails}>
                <View>
                  <View style={styles.matchHeader}>
                    <Text style={styles.courtName}>{match.courtName}</Text>
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

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.courtAddress}>{match.courtAddress}</Text>
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
                    <View style={styles.dateTimeContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.dateText}>{formatDate(match.date)}</Text>
                      <Text style={styles.timeText}>{match.time}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bottomRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${match.pricePerPlayer}</Text>
                    <Text style={styles.spotsText}>
                      {match.totalPlayers - match.joinedPlayers} spots left
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spacer: {
    height: 60,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 60,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  matchesList: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    minHeight: 150,
  },
  courtPreview: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: colors.surfaceLight,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  courtImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  typeBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeCompetitive: {
    backgroundColor: colors.badgeCompetitive,
  },
  typeBadgeCasual: {
    backgroundColor: colors.badgeCasual,
  },
  typeBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  matchDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    paddingRight: 28,
    paddingLeft: 20,
    zIndex: 2,
    gap: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  timeText: {
    fontSize: 13,
    color: colors.white,
  },
  courtName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courtAddress: {
    fontSize: 12,
    color: colors.white,
  },
  matchInfo: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.white,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.success,
    marginBottom: 2,
    letterSpacing: -0.4,
  },
  spotsText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
