-- =====================================================
-- USER_FRIENDS JSONB FUNCTIONS
-- Functions to manage friend requests using JSONB structure
-- =====================================================

-- Function to send friend request using user_friends JSONB structure
CREATE OR REPLACE FUNCTION send_friend_request_jsonb(sender_id UUID, recipient_id UUID)
RETURNS UUID AS $$
DECLARE
  friendship_id UUID := gen_random_uuid();
  existing_requests JSONB;
  existing_sent JSONB;
  new_request JSONB;
  new_sent JSONB;
BEGIN
  -- Check if users are the same
  IF sender_id = recipient_id THEN
    RAISE EXCEPTION 'Cannot send friend request to yourself';
  END IF;

  -- Get recipient's current friend_requests_received
  SELECT friend_requests_received INTO existing_requests
  FROM user_friends
  WHERE user_id = recipient_id;

  -- Initialize if null
  IF existing_requests IS NULL THEN
    existing_requests := '[]'::jsonb;
  END IF;

  -- Check if request already exists
  IF existing_requests @> jsonb_build_array(jsonb_build_object('user_id', sender_id)) THEN
    RAISE EXCEPTION 'Friend request already sent';
  END IF;

  -- Create new request object
  new_request := jsonb_build_object(
    'user_id', sender_id,
    'status', 'pending',
    'requested_at', NOW()
  );

  -- Update or insert recipient's friend_requests_received
  INSERT INTO user_friends (user_id, friend_requests_received, updated_at)
  VALUES (recipient_id, jsonb_build_array(new_request), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    friend_requests_received = COALESCE(user_friends.friend_requests_received, '[]'::jsonb) || jsonb_build_array(new_request),
    updated_at = NOW();

  -- Get sender's current friend_requests_sent
  SELECT friend_requests_sent INTO existing_sent
  FROM user_friends
  WHERE user_id = sender_id;

  -- Initialize if null
  IF existing_sent IS NULL THEN
    existing_sent := '[]'::jsonb;
  END IF;

  -- Create new sent request object
  new_sent := jsonb_build_object(
    'user_id', recipient_id,
    'status', 'pending',
    'requested_at', NOW()
  );

  -- Update or insert sender's friend_requests_sent
  INSERT INTO user_friends (user_id, friend_requests_sent, updated_at)
  VALUES (sender_id, jsonb_build_array(new_sent), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    friend_requests_sent = COALESCE(user_friends.friend_requests_sent, '[]'::jsonb) || jsonb_build_array(new_sent),
    updated_at = NOW();

  RETURN friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept friend request using user_friends JSONB structure
CREATE OR REPLACE FUNCTION accept_friend_request_jsonb(accepter_id UUID, sender_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  friend_obj JSONB;
BEGIN
  -- Remove from recipient's friend_requests_received
  UPDATE user_friends
  SET 
    friend_requests_received = (
      SELECT jsonb_agg(elem)
      FROM jsonb_array_elements(friend_requests_received) elem
      WHERE elem->>'user_id' != sender_id::text
    ),
    friends = COALESCE(friends, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'user_id', sender_id,
        'status', 'accepted',
        'added_at', NOW()
      )
    ),
    total_friends = COALESCE(total_friends, 0) + 1,
    updated_at = NOW()
  WHERE user_id = accepter_id;

  -- Remove from sender's friend_requests_sent and add to friends
  UPDATE user_friends
  SET 
    friend_requests_sent = (
      SELECT jsonb_agg(elem)
      FROM jsonb_array_elements(friend_requests_sent) elem
      WHERE elem->>'user_id' != accepter_id::text
    ),
    friends = COALESCE(friends, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'user_id', accepter_id,
        'status', 'accepted',
        'added_at', NOW()
      )
    ),
    total_friends = COALESCE(total_friends, 0) + 1,
    updated_at = NOW()
  WHERE user_id = sender_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline friend request using user_friends JSONB structure
CREATE OR REPLACE FUNCTION decline_friend_request_jsonb(decliner_id UUID, sender_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove from recipient's friend_requests_received
  UPDATE user_friends
  SET 
    friend_requests_received = (
      SELECT jsonb_agg(elem)
      FROM jsonb_array_elements(friend_requests_received) elem
      WHERE elem->>'user_id' != sender_id::text
    ),
    updated_at = NOW()
  WHERE user_id = decliner_id;

  -- Update sender's friend_requests_sent status to declined
  UPDATE user_friends
  SET 
    friend_requests_sent = (
      SELECT jsonb_agg(
        CASE 
          WHEN elem->>'user_id' = decliner_id::text 
          THEN jsonb_set(elem, '{status}', '"declined"'::jsonb)
          ELSE elem
        END
      )
      FROM jsonb_array_elements(friend_requests_sent) elem
    ),
    updated_at = NOW()
  WHERE user_id = sender_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION send_friend_request_jsonb(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_friend_request_jsonb(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decline_friend_request_jsonb(UUID, UUID) TO authenticated;

