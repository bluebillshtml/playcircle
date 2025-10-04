-- =====================================================
-- PLAYCIRCLE STORAGE BUCKETS AND POLICIES
-- Setup for profile pictures and other media
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Create profile-pictures bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-pictures',
    'profile-pictures',
    true, -- Public bucket so avatars can be displayed
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create match-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'match-photos',
    'match-photos',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create court-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'court-images',
    'court-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket (for receipts, invoices, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Private bucket
    5242880, -- 5MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES FOR PROFILE PICTURES
-- =====================================================

-- Allow anyone to view profile pictures (public bucket)
DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Allow authenticated users to upload their own profile picture
DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile picture
DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile picture
DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;
CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 3. STORAGE POLICIES FOR MATCH PHOTOS
-- =====================================================

-- Allow anyone to view match photos
DROP POLICY IF EXISTS "Match photos are publicly accessible" ON storage.objects;
CREATE POLICY "Match photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'match-photos');

-- Allow authenticated users to upload match photos
DROP POLICY IF EXISTS "Authenticated users can upload match photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload match photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'match-photos' AND
    auth.role() = 'authenticated'
);

-- Allow users to update their own match photos
DROP POLICY IF EXISTS "Users can update own match photos" ON storage.objects;
CREATE POLICY "Users can update own match photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'match-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own match photos
DROP POLICY IF EXISTS "Users can delete own match photos" ON storage.objects;
CREATE POLICY "Users can delete own match photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'match-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 4. STORAGE POLICIES FOR COURT IMAGES
-- =====================================================

-- Allow anyone to view court images
DROP POLICY IF EXISTS "Court images are publicly accessible" ON storage.objects;
CREATE POLICY "Court images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'court-images');

-- Allow authenticated users to upload court images
DROP POLICY IF EXISTS "Authenticated users can upload court images" ON storage.objects;
CREATE POLICY "Authenticated users can upload court images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'court-images' AND
    auth.role() = 'authenticated'
);

-- =====================================================
-- 5. STORAGE POLICIES FOR DOCUMENTS
-- =====================================================

-- Allow users to view only their own documents
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload their own documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 6. HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(filename TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(SUBSTRING(filename FROM '\.([^.]*)$'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION generate_unique_filename(
    user_id UUID,
    original_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
    extension TEXT;
    unique_name TEXT;
BEGIN
    extension := get_file_extension(original_filename);
    unique_name := user_id::text || '/' || gen_random_uuid()::text || '.' || extension;
    RETURN unique_name;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old profile pictures when a new one is uploaded
CREATE OR REPLACE FUNCTION cleanup_old_profile_pictures()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete old avatar files from storage when avatar_url changes
    IF OLD.avatar_url IS NOT NULL AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
        -- Extract the file path from the old URL
        -- This would need to be implemented based on your URL structure
        -- For now, we'll just log it
        RAISE NOTICE 'Old avatar URL: %', OLD.avatar_url;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup old profile pictures
DROP TRIGGER IF EXISTS cleanup_profile_pictures_trigger ON profiles;
CREATE TRIGGER cleanup_profile_pictures_trigger
    BEFORE UPDATE OF avatar_url ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_profile_pictures();

-- =====================================================
-- 7. STORAGE USAGE TRACKING
-- =====================================================

-- Table to track storage usage per user
CREATE TABLE IF NOT EXISTS user_storage_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    bucket_id TEXT,
    total_size_bytes BIGINT DEFAULT 0,
    file_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bucket_id)
);

-- Index for user_storage_usage
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_user_id ON user_storage_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_usage_bucket_id ON user_storage_usage(bucket_id);

-- Enable RLS
ALTER TABLE user_storage_usage ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own storage usage
DROP POLICY IF EXISTS "Users can view own storage usage" ON user_storage_usage;
CREATE POLICY "Users can view own storage usage"
ON user_storage_usage FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE SETUP COMPLETE
-- =====================================================
