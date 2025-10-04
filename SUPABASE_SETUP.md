# SportConnect - Supabase Database Setup Guide

## Overview

This database schema provides a complete backend for the SportConnect multi-sport court booking and match management application, including support for live scoring, game statistics, payments, and leaderboards across multiple sports.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Note your project URL and anon key

### 2. Run the Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase_schema.sql`
5. Paste and run the script

### 3. Enable PostGIS (for geolocation features)

The schema uses PostGIS for location-based features. It should be enabled automatically, but if not:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 4. Set up Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable Email provider (or other providers you want)
3. Configure email templates if needed

## Database Structure

### Core Tables

#### Users & Profiles
- **profiles** - User profile information (extends auth.users)
- **user_sport_profiles** - User preferences and stats per sport
- **user_sport_stats** - Detailed user statistics and analytics per sport
- **leaderboard** - Regional and global rankings per sport

#### Venues & Courts
- **venues** - Venue information with geolocation
- **courts** - Court/field definitions within venues for specific sports
- **court_schedules** - Operating hours by day of week
- **court_reviews** - User reviews and ratings

#### Matches
- **matches** - Match details and scheduling (with sport_id)
- **match_players** - Players who joined a match
- **teams** - Team A and Team B for team matches
- **team_players** - Players assigned to teams

#### Payments
- **payments** - Payment records with Stripe integration support

#### Live Scoring
- **match_games** - Individual games/sets in a match
- **scoring_events** - Real-time scoring events
- **player_match_stats** - Per-player statistics for each match

#### Other
- **notifications** - User notifications

## Key Features

### 1. Automatic User Stats Updates

When a match is completed, user statistics are automatically updated:
- Total matches played
- Wins/losses
- Win rate
- Hours played

### 2. Live Scoring System

Track real-time match progress:
- Points scored
- Aces, winners, errors
- Game-by-game statistics
- Player performance metrics

### 3. Geolocation Search

Find courts near a location:

```sql
SELECT * FROM find_nearby_courts(37.7749, -122.4194, 10);
-- lat, lng, radius in km
```

### 4. Leaderboard System

Supports multiple leaderboard types:
- Regional (by city/state/country)
- Time-based (weekly, monthly, all-time)
- Automatic rank calculation and trending

### 5. Payment Integration

Ready for Stripe integration:
- Payment intent tracking
- Refund support
- Payment status tracking

## Common Queries

### Get User Profile with Stats

```sql
SELECT
    p.*,
    us.total_hours_played,
    us.win_rate,
    us.current_win_streak
FROM profiles p
LEFT JOIN user_stats us ON us.user_id = p.id
WHERE p.id = 'user-uuid';
```

### Get Upcoming Matches

```sql
SELECT
    m.*,
    c.name as court_name,
    c.address as court_address,
    m.current_players,
    m.max_players
FROM matches m
LEFT JOIN courts c ON c.id = m.court_id
WHERE m.status = 'open'
    AND m.match_date >= CURRENT_DATE
ORDER BY m.match_date, m.match_time
LIMIT 20;
```

### Get Match with Players and Teams

```sql
SELECT
    m.*,
    json_agg(DISTINCT jsonb_build_object(
        'id', mp.user_id,
        'name', p.full_name,
        'username', p.username,
        'is_host', mp.is_host,
        'payment_status', mp.payment_status
    )) as players,
    json_agg(DISTINCT jsonb_build_object(
        'id', t.id,
        'team_name', t.team_name,
        'team_position', t.team_position,
        'team_color', t.team_color,
        'players', (
            SELECT json_agg(jsonb_build_object(
                'id', tp.user_id,
                'name', p2.full_name
            ))
            FROM team_players tp
            LEFT JOIN profiles p2 ON p2.id = tp.user_id
            WHERE tp.team_id = t.id
        )
    )) FILTER (WHERE t.id IS NOT NULL) as teams
FROM matches m
LEFT JOIN match_players mp ON mp.match_id = m.id
LEFT JOIN profiles p ON p.id = mp.user_id
LEFT JOIN teams t ON t.match_id = m.id
WHERE m.id = 'match-uuid'
GROUP BY m.id;
```

### Get User Match History

