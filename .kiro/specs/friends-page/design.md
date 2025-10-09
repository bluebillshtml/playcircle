# Design Document

## Overview

The Friends page is a replacement for the old "Matches" tab, designed to help users discover and connect with other players they've recently interacted with. The page emphasizes simplicity and beauty while providing powerful social features for building meaningful connections through shared sports experiences.

The design follows the app's existing glass card aesthetic with rounded corners, soft shadows, and subtle blur effects. The page uses a single-screen layout with three main sections: Suggested Friends, Recent Members, and Friend Requests, plus a compact settings sheet for privacy controls.

## Architecture

### Component Structure
```
FriendsScreen
├── Header (with search and settings)
├── SuggestedFriendsSection
│   ├── HorizontalScrollView
│   └── FriendChip[]
├── RecentMembersSection
│   ├── VerticalList
│   └── MemberRow[]
├── RequestsSection (conditional)
│   └── RequestStrip[]
└── SettingsBottomSheet
    └── PrivacyToggles
```

### Data Flow
- **FriendsScreen** manages overall state and coordinates between sections
- **useFriends** hook handles data fetching and friend operations
- **usePrivacySettings** hook manages privacy preferences
- Real-time updates via Supabase subscriptions for friend requests and status changes

### State Management
```javascript
const [suggestedFriends, setSuggestedFriends] = useState([]);
const [recentMembers, setRecentMembers] = useState([]);
const [pendingRequests, setPendingRequests] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [settingsVisible, setSettingsVisible] = useState(false);
const [privacySettings, setPrivacySettings] = useState({
  allowFriendRequests: 'everyone', // 'everyone' | 'friends-of-friends' | 'no-one'
  showOnlineStatus: true
});
```

## Components and Interfaces

### FriendsScreen Component
Main screen component that orchestrates the friends experience.

**Props:**
- `navigation`: React Navigation object

**Key Methods:**
- `handleSearch(query)`: Filters friends and members by name/handle
- `handleAddFriend(userId)`: Sends friend request
- `handleMessage(userId)`: Opens chat with user
- `handleInvite(userId)`: Opens invitation flow
- `toggleSettings()`: Shows/hides privacy settings

### FriendChip Component
Horizontal card component for suggested friends section.

**Props:**
```javascript
{
  user: {
    id: string,
    name: string,
    avatar_url: string,
    sport_tags: string[],
    mutual_sessions: number,
    username: string
  },
  onAddFriend: (userId) => void,
  onMessage: (userId) => void,
  onInvite: (userId) => void
}
```

**Design:**
- Glass card with rounded 2xl corners (24px radius)
- Avatar (48px) with sport tags below
- Mutual sessions count as small badge
- Primary CTA: "Add Friend" button
- Overflow menu for Message/Invite actions

### MemberRow Component
Vertical list item for recent members section.

**Props:**
```javascript
{
  user: {
    id: string,
    name: string,
    avatar_url: string,
    last_interaction: {
      type: 'session' | 'chat',
      location: string,
      court: string,
      time_ago: string
    }
  },
  onAddFriend: (userId) => void,
  onMessage: (userId) => void,
  onInvite: (userId) => void
}
```

**Design:**
- Full-width row with left-aligned avatar (40px)
- Name and interaction context stacked
- Right-aligned action buttons (Message, Invite, Add Friend)
- Subtle separator between rows

### RequestStrip Component
Compact component for pending friend requests.

**Props:**
```javascript
{
  request: {
    id: string,
    from_user: {
      id: string,
      name: string,
      avatar_url: string
    },
    created_at: string
  },
  onAccept: (requestId) => void,
  onDecline: (requestId) => void
}
```

### SettingsBottomSheet Component
Modal bottom sheet for privacy settings.

**Props:**
```javascript
{
  visible: boolean,
  onClose: () => void,
  settings: PrivacySettings,
  onUpdateSettings: (settings) => void
}
```

**Settings:**
- Allow friend requests: Everyone / Friends of friends / No one
- Show online status: On / Off

## Data Models

### User Model
```javascript
{
  id: string,
  username: string,
  full_name: string,
  avatar_url: string,
  online_status: boolean,
  last_seen: string,
  sport_preferences: string[]
}
```

### SuggestedFriend Model
```javascript
{
  user: User,
  mutual_sessions: number,
  sport_tags: string[],
  last_played_together: string,
  friendship_status: 'none' | 'requested' | 'friends'
}
```

### RecentMember Model
```javascript
{
  user: User,
  last_interaction: {
    type: 'session' | 'chat',
    session_title?: string,
    court_name?: string,
    location?: string,
    time_ago: string
  },
  friendship_status: 'none' | 'requested' | 'friends'
}
```

### FriendRequest Model
```javascript
{
  id: string,
  from_user_id: string,
  to_user_id: string,
  status: 'pending' | 'accepted' | 'declined',
  created_at: string,
  from_user: User
}
```

