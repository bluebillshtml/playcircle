// =====================================================
// CHAT DATA TRANSFORMERS
// =====================================================
// Utilities for transforming data between API responses and TypeScript interfaces

import {
  Chat,
  ChatListItem,
  Message,
  ChatMember,
  CourtSession,
  User,
  Court,
  GroupedChats,
  MessageMetadata,
  LocationMetadata,
  StatusMetadata,
  PhotoMetadata,
  UUID,
  Timestamp,
} from '../types/chat';
import {
  formatSessionTitle,
  formatTime,
  getRelativeTime,
  getSportIcon,
  isHappeningSoon,
  isChatVisible,
  groupChats,
} from '../services/chatUtils';

// =====================================================
// API RESPONSE TRANSFORMERS
// =====================================================

/**
 * Transform raw database user to User interface
 */
export const transformUser = (rawUser: any): User => {
  if (!rawUser) {
    return {
      id: '',
      username: 'Unknown',
      full_name: 'Unknown User',
    };
  }

  return {
    id: rawUser.id || '',
    username: rawUser.username || 'user',
    full_name: rawUser.full_name || rawUser.username || 'User',
    avatar_url: rawUser.avatar_url || undefined,
    phone: rawUser.phone || undefined,
    bio: rawUser.bio || undefined,
  };
};

/**
 * Transform raw database court to Court interface
 */
export const transformCourt = (rawCourt: any): Court | undefined => {
  if (!rawCourt) return undefined;

  return {
    id: rawCourt.id,
    name: rawCourt.name || 'Unknown Court',
    address: rawCourt.address || undefined,
    city: rawCourt.city || undefined,
    state: rawCourt.state || undefined,
    image_url: rawCourt.image_url || undefined,
    sports: rawCourt.sports || [],
    price_per_hour: rawCourt.price_per_hour || undefined,
  };
};

/**
 * Transform raw database session/match to CourtSession interface
 */
export const transformCourtSession = (rawSession: any): CourtSession | undefined => {
  if (!rawSession) return undefined;

  return {
    id: rawSession.id,
    court_id: rawSession.court_id || undefined,
    host_id: rawSession.host_id,
    sport_id: rawSession.sport_id || 'padel',
    match_date: rawSession.match_date,
    match_time: rawSession.match_time,
    duration_minutes: rawSession.duration_minutes || 90,
    max_players: rawSession.max_players || 4,
    current_players: rawSession.current_players || 1,
    skill_level: rawSession.skill_level || 'Intermediate',
    match_type: rawSession.match_type || 'casual',
    price_per_player: rawSession.price_per_player || undefined,
    description: rawSession.description || undefined,
    status: rawSession.status || 'open',
    created_at: rawSession.created_at,
    updated_at: rawSession.updated_at,
    
    // Transform joined data
    court: transformCourt(rawSession.court),
    host: transformUser(rawSession.host),
    participants_count: rawSession.participants_count || rawSession.current_players || 1,
    user_is_member: rawSession.user_is_member || false,
  };
};

/**
 * Transform raw database message metadata
 */
export const transformMessageMetadata = (rawMetadata: any): MessageMetadata => {
  if (!rawMetadata || typeof rawMetadata !== 'object') {
    return {};
  }

  const metadata: MessageMetadata = {};

  // Transform location metadata
  if (rawMetadata.location) {
    const location: LocationMetadata = {
      lat: rawMetadata.location.lat || 0,
      lng: rawMetadata.location.lng || 0,
      address: rawMetadata.location.address || undefined,
      accuracy: rawMetadata.location.accuracy || undefined,
    };
    metadata.location = location;
  }

  // Transform status metadata
  if (rawMetadata.status) {
    const status: StatusMetadata = {
      status: rawMetadata.status,
      timestamp: rawMetadata.timestamp || undefined,
    };
    metadata.status = status;
  }

  // Transform photo metadata
  if (rawMetadata.photo_url) {
    const photo: PhotoMetadata = {
      photo_url: rawMetadata.photo_url,
      thumbnail_url: rawMetadata.thumbnail_url || undefined,
      width: rawMetadata.width || undefined,
      height: rawMetadata.height || undefined,
      file_size: rawMetadata.file_size || undefined,
    };
    metadata.photo = photo;
  }

  // Copy any additional metadata
  Object.keys(rawMetadata).forEach(key => {
    if (!['location', 'status', 'photo_url', 'thumbnail_url', 'width', 'height', 'file_size', 'timestamp'].includes(key)) {
      metadata[key] = rawMetadata[key];
    }
  });

  return metadata;
};

/**
 * Transform raw database message to Message interface
 */
