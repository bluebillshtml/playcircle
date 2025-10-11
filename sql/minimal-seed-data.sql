-- =====================================================
-- PLAYCIRCLE - MINIMAL SEED DATA
-- Basic venue and court data for testing
-- Run this after complete-supabase-setup.sql
-- 
-- Note: User-related data (profiles, matches, chats, etc.) 
-- should be created through the app after user authentication
-- =====================================================

-- =====================================================
-- 1. SAMPLE VENUES
-- =====================================================

INSERT INTO public.venues (
    id, name, address, city, country,
    latitude, longitude, location,
    venue_type, is_indoor, number_of_courts,
    base_price_per_hour, is_active
) VALUES 
(
    gen_random_uuid(),
    'Test Padel Club',
    '123 Test Street',
    'Test City',
    'USA',
    37.7749,
    -122.4194,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'Sports Club',
    true,
    2,
    40.00,
    true
),
(
    gen_random_uuid(),
    'Downtown Recreation Center',
    '456 Main Avenue',
    'Test City',
    'USA',
    37.7849,
    -122.4094,
    ST_SetSRID(ST_MakePoint(-122.4094, 37.7849), 4326)::geography,
    'Recreation Center',
    false,
    4,
    35.00,
    true
);

-- =====================================================
-- 2. SAMPLE COURTS
-- =====================================================

INSERT INTO public.courts (
    id, venue_id, name, sport_id, surface_type,
    is_indoor, court_number, capacity, is_active
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM venues WHERE name = 'Test Padel Club' LIMIT 1),
    'Court 1',
    'padel',
    'Artificial Grass',
    true,
    1,
    4,
    true
),
(
    gen_random_uuid(),
    (SELECT id FROM venues WHERE name = 'Test Padel Club' LIMIT 1),
    'Court 2',
    'padel',
    'Artificial Grass',
    true,
    2,
    4,
    true
),
(
    gen_random_uuid(),
    (SELECT id FROM venues WHERE name = 'Downtown Recreation Center' LIMIT 1),
    'Outdoor Court A',
    'padel',
    'Clay',
    false,
    1,
    4,
    true
),
(
    gen_random_uuid(),
    (SELECT id FROM venues WHERE name = 'Downtown Recreation Center' LIMIT 1),
    'Outdoor Court B',
    'padel',
    'Clay',
    false,
    2,
    4,
    true
);

-- =====================================================
-- 3. SAMPLE FRIEND DATA FOR EXISTING USER
-- =====================================================
-- Update the existing user's friends data to include some test friends

