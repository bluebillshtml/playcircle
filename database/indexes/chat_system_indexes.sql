-- =====================================================
-- CHAT SYSTEM PERFORMANCE INDEXES
-- =====================================================
-- Additional indexes for optimal chat system performance
-- Run these after the main migration for production optimization

-- =====================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =====================================================

-- Index for getting user's active chats with recent activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_user_active_recent 
ON chat_members (user_id, is_active, chat_id) 
WHERE is_active = true;

-- Index for chat list queries (user's chats ordered by last message)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_active_last_message 
ON chats (is_active, last_message_at DESC NULLS LAST) 
WHERE is_active = true;

-- Index for message pagination within chats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat_pagination 
ON messages (chat_id, is_deleted, created_at DESC) 
WHERE is_deleted = false;

-- Index for unread message queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_unread_active 
ON chat_members (user_id, unread_count, is_active) 
WHERE is_active = true AND unread_count > 0;

-- =====================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =====================================================

-- Index for active chats only (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_active_only 
ON chats (court_session_id, last_message_at DESC) 
WHERE is_active = true;

-- Index for recent messages only (last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recent 
ON messages (chat_id, created_at DESC, user_id) 
WHERE created_at > NOW() - INTERVAL '30 days' AND is_deleted = false;

-- Index for active chat members only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_active_only 
ON chat_members (chat_id, user_id, joined_at) 
WHERE is_active = true;

-- =====================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- =====================================================

-- Covering index for chat list with basic info
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_list_covering 
ON chats (is_active, last_message_at DESC) 
INCLUDE (id, court_session_id, created_at) 
WHERE is_active = true;

-- Covering index for message list with user info
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_list_covering 
ON messages (chat_id, created_at DESC) 
INCLUDE (id, user_id, content, message_type, metadata) 
WHERE is_deleted = false;

-- =====================================================
-- INDEXES FOR REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Index for real-time message subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_realtime 
ON messages (chat_id, created_at) 
WHERE is_deleted = false;

-- Index for real-time membership changes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_realtime 
ON chat_members (chat_id, updated_at DESC);

-- =====================================================
-- FOREIGN KEY PERFORMANCE INDEXES
-- =====================================================

-- These might already exist, but ensure they're optimized
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_session_fk 
ON chats (court_session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_members_user_fk 
ON chat_members (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_user_fk 
ON messages (user_id);

-- =====================================================
-- STATISTICS AND MAINTENANCE
-- =====================================================

-- Update table statistics for better query planning
ANALYZE chats;
ANALYZE chat_members;
ANALYZE messages;

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Query to check index usage (run periodically)
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
WHERE tablename IN ('chats', 'chat_members', 'messages')
ORDER BY tablename, idx_scan DESC;
*/

-- Query to check table sizes
/*
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
  pg_total_relation_size(tablename::regclass) as size_bytes
FROM (
  VALUES ('chats'), ('chat_members'), ('messages')
) AS t(tablename)
ORDER BY size_bytes DESC;
*/

-- Query to check slow queries (enable pg_stat_statements extension first)
/*
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query ILIKE '%chat%' OR query ILIKE '%message%'
ORDER BY mean_time DESC
LIMIT 10;
*/