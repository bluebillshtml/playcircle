# Profile Pictures & Banner Images Setup Guide

## Overview
This guide explains how profile pictures and banner/cover images are now properly saved to the database in PlayCircle.

## Problem Solved
Previously, images were uploaded to Supabase storage buckets but weren't being saved to the database. This was due to:
1. **Column name mismatch**: Database used `avatar_url` but code sent `profile_picture_url`
2. **Missing banner column**: No database column existed for banner/cover images
3. **Bucket confusion**: Cover images were uploaded to wrong storage bucket

## Solution Implemented

### 1. Database Changes
**File**: `sql/add-profile-banner-support.sql`

Run this SQL file in your Supabase SQL Editor to:
- ✅ Add `banner_url` column to `profiles` table
- ✅ Create `banner-images` storage bucket
- ✅ Add storage policies for banner images

**To apply**: 
```sql
-- Copy and paste the contents of sql/add-profile-banner-support.sql
-- into your Supabase SQL Editor and run it
```

### 2. Code Changes

#### Updated Files:
1. **`src/services/supabase.js`** - `updateProfile()` function
   - Now maps `profile_picture_url` → `avatar_url` (database field)
   - Now maps `cover_picture_url` → `banner_url` (database field)
   - Supports both old and new field names for backward compatibility

2. **`src/screens/ProfileScreen.js`**
   - Cover images now upload to `banner-images` bucket (not `profile-pictures`)
   - Reads from both `avatar_url` and `banner_url` (with legacy fallback)

3. **`src/screens/AccountSettingsScreen.js`**
   - Cover images now upload to `banner-images` bucket (not `profile-pictures`)
   - Properly maps fields for database updates

4. **`src/components/ProfilePicture.js`**
   - Now checks `avatar_url` first, then falls back to `profile_picture_url`

## How It Works

### Profile Picture Flow:
1. User selects image in Profile or Account Settings screen
2. Image URI is converted to Blob using `fetch()` and `response.blob()`
3. Blob uploads to `profile-pictures` bucket with fixed filename: `{userId}/profile.jpg`
4. If an old image exists, it's automatically replaced (`upsert: true`)
5. Public URL is generated
6. `updateProfile()` is called with `profile_picture_url: <url>`
7. Function maps it to `avatar_url` and saves to database
8. Profile refreshes and displays the new image

### Banner/Cover Image Flow:
1. User selects cover image in Profile or Account Settings screen
2. Image URI is converted to Blob using `fetch()` and `response.blob()`
3. Blob uploads to `banner-images` bucket with fixed filename: `{userId}/banner.jpg`
4. If an old image exists, it's automatically replaced (`upsert: true`)
5. Public URL is generated
6. `updateProfile()` is called with `cover_picture_url: <url>`
7. Function maps it to `banner_url` and saves to database
8. Profile refreshes and displays the new cover image

### Technical Note: Why Blob Conversion?
Supabase storage expects raw file data (Blob/ArrayBuffer), not React Native's FormData. The fix:
```javascript
// ❌ Old approach (doesn't work)
const formData = new FormData();
formData.append('file', { uri, type, name });

// ✅ New approach (works)
const response = await fetch(uri);
const blob = await response.blob();
await supabase.storage.upload(fileName, blob);
```

### File Replacement Strategy
Instead of creating new files with timestamps (`profile_1234567890.jpg`), we use fixed filenames:
- **Profile pictures**: `{userId}/profile.jpg`
- **Banner images**: `{userId}/banner.jpg`

