-- =====================================================
-- PLAYCIRCLE - SEED DATA
-- Sample data for testing and development
-- =====================================================

-- =====================================================
-- 1. SAMPLE VENUES
-- =====================================================

INSERT INTO public.venues (
    id, name, address, city, state, country, postal_code,
    latitude, longitude, location,
    venue_type, is_indoor, number_of_courts,
    has_lockers, has_showers, has_parking, has_pro_shop, has_restaurant, has_lighting,
    phone, email, website, image_url,
    rating, total_reviews, base_price_per_hour,
    is_active, opening_time, closing_time
) VALUES 
(
    gen_random_uuid(),
    'Downtown Padel Club',
    '123 Main Street',
    'San Francisco',
    'CA',
    'USA',
    '94102',
    37.78825,
    -122.4324,
    ST_SetSRID(ST_MakePoint(-122.4324, 37.78825), 4326)::geography,
    'Sports Club',
    true,
    4,
    true,
    true,
    true,
    true,
    true,
    true,
    '+1 (555) 123-4567',
    'info@downtownpadel.com',
    'https://downtownpadel.com',
    'https://example.com/venue1.jpg',
    4.8,
    127,
    45.00,
    true,
    '06:00:00',
    '23:00:00'
),
(
    gen_random_uuid(),
    'Sunset Sports Center',
    '456 Beach Avenue',
    'San Francisco',
    'CA',
    'USA',
    '94121',
    37.78925,
    -122.4334,
    ST_SetSRID(ST_MakePoint(-122.4334, 37.78925), 4326)::geography,
    'Recreation Center',
    false,
    6,
    true,
    true,
    true,
    false,
    false,
    true,
    '+1 (555) 234-5678',
    'contact@sunsetcenter.com',
    'https://sunsetcenter.com',
    'https://example.com/venue2.jpg',
    4.6,
    89,
    35.00,
    true,
    '05:30:00',
    '22:30:00'
),
(
    gen_random_uuid(),
    'Golden Gate Tennis Club',
    '789 Park Boulevard',
    'San Francisco',
    'CA',
    'USA',
    '94118',
    37.77025,
    -122.4564,
    ST_SetSRID(ST_MakePoint(-122.4564, 37.77025), 4326)::geography,
    'Court Complex',
    true,
    8,
    true,
    true,
    true,
    true,
    true,
    true,
    '+1 (555) 345-6789',
    'info@goldengatetennis.com',
    'https://goldengatetennis.com',
    'https://example.com/venue3.jpg',
    4.9,
    203,
    55.00,
    true,
    '06:00:00',
    '23:30:00'
);

-- =====================================================
-- 2. SAMPLE COURTS
-- =====================================================

-- Get venue IDs for court creation
DO $$
DECLARE
    venue1_id UUID;
    venue2_id UUID;
    venue3_id UUID;
