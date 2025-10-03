import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
            <View style={styles.matchHeader}>
              <View style={styles.matchTypeContainer}>
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
                <Text style={styles.skillLevel}>{match.skillLevel}</Text>
              </View>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateText}>{formatDate(match.date)}</Text>
                <Text style={styles.timeText}>{match.time}</Text>
              </View>
            </View>

            <Text style={styles.courtName}>{match.courtName}</Text>
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
                  {match.joinedPlayers}/{match.totalPlayers} players
                </Text>
              </View>
            </View>

            <View style={styles.playersProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (match.joinedPlayers / match.totalPlayers) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.spotsText}>
                {match.totalPlayers - match.joinedPlayers} spots left
              </Text>
            </View>

            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.priceLabel}>Your share</Text>
                <Text style={styles.price}>${match.pricePerPlayer}</Text>
              </View>
              <View style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Match</Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  matchesList: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
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
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.badgeCompetitiveText,
  },
  skillLevel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  courtAddress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playersProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  spotsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
