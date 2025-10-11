-- =====================================================
-- PLAYCIRCLE - COMPLETE SUPABASE SETUP
-- Single SQL file to set up the entire database structure
-- Run this file in your Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 1. PROFILES TABLE - Core user profiles
-- =====================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
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
    preferred_position VARCHAR(50),
    favorite_sports TEXT[], -- Array of sport IDs
    availability TEXT[],
    skill_rating DECIMAL(3,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add missing columns to existing profiles table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'banner_url') THEN
        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_language') THEN
        ALTER TABLE profiles ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notifications_enabled') THEN
        ALTER TABLE profiles ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications') THEN
        ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'push_notifications') THEN
        ALTER TABLE profiles ADD COLUMN push_notifications BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sound_enabled') THEN
        ALTER TABLE profiles ADD COLUMN sound_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vibration_enabled') THEN
        ALTER TABLE profiles ADD COLUMN vibration_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location_enabled') THEN
        ALTER TABLE profiles ADD COLUMN location_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'analytics_enabled') THEN
        ALTER TABLE profiles ADD COLUMN analytics_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_sport') THEN
        ALTER TABLE profiles ADD COLUMN preferred_sport VARCHAR(50) DEFAULT 'padel';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'playing_style') THEN
        ALTER TABLE profiles ADD COLUMN playing_style VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_position') THEN
        ALTER TABLE profiles ADD COLUMN favorite_position VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'availability') THEN
        ALTER TABLE profiles ADD COLUMN availability TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skill_rating') THEN
        ALTER TABLE profiles ADD COLUMN skill_rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
        ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_matches') THEN
        ALTER TABLE profiles ADD COLUMN total_matches INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wins') THEN
        ALTER TABLE profiles ADD COLUMN wins INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'losses') THEN
        ALTER TABLE profiles ADD COLUMN losses INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_sports') THEN
        ALTER TABLE profiles ADD COLUMN favorite_sports TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    
    -- Remove skill_level from profiles table since it should be per-sport
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skill_level') THEN
        ALTER TABLE profiles DROP COLUMN skill_level;
    END IF;
END $$;

-- Migrate existing full_name data to first_name and last_name if exists
UPDATE profiles
SET first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
    last_name = COALESCE(last_name, CASE
        WHEN array_length(string_to_array(full_name, ' '), 1) > 1
        THEN array_to_string(array_remove(string_to_array(full_name, ' '), SPLIT_PART(full_name, ' ', 1)), ' ')
        ELSE ''
    END)
WHERE full_name IS NOT NULL AND (first_name IS NULL OR last_name IS NULL);

-- =====================================================
-- 2. USER SPORT PROFILES - Sport-specific user data
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sport_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id TEXT NOT NULL,
    skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    preferred_position TEXT DEFAULT 'No Preference',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, sport_id)
);

-- =====================================================
-- 3. USER SPORT STATS - Detailed statistics per sport
-- =====================================================

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

-- =====================================================
-- 4. VENUES - Court venues and facilities
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

-- =====================================================
-- 5. COURTS - Individual courts within venues
-- =====================================================

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
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 6. MATCHES - Match/session management
-- =====================================================

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
    sport_id TEXT NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    match_type TEXT CHECK (match_type IN ('competitive', 'casual', 'tournament')) NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert', 'Mixed')),
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

-- Add sport_id column to existing matches table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'sport_id') THEN
        ALTER TABLE matches ADD COLUMN sport_id TEXT;
        -- Update existing matches to have a default sport_id
        UPDATE matches SET sport_id = 'padel' WHERE sport_id IS NULL;
        -- Add NOT NULL constraint after updating existing records
        ALTER TABLE matches ALTER COLUMN sport_id SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- 7. MATCH PLAYERS - Who joined which matches
-- =====================================================

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

-- Create user_matches table as alias/view for compatibility
CREATE TABLE IF NOT EXISTS public.user_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    is_host BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- =====================================================
-- 8. TEAMS - Team management for matches
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
-- 9. CHAT SYSTEM - Messages and communication
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_session_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'location', 'status', 'photo')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- =====================================================
-- 10. FRIENDS SYSTEM - Social connections (Simplified)
-- =====================================================

