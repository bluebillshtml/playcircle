# Chat System Database Setup

This document provides instructions for setting up the chat system database schema in your Supabase project.

## Prerequisites

1. Ensure you have completed the basic Supabase setup from `SUPABASE_SETUP.md`
2. Have access to your Supabase project's SQL editor
3. Verify that the base tables (profiles, matches, courts, user_matches) are already created

## Installation Steps

### Step 1: Run the Chat System Migration

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/migrations/002_chat_system.sql`
4. Execute the migration

### Step 2: Verify Installation

Run this query to verify the tables were created successfully:

```sql
-- Check if all chat system tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('chats', 'chat_members', 'messages');
```

You should see all three tables listed.

### Step 3: Test the Triggers

Create a test match to verify the automatic chat creation:

```sql
-- Insert a test match (replace with actual court_id and host_id)
INSERT INTO matches (
  court_id, 
  host_id, 
  sport_id, 
  match_date, 
  match_time, 
  duration_minutes, 
  max_players, 
  skill_level, 
  match_type, 
  price_per_player, 
  description
) VALUES (
  (SELECT id FROM courts LIMIT 1), -- Use first available court
  (SELECT id FROM profiles LIMIT 1), -- Use first available user
  'padel',
  CURRENT_DATE + 1,
  '18:00',
  90,
  4,
  'Intermediate',
  'casual',
  25.00,
  'Test match for chat system'
);

-- Verify chat was created
SELECT m.id as match_id, c.id as chat_id, c.created_at
FROM matches m
LEFT JOIN chats c ON m.id = c.court_session_id
ORDER BY m.created_at DESC
LIMIT 5;
```

### Step 4: Test Chat Membership

```sql
-- Add a user to the test match (this should automatically add them to chat)
INSERT INTO user_matches (user_id, match_id)
SELECT 
  (SELECT id FROM profiles WHERE id != (SELECT host_id FROM matches ORDER BY created_at DESC LIMIT 1) LIMIT 1),
  (SELECT id FROM matches ORDER BY created_at DESC LIMIT 1);

-- Verify user was added to chat
SELECT 
  cm.user_id,
  p.full_name,
  cm.joined_at,
  cm.is_active
FROM chat_members cm
JOIN profiles p ON cm.user_id = p.id
JOIN chats c ON cm.chat_id = c.id
JOIN matches m ON c.court_session_id = m.id
ORDER BY m.created_at DESC, cm.joined_at DESC
LIMIT 10;
```

## Database Schema Overview

### Tables Created

1. **chats**: One chat per court session
   - Links to matches table via `court_session_id`
   - Tracks last message timestamp
   - Can be deactivated without deletion

2. **chat_members**: Tracks chat membership
   - Links users to chats
   - Tracks join/leave timestamps
   - Maintains unread message counts
   - Supports soft deletion (is_active flag)

3. **messages**: Stores all chat messages
   - Supports different message types (text, location, status, photo)
   - JSONB metadata for extensibility
   - Soft deletion support

### Key Features

- **Automatic Chat Creation**: Chats are automatically created when matches are created
- **Automatic Membership Management**: Users are added/removed from chats when they join/leave matches
- **Unread Count Tracking**: Automatic unread message counting per user
- **Row Level Security**: Comprehensive RLS policies ensure users only see their own chats
- **Performance Optimized**: Proper indexing for fast queries
- **Real-time Ready**: Designed to work with Supabase real-time subscriptions

### Functions Available

- `get_user_chats(user_id)`: Get all chats for a user with metadata
- `mark_messages_read(chat_id, user_id)`: Mark messages as read and reset unread count

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Ensure base tables (profiles, matches, courts) exist first
2. **RLS Policy Errors**: Verify that auth.uid() is available (user is authenticated)
3. **Trigger Not Firing**: Check that the base triggers from SUPABASE_SETUP.md are working

### Debug Queries

```sql
-- Check if triggers are installed
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%chat%';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('chats', 'chat_members', 'messages');

-- Check indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename IN ('chats', 'chat_members', 'messages')
  AND schemaname = 'public';
```

### Performance Monitoring

```sql
-- Monitor chat system usage
SELECT 
  'chats' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_active = true) as active_records
FROM chats
UNION ALL
SELECT 
  'chat_members' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_active = true) as active_records
FROM chat_members
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_deleted = false) as active_records
FROM messages;
```

## Next Steps

After successfully setting up the database schema:

1. Proceed to Task 2: Extend Supabase services with chat functionality
2. Test the schema with your application
3. Monitor performance and adjust indexes if needed
4. Consider setting up database backups for production

## Rollback Instructions

If you need to rollback the chat system:

```sql
-- WARNING: This will delete all chat data
DROP TRIGGER IF EXISTS trigger_create_chat_for_match ON matches;
DROP TRIGGER IF EXISTS trigger_add_user_to_match_chat ON user_matches;
DROP TRIGGER IF EXISTS trigger_remove_user_from_match_chat ON user_matches;
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON messages;

DROP FUNCTION IF EXISTS create_chat_for_match();
DROP FUNCTION IF EXISTS add_user_to_match_chat();
DROP FUNCTION IF EXISTS remove_user_from_match_chat();
DROP FUNCTION IF EXISTS update_chat_last_message();
DROP FUNCTION IF EXISTS mark_messages_read(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_chats(UUID);

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_members;
DROP TABLE IF EXISTS chats;
```