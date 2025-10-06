-- =====================================================
-- PLAYCIRCLE - ERROR FIXES MIGRATION
-- Fixes the specific errors mentioned in ERRORS_AND_FIXES.md
-- =====================================================

-- =====================================================
-- 1. ADD MISSING COLUMNS TO PROFILES TABLE
-- =====================================================

-- Add new columns to profiles table if they don't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS location_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferred_sport VARCHAR(50) DEFAULT 'padel',
ADD COLUMN IF NOT EXISTS playing_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS favorite_position VARCHAR(50),
ADD COLUMN IF NOT EXISTS availability TEXT[],
ADD COLUMN IF NOT EXISTS skill_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;

-- Migrate existing full_name data to first_name and last_name if exists
UPDATE profiles
SET first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
    last_name = COALESCE(last_name, CASE
        WHEN array_length(string_to_array(full_name, ' '), 1) > 1
        THEN array_to_string(array_remove(string_to_array(full_name, ' '), SPLIT_PART(full_name, ' ', 1)), ' ')
        ELSE ''
    END)
WHERE full_name IS NOT NULL AND (first_name IS NULL OR last_name IS NULL);

-- Update updated_at timestamp to current time for existing records
UPDATE profiles
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO MATCHES TABLE
-- =====================================================

-- Add sport_id column to matches table if it doesn't exist
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS sport_id TEXT;

-- Update existing matches to have a default sport_id
UPDATE matches
SET sport_id = 'padel'
WHERE sport_id IS NULL;

-- Add NOT NULL constraint after updating existing records
ALTER TABLE matches
ALTER COLUMN sport_id SET NOT NULL;

-- =====================================================
-- 3. CREATE MISSING TABLES
-- =====================================================

-- Create user_sport_profiles table if it doesn't exist
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

-- Create user_sport_stats table if it doesn't exist
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

-- Create user_preferences table if it doesn't exist
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

-- Create profile_visibility table if it doesn't exist
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

-- Create user_blocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- Create user_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Create user_achievements table if it doesn't exist
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

-- Create activity_log table if it doesn't exist
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

-- Create user_storage_usage table if it doesn't exist
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
-- 4. ADD MISSING INDEXES
-- =====================================================

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_skill_level ON profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_visibility_user_id ON profile_visibility(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend_id ON user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_user_id ON user_storage_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_bucket_id ON user_storage_usage(bucket_id);

-- =====================================================
-- 5. ADD CHECK CONSTRAINTS
-- =====================================================

-- Add check constraints if they don't exist
DO $$
BEGIN
    -- Check if constraint exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_skill_level_check'
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_skill_level_check
        CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_gender_check'
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_gender_check
        CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say'));
    END IF;
END $$;

-- =====================================================
-- 6. CREATE DEFAULT ENTRIES FOR EXISTING USERS
-- =====================================================

-- Create default user_preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Create default profile_visibility for existing users
INSERT INTO profile_visibility (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM profile_visibility)
ON CONFLICT (user_id) DO NOTHING;

-- Create default user_sport_stats for existing users
INSERT INTO user_sport_stats (user_id, sport_id)
SELECT id, 'padel' FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_sport_stats WHERE sport_id = 'padel')
ON CONFLICT (user_id, sport_id) DO NOTHING;

-- Create default user_sport_profiles for existing users
INSERT INTO user_sport_profiles (user_id, sport_id)
SELECT id, 'padel' FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_sport_profiles WHERE sport_id = 'padel')
ON CONFLICT (user_id, sport_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