BEGIN
    -- Get venue IDs
    SELECT id INTO venue1_id FROM public.venues WHERE name = 'Downtown Padel Club' LIMIT 1;
    SELECT id INTO venue2_id FROM public.venues WHERE name = 'Sunset Sports Center' LIMIT 1;
    SELECT id INTO venue3_id FROM public.venues WHERE name = 'Golden Gate Tennis Club' LIMIT 1;

    -- Create courts for Downtown Padel Club
    INSERT INTO public.courts (venue_id, name, sport_id, surface_type, is_indoor, court_number, capacity, equipment_included, special_features, is_active)
    VALUES 
    (venue1_id, 'Court 1', 'padel', 'Artificial Grass', true, 1, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue1_id, 'Court 2', 'padel', 'Artificial Grass', true, 2, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue1_id, 'Court 3', 'padel', 'Synthetic Turf', true, 3, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue1_id, 'Court 4', 'padel', 'Artificial Grass', true, 4, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true);

    -- Create courts for Sunset Sports Center
    INSERT INTO public.courts (venue_id, name, sport_id, surface_type, is_indoor, court_number, capacity, equipment_included, special_features, is_active)
    VALUES 
    (venue2_id, 'Outdoor Court 1', 'padel', 'Synthetic Turf', false, 1, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "wind_protection": true}'::jsonb, true),
    (venue2_id, 'Outdoor Court 2', 'padel', 'Synthetic Turf', false, 2, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "wind_protection": true}'::jsonb, true),
    (venue2_id, 'Tennis Court 1', 'tennis', 'Hard Court', false, 3, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED"}'::jsonb, true),
    (venue2_id, 'Tennis Court 2', 'tennis', 'Hard Court', false, 4, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED"}'::jsonb, true),
    (venue2_id, 'Basketball Court', 'basketball', 'Hard Court', false, 5, 10, '["basketballs"]'::jsonb, '{"lighting": "LED", "hoops": 2}'::jsonb, true),
    (venue2_id, 'Soccer Field', 'soccer', 'Natural Grass', false, 6, 22, '["soccer_balls"]'::jsonb, '{"lighting": "LED", "goals": 2}'::jsonb, true);

    -- Create courts for Golden Gate Tennis Club
    INSERT INTO public.courts (venue_id, name, sport_id, surface_type, is_indoor, court_number, capacity, equipment_included, special_features, is_active)
    VALUES 
    (venue3_id, 'Indoor Court 1', 'tennis', 'Hard Court', true, 1, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue3_id, 'Indoor Court 2', 'tennis', 'Hard Court', true, 2, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue3_id, 'Indoor Court 3', 'tennis', 'Clay Court', true, 3, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue3_id, 'Indoor Court 4', 'tennis', 'Clay Court', true, 4, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue3_id, 'Outdoor Court 1', 'tennis', 'Hard Court', false, 5, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED"}'::jsonb, true),
    (venue3_id, 'Outdoor Court 2', 'tennis', 'Hard Court', false, 6, 2, '["rackets", "balls"]'::jsonb, '{"lighting": "LED"}'::jsonb, true),
    (venue3_id, 'Padel Court 1', 'padel', 'Artificial Grass', true, 7, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true),
    (venue3_id, 'Padel Court 2', 'padel', 'Artificial Grass', true, 8, 4, '["rackets", "balls"]'::jsonb, '{"lighting": "LED", "temperature_controlled": true}'::jsonb, true);
END $$;

-- =====================================================
-- 3. SAMPLE MATCHES
-- =====================================================

-- Create sample matches for the next 7 days
DO $$
DECLARE
    court1_id UUID;
    court2_id UUID;
    court3_id UUID;
    sample_user_id UUID := gen_random_uuid();
    match_date DATE;
    i INTEGER;
BEGIN
    -- Get court IDs
    SELECT id INTO court1_id FROM public.courts WHERE name = 'Court 1' AND sport_id = 'padel' LIMIT 1;
    SELECT id INTO court2_id FROM public.courts WHERE name = 'Outdoor Court 1' AND sport_id = 'padel' LIMIT 1;
    SELECT id INTO court3_id FROM public.courts WHERE name = 'Padel Court 1' AND sport_id = 'padel' LIMIT 1;

    -- Create matches for the next 7 days
    FOR i IN 0..6 LOOP
        match_date := CURRENT_DATE + i;
        
        -- Morning match
        INSERT INTO public.matches (
            court_id, sport_id, match_date, match_time, duration_minutes,
            match_type, skill_level, max_players, current_players,
            total_cost, price_per_player, status, host_id, description
        ) VALUES (
            court1_id, 'padel', match_date, '09:00:00', 90,
            'casual', 'Intermediate', 4, 1,
            180.00, 45.00, 'open', sample_user_id,
            'Morning padel session - all skill levels welcome!'
        );

        -- Afternoon match
        INSERT INTO public.matches (
            court_id, sport_id, match_date, match_time, duration_minutes,
            match_type, skill_level, max_players, current_players,
            total_cost, price_per_player, status, host_id, description
        ) VALUES (
            court2_id, 'padel', match_date, '14:00:00', 90,
            'competitive', 'Advanced', 4, 0,
            200.00, 50.00, 'open', sample_user_id,
            'Competitive padel match - advanced players only'
        );

        -- Evening match
        INSERT INTO public.matches (
            court_id, sport_id, match_date, match_time, duration_minutes,
            match_type, skill_level, max_players, current_players,
            total_cost, price_per_player, status, host_id, description
        ) VALUES (
            court3_id, 'padel', match_date, '19:00:00', 90,
            'casual', 'Mixed', 4, 2,
            160.00, 40.00, 'open', sample_user_id,
            'Evening padel fun - mixed skill levels'
        );
    END LOOP;
END $$;

-- =====================================================
-- 4. SAMPLE SPORTS DATA
-- =====================================================

-- Insert sample sports data (this would typically be in a sports table)
-- For now, we'll create some sample user sport profiles

-- =====================================================
-- 5. SAMPLE USER ACHIEVEMENTS
-- =====================================================

INSERT INTO public.user_achievements (
    user_id, achievement_type, achievement_name, achievement_description, icon_url, points
) VALUES 
(gen_random_uuid(), 'first_match', 'First Match', 'Played your first match!', '🏆', 10),
(gen_random_uuid(), 'win_streak_5', 'Hot Streak', 'Won 5 matches in a row!', '🔥', 50),
(gen_random_uuid(), 'matches_10', 'Regular Player', 'Played 10 matches', '⭐', 25),
(gen_random_uuid(), 'matches_50', 'Veteran', 'Played 50 matches', '💪', 100),
(gen_random_uuid(), 'matches_100', 'Centurion', 'Played 100 matches', '👑', 250);

-- =====================================================
-- 6. SAMPLE NOTIFICATIONS
-- =====================================================

INSERT INTO public.notifications (
    user_id, type, title, message, match_id, is_read
) VALUES 
(gen_random_uuid(), 'match_reminder', 'Match Reminder', 'Your padel match starts in 1 hour!', NULL, false),
(gen_random_uuid(), 'match_invite', 'Match Invite', 'You have been invited to join a padel match', NULL, false),
(gen_random_uuid(), 'payment_success', 'Payment Confirmed', 'Your payment for the match has been processed', NULL, true);

-- =====================================================
-- 7. SAMPLE COURT REVIEWS
-- =====================================================

DO $$
DECLARE
    court1_id UUID;
    court2_id UUID;
    sample_user_id UUID := gen_random_uuid();
BEGIN
    -- Get court IDs
    SELECT id INTO court1_id FROM public.courts WHERE name = 'Court 1' AND sport_id = 'padel' LIMIT 1;
    SELECT id INTO court2_id FROM public.courts WHERE name = 'Outdoor Court 1' AND sport_id = 'padel' LIMIT 1;

    -- Create sample reviews
    INSERT INTO public.court_reviews (court_id, user_id, rating, comment)
    VALUES 
    (court1_id, sample_user_id, 5, 'Excellent court with great lighting and temperature control. Highly recommended!'),
    (court2_id, sample_user_id, 4, 'Good outdoor court with nice synthetic turf. Can get windy sometimes but overall great experience.'),
    (court1_id, gen_random_uuid(), 5, 'Perfect indoor court for padel. Clean and well-maintained.'),
    (court2_id, gen_random_uuid(), 4, 'Nice outdoor setting with good facilities. Parking can be limited during peak hours.');
END $$;

-- =====================================================
-- 8. SAMPLE LEADERBOARD DATA
-- =====================================================

INSERT INTO public.leaderboard (
    user_id, region, rank, points, rank_change, trend, period, period_start, period_end
) VALUES 
(gen_random_uuid(), 'global', 1, 2500, 0, 'stable', 'all_time', NULL, NULL),
(gen_random_uuid(), 'global', 2, 2400, 1, 'up', 'all_time', NULL, NULL),
(gen_random_uuid(), 'global', 3, 2300, -1, 'down', 'all_time', NULL, NULL),
(gen_random_uuid(), 'global', 4, 2200, 2, 'up', 'all_time', NULL, NULL),
(gen_random_uuid(), 'global', 5, 2100, 0, 'stable', 'all_time', NULL, NULL),
(gen_random_uuid(), 'san_francisco', 1, 2450, 0, 'stable', 'all_time', NULL, NULL),
(gen_random_uuid(), 'san_francisco', 2, 2350, 1, 'up', 'all_time', NULL, NULL),
(gen_random_uuid(), 'san_francisco', 3, 2250, -1, 'down', 'all_time', NULL, NULL);

-- =====================================================
-- 9. SAMPLE ACTIVITY LOG
-- =====================================================

INSERT INTO public.activity_log (
    user_id, activity_type, activity_description, metadata, ip_address, user_agent
) VALUES 
(gen_random_uuid(), 'login', 'User logged in', '{"method": "email"}'::jsonb, '192.168.1.1'::inet, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
(gen_random_uuid(), 'match_joined', 'User joined a padel match', '{"match_id": "123e4567-e89b-12d3-a456-426614174000"}'::jsonb, '192.168.1.2'::inet, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
(gen_random_uuid(), 'profile_updated', 'User updated their profile', '{"fields": ["bio", "location"]}'::jsonb, '192.168.1.3'::inet, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
(gen_random_uuid(), 'match_completed', 'User completed a match', '{"match_id": "123e4567-e89b-12d3-a456-426614174001", "result": "won"}'::jsonb, '192.168.1.4'::inet, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)');

-- =====================================================
-- 10. SAMPLE USER PREFERENCES
-- =====================================================

INSERT INTO public.user_preferences (
    user_id, theme, language, timezone, currency, distance_unit,
    notifications_enabled, email_notifications, push_notifications, sound_enabled, vibration_enabled
) VALUES 
(gen_random_uuid(), 'light', 'en', 'America/Los_Angeles', 'USD', 'km', true, true, true, true, true),
(gen_random_uuid(), 'dark', 'es', 'America/Los_Angeles', 'USD', 'miles', true, false, true, false, true),
(gen_random_uuid(), 'light', 'en', 'America/Los_Angeles', 'USD', 'km', false, false, false, true, false);

-- =====================================================
-- 11. SAMPLE PROFILE VISIBILITY SETTINGS
-- =====================================================

INSERT INTO public.profile_visibility (
    user_id, show_email, show_phone, show_location, show_stats, show_matches, show_skill_level, profile_searchable
) VALUES 
(gen_random_uuid(), false, false, true, true, true, true, true),
(gen_random_uuid(), true, true, true, true, true, true, true),
(gen_random_uuid(), false, false, false, false, false, false, false);

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
