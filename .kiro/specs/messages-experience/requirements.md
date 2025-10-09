# Requirements Document

## Introduction

This feature transforms the current "Create Match" tab into a Messages tab that provides beautiful, high-signal group chats for court sessions. Each court session automatically gets its own chat where participants can communicate before, during, and after their games. The experience focuses on contextual messaging tied to specific time-boxed court sessions with automatic participant management and a clean, modern mobile interface.

## Requirements

### Requirement 1

**User Story:** As a sports app user, I want to automatically join a group chat when I join a court session, so that I can communicate with other participants without manual setup.

#### Acceptance Criteria

1. WHEN a user joins a court session THEN the system SHALL automatically add them to that session's group chat
2. WHEN a court session is created THEN the system SHALL automatically create a corresponding group chat
3. WHEN a user leaves a court session THEN the system SHALL remove them from the chat but preserve their message history
4. WHEN a user re-joins a previously left session THEN the system SHALL automatically re-add them to the chat

### Requirement 2

**User Story:** As a user, I want to see my current and recent chats organized by relevance, so that I can quickly find active conversations and recent sessions.

#### Acceptance Criteria

1. WHEN viewing the Messages tab THEN the system SHALL display chats in two sections: "Happening Soon" and "Recent"
2. WHEN a chat session is within 48 hours THEN the system SHALL place it in the "Happening Soon" section
3. WHEN a chat session ended more than 14 days ago THEN the system SHALL hide it from the chat list
4. WHEN displaying chat lists THEN the system SHALL sort chats by latest message timestamp with session start time as fallback
5. WHEN a session is ongoing or ended ≤14 days ago THEN the system SHALL display it in the appropriate section

### Requirement 3

**User Story:** As a user, I want to see essential information about each chat at a glance, so that I can quickly identify the session and its current status.

#### Acceptance Criteria

1. WHEN displaying a chat card THEN the system SHALL show court icon/sport glyph, session title, time range, participant stack, last message snippet, and unread count
2. WHEN there are unread messages THEN the system SHALL display an unread count pill with the number of unread messages
3. WHEN showing participants THEN the system SHALL display a small stack of participant avatars
4. WHEN displaying session information THEN the system SHALL show the court name and time range clearly

### Requirement 4

**User Story:** As a user, I want a beautiful and intuitive chat interface, so that messaging feels natural and engaging.

#### Acceptance Criteria

1. WHEN viewing the chat thread THEN the system SHALL display an oversized header with session name and time chip
2. WHEN displaying messages THEN the system SHALL show them in rounded bubbles with subtle gradients
3. WHEN messages span multiple days THEN the system SHALL show day dividers with pill labels
4. WHEN there are many messages THEN the system SHALL provide infinite scroll with newest messages at bottom
5. WHEN new messages arrive THEN the system SHALL show a floating scroll-to-latest FAB if user is not at bottom

### Requirement 5

**User Story:** As a user, I want quick access to common actions while chatting, so that I can efficiently communicate status and share information.

#### Acceptance Criteria

1. WHEN composing a message THEN the system SHALL provide a pill text field with expandable quick actions
2. WHEN accessing quick actions THEN the system SHALL offer "share location", "On my way", "Running late", and "court photo" options
3. WHEN in a chat thread THEN the system SHALL provide a sticky action bar with "Add friend", "Directions", and "Leave" options
4. WHEN a user selects "Leave" THEN the system SHALL remove them from the chat and session

### Requirement 6

**User Story:** As a user, I want real-time messaging features, so that conversations feel immediate and reliable.

#### Acceptance Criteria

1. WHEN someone is typing THEN the system SHALL display a typing indicator to other participants
2. WHEN sending a message THEN the system SHALL show delivery states (sending/sent/failed)
3. WHEN messages are received THEN the system SHALL update the chat in real-time
4. WHEN a message fails to send THEN the system SHALL provide retry functionality

### Requirement 7

**User Story:** As a user, I want smooth animations and visual feedback, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN chat rows appear THEN the system SHALL use fade/slide animations
2. WHEN unread count changes THEN the system SHALL use springy badge increment animations
3. WHEN sending messages THEN the system SHALL show gentle bubble pop animation
4. WHEN interacting with UI elements THEN the system SHALL provide appropriate haptic feedback

### Requirement 8

**User Story:** As a user with accessibility needs, I want the messaging interface to be fully accessible, so that I can use all features regardless of my abilities.

#### Acceptance Criteria

1. WHEN displaying text THEN the system SHALL maintain minimum 4.5:1 contrast ratio
2. WHEN providing interactive elements THEN the system SHALL ensure large tap targets (minimum 44pt)
3. WHEN user performs actions THEN the system SHALL provide haptic feedback on send and long-press
4. WHEN using screen readers THEN the system SHALL provide appropriate accessibility labels

### Requirement 9

**User Story:** As a user, I want my chat data to be secure and private, so that only session participants can see our conversations.

#### Acceptance Criteria

1. WHEN accessing chats THEN the system SHALL only show chats where the user is a member
2. WHEN viewing messages THEN the system SHALL only display messages from chats the user belongs to
3. WHEN querying chat data THEN the system SHALL enforce row-level security policies
4. WHEN a user leaves a session THEN the system SHALL immediately restrict their access to new messages

### Requirement 10

**User Story:** As a user, I want the Messages tab to replace the Create Match functionality seamlessly, so that the app navigation remains intuitive.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display "Messages" instead of "Create Match" in the tab bar
2. WHEN tapping the Messages tab THEN the system SHALL navigate to the chat list view
3. WHEN the Messages tab is active THEN the system SHALL show appropriate tab icon and styling
4. WHEN users expect match creation THEN the system SHALL provide alternative access through other navigation paths