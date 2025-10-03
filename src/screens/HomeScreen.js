import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Upcoming Matches Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {UPCOMING_MATCHES.length > 0 ? (
          UPCOMING_MATCHES.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() =>
                navigation.navigate('MatchDetail', { matchId: match.id })
              }
            >
              <View style={styles.matchCardHeader}>
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
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.dateText}>{formatDate(match.date)}</Text>
                  <Text style={styles.timeText}>{match.time}</Text>
                </View>
              </View>

              <Text style={styles.courtName}>{match.courtName}</Text>
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
                 <View style={styles.infoRow}>
                   <Text style={styles.price}>${match.pricePerPlayer}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
           <View style={styles.emptyState}>
             <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
             <Text style={styles.emptyStateText}>No upcoming matches</Text>
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
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {PAST_MATCHES.map((match) => (
          <TouchableOpacity key={match.id} style={styles.pastMatchCard}>
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
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
         <TouchableOpacity
           style={styles.actionButton}
           onPress={() => navigation.navigate('Matches')}
         >
           <Ionicons name="search" size={24} color={colors.white} />
           <Text style={styles.actionButtonText}>Find Matches</Text>
         </TouchableOpacity>
         <TouchableOpacity
           style={[styles.actionButton, styles.actionButtonSecondary]}
           onPress={() => navigation.navigate('Create')}
         >
           <Ionicons name="add-circle" size={24} color={colors.primary} />
           <Text style={styles.actionButtonTextSecondary}>Create Match</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    color: colors.text,
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
    marginBottom: 12,
  },
  matchInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pastMatchCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 4,
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
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
