import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function TeamBracketOverlay({ visible, onClose, matchData, onConfirm }) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [teams, setTeams] = useState({
    teamA: {
      id: null,
      name: 'Team A',
      players: [],
      color: '#FF6B6B',
    },
    teamB: {
      id: null,
      name: 'Team B',
      players: [],
      color: '#4ECDC4',
    },
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (user && profile) {
      setCurrentUser({
        id: user.id,
        name: profile.full_name || profile.username || 'You',
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (visible && matchData?.id) {
      loadTeams();
    }
  }, [visible, matchData]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamService.getMatchTeams(matchData.id);

      const teamA = teamsData.find(t => t.team_position === 'A');
      const teamB = teamsData.find(t => t.team_position === 'B');

      setTeams({
        teamA: {
          id: teamA?.id,
          name: teamA?.team_name || 'Team A',
          color: teamA?.team_color || '#FF6B6B',
          players: teamA?.team_players?.map(tp => ({
            id: tp.user_id,
            name: tp.user?.full_name || tp.user?.username || 'Player',
          })) || [],
        },
        teamB: {
          id: teamB?.id,
          name: teamB?.team_name || 'Team B',
          color: teamB?.team_color || '#4ECDC4',
          players: teamB?.team_players?.map(tp => ({
            id: tp.user_id,
            name: tp.user?.full_name || tp.user?.username || 'Player',
          })) || [],
        },
      });
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
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
        Animated.spring(slideAnim, {
          toValue: 0,
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
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const joinTeam = async (teamKey) => {
    if (!currentUser || !matchData?.id) {
      Alert.alert('Error', 'You must be logged in to join a team');
      return;
    }

    try {
      const teamPosition = teamKey === 'teamA' ? 'A' : 'B';
      await teamService.joinTeam(matchData.id, currentUser.id, teamPosition);

      // Reload teams
      await loadTeams();
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', error.message || 'Failed to join team');
    }
  };

  const leaveTeam = async () => {
    if (!currentUser) return;

    try {
      const userTeam = teams.teamA.players.find(p => p.id === currentUser.id)
        ? teams.teamA
        : teams.teamB.players.find(p => p.id === currentUser.id)
        ? teams.teamB
        : null;

      if (userTeam?.id) {
        await teamService.leaveTeam(userTeam.id, currentUser.id);
        await loadTeams();
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      Alert.alert('Error', 'Failed to leave team');
    }
  };

  const isUserInTeam = (teamKey) => {
    return teams[teamKey].players.some(p => p.id === currentUser?.id);
  };

  const isTeamFull = (teamKey) => {
    return teams[teamKey].players.length >= 2;
  };

  const renderTeamSlot = (team, teamKey, slotIndex) => {
    const player = team.players[slotIndex];
    const isCurrentUser = player?.id === currentUser?.id;

    return (
      <View key={slotIndex} style={styles.playerSlot}>
        {player ? (
          <View style={[styles.playerCard, { borderColor: team.color }]}>
            <View style={[styles.playerAvatar, { backgroundColor: team.color }]}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
            {isCurrentUser && (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={leaveTeam}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.emptySlot,
              { borderColor: team.color + '40' },
              isUserInTeam(teamKey === 'teamA' ? 'teamB' : 'teamA') && styles.emptySlotDisabled,
            ]}
            onPress={() => {
              if (!isUserInTeam(teamKey === 'teamA' ? 'teamB' : 'teamA')) {
                joinTeam(teamKey);
              }
            }}
            disabled={isUserInTeam(teamKey === 'teamA' ? 'teamB' : 'teamA')}
          >
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={team.color + '60'}
            />
            <Text style={[styles.emptySlotText, { color: team.color }]}>
              Join Team
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="trophy" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Team Bracket</Text>
                  <Text style={styles.headerSubtitle}>2v2 Match Setup</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Bracket Container */}
              <View style={styles.bracketContainer}>
                {/* Team A */}
                <View style={styles.teamSection}>
                  <View style={styles.teamHeader}>
                    <View style={[styles.teamColorBar, { backgroundColor: teams.teamA.color }]} />
                    <Text style={[styles.teamName, { color: teams.teamA.color }]}>
                      {teams.teamA.name}
                    </Text>
                    <Text style={styles.teamCount}>
                      {teams.teamA.players.length}/2
                    </Text>
                  </View>
                  <View style={styles.teamPlayers}>
                    {renderTeamSlot(teams.teamA, 'teamA', 0)}
                    {renderTeamSlot(teams.teamA, 'teamA', 1)}
                  </View>
                </View>

                {/* VS Divider */}
                <View style={styles.vsDivider}>
                  <LinearGradient
                    colors={[teams.teamA.color, teams.teamB.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.vsGradientLine}
                  />
                  <View style={styles.vsCircle}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>
                  <LinearGradient
                    colors={[teams.teamA.color, teams.teamB.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.vsGradientLine}
                  />
                </View>

                {/* Team B */}
                <View style={styles.teamSection}>
                  <View style={styles.teamHeader}>
                    <View style={[styles.teamColorBar, { backgroundColor: teams.teamB.color }]} />
                    <Text style={[styles.teamName, { color: teams.teamB.color }]}>
                      {teams.teamB.name}
                    </Text>
                    <Text style={styles.teamCount}>
                      {teams.teamB.players.length}/2
                    </Text>
                  </View>
                  <View style={styles.teamPlayers}>
                    {renderTeamSlot(teams.teamB, 'teamB', 0)}
                    {renderTeamSlot(teams.teamB, 'teamB', 1)}
                  </View>
                </View>
              </View>

              {/* Match Info */}
              {matchData && (
                <View style={styles.matchInfo}>
                  <View style={styles.matchInfoRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.matchInfoText}>{matchData.courtName}</Text>
                  </View>
                  <View style={styles.matchInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.matchInfoText}>
                      {matchData.date} at {matchData.time}
                    </Text>
                  </View>
                  <View style={styles.matchInfoRow}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.matchInfoText}>{matchData.duration} minutes</Text>
                  </View>
                </View>
              )}

              {/* Instructions */}
              <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>How it works:</Text>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionDot} />
                  <Text style={styles.instructionText}>
                    Tap "Join Team" to select your team
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionDot} />
                  <Text style={styles.instructionText}>
                    Each team can have up to 2 players
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionDot} />
                  <Text style={styles.instructionText}>
                    Tap the X to leave your team
                  </Text>
                </View>
              </View>
            </ScrollView>
            )}

            {/* Action Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (teams.teamA.players.length === 0 && teams.teamB.players.length === 0) &&
                    styles.confirmButtonDisabled,
                ]}
                disabled={teams.teamA.players.length === 0 && teams.teamB.players.length === 0}
                onPress={() => {
                  if (onConfirm) {
                    onConfirm(teams);
                  }
                  onClose();
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm Spot</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  blurContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    marginTop: 80,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  bracketContainer: {
    gap: 20,
  },
  teamSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  teamColorBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  teamCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamPlayers: {
    gap: 12,
  },
  playerSlot: {
    minHeight: 60,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  leaveButton: {
    padding: 4,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptySlotDisabled: {
    opacity: 0.4,
  },
  emptySlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  vsGradientLine: {
    flex: 1,
    height: 2,
  },
  vsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  matchInfo: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchInfoText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  instructionText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
