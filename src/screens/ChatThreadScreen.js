import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import MessageBubble from '../components/MessageBubble';
import ChatMembersModal from '../components/ChatMembersModal';
import ChatSettingsModal from '../components/ChatSettingsModal';
import DropdownMenu from '../components/DropdownMenu';
import AnimatedBackground from '../components/AnimatedBackground';

// Mock message data generator
const generateMockMessages = (count = 15) => {
  const messages = [];
  const users = [
    { id: 'user1', name: 'You', avatar: null },
    { id: 'user2', name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'user3', name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 'user4', name: 'Carol', avatar: 'https://i.pravatar.cc/150?img=3' },
  ];

  const messageTypes = [
    { type: 'text', content: 'Hey everyone! Looking forward to the game!' },
    { type: 'text', content: 'What time should we meet?' },
    { type: 'text', content: 'I will bring some water bottles' },
    { type: 'text', content: 'The weather looks perfect for playing' },
    { type: 'text', content: 'See you all there!' },
    { type: 'status', content: 'On my way! 🏃‍♂️', metadata: { status: { status: 'on-my-way' } } },
    { type: 'status', content: 'Running late, be there soon! ⏰', metadata: { status: { status: 'running-late' } } },
    { type: 'status', content: 'I\'m here! 📍', metadata: { status: { status: 'arrived' } } },
    { type: 'text', content: 'Great game everyone!' },
    { type: 'text', content: 'Thanks for organizing this' },
    { type: 'text', content: 'Count me in for next time' },
    { type: 'text', content: 'Anyone need a ride?' },
    { type: 'text', content: 'Court looks good!' },
  ];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const isOwn = user.id === 'user1';
    const messageTemplate = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    messages.push({
      id: `msg_${i}`,
      content: messageTemplate.content,
      message_type: messageTemplate.type,
      metadata: messageTemplate.metadata || {},
      user_id: user.id,
      user: user,
      created_at: new Date(Date.now() - (count - i) * 60000 * 5).toISOString(),
      isOwn,
      delivery_status: isOwn ? (Math.random() > 0.9 ? 'failed' : 'sent') : 'sent',
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
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  
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
      message_type: 'text',
      metadata: {},
      user_id: 'user1',
      user: { id: 'user1', name: 'You', avatar: null },
      created_at: new Date().toISOString(),
      isOwn: true,
      delivery_status: 'sending', // Start as sending, then update to sent
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message sending delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, delivery_status: 'sent' }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Quick actions
  const quickActions = [
    { id: 'on-my-way', icon: 'car-outline', label: 'On my way', color: '#10B981' },
    { id: 'running-late', icon: 'time-outline', label: 'Running late', color: '#F59E0B' },
    { id: 'im-here', icon: 'checkmark-circle-outline', label: "I'm here", color: '#059669' },
  ];

  const handleQuickAction = (action) => {
    let messageData = {};
    
    switch (action.id) {
      case 'on-my-way':
        messageData = {
          content: 'On my way! 🏃‍♂️',
          message_type: 'status',
          metadata: { status: { status: 'on-my-way' } },
        };
        break;
      case 'running-late':
        messageData = {
          content: 'Running late, be there soon! ⏰',
          message_type: 'status',
          metadata: { status: { status: 'running-late' } },
        };
        break;
      case 'im-here':
        messageData = {
          content: 'I\'m here! 📍',
          message_type: 'status',
          metadata: { status: { status: 'arrived' } },
        };
        break;
      default:
        return;
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      ...messageData,
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

    // Convert the mock message format to match the MessageBubble expected format
    const messageForBubble = {
      ...item,
      message_type: item.message_type || 'text',
      metadata: item.metadata || {},
      is_deleted: false,
      user: {
        ...item.user,
        full_name: item.user?.name || 'Unknown User',
        username: item.user?.name?.toLowerCase() || 'unknown',
      },
    };
    
    return (
      <MessageBubble
        message={messageForBubble}
        isOwn={item.isOwn}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
        onRetry={(message) => {
          // Handle message retry logic
          console.log('Retrying message:', message.id);
        }}
        onLongPress={(message) => {
          // Handle long press actions (copy, delete, etc.)
          Alert.alert(
            'Message Options',
            'What would you like to do with this message?',
            [
              { text: 'Copy', onPress: () => console.log('Copy message') },
              { text: 'Delete', onPress: () => console.log('Delete message'), style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    );
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <AnimatedBackground>
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
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
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
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            // Position dropdown below the header
            setDropdownPosition({ 
              x: 0, 
              y: 100 // Approximate header height + padding
            });
            setDropdownVisible(true);
          }}
        >
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
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
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
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      <DropdownMenu
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        anchorPosition={dropdownPosition}
        options={[
          {
            id: 'members',
            title: 'Members',
            icon: 'people-outline',
            onPress: () => setMembersModalVisible(true),
          },
          {
            id: 'settings',
            title: 'Settings',
            icon: 'settings-outline',
            onPress: () => setSettingsModalVisible(true),
          },
          {
            id: 'leave',
            title: 'Leave',
            icon: 'exit-outline',
            destructive: true,
            onPress: () => {
              Alert.alert(
                'Leave Chat',
                'Are you sure you want to leave this chat? You won\'t receive any new messages.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Leave', 
                    style: 'destructive', 
                    onPress: () => navigation.goBack() 
                  },
                ]
              );
            },
          },
        ]}
      />

      {/* Modals */}
      <ChatMembersModal
        visible={membersModalVisible}
        onClose={() => setMembersModalVisible(false)}
        chatMembers={[]} // Will be populated with real data later
      />

      <ChatSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: 'transparent',
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
  
  // Message styles (now handled by MessageBubble component)
  
  // Quick actions styles
  quickActionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  
  // Input styles
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // Extra padding for iPhone notch/home indicator
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  quickActionToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

});