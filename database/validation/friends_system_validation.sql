-- =====================================================
-- FRIENDS SYSTEM VALIDATION
-- =====================================================
-- This file contains validation queries and tests for the friends system

-- =====================================================
-- 1. TABLE STRUCTURE VALIDATION
-- =====================================================

-- Verify friendships table structure
DO $
BEGIN
  -- Check if friendships table exists with correct columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'friendships'
  ) THEN
    RAISE EXCEPTION 'friendships table does not exist';
  END IF;
  
  -- Check required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'friendships' 
    AND column_name = 'user1_id' AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'friendships.user1_id column missing or wrong type';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'friendships' 
    AND column_name = 'status' AND data_type = 'text'
  ) THEN
    RAISE EXCEPTION 'friendships.status column missing or wrong type';
  END IF;
  
  RAISE NOTICE 'friendships table structure validation passed';
END $;

-- Verify user_privacy_settings table structure
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_privacy_settings'
  ) THEN
    RAISE EXCEPTION 'user_privacy_settings table does not exist';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_privacy_settings' 
    AND column_name = 'allow_friend_requests' AND data_type = 'text'
  ) THEN
    RAISE EXCEPTION 'user_privacy_settings.allow_friend_requests column missing or wrong type';
  END IF;
  
  RAISE NOTICE 'user_privacy_settings table structure validation passed';
END $;

-- =====================================================
-- 2. CONSTRAINT VALIDATION
-- =====================================================

-- Test friendship constraints
DO $
DECLARE
  test_user1 UUID := gen_random_uuid();
  test_user2 UUID := gen_random_uuid();
  test_user3 UUID := gen_random_uuid();
BEGIN
  -- Create test users
  INSERT INTO profiles (id, username, full_name) VALUES 
    (test_user1, 'testuser1', 'Test User 1'),
    (test_user2, 'testuser2', 'Test User 2'),
    (test_user3, 'testuser3', 'Test User 3');
  
  -- Test normal friendship creation
  INSERT INTO friendships (user1_id, user2_id, requested_by) 
  VALUES (test_user1, test_user2, test_user1);
  
  -- Test that duplicate friendship fails
  BEGIN
    INSERT INTO friendships (user1_id, user2_id, requested_by) 
    VALUES (test_user1, test_user2, test_user2);
    RAISE EXCEPTION 'Duplicate friendship should have failed';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Duplicate friendship constraint working correctly';
  END;
  
  -- Test self-friendship prevention
  BEGIN
    INSERT INTO friendships (user1_id, user2_id, requested_by) 
    VALUES (test_user1, test_user1, test_user1);
    RAISE EXCEPTION 'Self-friendship should have failed';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'Self-friendship constraint working correctly';
  END;
  
  -- Clean up test data
  DELETE FROM friendships WHERE user1_id IN (test_user1, test_user2, test_user3) 
    OR user2_id IN (test_user1, test_user2, test_user3);
  DELETE FROM profiles WHERE id IN (test_user1, test_user2, test_user3);
  
  RAISE NOTICE 'Friendship constraints validation passed';
END $;

-- =====================================================
-- 3. FUNCTION VALIDATION
-- =====================================================

-- Test friend request functions
DO $
DECLARE
  test_user1 UUID := gen_random_uuid();
  test_user2 UUID := gen_random_uuid();
  friendship_id UUID;
  can_send BOOLEAN;
BEGIN
  -- Create test users
  INSERT INTO profiles (id, username, full_name) VALUES 
    (test_user1, 'testuser1', 'Test User 1'),
    (test_user2, 'testuser2', 'Test User 2');
  
  -- Test can_send_friend_request function
  SELECT can_send_friend_request(test_user1, test_user2) INTO can_send;
  IF NOT can_send THEN
    RAISE EXCEPTION 'can_send_friend_request should return true for default settings';
  END IF;
  
  -- Test send_friend_request function
  SELECT send_friend_request(test_user1, test_user2) INTO friendship_id;
  IF friendship_id IS NULL THEN
    RAISE EXCEPTION 'send_friend_request should return friendship ID';
  END IF;
  
  -- Test accept_friend_request function
  IF NOT accept_friend_request(friendship_id, test_user2) THEN
    RAISE EXCEPTION 'accept_friend_request should return true';
  END IF;
  
  -- Verify friendship status
  IF NOT EXISTS (
    SELECT 1 FROM friendships 
    WHERE id = friendship_id AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Friendship should be accepted';
  END IF;
  
  -- Clean up test data
  DELETE FROM friendships WHERE id = friendship_id;
  DELETE FROM user_privacy_settings WHERE user_id IN (test_user1, test_user2);
  DELETE FROM profiles WHERE id IN (test_user1, test_user2);
  
  RAISE NOTICE 'Friend request functions validation passed';
END $;

-- =====================================================
-- 4. VIEW VALIDATION
-- =====================================================

-- Test suggested_friends_view (basic structure test)
DO $
BEGIN
  -- Check if view exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'suggested_friends_view'
  ) THEN
    RAISE EXCEPTION 'suggested_friends_view does not exist';
  END IF;
  
  -- Check if view has required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'suggested_friends_view' 
    AND column_name = 'mutual_sessions'
  ) THEN
    RAISE EXCEPTION 'suggested_friends_view missing mutual_sessions column';
  END IF;
  
  RAISE NOTICE 'suggested_friends_view structure validation passed';
