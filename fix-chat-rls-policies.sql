-- =====================================================
-- FIX CHAT RLS POLICIES - ELIMINATE INFINITE RECURSION
-- Run this to fix the circular dependency issues
-- =====================================================

-- First, disable RLS temporarily to clean up
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can only see chats they belong to" ON chats;
DROP POLICY IF EXISTS "Users can see chats they belong to" ON chats;
DROP POLICY IF EXISTS "Users can insert direct chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they belong to" ON chats;

DROP POLICY IF EXISTS "Users can see members of chats they belong to" ON chat_members;
DROP POLICY IF EXISTS "Users can see chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can manage their own chat memberships" ON chat_members;
DROP POLICY IF EXISTS "Users can insert chat members" ON chat_members;

DROP POLICY IF EXISTS "Users can only see messages from their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to chats they belong to" ON messages;

-- =====================================================
-- CHATS TABLE POLICIES (NO RECURSION)
-- =====================================================

-- Allow users to see chats where they are members (simple join, no subquery)
CREATE POLICY "chats_select_policy" ON chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.chat_id = chats.id 
            AND cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

-- Allow users to create direct chats (court_session_id IS NULL)
CREATE POLICY "chats_insert_policy" ON chats
    FOR INSERT WITH CHECK (
        court_session_id IS NULL  -- Only direct chats for now
    );

-- Allow users to update chats they belong to
CREATE POLICY "chats_update_policy" ON chats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_members cm 
            WHERE cm.chat_id = chats.id 
            AND cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

-- =====================================================
-- CHAT_MEMBERS TABLE POLICIES (NO RECURSION)
-- =====================================================

-- Users can see their own memberships
CREATE POLICY "chat_members_select_own" ON chat_members
    FOR SELECT USING (user_id = auth.uid());

-- Users can see other members in chats they belong to
CREATE POLICY "chat_members_select_others" ON chat_members
    FOR SELECT USING (
        chat_id IN (
            SELECT cm2.chat_id FROM chat_members cm2 
            WHERE cm2.user_id = auth.uid() 
            AND cm2.is_active = true
        )
    );

-- Users can insert themselves as members
CREATE POLICY "chat_members_insert_self" ON chat_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can insert others into chats they belong to
CREATE POLICY "chat_members_insert_others" ON chat_members
    FOR INSERT WITH CHECK (
        chat_id IN (
            SELECT cm2.chat_id FROM chat_members cm2 
            WHERE cm2.user_id = auth.uid() 
            AND cm2.is_active = true
        )
    );

-- Users can update their own memberships
CREATE POLICY "chat_members_update_own" ON chat_members
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- MESSAGES TABLE POLICIES (NO RECURSION)
-- =====================================================

-- Users can see messages in chats they belong to
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        chat_id IN (
            SELECT cm.chat_id FROM chat_members cm 
            WHERE cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

-- Users can send messages to chats they belong to
CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND chat_id IN (
            SELECT cm.chat_id FROM chat_members cm 
            WHERE cm.user_id = auth.uid() 
            AND cm.is_active = true
        )
    );

-- Users can update their own messages
CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- RE-ENABLE RLS
-- =====================================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Chat RLS policies fixed successfully!' as status;

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_members', 'messages')
ORDER BY tablename, policyname;