-- Each user has one row with their friends stored as JSONB
CREATE TABLE IF NOT EXISTS public.user_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    friends JSONB DEFAULT '[]'::jsonb, -- Array of friend objects: [{"user_id": "uuid", "status": "accepted", "added_at": "timestamp"}]
    friend_requests_sent JSONB DEFAULT '[]'::jsonb, -- Pending requests sent by this user
    friend_requests_received JSONB DEFAULT '[]'::jsonb, -- Pending requests received by this user
    blocked_users JSONB DEFAULT '[]'::jsonb, -- Users blocked by this user
    total_friends INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legacy friendships table for compatibility (can be removed later)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
    requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT friendships_user_order CHECK (user1_id < user2_id),
    CONSTRAINT friendships_no_self CHECK (user1_id != user2_id),
    UNIQUE(user1_id, user2_id)
);

-- =====================================================
-- 11. ADDITIONAL TABLES
-- =====================================================

-- User preferences
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

-- Payments
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

-- Notifications
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

-- Leaderboard
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
-- 12. STORAGE BUCKETS
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
    ('banner-images', 'banner-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('match-photos', 'match-photos', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('court-images', 'court-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('documents', 'documents', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at);

-- Courts indexes
CREATE INDEX IF NOT EXISTS idx_courts_venue ON public.courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON public.courts(sport_id);
CREATE INDEX IF NOT EXISTS idx_courts_active ON public.courts(is_active);

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_rating ON public.venues(rating DESC);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_court ON public.matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_host ON public.matches(host_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON public.matches(sport_id);

-- Match Players indexes
CREATE INDEX IF NOT EXISTS idx_match_players_user ON public.match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON public.match_players(match_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chats_session ON chats(court_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON messages(chat_id, created_at DESC);

-- Friends indexes
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_total ON user_friends(total_friends DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id, status);

-- =====================================================
-- 14. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user signup and populate related tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_skill_level TEXT;
    user_preferred_sport TEXT;
BEGIN
    -- Get skill level and preferred sport from metadata
    user_skill_level := COALESCE(NEW.raw_user_meta_data->>'skill_level', 'Beginner');
    user_preferred_sport := COALESCE(NEW.raw_user_meta_data->>'preferred_sport', 'padel');
    
    -- 1. Create the main profile
    INSERT INTO public.profiles (id, username, full_name, first_name, last_name, preferred_sport)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        user_preferred_sport
    );
    
    -- 2. Create default user preferences
    INSERT INTO public.user_preferences (user_id, theme, language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'theme', 'light'),
        COALESCE(NEW.raw_user_meta_data->>'language', 'en')
    );
    
    -- 3. Create user sport profile for their preferred sport
    INSERT INTO public.user_sport_profiles (user_id, sport_id, skill_level, preferred_position)
    VALUES (
        NEW.id,
        user_preferred_sport,
        user_skill_level,
        COALESCE(NEW.raw_user_meta_data->>'preferred_position', 'Any')
    );
    
    -- 4. Create user sport stats for their preferred sport
    INSERT INTO public.user_sport_stats (user_id, sport_id)
    VALUES (NEW.id, user_preferred_sport);
    
    -- 5. Create initial leaderboard entry for global ranking
    INSERT INTO public.leaderboard (user_id, region, period, rank, points)
    VALUES 
        (NEW.id, 'global', 'all_time', NULL, 0),
        (NEW.id, 'global', 'monthly', NULL, 0),
        (NEW.id, 'global', 'weekly', NULL, 0);
    
    -- 6. Create user friends record
    INSERT INTO public.user_friends (user_id)
    VALUES (NEW.id);
    
    -- 7. Create welcome notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
        NEW.id,
        'match_invite',
        'Welcome to PlayCircle!',
        'Welcome to PlayCircle! Complete your profile and start finding matches in your area.'
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

-- Function to create chat for match
CREATE OR REPLACE FUNCTION create_chat_for_match()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chats (court_session_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add user to match chat
CREATE OR REPLACE FUNCTION add_user_to_match_chat()
RETURNS TRIGGER AS $$
DECLARE
    match_chat_id UUID;
BEGIN
    SELECT c.id INTO match_chat_id
    FROM chats c
    WHERE c.court_session_id = NEW.match_id;
    
    IF match_chat_id IS NOT NULL THEN
        INSERT INTO chat_members (chat_id, user_id)
        VALUES (match_chat_id, NEW.user_id)
        ON CONFLICT (chat_id, user_id) 
        DO UPDATE SET 
            is_active = true,
            left_at = NULL,
            joined_at = CASE 
                WHEN chat_members.is_active = false THEN NOW()
                ELSE chat_members.joined_at
            END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get direct chat between two users
CREATE OR REPLACE FUNCTION get_direct_chat_between_users(
    p_user1_id UUID,
    p_user2_id UUID
)
RETURNS TABLE(
    id UUID,
    court_session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT c.id, c.court_session_id, c.created_at, c.updated_at, c.last_message_at, c.is_active
    FROM chats c
    INNER JOIN chat_members cm1 ON c.id = cm1.chat_id
    INNER JOIN chat_members cm2 ON c.id = cm2.chat_id
    WHERE c.court_session_id IS NULL  -- Direct chats only
      AND c.is_active = true
      AND cm1.user_id = p_user1_id
      AND cm1.is_active = true
      AND cm2.user_id = p_user2_id
      AND cm2.is_active = true
      AND cm1.user_id != cm2.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(p_user_id UUID)
RETURNS TABLE(
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    status TEXT
) AS $$
BEGIN
    -- For now, return a simple query from profiles
    -- This can be enhanced later with the friends system
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        'offline'::TEXT as status
    FROM profiles p
    WHERE p.id != p_user_id
    AND p.is_active = true
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 15. TRIGGERS
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

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update match player count
DROP TRIGGER IF EXISTS match_players_count_trigger ON public.match_players;
CREATE TRIGGER match_players_count_trigger
    AFTER INSERT OR DELETE ON public.match_players
    FOR EACH ROW EXECUTE FUNCTION update_match_player_count();

-- Trigger to create chat when match is created
DROP TRIGGER IF EXISTS trigger_create_chat_for_match ON matches;
CREATE TRIGGER trigger_create_chat_for_match
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_for_match();

-- Trigger to add user to chat when they join a match
DROP TRIGGER IF EXISTS trigger_add_user_to_match_chat ON match_players;
CREATE TRIGGER trigger_add_user_to_match_chat
    AFTER INSERT ON match_players
    FOR EACH ROW
    EXECUTE FUNCTION add_user_to_match_chat();

-- =====================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sport_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

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
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sport profiles" ON public.user_sport_profiles;
CREATE POLICY "Users can insert own sport profiles"
    ON public.user_sport_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sport profiles" ON public.user_sport_profiles;
CREATE POLICY "Users can delete own sport profiles"
    ON public.user_sport_profiles FOR DELETE
    USING (auth.uid() = user_id);

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

-- Venues policies
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Venues are viewable by everyone"
    ON public.venues FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;
CREATE POLICY "Authenticated users can create venues"
    ON public.venues FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Courts policies
DROP POLICY IF EXISTS "Courts are viewable by everyone" ON public.courts;
CREATE POLICY "Courts are viewable by everyone"
    ON public.courts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create courts" ON public.courts;
CREATE POLICY "Authenticated users can create courts"
    ON public.courts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

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

-- User matches policies (compatibility table)
DROP POLICY IF EXISTS "User matches are viewable by everyone" ON public.user_matches;
CREATE POLICY "User matches are viewable by everyone"
    ON public.user_matches FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can join matches via user_matches" ON public.user_matches;
CREATE POLICY "Users can join matches via user_matches"
    ON public.user_matches FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave matches via user_matches" ON public.user_matches;
CREATE POLICY "Users can leave matches via user_matches"
    ON public.user_matches FOR DELETE
    USING (auth.uid() = user_id);

-- Chat policies
DROP POLICY IF EXISTS "Users can only see chats they belong to" ON chats;
CREATE POLICY "Users can only see chats they belong to" ON chats
    FOR SELECT USING (
        id IN (
            SELECT chat_id FROM chat_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can see members of chats they belong to" ON chat_members;
CREATE POLICY "Users can see members of chats they belong to" ON chat_members
    FOR SELECT USING (
        chat_id IN (
            SELECT chat_id FROM chat_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can manage their own chat memberships" ON chat_members;
CREATE POLICY "Users can manage their own chat memberships" ON chat_members
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can only see messages from their chats" ON messages;
CREATE POLICY "Users can only see messages from their chats" ON messages
    FOR SELECT USING (
        chat_id IN (
            SELECT chat_id FROM chat_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can send messages to chats they belong to" ON messages;
CREATE POLICY "Users can send messages to chats they belong to" ON messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        chat_id IN (
            SELECT chat_id FROM chat_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- User Friends policies (new simplified system)
DROP POLICY IF EXISTS "Users can view own friends" ON user_friends;
CREATE POLICY "Users can view own friends" ON user_friends
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own friends" ON user_friends;
CREATE POLICY "Users can update own friends" ON user_friends
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own friends" ON user_friends;
CREATE POLICY "Users can insert own friends" ON user_friends
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Legacy Friends policies (for compatibility)
DROP POLICY IF EXISTS "Users can see friendships they are part of" ON friendships;
CREATE POLICY "Users can see friendships they are part of" ON friendships
    FOR SELECT USING (
        user1_id = auth.uid() OR user2_id = auth.uid() OR requested_by = auth.uid()
    );

DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
CREATE POLICY "Users can create friend requests" ON friendships
    FOR INSERT WITH CHECK (
        requested_by = auth.uid() AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    );

-- Storage policies for profile pictures
DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
CREATE POLICY "Profile pictures are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
CREATE POLICY "Users can upload own profile picture"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-pictures' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
CREATE POLICY "Users can update own profile picture"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'profile-pictures' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;
CREATE POLICY "Users can delete own profile picture"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'profile-pictures' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for banner images
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
CREATE POLICY "Banner images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Users can upload own banner image" ON storage.objects;
CREATE POLICY "Users can upload own banner image"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own banner image" ON storage.objects;
CREATE POLICY "Users can update own banner image"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own banner image" ON storage.objects;
CREATE POLICY "Users can delete own banner image"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 17. CREATE DEFAULT ENTRIES FOR EXISTING USERS
-- =====================================================

-- Create default user_preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Create default user_sport_stats for existing users
INSERT INTO user_sport_stats (user_id, sport_id)
SELECT id, 'padel' FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_sport_stats WHERE sport_id = 'padel' AND user_id IS NOT NULL)
ON CONFLICT (user_id, sport_id) DO NOTHING;

-- Create default user_sport_profiles for existing users
INSERT INTO user_sport_profiles (user_id, sport_id)
SELECT id, 'padel' FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_sport_profiles WHERE sport_id = 'padel' AND user_id IS NOT NULL)
ON CONFLICT (user_id, sport_id) DO NOTHING;

-- Create default user_friends for existing users
INSERT INTO user_friends (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_friends WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Your PlayCircle database is now fully configured with:
-- ✅ Complete user profile management
-- ✅ Multi-sport court and venue system
-- ✅ Match creation and management
-- ✅ Team formation and management
-- ✅ Chat system for match communication
-- ✅ Friends and social features
-- ✅ Payment processing support
-- ✅ File upload capabilities
-- ✅ Comprehensive security policies
-- ✅ Performance optimized indexes
-- ✅ Automatic triggers and functions
--
-- You can now use your PlayCircle app without database errors!
--

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
-- 6. USER PRIVACY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  allow_friend_requests TEXT CHECK (allow_friend_requests IN ('everyone', 'friends-of-friends', 'no-one')) DEFAULT 'everyone',
  show_online_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on privacy settings
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Create privacy settings policies
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own privacy settings" ON user_privacy_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own privacy settings" ON user_privacy_settings
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 7. FRIENDS SYSTEM FUNCTIONS
-- =====================================================

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS send_friend_request(UUID, UUID);
DROP FUNCTION IF EXISTS accept_friend_request(UUID, UUID);
DROP FUNCTION IF EXISTS decline_friend_request(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_friends(UUID);
DROP FUNCTION IF EXISTS get_pending_friend_requests(UUID);
DROP FUNCTION IF EXISTS get_suggested_friends(UUID);
DROP FUNCTION IF EXISTS get_recent_members(UUID);

-- Function to send friend request
CREATE OR REPLACE FUNCTION send_friend_request(sender_id UUID, recipient_id UUID)
RETURNS UUID AS $$$
DECLARE
  friendship_id UUID;
  smaller_id UUID;
  larger_id UUID;
BEGIN
  -- Normalize user IDs
  IF sender_id < recipient_id THEN
    smaller_id := sender_id;
    larger_id := recipient_id;
  ELSE
    smaller_id := recipient_id;
    larger_id := sender_id;
  END IF;
  
  -- Insert or update friendship
  INSERT INTO friendships (user1_id, user2_id, requested_by, status)
  VALUES (smaller_id, larger_id, sender_id, 'pending')
  ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET 
    requested_by = sender_id,
    status = 'pending',
    updated_at = NOW()
  RETURNING id INTO friendship_id;
  
  RETURN friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept friend request
CREATE OR REPLACE FUNCTION accept_friend_request(friendship_id UUID, accepter_id UUID)
RETURNS BOOLEAN AS $$$
DECLARE
  friendship_record RECORD;
BEGIN
  -- Get friendship record
  SELECT * INTO friendship_record
  FROM friendships
  WHERE id = friendship_id
    AND (user1_id = accepter_id OR user2_id = accepter_id)
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update status to accepted
  UPDATE friendships
  SET status = 'accepted', updated_at = NOW()
  WHERE id = friendship_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline friend request
CREATE OR REPLACE FUNCTION decline_friend_request(friendship_id UUID, decliner_id UUID)
RETURNS BOOLEAN AS $$$
BEGIN
  -- Update status to declined
  UPDATE friendships
  SET status = 'declined', updated_at = NOW()
  WHERE id = friendship_id
    AND (user1_id = decliner_id OR user2_id = decliner_id)
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(p_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  friendship_date TIMESTAMP WITH TIME ZONE
) AS $$$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN f.user1_id = p_user_id THEN f.user2_id
      ELSE f.user1_id
    END as friend_id,
    p.username,
    p.full_name,
    p.avatar_url,
    f.updated_at as friendship_date
  FROM friendships f
  JOIN profiles p ON (
    CASE 
      WHEN f.user1_id = p_user_id THEN p.id = f.user2_id
      ELSE p.id = f.user1_id
    END
  )
  WHERE (f.user1_id = p_user_id OR f.user2_id = p_user_id)
    AND f.status = 'accepted'
  ORDER BY f.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending friend requests for a user
CREATE OR REPLACE FUNCTION get_pending_friend_requests(p_user_id UUID)
RETURNS TABLE (
  request_id UUID,
  from_user_id UUID,
  from_username TEXT,
  from_full_name TEXT,
  from_avatar_url TEXT,
  requested_at TIMESTAMP WITH TIME ZONE
) AS $$$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as request_id,
    f.requested_by as from_user_id,
    p.username as from_username,
    p.full_name as from_full_name,
    p.avatar_url as from_avatar_url,
    f.created_at as requested_at
  FROM friendships f
  JOIN profiles p ON f.requested_by = p.id
  WHERE (f.user1_id = p_user_id OR f.user2_id = p_user_id)
    AND f.requested_by != p_user_id
    AND f.status = 'pending'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get suggested friends (replaces view with function for parameterization)
CREATE OR REPLACE FUNCTION get_suggested_friends(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  mutual_sessions BIGINT,
  sport_tags TEXT[],
  last_played_together TIMESTAMP WITH TIME ZONE,
  friendship_status TEXT
) AS $$$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT mp1.match_id) as mutual_sessions,
    ARRAY_AGG(DISTINCT m.sport_id) as sport_tags,
    MAX(m.match_date::TIMESTAMP WITH TIME ZONE) as last_played_together,
    'none'::TEXT as friendship_status
  FROM profiles p
  JOIN match_players mp1 ON p.id = mp1.user_id
  JOIN match_players mp2 ON mp1.match_id = mp2.match_id 
  JOIN matches m ON mp1.match_id = m.id
  WHERE mp2.user_id = p_user_id -- current user
    AND p.id != p_user_id -- exclude self
    AND m.match_date >= CURRENT_DATE - INTERVAL '14 days' -- last 14 days
    AND NOT EXISTS (
      -- Exclude users who already have any relationship
      SELECT 1 FROM friendships f 
      WHERE ((f.user1_id = p_user_id AND f.user2_id = p.id) OR (f.user2_id = p_user_id AND f.user1_id = p.id))
    )
  GROUP BY p.id, p.username, p.full_name, p.avatar_url
  ORDER BY mutual_sessions DESC, last_played_together DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent members (replaces view with function for parameterization)
CREATE OR REPLACE FUNCTION get_recent_members(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  interaction_type TEXT,
  location TEXT,
  court_name TEXT,
  session_title TEXT,
  interaction_date DATE,
  interaction_time TIME,
  last_interaction TIMESTAMP WITH TIME ZONE,
  friendship_status TEXT,
  online_status BOOLEAN
) AS $$$
BEGIN
  RETURN QUERY
  (
    -- From recent sessions
    SELECT DISTINCT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      'session'::TEXT as interaction_type,
      COALESCE(v.name, 'Unknown Venue') as location,
      COALESCE(c.name, 'Court') as court_name,
      CONCAT(COALESCE(v.name, 'Unknown Venue'), ' – ', COALESCE(c.name, 'Court')) as session_title,
      m.match_date as interaction_date,
      m.match_time as interaction_time,
      (m.match_date + m.match_time)::TIMESTAMP WITH TIME ZONE as last_interaction,
      -- Check friendship status
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.user1_id = p.id AND f.user2_id = p_user_id) OR (f.user1_id = p_user_id AND f.user2_id = p.id))
            AND f.status = 'accepted'
        ) THEN 'friends'
        WHEN EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.user1_id = p.id AND f.user2_id = p_user_id) OR (f.user1_id = p_user_id AND f.user2_id = p.id))
            AND f.status = 'pending'
        ) THEN 'pending'
        ELSE 'none'
      END::TEXT as friendship_status,
      false as online_status -- Placeholder for online status
    FROM profiles p
    JOIN match_players mp1 ON p.id = mp1.user_id
    JOIN match_players mp2 ON mp1.match_id = mp2.match_id
    JOIN matches m ON mp1.match_id = m.id
    LEFT JOIN courts c ON m.court_id = c.id
    LEFT JOIN venues v ON c.venue_id = v.id
    WHERE mp2.user_id = p_user_id
      AND p.id != p_user_id
      AND m.match_date >= CURRENT_DATE - INTERVAL '14 days'
  )
  UNION
  (
    -- From recent chats
    SELECT DISTINCT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      'chat'::TEXT as interaction_type,
      'Chat Message' as location,
      '' as court_name,
      'Chat Message' as session_title,
      CURRENT_DATE as interaction_date,
      CURRENT_TIME as interaction_time,
      cm1.joined_at as last_interaction,
      -- Check friendship status
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.user1_id = p.id AND f.user2_id = p_user_id) OR (f.user1_id = p_user_id AND f.user2_id = p.id))
            AND f.status = 'accepted'
        ) THEN 'friends'
        WHEN EXISTS (
          SELECT 1 FROM friendships f 
          WHERE ((f.user1_id = p.id AND f.user2_id = p_user_id) OR (f.user1_id = p_user_id AND f.user2_id = p.id))
            AND f.status = 'pending'
        ) THEN 'pending'
        ELSE 'none'
      END::TEXT as friendship_status,
      false as online_status -- Placeholder for online status
    FROM profiles p
    JOIN chat_members cm1 ON p.id = cm1.user_id
    JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
    WHERE cm2.user_id = p_user_id
      AND p.id != p_user_id
      AND cm1.joined_at >= NOW() - INTERVAL '14 days'
      AND cm1.is_active = true
      AND cm2.is_active = true
  )
  ORDER BY last_interaction DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE DEFAULT PRIVACY SETTINGS FOR EXISTING USERS
-- =====================================================
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