END $;

-- Test recent_members_view (basic structure test)
DO $
BEGIN
  -- Check if view exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'recent_members_view'
  ) THEN
    RAISE EXCEPTION 'recent_members_view does not exist';
  END IF;
  
  -- Check if view has required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'recent_members_view' 
    AND column_name = 'interaction_type'
  ) THEN
    RAISE EXCEPTION 'recent_members_view missing interaction_type column';
  END IF;
  
  RAISE NOTICE 'recent_members_view structure validation passed';
END $;

-- =====================================================
-- 5. PRIVACY SETTINGS VALIDATION
-- =====================================================

-- Test privacy settings constraints
DO $
DECLARE
  test_user UUID := gen_random_uuid();
BEGIN
  -- Create test user
  INSERT INTO profiles (id, username, full_name) VALUES 
    (test_user, 'testuser', 'Test User');
  
  -- Test valid privacy setting
  INSERT INTO user_privacy_settings (user_id, allow_friend_requests) 
  VALUES (test_user, 'friends-of-friends');
  
  -- Test invalid privacy setting should fail
  BEGIN
    UPDATE user_privacy_settings 
    SET allow_friend_requests = 'invalid_value' 
    WHERE user_id = test_user;
    RAISE EXCEPTION 'Invalid privacy setting should have failed';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE 'Privacy setting constraint working correctly';
  END;
  
  -- Clean up test data
  DELETE FROM user_privacy_settings WHERE user_id = test_user;
  DELETE FROM profiles WHERE id = test_user;
  
  RAISE NOTICE 'Privacy settings validation passed';
END $;

-- =====================================================
-- 6. INDEX VALIDATION
-- =====================================================

-- Check if required indexes exist
DO $
BEGIN
  -- Check friendships indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'friendships' AND indexname = 'idx_friendships_user1'
  ) THEN
    RAISE EXCEPTION 'idx_friendships_user1 index missing';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'friendships' AND indexname = 'idx_friendships_user2'
  ) THEN
    RAISE EXCEPTION 'idx_friendships_user2 index missing';
  END IF;
  
  -- Check privacy settings indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_privacy_settings' AND indexname = 'idx_privacy_settings_friend_requests'
  ) THEN
    RAISE EXCEPTION 'idx_privacy_settings_friend_requests index missing';
  END IF;
  
  RAISE NOTICE 'Index validation passed';
END $;

-- =====================================================
-- 7. RLS POLICY VALIDATION
-- =====================================================

-- Check if RLS is enabled and policies exist
DO $
BEGIN
  -- Check if RLS is enabled on friendships
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'friendships' AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on friendships table';
  END IF;
  
  -- Check if RLS is enabled on user_privacy_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_privacy_settings' AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on user_privacy_settings table';
  END IF;
  
  -- Check if policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'friendships' AND policyname = 'Users can see friendships they are part of'
  ) THEN
    RAISE EXCEPTION 'Friendships SELECT policy missing';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_privacy_settings' AND policyname = 'Users can view their own privacy settings'
  ) THEN
    RAISE EXCEPTION 'Privacy settings SELECT policy missing';
  END IF;
  
  RAISE NOTICE 'RLS policy validation passed';
END $;

-- =====================================================
-- 8. PERFORMANCE VALIDATION
-- =====================================================

-- Test query performance (basic check)
DO $
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
BEGIN
  -- Test friendships query performance
  start_time := clock_timestamp();
  
  PERFORM COUNT(*) FROM friendships WHERE status = 'accepted';
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  IF duration > INTERVAL '1 second' THEN
    RAISE WARNING 'Friendships query took longer than expected: %', duration;
  ELSE
    RAISE NOTICE 'Friendships query performance acceptable: %', duration;
  END IF;
END $;

-- =====================================================
-- VALIDATION SUMMARY
-- =====================================================

DO $
BEGIN
  RAISE NOTICE '=== FRIENDS SYSTEM VALIDATION COMPLETE ===';
  RAISE NOTICE 'All validation tests passed successfully';
  RAISE NOTICE 'Friends system is ready for use';
END $;