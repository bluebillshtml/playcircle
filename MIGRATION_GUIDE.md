# Database Migration Guide

## Issue Fixed: RLS Policy Error (Code 42501)

The error you encountered was due to missing Row Level Security (RLS) policies for the new multi-sport tables. Here's how to fix it:

## 🔧 **Quick Fix Steps**

### 1. **Update Your Supabase Database**

Run the updated `supabase_schema.sql` in your Supabase SQL Editor. The key changes include:

- **New Tables**: `user_sport_profiles`, `user_sport_stats`, `venues`
- **Updated Tables**: `matches` now has `sport_id` field
- **New RLS Policies**: Added policies for all new tables

### 2. **Key Changes Made**

#### **Database Schema Updates:**
```sql
-- New multi-sport tables
CREATE TABLE public.user_sport_profiles (...);
CREATE TABLE public.user_sport_stats (...);
CREATE TABLE public.venues (...);

-- Updated matches table
ALTER TABLE public.matches ADD COLUMN sport_id TEXT NOT NULL;

-- New RLS policies
CREATE POLICY "User sport profiles are viewable by everyone" ON public.user_sport_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own sport profiles" ON public.user_sport_profiles FOR UPDATE USING (auth.uid() = user_id);
-- ... and more policies for all new tables
```

#### **Code Updates:**
- **Services**: Updated to use `user_sport_stats` instead of `user_stats`
- **Sport Context**: Added sport-specific data loading
- **Match Service**: Now filters by `sport_id`
- **Profile Service**: Added `getUserSportProfile()` method

### 3. **What This Fixes**

✅ **RLS Policy Error**: New tables now have proper security policies  
✅ **Multi-Sport Support**: Each sport has its own stats and profiles  
✅ **Data Isolation**: Padel data is separate from other sports  
✅ **Scalability**: Easy to add new sports without conflicts  

## 🚀 **Testing the Fix**

1. **Restart your app** after updating the database
2. **Switch between sports** - each should load its own data
3. **Check the console** - no more RLS errors
4. **Test match creation** - should work for all sports

## 📋 **If You Still See Errors**

### **Error: "relation does not exist"**
- Make sure you ran the complete `supabase_schema.sql`
- Check that all new tables were created

### **Error: "permission denied"**
- Verify RLS policies were created
- Check that your user has the correct permissions

### **Error: "column does not exist"**
- Make sure you added the `sport_id` column to matches table
- Verify all foreign key relationships are correct

## 🔄 **Rollback Plan**

If something goes wrong, you can:

1. **Revert to old schema** by running the original schema
2. **Update code** to use old table names
3. **Restart app** to use the previous version

## 📞 **Need Help?**

The error should now be resolved! The app will:
- Load user stats for the selected sport
- Filter matches by sport
- Use proper database relationships
- Respect RLS security policies

Your multi-sport platform is now ready to go! 🎉
