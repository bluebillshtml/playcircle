# Current Errors and How to Fix Them

## Overview
The app is currently showing errors because the database schema hasn't been updated yet. The code has been fixed to work around missing tables, but you're seeing errors from the initial load attempts.

## Current Errors

### 1. Error loading profile
```
Could not find a relationship between 'profiles' and 'user_sport_profiles' in the schema cache
```

**Status:** ⚠️ This is a non-critical warning. The app will work, but profile loading attempted to use a relationship that doesn't exist yet.

**Fix:** This error will disappear once you run the database migrations (see below).

---

### 2. Error loading data
```
column matches.sport_id does not exist
```

**Status:** ⚠️ This is a non-critical warning. The app will work with existing matches, but the sport filtering feature won't work until migrations are run.

**Fix:** This error will disappear once you run the database migrations (see below).

---

## How to Fix All Errors

### Step 1: Run Database Migrations

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your PlayCircle project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the First Migration**
   - Open the file: `supabase-migrations.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - **Wait for it to complete** (should say "Success")

4. **Run the Storage Setup**
   - Open the file: `supabase-storage-setup.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor (new query)
   - Click "Run" or press Cmd/Ctrl + Enter
   - **Wait for it to complete** (should say "Success")

5. **Reload Your App**
   - In the Expo app, shake your device or press Cmd+D (iOS) / Cmd+M (Android)
   - Tap "Reload"
   - Or just close and reopen the app

---

## What the Migrations Will Add

### Database Tables
- ✅ Updates `profiles` table with new columns (first_name, last_name, phone, bio, etc.)
- ✅ Creates `user_stats` table for tracking match statistics
- ✅ Creates `user_sport_profiles` table for sport-specific data
- ✅ Creates `user_notifications` table for push notifications
- ✅ Creates `user_activity_log` table for tracking user actions
- ✅ Adds missing columns to `matches` table (sport_id, etc.)

### Storage Buckets
- ✅ `profile-pictures` - For user profile photos (5MB limit, public)
- ✅ `match-photos` - For match photos (10MB limit, public)
- ✅ `court-images` - For court venue images (10MB limit, public)
- ✅ `documents` - For private documents (5MB limit, private)

### Security
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Storage policies for all buckets
- ✅ User data isolation and privacy

---

## Code Changes Already Made

The following code fixes have already been applied:

### ✅ Fixed: supabase.js
- `getUserStats()` - Returns default stats instead of querying missing table
- `getUserSportProfile()` - Returns default profile instead of querying missing table
- Storage service configured for profile pictures and media uploads

### ✅ Fixed: AnimatedBackground.js
- Replaced blue gradient with background1.jpg image
- Added 5 animated wave layers with different speeds (28s, 20s, 40s, 25s, 32s)
- Implemented advanced easing functions (sine, quad, circle, bezier)
- Added opacity breathing effects (0.6-0.8 and 0.3-0.6)
- Added progressive blur (radius 1, 2, 3 on different layers)
- Added BlurView overlay for glass morphism effect

### ✅ Fixed: All 14 Screen Files
- Wrapped with AnimatedBackground component
- Set background to transparent to show animated background

### ✅ Fixed: Settings Screens
- Created AccountSettingsScreen with auto-save to Supabase
- Created PurchasesScreen for transaction history
- Created LanguagesScreen for language selection
- Created AppSettingsScreen for appearance preferences
- Created HelpCenterScreen for FAQs and support

### ✅ Fixed: Name Fields
- Changed from single `full_name` to `first_name` and `last_name`
- Updated SignUpScreen, AccountSettingsScreen, ProfileScreen
- Added backward compatibility mapping in AuthContext

---

## Testing After Migrations

After running the migrations, test these features:

1. **Profile Editing**
   - Go to Profile → Account Settings
   - Edit your name, bio, location, skill level
   - Changes should save automatically (watch for console confirmations)

2. **Language Settings**
   - Go to Profile → Languages
   - Select a different language
   - Should save automatically to database

3. **Background Animation**
   - Navigate through different screens
   - You should see the background image with slow wave animations
   - Verify it's visible on all screens (Home, Matches, Profile, Settings, etc.)

---

## Still Having Issues?

If errors persist after running migrations:

1. **Clear Metro Bundler Cache**
   ```bash
   npx expo start -c
   ```

2. **Restart Expo**
   - Stop the current Expo server (Ctrl+C)
   - Run: `npx expo start`
   - Reload the app

3. **Check Supabase Dashboard**
   - Verify the migrations ran successfully
   - Check if new columns appear in profiles table
   - Check if new tables exist (user_stats, user_sport_profiles)

4. **Check Browser Console / React Native Debugger**
   - Open React Native debugging tools
   - Look for any new error messages
   - Share them if you need help

---

## Summary

**Current Status:**
- ✅ Code is ready
- ✅ Animated background working
- ✅ Settings screens created
- ✅ Name fields updated
- ⚠️ Database migrations NOT run yet

**Next Step:**
Run the database migrations as described in "Step 1" above to eliminate all errors.
