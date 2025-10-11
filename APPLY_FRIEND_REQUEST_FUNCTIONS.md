# Apply Friend Request JSONB Functions

## What This Does

This migration creates database functions that work with the `user_friends` JSONB structure for managing friend requests.

## Functions Created

1. **`send_friend_request_jsonb(sender_id, recipient_id)`**
   - Adds request to recipient's `friend_requests_received` array
   - Adds request to sender's `friend_requests_sent` array
   - Uses `SECURITY DEFINER` to bypass RLS policies
   - Prevents duplicate requests
   - Prevents self-friending

2. **`accept_friend_request_jsonb(accepter_id, sender_id)`**
   - Removes from `friend_requests_received`
   - Removes from `friend_requests_sent`
   - Adds both users to each other's `friends` array
   - Increments `total_friends` counter

3. **`decline_friend_request_jsonb(decliner_id, sender_id)`**
   - Removes from `friend_requests_received`
   - Updates sender's request status to 'declined'

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `database/migrations/004_user_friends_jsonb_functions.sql`
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. Verify success message

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Direct psql Connection

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/migrations/004_user_friends_jsonb_functions.sql
```

## Verification

After running the migration, verify the functions exist:

```sql
-- Check functions are created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%friend_request_jsonb%';
```

Should return:
- `send_friend_request_jsonb`
- `accept_friend_request_jsonb`
- `decline_friend_request_jsonb`

## Test the Function

```sql
-- Test sending a friend request
SELECT send_friend_request_jsonb(
  'sender-user-id'::UUID,
  'recipient-user-id'::UUID
);

-- Check it was created
SELECT 
  user_id,
  friend_requests_received,
  friend_requests_sent
FROM user_friends
WHERE user_id IN ('sender-user-id'::UUID, 'recipient-user-id'::UUID);
```

## Notes

- The app code has been updated to use `send_friend_request_jsonb` instead of `send_friend_request`
- Both the old `friendships` table functions and new `user_friends` JSONB functions coexist
- You can switch between them by changing the RPC call in `friendsService.ts`