**Benefits**:
- ✅ Old images are automatically replaced (no orphaned files)
- ✅ Consistent URLs (don't change on every upload)
- ✅ Efficient storage management
- ✅ Simpler file organization

The `upsert: true` flag ensures the old file is replaced rather than creating a duplicate.

## Storage Buckets

### Existing Buckets:
- **`profile-pictures`**: For profile/avatar images (5MB limit)
- **`match-photos`**: For match-related photos (10MB limit)
- **`court-images`**: For venue/court images (10MB limit)

### New Bucket:
- **`banner-images`**: For profile cover/banner images (10MB limit)

## Database Schema

### profiles table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,        -- Profile picture URL
  banner_url TEXT,        -- Cover/banner image URL (NEW)
  bio TEXT,
  ...
);
```

## Testing Checklist

After running the SQL migration:

1. ✅ Upload a profile picture in Profile screen
   - Check: Image appears immediately
   - Check: Database `profiles.avatar_url` is updated
   - Check: Image persists after app restart

2. ✅ Upload a cover/banner image in Profile screen
   - Check: Image appears immediately
   - Check: Database `profiles.banner_url` is updated
   - Check: Image persists after app restart

3. ✅ Change profile picture in Account Settings
   - Check: Image saves and appears in Profile screen
   - Check: Database is updated

4. ✅ Change cover image in Account Settings
   - Check: Image saves and appears in Profile screen
   - Check: Database is updated

5. ✅ View other users' profiles
   - Check: Their profile pictures display correctly
   - Check: Uses `avatar_url` from database

## Backward Compatibility

The code maintains backward compatibility by:
- Checking `avatar_url` first, then falling back to `profile_picture_url`
- Checking `banner_url` first, then falling back to `cover_picture_url`
- Accepting both field names in `updateProfile()` function

This ensures existing users aren't affected during the transition.

## Storage Policies

All storage buckets have Row Level Security (RLS) policies:
- **Public read access**: Anyone can view images
- **Authenticated upload**: Only logged-in users can upload
- **User-specific**: Users can only upload/update/delete their own images
- **Folder structure**: Images stored in folders named by user ID

## File Organization

Each user has their own folder in each bucket:

```
profile-pictures/
  └── {userId}/
      └── profile.jpg      (always same filename, gets replaced)

banner-images/
  └── {userId}/
      └── banner.jpg       (always same filename, gets replaced)
```

**Example**:
- User ID: `cc13424a-8098-4270-a39a-7b61fb1b5a56`
- Profile picture: `cc13424a-8098-4270-a39a-7b61fb1b5a56/profile.jpg`
- Banner image: `cc13424a-8098-4270-a39a-7b61fb1b5a56/banner.jpg`

## Common Issues & Solutions

### Issue: "No content provided" / 400 Bad Request on upload
**Solution**: The code now converts images to Blob format before uploading (fixed)

### Issue: "Profile picture not saving"
**Solution**: Run the SQL migration to add `banner_url` column

### Issue: "Cover image goes to wrong bucket"
**Solution**: Code has been updated to use `banner-images` bucket

### Issue: "Database column not found"
**Solution**: Ensure you've run `sql/add-profile-banner-support.sql`

### Issue: "Permission denied"
**Solution**: Check that storage policies are created (they're in the SQL file)

## File Structure

```
sql/
  ├── add-profile-banner-support.sql    # NEW: Run this to add banner support
  └── complete-supabase-setup.sql       # Original setup (already has avatar_url)

src/
  ├── services/
  │   └── supabase.js                   # UPDATED: Maps profile_picture_url → avatar_url
  ├── screens/
  │   ├── ProfileScreen.js              # UPDATED: Uses banner-images bucket
  │   └── AccountSettingsScreen.js      # UPDATED: Uses banner-images bucket
  └── components/
      └── ProfilePicture.js             # UPDATED: Checks avatar_url first
```

## Quick Setup Commands

1. **Run SQL Migration**:
   ```
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy/paste contents of sql/add-profile-banner-support.sql
   - Click "Run"
   ```

2. **Verify Storage Buckets**:
   ```
   - Open Supabase Dashboard
   - Go to Storage
   - Check for: profile-pictures, banner-images
   ```

3. **Test in App**:
   ```
   - Open Profile screen
   - Tap profile picture → select new image
   - Tap cover photo → select new image
   - Check both appear correctly
   ```

## Field Mapping Reference

| Frontend Field       | Database Column | Storage Bucket     |
|---------------------|----------------|-------------------|
| profile_picture_url | avatar_url     | profile-pictures  |
| cover_picture_url   | banner_url     | banner-images     |

## Support

If images still don't save after following this guide:
1. Check Supabase logs for errors
2. Verify storage buckets exist
3. Confirm RLS policies are active
4. Check user authentication status
5. Look for console errors in React Native debugger

---

**Last Updated**: October 2025  
**Version**: 1.0

