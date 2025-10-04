# ⚠️ IMPORTANT: Run Database Migration First!

## The app is currently showing an error because the database columns don't exist yet.

### Quick Setup (5 minutes):

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in to your project
   - Click on your PlayCircle project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Open the file: `supabase-migrations.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for it to complete (should take 5-10 seconds)

4. **Run the Storage Setup**
   - Click "New Query" again
   - Open the file: `supabase-storage-setup.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor
   - Click "Run"
   - Wait for it to complete

5. **Verify**
   - Go to "Table Editor" in the left sidebar
   - Click on the "profiles" table
   - You should now see columns: `first_name`, `last_name`, `phone`, `bio`, `location`, `avatar_url`, etc.

6. **Restart the App**
   - The error will be gone!
   - All settings screens will work perfectly

---

## What These Scripts Do:

### `supabase-migrations.sql`:
- ✅ Adds `first_name` and `last_name` columns to profiles table
- ✅ Adds 20+ other profile fields (phone, bio, location, preferences, etc.)
- ✅ Creates new tables for user preferences, privacy settings, achievements, etc.
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates database triggers for auto-updates
- ✅ Migrates existing `full_name` data to `first_name` and `last_name`

### `supabase-storage-setup.sql`:
- ✅ Creates storage buckets for profile pictures, match photos, court images
- ✅ Sets up secure storage policies
- ✅ Creates helper functions for file management

---

## After Running the Migrations:

Your app will have:
- ✅ Separate first and last name fields
- ✅ Full profile customization
- ✅ Real-time auto-save to Supabase
- ✅ App settings (dark mode, notifications, etc.)
- ✅ Language preferences
- ✅ Purchase history tracking
- ✅ Help center
- ✅ Profile picture upload (infrastructure ready)

---

## Need Help?

If you encounter any errors:
1. Make sure you're connected to the correct Supabase project
2. Check that you have the correct permissions
3. Try running the scripts one section at a time
4. Check the Supabase logs for detailed error messages

For detailed instructions, see: `SUPABASE_SETUP_INSTRUCTIONS.md`
