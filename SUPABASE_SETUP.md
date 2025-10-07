# Supabase Setup Guide for PlayCircle

This document outlines the required Supabase database schema and configuration for the PlayCircle app.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update the `.env.local` file with your credentials

## Environment Variables

Create a `.env.local` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### 1. Profiles Table

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  favorite_sports TEXT[], -- Array of sport IDs
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. User Sport Profiles Table

```sql
-- Create user sport profiles table
CREATE TABLE user_sport_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  preferred_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sport_id)
);

-- Enable RLS
ALTER TABLE user_sport_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own sport profiles" ON user_sport_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sport profiles" ON user_sport_profiles
  FOR ALL USING (auth.uid() = user_id);
```

### 3. User Stats Table

```sql
-- Create user stats table
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  total_hours_played DECIMAL(8,2) DEFAULT 0.00,
  favorite_position TEXT DEFAULT 'Any',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sport_id)
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Courts Table

```sql
-- Create courts table
CREATE TABLE courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  amenities TEXT[],
  sports TEXT[] NOT NULL, -- Array of supported sport IDs
  price_per_hour DECIMAL(8,2),
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active courts" ON courts
  FOR SELECT USING (is_active = TRUE);
```

### 5. Matches Table

```sql
-- Create matches table
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES courts(id),
  host_id UUID REFERENCES profiles(id),
  sport_id TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 1,
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert', 'Mixed')),
  match_type TEXT CHECK (match_type IN ('casual', 'competitive')),
  price_per_player DECIMAL(8,2),
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view open matches" ON matches
  FOR SELECT USING (status IN ('open', 'full', 'in_progress'));

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = host_id);
```

### 6. User Matches Table (Join Table)

```sql
-- Create user matches table
CREATE TABLE user_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Enable RLS
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own match participations" ON user_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join matches" ON user_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave matches" ON user_matches
  FOR DELETE USING (auth.uid() = user_id);
```

## Database Functions and Triggers

### 1. Auto-create Profile Trigger

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Update Timestamps Trigger

```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_sport_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Sample Data

### Courts Sample Data

```sql
-- Insert sample courts
INSERT INTO courts (name, address, city, state, sports, price_per_hour, image_url) VALUES
('Downtown Padel Club', '123 Main St', 'San Francisco', 'CA', ARRAY['padel'], 40.00, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop'),
('Sunset Sports Center', '456 Ocean Ave', 'San Francisco', 'CA', ARRAY['tennis', 'basketball'], 35.00, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=300&fit=crop'),
('Elite Tennis Academy', '789 Park Blvd', 'San Francisco', 'CA', ARRAY['tennis'], 50.00, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=300&fit=crop');
```

## Authentication Setup

1. Enable email authentication in Supabase Auth settings
2. Configure email templates (optional)
3. Set up OAuth providers if needed (Google, Apple, etc.)

## Storage Setup (Optional)

If you want to support user avatars:

1. Create a storage bucket named `avatars`
2. Set up RLS policies for the bucket
3. Configure upload policies

```sql
-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Testing the Setup

1. Run the app and try to sign up a new user
2. Check if the profile is created automatically
3. Complete the onboarding process
4. Verify that user sport profiles are created
5. Check that all data is properly stored in the database

## Notes

- The app is designed to work without Supabase (it will show errors in console but continue functioning)
- All database operations are wrapped in try-catch blocks
- The onboarding process will complete successfully even if database operations fail
- This allows for development and testing without a fully configured Supabase instance

## Troubleshooting

### Common Issues

1. **RLS Policies**: Make sure Row Level Security policies are properly configured
2. **User Metadata**: Ensure user metadata is being passed correctly during signup
3. **Triggers**: Verify that the profile creation trigger is working
4. **Permissions**: Check that the anon key has the necessary permissions

### Debug Mode

To enable debug mode for Supabase operations, add this to your `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_DEBUG=true
```

This will log all database operations to the console for debugging purposes.