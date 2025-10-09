-- =====================================================
-- FRIENDS SYSTEM INDEXES
-- =====================================================
-- Optimized indexes for the friends system to ensure fast queries

-- =====================================================
-- 1. FRIENDSHIPS TABLE INDEXES
-- =====================================================

-- Primary lookup indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user1_status ON friendships(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user2_status ON friendships(user2_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_status_created ON friendships(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_requested_by_status ON friendships(requested_by, status);

-- Composite index for finding user's relationships
CREATE INDEX IF NOT EXISTS idx_friendships_users_composite ON friendships(user1_id, user2_id, status);

-- Index for pending requests lookup
CREATE INDEX IF NOT EXISTS idx_friendships_pending ON friendships(status, created_at DESC) 
WHERE status = 'pending';

-- Index for accepted friendships
CREATE INDEX IF NOT EXISTS idx_friendships_accepted ON friendships(status, updated_at DESC) 
WHERE status = 'accepted';

-- =====================================================
-- 2. USER PRIVACY SETTINGS INDEXES
-- =====================================================

-- Primary lookup by user
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON user_privacy_settings(user_id);

-- Index for friend request permission filtering
CREATE INDEX IF NOT EXISTS idx_privacy_settings_friend_requests ON user_privacy_settings(allow_friend_requests);

-- Index for online status filtering
CREATE INDEX IF NOT EXISTS idx_privacy_settings_online_status ON user_privacy_settings(show_online_status);

-- Composite index for privacy checks
CREATE INDEX IF NOT EXISTS idx_privacy_settings_composite ON user_privacy_settings(user_id, allow_friend_requests, show_online_status);

-- =====================================================
-- 3. SUPPORTING INDEXES FOR VIEWS
-- =====================================================

-- Indexes to support suggested_friends_view efficiently
CREATE INDEX IF NOT EXISTS idx_match_players_user_match_date ON match_players(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_sport_status ON matches(match_date, sport_id, status) 
WHERE match_date >= CURRENT_DATE - INTERVAL '14 days';

-- Composite index for match player lookups
CREATE INDEX IF NOT EXISTS idx_match_players_match_user ON match_players(match_id, user_id);

-- Index for recent matches
CREATE INDEX IF NOT EXISTS idx_matches_recent ON matches(match_date DESC, created_at DESC) 
WHERE match_date >= CURRENT_DATE - INTERVAL '14 days';

-- =====================================================
-- 4. CHAT SYSTEM SUPPORTING INDEXES
-- =====================================================

-- Indexes to support recent_members_view from chat interactions
CREATE INDEX IF NOT EXISTS idx_chat_members_user_active_joined ON chat_members(user_id, is_active, joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_active ON chat_members(chat_id, is_active);

-- Index for recent chat activity
CREATE INDEX IF NOT EXISTS idx_chat_members_recent ON chat_members(joined_at DESC, is_active) 
WHERE joined_at >= NOW() - INTERVAL '14 days' AND is_active = true;

-- =====================================================
-- 5. PROFILES SUPPORTING INDEXES
-- =====================================================

-- Indexes for user profile lookups in friends context
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_lower ON profiles(LOWER(full_name));

-- Composite index for user search
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles(username, full_name, id);

-- =====================================================
-- 6. COURTS AND VENUES SUPPORTING INDEXES
-- =====================================================

-- Indexes to support location context in recent members
CREATE INDEX IF NOT EXISTS idx_courts_venue_name ON courts(venue_id, name);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);

-- =====================================================
-- 7. PERFORMANCE MONITORING INDEXES
-- =====================================================

-- Index for monitoring friendship creation patterns
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

-- Index for monitoring privacy setting changes
CREATE INDEX IF NOT EXISTS idx_privacy_settings_updated ON user_privacy_settings(updated_at DESC);

-- =====================================================
-- 8. PARTIAL INDEXES FOR COMMON QUERIES
-- =====================================================

-- Partial index for active friendships only
CREATE INDEX IF NOT EXISTS idx_friendships_active_only ON friendships(user1_id, user2_id, updated_at DESC) 
WHERE status IN ('accepted', 'pending');

-- Partial index for users who allow friend requests
CREATE INDEX IF NOT EXISTS idx_privacy_open_to_requests ON user_privacy_settings(user_id) 
WHERE allow_friend_requests IN ('everyone', 'friends-of-friends');

-- Partial index for users with visible online status
CREATE INDEX IF NOT EXISTS idx_privacy_visible_status ON user_privacy_settings(user_id) 
WHERE show_online_status = true;

-- =====================================================
-- 9. COVERING INDEXES FOR COMMON QUERIES
-- =====================================================

-- Covering index for friendship status checks
CREATE INDEX IF NOT EXISTS idx_friendships_status_check ON friendships(user1_id, user2_id) 
INCLUDE (status, requested_by, created_at);

-- Covering index for user privacy lookups
CREATE INDEX IF NOT EXISTS idx_privacy_full_lookup ON user_privacy_settings(user_id) 
INCLUDE (allow_friend_requests, show_online_status, updated_at);

-- =====================================================
-- 10. FUNCTION-BASED INDEXES
-- =====================================================

-- Index for case-insensitive username searches
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON profiles 
USING gin(username gin_trgm_ops);

-- Index for case-insensitive full name searches  
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_trgm ON profiles 
USING gin(full_name gin_trgm_ops);

-- Note: The above trigram indexes require the pg_trgm extension
-- Enable with: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 11. MAINTENANCE INDEXES
-- =====================================================

-- Index for cleanup operations (finding old declined/blocked friendships)
CREATE INDEX IF NOT EXISTS idx_friendships_cleanup ON friendships(status, updated_at) 
WHERE status IN ('declined', 'blocked');

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_friendships_analytics ON friendships(created_at, status, requested_by);

-- =====================================================
-- INDEX USAGE NOTES
-- =====================================================

/*
Key index usage patterns:

1. Finding user's friends:
   - Uses: idx_friendships_user1_status, idx_friendships_user2_status
   
2. Checking friendship status:
   - Uses: idx_friendships_status_check
   
3. Getting pending requests:
   - Uses: idx_friendships_pending, idx_friendships_requested_by_status
   
4. Privacy permission checks:
   - Uses: idx_privacy_full_lookup
   
5. Suggested friends calculation:
   - Uses: idx_match_players_user_match_date, idx_matches_recent
   
6. Recent members from chats:
   - Uses: idx_chat_members_recent
   
7. User search:
   - Uses: idx_profiles_search, idx_profiles_username_trgm, idx_profiles_fullname_trgm

Performance monitoring:
- Monitor query plans with EXPLAIN ANALYZE
- Check index usage with pg_stat_user_indexes
- Consider dropping unused indexes periodically
*/