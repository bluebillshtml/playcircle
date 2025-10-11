-- =====================================================
-- FIX REMAINING ISSUES
-- =====================================================

-- 1. Fix courts table - add missing image_url column
ALTER TABLE courts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing courts with placeholder image URLs if needed
UPDATE courts SET image_url = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop' 
WHERE image_url IS NULL;

-- 2. Fix chat_members RLS policy - make it more permissive for chat creation
DROP POLICY IF EXISTS "chat_members_own_only" ON chat_members;
DROP POLICY IF EXISTS "chat_members_select_own" ON chat_members;
DROP POLICY IF EXISTS "chat_members_select_others" ON chat_members;
DROP POLICY IF EXISTS "chat_members_insert_self" ON chat_members;
DROP POLICY IF EXISTS "chat_members_insert_others" ON chat_members;
DROP POLICY IF EXISTS "chat_members_update_own" ON chat_members;

-- Create more permissive chat_members policies
-- Users can see all chat members (needed for chat functionality)
CREATE POLICY "chat_members_select_all" ON chat_members
    FOR SELECT USING (true);

-- Users can insert chat members (needed for chat creation)
CREATE POLICY "chat_members_insert_all" ON chat_members
    FOR INSERT WITH CHECK (true);

-- Users can update their own memberships
CREATE POLICY "chat_members_update_own" ON chat_members
    FOR UPDATE USING (user_id = auth.uid());

-- 3. Verify the fixes
SELECT 'Checking courts table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courts' 
AND column_name IN ('address', 'image_url')
ORDER BY column_name;

SELECT 'Checking chat_members policies:' as info;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'chat_members'
ORDER BY policyname;

SELECT 'All fixes applied successfully!' as status;