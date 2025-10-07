-- =====================================================
-- PLAYCIRCLE - COMPLETE DATABASE SCHEMA
-- Complete schema for multi-sport court booking and match management
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- USERS & PROFILES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    preferred_language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    location_enabled BOOLEAN DEFAULT true,
    analytics_enabled BOOLEAN DEFAULT true,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    preferred_sport VARCHAR(50) DEFAULT 'padel',
    playing_style VARCHAR(50),
    favorite_position VARCHAR(50),
    availability TEXT[],
    skill_rating DECIMAL(3,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User sport preferences and stats per sport
CREATE TABLE IF NOT EXISTS public.user_sport_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    favorite_position TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, sport_id)
);

-- User statistics per sport (for detailed analytics)
CREATE TABLE IF NOT EXISTS public.user_sport_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL,
    total_hours_played DECIMAL(10, 2) DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    average_score DECIMAL(5, 2) DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    current_win_streak INTEGER DEFAULT 0,
    sport_specific_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, sport_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    distance_unit VARCHAR(10) DEFAULT 'km',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Profile visibility settings
CREATE TABLE IF NOT EXISTS public.profile_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    show_email BOOLEAN DEFAULT false,
    show_phone BOOLEAN DEFAULT false,
    show_location BOOLEAN DEFAULT true,
    show_stats BOOLEAN DEFAULT true,
    show_matches BOOLEAN DEFAULT true,
    show_skill_level BOOLEAN DEFAULT true,
    profile_searchable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User blocks table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- User connections/friends
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50),
    achievement_name VARCHAR(100),
    achievement_description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50),
    activity_description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VENUES & COURTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    location GEOGRAPHY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    venue_type TEXT CHECK (venue_type IN ('Sports Club', 'Recreation Center', 'Arena', 'Field', 'Court Complex', 'Gym')),
    is_indoor BOOLEAN DEFAULT false,
    number_of_courts INTEGER DEFAULT 1,
    has_lockers BOOLEAN DEFAULT false,
    has_showers BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_pro_shop BOOLEAN DEFAULT false,
    has_restaurant BOOLEAN DEFAULT false,
    has_lighting BOOLEAN DEFAULT false,
    phone TEXT,
    email TEXT,
    website TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    base_price_per_hour DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    opening_time TIME,
    closing_time TIME,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport_id TEXT NOT NULL,
    surface_type TEXT,
    is_indoor BOOLEAN DEFAULT false,
    court_number INTEGER DEFAULT 1,
    capacity INTEGER DEFAULT 4,
    equipment_included JSONB DEFAULT '[]'::jsonb,
    special_features JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.court_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(court_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.court_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(court_id, user_id)
);

-- =====================================================
-- MATCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
    sport_id TEXT NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    match_type TEXT CHECK (match_type IN ('competitive', 'casual', 'tournament')) NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional', 'Mixed')),
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 2) NOT NULL,
    price_per_player DECIMAL(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    description TEXT,
    sport_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
    payment_amount DECIMAL(10, 2),
    is_host BOOLEAN DEFAULT false,
    UNIQUE(match_id, user_id)
);

-- =====================================================
-- TEAMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    team_color TEXT DEFAULT '#FF6B6B',
    team_position TEXT CHECK (team_position IN ('A', 'B')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(match_id, team_position)
);

CREATE TABLE IF NOT EXISTS public.team_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    position TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, user_id)
);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT CHECK (payment_method IN ('card', 'apple_pay', 'google_pay', 'paypal')),
    status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    refunded_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- LIVE SCORING & GAME STATISTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.match_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL,
    team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_a_score INTEGER DEFAULT 0,
    team_b_score INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(match_id, game_number)
);

CREATE TABLE IF NOT EXISTS public.scoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_game_id UUID REFERENCES public.match_games(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('point', 'ace', 'winner', 'error', 'double_fault')) NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_a_score INTEGER,
    team_b_score INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.player_match_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    points_won INTEGER DEFAULT 0,
    points_lost INTEGER DEFAULT 0,
    aces INTEGER DEFAULT 0,
    winners INTEGER DEFAULT 0,
    unforced_errors INTEGER DEFAULT 0,
    double_faults INTEGER DEFAULT 0,
    first_serve_percentage DECIMAL(5, 2),
    break_points_won INTEGER DEFAULT 0,
    break_points_total INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(match_id, user_id)
);

-- =====================================================
-- LEADERBOARD & RANKINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    region TEXT DEFAULT 'global',
    rank INTEGER,
    points INTEGER DEFAULT 0,
    rank_change INTEGER DEFAULT 0,
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
    period TEXT CHECK (period IN ('weekly', 'monthly', 'all_time')) DEFAULT 'all_time',
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, region, period)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('match_invite', 'match_reminder', 'match_cancelled', 'payment_success', 'match_started', 'match_completed')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- STORAGE USAGE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_storage_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bucket_id TEXT,
    total_size_bytes BIGINT DEFAULT 0,
    file_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bucket_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_skill_level ON public.profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_visibility_user_id ON public.profile_visibility(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON public.user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend_id ON public.user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON public.activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);

-- Courts indexes
CREATE INDEX IF NOT EXISTS idx_courts_venue ON public.courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON public.courts(sport_id);
CREATE INDEX IF NOT EXISTS idx_courts_active ON public.courts(is_active);

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_location ON public.venues USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_rating ON public.venues(rating DESC);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_court ON public.matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_host ON public.matches(host_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON public.matches(match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON public.matches(sport_id);

-- Match Players indexes
CREATE INDEX IF NOT EXISTS idx_match_players_user ON public.match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_match ON public.teams(match_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_match ON public.payments(match_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_region_period ON public.leaderboard(region, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Storage usage indexes
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_user_id ON public.user_storage_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_bucket_id ON public.user_storage_usage(bucket_id);
