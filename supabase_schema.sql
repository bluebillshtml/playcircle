-- =====================================================
-- SPORTCONNECT - Supabase Database Schema
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
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
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
    favorite_position TEXT, -- Sport-specific position (e.g., 'Left', 'Right', 'Any' for racket sports)
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
    sport_specific_stats JSONB DEFAULT '{}'::jsonb, -- For sport-specific stats like aces, goals, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, sport_id)
);

-- =====================================================
-- COURTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    location GEOGRAPHY(POINT, 4326), -- PostGIS for geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Venue details
    venue_type TEXT CHECK (venue_type IN ('Sports Club', 'Recreation Center', 'Arena', 'Field', 'Court Complex', 'Gym')),
    is_indoor BOOLEAN DEFAULT false,
    number_of_courts INTEGER DEFAULT 1,

    -- Facilities
    has_lockers BOOLEAN DEFAULT false,
    has_showers BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_pro_shop BOOLEAN DEFAULT false,
    has_restaurant BOOLEAN DEFAULT false,
    has_lighting BOOLEAN DEFAULT false,

    -- Contact & Media
    phone TEXT,
    email TEXT,
    website TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,

    -- Ratings & Reviews
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,

    -- Pricing
    base_price_per_hour DECIMAL(10, 2) NOT NULL,

    -- Availability
    is_active BOOLEAN DEFAULT true,
    opening_time TIME,
    closing_time TIME,

    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Court/Field definitions within venues
CREATE TABLE IF NOT EXISTS public.courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID,
    name TEXT NOT NULL,
    sport_id TEXT NOT NULL, -- Which sport this court is for
    surface_type TEXT, -- Sport-specific surface types
    is_indoor BOOLEAN DEFAULT false,
    court_number INTEGER DEFAULT 1,
    capacity INTEGER DEFAULT 4, -- Max players for this court
    equipment_included JSONB DEFAULT '[]'::jsonb, -- Equipment provided
    special_features JSONB DEFAULT '{}'::jsonb, -- Sport-specific features
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add foreign key constraint for courts -> venues
ALTER TABLE public.courts 
ADD CONSTRAINT fk_courts_venue 
FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;

-- Court availability schedule
CREATE TABLE IF NOT EXISTS public.court_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(court_id, day_of_week)
);

-- Court reviews
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
    sport_id TEXT NOT NULL, -- Which sport this match is for

    -- Match details
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 90,

    -- Match type
    match_type TEXT CHECK (match_type IN ('competitive', 'casual', 'tournament')) NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional', 'Mixed')),

    -- Players
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,

    -- Pricing
    total_cost DECIMAL(10, 2) NOT NULL,
    price_per_player DECIMAL(10, 2) NOT NULL,

    -- Status
    status TEXT CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',

    -- Host
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Match info
    description TEXT,

    -- Sport-specific settings
    sport_settings JSONB DEFAULT '{}'::jsonb, -- Sport-specific rules, scoring, etc.

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Match players (who joined the match)
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
-- TEAMS (for 2v2 matches)
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

-- Team players
CREATE TABLE IF NOT EXISTS public.team_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    position TEXT, -- Sport-specific position (e.g., 'Left', 'Right', 'Any' for racket sports, 'Forward', 'Defender' for team sports)
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

    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT CHECK (payment_method IN ('card', 'apple_pay', 'google_pay', 'paypal')),

    -- Status
    status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',

    -- External payment processor data
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,

    -- Refund info
    refunded_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- LIVE SCORING & GAME STATISTICS
-- =====================================================

-- Match games (sets in a match)
CREATE TABLE IF NOT EXISTS public.match_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL,

    -- Team scores
    team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team_a_score INTEGER DEFAULT 0,
    team_b_score INTEGER DEFAULT 0,

    -- Game status
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(match_id, game_number)
);

-- Live scoring events
CREATE TABLE IF NOT EXISTS public.scoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_game_id UUID REFERENCES public.match_games(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT CHECK (event_type IN ('point', 'ace', 'winner', 'error', 'double_fault')) NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Score after event
    team_a_score INTEGER,
    team_b_score INTEGER,

    -- Event metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    notes TEXT
);

