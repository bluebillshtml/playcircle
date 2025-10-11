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
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import MessageBubble from '../components/MessageBubble';
import ChatMembersModal from '../components/ChatMembersModal';
import ChatSettingsModal from '../components/ChatSettingsModal';
import DropdownMenu from '../components/DropdownMenu';
import AnimatedBackground from '../components/AnimatedBackground';

// Mock message data generator
const generateMockMessages = (count = 15, friendName = null, friendAvatar = null, chatType = null) => {
  const messages = [];

  // If it's a direct message with a friend, use specific conversation
  if (chatType === 'direct' && friendName) {
    const friendConversations = {
      'Sarah': [
        { content: 'Hey! Are you coming to the padel game tomorrow?', isOwn: false },
        { content: 'Yeah definitely! What time?', isOwn: true },
        { content: '7pm at Elite Padel Club', isOwn: false },
        { content: 'Perfect! Should I bring anything?', isOwn: true },
        { content: 'Just your racket and good vibes 😊', isOwn: false },
        { content: 'Haha sounds good! See you there', isOwn: true },
        { content: 'Can\'t wait! It\'s been too long since we played', isOwn: false },
        { content: 'I know! I\'ve been practicing my serve', isOwn: true },
        { content: 'Oh really? Challenge accepted! 💪', isOwn: false },
        { content: 'You\'re on! 🎾', isOwn: true },
      ],
      'Mike': [
        { content: 'Yo! Did you see the game last night?', isOwn: false },
        { content: 'Yeah it was insane! That last minute shot!', isOwn: true },
        { content: 'Right?! I couldn\'t believe it', isOwn: false },
        { content: 'Want to shoot some hoops this weekend?', isOwn: true },
        { content: 'For sure! Saturday works for me', isOwn: false },
        { content: 'Cool, Downtown court at 10am?', isOwn: true },
        { content: 'Perfect. I\'ll bring the ball', isOwn: false },
        { content: 'Nice! See you then bro', isOwn: true },
        { content: 'Let me know if you want to grab food after', isOwn: false },
        { content: 'Yeah that sounds great!', isOwn: true },
      ],
      'Emma': [
        { content: 'Hi! Thanks for the game yesterday', isOwn: false },
        { content: 'Of course! You played really well', isOwn: true },
        { content: 'Thanks! I\'ve been working on my backhand', isOwn: false },
        { content: 'I could tell! Much improved', isOwn: true },
        { content: 'Want to practice again next week?', isOwn: false },
        { content: 'Absolutely! Tuesday work for you?', isOwn: true },
        { content: 'Perfect! Same court?', isOwn: false },
        { content: 'Yeah, I\'ll book it for 6pm', isOwn: true },
        { content: 'Awesome! Looking forward to it', isOwn: false },
        { content: 'Me too! 🎾', isOwn: true },
      ],
      'James': [
        { content: 'Hey man, got any tips for serving?', isOwn: false },
        { content: 'Sure! What part are you struggling with?', isOwn: true },
        { content: 'My toss is all over the place', isOwn: false },
        { content: 'Try keeping your arm straighter and release higher', isOwn: true },
        { content: 'That makes sense. I\'ll try it out', isOwn: false },
        { content: 'Want to meet up and practice?', isOwn: true },
        { content: 'That would be great! When are you free?', isOwn: false },
        { content: 'How about Thursday afternoon?', isOwn: true },
        { content: 'Works for me! 3pm at City Courts?', isOwn: false },
        { content: 'Perfect, see you then!', isOwn: true },
      ],
      'Lisa': [
        { content: 'OMG that match was so fun!', isOwn: false },
        { content: 'I know right! We should do it more often', isOwn: true },
        { content: 'Definitely! Maybe weekly?', isOwn: false },
        { content: 'I\'m down! Same time works?', isOwn: true },
        { content: 'Yeah! Fridays are perfect for me', isOwn: false },
        { content: 'Cool, let\'s make it a regular thing', isOwn: true },
        { content: 'Yay! Should we invite more people?', isOwn: false },
        { content: 'Good idea! Know anyone interested?', isOwn: true },
        { content: 'I\'ll ask around. We could do doubles!', isOwn: false },
        { content: 'Perfect! Let me know what you find out', isOwn: true },
      ],
      'David': [
        { content: 'Bro, you crushed it today!', isOwn: false },
        { content: 'Thanks man! You too', isOwn: true },
        { content: 'That winning shot was sick', isOwn: false },
        { content: 'Haha got lucky with that one', isOwn: true },
        { content: 'Nah man, pure skill!', isOwn: false },
        { content: 'Rematch next week?', isOwn: true },
        { content: 'You\'re on! Prepare to lose 😎', isOwn: false },
        { content: 'We\'ll see about that!', isOwn: true },
        { content: 'Loser buys drinks after?', isOwn: false },
        { content: 'Deal! 🤝', isOwn: true },
      ],
      'Anna': [
        { content: 'Hey! I heard you play padel', isOwn: false },
        { content: 'Yeah! Do you play too?', isOwn: true },
        { content: 'I just started! Looking for practice partners', isOwn: false },
        { content: 'That\'s great! I\'m happy to help', isOwn: true },
        { content: 'Really? That would be awesome!', isOwn: false },
        { content: 'Let\'s set something up for next week', isOwn: true },
        { content: 'Perfect! Any particular day?', isOwn: false },
        { content: 'How about Wednesday evening?', isOwn: true },
        { content: 'Works for me! Thanks so much', isOwn: false },
        { content: 'No problem! See you then', isOwn: true },
      ],
      'Tom': [
        { content: 'Nice to meet you at the court!', isOwn: false },
        { content: 'Likewise! You\'ve got a great serve', isOwn: true },
        { content: 'Thanks! Been working on it', isOwn: false },
        { content: 'It shows! Want to play again?', isOwn: true },
        { content: 'Definitely! How\'s this Friday?', isOwn: false },
        { content: 'Friday works. Same court?', isOwn: true },
        { content: 'Yeah, I\'ll book it for 5pm', isOwn: false },
        { content: 'Sounds good to me', isOwn: true },
        { content: 'Great! Bring your A-game 😄', isOwn: false },
        { content: 'Always do! See you Friday', isOwn: true },
      ],
      'Sophie': [
        { content: 'Hi! Sarah said you\'re really good', isOwn: false },
        { content: 'Oh that\'s nice of her! You play too?', isOwn: true },
        { content: 'Yeah, mostly tennis. Just getting into padel', isOwn: false },
        { content: 'Cool! They\'re similar in some ways', isOwn: true },
        { content: 'That\'s what I heard. Any tips?', isOwn: false },
        { content: 'Focus on wall positioning, it\'s key', isOwn: true },
        { content: 'Good to know! Maybe we can play?', isOwn: false },
        { content: 'I\'d love that! When are you free?', isOwn: true },
        { content: 'This weekend? Saturday morning?', isOwn: false },
        { content: 'Perfect! I\'ll text you details', isOwn: true },
      ],
      'Chris': [
        { content: 'Yo! Down for some basketball?', isOwn: false },
        { content: 'Always! When and where?', isOwn: true },
        { content: 'City courts tomorrow at 4?', isOwn: false },
        { content: 'I\'ll be there. Full court?', isOwn: true },
        { content: 'Yeah, we got 10 people total', isOwn: false },
        { content: 'Perfect! I\'ll bring an extra ball', isOwn: true },
        { content: 'Sweet! It\'s gonna be good', isOwn: false },
        { content: 'Can\'t wait. Who else is coming?', isOwn: true },
        { content: 'Mike, David, and some others', isOwn: false },
        { content: 'Nice crew! See you tomorrow', isOwn: true },
      ],
    };

    const conversation = friendConversations[friendName] || [
      { content: `Hey ${friendName}!`, isOwn: true },
      { content: 'Hey! How\'s it going?', isOwn: false },
      { content: 'Good! Want to play sometime?', isOwn: true },
      { content: 'Sure! Let me know when', isOwn: false },
    ];

    const friendUser = {
      id: 'friend_user',
      name: friendName,
      avatar: friendAvatar,
    };

    const currentUser = {
      id: 'user1',
      name: 'You',
      avatar: null,
    };

    conversation.forEach((msg, i) => {
      const user = msg.isOwn ? currentUser : friendUser;
      // For own messages, older ones are 'read', recent ones are 'sent'
      let deliveryStatus = 'sent';
      if (msg.isOwn) {
        // Last 2 messages are 'sent' (white checkmarks), older ones are 'read' (green checkmarks)
        deliveryStatus = i >= conversation.length - 2 ? 'sent' : 'read';
      }

      messages.push({
        id: `msg_${i}`,
        content: msg.content,
        message_type: 'text',
        metadata: {},
        user_id: user.id,
        user: user,
        created_at: new Date(Date.now() - (conversation.length - i) * 60000 * 10).toISOString(),
        isOwn: msg.isOwn,
        delivery_status: deliveryStatus,
      });
    });

    return messages;
  }

  // Original group chat message generator
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

// Available reaction emojis
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ChatThreadScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { chatId, sessionTitle, chatType, recipientId } = route.params || {};

  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [showCenteredMessage, setShowCenteredMessage] = useState(false);
  const reactionPickerAnim = useRef(new Animated.Value(0)).current;
  const backgroundBlurAnim = useRef(new Animated.Value(0)).current;
  const centeredMessageAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const flatListRef = useRef(null);

  // Get friend avatar based on friend name
  const getFriendAvatar = (name) => {
    const friendAvatars = {
      'Sarah': 'https://i.pravatar.cc/150?img=1',
      'Mike': 'https://i.pravatar.cc/150?img=12',
      'Emma': 'https://i.pravatar.cc/150?img=5',
      'James': 'https://i.pravatar.cc/150?img=13',
      'Lisa': 'https://i.pravatar.cc/150?img=9',
      'David': 'https://i.pravatar.cc/150?img=14',
      'Anna': 'https://i.pravatar.cc/150?img=47',
      'Tom': 'https://i.pravatar.cc/150?img=33',
      'Sophie': 'https://i.pravatar.cc/150?img=44',
      'Chris': 'https://i.pravatar.cc/150?img=15',
    };
    return friendAvatars[name] || null;
  };

  // Load mock messages
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const friendAvatar = getFriendAvatar(sessionTitle);
      const mockMessages = generateMockMessages(15, sessionTitle, friendAvatar, chatType).map(msg => ({
        ...msg,
        reactions: [], // Initialize with empty reactions array
      }));
      setMessages(mockMessages);
      setLoading(false);
    };

    loadMessages();
  }, [chatId, sessionTitle, chatType]);

  // Show reaction picker with animation
  const showReactionPicker = (message, position = null) => {
    setSelectedMessageForReaction(message);
    setShowCenteredMessage(true);
    
    // Position reaction picker above the centered message
    setReactionPickerPosition({ x: 200, y: 250 });
    
    // Animate background blur and centered message appearance
    Animated.parallel([
      Animated.timing(backgroundBlurAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(centeredMessageAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show reaction picker after animations
      setReactionPickerVisible(true);
      Animated.spring(reactionPickerAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };

  // Hide reaction picker with animation
  const hideReactionPicker = () => {
    // First hide the reaction picker
    Animated.timing(reactionPickerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setReactionPickerVisible(false);
      
      // Then hide centered message and blur
      Animated.parallel([
        Animated.timing(centeredMessageAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundBlurAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedMessageForReaction(null);
        setShowCenteredMessage(false);
      });
    });
  };

  // Handle reaction selection
  const handleReactionSelect = (emoji) => {
    if (!selectedMessageForReaction) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === selectedMessageForReaction.id) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        const currentUserId = 'user1';

        let updatedReactions;
        if (existingReaction) {
          // Toggle reaction if user already reacted with this emoji
          if (existingReaction.users.includes(currentUserId)) {
            const updatedUsers = existingReaction.users.filter(id => id !== currentUserId);
            if (updatedUsers.length === 0) {
              // Remove reaction if no users left
              updatedReactions = msg.reactions.filter(r => r.emoji !== emoji);
            } else {
              updatedReactions = msg.reactions.map(r =>
                r.emoji === emoji ? { ...r, users: updatedUsers, count: updatedUsers.length } : r
              );
            }
          } else {
            // Add user to existing reaction
            updatedReactions = msg.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, users: [...r.users, currentUserId], count: r.users.length + 1 }
                : r
            );
          }
        } else {
          // Create new reaction
          updatedReactions = [
            ...(msg.reactions || []),
            { emoji, count: 1, users: [currentUserId] }
          ];
        }

        // Simulate notification for message sender (not own message)
        if (!msg.isOwn) {
          console.log(`Notification: ${msg.user.name} received a ${emoji} reaction on their message`);
          // In real app, this would trigger a push notification
        }

        return { ...msg, reactions: updatedReactions };
      }
      return msg;
    }));

    hideReactionPicker();
  };

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
      delivery_status: 'sending', // Start as sending (single white checkmark)
      reactions: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message sending: sending → sent → read
    // After 1 second: sending → sent (double white checkmarks)
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, delivery_status: 'sent' }
            : msg
        )
      );
    }, 1000);

    // After 3 seconds: sent → read (double green checkmarks)
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, delivery_status: 'read' }
            : msg
        )
      );
    }, 3000);

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
    // Always show avatar for messages that are not from the current user
    const showAvatar = !item.isOwn;
    const showTimestamp = !previousMessage ||
      new Date(item.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 300000;

    // Convert the mock message format to match the MessageBubble expected format
    const messageForBubble = {
      ...item,
      message_type: item.message_type || 'text',
      metadata: item.metadata || {},
      is_deleted: false,
      reactions: item.reactions || [],
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
        onLongPress={(message, position) => showReactionPicker(message, position)}
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
        {/* Header blur overlay */}
        {showCenteredMessage && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                opacity: backgroundBlurAnim,
                zIndex: 1,
              },
            ]}
            pointerEvents="none"
          >
            <BlurView intensity={50} style={StyleSheet.absoluteFillObject} tint="dark">
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
            </BlurView>
          </Animated.View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => {
            // Only navigate to match details for group chats (not direct messages)
            if (chatType !== 'direct') {
              // Extract session ID from chatId (e.g., 'session_chat_1' -> 'session_1')
              // or use court_session_id if available from route params
              const sessionId = route.params?.court_session_id || chatId?.replace('chat_', '');

              navigation.navigate('MatchDetail', {
                matchId: sessionId,
                sessionId: sessionId,
                sessionTitle: sessionTitle,
              });
            }
          }}
          activeOpacity={chatType === 'direct' ? 1 : 0.7}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {sessionTitle || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {chatType === 'direct' ? 'Active now' : 'Tap to view session details'}
          </Text>
        </TouchableOpacity>

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
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Full screen blur overlay */}
        {showCenteredMessage && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                opacity: backgroundBlurAnim,
                zIndex: 999,
              },
            ]}
            pointerEvents="none"
          >
            <BlurView intensity={50} style={StyleSheet.absoluteFillObject} tint="dark">
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
            </BlurView>
          </Animated.View>
        )}
        
        {/* Centered Message Overlay */}
        {showCenteredMessage && selectedMessageForReaction && (
          <Animated.View
            style={[
              styles.centeredMessageContainer,
              {
                opacity: centeredMessageAnim,
                transform: [{
                  scale: centeredMessageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
                zIndex: 1000,
              },
            ]}
            pointerEvents="none"
          >
            <MessageBubble
              message={selectedMessageForReaction}
              isOwn={selectedMessageForReaction.isOwn}
              showAvatar={!selectedMessageForReaction.isOwn}
              showTimestamp={true}
              onRetry={() => {}}
              onLongPress={() => {}}
            />
          </Animated.View>
        )}
      </View>

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
        {/* Input blur overlay */}
        {showCenteredMessage && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                opacity: backgroundBlurAnim,
                zIndex: 1,
              },
            ]}
            pointerEvents="none"
          >
            <BlurView intensity={50} style={StyleSheet.absoluteFillObject} tint="dark">
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
            </BlurView>
          </Animated.View>
        )}
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

      {/* Reaction Picker Overlay */}
      {reactionPickerVisible && (
        <Modal
          visible={reactionPickerVisible}
          transparent={true}
          animationType="none"
          onRequestClose={hideReactionPicker}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.reactionPickerOverlay}
            activeOpacity={1}
            onPress={hideReactionPicker}
          >
            <Animated.View
              style={[
                styles.reactionPickerContainer,
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: reactionPickerPosition.y,
                  alignItems: 'center',
                  opacity: reactionPickerAnim,
                  transform: [{
                    scale: reactionPickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  }, {
                    translateY: reactionPickerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <BlurView intensity={80} style={styles.reactionPickerContent} tint="dark">
                <View style={styles.reactionsRow}>
                  {REACTIONS.map((emoji, index) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionButton}
                      onPress={() => handleReactionSelect(emoji)}
                      activeOpacity={0.7}
                    >
                      <Animated.Text
                        style={[
                          styles.reactionButtonEmoji,
                          {
                            opacity: reactionPickerAnim,
                            transform: [{
                              translateY: reactionPickerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0],
                              }),
                            }, {
                              scale: reactionPickerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                              }),
                            }],
                          },
                        ]}
                      >
                        {emoji}
                      </Animated.Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
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
    position: 'relative',
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
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  centeredMessageContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    position: 'relative',
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
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 88, // Approximately 3 lines (line height ~22 * 3 + padding)
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Reaction picker styles
  reactionPickerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  reactionPickerContainer: {
    alignSelf: 'center',
  },
  reactionPickerContent: {
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reactionButtonEmoji: {
    fontSize: 24,
  },

});