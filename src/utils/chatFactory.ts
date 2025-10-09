// =====================================================
// CHAT DATA FACTORY
// =====================================================
// Factory functions for creating mock data and test objects

import {
  Chat,
  ChatListItem,
  Message,
  ChatMember,
  CourtSession,
  User,
  Court,
  MessageMetadata,
  LocationMetadata,
  PhotoMetadata,
  StatusMetadata,
  UUID,
  Timestamp,
  MessageType,
  QuickActionType,
} from '../types/chat';
import { MESSAGE_TYPES, QUICK_ACTIONS, SPORT_CONFIG } from '../constants/chat';

// =====================================================
// ID GENERATORS
// =====================================================

/**
 * Generate a mock UUID for testing
 */
export const generateMockUUID = (): UUID => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a mock timestamp
 */
export const generateMockTimestamp = (offsetMinutes = 0): Timestamp => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString();
};

// =====================================================
// USER FACTORY
// =====================================================

/**
 * Create a mock user
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  const names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const username = randomName.toLowerCase().replace(' ', '.');
  
  return {
    id: generateMockUUID(),
    username,
    full_name: randomName,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    ...overrides,
  };
};

/**
 * Create multiple mock users
 */
export const createMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, () => createMockUser());
};

// =====================================================
// COURT FACTORY
// =====================================================

/**
 * Create a mock court
 */
export const createMockCourt = (overrides: Partial<Court> = {}): Court => {
  const courtNames = [
    'Downtown Sports Club',
    'Sunset Tennis Center', 
    'Elite Padel Academy',
    'City Basketball Arena',
    'Riverside Sports Complex',
  ];
  
  const addresses = [
    '123 Main St, San Francisco, CA',
    '456 Ocean Ave, San Francisco, CA',
    '789 Park Blvd, San Francisco, CA',
    '321 Market St, San Francisco, CA',
    '654 Mission St, San Francisco, CA',
  ];
  
  const randomName = courtNames[Math.floor(Math.random() * courtNames.length)];
  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
  
  return {
    id: generateMockUUID(),
    name: randomName,
    address: randomAddress,
    city: 'San Francisco',
    state: 'CA',
    sports: ['padel', 'tennis'],
    price_per_hour: 40 + Math.floor(Math.random() * 30),
    image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
    ...overrides,
  };
};

// =====================================================
// COURT SESSION FACTORY
// =====================================================

/**
 * Create a mock court session
 */
export const createMockCourtSession = (overrides: Partial<CourtSession> = {}): CourtSession => {
  const sportIds = Object.keys(SPORT_CONFIG);
  const randomSport = sportIds[Math.floor(Math.random() * sportIds.length)];
  
  const today = new Date();
  const sessionDate = new Date(today);
  sessionDate.setDate(today.getDate() + Math.floor(Math.random() * 7)); // Next 7 days
  
  const hours = 9 + Math.floor(Math.random() * 12); // 9 AM to 9 PM
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  
  return {
    id: generateMockUUID(),
    court_id: generateMockUUID(),
    host_id: generateMockUUID(),
    sport_id: randomSport,
    match_date: sessionDate.toISOString().split('T')[0],
    match_time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    duration_minutes: 90,
    max_players: 4,
    current_players: 1 + Math.floor(Math.random() * 3),
    skill_level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    match_type: Math.random() > 0.5 ? 'casual' : 'competitive',
    price_per_player: 15 + Math.floor(Math.random() * 20),
    description: 'Looking for players to join this session!',
    status: 'open',
    created_at: generateMockTimestamp(-60),
    updated_at: generateMockTimestamp(-30),
    court: createMockCourt(),
    host: createMockUser(),
    ...overrides,
  };
};

// =====================================================
// MESSAGE METADATA FACTORY
// =====================================================

/**
 * Create mock location metadata
 */
export const createMockLocationMetadata = (overrides: Partial<LocationMetadata> = {}): LocationMetadata => {
  return {
    lat: 37.7749 + (Math.random() - 0.5) * 0.1, // San Francisco area
    lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    address: '123 Main St, San Francisco, CA',
    accuracy: 10 + Math.floor(Math.random() * 20),
    ...overrides,
  };
};

/**
 * Create mock photo metadata
 */
export const createMockPhotoMetadata = (overrides: Partial<PhotoMetadata> = {}): PhotoMetadata => {
  return {
    photo_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=150&fit=crop',
    width: 400,
    height: 300,
    file_size: 150000 + Math.floor(Math.random() * 500000),
    ...overrides,
  };
};

/**
 * Create mock status metadata
 */
