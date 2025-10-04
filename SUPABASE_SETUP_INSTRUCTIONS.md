# PlayCircle Supabase Setup Instructions

This guide will help you set up all the necessary Supabase tables, storage buckets, and policies for the PlayCircle app.

## Prerequisites

- Supabase project created
- Supabase project URL and anon key configured in `src/config/supabase.config.js`

## Setup Steps

### 1. Run Database Migrations

Execute the following SQL scripts in your Supabase SQL Editor in order:

#### Step 1: Run the main migrations
Open the Supabase SQL Editor and run the entire contents of:
```
supabase-migrations.sql
```

This will:
- Add all missing fields to the `profiles` table
- Create new tables: `user_preferences`, `profile_visibility`, `user_blocks`, `user_connections`, `user_achievements`, `activity_log`
- Set up indexes for performance
- Create triggers for automatic timestamp updates
- Enable Row Level Security (RLS) policies
- Create default entries for existing users

#### Step 2: Set up storage buckets and policies
Run the entire contents of:
```
supabase-storage-setup.sql
```

This will:
- Create storage buckets: `profile-pictures`, `match-photos`, `court-images`, `documents`
- Set up storage policies for secure file access
- Create helper functions for file management
- Set up storage usage tracking

### 2. Verify Tables Created

After running the migrations, verify these tables exist:

**Existing Tables (should already exist):**
- `profiles`
- `courts`
- `court_reviews`
- `court_schedules`
- `matches`
- `match_players`
- `match_games`
- `teams`
- `team_players`
- `payments`
- `notifications`
- `leaderboard`
- `user_stats`
- `player_match_stats`
- `scoring_events`

**New Tables (created by migration):**
- `user_preferences`
- `profile_visibility`
- `user_blocks`
- `user_connections`
- `user_achievements`
- `activity_log`
- `user_storage_usage`

### 3. Verify Storage Buckets Created

Go to Storage in your Supabase dashboard and verify these buckets exist:

1. **profile-pictures** (Public)
   - Max file size: 5MB
   - Allowed types: JPEG, PNG, WebP, GIF

2. **match-photos** (Public)
   - Max file size: 10MB
   - Allowed types: JPEG, PNG, WebP

3. **court-images** (Public)
   - Max file size: 10MB
   - Allowed types: JPEG, PNG, WebP

4. **documents** (Private)
   - Max file size: 5MB
   - Allowed types: PDF, JPEG, PNG

### 4. Verify RLS Policies

Check that Row Level Security is enabled on all tables:

**Profiles Table Policies:**
- ✅ "Profiles are viewable by everyone" (SELECT)
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Users can insert own profile" (INSERT)

**Storage Policies:**
- ✅ Profile pictures are publicly accessible (SELECT)
- ✅ Users can upload/update/delete own profile picture
- ✅ Similar policies for match photos and documents

### 5. Test the Setup

#### Test Profile Updates:
1. Sign in to the app
2. Go to Profile → Account Settings
3. Update any field (name, bio, skill level, etc.)
4. Verify changes are saved in real-time to Supabase

#### Test App Settings:
1. Go to Profile → Settings
2. Toggle dark mode
3. Change notification preferences
4. Verify all changes save automatically

#### Test Image Upload (once implemented):
1. Go to Account Settings
2. Click "Change Photo"
3. Select an image
4. Verify it uploads to the `profile-pictures` bucket

### 6. Monitor Real-time Updates

All settings changes are automatically saved to Supabase with:
- 1-second debounce on text inputs (Account Settings)
- Immediate save on toggles and selections (App Settings)

## Database Schema Updates

### New Fields Added to `profiles` Table:

| Field | Type | Description |
|-------|------|-------------|
| `first_name` | VARCHAR(100) | User's first name |
| `last_name` | VARCHAR(100) | User's last name |
| `phone` | VARCHAR(20) | User's phone number |
| `bio` | TEXT | User biography/description |
| `location` | VARCHAR(255) | User's location |
| `avatar_url` | TEXT | URL to profile picture |
| `preferred_language` | VARCHAR(10) | Language preference (default: 'en') |
| `notifications_enabled` | BOOLEAN | Master notification toggle |
| `email_notifications` | BOOLEAN | Email notification preference |
| `push_notifications` | BOOLEAN | Push notification preference |
| `sound_enabled` | BOOLEAN | Sound effects toggle |
| `vibration_enabled` | BOOLEAN | Haptic feedback toggle |
| `location_enabled` | BOOLEAN | Location services toggle |
| `analytics_enabled` | BOOLEAN | Analytics tracking toggle |
| `date_of_birth` | DATE | User's birth date |
| `gender` | VARCHAR(20) | User's gender |
| `preferred_sport` | VARCHAR(50) | Favorite sport (default: 'padel') |
| `playing_style` | VARCHAR(50) | Playing style description |
| `favorite_position` | VARCHAR(50) | Preferred playing position |
| `availability` | TEXT[] | Array of available time slots |
| `skill_rating` | DECIMAL(3,2) | Numeric skill rating (0.0-10.0) |
| `is_verified` | BOOLEAN | Account verification status |
| `is_active` | BOOLEAN | Account active status |
| `last_active_at` | TIMESTAMP | Last activity timestamp |

## Troubleshooting

### Issue: Tables not created
**Solution:** Make sure you're running the SQL in the correct order. Run `supabase-migrations.sql` first, then `supabase-storage-setup.sql`.

### Issue: RLS policies preventing updates
**Solution:** Verify that you're signed in and the `auth.uid()` matches the user making the update.

### Issue: Storage upload fails
**Solution:**
1. Check that the bucket exists and is public (for profile-pictures)
2. Verify the file size is under the limit
3. Check that the file type is allowed
4. Ensure storage policies are correctly set

### Issue: Real-time updates not working
**Solution:**
1. Verify Supabase URL and anon key are correct
2. Check that RLS policies allow the operation
3. Look for errors in the browser/app console

## Features Enabled

After completing this setup, users can:

✅ Edit their full profile (name, username, bio, location, phone, skill level)
✅ Customize app appearance (dark mode)
✅ Manage notification preferences
✅ Change language settings
✅ View purchase history
✅ Access help center and support
✅ Upload profile pictures (bucket ready, UI to be implemented)
✅ All changes auto-save to Supabase in real-time

## Next Steps

1. Run the migration scripts in Supabase SQL Editor
2. Verify all tables and buckets are created
3. Test the app to ensure all settings screens work
4. Implement image picker UI for profile picture upload
5. Add additional profile fields as needed

## Support

If you encounter any issues:
1. Check the Supabase logs for errors
2. Verify RLS policies are correctly configured
3. Ensure all migrations ran successfully
4. Check the app console for error messages

---

**Note:** This setup assumes you already have the basic tables created (matches, courts, profiles, etc.). The migrations only ADD new fields and tables, they won't delete or modify existing data.
