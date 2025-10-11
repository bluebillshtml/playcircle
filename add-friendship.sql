-- =====================================================
-- ADD FRIENDSHIP BETWEEN USERS
-- Using the JSONB user_friends structure
-- =====================================================

-- First, create a profile for the new user if it doesn't exist
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, created_at, updated_at
) VALUES 
(
    '45bab9a3-abba-4090-8fa2-a79c4033e4aa',
    'newuser@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id, username, full_name, first_name, last_name,
    favorite_sports, onboarding_completed, is_active
) VALUES 
(
    '45bab9a3-abba-4090-8fa2-a79c4033e4aa',
    'newuser',
    'New User',
    'New',
    'User',
    ARRAY['padel'],
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Add friendship for user cc13424a-8098-4270-a39a-7b61fb1b5a56
INSERT INTO public.user_friends (
    user_id, friends, friend_requests_sent, friend_requests_received, 
    blocked_users, total_friends
) VALUES 
(
    'cc13424a-8098-4270-a39a-7b61fb1b5a56',
    jsonb_build_array(
        jsonb_build_object(
            'user_id', '45bab9a3-abba-4090-8fa2-a79c4033e4aa',
            'status', 'accepted',
            'added_at', NOW()
        )
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1
)
ON CONFLICT (user_id) DO UPDATE SET
    friends = COALESCE(user_friends.friends, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
            'user_id', '45bab9a3-abba-4090-8fa2-a79c4033e4aa',
            'status', 'accepted',
            'added_at', NOW()
        )
    ),
    total_friends = COALESCE(user_friends.total_friends, 0) + 1,
    updated_at = NOW();

-- Add reciprocal friendship for user 45bab9a3-abba-4090-8fa2-a79c4033e4aa
INSERT INTO public.user_friends (
    user_id, friends, friend_requests_sent, friend_requests_received, 
    blocked_users, total_friends
) VALUES 
(
    '45bab9a3-abba-4090-8fa2-a79c4033e4aa',
    jsonb_build_array(
        jsonb_build_object(
            'user_id', 'cc13424a-8098-4270-a39a-7b61fb1b5a56',
            'status', 'accepted',
            'added_at', NOW()
        )
    ),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1
)
ON CONFLICT (user_id) DO UPDATE SET
    friends = COALESCE(user_friends.friends, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
            'user_id', 'cc13424a-8098-4270-a39a-7b61fb1b5a56',
            'status', 'accepted',
            'added_at', NOW()
        )
    ),
    total_friends = COALESCE(user_friends.total_friends, 0) + 1,
    updated_at = NOW();

-- Verify the friendships were created
SELECT 'Friendships created successfully!' as status;

-- Show the friendships
SELECT 
    uf.user_id,
    p.username,
    uf.friends,
    uf.total_friends
FROM user_friends uf
LEFT JOIN profiles p ON uf.user_id = p.id
WHERE uf.user_id IN ('45bab9a3-abba-4090-8fa2-a79c4033e4aa', 'cc13424a-8098-4270-a39a-7b61fb1b5a56')
ORDER BY uf.user_id;