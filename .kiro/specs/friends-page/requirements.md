# Requirements Document

## Introduction

The Friends page is a new feature that replaces the old "Matches" tab in the mobile sports-matching app. This page provides users with a streamlined way to discover and connect with other players they've recently interacted with, manage friend requests, and control their privacy settings. The page focuses on building meaningful connections through shared sports experiences while maintaining a simple and beautiful user interface.

## Requirements

### Requirement 1

**User Story:** As a sports app user, I want to see suggested friends based on people I've played with recently, so that I can easily connect with players I've had good experiences with.

#### Acceptance Criteria

1. WHEN I open the Friends page THEN the system SHALL display a "Suggested Friends" section showing people I played with in the last 14 days
2. WHEN displaying suggested friends THEN the system SHALL show horizontal chips/cards with avatar, name, sport tags, and mutual session count
3. WHEN I tap "Add Friend" on a suggested friend THEN the system SHALL send a friend request with one tap
4. WHEN I access overflow actions on a suggested friend THEN the system SHALL provide Message and Invite options
5. IF a person is already my friend OR I already sent them a request OR they are blocked THEN the system SHALL exclude them from suggested friends
6. WHEN calculating suggested friends THEN the system SHALL only include co-participants from sessions within the last 14 days

### Requirement 2

**User Story:** As a sports app user, I want to see recent members I've interacted with, so that I can quickly reconnect with people I've played with or chatted with recently.

#### Acceptance Criteria

1. WHEN I view the Friends page THEN the system SHALL display a "Recent Members" section in a vertical list format
2. WHEN displaying recent members THEN the system SHALL show avatar, name, and context like "Played at Riverside – Court 2 • 4d ago"
3. WHEN I interact with a recent member row THEN the system SHALL provide Message, Invite, and Add Friend actions
4. WHEN calculating recent members THEN the system SHALL include both co-participants from sessions ≤14 days AND people from chats I'm in ≤14 days
5. WHEN there are duplicate entries THEN the system SHALL deduplicate the recent members list
6. WHEN displaying interaction context THEN the system SHALL show the most recent interaction type and location

### Requirement 3

**User Story:** As a sports app user, I want to manage incoming and outgoing friend requests, so that I can control who I connect with on the platform.

#### Acceptance Criteria

1. WHEN I have pending friend requests THEN the system SHALL display a "Requests" section as a small strip
2. WHEN I receive a friend request THEN the system SHALL show Accept and Decline options inline
3. WHEN I send a friend request THEN the system SHALL show "Requested" state on the Add Friend button
4. WHEN I accept a friend request THEN the system SHALL establish mutual friendship connection
5. WHEN I decline a friend request THEN the system SHALL remove the request without creating a connection
6. IF I have no pending requests THEN the system SHALL hide the Requests section

### Requirement 4

**User Story:** As a sports app user, I want to search for friends by name or handle, so that I can quickly find specific people I want to connect with.

#### Acceptance Criteria

1. WHEN I view the Friends page header THEN the system SHALL display a compact search field
2. WHEN I type in the search field THEN the system SHALL filter results by name or handle in real-time
3. WHEN searching THEN the system SHALL search across both suggested friends and recent members
4. WHEN I clear the search THEN the system SHALL restore the original lists
5. WHEN no search results are found THEN the system SHALL display an appropriate empty state message

### Requirement 5

**User Story:** As a sports app user, I want to control my privacy settings for friend requests and online status, so that I can manage my visibility and interactions on the platform.

#### Acceptance Criteria

1. WHEN I tap the settings icon in the header THEN the system SHALL open a bottom sheet with privacy controls
2. WHEN I access privacy settings THEN the system SHALL provide "Allow friend requests" toggle with options: Everyone, Friends of friends, No one
3. WHEN I access privacy settings THEN the system SHALL provide "Show online status" toggle with On/Off options
4. WHEN someone tries to send me a friend request AND my setting is "No one" THEN the system SHALL block the inbound request
5. WHEN my "Show online status" is off THEN the system SHALL hide my presence status from other users
6. WHEN I change privacy settings THEN the system SHALL save the changes immediately

### Requirement 6

**User Story:** As a sports app user, I want the Friends page to have beautiful and accessible design, so that I can enjoy using the feature regardless of my abilities.

#### Acceptance Criteria

1. WHEN I view the Friends page THEN the system SHALL use glass cards with rounded 2xl corners and soft shadows
2. WHEN I interact with elements THEN the system SHALL provide micro-interactions with fade/slide animations
3. WHEN I tap interactive elements THEN the system SHALL provide haptic feedback on Accept/Add actions
4. WHEN I view any text THEN the system SHALL ensure 4.5:1 contrast ratio for accessibility
5. WHEN I tap any interactive element THEN the system SHALL provide minimum 44px tap areas
6. WHEN using screen readers THEN the system SHALL provide descriptive labels for all interactive elements
7. WHEN the page loads THEN the system SHALL display a subtle blur header effect

### Requirement 7

**User Story:** As a sports app user, I want immediate messaging and invitation capabilities, so that I can quickly coordinate games with friends and recent players.

#### Acceptance Criteria

1. WHEN I tap "Message" on any user THEN the system SHALL open a direct message thread with that person
2. WHEN I tap "Invite" on any user THEN the system SHALL open the invitation flow for that person
3. WHEN I send a message or invite THEN the system SHALL provide immediate feedback that the action was completed
4. WHEN messaging or inviting THEN the system SHALL respect the recipient's privacy settings
5. WHEN the action fails THEN the system SHALL display an appropriate error message with retry option