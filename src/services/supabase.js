import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// =====================================================
// AUTHENTICATION
// =====================================================

export const authService = {
  // Sign up with email
  signUp: async (email, password, userData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          first_name: userData.firstName,
          last_name: userData.lastName,
          skill_level: userData.skillLevel || 'Beginner',
        }
      }
    });

    if (authError) throw authError;

    // Profile will be created automatically by database trigger
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    return authData;
  },

  // Sign in with email
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Resend confirmation email
  resendConfirmation: async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
    return data;
  },
};

// =====================================================
// STORAGE / FILE UPLOADS
// =====================================================

export const storageService = {
  // Upload profile picture
  uploadProfilePicture: async (userId, file) => {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Convert file to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: file.type || `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Delete profile picture
  deleteProfilePicture: async (userId, fileUrl) => {
    try {
      // Extract filename from URL
      const fileName = fileUrl.split('/').slice(-2).join('/');

      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  // Upload match photo
  uploadMatchPhoto: async (userId, matchId, file) => {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${userId}/${matchId}_${Date.now()}.${fileExt}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('match-photos')
        .upload(fileName, blob, {
          contentType: file.type || `image/${fileExt}`,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('match-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading match photo:', error);
      throw error;
    }
  },

  // Get storage usage for user
  getStorageUsage: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_storage_usage')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  },
};

// =====================================================
// PROFILES
// =====================================================

export const profileService = {
  // Get profile by ID
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If no profile found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Create profile
  createProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: `user_${userId.slice(0, 8)}`,
        first_name: 'User',
        last_name: '',
        skill_level: 'Beginner',
        total_matches: 0,
        wins: 0,
        losses: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user stats for a specific sport
  getUserStats: async (userId, sportId = 'padel') => {
    const { data, error } = await supabase
      .from('user_sport_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('sport_id', sportId)
      .single();

    if (error) {
      // If no stats found, return default stats
      if (error.code === 'PGRST116') {
        return {
          user_id: userId,
          sport_id: sportId,
          total_matches: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          total_hours_played: 0,
          current_win_streak: 0,
          longest_win_streak: 0,
          sport_specific_stats: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
    return data;
  },

  // Get user sport profile
  getUserSportProfile: async (userId, sportId = 'padel') => {
    const { data, error } = await supabase
      .from('user_sport_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('sport_id', sportId)
      .single();

    if (error) {
      // If no profile found, return default profile
      if (error.code === 'PGRST116') {
        return {
          user_id: userId,
          sport_id: sportId,
          skill_level: 'Beginner',
          total_matches: 0,
          wins: 0,
          losses: 0,
          points: 0,
          favorite_position: 'Any',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
    return data;
  },
};

// =====================================================
// COURTS
// =====================================================

export const courtService = {
  // Get all courts for a specific sport
  getCourts: async (sportId = 'padel') => {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('sport_id', sportId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all venues
  getVenues: async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get court by ID
  getCourt: async (courtId) => {
    const { data, error } = await supabase
      .from('courts')
      .select(`
        *,
        court_reviews(
          id,
          rating,
          comment,
          created_at,
          user:profiles(username, full_name)
        )
      `)
      .eq('id', courtId)
      .single();

    if (error) throw error;
    return data;
  },

  // Find nearby courts
  findNearbyCourts: async (latitude, longitude, radiusKm = 10) => {
    const { data, error } = await supabase
      .rpc('find_nearby_courts', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
      });

    if (error) throw error;
    return data;
  },

  // Create court review
  createReview: async (courtId, userId, rating, comment) => {
    const { data, error } = await supabase
      .from('court_reviews')
      .insert({
        court_id: courtId,
        user_id: userId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// MATCHES
// =====================================================

export const matchService = {
  // Get upcoming matches for a specific sport
  getUpcomingMatches: async (limit = 20, sportId = 'padel') => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        court:courts(*),
        host:profiles!host_id(
          id,
          username,
          full_name
        )
      `)
      .eq('status', 'open')
      .gte('match_date', today)
      .order('match_date', { ascending: true })
      .order('match_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get match by ID
  getMatch: async (matchId) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        court:courts(*),
        host:profiles!host_id(*),
        match_players(
          id,
          user_id,
          joined_at,
          payment_status,
          is_host,
          user:profiles(id, username, full_name, avatar_url)
        )
      `)
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create match
  createMatch: async (matchData) => {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        court_id: matchData.courtId,
        match_date: matchData.date,
        match_time: matchData.time,
        duration_minutes: matchData.duration,
        match_type: matchData.type,
        skill_level: matchData.skillLevel,
        max_players: matchData.maxPlayers || 4,
        total_cost: matchData.totalCost,
        price_per_player: matchData.pricePerPlayer,
        host_id: matchData.hostId,
        description: matchData.description,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join host to match
    await matchService.joinMatch(data.id, matchData.hostId, true);

    return data;
  },

  // Join match
  joinMatch: async (matchId, userId, isHost = false) => {
    // Get match price
    const { data: match } = await supabase
      .from('matches')
      .select('price_per_player, current_players, max_players')
      .eq('id', matchId)
      .single();

    if (match.current_players >= match.max_players) {
      throw new Error('Match is full');
    }

    const { data, error } = await supabase
      .from('match_players')
      .insert({
        match_id: matchId,
        user_id: userId,
        payment_amount: match.price_per_player,
        payment_status: 'pending',
        is_host: isHost,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Leave match
  leaveMatch: async (matchId, userId) => {
    const { error } = await supabase
      .from('match_players')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get user's matches
  getUserMatches: async (userId, status = null) => {
    let query = supabase
      .from('match_players')
      .select(`
        *,
        match:matches(
          *,
          court:courts(name, address, image_url)
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (status) {
      query = query.eq('match.status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};

// =====================================================
// TEAMS
// =====================================================

export const teamService = {
  // Get teams for a match
  getMatchTeams: async (matchId) => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_players(
          *,
          user:profiles(id, username, full_name, avatar_url)
        )
      `)
      .eq('match_id', matchId)
      .order('team_position', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create or get team
  getOrCreateTeam: async (matchId, teamPosition) => {
    // Try to get existing team
    let { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('match_id', matchId)
      .eq('team_position', teamPosition)
      .single();

    if (error && error.code === 'PGRST116') {
      // Team doesn't exist, create it
      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert({
          match_id: matchId,
          team_name: `Team ${teamPosition}`,
          team_position: teamPosition,
          team_color: teamPosition === 'A' ? '#FF6B6B' : '#4ECDC4',
        })
        .select()
        .single();

      if (createError) throw createError;
      team = newTeam;
    } else if (error) {
      throw error;
    }

    return team;
  },

  // Join team
  joinTeam: async (matchId, userId, teamPosition) => {
    // Get or create team
    const team = await teamService.getOrCreateTeam(matchId, teamPosition);

    // Check if team is full
    const { count } = await supabase
      .from('team_players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    if (count >= 2) {
      throw new Error('Team is full');
    }

    // Remove user from other team if exists
    const otherTeamPosition = teamPosition === 'A' ? 'B' : 'A';
    const otherTeam = await teamService.getOrCreateTeam(matchId, otherTeamPosition);

    await supabase
      .from('team_players')
      .delete()
      .eq('team_id', otherTeam.id)
      .eq('user_id', userId);

    // Join team
    const { data, error } = await supabase
      .from('team_players')
      .insert({
        team_id: team.id,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Leave team
  leaveTeam: async (teamId, userId) => {
    const { error } = await supabase
      .from('team_players')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// =====================================================
// PAYMENTS
// =====================================================

export const paymentService = {
  // Create payment
  createPayment: async (matchId, userId, amount, paymentMethod = 'card') => {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        match_id: matchId,
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status, stripeData = {}) => {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        ...stripeData,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    // Update match player payment status
    if (status === 'succeeded' && data.match_id && data.user_id) {
      await supabase
        .from('match_players')
        .update({ payment_status: 'paid' })
        .eq('match_id', data.match_id)
        .eq('user_id', data.user_id);
    }

    return data;
  },

  // Get user payments
  getUserPayments: async (userId) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        match:matches(
          id,
          match_date,
          match_time,
          court:courts(name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// LIVE SCORING
// =====================================================

export const scoringService = {
  // Start match
  startMatch: async (matchId) => {
    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'in_progress' })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;

    // Create first game
    const teams = await teamService.getMatchTeams(matchId);
    await scoringService.createGame(matchId, 1, teams[0]?.id, teams[1]?.id);

    return data;
  },

  // Create game
  createGame: async (matchId, gameNumber, teamAId, teamBId) => {
    const { data, error } = await supabase
      .from('match_games')
      .insert({
        match_id: matchId,
        game_number: gameNumber,
        team_a_id: teamAId,
        team_b_id: teamBId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Record point
  recordPoint: async (matchGameId, matchId, teamId, playerId, eventType = 'point') => {
    // Get current scores
    const { data: game } = await supabase
      .from('match_games')
      .select('*')
      .eq('id', matchGameId)
      .single();

    let newTeamAScore = game.team_a_score;
    let newTeamBScore = game.team_b_score;

    if (teamId === game.team_a_id) {
      newTeamAScore += 1;
    } else {
      newTeamBScore += 1;
    }

    // Update game score
    await supabase
      .from('match_games')
      .update({
        team_a_score: newTeamAScore,
        team_b_score: newTeamBScore,
      })
      .eq('id', matchGameId);

    // Record scoring event
    const { data, error } = await supabase
      .from('scoring_events')
      .insert({
        match_game_id: matchGameId,
        match_id: matchId,
        event_type: eventType,
        team_id: teamId,
        player_id: playerId,
        team_a_score: newTeamAScore,
        team_b_score: newTeamBScore,
      })
      .select()
      .single();

    if (error) throw error;

    // Check if game is won (first to 6, win by 2)
    if (newTeamAScore >= 6 || newTeamBScore >= 6) {
      const diff = Math.abs(newTeamAScore - newTeamBScore);
      if (diff >= 2) {
        const winnerId = newTeamAScore > newTeamBScore ? game.team_a_id : game.team_b_id;
        await scoringService.endGame(matchGameId, winnerId);
      }
    }

    return data;
  },

  // End game
  endGame: async (matchGameId, winnerTeamId) => {
    const { data, error } = await supabase
      .from('match_games')
      .update({
        status: 'completed',
        winner_team_id: winnerTeamId,
        ended_at: new Date().toISOString(),
      })
      .eq('id', matchGameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get live score
  getLiveScore: async (matchId) => {
    const { data, error } = await supabase
      .from('match_games')
      .select(`
        *,
        team_a:teams!team_a_id(*),
        team_b:teams!team_b_id(*)
      `)
      .eq('match_id', matchId)
      .order('game_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Subscribe to live scoring
  subscribeLiveScore: (matchId, callback) => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scoring_events',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  },
};

// =====================================================
// LEADERBOARD
// =====================================================

export const leaderboardService = {
  // Get leaderboard
  getLeaderboard: async (region = 'global', period = 'all_time', limit = 100) => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        *,
        user:profiles(
          id,
          username,
          full_name,
          avatar_url,
          total_matches,
          wins,
          losses
        )
      `)
      .eq('region', region)
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get user rank
  getUserRank: async (userId, region = 'global', period = 'all_time') => {
    const { data, error } = await supabase
      .rpc('get_user_rank', {
        p_user_id: userId,
        p_region: region,
        p_period: period,
      });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// NOTIFICATIONS
// =====================================================

export const notificationService = {
  // Get user notifications
  getNotifications: async (userId, unreadOnly = false) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to notifications
  subscribeNotifications: (userId, callback) => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },
};