-- First, create auth users for the test friends (skip if they already exist)
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, created_at, updated_at
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'alex@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
),
(
    '22222222-2222-2222-2222-222222222222',
    'sarah@example.com', 
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
),
(
    '33333333-3333-3333-3333-333333333333',
    'mike@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
),
-- Additional searchable users
(
    '44444444-4444-4444-4444-444444444444',
    'emma@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
),
(
    '55555555-5555-5555-5555-555555555555',
    'james@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
),
(
    '66666666-6666-6666-6666-666666666666',
    'lisa@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Then add the sample profiles for testing
INSERT INTO public.profiles (
    id, username, full_name, first_name, last_name,
    favorite_sports, onboarding_completed, is_active
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'alex_padel',
    'Alex Rodriguez',
    'Alex',
    'Rodriguez',
    ARRAY['padel'],
    true,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'sarah_tennis',
    'Sarah Johnson',
    'Sarah',
    'Johnson',
    ARRAY['padel', 'tennis'],
    true,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'mike_sports',
    'Mike Chen',
    'Mike',
    'Chen',
    ARRAY['padel'],
    true,
    true
),
-- Additional searchable users for testing search functionality
(
    '44444444-4444-4444-4444-444444444444',
    'emma_player',
    'Emma Wilson',
    'Emma',
    'Wilson',
    ARRAY['tennis'],
    true,
    true
),
(
    '55555555-5555-5555-5555-555555555555',
    'james_court',
    'James Brown',
    'James',
    'Brown',
    ARRAY['padel', 'basketball'],
    true,
    true
),
(
    '66666666-6666-6666-6666-666666666666',
    'lisa_sport',
    'Lisa Davis',
    'Lisa',
    'Davis',
    ARRAY['tennis', 'padel'],
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Add corresponding user_sport_profiles
INSERT INTO public.user_sport_profiles (
    user_id, sport_id, skill_level, preferred_position,
    total_matches, wins, losses, points
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'padel',
    'Advanced',
    'Left Side',
    25,
    18,
    7,
    450
),
(
    '22222222-2222-2222-2222-222222222222',
    'padel',
    'Intermediate',
    'Right Side',
    15,
    9,
    6,
    280
),
(
    '33333333-3333-3333-3333-333333333333',
    'padel',
    'Beginner',
    'Left Side',
    8,
    3,
    5,
    120
),
-- Additional searchable users sport profiles
(
    '44444444-4444-4444-4444-444444444444',
    'tennis',
    'Intermediate',
    'Baseline',
    12,
    7,
    5,
    200
),
(
    '55555555-5555-5555-5555-555555555555',
    'padel',
    'Advanced',
    'Right Side',
    30,
    22,
    8,
    520
),
(
    '66666666-6666-6666-6666-666666666666',
    'tennis',
    'Beginner',
    'All Court',
    6,
    2,
    4,
    80
)
ON CONFLICT (user_id, sport_id) DO NOTHING;

-- Update your existing user's friends data
UPDATE public.user_friends 
SET 
    friends = jsonb_build_array(
        jsonb_build_object(
            'user_id', '11111111-1111-1111-1111-111111111111',
            'status', 'accepted',
            'added_at', NOW() - INTERVAL '2 weeks'
        ),
        jsonb_build_object(
            'user_id', '22222222-2222-2222-2222-222222222222',
            'status', 'accepted',
            'added_at', NOW() - INTERVAL '1 week'
        )
    ),
    friend_requests_received = jsonb_build_array(
        jsonb_build_object(
            'user_id', '33333333-3333-3333-3333-333333333333',
            'status', 'pending',
            'requested_at', NOW() - INTERVAL '2 days'
        )
    ),
    total_friends = 2,
    updated_at = NOW()
WHERE user_id = 'cc13424a-8098-4270-a39a-7b61fb1b5a56';

-- Add reciprocal friend relationships
INSERT INTO public.user_friends (
    user_id, friends, friend_requests_sent, friend_requests_received, 
    blocked_users, total_friends
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    jsonb_build_array(
        jsonb_build_object(
            'user_id', 'cc13424a-8098-4270-a39a-7b61fb1b5a56',
            'status', 'accepted',
            'added_at', NOW() - INTERVAL '2 weeks'
        )
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1
),
(
    '22222222-2222-2222-2222-222222222222',
    jsonb_build_array(
        jsonb_build_object(
            'user_id', 'cc13424a-8098-4270-a39a-7b61fb1b5a56',
            'status', 'accepted',
            'added_at', NOW() - INTERVAL '1 week'
        )
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1
),
(
    '33333333-3333-3333-3333-333333333333',
    '[]'::jsonb,
    jsonb_build_array(
        jsonb_build_object(
            'user_id', 'cc13424a-8098-4270-a39a-7b61fb1b5a56',
            'status', 'pending',
            'requested_at', NOW() - INTERVAL '2 days'
        )
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    0
)
ON CONFLICT (user_id) DO UPDATE SET
    friends = EXCLUDED.friends,
    friend_requests_sent = EXCLUDED.friend_requests_sent,
    total_friends = EXCLUDED.total_friends,
    updated_at = NOW();

-- =====================================================
-- 4. DATABASE FUNCTION FOR FRIENDS (JSONB VERSION)
-- =====================================================
-- Drop and recreate the function to work with our user_friends JSONB structure

DROP FUNCTION IF EXISTS get_user_friends(UUID);

CREATE OR REPLACE FUNCTION get_user_friends(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  favorite_sports TEXT[],
  status TEXT,
  added_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.first_name::TEXT,
    p.last_name::TEXT,
    p.avatar_url,
    p.favorite_sports,
    (friend_data->>'status')::TEXT as status,
    (friend_data->>'added_at')::TIMESTAMP WITH TIME ZONE as added_at
  FROM user_friends uf
  CROSS JOIN jsonb_array_elements(uf.friends) AS friend_data
  JOIN profiles p ON p.id = (friend_data->>'user_id')::UUID
  WHERE uf.user_id = p_user_id
    AND friend_data->>'status' = 'accepted'
  ORDER BY (friend_data->>'added_at')::TIMESTAMP WITH TIME ZONE DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FIX CHAT RLS POLICIES (REMOVE INFINITE RECURSION)
-- =====================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can only see chats they belong to" ON chats;
DROP POLICY IF EXISTS "Users can see members of chats they belong to" ON chat_members;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can see chats they belong to" ON chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.chat_id = chats.id 
            AND cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

CREATE POLICY "Users can insert direct chats" ON chats
    FOR INSERT WITH CHECK (
        court_session_id IS NULL -- Only allow direct chats for now
    );

CREATE POLICY "Users can see chat members" ON chat_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM chat_members cm2 
            WHERE cm2.chat_id = chat_members.chat_id 
            AND cm2.user_id = auth.uid() 
            AND cm2.is_active = true
        )
    );

CREATE POLICY "Users can insert chat members" ON chat_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.chat_id = chat_members.chat_id 
            AND cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that data was inserted correctly
SELECT 'Seed data inserted successfully!' as status;

SELECT 'Venues: ' || COUNT(*) as venues_count FROM venues;
SELECT 'Courts: ' || COUNT(*) as courts_count FROM courts;
SELECT 'Profiles: ' || COUNT(*) as profiles_count FROM profiles;
SELECT 'User Friends: ' || COUNT(*) as user_friends_count FROM user_friends;
SELECT 'User Sport Profiles: ' || COUNT(*) as sport_profiles_count FROM user_sport_profiles;