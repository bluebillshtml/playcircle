-- =====================================================
-- ADD PROFILE BANNER/COVER IMAGE SUPPORT
-- This migration adds banner_url column and storage bucket
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add banner_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Create banner-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('banner-images', 'banner-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for banner-images bucket
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
CREATE POLICY "Banner images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Users can upload own banner image" ON storage.objects;
CREATE POLICY "Users can upload own banner image"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own banner image" ON storage.objects;
CREATE POLICY "Users can update own banner image"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own banner image" ON storage.objects;
CREATE POLICY "Users can delete own banner image"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banner-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- ✅ Added banner_url column to profiles table
-- ✅ Created banner-images storage bucket
-- ✅ Added storage policies for banner images
-- 
-- Now your profile pictures will save to avatar_url
-- and banner/cover images will save to banner_url
-- =====================================================