### PrivacySettings Model
```javascript
{
  user_id: string,
  allow_friend_requests: 'everyone' | 'friends-of-friends' | 'no-one',
  show_online_status: boolean,
  updated_at: string
}
```

## Database Schema Extensions

### New Tables

#### friendships
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

#### user_privacy_settings
```sql
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  allow_friend_requests TEXT CHECK (allow_friend_requests IN ('everyone', 'friends-of-friends', 'no-one')) DEFAULT 'everyone',
  show_online_status BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Views

#### suggested_friends_view
```sql
CREATE VIEW suggested_friends_view AS
SELECT DISTINCT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  COUNT(DISTINCT ms1.session_id) as mutual_sessions,
  MAX(ms1.created_at) as last_played_together,
  ARRAY_AGG(DISTINCT s.sport_id) as sport_tags
FROM profiles p
JOIN match_sessions ms1 ON p.id = ms1.user_id
JOIN match_sessions ms2 ON ms1.session_id = ms2.session_id 
JOIN sessions s ON ms1.session_id = s.id
WHERE ms2.user_id = $1 -- current user
  AND p.id != $1 -- exclude self
  AND ms1.created_at >= NOW() - INTERVAL '14 days'
  AND NOT EXISTS (
    SELECT 1 FROM friendships f 
    WHERE (f.user1_id = $1 AND f.user2_id = p.id) 
       OR (f.user2_id = $1 AND f.user1_id = p.id)
  )
GROUP BY p.id, p.username, p.full_name, p.avatar_url;
```

#### recent_members_view
```sql
CREATE VIEW recent_members_view AS
(
  -- From recent sessions
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    'session' as interaction_type,
    v.name as location,
    c.name as court_name,
    s.created_at as last_interaction
  FROM profiles p
  JOIN match_sessions ms1 ON p.id = ms1.user_id
  JOIN match_sessions ms2 ON ms1.session_id = ms2.session_id
  JOIN sessions s ON ms1.session_id = s.id
  JOIN courts c ON s.court_id = c.id
  JOIN venues v ON c.venue_id = v.id
  WHERE ms2.user_id = $1
    AND p.id != $1
    AND s.created_at >= NOW() - INTERVAL '14 days'
)
UNION
(
  -- From recent chats
  SELECT DISTINCT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    'chat' as interaction_type,
    'Chat' as location,
    '' as court_name,
    cm.created_at as last_interaction
  FROM profiles p
  JOIN chat_members cm1 ON p.id = cm1.user_id
  JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
  WHERE cm2.user_id = $1
    AND p.id != $1
    AND cm1.created_at >= NOW() - INTERVAL '14 days'
)
ORDER BY last_interaction DESC;
```

## Error Handling

### Network Errors
- Show retry button with exponential backoff
- Cache last successful data for offline viewing
- Display appropriate error messages for different failure types

### Permission Errors
- Handle blocked friend requests gracefully
- Show appropriate messaging when privacy settings prevent actions
- Respect user privacy settings in all interactions

### Validation Errors
- Validate friend request eligibility before sending
- Prevent duplicate friend requests
- Handle edge cases like deleted users

## Testing Strategy

### Unit Tests
- **FriendChip Component**: Test rendering, interactions, and state changes
- **MemberRow Component**: Test action buttons and data display
- **useFriends Hook**: Test data fetching, caching, and error handling
- **Privacy Settings**: Test toggle functionality and persistence

### Integration Tests
- **Friend Request Flow**: End-to-end testing of send/accept/decline
- **Search Functionality**: Test filtering across different data sources
- **Real-time Updates**: Test subscription handling and UI updates
- **Privacy Enforcement**: Test that privacy settings are respected

### Accessibility Tests
- **Screen Reader**: Test with VoiceOver/TalkBack
- **Contrast Ratios**: Verify 4.5:1 minimum contrast
- **Touch Targets**: Ensure 44px minimum tap areas
- **Focus Management**: Test keyboard navigation flow

### Performance Tests
- **List Rendering**: Test with large datasets (1000+ items)
- **Search Performance**: Test real-time filtering responsiveness
- **Memory Usage**: Monitor for memory leaks in long sessions
- **Network Efficiency**: Test data fetching optimization

### Visual Regression Tests
- **Glass Card Effects**: Verify blur and transparency rendering
- **Animation Smoothness**: Test micro-interactions and transitions
- **Responsive Layout**: Test on different screen sizes
- **Dark/Light Mode**: Verify theme consistency

## Accessibility Considerations

### Screen Reader Support
- Descriptive labels for all interactive elements
- Proper heading hierarchy for content sections
- Announce state changes (friend request sent, etc.)

### Visual Accessibility
- 4.5:1 contrast ratio for all text
- Clear visual focus indicators
- Sufficient color contrast for glass card elements

### Motor Accessibility
- Minimum 44px touch targets for all interactive elements
- Adequate spacing between interactive elements
- Support for external keyboards and switch controls

### Cognitive Accessibility
- Clear, simple language in all UI text
- Consistent interaction patterns
- Obvious visual hierarchy and grouping