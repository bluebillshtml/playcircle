-- =====================================================
-- TEST AND VERIFY JSONB FUNCTIONS
-- Run this script to verify the JSONB functions are working
-- =====================================================

-- First, verify the functions exist
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'send_friend_request_jsonb',
    'accept_friend_request_jsonb',
    'decline_friend_request_jsonb'
  )
ORDER BY routine_name;

-- If the functions don't exist or need to be recreated, uncomment and run this:
-- DROP FUNCTION IF EXISTS send_friend_request_jsonb(UUID, UUID);
-- DROP FUNCTION IF EXISTS accept_friend_request_jsonb(UUID, UUID);
-- DROP FUNCTION IF EXISTS decline_friend_request_jsonb(UUID, UUID);

-- Then run the migration file: 004_user_friends_jsonb_functions.sql

-- =====================================================
-- TEST QUERIES
-- =====================================================

-- Check current state of user_friends table
SELECT 
  user_id,
  jsonb_array_length(COALESCE(friends, '[]'::jsonb)) as friends_count,
  jsonb_array_length(COALESCE(friend_requests_sent, '[]'::jsonb)) as requests_sent_count,
  jsonb_array_length(COALESCE(friend_requests_received, '[]'::jsonb)) as requests_received_count,
  total_friends,
  updated_at
FROM user_friends
ORDER BY updated_at DESC
LIMIT 10;

-- View all pending friend requests
SELECT 
  uf.user_id,
  p.username,
  p.full_name,
  jsonb_pretty(uf.friend_requests_received) as received_requests,
  jsonb_pretty(uf.friend_requests_sent) as sent_requests
FROM user_friends uf
LEFT JOIN profiles p ON p.id = uf.user_id
WHERE 
  jsonb_array_length(COALESCE(uf.friend_requests_received, '[]'::jsonb)) > 0
  OR jsonb_array_length(COALESCE(uf.friend_requests_sent, '[]'::jsonb)) > 0
ORDER BY uf.updated_at DESC;

-- =====================================================
-- MANUAL TEST (Replace UUIDs with real user IDs)
-- =====================================================

-- Example: Send a friend request (replace with actual UUIDs)
-- SELECT send_friend_request_jsonb(
--   'sender-uuid-here'::uuid,
--   'recipient-uuid-here'::uuid
-- );

-- Example: Accept a friend request (replace with actual UUIDs)
-- SELECT accept_friend_request_jsonb(
--   'accepter-uuid-here'::uuid,
--   'sender-uuid-here'::uuid
-- );

-- Example: Decline a friend request (replace with actual UUIDs)
-- SELECT decline_friend_request_jsonb(
--   'decliner-uuid-here'::uuid,
--   'sender-uuid-here'::uuid
-- );