-- Player match statistics
CREATE TABLE IF NOT EXISTS public.player_match_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,

    -- Scoring stats
    points_won INTEGER DEFAULT 0,
    points_lost INTEGER DEFAULT 0,
    aces INTEGER DEFAULT 0,
    winners INTEGER DEFAULT 0,
    unforced_errors INTEGER DEFAULT 0,
    double_faults INTEGER DEFAULT 0,

    -- Performance metrics
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

    -- Ranking
    region TEXT DEFAULT 'global',
    rank INTEGER,
    points INTEGER DEFAULT 0,

    -- Trend
    rank_change INTEGER DEFAULT 0, -- Positive = moving up, Negative = moving down
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',

    -- Period
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

    -- Notification details
    type TEXT CHECK (type IN ('match_invite', 'match_reminder', 'match_cancelled', 'payment_success', 'match_started', 'match_completed')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Related entities
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Courts
CREATE INDEX IF NOT EXISTS idx_courts_venue ON public.courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON public.courts(sport_id);
CREATE INDEX IF NOT EXISTS idx_courts_active ON public.courts(is_active);

-- Venues
CREATE INDEX IF NOT EXISTS idx_venues_location ON public.venues USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_rating ON public.venues(rating DESC);

-- Matches
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_court ON public.matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_host ON public.matches(host_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON public.matches(match_date, match_time);

-- Match Players
CREATE INDEX IF NOT EXISTS idx_match_players_user ON public.match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_match ON public.teams(match_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_match ON public.payments(match_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_region_period ON public.leaderboard(region, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, skill_level)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'skill_level', 'Beginner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courts_updated_at ON public.courts;
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON public.courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sport_stats_updated_at ON public.user_sport_stats;
CREATE TRIGGER update_user_sport_stats_updated_at BEFORE UPDATE ON public.user_sport_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update match player count
CREATE OR REPLACE FUNCTION update_match_player_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.matches
        SET current_players = current_players + 1,
            status = CASE WHEN current_players + 1 >= max_players THEN 'full' ELSE status END
        WHERE id = NEW.match_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.matches
        SET current_players = GREATEST(current_players - 1, 0),
            status = CASE WHEN current_players - 1 < max_players THEN 'open' ELSE status END
        WHERE id = OLD.match_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS match_players_count_trigger ON public.match_players;
CREATE TRIGGER match_players_count_trigger
AFTER INSERT OR DELETE ON public.match_players
FOR EACH ROW EXECUTE FUNCTION update_match_player_count();

-- Function to update court rating
CREATE OR REPLACE FUNCTION update_court_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.courts
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM public.court_reviews
        WHERE court_id = NEW.court_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM public.court_reviews
        WHERE court_id = NEW.court_id
    )
    WHERE id = NEW.court_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS court_rating_trigger ON public.court_reviews;
CREATE TRIGGER court_rating_trigger
AFTER INSERT OR UPDATE ON public.court_reviews
FOR EACH ROW EXECUTE FUNCTION update_court_rating();

-- Function to update user statistics after match completion
CREATE OR REPLACE FUNCTION update_user_stats_after_match()
RETURNS TRIGGER AS $$
DECLARE
    winner_team UUID;
    match_duration DECIMAL;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Calculate match duration in hours
        match_duration := NEW.duration_minutes / 60.0;

        -- Get winning team (if any)
        SELECT winner_team_id INTO winner_team
        FROM public.match_games
        WHERE match_id = NEW.id
        GROUP BY winner_team_id
        HAVING COUNT(*) > (SELECT COUNT(*) / 2 FROM public.match_games WHERE match_id = NEW.id)
        LIMIT 1;

        -- Update stats for all players in the match
        UPDATE public.profiles p
        SET
            total_matches = total_matches + 1,
            wins = wins + (
                CASE WHEN EXISTS (
                    SELECT 1 FROM public.team_players tp
                    WHERE tp.user_id = p.id AND tp.team_id = winner_team
                ) THEN 1 ELSE 0 END
            ),
            losses = losses + (
                CASE WHEN NOT EXISTS (
                    SELECT 1 FROM public.team_players tp
                    WHERE tp.user_id = p.id AND tp.team_id = winner_team
                ) AND winner_team IS NOT NULL THEN 1 ELSE 0 END
            )
        WHERE p.id IN (
            SELECT user_id FROM public.match_players WHERE match_id = NEW.id
        );

        -- Update user_sport_stats
        UPDATE public.user_sport_stats us
        SET
            total_hours_played = total_hours_played + match_duration,
            win_rate = (
                SELECT (wins::DECIMAL / NULLIF(total_matches, 0) * 100)
                FROM public.profiles WHERE id = us.user_id
            )
        WHERE us.user_id IN (
            SELECT user_id FROM public.match_players WHERE match_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.matches;
CREATE TRIGGER update_user_stats_trigger
AFTER UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_match();

-- Function to create initial user sport stats
CREATE OR REPLACE FUNCTION create_user_sport_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This function is now handled by the application logic
    -- as we need to know which sport to create stats for
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_sport_stats_trigger ON public.profiles;
CREATE TRIGGER create_user_sport_stats_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION create_user_sport_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User Sport Stats: Users can read all sport stats, but only update their own
CREATE POLICY "User sport stats are viewable by everyone"
    ON public.user_sport_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update own sport stats"
    ON public.user_sport_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- User Sport Profiles: Users can read all sport profiles, but only update their own
CREATE POLICY "User sport profiles are viewable by everyone"
    ON public.user_sport_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own sport profiles"
    ON public.user_sport_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sport profiles"
    ON public.user_sport_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Sport Stats: Users can read all sport stats, but only update their own
CREATE POLICY "User sport stats are viewable by everyone"
    ON public.user_sport_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update own sport stats"
    ON public.user_sport_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sport stats"
    ON public.user_sport_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Venues: Everyone can read, only authenticated users can create
CREATE POLICY "Venues are viewable by everyone"
    ON public.venues FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create venues"
    ON public.venues FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update venues they created"
    ON public.venues FOR UPDATE
    USING (auth.uid() = created_by);

-- Courts: Everyone can read, only authenticated users can create
CREATE POLICY "Courts are viewable by everyone"
    ON public.courts FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create courts"
    ON public.courts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update courts they created"
    ON public.courts FOR UPDATE
    USING (auth.uid() = created_by);

-- Court Reviews: Everyone can read, users can create/update their own
CREATE POLICY "Court reviews are viewable by everyone"
    ON public.court_reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.court_reviews FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON public.court_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Matches: Everyone can read, authenticated users can create
CREATE POLICY "Matches are viewable by everyone"
    ON public.matches FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = host_id);

CREATE POLICY "Match hosts can update their matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = host_id);

-- Match Players: Users can view all, join matches, and leave their own
CREATE POLICY "Match players are viewable by everyone"
    ON public.match_players FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can join matches"
    ON public.match_players FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can leave matches"
    ON public.match_players FOR DELETE
    USING (auth.uid() = user_id);

-- Teams: Everyone can read, match players can manage
CREATE POLICY "Teams are viewable by everyone"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "Match players can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.match_players
            WHERE match_id = teams.match_id AND user_id = auth.uid()
        )
    );

-- Team Players: Everyone can read, users can join teams
CREATE POLICY "Team players are viewable by everyone"
    ON public.team_players FOR SELECT
    USING (true);

CREATE POLICY "Users can join teams"
    ON public.team_players FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can leave teams"
    ON public.team_players FOR DELETE
    USING (auth.uid() = user_id);

-- Payments: Users can only see their own payments
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Match Games: Everyone can read
CREATE POLICY "Match games are viewable by everyone"
    ON public.match_games FOR SELECT
    USING (true);

-- Scoring Events: Everyone can read
CREATE POLICY "Scoring events are viewable by everyone"
    ON public.scoring_events FOR SELECT
    USING (true);

-- Player Match Stats: Everyone can read
CREATE POLICY "Player match stats are viewable by everyone"
    ON public.player_match_stats FOR SELECT
    USING (true);

-- Leaderboard: Everyone can read
CREATE POLICY "Leaderboard is viewable by everyone"
    ON public.leaderboard FOR SELECT
    USING (true);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to find nearby courts
CREATE OR REPLACE FUNCTION find_nearby_courts(
    lat DECIMAL,
    lng DECIMAL,
    radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    distance_km DECIMAL,
    rating DECIMAL,
    base_price_per_hour DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.address,
        (ST_Distance(
            c.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) / 1000)::DECIMAL(10, 2) as distance_km,
        c.rating,
        c.base_price_per_hour
    FROM public.courts c
    WHERE c.is_active = true
        AND ST_DWithin(
            c.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            radius_km * 1000
        )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to get user leaderboard position
CREATE OR REPLACE FUNCTION get_user_rank(
    p_user_id UUID,
    p_region TEXT DEFAULT 'global',
    p_period TEXT DEFAULT 'all_time'
)
RETURNS TABLE (
    rank INTEGER,
    points INTEGER,
    trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.rank,
        l.points,
        l.trend
    FROM public.leaderboard l
    WHERE l.user_id = p_user_id
        AND l.region = p_region
        AND l.period = p_period;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample courts (uncomment to use)
/*
INSERT INTO public.courts (name, address, city, country, latitude, longitude, surface_type, is_indoor, has_lockers, has_showers, has_parking, has_pro_shop, phone, rating, base_price_per_hour, is_active)
VALUES
    ('Downtown Padel Club', '123 Main St', 'San Francisco', 'USA', 37.78825, -122.4324, 'Artificial Grass', true, true, true, true, true, '+1 (555) 123-4567', 4.8, 40.00, true),
    ('Sunset Sports Center', '456 Beach Ave', 'San Francisco', 'USA', 37.78925, -122.4334, 'Synthetic Turf', false, true, true, true, false, '+1 (555) 234-5678', 4.6, 35.00, true);

-- Update location geography based on lat/lng
UPDATE public.courts
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL;
*/
