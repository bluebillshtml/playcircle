-- =====================================================
-- CHAT SYSTEM MIGRATION
-- =====================================================
-- This migration adds the chat system tables and functionality
-- for the Messages experience feature

-- =====================================================
-- 1. CHATS TABLE
-- =====================================================
-- Each court session gets one chat
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_session_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create unique constraint to ensure one chat per session
CREATE UNIQUE INDEX idx_chats_session_unique ON chats(court_session_id);

-- Create index for performance
CREATE INDEX idx_chats_active ON chats(is_active, last_message_at DESC);
CREATE INDEX idx_chats_session ON chats(court_session_id);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CHAT MEMBERS TABLE
-- =====================================================
-- Tracks who is in each chat
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate memberships
CREATE UNIQUE INDEX idx_chat_members_unique ON chat_members(chat_id, user_id);

-- Create indexes for performance
CREATE INDEX idx_chat_members_user ON chat_members(user_id, is_active);
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id, is_active);
CREATE INDEX idx_chat_members_unread ON chat_members(user_id, unread_count) WHERE unread_count > 0;

-- Enable RLS
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. MESSAGES TABLE
-- =====================================================
-- Stores all chat messages
CREATE TABLE messages (
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

-- Create indexes for performance
CREATE INDEX idx_messages_chat_time ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_active ON messages(chat_id, is_deleted, created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- CHATS POLICIES
CREATE POLICY "Users can only see chats they belong to" ON chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update chats they belong to" ON chats
  FOR UPDATE USING (
    id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- CHAT MEMBERS POLICIES
CREATE POLICY "Users can see members of chats they belong to" ON chat_members
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own chat memberships" ON chat_members
  FOR ALL USING (user_id = auth.uid());

-- MESSAGES POLICIES
CREATE POLICY "Users can only see messages from their chats" ON messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to chats they belong to" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create chat when match is created
CREATE OR REPLACE FUNCTION create_chat_for_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Create chat for the new match
  INSERT INTO chats (court_session_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create chat when match is created
CREATE TRIGGER trigger_create_chat_for_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_for_match();

-- Function to automatically add user to chat when they join a match
CREATE OR REPLACE FUNCTION add_user_to_match_chat()
RETURNS TRIGGER AS $$
DECLARE
  match_chat_id UUID;
BEGIN
  -- Get the chat ID for this match
  SELECT c.id INTO match_chat_id
  FROM chats c
  WHERE c.court_session_id = NEW.match_id;
  
  -- Add user to chat if chat exists
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

-- Trigger to add user to chat when they join a match
CREATE TRIGGER trigger_add_user_to_match_chat
  AFTER INSERT ON user_matches
  FOR EACH ROW
  EXECUTE FUNCTION add_user_to_match_chat();

-- Function to remove user from chat when they leave a match
CREATE OR REPLACE FUNCTION remove_user_from_match_chat()
RETURNS TRIGGER AS $$
DECLARE
  match_chat_id UUID;
BEGIN
  -- Get the chat ID for this match
  SELECT c.id INTO match_chat_id
  FROM chats c
  WHERE c.court_session_id = OLD.match_id;
  
  -- Remove user from chat if chat exists
  IF match_chat_id IS NOT NULL THEN
    UPDATE chat_members 
    SET is_active = false, left_at = NOW()
    WHERE chat_id = match_chat_id AND user_id = OLD.user_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to remove user from chat when they leave a match
CREATE TRIGGER trigger_remove_user_from_match_chat
  AFTER DELETE ON user_matches
  FOR EACH ROW
  EXECUTE FUNCTION remove_user_from_match_chat();

-- Function to update chat last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the chat's last_message_at timestamp
  UPDATE chats 
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  -- Update unread counts for all other members
  UPDATE chat_members 
  SET unread_count = unread_count + 1
  WHERE chat_id = NEW.chat_id 
    AND user_id != NEW.user_id 
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update chat when message is sent
CREATE TRIGGER trigger_update_chat_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- Function to mark messages as read and reset unread count
CREATE OR REPLACE FUNCTION mark_messages_read(p_chat_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Update the user's last_read_at and reset unread count
  UPDATE chat_members 
  SET last_read_at = NOW(),
      unread_count = 0
  WHERE chat_id = p_chat_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's chats with last message and unread count
CREATE OR REPLACE FUNCTION get_user_chats(p_user_id UUID)
RETURNS TABLE (
  chat_id UUID,
  court_session_id UUID,
  session_title TEXT,
  session_date DATE,
  session_time TIME,
  session_duration INTEGER,
  court_name TEXT,
  sport_id TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_user_name TEXT,
  unread_count INTEGER,
  member_count BIGINT,
  is_happening_soon BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as chat_id,
    c.court_session_id,
    CONCAT(co.name, ' – ', TO_CHAR(m.match_date, 'Mon DD'), ' ', TO_CHAR(m.match_time, 'HH12:MI AM')) as session_title,
    m.match_date as session_date,
    m.match_time as session_time,
    m.duration_minutes as session_duration,
    co.name as court_name,
    m.sport_id,
    msg.content as last_message_content,
    c.last_message_at,
    p.full_name as last_message_user_name,
    COALESCE(cm_user.unread_count, 0) as unread_count,
    (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id AND is_active = true) as member_count,
    (m.match_date <= CURRENT_DATE + INTERVAL '2 days' AND m.match_date >= CURRENT_DATE) as is_happening_soon
  FROM chats c
  JOIN matches m ON c.court_session_id = m.id
  LEFT JOIN courts co ON m.court_id = co.id
  LEFT JOIN chat_members cm_user ON c.id = cm_user.chat_id AND cm_user.user_id = p_user_id
  LEFT JOIN messages msg ON c.id = msg.chat_id AND msg.created_at = c.last_message_at
  LEFT JOIN profiles p ON msg.user_id = p.id
  WHERE cm_user.is_active = true
    AND c.is_active = true
    AND (
      -- Show sessions that are ongoing or ended ≤14 days ago
      (m.match_date >= CURRENT_DATE - INTERVAL '14 days') OR
      (m.status IN ('open', 'in_progress'))
    )
  ORDER BY 
    CASE WHEN c.last_message_at IS NOT NULL THEN c.last_message_at ELSE m.created_at END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger to new tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON chat_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- This section can be uncommented for testing purposes
/*
-- Create a sample chat for existing matches
DO $$
DECLARE
  match_record RECORD;
  chat_id UUID;
BEGIN
  -- Create chats for existing matches that don't have them
  FOR match_record IN 
    SELECT m.id, m.host_id 
    FROM matches m 
    LEFT JOIN chats c ON m.id = c.court_session_id 
    WHERE c.id IS NULL
  LOOP
    -- Create chat
    INSERT INTO chats (court_session_id) 
    VALUES (match_record.id) 
    RETURNING id INTO chat_id;
    
    -- Add host to chat
    INSERT INTO chat_members (chat_id, user_id)
    VALUES (chat_id, match_record.host_id);
  END LOOP;
END $$;
*/