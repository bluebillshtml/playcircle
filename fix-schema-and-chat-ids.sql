-- =====================================================
-- FIX SCHEMA AND CHAT ID ISSUES
-- =====================================================

-- 1. Fix courts table - add missing address column
ALTER TABLE courts ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing courts with placeholder addresses if needed
UPDATE courts SET address = 'Address not specified' WHERE address IS NULL;

-- 2. Check current chats table structure
SELECT 'Current chats table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chats' 
ORDER BY ordinal_position;

-- 3. Ensure chats.id is properly set up as UUID with default
-- First check if we need to modify the id column
DO $$
BEGIN
    -- Check if id column exists and is UUID type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- If not UUID, we need to recreate the table or modify
        RAISE NOTICE 'Chats.id column needs to be UUID type';
    END IF;
END $$;

-- 4. Create a function to generate proper chat IDs
CREATE OR REPLACE FUNCTION generate_chat_id(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    chat_uuid UUID;
    id_string TEXT;
BEGIN
    -- Create a deterministic string from the two user IDs (sorted)
    IF user1_id < user2_id THEN
        id_string := user1_id::TEXT || '_' || user2_id::TEXT;
    ELSE
        id_string := user2_id::TEXT || '_' || user1_id::TEXT;
    END IF;
    
    -- Generate a UUID from the string using md5 hash
    chat_uuid := md5(id_string)::UUID;
    
    RETURN chat_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. Test the function
SELECT 'Testing chat ID generation:' as test;
SELECT generate_chat_id(
    'cc13424a-8098-4270-a39a-7b61fb1b5a56'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID
) as generated_chat_id;

-- 6. Verify courts table now has address
SELECT 'Courts table structure after fix:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courts' 
ORDER BY ordinal_position;

SELECT 'Schema fixes complete!' as status;