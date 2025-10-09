# Friends System Database Setup Guide

This guide covers the complete database setup for the Friends page functionality, including tables, views, functions, and security policies.

## Overview

The Friends system adds social connectivity features to the sports app, allowing users to:
- Send and manage friend requests
- Discover suggested friends from recent matches
- View recent members from matches and chats
- Control privacy settings for friend requests and online status

## Database Components

### 1. Core Tables

#### `friendships`
Manages friend relationships between users with proper ordering and constraints.

**Key Features:**
- Normalized user ordering (user1_id < user2_id)
- Status tracking (pending, accepted, declined, blocked)
- Request originator tracking
- Unique constraints to prevent duplicates

#### `user_privacy_settings`
Controls user privacy preferences for friends functionality.

**Settings:**
- `allow_friend_requests`: 'everyone' | 'friends-of-friends' | 'no-one'
- `show_online_status`: boolean

### 2. Database Views

#### `suggested_friends_view`
Efficiently calculates suggested friends based on recent match interactions (last 14 days).

**Returns:**
- User profile information
- Mutual session count
- Sport tags from shared matches
- Last played together date
- Current friendship status

#### `recent_members_view`
Shows recent members from both match sessions and chat interactions.

**Sources:**
- Match participants (last 14 days)
- Chat members (last 14 days)
- Includes interaction context (location, court, time)

### 3. Security Functions

#### Friend Request Management
- `can_send_friend_request(sender_id, recipient_id)`: Checks privacy permissions
- `send_friend_request(sender_id, recipient_id)`: Creates friend request
- `accept_friend_request(friendship_id, accepter_id)`: Accepts request
- `decline_friend_request(friendship_id, decliner_id)`: Declines request

#### Data Retrieval Functions
- `get_user_friends(user_id)`: Returns user's accepted friends
- `get_pending_friend_requests(user_id)`: Returns incoming pending requests

## Installation Steps

### Step 1: Run the Migration

```sql
-- Execute the friends system migration
\i database/migrations/003_friends_system.sql
```

### Step 2: Apply Performance Indexes

```sql
-- Apply optimized indexes for performance
\i database/indexes/friends_system_indexes.sql
```

### Step 3: Validate Installation

```sql
-- Run validation tests
\i database/validation/friends_system_validation.sql
```

### Step 4: Initialize Existing Users (Optional)

```sql
-- Create default privacy settings for existing users
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
```

## Usage Examples

### 1. Send Friend Request

```sql
-- Send friend request from user A to user B
SELECT send_friend_request(
  'user-a-uuid'::UUID, 
  'user-b-uuid'::UUID
);
```

### 2. Get Suggested Friends

```sql
-- Get suggested friends for a user (parameterized view)
-- Note: Views with parameters need to be called via functions
-- This is a conceptual example - actual implementation uses functions
```

### 3. Accept Friend Request

```sql
-- Accept a friend request
SELECT accept_friend_request(
  'friendship-uuid'::UUID,
  'accepting-user-uuid'::UUID
);
```

### 4. Update Privacy Settings

```sql
-- Update user's privacy settings
UPDATE user_privacy_settings 
SET 
  allow_friend_requests = 'friends-of-friends',
  show_online_status = false
WHERE user_id = 'user-uuid'::UUID;
```

### 5. Get User's Friends

```sql
-- Get all friends for a user
SELECT * FROM get_user_friends('user-uuid'::UUID);
```

### 6. Get Pending Requests

```sql
-- Get pending friend requests for a user
SELECT * FROM get_pending_friend_requests('user-uuid'::UUID);
```

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### Friendships Table
- Users can only see friendships they're part of
- Users can only create requests they're sending
- Users can only update/delete their own friendships

### Privacy Settings Table
- Users can only see and modify their own settings

## Performance Considerations

### Optimized Indexes
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Covering indexes to avoid table lookups
- Trigram indexes for text search (requires pg_trgm extension)

### Query Optimization
- Views are designed for efficient execution
- Functions use proper parameter binding
- Indexes support all common access patterns

## Monitoring and Maintenance

### Performance Monitoring
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND relname IN ('friendships', 'user_privacy_settings');

-- Monitor query performance
EXPLAIN ANALYZE SELECT * FROM get_user_friends('user-uuid'::UUID);
```

### Cleanup Operations
```sql
-- Clean up old declined/blocked friendships (optional)
DELETE FROM friendships 
WHERE status IN ('declined', 'blocked') 
AND updated_at < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### Common Issues

1. **Duplicate Friendship Error**
   - Ensure user IDs are properly ordered
   - Check for existing relationships before creating new ones

2. **Permission Denied Errors**
   - Verify RLS policies are correctly applied
   - Check user authentication context

3. **Slow Query Performance**
   - Verify indexes are created and being used
   - Check query plans with EXPLAIN ANALYZE
   - Consider updating table statistics with ANALYZE

### Validation Queries

```sql
-- Check table structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('friendships', 'user_privacy_settings')
ORDER BY table_name, ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name IN ('friendships', 'user_privacy_settings');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('friendships', 'user_privacy_settings');
```

## Integration Notes

### With Existing Chat System
- Recent members view integrates with chat_members table
- Requires chat system to be properly set up
- Uses chat interaction data for friend suggestions

### With Match System
- Suggested friends based on match_players relationships
- Integrates with matches table for context
- Uses court and venue data for location context

### With User Profiles
- Extends profiles table with privacy settings
- Maintains referential integrity with user data
- Supports user search and discovery features

## Security Considerations

1. **Privacy Enforcement**: All friend request permissions are enforced at the database level
2. **Data Isolation**: RLS ensures users can only access their own data
3. **Input Validation**: Functions validate all inputs and handle edge cases
4. **Audit Trail**: All friendship changes are timestamped and tracked

## Next Steps

After completing the database setup:

1. Implement the TypeScript interfaces and types
2. Create the friends service layer with Supabase integration
3. Build the React Native components
4. Add real-time subscriptions for friend request updates
5. Implement comprehensive testing

This database foundation provides a robust, scalable, and secure base for the Friends page functionality.