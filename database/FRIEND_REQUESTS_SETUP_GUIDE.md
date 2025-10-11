# Friend Requests JSONB Functions Setup Guide

## Overview
The friend request accept/decline functionality uses JSONB functions with `SECURITY DEFINER` to bypass RLS policies and properly manage the complex JSONB arrays in the `user_friends` table.

## Current Status
✅ Client-side code updated with proper accept/decline handlers
✅ SQL functions created in migration file
⚠️ **Functions need to be executed on Supabase database**

## Setup Steps

### 1. Run the Migration on Supabase

You need to execute the SQL migration file on your Supabase database:

**File:** `database/migrations/004_user_friends_jsonb_functions.sql`

**Options to run it:**

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `004_user_friends_jsonb_functions.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

#### Option B: Via Supabase CLI
```bash
supabase db push
```

Or execute the specific file:
```bash
psql -h [your-db-host] -U postgres -d postgres -f database/migrations/004_user_friends_jsonb_functions.sql
```

### 2. Verify Functions Were Created

Run the verification script to ensure functions exist:

**File:** `database/test_and_verify_jsonb_functions.sql`

In Supabase SQL Editor, run the first query to check if functions exist:

```sql
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
```

**Expected Result:** You should see 3 rows, one for each function, with `security_type = 'DEFINER'`

### 3. Test the Functions

#### Check Current Friend Requests
```sql
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
```

#### Test Accept Function (Replace UUIDs)
```sql
SELECT accept_friend_request_jsonb(
  'cc13424a-8098-4270-a39a-7b61fb1b5a56'::uuid,  -- accepter_id (person accepting)
  'b295fd1b-adb5-4f33-a8c0-4d3bdb671b62'::uuid   -- sender_id (person who sent request)
);
```

### 4. Test in the App

Once the functions are deployed:

1. Navigate to the **Friends** page
2. You should see pending friend requests
3. Click the **green checkmark** to accept
4. Click the **red X** to decline
5. Check the console for detailed logs:
   - `FriendsScreen: handleAcceptRequest called with requestId:`
   - `useFriends: acceptFriendRequest called with:`
   - `Accepting friend request from ... by ...`
   - `Friend request accepted successfully`

## How It Works

### Request ID Format
Friend requests use the format: `request_<sender_user_id>`

Example: `request_b295fd1b-adb5-4f33-a8c0-4d3bdb671b62`

### Accept Flow
1. User clicks green checkmark on a friend request
2. `RequestStrip` shows confirmation dialog
3. `handleAcceptRequest(requestId)` is called in `FriendsScreen`
4. `acceptFriendRequest(requestId)` is called in `useFriends` hook
5. `friendsService.acceptFriendRequest(requestId, userId)` extracts sender ID
6. RPC function `accept_friend_request_jsonb` is called with both IDs
7. Function updates both users' `user_friends` records:
   - Removes request from accepter's `friend_requests_received`
   - Removes request from sender's `friend_requests_sent`
   - Adds both users to each other's `friends` array
   - Increments `total_friends` for both
8. Cache is cleared for both users
9. UI is updated optimistically
10. Data is refreshed after 500ms

### Decline Flow
1. User clicks red X on a friend request
2. `RequestStrip` shows confirmation dialog
3. `handleDeclineRequest(requestId)` is called in `FriendsScreen`
4. `declineFriendRequest(requestId)` is called in `useFriends` hook
5. `friendsService.declineFriendRequest(requestId, userId)` extracts sender ID
6. RPC function `decline_friend_request_jsonb` is called with both IDs
7. Function updates both users' `user_friends` records:
   - Removes request from decliner's `friend_requests_received`
   - Updates sender's `friend_requests_sent` status to 'declined'
8. Cache is cleared for both users
9. UI is updated optimistically
10. Data is refreshed after 500ms

## Database Structure

### user_friends Table (JSONB fields)

```json
{
  "user_id": "uuid",
  "friends": [
    {
      "user_id": "uuid",
      "status": "accepted",
      "added_at": "timestamp"
    }
  ],
  "friend_requests_sent": [
    {
      "user_id": "uuid",
      "status": "pending" | "declined",
      "requested_at": "timestamp"
    }
  ],
  "friend_requests_received": [
    {
      "user_id": "uuid",
      "status": "pending",
      "requested_at": "timestamp"
    }
  ],
  "total_friends": 0
}
```

## Troubleshooting

### Issue: Functions don't exist
**Solution:** Run the migration file `004_user_friends_jsonb_functions.sql` in Supabase SQL Editor

### Issue: "permission denied for function"
**Solution:** Ensure the GRANT statements at the end of the migration were executed:
```sql
GRANT EXECUTE ON FUNCTION accept_friend_request_jsonb(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decline_friend_request_jsonb(UUID, UUID) TO authenticated;
```

### Issue: RLS policy violation
**Solution:** Functions use `SECURITY DEFINER` which should bypass RLS. Verify with:
```sql
SELECT security_type FROM information_schema.routines 
WHERE routine_name = 'accept_friend_request_jsonb';
```
Should return `DEFINER`

### Issue: Nothing happens when clicking accept/decline
**Solution:** 
1. Check browser console for errors
2. Verify request ID format is correct (`request_<uuid>`)
3. Verify user is logged in
4. Check that friend request actually exists in database

### Issue: Request accepted but UI doesn't update
**Solution:** 
1. Check console logs for errors
2. Verify cache is being cleared (`clearUserCaches` is called)
3. Check that `fetchFriendRequests` is being called after 500ms
4. Hard refresh the page

## Testing Checklist

- [ ] Functions exist in database (run verification query)
- [ ] Can see pending friend requests in UI
- [ ] Accept button works and updates database
- [ ] Accept updates both users' friend lists
- [ ] Decline button works and updates database
- [ ] UI updates after accept/decline
- [ ] No console errors
- [ ] Haptic feedback works on mobile
- [ ] Confirmation dialogs appear
- [ ] Loading states show during processing

## Files Modified

### Client-side
- `src/screens/FriendsScreen.js` - Added console logs, handlers
- `src/hooks/useFriends.js` - Added console logs for debugging
- `src/services/friendsService.ts` - RPC function calls
- `src/components/RequestStrip.js` - Accept/decline UI

### Database
- `database/migrations/004_user_friends_jsonb_functions.sql` - **NEEDS TO BE RUN**
- `database/test_and_verify_jsonb_functions.sql` - Verification queries
- `database/FRIEND_REQUESTS_SETUP_GUIDE.md` - This guide

