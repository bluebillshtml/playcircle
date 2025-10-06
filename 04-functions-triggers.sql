-- =====================================================
-- PLAYCIRCLE - DATABASE FUNCTIONS AND TRIGGERS
-- Essential functions and triggers for the application
-- =====================================================

-- =====================================================
-- 1. CORE FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, first_name, last_name, skill_level)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'skill_level', 'Beginner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_active_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to update user statistics after match completion
CREATE OR REPLACE FUNCTION update_user_stats_after_match()
RETURNS TRIGGER AS $$
DECLARE
    winner_team UUID;
    match_duration DECIMAL;
    player_record RECORD;
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
        FOR player_record IN 
            SELECT user_id FROM public.match_players WHERE match_id = NEW.id
        LOOP
            -- Update profiles table
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
            WHERE p.id = player_record.user_id;

            -- Insert or update user_sport_stats
            INSERT INTO public.user_sport_stats (
                user_id, 
                sport_id, 
                total_hours_played, 
                win_rate,
                created_at,
                updated_at
            )
            VALUES (
                player_record.user_id,
                NEW.sport_id,
                match_duration,
                (
                    SELECT (wins::DECIMAL / NULLIF(total_matches, 0) * 100)
                    FROM public.profiles WHERE id = player_record.user_id
                ),
                NOW(),
                NOW()
            )
            ON CONFLICT (user_id, sport_id)
            DO UPDATE SET
                total_hours_played = user_sport_stats.total_hours_played + match_duration,
                win_rate = (
                    SELECT (wins::DECIMAL / NULLIF(total_matches, 0) * 100)
                    FROM public.profiles WHERE id = player_record.user_id
                ),
                updated_at = NOW();
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create initial user sport stats
CREATE OR REPLACE FUNCTION create_user_sport_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default user_sport_stats for padel (default sport)
    INSERT INTO public.user_sport_stats (
        user_id,
        sport_id,
        total_hours_played,
        win_rate,
        average_score,
        longest_win_streak,
        current_win_streak,
        sport_specific_stats,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        'padel',
        0,
        0,
        0,
        0,
        0,
        '{}'::jsonb,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, sport_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. HELPER FUNCTIONS
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
        v.address,
        (ST_Distance(
            v.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) / 1000)::DECIMAL(10, 2) as distance_km,
        v.rating,
        v.base_price_per_hour
    FROM public.courts c
    JOIN public.venues v ON c.venue_id = v.id
    WHERE c.is_active = true
        AND v.is_active = true
        AND ST_DWithin(
            v.location::geography,
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

-- Function to calculate win streak
CREATE OR REPLACE FUNCTION calculate_win_streak(p_user_id UUID, p_sport_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    match_record RECORD;
BEGIN
    -- Get recent matches for the user in the sport, ordered by date
    FOR match_record IN
        SELECT 
            m.id,
            m.status,
            m.completed_at,
            CASE WHEN EXISTS (
                SELECT 1 FROM public.team_players tp
                JOIN public.teams t ON tp.team_id = t.id
                JOIN public.match_games mg ON t.match_id = mg.match_id
                WHERE tp.user_id = p_user_id 
                AND mg.winner_team_id = t.id
                AND mg.match_id = m.id
            ) THEN true ELSE false END as won
        FROM public.matches m
        JOIN public.match_players mp ON m.id = mp.match_id
        WHERE mp.user_id = p_user_id
        AND m.sport_id = p_sport_id
        AND m.status = 'completed'
        ORDER BY m.completed_at DESC
    LOOP
        IF match_record.won THEN
            streak := streak + 1;
        ELSE
            EXIT; -- Stop counting when we hit a loss
        END IF;
    END LOOP;
    
    RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Trigger to update last_active_at when user performs actions
DROP TRIGGER IF EXISTS update_user_activity ON activity_log;
CREATE TRIGGER update_user_activity
    AFTER INSERT ON activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Trigger to update match player count
DROP TRIGGER IF EXISTS match_players_count_trigger ON public.match_players;
CREATE TRIGGER match_players_count_trigger
AFTER INSERT OR DELETE ON public.match_players
FOR EACH ROW EXECUTE FUNCTION update_match_player_count();

-- Trigger to update court rating
DROP TRIGGER IF EXISTS court_rating_trigger ON public.court_reviews;
CREATE TRIGGER court_rating_trigger
AFTER INSERT OR UPDATE ON public.court_reviews
FOR EACH ROW EXECUTE FUNCTION update_court_rating();

-- Trigger to update user stats after match completion
DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.matches;
CREATE TRIGGER update_user_stats_trigger
AFTER UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_match();

-- Trigger to create initial user sport stats
DROP TRIGGER IF EXISTS create_user_sport_stats_trigger ON public.profiles;
CREATE TRIGGER create_user_sport_stats_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION create_user_sport_stats();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.user_storage_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- User Sport Stats policies
DROP POLICY IF EXISTS "User sport stats are viewable by everyone" ON public.user_sport_stats;
CREATE POLICY "User sport stats are viewable by everyone"
    ON public.user_sport_stats FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own sport stats" ON public.user_sport_stats;
CREATE POLICY "Users can update own sport stats"
    ON public.user_sport_stats FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sport stats" ON public.user_sport_stats;
CREATE POLICY "Users can insert own sport stats"
    ON public.user_sport_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Sport Profiles policies
DROP POLICY IF EXISTS "User sport profiles are viewable by everyone" ON public.user_sport_profiles;
CREATE POLICY "User sport profiles are viewable by everyone"
    ON public.user_sport_profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own sport profiles" ON public.user_sport_profiles;
CREATE POLICY "Users can update own sport profiles"
    ON public.user_sport_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sport profiles" ON public.user_sport_profiles;
CREATE POLICY "Users can insert own sport profiles"
    ON public.user_sport_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Profile visibility policies
DROP POLICY IF EXISTS "Users can view own visibility settings" ON public.profile_visibility;
CREATE POLICY "Users can view own visibility settings"
    ON public.profile_visibility FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own visibility" ON public.profile_visibility;
CREATE POLICY "Users can update own visibility"
    ON public.profile_visibility FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own visibility" ON public.profile_visibility;
CREATE POLICY "Users can insert own visibility"
    ON public.profile_visibility FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User blocks policies
DROP POLICY IF EXISTS "Users can view own blocks" ON public.user_blocks;
CREATE POLICY "Users can view own blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can manage own blocks" ON public.user_blocks;
CREATE POLICY "Users can manage own blocks"
    ON public.user_blocks FOR ALL
    USING (auth.uid() = blocker_id);

-- User connections policies
DROP POLICY IF EXISTS "Users can view own connections" ON public.user_connections;
CREATE POLICY "Users can view own connections"
    ON public.user_connections FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can manage own connections" ON public.user_connections;
CREATE POLICY "Users can manage own connections"
    ON public.user_connections FOR ALL
    USING (auth.uid() = user_id);

-- User achievements policies
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.user_achievements;
CREATE POLICY "Achievements are viewable by everyone"
    ON public.user_achievements FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "System can insert achievements" ON public.user_achievements;
CREATE POLICY "System can insert achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (true);

-- Activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;
CREATE POLICY "Users can view own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity" ON public.activity_log;
CREATE POLICY "System can insert activity"
    ON public.activity_log FOR INSERT
    WITH CHECK (true);

-- Venues policies
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Venues are viewable by everyone"
    ON public.venues FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;
CREATE POLICY "Authenticated users can create venues"
    ON public.venues FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update venues they created" ON public.venues;
CREATE POLICY "Users can update venues they created"
    ON public.venues FOR UPDATE
    USING (auth.uid() = created_by);

-- Courts policies
DROP POLICY IF EXISTS "Courts are viewable by everyone" ON public.courts;
CREATE POLICY "Courts are viewable by everyone"
    ON public.courts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create courts" ON public.courts;
CREATE POLICY "Authenticated users can create courts"
    ON public.courts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Court Reviews policies
DROP POLICY IF EXISTS "Court reviews are viewable by everyone" ON public.court_reviews;
CREATE POLICY "Court reviews are viewable by everyone"
    ON public.court_reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.court_reviews;
CREATE POLICY "Authenticated users can create reviews"
    ON public.court_reviews FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.court_reviews;
CREATE POLICY "Users can update own reviews"
    ON public.court_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Matches policies
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by everyone"
    ON public.matches FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
CREATE POLICY "Authenticated users can create matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = host_id);

DROP POLICY IF EXISTS "Match hosts can update their matches" ON public.matches;
CREATE POLICY "Match hosts can update their matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = host_id);

-- Match Players policies
DROP POLICY IF EXISTS "Match players are viewable by everyone" ON public.match_players;
CREATE POLICY "Match players are viewable by everyone"
    ON public.match_players FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can join matches" ON public.match_players;
CREATE POLICY "Authenticated users can join matches"
    ON public.match_players FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave matches" ON public.match_players;
CREATE POLICY "Users can leave matches"
    ON public.match_players FOR DELETE
    USING (auth.uid() = user_id);

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
CREATE POLICY "Teams are viewable by everyone"
    ON public.teams FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Match players can create teams" ON public.teams;
CREATE POLICY "Match players can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.match_players
            WHERE match_id = teams.match_id AND user_id = auth.uid()
        )
    );

-- Team Players policies
DROP POLICY IF EXISTS "Team players are viewable by everyone" ON public.team_players;
CREATE POLICY "Team players are viewable by everyone"
    ON public.team_players FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can join teams" ON public.team_players;
CREATE POLICY "Users can join teams"
    ON public.team_players FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave teams" ON public.team_players;
CREATE POLICY "Users can leave teams"
    ON public.team_players FOR DELETE
    USING (auth.uid() = user_id);

-- Payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
CREATE POLICY "Users can create own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Match Games policies
DROP POLICY IF EXISTS "Match games are viewable by everyone" ON public.match_games;
CREATE POLICY "Match games are viewable by everyone"
    ON public.match_games FOR SELECT
    USING (true);

-- Scoring Events policies
DROP POLICY IF EXISTS "Scoring events are viewable by everyone" ON public.scoring_events;
CREATE POLICY "Scoring events are viewable by everyone"
    ON public.scoring_events FOR SELECT
    USING (true);

-- Player Match Stats policies
DROP POLICY IF EXISTS "Player match stats are viewable by everyone" ON public.player_match_stats;
CREATE POLICY "Player match stats are viewable by everyone"
    ON public.player_match_stats FOR SELECT
    USING (true);

-- Leaderboard policies
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone"
    ON public.leaderboard FOR SELECT
    USING (true);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- User Storage Usage policies
DROP POLICY IF EXISTS "Users can view own storage usage" ON public.user_storage_usage;
CREATE POLICY "Users can view own storage usage"
    ON public.user_storage_usage FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS COMPLETE
-- =====================================================
