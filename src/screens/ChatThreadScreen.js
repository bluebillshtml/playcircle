import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Mock message data generator
const generateMockMessages = (count = 15) => {
  const messages = [];
  const users = [
    { id: 'user1', name: 'You', avatar: null },
    { id: 'user2', name: 'Alice', avatar: null },
    { id: 'user3', name: 'Bob', avatar: null },
    { id: 'user4', name: 'Carol', avatar: null },
  ];

  const messageTexts = [
    'Hey everyone! Looking forward to the game!',
    'What time should we meet?',
    'I will bring some water bottles',
    'The weather looks perfect for playing',
    'See you all there!',
    'On my way!',
    'Running a bit late, be there in 10 minutes',
    'Great game everyone!',
    'Thanks for organizing this',
    'Count me in for next time',
  ];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const isOwn = user.id === 'user1';
    
    messages.push({
      id: `msg_${i}`,
      content: messageTexts[Math.floor(Math.random() * messageTexts.length)],
      user_id: user.id,
      user: user,
      created_at: new Date(Date.now() - (count - i) * 60000 * 5).toISOString(),
      isOwn,
      delivery_status: isOwn ? 'sent' : 'sent',
    });
  }

  return messages;
};

export default function ChatThreadScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { chatId, sessionTitle } = route.params || {};
  
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  
  // Refs
  const flatListRef = useRef(null);

  // Load mock messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockMessages = generateMockMessages(15);
      setMessages(mockMessages);
      setLoading(false);
    };

    loadMessages();
  }, [chatId]);

  // Send message
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: inputText.trim(),
      user_id: 'user1',
      user: { id: 'user1', name: 'You', avatar: null },
      created_at: new Date().toISOString(),
      isOwn: true,
      delivery_status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Quick actions
  const quickActions = [
    { id: 'location', icon: 'location-outline', label: 'Location', color: '#3B82F6' },
    { id: 'on-my-way', icon: 'car-outline', label: 'On my way', color: '#10B981' },
    { id: 'running-late', icon: 'time-outline', label: 'Running late', color: '#F59E0B' },
    { id: 'photo', icon: 'camera-outline', label: 'Photo', color: '#8B5CF6' },
  ];

  const handleQuickAction = (action) => {
    let message = '';
    switch (action.id) {
      case 'on-my-way':
        message = 'On my way!';
        break;
      case 'running-late':
        message = 'Running late, be there soon!';
        break;
      case 'location':
        message = 'Shared location';
        break;
      case 'photo':
        message = 'Shared a photo';
        break;
      default:
        return;
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      user_id: 'user1',
      user: { id: 'user1', name: 'You', avatar: null },
      created_at: new Date().toISOString(),
      isOwn: true,
      delivery_status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setQuickActionsVisible(false);
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !item.isOwn && (!previousMessage || previousMessage.user_id !== item.user_id);
    const showTimestamp = !previousMessage || 
      new Date(item.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 300000;

    const isOwn = item.isOwn;
    
    return (
      <View style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}>
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        )}
        
        <View style={[styles.messageRow, isOwn && styles.ownMessageRow]}>
          {!isOwn && showAvatar && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          
          {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}
          
          <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
            {!isOwn && showAvatar && (
              <Text style={styles.senderName}>
                {item.user?.name || 'Unknown'}
              </Text>
            )}
            
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
              {item.content}
            </Text>
            
            {isOwn && (
              <View style={styles.messageStatus}>
                <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {sessionTitle || 'Chat'}
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {sessionTitle || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Tap to view session details
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      {quickActionsVisible && (
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: action.color + '20' }]}
                onPress={() => handleQuickAction(action)}
              >
                <Ionicons name={action.icon} size={20} color={action.color} />
                <Text style={[styles.quickActionLabel, { color: action.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.quickActionToggle}
            onPress={() => setQuickActionsVisible(!quickActionsVisible)}
          >
            <Ionicons 
              name={quickActionsVisible ? "close" : "add"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Action Bar */}
      <View style={styles.stickyActionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Add Friend', 'Add friend functionality coming soon!')}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Add Friend</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Directions', 'Navigation functionality coming soon!')}
        >
          <Ionicons name="navigate-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => {
            Alert.alert(
              'Leave Chat',
              'Are you sure you want to leave this chat?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Ionicons name="exit-outline" size={18} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 8,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  // Messages list styles
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  
  // Message styles
  messageContainer: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  ownMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarSpacer: {
    width: 40,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: colors.primary,
  },
  otherBubble: {
    backgroundColor: colors.surfaceLight,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: colors.text,
  },
  messageStatus: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  
  // Quick actions styles
  quickActionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Input styles
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  quickActionToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sticky action bar styles
  stickyActionBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});