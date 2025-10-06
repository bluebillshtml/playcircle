# PlayCircle Database Setup Guide

This guide will help you set up the complete database for your PlayCircle app using the provided SQL files.

## 📁 SQL Files Overview

I've created 5 comprehensive SQL files for your PlayCircle app:

1. **`01-complete-schema.sql`** - Complete database schema with all tables
2. **`02-fix-errors-migration.sql`** - Fixes the specific errors mentioned in ERRORS_AND_FIXES.md
3. **`03-storage-setup.sql`** - Storage buckets and file upload policies
4. **`04-functions-triggers.sql`** - Database functions, triggers, and RLS policies
5. **`05-seed-data.sql`** - Sample data for testing and development

## 🚀 Quick Setup (Recommended)

### Step 1: Run the Error Fix Migration
This will resolve the current errors you're seeing:

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `02-fix-errors-migration.sql`
4. Click **Run**

This will:
- ✅ Add missing columns to `profiles` table (`first_name`, `last_name`, `phone`, etc.)
- ✅ Add `sport_id` column to `matches` table
- ✅ Create missing tables (`user_sport_profiles`, `user_sport_stats`, etc.)
- ✅ Fix the relationship errors you're seeing

### Step 2: Set Up Storage
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `03-storage-setup.sql`
3. Click **Run**

This will:
- ✅ Create storage buckets for profile pictures, match photos, etc.
- ✅ Set up proper access policies
- ✅ Enable file uploads in your app

### Step 3: Add Functions and Triggers
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `04-functions-triggers.sql`
3. Click **Run**

This will:
- ✅ Add all necessary database functions
- ✅ Set up triggers for automatic updates
- ✅ Configure Row Level Security (RLS) policies

### Step 4: Add Sample Data (Optional)
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste the contents of `05-seed-data.sql`
3. Click **Run**

This will:
- ✅ Add sample venues and courts
- ✅ Create sample matches for testing
- ✅ Add sample users and data

## 🔧 Complete Fresh Setup (Alternative)

If you want to start completely fresh:

1. **Drop existing tables** (if any)
2. Run `01-complete-schema.sql` - Complete schema
3. Run `03-storage-setup.sql` - Storage setup
4. Run `04-functions-triggers.sql` - Functions and triggers
5. Run `05-seed-data.sql` - Sample data

## 🐛 Error Resolution

The migration files specifically address these errors from your ERRORS_AND_FIXES.md:

### Error 1: Profile Relationship Error
```
Could not find a relationship between 'profiles' and 'user_sport_profiles'
```
**Fixed by:** Creating the `user_sport_profiles` table and proper relationships

### Error 2: Missing Column Error
```
column matches.sport_id does not exist
```
**Fixed by:** Adding the `sport_id` column to the `matches` table

## 📊 What Each File Contains

### 01-complete-schema.sql
- **Profiles table** with all required fields (`first_name`, `last_name`, `phone`, `bio`, etc.)
- **User sport profiles** and statistics tables
- **Venues and courts** tables with geolocation support
- **Matches and teams** tables for match management
- **Payments** table for transaction handling
- **Live scoring** tables for real-time match updates
- **Leaderboard** and **notifications** tables
- **Comprehensive indexes** for performance

### 02-fix-errors-migration.sql
- **Adds missing columns** to existing tables
- **Creates missing tables** that your code expects
- **Migrates existing data** (e.g., splits `full_name` into `first_name` and `last_name`)
- **Adds proper indexes** for performance
- **Creates default entries** for existing users

### 03-storage-setup.sql
- **Profile pictures bucket** (5MB limit, public)
- **Match photos bucket** (10MB limit, public)
- **Court images bucket** (10MB limit, public)
- **Documents bucket** (5MB limit, private)
- **Storage policies** for secure file access
- **Helper functions** for file management

### 04-functions-triggers.sql
- **User signup handler** - Creates profile automatically
- **Updated timestamp triggers** - Auto-updates `updated_at` fields
- **Match player count triggers** - Updates match status automatically
- **Statistics update triggers** - Updates user stats after matches
- **Row Level Security policies** - Secure data access
- **Helper functions** - Nearby courts, user rankings, etc.

### 05-seed-data.sql
- **3 sample venues** with different facilities
- **14 sample courts** for various sports (padel, tennis, basketball, soccer)
- **21 sample matches** for the next 7 days
- **Sample reviews, achievements, and notifications**
- **Test data** for all major features

## 🧪 Testing After Setup

After running the migrations, test these features:

1. **Profile Editing**
   - Go to Profile → Account Settings
   - Edit your name, bio, location, skill level
   - Changes should save automatically

2. **Language Settings**
   - Go to Profile → Languages
   - Select a different language
   - Should save automatically to database

3. **Background Animation**
   - Navigate through different screens
   - You should see the background image with wave animations

4. **Match Creation**
   - Try creating a new match
   - Should work without database errors

## 🔍 Verifying the Setup

Check that these tables exist in your Supabase dashboard:
- ✅ `profiles` (with new columns)
- ✅ `user_sport_profiles`
- ✅ `user_sport_stats`
- ✅ `user_preferences`
- ✅ `profile_visibility`
- ✅ `matches` (with `sport_id` column)
- ✅ `venues` and `courts`
- ✅ `storage.buckets` (profile-pictures, match-photos, etc.)

## 🚨 Troubleshooting

### If you get permission errors:
- Make sure you're running the SQL as the database owner
- Check that RLS policies are properly set up

### If relationships still don't work:
- Run the migration files in order
- Check that foreign key constraints are properly created

### If storage uploads fail:
- Verify storage buckets are created
- Check storage policies are set up correctly

## 📱 Next Steps

1. **Reload your app** - The errors should be gone
2. **Test all features** - Profile editing, match creation, etc.
3. **Add real data** - Replace sample data with real venues and matches
4. **Customize** - Modify the schema as needed for your specific requirements

## 🎉 Success!

Once you've run these migrations, your PlayCircle app should work without the database errors you were seeing. The app will have:

- ✅ Complete user profile management
- ✅ Multi-sport court booking
- ✅ Match creation and management
- ✅ Live scoring capabilities
- ✅ File upload support
- ✅ User statistics and leaderboards
- ✅ Secure data access with RLS

Your app is now ready for development and testing! 🚀