export const createMockStatusMetadata = (overrides: Partial<StatusMetadata> = {}): StatusMetadata => {
  const actions = Object.values(QUICK_ACTIONS);
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
  return {
    status: randomAction,
    timestamp: generateMockTimestamp(),
    ...overrides,
  };
};

/**
 * Create mock message metadata based on type
 */
export const createMockMessageMetadata = (messageType: MessageType): MessageMetadata => {
  switch (messageType) {
    case MESSAGE_TYPES.LOCATION:
      return { location: createMockLocationMetadata() };
    case MESSAGE_TYPES.PHOTO:
      return { photo: createMockPhotoMetadata() };
    case MESSAGE_TYPES.STATUS:
      return { status: createMockStatusMetadata() };
    default:
      return {};
  }
};

// =====================================================
// MESSAGE FACTORY
// =====================================================

/**
 * Create a mock message
 */
export const createMockMessage = (overrides: Partial<Message> = {}): Message => {
  const messageTypes = Object.values(MESSAGE_TYPES);
  const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)] as MessageType;
  
  const textMessages = [
    'Hey everyone! Looking forward to the game!',
    'What time should we meet?',
    'I\'ll bring some water bottles',
    'The weather looks perfect for playing',
    'See you all there!',
    'Great game everyone!',
    'Thanks for organizing this',
    'Count me in for next time',
  ];
  
  let content = textMessages[Math.floor(Math.random() * textMessages.length)];
  let metadata = {};
  
  // Adjust content and metadata based on type
  switch (randomType) {
    case MESSAGE_TYPES.LOCATION:
      content = '📍 Shared location: Downtown Sports Club';
      metadata = createMockMessageMetadata(randomType);
      break;
    case MESSAGE_TYPES.PHOTO:
      content = '📷 Shared a photo';
      metadata = createMockMessageMetadata(randomType);
      break;
    case MESSAGE_TYPES.STATUS:
      const statusMeta = createMockStatusMetadata();
      content = `${statusMeta.status === 'on-my-way' ? 'On my way! 🏃‍♂️' : 
                   statusMeta.status === 'running-late' ? 'Running late, be there soon! ⏰' : 
                   'I\'ve arrived! 📍'}`;
      metadata = { status: statusMeta };
      break;
  }
  
  return {
    id: generateMockUUID(),
    chat_id: generateMockUUID(),
    user_id: generateMockUUID(),
    content,
    message_type: randomType,
    metadata,
    created_at: generateMockTimestamp(-Math.floor(Math.random() * 1440)), // Last 24 hours
    updated_at: generateMockTimestamp(-Math.floor(Math.random() * 1440)),
    is_deleted: false,
    user: createMockUser(),
    delivery_status: 'sent',
    is_optimistic: false,
    ...overrides,
  };
};

/**
 * Create multiple mock messages for a chat
 */