export const transformMessage = (rawMessage: any): Message => {
  return {
    id: rawMessage.id,
    chat_id: rawMessage.chat_id,
    user_id: rawMessage.user_id,
    content: rawMessage.content || '',
    message_type: rawMessage.message_type || 'text',
    metadata: transformMessageMetadata(rawMessage.metadata),
    created_at: rawMessage.created_at,
    updated_at: rawMessage.updated_at,
    is_deleted: rawMessage.is_deleted || false,
    
    // Transform joined data
    user: transformUser(rawMessage.user),
    
    // Client-side properties
    delivery_status: rawMessage.delivery_status || 'sent',
    is_optimistic: rawMessage.is_optimistic || false,
  };
};

/**
 * Transform raw database chat member to ChatMember interface
 */
export const transformChatMember = (rawMember: any): ChatMember => {
  return {
    id: rawMember.id,
    chat_id: rawMember.chat_id,
    user_id: rawMember.user_id,
    joined_at: rawMember.joined_at,
    left_at: rawMember.left_at || undefined,
    is_active: rawMember.is_active !== false, // Default to true
    unread_count: rawMember.unread_count || 0,
    last_read_at: rawMember.last_read_at || rawMember.joined_at,
    
    // Transform joined data
    user: transformUser(rawMember.user),
  };
};

/**
 * Transform raw database chat to Chat interface
 */
export const transformChat = (rawChat: any): Chat => {
  return {
    id: rawChat.id,
    court_session_id: rawChat.court_session_id,
    created_at: rawChat.created_at,
    updated_at: rawChat.updated_at,
    last_message_at: rawChat.last_message_at || undefined,
    is_active: rawChat.is_active !== false, // Default to true
    
    // Transform joined data
    session: transformCourtSession(rawChat.session),
    last_message: rawChat.last_message ? transformMessage(rawChat.last_message) : undefined,
    unread_count: rawChat.unread_count || 0,
    members: rawChat.members ? rawChat.members.map(transformChatMember) : undefined,
    member_count: rawChat.member_count || rawChat.members?.length || 0,
  };
};

/**
 * Transform raw chat list response to ChatListItem interface
 */
export const transformChatListItem = (rawItem: any): ChatListItem => {
  const session = transformCourtSession({
    id: rawItem.court_session_id,
    match_date: rawItem.session_date,
    match_time: rawItem.session_time,
    duration_minutes: rawItem.session_duration,
    sport_id: rawItem.sport_id,
    court: { name: rawItem.court_name },
  });

  return {
    chat_id: rawItem.chat_id,
    court_session_id: rawItem.court_session_id,
    session_title: rawItem.session_title || formatSessionTitle(session),
    session_date: rawItem.session_date,
    session_time: rawItem.session_time,
    session_duration: rawItem.session_duration || 90,
    court_name: rawItem.court_name || 'Court',
    sport_id: rawItem.sport_id || 'padel',
    last_message_content: rawItem.last_message_content || undefined,
    last_message_at: rawItem.last_message_at || undefined,
    last_message_user_name: rawItem.last_message_user_name || undefined,
    unread_count: rawItem.unread_count || 0,
    member_count: rawItem.member_count || 0,
    is_happening_soon: rawItem.is_happening_soon || isHappeningSoon(session),
    
    // Computed properties
    sport_icon: getSportIcon(rawItem.sport_id || 'padel'),
    time_display: rawItem.session_time ? formatTime(rawItem.session_time) : '',
    relative_time: rawItem.last_message_at ? getRelativeTime(rawItem.last_message_at) : '',
  };
};

// =====================================================
// COLLECTION TRANSFORMERS
// =====================================================

/**
 * Transform array of raw messages to Message array
 */
export const transformMessages = (rawMessages: any[]): Message[] => {
  if (!Array.isArray(rawMessages)) return [];
  return rawMessages.map(transformMessage);
};

/**
 * Transform array of raw chat members to ChatMember array
 */
export const transformChatMembers = (rawMembers: any[]): ChatMember[] => {
  if (!Array.isArray(rawMembers)) return [];
  return rawMembers.map(transformChatMember);
};

/**
 * Transform array of raw chats to Chat array
 */
export const transformChats = (rawChats: any[]): Chat[] => {
  if (!Array.isArray(rawChats)) return [];
  return rawChats.map(transformChat);
};

/**
 * Transform array of raw chat list items to ChatListItem array with grouping
 */
export const transformChatList = (rawItems: any[]): { items: ChatListItem[], grouped: GroupedChats } => {
  if (!Array.isArray(rawItems)) {
    return {
      items: [],
      grouped: { happeningSoon: [], recent: [] },
    };
  }

  const items = rawItems
    .map(transformChatListItem)
    .filter(item => {
      // Filter out chats that shouldn't be visible
      const session = {
        match_date: item.session_date,
        session_date: item.session_date,
      };
      return isChatVisible(session);
    });

  const grouped = groupChats(items);

  return { items, grouped };
};