```sql
SELECT
    m.*,
    c.name as court_name,
    mp.payment_status,
    CASE
        WHEN mg.winner_team_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM team_players tp
            WHERE tp.team_id = mg.winner_team_id
            AND tp.user_id = 'user-uuid'
        ) THEN 'Win'
        ELSE 'Loss'
    END as result
FROM match_players mp
JOIN matches m ON m.id = mp.match_id
LEFT JOIN courts c ON c.id = m.court_id
LEFT JOIN match_games mg ON mg.match_id = m.id
WHERE mp.user_id = 'user-uuid'
    AND m.status = 'completed'
ORDER BY m.match_date DESC, m.match_time DESC;
```

### Get Live Match Score

```sql
SELECT
    m.id,
    m.match_date,
    m.match_time,
    json_build_object(
        'team_a', json_build_object(
            'name', ta.team_name,
            'color', ta.team_color,
            'score', COALESCE(SUM(CASE WHEN mg.winner_team_id = ta.id THEN 1 ELSE 0 END), 0)
        ),
        'team_b', json_build_object(
            'name', tb.team_name,
            'color', tb.team_color,
            'score', COALESCE(SUM(CASE WHEN mg.winner_team_id = tb.id THEN 1 ELSE 0 END), 0)
        )
    ) as teams,
    json_agg(json_build_object(
        'game_number', mg.game_number,
        'team_a_score', mg.team_a_score,
        'team_b_score', mg.team_b_score,
        'status', mg.status
    ) ORDER BY mg.game_number) as games
FROM matches m
LEFT JOIN teams ta ON ta.match_id = m.id AND ta.team_position = 'A'
LEFT JOIN teams tb ON tb.match_id = m.id AND tb.team_position = 'B'
LEFT JOIN match_games mg ON mg.match_id = m.id
WHERE m.id = 'match-uuid'
GROUP BY m.id, ta.team_name, ta.team_color, tb.team_name, tb.team_color;
```

### Get Leaderboard

```sql
SELECT
    l.rank,
    l.points,
    l.trend,
    p.username,
    p.full_name,
    p.total_matches,
    p.wins,
    p.losses,
    us.win_rate
FROM leaderboard l
JOIN profiles p ON p.id = l.user_id
LEFT JOIN user_stats us ON us.user_id = l.user_id
WHERE l.region = 'global'
    AND l.period = 'all_time'
ORDER BY l.rank
LIMIT 100;
```

## React Native Integration

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Supabase Client

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Example Usage

```javascript
// Get upcoming matches
const getUpcomingMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      court:courts(*),
      match_players(count)
    `)
    .eq('status', 'open')
    .gte('match_date', new Date().toISOString().split('T')[0])
    .order('match_date', { ascending: true })
    .limit(20);

  return data;
};

// Join a match
const joinMatch = async (matchId, userId) => {
  const { data: match } = await supabase
    .from('matches')
    .select('price_per_player')
    .eq('id', matchId)
    .single();

  const { data, error } = await supabase
    .from('match_players')
    .insert({
      match_id: matchId,
      user_id: userId,
      payment_amount: match.price_per_player,
      payment_status: 'pending'
    });

  return data;
};

// Create team and join
const joinTeam = async (matchId, userId, teamPosition) => {
  // Get or create team
  let { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('match_id', matchId)
    .eq('team_position', teamPosition)
    .single();

  if (!team) {
    const { data: newTeam } = await supabase
      .from('teams')
      .insert({
        match_id: matchId,
        team_name: `Team ${teamPosition}`,
        team_position: teamPosition,
        team_color: teamPosition === 'A' ? '#FF6B6B' : '#4ECDC4'
      })
      .select()
      .single();

    team = newTeam;
  }

  // Join team
  const { data, error } = await supabase
    .from('team_players')
    .insert({
      team_id: team.id,
      user_id: userId
    });

  return data;
};

// Get live match score with realtime updates
const subscribeLiveScore = (matchId, callback) => {
  const channel = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scoring_events',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return channel;
};
```

## Realtime Features

Supabase supports realtime subscriptions. Enable them for:

1. **Live Scoring** - Subscribe to `scoring_events` table
2. **Match Updates** - Subscribe to `matches` table
3. **Team Changes** - Subscribe to `team_players` table
4. **Notifications** - Subscribe to `notifications` table

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Users can only update their own data
3. Match hosts can manage their matches
4. Payments are private to users
5. All policies are production-ready

## Next Steps

1. Set up Stripe for payments
2. Configure email templates for notifications
3. Add Cloud Functions for:
   - Payment processing
   - Email notifications
   - Leaderboard calculations (cron job)
4. Enable Realtime for live scoring
5. Add Storage bucket for court/user images

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
