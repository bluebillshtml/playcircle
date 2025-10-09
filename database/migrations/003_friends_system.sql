-- =====================================================
-- FRIENDS SYSTEM MIGRATION
-- =====================================================
-- This migration adds the friends system tables and functionality
-- for the Friends page feature

-- =====================================================
-- 1. FRIENDSHIPS TABLE
-- =====================================================
-- Manages friend relationships between users
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user1_id < user2_id for consistent ordering
  CONSTRAINT friendships_user_order CHECK (user1_id < user2_id),
  -- Prevent self-friendship
  CONSTRAINT friendships_no_self CHECK (user1_id != user2_id),
  -- Unique friendship per pair
  UNIQUE(user1_id, user2_id)
);

-- Create indexes for performance
CREATE INDEX idx_friendships_user1 ON friendships(user1_id, status);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id, status);
CREATE INDEX idx_friendships_status ON friendships(status, created_at DESC);
CREATE INDEX idx_friendships_requested_by ON friendships(requested_by, status);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USER PRIVACY SETTINGS TABLE
-- =====================================================
-- Manages user privacy preferences for friends functionality
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  allow_friend_requests TEXT CHECK (allow_friend_requests IN ('everyone', 'friends-of-friends', 'no-one')) DEFAULT 'everyone',
  show_online_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_privacy_settings_friend_requests ON user_privacy_settings(allow_friend_requests);

-- Enable RLS
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. SUGGESTED FRIENDS VIEW
-- =====================================================
-- Efficiently calculates suggested friends based on recent interactions
CREATE OR REPLACE VIEW suggested_friends_view AS
SELECT DISTINCT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  COUNT(DISTINCT mp1.match_id) as mutual_sessions,
  MAX(m.match_date) as last_played_together,
  ARRAY_AGG(DISTINCT m.sport_id) as sport_tags,
  -- Check if already friends or has pending request
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM friendships f 
      WHERE ((f.user1_id = p.id AND f.user2_id = $1) OR (f.user1_id = $1 AND f.user2_id = p.id))
    ) THEN 'existing_relationship'
    ELSE 'none'
  END as friendship_status
FROM profiles p
JOIN match_players mp1 ON p.id = mp1.user_id
JOIN match_players mp2 ON mp1.match_id = mp2.match_id 
JOIN matches m ON mp1.match_id = m.id
WHERE mp2.user_id = $1 -- current user
  AND p.id != $1 -- exclude self
  AND m.match_date >= CURRENT_DATE - INTERVAL '14 days' -- last 14 days
  AND NOT EXISTS (
    -- Exclude users who already have any relationship
    SELECT 1 FROM friendships f 
    WHERE ((f.user1_id = $1 AND f.user2_id = p.id) OR (f.user2_id = $1 AND f.user1_id = p.id))
  )
GROUP BY p.id, p.username, p.full_name, p.avatar_url
ORDER BY mutual_sessions DESC, last_played_together DESC;

-- =====================================================
-- 4. RECENT MEMBERS VIEW
-- =====================================================
-- Shows recent members from both sessions and chats
CREATE OR REPLACE VIEW recent_members_view AS
(
  -- From recent sessions
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    'session' as interaction_type,
    COALESCE(v.name, 'Unknown Venue') as location,
    COALESCE(c.name, 'Court') as court_name,
    m.match_date as interaction_date,
    m.match_time as interaction_time,
    m.created_at as last_interaction,
    -- Check friendship status
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM friendships f 
        WHERE ((f.user1_id = p.id AND f.user2_id = $1) OR (f.user1_id = $1 AND f.user2_id = p.id))
          AND f.status = 'accepted'
      ) THEN 'friends'
      WHEN EXISTS (
        SELECT 1 FROM friendships f 
        WHERE ((f.user1_id = p.id AND f.user2_id = $1) OR (f.user1_id = $1 AND f.user2_id = p.id))
          AND f.status = 'pending'
      ) THEN 'pending'
      ELSE 'none'
    END as friendship_status
  FROM profiles p
  JOIN match_players mp1 ON p.id = mp1.user_id
  JOIN match_players mp2 ON mp1.match_id = mp2.match_id
  JOIN matches m ON mp1.match_id = m.id
  LEFT JOIN courts c ON m.court_id = c.id
  LEFT JOIN venues v ON c.venue_id = v.id
  WHERE mp2.user_id = $1
    AND p.id != $1
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
    'chat' as interaction_type,
    'Chat Message' as location,
    '' as court_name,
    CURRENT_DATE as interaction_date,
    CURRENT_TIME as interaction_time,
    cm1.joined_at as last_interaction,
    -- Check friendship status
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM friendships f 
        WHERE ((f.user1_id = p.id AND f.user2_id = $1) OR (f.user1_id = $1 AND f.user2_id = p.id))
          AND f.status = 'accepted'
      ) THEN 'friends'
      WHEN EXISTS (
        SELECT 1 FROM friendships f 
        WHERE ((f.user1_id = p.id AND f.user2_id = $1) OR (f.user1_id = $1 AND f.user2_id = p.id))
          AND f.status = 'pending'
      ) THEN 'pending'
      ELSE 'none'
    END as friendship_status
  FROM profiles p
  JOIN chat_members cm1 ON p.id = cm1.user_id
  JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
  WHERE cm2.user_id = $1
    AND p.id != $1
    AND cm1.joined_at >= NOW() - INTERVAL '14 days'
    AND cm1.is_active = true
    AND cm2.is_active = true
)
ORDER BY last_interaction DESC;

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- FRIENDSHIPS POLICIES
CREATE POLICY "Users can see friendships they are part of" ON friendships
  FOR SELECT USING (
    user1_id = auth.uid() OR user2_id = auth.uid() OR requested_by = auth.uid()
  );

