// =====================================================
// CHAT SYSTEM TYPE DEFINITIONS
// =====================================================
// TypeScript interfaces for the Messages experience

// =====================================================
// BASE TYPES
// =====================================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 timestamp

// =====================================================
// MESSAGE TYPES
// =====================================================

export type MessageType = 'text' | 'location' | 'status' | 'photo';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type QuickActionType = 'on-my-way' | 'running-late' | 'arrived' | 'share-location' | 'take-photo';

// =====================================================
// USER INTERFACE
// =====================================================

export interface User {
  id: UUID;
  username: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
}

// =====================================================
// COURT SESSION INTERFACE
// =====================================================

export interface Court {
  id: UUID;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  image_url?: string;
  sports: string[];
  price_per_hour?: number;
}

export interface CourtSession {
  id: UUID;
  court_id?: UUID;
  host_id: UUID;
  sport_id: string;
  match_date: string; // YYYY-MM-DD format
  match_time: string; // HH:MM format
  duration_minutes: number;
  max_players: number;
  current_players: number;
  skill_level: string;
  match_type: 'casual' | 'competitive';
  price_per_player?: number;
  description?: string;
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined data
  court?: Court;
  host?: User;
  chat?: Chat;
  participants_count?: number;
  user_is_member?: boolean;
}

// =====================================================
// CHAT INTERFACES
// =====================================================

export interface Chat {
  id: UUID;
  court_session_id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_message_at?: Timestamp;
  is_active: boolean;
  
  // Joined data
  session?: CourtSession;
  last_message?: Message;
  unread_count?: number;
  members?: ChatMember[];
  member_count?: number;
}

export interface ChatMember {
  id: UUID;
  chat_id: UUID;
  user_id: UUID;
  joined_at: Timestamp;
  left_at?: Timestamp;
  is_active: boolean;
  unread_count: number;
  last_read_at: Timestamp;
  
  // Joined data
  user?: User;
}

export interface Message {
  id: UUID;
  chat_id: UUID;
  user_id: UUID;
  content: string;
  message_type: MessageType;
  metadata: MessageMetadata;
  created_at: Timestamp;
  updated_at: Timestamp;
  is_deleted: boolean;
  
  // Joined data
  user?: User;
  
  // Client-side properties
  delivery_status?: MessageStatus;
  is_optimistic?: boolean; // For offline support
}

// =====================================================
// MESSAGE METADATA INTERFACES
// =====================================================

export interface LocationMetadata {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
}

export interface StatusMetadata {
  status: QuickActionType;
  timestamp?: Timestamp;
}

export interface PhotoMetadata {
  photo_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  file_size?: number;
}

export type MessageMetadata = {
  location?: LocationMetadata;
  status?: StatusMetadata;
  photo?: PhotoMetadata;
  [key: string]: any; // Allow additional metadata
};

// =====================================================
// CHAT LIST INTERFACES
// =====================================================

export interface ChatListItem {
  chat_id: UUID;
  court_session_id: UUID;
  session_title: string;
  session_date: string;
  session_time: string;
  session_duration: number;
  court_name: string;
  sport_id: string;
  last_message_content?: string;
  last_message_at?: Timestamp;
  last_message_user_name?: string;
  unread_count: number;
  member_count: number;
  is_happening_soon: boolean;
  
  // Computed properties
  sport_icon?: string;
  time_display?: string;
  relative_time?: string;
}

export interface GroupedChats {
  happeningSoon: ChatListItem[];
  recent: ChatListItem[];
}

// =====================================================
// UI STATE INTERFACES
// =====================================================

export interface ChatListState {
  chats: ChatListItem[];
  groupedChats: GroupedChats;
  loading: boolean;
  error?: string;
  refreshing: boolean;
}

export interface ChatThreadState {
  messages: Message[];
  loading: boolean;
  error?: string;
  hasMore: boolean;
  loadingMore: boolean;
  sending: boolean;
}

export interface TypingState {
  typingUsers: string[]; // User IDs
  isTyping: boolean;
}

export interface ChatMembersState {
  members: ChatMember[];
  loading: boolean;
  error?: string;
}

// =====================================================
// ACTION INTERFACES
// =====================================================

export interface SendMessageAction {
  chatId: UUID;
  content: string;
  type?: MessageType;
  metadata?: MessageMetadata;
}

export interface SendQuickActionAction {
  chatId: UUID;
  actionType: QuickActionType;
  metadata?: Partial<MessageMetadata>;
}

export interface SendLocationAction {
  chatId: UUID;
  location: LocationMetadata;
}

export interface SendPhotoAction {
  chatId: UUID;
  photoUrl: string;
  caption?: string;
  metadata?: PhotoMetadata;
}

export interface JoinChatAction {
  sessionId: UUID;
  userId: UUID;
}

export interface LeaveChatAction {
  sessionId: UUID;
  userId: UUID;
}