export const createMockMessages = (count: number, chatId: UUID, users: User[] = []): Message[] => {
  const mockUsers = users.length > 0 ? users : createMockUsers(3);
  
  return Array.from({ length: count }, (_, index) => {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    return createMockMessage({
      chat_id: chatId,
      user_id: randomUser.id,
      user: randomUser,
      created_at: generateMockTimestamp(-count * 5 + index * 5), // Spread over time
    });
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

// =====================================================
// CHAT MEMBER FACTORY
// =====================================================

/**
 * Create a mock chat member
 */
export const createMockChatMember = (overrides: Partial<ChatMember> = {}): ChatMember => {
  return {
    id: generateMockUUID(),
    chat_id: generateMockUUID(),
    user_id: generateMockUUID(),
    joined_at: generateMockTimestamp(-Math.floor(Math.random() * 10080)), // Last week
    is_active: true,
    unread_count: Math.floor(Math.random() * 5),
    last_read_at: generateMockTimestamp(-Math.floor(Math.random() * 60)),
    user: createMockUser(),
    ...overrides,
  };
};

/**
 * Create multiple mock chat members
 */
export const createMockChatMembers = (count: number, chatId: UUID): ChatMember[] => {
  return Array.from({ length: count }, () => 
    createMockChatMember({ chat_id: chatId })
  );
};

// =====================================================
// CHAT FACTORY
// =====================================================

/**
 * Create a mock chat
 */
export const createMockChat = (overrides: Partial<Chat> = {}): Chat => {
  const chatId = generateMockUUID();
  const session = createMockCourtSession();
  const members = createMockChatMembers(3, chatId);
  const messages = createMockMessages(5, chatId, members.map(m => m.user!));
  const lastMessage = messages[messages.length - 1];
  
  return {
    id: chatId,
    court_session_id: session.id,
    created_at: generateMockTimestamp(-Math.floor(Math.random() * 10080)),
    updated_at: lastMessage?.created_at || generateMockTimestamp(-30),
    last_message_at: lastMessage?.created_at,
    is_active: true,
    session,
    last_message: lastMessage,
    unread_count: Math.floor(Math.random() * 3),
    members,
    member_count: members.length,
    ...overrides,
  };
};

// =====================================================
// CHAT LIST ITEM FACTORY
// =====================================================

/**
 * Create a mock chat list item
 */
export const createMockChatListItem = (overrides: Partial<ChatListItem> = {}): ChatListItem => {
  const session = createMockCourtSession();
  const sportConfig = SPORT_CONFIG[session.sport_id as keyof typeof SPORT_CONFIG];
  
  const sessionTitle = `${session.court?.name} – ${new Date(session.match_date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} ${session.match_time}`;
  
  const lastMessageContent = [
    'See you there!',
    'On my way! 🏃‍♂️',
    'Great game everyone!',
    '📍 Shared location',
    '📷 Shared a photo',
  ][Math.floor(Math.random() * 5)];
  
  const isHappeningSoon = Math.random() > 0.6; // 40% chance
  
  return {
    chat_id: generateMockUUID(),
    court_session_id: session.id,
    session_title: sessionTitle,
    session_date: session.match_date,
    session_time: session.match_time,
    session_duration: session.duration_minutes,
    court_name: session.court?.name || 'Court',
    sport_id: session.sport_id,
    last_message_content: lastMessageContent,
    last_message_at: generateMockTimestamp(-Math.floor(Math.random() * 1440)),
    last_message_user_name: 'Alice',
    unread_count: Math.floor(Math.random() * 4),
    member_count: 2 + Math.floor(Math.random() * 3),
    is_happening_soon: isHappeningSoon,
    sport_icon: sportConfig?.icon || 'ellipse',
    time_display: session.match_time,
    relative_time: '2h ago',
    ...overrides,
  };
};

/**
 * Create multiple mock chat list items
 */
export const createMockChatListItems = (count: number): ChatListItem[] => {
  return Array.from({ length: count }, () => createMockChatListItem());
};

// =====================================================
// SCENARIO FACTORIES
// =====================================================

/**
 * Create a complete chat scenario with session, members, and messages
 */
export const createMockChatScenario = (messageCount = 10, memberCount = 4) => {
  const session = createMockCourtSession();
  const chatId = generateMockUUID();
  const users = createMockUsers(memberCount);
  const members = users.map(user => createMockChatMember({
    chat_id: chatId,
    user_id: user.id,
    user,
  }));
  const messages = createMockMessages(messageCount, chatId, users);
  const chat = createMockChat({
    id: chatId,
    court_session_id: session.id,
    session,
    members,
    member_count: members.length,
    last_message: messages[messages.length - 1],
    last_message_at: messages[messages.length - 1]?.created_at,
  });
  
  return {
    chat,
    session,
    members,
    messages,
    users,
  };
};

/**
 * Create a mock chat list with mixed scenarios
 */
export const createMockChatListScenario = (count = 10) => {
  const items = Array.from({ length: count }, (_, index) => {
    const isHappeningSoon = index < count / 3; // First third are happening soon
    const hasUnread = Math.random() > 0.5;
    
    return createMockChatListItem({
      is_happening_soon: isHappeningSoon,
      unread_count: hasUnread ? Math.floor(Math.random() * 5) + 1 : 0,
    });
  });
  
  // Sort by happening soon first, then by last message time
  return items.sort((a, b) => {
    if (a.is_happening_soon && !b.is_happening_soon) return -1;
    if (!a.is_happening_soon && b.is_happening_soon) return 1;
    
    const aTime = new Date(a.last_message_at || 0).getTime();
    const bTime = new Date(b.last_message_at || 0).getTime();
    return bTime - aTime;
  });
};

// =====================================================
// UTILITY FACTORIES
// =====================================================

/**
 * Create a mock optimistic message for testing
 */
export const createMockOptimisticMessage = (
  chatId: UUID,
  userId: UUID,
  content: string,
  user?: User
): Message => {
  return createMockMessage({
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    chat_id: chatId,
    user_id: userId,
    content,
    user: user || createMockUser({ id: userId }),
    delivery_status: 'sending',
    is_optimistic: true,
    created_at: generateMockTimestamp(),
  });
};

/**
 * Create a mock failed message for testing
 */
export const createMockFailedMessage = (
  chatId: UUID,
  userId: UUID,
  content: string,
  user?: User
): Message => {
  return createMockMessage({
    chat_id: chatId,
    user_id: userId,
    content,
    user: user || createMockUser({ id: userId }),
    delivery_status: 'failed',
    is_optimistic: false,
    created_at: generateMockTimestamp(-5),
  });
};