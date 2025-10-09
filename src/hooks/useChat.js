// =====================================================
// CHAT HOOKS
// =====================================================
// React hooks for managing chat state and real-time subscriptions

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/supabase';
import { 
  createOptimisticMessage, 
  isTempMessage, 
  validateMessage,
  MESSAGE_TYPES 
} from '../services/chatUtils';

/**
 * Hook for managing user's chat list
 * @param {string} userId - Current user ID
 * @returns {Object} Chat list state and methods
 */
export const useUserChats = (userId) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  const loadChats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const userChats = await chatService.getChatsByUser(userId);
      setChats(userChats);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshChats = useCallback(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to chat updates
    subscriptionRef.current = chatService.subscribeToUserChats(userId, refreshChats);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [userId, refreshChats]);

  return {
    chats,
    loading,
    error,
    refreshChats,
  };
};

/**
 * Hook for managing individual chat messages
 * @param {string} chatId - Chat ID
 * @param {string} userId - Current user ID
 * @returns {Object} Chat messages state and methods
 */
export const useChatMessages = (chatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const subscriptionRef = useRef(null);
  const isLoadingMore = useRef(false);

  const loadMessages = useCallback(async (before = null) => {
    if (!chatId || isLoadingMore.current) return;
    
    try {
      if (!before) {
        setLoading(true);
        setError(null);
      }
      
      isLoadingMore.current = true;
      const newMessages = await chatService.getChatMessages(chatId, 50, before);
      
      if (before) {
        // Loading more messages (pagination)
        setMessages(prev => [...newMessages, ...prev]);
        setHasMore(newMessages.length === 50);
      } else {
        // Initial load
        setMessages(newMessages);
        setHasMore(newMessages.length === 50);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      isLoadingMore.current = false;
    }
  }, [chatId]);

  const loadMoreMessages = useCallback(() => {
    if (!hasMore || isLoadingMore.current || messages.length === 0) return;
    
    const oldestMessage = messages[0];
    loadMessages(oldestMessage.created_at);
  }, [hasMore, messages, loadMessages]);

  const sendMessage = useCallback(async (content, type = MESSAGE_TYPES.TEXT, metadata = {}, user = null) => {
    if (!chatId || !userId) return;
    
    const validation = validateMessage(content, type);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create optimistic message for immediate UI update
    const optimisticMessage = createOptimisticMessage(chatId, userId, content, type, metadata, user);
    
    // Add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send actual message
      const sentMessage = await chatService.sendMessage(chatId, userId, content, type, metadata);
      
      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );
      
      return sentMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark optimistic message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...msg, delivery_status: 'failed' }
            : msg
        )
      );
      
      throw err;
    }
  }, [chatId, userId]);

  const retryMessage = useCallback(async (failedMessage) => {
    if (!isTempMessage(failedMessage)) return;
    
    try {
      // Update message status to sending
      setMessages(prev => 
        prev.map(msg => 
          msg.id === failedMessage.id 
            ? { ...msg, delivery_status: 'sending' }
            : msg
        )
      );
      
      // Retry sending
      const sentMessage = await chatService.sendMessage(
        failedMessage.chat_id,
        failedMessage.user_id,
        failedMessage.content,
        failedMessage.message_type,
        failedMessage.metadata
      );
      
      // Replace failed message with sent message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === failedMessage.id ? sentMessage : msg
        )
      );
      
      return sentMessage;
    } catch (err) {
      console.error('Error retrying message:', err);
      
      // Mark as failed again
      setMessages(prev => 
        prev.map(msg => 
          msg.id === failedMessage.id 
            ? { ...msg, delivery_status: 'failed' }
            : msg
        )
      );
      
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async () => {
    if (!chatId || !userId) return;
    
    try {
      await chatService.markMessagesRead(chatId, userId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [chatId, userId]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (!chatId) return;

    // Subscribe to new messages
    subscriptionRef.current = chatService.subscribeToChatMessages(chatId, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        return [...prev, newMessage];
      });
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [chatId]);

  // Mark messages as read when chat becomes active
  useEffect(() => {
    if (chatId && userId && messages.length > 0) {
      markAsRead();
    }
  }, [chatId, userId, messages.length, markAsRead]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    retryMessage,
    loadMoreMessages,
    markAsRead,
  };
};

/**
 * Hook for managing typing indicators
 * @param {string} chatId - Chat ID
 * @param {string} userId - Current user ID
 * @returns {Object} Typing state and methods
 */
export const useTypingIndicator = (chatId, userId) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const subscriptionRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const startTyping = useCallback(() => {
    if (!chatId || !userId || isTyping) return;
    
    setIsTyping(true);
    chatService.setTypingStatus(chatId, userId, true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.setTypingStatus(chatId, userId, false);
    }, 3000);
  }, [chatId, userId, isTyping]);

  const stopTyping = useCallback(() => {
    if (!chatId || !userId || !isTyping) return;
    
    setIsTyping(false);
    chatService.setTypingStatus(chatId, userId, false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [chatId, userId, isTyping]);

  useEffect(() => {
    if (!chatId) return;

    // Subscribe to typing indicators
    subscriptionRef.current = chatService.subscribeToTyping(chatId, (users) => {
      // Filter out current user
      const otherUsers = users.filter(user => user !== userId);
      setTypingUsers(otherUsers);
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, userId]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
  };
};

/**
 * Hook for managing chat members
 * @param {string} chatId - Chat ID
 * @returns {Object} Chat members state and methods
 */
export const useChatMembers = (chatId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMembers = useCallback(async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      setError(null);
      const chatMembers = await chatService.getChatMembers(chatId);
      setMembers(chatMembers);
    } catch (err) {
      console.error('Error loading chat members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return {
    members,
    loading,
    error,
    refreshMembers: loadMembers,
  };
};