// =====================================================
// API RESPONSE INTERFACES
// =====================================================

export interface GetUserChatsResponse {
  data: ChatListItem[];
  error?: string;
}

export interface GetChatMessagesResponse {
  data: Message[];
  hasMore: boolean;
  error?: string;
}

export interface SendMessageResponse {
  data?: Message;
  error?: string;
}

export interface ChatMembersResponse {
  data: ChatMember[];
  error?: string;
}

// =====================================================
// VALIDATION INTERFACES
// =====================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface MessageValidation extends ValidationResult {
  sanitizedContent?: string;
}

// =====================================================
// CONFIGURATION INTERFACES
// =====================================================

export interface ChatConfig {
  maxMessageLength: number;
  messagePageSize: number;
  typingTimeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  happeningSoonDays: number;
  recentDays: number;
}

export interface ChatPermissions {
  canSendMessages: boolean;
  canSendPhotos: boolean;
  canShareLocation: boolean;
  canLeaveChat: boolean;
  canAddMembers: boolean;
}

// =====================================================
// ERROR INTERFACES
// =====================================================

export interface ChatError {
  code: string;
  message: string;
  details?: any;
  timestamp: Timestamp;
}

export interface MessageError extends ChatError {
  messageId?: UUID;
  retryable: boolean;
}

// =====================================================
// SUBSCRIPTION INTERFACES
// =====================================================

export interface ChatSubscription {
  chatId: UUID;
  userId: UUID;
  callback: (message: Message) => void;
  unsubscribe: () => void;
}

export interface TypingSubscription {
  chatId: UUID;
  callback: (typingUsers: string[]) => void;
  unsubscribe: () => void;
}

export interface ChatListSubscription {
  userId: UUID;
  callback: () => void;
  unsubscribe: () => void;
}

// =====================================================
// UTILITY TYPE HELPERS
// =====================================================

// Partial update types
export type ChatUpdate = Partial<Pick<Chat, 'last_message_at' | 'is_active'>>;
export type MessageUpdate = Partial<Pick<Message, 'content' | 'metadata' | 'is_deleted'>>;
export type ChatMemberUpdate = Partial<Pick<ChatMember, 'is_active' | 'left_at' | 'unread_count' | 'last_read_at'>>;

// Create types (without generated fields)
export type CreateMessage = Omit<Message, 'id' | 'created_at' | 'updated_at' | 'user' | 'delivery_status' | 'is_optimistic'>;
export type CreateChatMember = Omit<ChatMember, 'id' | 'joined_at' | 'left_at' | 'last_read_at' | 'user'>;

// Filter types for queries
export interface ChatFilters {
  isActive?: boolean;
  happeningSoon?: boolean;
  hasUnread?: boolean;
  sportId?: string;
}

export interface MessageFilters {
  messageType?: MessageType;
  userId?: UUID;
  dateFrom?: Timestamp;
  dateTo?: Timestamp;
}

// =====================================================
// COMPONENT PROP INTERFACES
// =====================================================

export interface ChatCardProps {
  chat: ChatListItem;
  onPress: (chatId: UUID) => void;
  onLongPress?: (chatId: UUID) => void;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onRetry?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
}

export interface MessageInputProps {
  chatId: UUID;
  onSendMessage: (content: string) => void;
  onSendQuickAction: (action: QuickActionType) => void;
  onSendPhoto: (photoUrl: string, caption?: string) => void;
  onSendLocation: (location: LocationMetadata) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface QuickActionBarProps {
  actions: QuickActionType[];
  onActionPress: (action: QuickActionType) => void;
  disabled?: boolean;
}

export interface ChatHeaderProps {
  session: CourtSession;
  memberCount: number;
  onDirections?: () => void;
  onAddFriend?: () => void;
  onLeave?: () => void;
}

export interface TypingIndicatorProps {
  typingUsers: string[];
  maxDisplay?: number;
}

export interface DayDividerProps {
  date: Timestamp;
  text?: string;
}

// =====================================================
// NAVIGATION INTERFACES
// =====================================================

export interface MessagesScreenParams {
  initialChatId?: UUID;
}

export interface ChatThreadScreenParams {
  chatId: UUID;
  sessionTitle?: string;
}

export type MessagesStackParamList = {
  MessagesList: MessagesScreenParams;
  ChatThread: ChatThreadScreenParams;
};

// =====================================================
// STORAGE INTERFACES
// =====================================================

export interface OfflineMessage {
  tempId: string;
  chatId: UUID;
  userId: UUID;
  content: string;
  messageType: MessageType;
  metadata: MessageMetadata;
  timestamp: Timestamp;
  retryCount: number;
}

export interface ChatCache {
  chats: ChatListItem[];
  lastUpdated: Timestamp;
  version: number;
}

export interface MessageCache {
  [chatId: string]: {
    messages: Message[];
    lastUpdated: Timestamp;
    hasMore: boolean;
  };
}