import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { scoringService } from '../services/supabase';

// Padel scoring system (tennis-style)
const PADEL_SCORING = {
  POINTS: ['0', '15', '30', '40', 'AD'],
  GAMES_TO_WIN_SET: 6,
  SETS_TO_WIN_MATCH: 2,
  WIN_BY: 2, // Must win by 2 games
};

export default function PadelScoring({ matchId, teams, onScoreUpdate }) {
  const { colors } = useTheme();
  const [currentGame, setCurrentGame] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    if (matchId) {
      loadLiveScore();
      subscribeToLiveScore();
    }
  }, [matchId]);

  const loadLiveScore = async () => {
    try {
      setLoading(true);
      const liveScore = await scoringService.getLiveScore(matchId);
      setGames(liveScore);
      
      // Find current active game
      const activeGame = liveScore.find(game => game.status === 'active');
      setCurrentGame(activeGame);
    } catch (error) {
      console.error('Error loading live score:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLiveScore = () => {
    return scoringService.subscribeLiveScore(matchId, (payload) => {
      console.log('Live score update:', payload);
      loadLiveScore(); // Reload on any change
    });
  };

  const recordPoint = async (teamId) => {
    if (!currentGame || scoring) return;

    try {
      setScoring(true);
      await scoringService.recordPoint(
        currentGame.id,
        matchId,
        teamId,
        null, // playerId - could be added later
        'point'
      );
      
      if (onScoreUpdate) {
        onScoreUpdate();
      }
    } catch (error) {
      console.error('Error recording point:', error);
      Alert.alert('Error', 'Failed to record point');
    } finally {
      setScoring(false);
    }
  };

  const getScoreDisplay = (score) => {
    if (score >= PADEL_SCORING.POINTS.length) {
      return 'AD';
    }
    return PADEL_SCORING.POINTS[score];
  };

  const getSetScore = () => {
    const teamASets = games.filter(g => g.winner_team_id === teams.teamA.id).length;
    const teamBSets = games.filter(g => g.winner_team_id === teams.teamB.id).length;
    return `${teamASets}-${teamBSets}`;
  };

  const getMatchWinner = () => {
    const teamASets = games.filter(g => g.winner_team_id === teams.teamA.id).length;
    const teamBSets = games.filter(g => g.winner_team_id === teams.teamB.id).length;
    
    if (teamASets >= PADEL_SCORING.SETS_TO_WIN_MATCH) return teams.teamA;
    if (teamBSets >= PADEL_SCORING.SETS_TO_WIN_MATCH) return teams.teamB;
    return null;
  };

  const startNewGame = async () => {
    try {
      setLoading(true);
      const gameNumber = games.length + 1;
      await scoringService.startGame(matchId, gameNumber, teams.teamA.id, teams.teamB.id);
    } catch (error) {
      console.error('Error starting new game:', error);
      Alert.alert('Error', 'Failed to start new game');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  if (loading && !currentGame) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading match...</Text>
      </View>
    );
  }

  const matchWinner = getMatchWinner();
  const setScore = getSetScore();

  return (
    <View style={styles.container}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>Padel Match</Text>
        <Text style={styles.setScore}>Sets: {setScore}</Text>
      </View>

      {/* Teams Display */}
      <View style={styles.teamsContainer}>
        <View style={[styles.teamCard, { backgroundColor: teams.teamA.color + '20' }]}>
          <Text style={styles.teamName}>{teams.teamA.name}</Text>
          <Text style={styles.teamPlayers}>
            {teams.teamA.players.map(p => p.name).join(' & ')}
          </Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={[styles.teamCard, { backgroundColor: teams.teamB.color + '20' }]}>
          <Text style={styles.teamName}>{teams.teamB.name}</Text>
          <Text style={styles.teamPlayers}>
            {teams.teamB.players.map(p => p.name).join(' & ')}
          </Text>
        </View>
      </View>

      {/* Current Game Score */}
      {currentGame && !matchWinner && (
        <View style={styles.gameScoreContainer}>
          <Text style={styles.gameScoreTitle}>Current Game</Text>
          <View style={styles.scoreDisplay}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                {getScoreDisplay(currentGame.team_a_score)}
              </Text>
            </View>
            <Text style={styles.scoreSeparator}>-</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                {getScoreDisplay(currentGame.team_b_score)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Match Winner */}
      {matchWinner && (
        <View style={styles.winnerContainer}>
          <Ionicons name="trophy" size={48} color={colors.warning} />
          <Text style={styles.winnerText}>{matchWinner.name} Wins!</Text>
          <Text style={styles.finalScore}>Final Score: {setScore}</Text>
        </View>
      )}

      {/* Scoring Buttons */}
      {currentGame && !matchWinner && (
        <View style={styles.scoringButtons}>
          <TouchableOpacity
            style={[styles.scoreButton, { backgroundColor: teams.teamA.color }]}
            onPress={() => recordPoint(teams.teamA.id)}
            disabled={scoring}
          >
            <Text style={styles.scoreButtonText}>
              {teams.teamA.name} Point
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.scoreButton, { backgroundColor: teams.teamB.color }]}
            onPress={() => recordPoint(teams.teamB.id)}
            disabled={scoring}
          >
            <Text style={styles.scoreButtonText}>
              {teams.teamB.name} Point
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Start New Game Button */}
      {!currentGame && !matchWinner && (
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={startNewGame}
          disabled={loading}
        >
          <Ionicons name="play" size={24} color={colors.white} />
          <Text style={styles.newGameButtonText}>Start Game</Text>
        </TouchableOpacity>
      )}

      {/* Games History */}
      {games.length > 0 && (
        <View style={styles.gamesHistory}>
          <Text style={styles.gamesHistoryTitle}>Games History</Text>
          {games.map((game, index) => (
            <View key={game.id} style={styles.gameHistoryItem}>
              <Text style={styles.gameNumber}>Game {game.game_number}</Text>
              <Text style={styles.gameScore}>
                {getScoreDisplay(game.team_a_score)} - {getScoreDisplay(game.team_b_score)}
              </Text>
              {game.winner_team_id && (
                <Text style={styles.gameWinner}>
                  Winner: {game.winner_team_id === teams.teamA.id ? teams.teamA.name : teams.teamB.name}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  setScore: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  teamCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  teamPlayers: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  gameScoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gameScoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  scoreBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  winnerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  finalScore: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 8,
  },
  scoringButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  scoreButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  newGameButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  newGameButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  gamesHistory: {
    marginTop: 24,
  },
  gamesHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  gameHistoryItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  gameScore: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  gameWinner: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
