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
import { scoringService } from '../services/supabase';

// Padel-specific statistics
const PADEL_STATS = {
  SERVING: {
    aces: 'Aces',
    doubleFaults: 'Double Faults',
    firstServePercentage: 'First Serve %',
    serviceWinners: 'Service Winners',
  },
  RETURNING: {
    returnWinners: 'Return Winners',
    returnErrors: 'Return Errors',
    breakPointsWon: 'Break Points Won',
  },
  NET_PLAY: {
    volleyWinners: 'Volley Winners',
    volleyErrors: 'Volley Errors',
    overheadWinners: 'Overhead Winners',
    overheadErrors: 'Overhead Errors',
  },
  GENERAL: {
    winners: 'Winners',
    unforcedErrors: 'Unforced Errors',
    forcedErrors: 'Forced Errors',
    totalPoints: 'Total Points',
  },
};

export default function PadelStats({ matchId, teams, playerId = null }) {
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    if (matchId) {
      loadMatchStats();
    }
  }, [matchId]);

  const loadMatchStats = async () => {
    try {
      setLoading(true);
      // This would typically come from a stats service
      // For now, we'll use mock data
      const mockStats = generateMockStats();
      setStats(mockStats);
      
      // Set first player as default if no specific player selected
      if (!selectedPlayer && teams?.teamA?.players?.length > 0) {
        setSelectedPlayer(teams.teamA.players[0].id);
      }
    } catch (error) {
      console.error('Error loading match stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = () => {
    const allPlayers = [
      ...(teams?.teamA?.players || []),
      ...(teams?.teamB?.players || [])
    ];

    const playerStats = {};
    allPlayers.forEach(player => {
      playerStats[player.id] = {
        serving: {
          aces: Math.floor(Math.random() * 5),
          doubleFaults: Math.floor(Math.random() * 3),
          firstServePercentage: 65 + Math.floor(Math.random() * 20),
          serviceWinners: Math.floor(Math.random() * 8),
        },
        returning: {
          returnWinners: Math.floor(Math.random() * 6),
          returnErrors: Math.floor(Math.random() * 4),
          breakPointsWon: Math.floor(Math.random() * 3),
        },
        netPlay: {
          volleyWinners: Math.floor(Math.random() * 10),
          volleyErrors: Math.floor(Math.random() * 5),
          overheadWinners: Math.floor(Math.random() * 4),
          overheadErrors: Math.floor(Math.random() * 2),
        },
        general: {
          winners: Math.floor(Math.random() * 15),
          unforcedErrors: Math.floor(Math.random() * 8),
          forcedErrors: Math.floor(Math.random() * 5),
          totalPoints: Math.floor(Math.random() * 50) + 20,
        },
      };
    });

    return playerStats;
  };

  const getPlayerName = (playerId) => {
    const allPlayers = [
      ...(teams?.teamA?.players || []),
      ...(teams?.teamB?.players || [])
    ];
    const player = allPlayers.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  const getPlayerTeam = (playerId) => {
    if (teams?.teamA?.players?.some(p => p.id === playerId)) {
      return teams.teamA;
    }
    if (teams?.teamB?.players?.some(p => p.id === playerId)) {
      return teams.teamB;
    }
    return null;
  };

  const renderStatCategory = (category, categoryStats) => {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        {Object.entries(categoryStats).map(([key, label]) => (
          <View key={key} style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>
              {stats[selectedPlayer]?.[key] || 0}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!stats || !selectedPlayer) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No statistics available</Text>
      </View>
    );
  }

  const playerTeam = getPlayerTeam(selectedPlayer);
  const allPlayers = [
    ...(teams?.teamA?.players || []),
    ...(teams?.teamB?.players || [])
  ];

  return (
    <View style={styles.container}>
      {/* Player Selector */}
      <View style={styles.playerSelector}>
        <Text style={styles.selectorTitle}>Select Player</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerButton,
                selectedPlayer === player.id && styles.selectedPlayerButton,
                { backgroundColor: getPlayerTeam(player.id)?.color + '20' }
              ]}
              onPress={() => setSelectedPlayer(player.id)}
            >
              <Text style={[
                styles.playerButtonText,
                selectedPlayer === player.id && styles.selectedPlayerButtonText
              ]}>
                {player.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{getPlayerName(selectedPlayer)}</Text>
        <View style={[
          styles.teamBadge,
          { backgroundColor: playerTeam?.color || colors.primary }
        ]}>
          <Text style={styles.teamBadgeText}>{playerTeam?.name || 'Team'}</Text>
        </View>
      </View>

      {/* Statistics */}
      <ScrollView style={styles.statsContainer} showsVerticalScrollIndicator={false}>
        {renderStatCategory('Serving', PADEL_STATS.SERVING)}
        {renderStatCategory('Returning', PADEL_STATS.RETURNING)}
        {renderStatCategory('Net Play', PADEL_STATS.NET_PLAY)}
        {renderStatCategory('General', PADEL_STATS.GENERAL)}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  noDataText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  playerSelector: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  playerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  selectedPlayerButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  playerButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedPlayerButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  teamBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  teamBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