// =====================================================
// REVERSE TRANSFORMERS (for API requests)
// =====================================================

/**
 * Transform Message to API request format
 */
export const messageToApiRequest = (message: Partial<Message>) => {
  return {
    chat_id: message.chat_id,
    user_id: message.user_id,
    content: message.content,
    message_type: message.message_type || 'text',
    metadata: message.metadata || {},
  };
};

/**
 * Transform ChatMember to API request format
 */
export const chatMemberToApiRequest = (member: Partial<ChatMember>) => {
  return {
    chat_id: member.chat_id,
    user_id: member.user_id,
    is_active: member.is_active !== false,
  };
};

// =====================================================
// VALIDATION TRANSFORMERS
// =====================================================

/**
 * Validate and transform raw API response
 */
export const validateAndTransformMessage = (rawMessage: any): Message | null => {
  try {
    if (!rawMessage || !rawMessage.id || !rawMessage.chat_id || !rawMessage.user_id) {
      console.warn('Invalid message data:', rawMessage);
      return null;
    }
    return transformMessage(rawMessage);
  } catch (error) {
    console.error('Error transforming message:', error, rawMessage);
    return null;
  }
};

/**
 * Validate and transform raw chat list response
 */
export const validateAndTransformChatList = (rawItems: any[]): ChatListItem[] => {
  if (!Array.isArray(rawItems)) {
    console.warn('Invalid chat list data:', rawItems);
    return [];
  }

  return rawItems
    .map(item => {
      try {
        if (!item || !item.chat_id || !item.court_session_id) {
          console.warn('Invalid chat list item:', item);
          return null;
        }
        return transformChatListItem(item);
      } catch (error) {
        console.error('Error transforming chat list item:', error, item);
        return null;
      }
    })
    .filter((item): item is ChatListItem => item !== null);
};

// =====================================================
// UTILITY TRANSFORMERS
// =====================================================

/**
 * Create a safe user object for display
 */
export const createSafeUser = (userId: UUID, fallbackName = 'User'): User => {
  return {
    id: userId,
    username: fallbackName.toLowerCase().replace(/\s+/g, ''),
    full_name: fallbackName,
  };
};

/**
 * Create an optimistic message for immediate UI updates
 */
export const createOptimisticMessage = (
  chatId: UUID,
  userId: UUID,
  content: string,
  messageType = 'text' as const,
  metadata: MessageMetadata = {},
  user?: User
): Message => {
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id: tempId,
    chat_id: chatId,
    user_id: userId,
    content,
    message_type: messageType,
    metadata,
    created_at: now,
    updated_at: now,
    is_deleted: false,
    user: user || createSafeUser(userId, 'You'),
    delivery_status: 'sending',
    is_optimistic: true,
  };
};

/**
 * Update message with server response
 */
export const updateOptimisticMessage = (optimisticMessage: Message, serverMessage: Message): Message => {
  return {
    ...serverMessage,
    // Preserve any client-side properties that might be useful
    is_optimistic: false,
    delivery_status: 'sent',
  };
};

/**
 * Mark message as failed
 */
export const markMessageAsFailed = (message: Message): Message => {
  return {
    ...message,
    delivery_status: 'failed',
    is_optimistic: false,
  };
};

// =====================================================
// SORTING AND FILTERING TRANSFORMERS
// =====================================================

/**
 * Sort messages by timestamp (oldest first)
 */
export const sortMessagesByTime = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

/**
 * Sort chat list items by priority
 */
export const sortChatListItems = (items: ChatListItem[]): ChatListItem[] => {
  return [...items].sort((a, b) => {
    // Happening soon first
    if (a.is_happening_soon && !b.is_happening_soon) return -1;
    if (!a.is_happening_soon && b.is_happening_soon) return 1;
    
    // Then by last message time (most recent first)
    const aTime = new Date(a.last_message_at || a.session_date || 0).getTime();
    const bTime = new Date(b.last_message_at || b.session_date || 0).getTime();
    
    return bTime - aTime;
  });
};

/**
 * Filter messages by type
 */
export const filterMessagesByType = (messages: Message[], types: string[]): Message[] => {
  return messages.filter(message => types.includes(message.message_type));
};

/**
 * Filter chat list items by criteria
 */
export const filterChatListItems = (
  items: ChatListItem[],
  filters: {
    hasUnread?: boolean;
    sportId?: string;
    happeningSoon?: boolean;
  }
): ChatListItem[] => {
  return items.filter(item => {
    if (filters.hasUnread && item.unread_count === 0) return false;
    if (filters.sportId && item.sport_id !== filters.sportId) return false;
    if (filters.happeningSoon !== undefined && item.is_happening_soon !== filters.happeningSoon) return false;
    return true;
  });
};