CREATE POLICY "Users can create friend requests" ON friendships
  FOR INSERT WITH CHECK (
    requested_by = auth.uid() AND
    (user1_id = auth.uid() OR user2_id = auth.uid())
  );

CREATE POLICY "Users can update friendships they are part of" ON friendships
  FOR UPDATE USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

CREATE POLICY "Users can delete friendships they are part of" ON friendships
  FOR DELETE USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

-- USER PRIVACY SETTINGS POLICIES
CREATE POLICY "Users can view their own privacy settings" ON user_privacy_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own privacy settings" ON user_privacy_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own privacy settings" ON user_privacy_settings
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to ensure proper friendship ordering
CREATE OR REPLACE FUNCTION normalize_friendship()
RETURNS TRIGGER AS $
DECLARE
  smaller_id UUID;
  larger_id UUID;
BEGIN
  -- Ensure user1_id is always smaller than user2_id
  IF NEW.user1_id > NEW.user2_id THEN
    smaller_id := NEW.user2_id;
    larger_id := NEW.user1_id;
  ELSE
    smaller_id := NEW.user1_id;
    larger_id := NEW.user2_id;
  END IF;
  
  NEW.user1_id := smaller_id;
  NEW.user2_id := larger_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to normalize friendship before insert/update
CREATE TRIGGER trigger_normalize_friendship
  BEFORE INSERT OR UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION normalize_friendship();

-- Function to create default privacy settings for new users
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO user_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create privacy settings when user profile is created
CREATE TRIGGER trigger_create_privacy_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_privacy_settings();

-- Function to check friend request permissions
CREATE OR REPLACE FUNCTION can_send_friend_request(sender_id UUID, recipient_id UUID)
RETURNS BOOLEAN AS $
DECLARE
  recipient_setting TEXT;
  are_friends_of_friends BOOLEAN := false;
BEGIN
  -- Get recipient's privacy setting
  SELECT allow_friend_requests INTO recipient_setting
  FROM user_privacy_settings
  WHERE user_id = recipient_id;
  
  -- Default to 'everyone' if no setting found
  IF recipient_setting IS NULL THEN
    recipient_setting := 'everyone';
  END IF;
  
  -- Check permission based on setting
  CASE recipient_setting
    WHEN 'everyone' THEN
      RETURN true;
    WHEN 'no-one' THEN
      RETURN false;
    WHEN 'friends-of-friends' THEN
      -- Check if they have mutual friends
      SELECT EXISTS (
        SELECT 1 FROM friendships f1
        JOIN friendships f2 ON (
          (f1.user1_id = f2.user1_id OR f1.user1_id = f2.user2_id OR 
           f1.user2_id = f2.user1_id OR f1.user2_id = f2.user2_id)
          AND f1.id != f2.id
        )
        WHERE f1.status = 'accepted' AND f2.status = 'accepted'
          AND ((f1.user1_id = sender_id OR f1.user2_id = sender_id))
          AND ((f2.user1_id = recipient_id OR f2.user2_id = recipient_id))
      ) INTO are_friends_of_friends;
      
      RETURN are_friends_of_friends;
    ELSE
      RETURN false;
  END CASE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send friend request
CREATE OR REPLACE FUNCTION send_friend_request(sender_id UUID, recipient_id UUID)
RETURNS UUID AS $
DECLARE
  friendship_id UUID;
  smaller_id UUID;
  larger_id UUID;
BEGIN
  -- Check if sender can send request
  IF NOT can_send_friend_request(sender_id, recipient_id) THEN
    RAISE EXCEPTION 'Friend request not allowed due to privacy settings';
  END IF;
  
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept friend request
CREATE OR REPLACE FUNCTION accept_friend_request(friendship_id UUID, accepter_id UUID)
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline friend request
CREATE OR REPLACE FUNCTION decline_friend_request(friendship_id UUID, decliner_id UUID)
RETURNS BOOLEAN AS $
BEGIN
  -- Update status to declined
  UPDATE friendships
  SET status = 'declined', updated_at = NOW()
  WHERE id = friendship_id
    AND (user1_id = decliner_id OR user2_id = decliner_id)
    AND status = 'pending';
  
  RETURN FOUND;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(p_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  friendship_date TIMESTAMP WITH TIME ZONE
) AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending friend requests for a user
CREATE OR REPLACE FUNCTION get_pending_friend_requests(p_user_id UUID)
RETURNS TABLE (
  request_id UUID,
  from_user_id UUID,
  from_username TEXT,
  from_full_name TEXT,
  from_avatar_url TEXT,
  requested_at TIMESTAMP WITH TIME ZONE
) AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

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
) AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

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
) AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger to new tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INDEXES FOR VIEWS (Additional Performance)
-- =====================================================

-- Additional indexes to support the views efficiently
CREATE INDEX IF NOT EXISTS idx_match_players_user_match ON match_players(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_sport ON matches(match_date, sport_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_active ON chat_members(user_id, is_active, joined_at);

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- This section can be uncommented for testing purposes
/*
-- Create default privacy settings for existing users
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
*/