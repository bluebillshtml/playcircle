-- =====================================================
-- CHAT SYSTEM VALIDATION SCRIPT
-- =====================================================
-- Run this script to validate that the chat system is properly set up
-- and working as expected

-- =====================================================
-- 1. TABLE EXISTENCE VALIDATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  -- Check if all required tables exist
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('chats', 'chat_members', 'messages');
  
  IF table_count = 3 THEN
    RAISE NOTICE '✅ All chat system tables exist';
  ELSE
    RAISE EXCEPTION '❌ Missing chat system tables. Expected 3, found %', table_count;
  END IF;
END $$;

-- =====================================================
-- 2. TRIGGER VALIDATION
-- =====================================================

DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  -- Check if all required triggers exist
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name IN (
      'trigger_create_chat_for_match',
      'trigger_add_user_to_match_chat',
      'trigger_remove_user_from_match_chat',
      'trigger_update_chat_last_message'
    );
  
  IF trigger_count = 4 THEN
    RAISE NOTICE '✅ All chat system triggers exist';
  ELSE
    RAISE EXCEPTION '❌ Missing chat system triggers. Expected 4, found %', trigger_count;
  END IF;
END $$;

-- =====================================================
-- 3. FUNCTION VALIDATION
-- =====================================================

DO $$
DECLARE
  function_count INTEGER;
BEGIN
  -- Check if all required functions exist
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'create_chat_for_match',
      'add_user_to_match_chat',
      'remove_user_from_match_chat',
      'update_chat_last_message',
      'mark_messages_read',
      'get_user_chats'
    );
  
  IF function_count = 6 THEN
    RAISE NOTICE '✅ All chat system functions exist';
  ELSE
    RAISE EXCEPTION '❌ Missing chat system functions. Expected 6, found %', function_count;
  END IF;
END $$;

-- =====================================================
-- 4. RLS POLICY VALIDATION
-- =====================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check if RLS policies exist for all tables
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('chats', 'chat_members', 'messages');
  
  IF policy_count >= 6 THEN
    RAISE NOTICE '✅ RLS policies are configured (% policies found)', policy_count;
  ELSE
    RAISE EXCEPTION '❌ Insufficient RLS policies. Expected at least 6, found %', policy_count;
  END IF;
END $$;

-- =====================================================
-- 5. INDEX VALIDATION
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  -- Check if essential indexes exist
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename IN ('chats', 'chat_members', 'messages')
    AND schemaname = 'public';
  
  IF index_count >= 10 THEN
    RAISE NOTICE '✅ Database indexes are configured (% indexes found)', index_count;
  ELSE
    RAISE NOTICE '⚠️  Limited indexes found (% indexes). Consider running chat_system_indexes.sql for better performance', index_count;
  END IF;
END $$;

-- =====================================================
-- 6. FUNCTIONAL TESTING
-- =====================================================

-- Test 1: Chat creation trigger
DO $$
DECLARE
  test_match_id UUID;
  test_chat_id UUID;
  test_user_id UUID;
BEGIN
  -- Get a test user (or create one if needed)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION '❌ No profiles found. Please ensure base setup is complete.';
  END IF;
  
  -- Create a test match
  INSERT INTO matches (
    host_id, 
    sport_id, 
    match_date, 
    match_time, 
    duration_minutes, 
    max_players, 
    skill_level, 
    match_type, 
    description
  ) VALUES (
    test_user_id,
    'padel',
    CURRENT_DATE + 1,
    '18:00',
    90,
    4,
    'Intermediate',
    'casual',
    'Test match for chat validation'
  ) RETURNING id INTO test_match_id;
  
  -- Check if chat was created
  SELECT id INTO test_chat_id
  FROM chats 
  WHERE court_session_id = test_match_id;
  
  IF test_chat_id IS NOT NULL THEN
    RAISE NOTICE '✅ Chat creation trigger working correctly';
    
    -- Clean up test data
    DELETE FROM chats WHERE id = test_chat_id;
    DELETE FROM matches WHERE id = test_match_id;
  ELSE
    RAISE EXCEPTION '❌ Chat creation trigger not working';
  END IF;
END $$;

-- Test 2: get_user_chats function
DO $$
DECLARE
  test_user_id UUID;
  chat_count INTEGER;
BEGIN
  -- Get a test user
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test the get_user_chats function
    SELECT COUNT(*) INTO chat_count
    FROM get_user_chats(test_user_id);
    
    RAISE NOTICE '✅ get_user_chats function working (returned % chats)', chat_count;
  ELSE
    RAISE NOTICE '⚠️  Cannot test get_user_chats function - no profiles found';
  END IF;
END $$;

-- =====================================================
-- 7. PERFORMANCE CHECK
-- =====================================================

-- Check table sizes
SELECT 
  'Table Sizes' as check_type,
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM (
  VALUES ('chats'), ('chat_members'), ('messages')
) AS t(tablename)
UNION ALL
-- Check index sizes
SELECT 
  'Index Sizes' as check_type,
  indexname as tablename,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes 
WHERE tablename IN ('chats', 'chat_members', 'messages')
  AND schemaname = 'public'
ORDER BY check_type, size DESC;

-- =====================================================
-- 8. SUMMARY REPORT
-- =====================================================

SELECT 
  'VALIDATION SUMMARY' as report_section,
  'Chat system database setup validation completed' as message,
  NOW() as validated_at;

-- Show current table record counts
SELECT 
  'CURRENT DATA' as report_section,
  'chats' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM chats
UNION ALL
SELECT 
  'CURRENT DATA' as report_section,
  'chat_members' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM chat_members
UNION ALL
SELECT 
  'CURRENT DATA' as report_section,
  'messages' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_deleted = false) as active_count
FROM messages;

RAISE NOTICE '🎉 Chat system validation completed successfully!';