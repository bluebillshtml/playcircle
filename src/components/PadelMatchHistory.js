import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { matchService } from '../services/supabase';

export default function PadelMatchHistory({ userId, onMatchSelect }) {
  const { colors } = useTheme();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'wins', 'losses'

  useEffect(() => {
    if (userId) {
      loadMatchHistory();
    }
  }, [userId, filter]);

  const loadMatchHistory = async () => {
    try {
      setLoading(true);
      const userMatches = await matchService.getUserMatches(userId);
      
      // Filter completed matches
      const completedMatches = userMatches
        .filter(um => um.match?.status === 'completed')
        .map(um => ({
          id: um.match.id,
          courtName: um.match.court?.name || 'Unknown Court',
          date: um.match.match_date,
          time: um.match.match_time,
          duration: um.match.duration_minutes,
          type: um.match.match_type,
          skillLevel: um.match.skill_level,
          result: calculateMatchResult(um),
          score: calculateMatchScore(um),
          partner: getPartnerName(um),
          opponent: getOpponentName(um),
          isHost: um.is_host,
        }));

      // Apply filter
      let filteredMatches = completedMatches;
      if (filter === 'wins') {
        filteredMatches = completedMatches.filter(m => m.result === 'Win');
      } else if (filter === 'losses') {
        filteredMatches = completedMatches.filter(m => m.result === 'Loss');
      }

      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error loading match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchResult = (userMatch) => {
    // This would typically come from match results in the database
    // For now, we'll use mock data
    const results = ['Win', 'Loss'];
    return results[Math.floor(Math.random() * results.length)];
  };

  const calculateMatchScore = (userMatch) => {
    // This would typically come from match games in the database
    // For now, we'll use mock data
    const scores = ['6-4, 6-3', '6-2, 6-4', '4-6, 6-4, 6-2', '6-1, 6-1', '6-3, 6-3'];
    return scores[Math.floor(Math.random() * scores.length)];
  };

  const getPartnerName = (userMatch) => {
    // This would typically come from team data
    // For now, we'll use mock data
    const partners = ['Sarah Smith', 'Mike Johnson', 'Emily Davis', 'Alex Brown', 'Lisa Wilson'];
    return partners[Math.floor(Math.random() * partners.length)];
  };

  const getOpponentName = (userMatch) => {
    // This would typically come from opponent team data
    // For now, we'll use mock data
    const opponents = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];
    return opponents[Math.floor(Math.random() * opponents.length)];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getResultColor = (result) => {
    return result === 'Win' ? colors.success : colors.error;
  };

  const getResultIcon = (result) => {
    return result === 'Win' ? 'trophy' : 'close-circle';
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading match history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({matches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'wins' && styles.activeFilter]}
          onPress={() => setFilter('wins')}
        >
          <Text style={[styles.filterText, filter === 'wins' && styles.activeFilterText]}>
            Wins ({matches.filter(m => m.result === 'Win').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'losses' && styles.activeFilter]}
          onPress={() => setFilter('losses')}
        >
          <Text style={[styles.filterText, filter === 'losses' && styles.activeFilterText]}>
            Losses ({matches.filter(m => m.result === 'Loss').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Match List */}
      <ScrollView style={styles.matchesList} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="tennisball" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'You haven\'t played any matches yet'
                : `No ${filter} found in your match history`
              }
            </Text>
          </View>
        ) : (
          matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => onMatchSelect && onMatchSelect(match)}
            >
              <View style={styles.matchHeader}>
                <View style={styles.matchInfo}>
                  <Text style={styles.courtName}>{match.courtName}</Text>
                  <Text style={styles.matchDate}>
                    {formatDate(match.date)} • {formatTime(match.time)}
                  </Text>
                </View>
                <View style={[
                  styles.resultBadge,
                  { backgroundColor: getResultColor(match.result) + '20' }
                ]}>
                  <Ionicons
                    name={getResultIcon(match.result)}
                    size={16}
                    color={getResultColor(match.result)}
                  />
                  <Text style={[
                    styles.resultText,
                    { color: getResultColor(match.result) }
                  ]}>
                    {match.result}
                  </Text>
                </View>
              </View>

              <View style={styles.matchDetails}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{match.score}</Text>
                </View>
                
                <View style={styles.matchMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>with {match.partner}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>vs {match.opponent}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{match.duration} min</Text>
                  </View>
                </View>

                <View style={styles.matchTypeContainer}>
                  <Text style={styles.matchType}>{match.type}</Text>
                  <Text style={styles.skillLevel}>{match.skillLevel}</Text>
                  {match.isHost && (
                    <Text style={styles.hostBadge}>Host</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '600',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchDetails: {
    gap: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchType: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillLevel: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hostBadge: {
    fontSize: 12,
    color: colors.warning,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
