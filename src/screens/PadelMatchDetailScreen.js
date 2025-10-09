import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Linking,
  ActionSheetIOS,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { matchService, teamService, scoringService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';
import TeamBracketOverlay from '../components/TeamBracketOverlay';
import BracketButton from '../components/BracketButton';
import PadelScoring from '../components/PadelScoring';
import PadelStats from '../components/PadelStats';
import AnimatedBackground from '../components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function PadelMatchDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { selectedSport } = useSport();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bracketVisible, setBracketVisible] = useState(false);
  const [scoringVisible, setScoringVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'scoring', 'stats'

  const matchId = route.params?.matchId;

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
        setMatch(matchData);

        // Load teams if match has teams
        if (matchData.teams && Array.isArray(matchData.teams) && matchData.teams.length > 0) {
          const teamsData = {
            teamA: matchData.teams.find(t => t.team_position === 'A'),
            teamB: matchData.teams.find(t => t.team_position === 'B'),
          };
          setTeams(teamsData);
        } else {
          // If no teams exist, try to load them separately
          try {
            const teamsData = await teamService.getMatchTeams(matchId);
            if (teamsData && teamsData.length > 0) {
              const teams = {
                teamA: teamsData.find(t => t.team_position === 'A'),
                teamB: teamsData.find(t => t.team_position === 'B'),
              };
              setTeams(teams);
            }
          } catch (teamsError) {
            console.log('No teams found for match:', teamsError);
          }
        }
      } catch (dbError) {
        // If match not found in database, create mock data as fallback
        console.log('Match not in database, using mock data for matchId:', matchId);

        const mockMatch = {
          id: matchId,
          match_date: '2025-10-05',
          match_time: '18:00',
          duration_minutes: 90,
          match_type: 'competitive',
          skill_level: 'Intermediate',
          max_players: 4,
          current_players: 2,
          price_per_player: '10.00',
          total_cost: '40.00',
          status: 'open',
          description: 'Great match for intermediate players!',
          court: {
            name: 'Miami Padel Club',
            address: '123 Ocean Drive, Miami, FL',
            city: 'Miami',
            surface_type: 'Artificial Grass',
            is_indoor: true,
            rating: 4.8,
            phone: '+1 (305) 123-4567',
            latitude: 25.7617,
            longitude: -80.1918,
            image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
          },
          match_players: [
            {
              id: 1,
              user_id: 1,
              is_host: true,
              joined_at: new Date().toISOString(),
              user: {
                full_name: 'John Doe',
                username: 'johndoe',
              },
            },
            {
              id: 2,
              user_id: 2,
              is_host: false,
              joined_at: new Date().toISOString(),
              user: {
                full_name: 'Jane Smith',
                username: 'janesmith',
              },
            },
          ],
          teams: [
            {
              id: 1,
              team_name: 'Team A',
              team_position: 'A',
              team_color: '#FF6B6B',
              team_players: [
                {
                  id: 1,
                  user_id: 1,
                  user: {
                    id: 1,
                    full_name: 'John Doe',
                    username: 'johndoe',
                  },
                },
              ],
            },
            {
              id: 2,
              team_name: 'Team B',
              team_position: 'B',
              team_color: '#4ECDC4',
              team_players: [
                {
                  id: 2,
                  user_id: 2,
                  user: {
                    id: 2,
                    full_name: 'Jane Smith',
                    username: 'janesmith',
                  },
                },
              ],
            },
          ],
        };

        setMatch(mockMatch);

        // Set teams data for mock match
        if (mockMatch.teams && Array.isArray(mockMatch.teams) && mockMatch.teams.length > 0) {
          const teamsData = {
            teamA: mockMatch.teams.find(t => t.team_position === 'A'),
            teamB: mockMatch.teams.find(t => t.team_position === 'B'),
          };
          setTeams(teamsData);
        }
      }
    } catch (error) {
      console.error('Error loading match details:', error);
      Alert.alert('Error', 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to join matches');
      return;
    }

    try {
      await matchService.joinMatch(matchId, user.id);
      Alert.alert('Success', 'You have joined the match!');
      loadMatchDetails(); // Reload to update player count
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert('Error', error.message || 'Failed to join match');
    }
  };

  const handleLeaveMatch = async () => {
    try {
      await matchService.leaveMatch(matchId, user.id);
      Alert.alert('Success', 'You have left the match');
      loadMatchDetails();
    } catch (error) {
      console.error('Error leaving match:', error);
      Alert.alert('Error', 'Failed to leave match');
    }
  };

  const startMatch = async () => {
    if (!teams || !teams.teamA || !teams.teamB) {
      Alert.alert('Teams Required', 'Please set up teams before starting the match');
      return;
    }

    try {
      await scoringService.startMatch(matchId, teams.teamA.id, teams.teamB.id);
      setScoringVisible(true);
      setActiveTab('scoring');
      Alert.alert('Match Started', 'The match has begun! Good luck!');
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  const isUserInMatch = () => {
    if (!user || !match) return false;
    return match.match_players?.some(mp => mp.user_id === user.id);
  };

  const isUserHost = () => {
    if (!user || !match) return false;
    return match.host_id === user.id;
  };

  const canStartMatch = () => {
    return isUserHost() && 
           match?.current_players === match?.max_players && 
           teams?.teamA && 
           teams?.teamB &&
           match?.status === 'open';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
    return new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const openDirections = () => {
    if (!match?.court?.latitude || !match?.court?.longitude) {
      Alert.alert('Error', 'Court location not available');
      return;
    }

    const { latitude, longitude } = match.court;
    const address = encodeURIComponent(match.court.address || '');

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
    if (match?.court?.phone) {
      Linking.openURL(`tel:${match.court.phone}`);
    } else {
      Alert.alert('Error', 'Court phone number not available');
    }
  };

  const shareMatch = async () => {
    try {
      const result = await Share.share({
        message: `Check out this ${match.match_type} padel match at ${match.court?.name || 'Unknown Court'}! 🎾\n\nDate: ${formatDate(match.match_date)}\nTime: ${formatTime(match.match_time)}\nSkill Level: ${match.skill_level}\nPrice: $${match.price_per_player} per player\n\nJoin me on PlayCircle!`,
        title: 'Join my Padel Match!',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Match shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share match');
      console.error('Error sharing match:', error);
    }
  };

  const saveMatch = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to save matches');
      return;
    }

    try {
      // Check if user is already in this match
      const isAlreadyJoined = match.match_players?.some(
        player => player.user_id === user.id
      );

      if (isAlreadyJoined) {
        Alert.alert('Already Joined', 'You are already part of this match!');
        return;
      }

      // Join the match (which saves it to upcoming matches)
      await matchService.joinMatch(match.id, user.id);

      Alert.alert(
        'Success!',
        'Match saved to your upcoming matches',
        [
          {
            text: 'View My Matches',
            onPress: () => navigation.navigate('Matches')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );

      // Reload match details to update player list
      loadMatchDetails();
    } catch (error) {
      console.error('Error saving match:', error);
      Alert.alert('Error', error.message || 'Failed to save match');
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          <View style={styles.spacer} />
          <View style={styles.header}>
            <NavigationButton navigation={navigation} currentScreen="MatchDetail" />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading match details...</Text>
          </View>
        </View>
      </AnimatedBackground>
    );
  }

  if (!match) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          <View style={styles.spacer} />
          <View style={styles.header}>
            <NavigationButton navigation={navigation} currentScreen="MatchDetail" />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorText}>Match not found</Text>
          </View>
        </View>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <View style={styles.headerSpacer} />
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Glassmorphic Court Preview Section */}
          <View style={styles.courtPreviewSection}>
            <ImageBackground
              source={{
                uri: match.court?.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800'
              }}
              style={styles.courtImage}
              imageStyle={styles.courtImageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                style={styles.imageOverlay}
              >
                <View
                  style={[
                    styles.typeBadge,
                    match.match_type === 'competitive'
                      ? styles.typeBadgeCompetitive
                      : styles.typeBadgeCasual,
                  ]}
                >
                  <BlurView intensity={20} tint="dark" style={styles.typeBadgeBlur}>
                    <Text style={styles.typeBadgeText}>
                      {match.match_type === 'competitive' ? 'COMPETITIVE' : 'CASUAL'}
                    </Text>
                  </BlurView>
                </View>
              </LinearGradient>
            </ImageBackground>

            <BlurView intensity={colors.isDarkMode ? 40 : 60} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.courtInfoCard}>
              <View style={styles.courtInfoHeader}>
                <View style={styles.courtInfoLeft}>
                  <Text style={styles.courtNameLarge}>{match.court?.name || 'Unknown Court'}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color={colors.warning} />
                    <Text style={styles.ratingText}>{match.court?.rating || 4.5}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.courtAddress}>
                  {match.court?.address || 'Address not available'}
                </Text>
              </View>
              <View style={styles.courtQuickInfo}>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                  <Text style={styles.quickInfoText}>{formatDate(match.match_date)}</Text>
                </View>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="time" size={14} color={colors.textSecondary} />
                  <Text style={styles.quickInfoText}>
                    {formatTime(match.match_time)} • {match.duration_minutes} min
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Glassmorphic Action Buttons */}
          <View style={styles.actionButtonsSection}>
            <TouchableOpacity style={styles.primaryActionButton} onPress={openDirections} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.primary, colors.primary + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryActionGradient}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.primaryActionButtonText}>Get Directions</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity style={styles.secondaryActionButton} onPress={callCourt} activeOpacity={0.7}>
                <BlurView intensity={colors.isDarkMode ? 30 : 40} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.secondaryActionBlur}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>Call</Text>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryActionButton} onPress={shareMatch} activeOpacity={0.7}>
                <BlurView intensity={colors.isDarkMode ? 30 : 40} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.secondaryActionBlur}>
                  <Ionicons name="share-social" size={20} color={colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>Share</Text>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryActionButton} onPress={saveMatch} activeOpacity={0.7}>
                <BlurView intensity={colors.isDarkMode ? 30 : 40} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.secondaryActionBlur}>
                  <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>Save</Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'details' && styles.activeTab]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'scoring' && styles.activeTab]}
              onPress={() => setActiveTab('scoring')}
            >
              <Text style={[styles.tabText, activeTab === 'scoring' && styles.activeTabText]}>
                Scoring
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                Stats
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <View style={styles.detailsTab}>
              {/* Overview Section */}
              <BlurView intensity={colors.isDarkMode ? 35 : 50} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                
                <View style={styles.overviewCard}>
                  <View style={styles.overviewRow}>
                    <View style={styles.overviewItem}>
                      <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                      <Text style={styles.overviewLabel}>
                        {match.match_date && new Date(match.match_date).toDateString() === new Date().toDateString() 
                          ? 'Today' 
                          : match.match_date 
                            ? new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Date TBD'}
                      </Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Ionicons name="cash-outline" size={24} color={colors.primary} />
                      <Text style={styles.overviewLabel}>
                        ${match.price_per_player ? parseFloat(match.price_per_player).toFixed(2) : '0.00'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.overviewRow}>
                    <View style={styles.overviewItem}>
                      <Ionicons name="time-outline" size={24} color={colors.primary} />
                      <Text style={styles.overviewLabel}>
                        {match.match_time && match.duration_minutes 
                          ? `${formatTime(match.match_time)} - ${calculateEndTime(match.match_time, match.duration_minutes)}` 
                          : 'Time TBD'}
                      </Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Ionicons name="people-outline" size={24} color={colors.primary} />
                      <Text style={styles.overviewLabel}>
                        {match.current_players || 0}-{match.max_players || 0} Players
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Spots Available */}
                <View style={styles.spotsSection}>
                  <View style={styles.spotsHeader}>
                    <Text style={styles.spotsLabel}>Spots Available</Text>
                    <Text style={styles.spotsCount}>
                      {match.current_players || 0} of {match.max_players || 0}
                    </Text>
                  </View>
                  
                  {(match.max_players && match.current_players && match.max_players - match.current_players > 0) && (
                    <View style={styles.spotsToGoBadge}>
                      <Text style={styles.spotsToGoText}>
                        {match.max_players - match.current_players} more to go!
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={[colors.primary, colors.primary + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { 
                          width: `${match.current_players && match.max_players 
                            ? (match.current_players / match.max_players) * 100 
                            : 0}%` 
                        }]}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Scheduled</Text>
                    <Text style={styles.progressLabel}>Confirmed</Text>
                    <Text style={styles.progressLabel}>Game Full</Text>
                  </View>
                </View>
              </BlurView>

              {/* About This Event */}
              <BlurView intensity={colors.isDarkMode ? 35 : 50} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.section}>
                <Text style={styles.sectionTitle}>ABOUT THIS EVENT</Text>
                <Text style={styles.aboutEventTitle}>{match.court?.name || 'Unknown Court'}</Text>
                
                {match.description && (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.eventDescription}>{match.description}</Text>
                  </>
                )}
                
                <View style={styles.sectionDivider} />
                
                <Text style={styles.facilityRulesTitle}>Court Amenities:</Text>
                <View style={styles.amenitiesGrid}>
                  {match.court?.has_parking && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="car" size={18} color={colors.primary} />
                      <Text style={styles.amenityText}>Parking</Text>
                    </View>
                  )}
                  {match.court?.has_lockers && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="lock-closed" size={18} color={colors.primary} />
                      <Text style={styles.amenityText}>Lockers</Text>
                    </View>
                  )}
                  {match.court?.has_showers && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="water" size={18} color={colors.primary} />
                      <Text style={styles.amenityText}>Showers</Text>
                    </View>
                  )}
                  {match.court?.has_pro_shop && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="storefront" size={18} color={colors.primary} />
                      <Text style={styles.amenityText}>Pro Shop</Text>
                    </View>
                  )}
                  <View style={styles.amenityItem}>
                    <Ionicons name="layers" size={18} color={colors.primary} />
                    <Text style={styles.amenityText}>{match.court?.surface_type || 'Artificial Grass'}</Text>
                  </View>
                  <View style={styles.amenityItem}>
                    <Ionicons name={match.court?.is_indoor ? "home" : "sunny"} size={18} color={colors.primary} />
                    <Text style={styles.amenityText}>{match.court?.is_indoor ? 'Indoor Court' : 'Outdoor Court'}</Text>
                  </View>
                </View>
                
                <View style={styles.sectionDivider} />
                
                <Text style={styles.facilityRulesTitle}>Facility rules:</Text>
                <View style={styles.facilityRuleItem}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>ID</Text>
                  </View>
                  <Text style={styles.facilityRuleText}>ID required to check out game ball and equipment</Text>
                </View>
                <View style={styles.facilityRuleItem}>
                  <View style={styles.ruleBadge}>
                    <Ionicons name="shirt" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.facilityRuleText}>Proper athletic attire and non-marking shoes required</Text>
                </View>
                <View style={styles.facilityRuleItem}>
                  <View style={styles.ruleBadge}>
                    <Ionicons name="time" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.facilityRuleText}>Please arrive 10 minutes before start time</Text>
                </View>
              </BlurView>

              {/* What to Expect */}
              <View style={styles.whatToExpectContainer}>
                <Text style={styles.whatToExpectTitle}>What to expect</Text>
                
                <View style={styles.expectCardsRow}>
                  <BlurView intensity={colors.isDarkMode ? 35 : 50} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.expectCard}>
                    <Text style={styles.expectCardTitle}>GAME TYPE</Text>
                    <Text style={styles.expectCardValue}>• {match.match_type === 'competitive' ? 'Co-ed' : 'Casual'}</Text>
                    <Text style={styles.expectCardValue}>• Min 4v4 - Max 5v5</Text>
                  </BlurView>
                  
                  <BlurView intensity={colors.isDarkMode ? 35 : 50} tint={colors.isDarkMode ? 'dark' : 'light'} style={styles.expectCard}>
                    <Text style={styles.expectCardTitle}>GAME SKILL LEVEL</Text>
                    <View style={styles.skillLevelBadge}>
                      <Text style={styles.skillLevelText}>{match.skill_level || 'Intermediate'}</Text>
                    </View>
                  </BlurView>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'scoring' && (
            <View style={styles.scoringTab}>
              {teams ? (
                <PadelScoring
                  matchId={matchId}
                  teams={teams}
                  onScoreUpdate={loadMatchDetails}
                />
              ) : (
                <View style={styles.noTeamsContainer}>
                  <Ionicons name="people" size={48} color={colors.textSecondary} />
                  <Text style={styles.noTeamsText}>Teams not set up yet</Text>
                  <Text style={styles.noTeamsSubtext}>
                    The host needs to organize teams before scoring can begin
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'stats' && (
            <View style={styles.statsTab}>
              {teams ? (
                <PadelStats
                  matchId={matchId}
                  teams={teams}
                />
              ) : (
                <View style={styles.noTeamsContainer}>
                  <Ionicons name="people" size={48} color={colors.textSecondary} />
                  <Text style={styles.noTeamsText}>Teams not set up yet</Text>
                  <Text style={styles.noTeamsSubtext}>
                    Statistics will be available once teams are organized
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isUserInMatch() ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveMatch}
              >
                <Ionicons name="exit" size={20} color={colors.error} />
                <Text style={styles.leaveButtonText}>Leave Match</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinMatch}
                disabled={match.current_players >= match.max_players}
              >
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.joinButtonText}>
                  Join Match
                </Text>
              </TouchableOpacity>
            )}

            {canStartMatch() && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startMatch}
              >
                <Ionicons name="play" size={20} color={colors.white} />
                <Text style={styles.startButtonText}>Start Match</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Team Bracket Modal */}
        <TeamBracketOverlay
          visible={bracketVisible}
          onClose={() => setBracketVisible(false)}
          matchData={match}
          onConfirm={() => {
            setBracketVisible(false);
            loadMatchDetails();
          }}
        />
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 2,
    height: 25,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
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
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
  courtNameLarge: {
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginTop: 12,
  },
  courtName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  matchDate: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  matchDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  matchType: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillLevel: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  detailsTab: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  overviewCard: {
    backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
    padding: 20,
    gap: 20,
    marginBottom: 24,
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
  spotsSection: {
    marginTop: 8,
  },
  spotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
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
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 24,
    backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  aboutEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
  },
  facilityRulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: '45%',
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  facilityRuleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ruleBadge: {
    backgroundColor: '#9333EA',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityRuleText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  whatToExpectContainer: {
    marginBottom: 16,
  },
  whatToExpectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 0,
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
    borderColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  expectCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  expectCardValue: {
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
  scoringTab: {
    paddingHorizontal: 20,
  },
  noTeamsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noTeamsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  noTeamsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statsTab: {
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    flex: 1,
    backgroundColor: colors.error + '20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  leaveButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
