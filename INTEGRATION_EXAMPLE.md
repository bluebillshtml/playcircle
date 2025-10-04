# Supabase Integration Examples

This guide shows how to replace the mock data in your React Native app with real Supabase data.

## Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Configure Supabase Credentials

Create a `.env` file in your project root:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Update supabase.js

Edit `src/services/supabase.js` and replace the placeholder credentials:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```

## Integration Examples

### HomeScreen - Get Upcoming Matches

Replace the mock `UPCOMING_MATCHES` array:

```javascript
// src/screens/HomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { matchService } from '../services/supabase';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bracketVisible, setBracketVisible] = useState(false);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matches = await matchService.getUpcomingMatches(10);

      // Transform to match your existing data structure
      const transformedMatches = matches.map(match => ({
        id: match.id,
        courtName: match.court?.name,
        date: match.match_date,
        time: match.match_time,
        duration: match.duration_minutes,
        type: match.match_type,
        skillLevel: match.skill_level,
        joinedPlayers: match.current_players,
        totalPlayers: match.max_players,
        pricePerPlayer: parseFloat(match.price_per_player),
        image: match.court?.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
      }));

      setUpcomingMatches(transformedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
  // Use upcomingMatches instead of UPCOMING_MATCHES
}
```

### MatchDetailScreen - Get Match Details

```javascript
// src/screens/MatchDetailScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { matchService, teamService, paymentService } from '../services/supabase';

export default function MatchDetailScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [bracketVisible, setBracketVisible] = useState(false);
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const matchId = route.params?.matchId;

  useEffect(() => {
    if (matchId) {
      loadMatchDetails();
    }
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      setLoading(true);

      // Load match details
      const matchData = await matchService.getMatch(matchId);

      // Transform to your data structure
      const transformedMatch = {
        id: matchData.id,
        courtName: matchData.court?.name,
        courtAddress: matchData.court?.address,
        coordinates: {
          latitude: matchData.court?.latitude || 37.78825,
          longitude: matchData.court?.longitude || -122.4324,
        },
        courtImage: matchData.court?.image_url,
        date: matchData.match_date,
        time: matchData.match_time,
        duration: matchData.duration_minutes,
        type: matchData.match_type,
        skillLevel: matchData.skill_level,
        totalPlayers: matchData.max_players,
        joinedPlayers: matchData.current_players,
        pricePerPlayer: parseFloat(matchData.price_per_player),
        totalCost: parseFloat(matchData.total_cost),
        host: {
          name: matchData.host?.full_name,
          rating: 4.5, // You can add this to your schema
          matchesPlayed: matchData.host?.total_matches,
        },
        players: matchData.match_players?.map(mp => ({
          id: mp.user_id,
          name: mp.user?.full_name,
          rating: 4.5,
          isHost: mp.is_host,
        })),
        description: matchData.description,
        courtDetails: {
          facilities: [
            matchData.court?.has_lockers && 'Lockers',
            matchData.court?.has_showers && 'Showers',
            matchData.court?.has_parking && 'Parking',
            matchData.court?.has_pro_shop && 'Pro Shop',
          ].filter(Boolean),
          surface: matchData.court?.surface_type,
          indoor: matchData.court?.is_indoor,
          rating: matchData.court?.rating,
          phone: matchData.court?.phone,
        },
      };

      setMatch(transformedMatch);

      // Load teams
      const teamsData = await teamService.getMatchTeams(matchId);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const user = await authService.getCurrentUser();

      // Create payment record
      const payment = await paymentService.createPayment(
        matchId,
        user.id,
        match.pricePerPlayer,
        'card'
      );

      // TODO: Integrate with Stripe here
      // For now, mark as succeeded
      await paymentService.updatePaymentStatus(payment.id, 'succeeded');

      setModalVisible(false);
      Alert.alert(
        'Success!',
        'You have successfully joined the match. Payment will be processed.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const handleJoinMatch = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to join a match');
        return;
      }

      // Join the match
      await matchService.joinMatch(matchId, user.id);

      // Show payment modal
      setModalVisible(true);
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert('Error', error.message || 'Failed to join match');
    }
  };

  // Rest of your component...
}
```

### DashboardScreen - Get Leaderboard

```javascript
// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/supabase';

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Region');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bracketVisible, setBracketVisible] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const region = activeTab.toLowerCase();
      const data = await leaderboardService.getLeaderboard(region, 'all_time', 100);

      // Transform data
      const transformedData = data.map(entry => ({
        id: entry.user_id,
        name: entry.user?.full_name || entry.user?.username,
        username: `@${entry.user?.username}`,
        points: entry.points,
        rank: entry.rank,
        avatar: entry.user?.avatar_url,
        trend: entry.trend,
      }));

      setLeaderboardData(transformedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get top 3
  const top3Data = leaderboardData.slice(0, 3);
  const restData = leaderboardData.slice(3);

  // Rest of your component...
}
```

### TeamBracketOverlay - Join Teams

```javascript
// src/components/TeamBracketOverlay.js
import { teamService, authService } from '../services/supabase';

export default function TeamBracketOverlay({ visible, onClose, matchData, onConfirm }) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [teams, setTeams] = useState({
    teamA: { name: 'Team A', players: [], color: '#FF6B6B' },
    teamB: { name: 'Team B', players: [], color: '#4ECDC4' },
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && matchData?.id) {
      loadTeams();
      loadCurrentUser();
    }
  }, [visible, matchData]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const profile = await profileService.getProfile(user.id);
        setCurrentUser({
          id: user.id,
          name: profile.full_name || profile.username || 'You',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

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
            name: tp.user?.full_name || tp.user?.username,
          })) || [],
        },
        teamB: {
          id: teamB?.id,
          name: teamB?.team_name || 'Team B',
          color: teamB?.team_color || '#4ECDC4',
          players: teamB?.team_players?.map(tp => ({
            id: tp.user_id,
            name: tp.user?.full_name || tp.user?.username,
          })) || [],
        },
      });
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamKey) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in');
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

  // Rest of your component...
}
```

## Authentication Flow

### Create Login Screen

```javascript
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { authService } from '../services/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('SignUp')}
      />
    </View>
  );
}
```

## Realtime Features

### Live Score Updates

```javascript
// In your match detail or live scoring screen
import { scoringService } from '../services/supabase';

useEffect(() => {
  if (!matchId) return;

  // Subscribe to live scoring
  const channel = scoringService.subscribeLiveScore(matchId, (payload) => {
    console.log('New scoring event:', payload);
    // Reload scores
    loadLiveScore();
  });

  // Cleanup
  return () => {
    channel.unsubscribe();
  };
}, [matchId]);

const loadLiveScore = async () => {
  const scores = await scoringService.getLiveScore(matchId);
  setLiveScores(scores);
};
```

## Next Steps

1. **Set up Authentication**
   - Add login/signup screens
   - Handle session persistence
   - Add auth state management (Context API or Redux)

2. **Integrate Stripe**
   - Set up Stripe publishable key
   - Use Stripe SDK for payment processing
   - Update payment status after successful charge

3. **Add Image Upload**
   - Set up Supabase Storage
   - Add profile picture upload
   - Add court image upload

4. **Enable Realtime**
   - Go to Supabase Dashboard → Database → Replication
   - Enable realtime for tables you want to subscribe to

5. **Add Error Handling**
   - Create error boundary components
   - Add retry logic for failed requests
   - Show user-friendly error messages

6. **Optimize Performance**
   - Implement pagination for lists
   - Add loading states
   - Cache frequently accessed data
   - Use React Query or SWR for data fetching
