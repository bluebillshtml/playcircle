import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ChatMembersModal = ({ visible, onClose, chatMembers = [] }) => {
  const { colors } = useTheme();

  // Mock chat members data
  const mockMembers = chatMembers.length > 0 ? chatMembers : [
    {
      id: 'user1',
      name: 'You',
      full_name: 'You',
      avatar_url: null,
      is_host: true,
      is_online: true,
    },
    {
      id: 'user2',
      name: 'Alice',
      full_name: 'Alice Johnson',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      is_host: false,
      is_online: true,
    },
    {
      id: 'user3',
      name: 'Bob',
      full_name: 'Bob Smith',
      avatar_url: 'https://i.pravatar.cc/150?img=2',
      is_host: false,
      is_online: false,
    },
    {
      id: 'user4',
      name: 'Carol',
      full_name: 'Carol Davis',
      avatar_url: 'https://i.pravatar.cc/150?img=3',
      is_host: false,
      is_online: true,
    },
  ];

  const handleMemberAction = (member, action) => {
    switch (action) {
      case 'friend':
        Alert.alert(
          'Send Friend Request',
          `Send a friend request to ${member.full_name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Send Request', 
              onPress: () => {
                Alert.alert('Success', `Friend request sent to ${member.full_name}!`);
              }
            },
          ]
        );
        break;
      case 'report':
        Alert.alert(
          'Report User',
          `Report ${member.full_name} for inappropriate behavior?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Report', 
              style: 'destructive',
              onPress: () => {
                Alert.alert('Reported', `${member.full_name} has been reported. We'll review this shortly.`);
              }
            },
          ]
        );
        break;
      case 'profile':
        Alert.alert('View Profile', `Profile view for ${member.full_name} coming soon!`);
        break;
    }
  };

  const renderMember = ({ item }) => {
    const isCurrentUser = item.id === 'user1';
    
    return (
      <TouchableOpacity 
        style={styles.memberItem}
        onPress={() => !isCurrentUser && handleMemberAction(item, 'profile')}
        activeOpacity={isCurrentUser ? 1 : 0.7}
      >
        <View style={styles.memberInfo}>
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.lightGray }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {item.full_name.charAt(0)}
                </Text>
              </View>
            )}
            {item.is_online && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
          </View>
          
          <View style={styles.memberDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.memberName, { color: colors.text }]}>
                {item.full_name}
              </Text>
              {item.is_host && (
                <View style={[styles.hostBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.hostBadgeText, { color: colors.primary }]}>
                    Host
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.memberStatus, { color: colors.textSecondary }]}>
              {item.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {!isCurrentUser && (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleMemberAction(item, 'friend')}
            >
              <Ionicons name="person-add-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
              onPress={() => handleMemberAction(item, 'report')}
            >
              <Ionicons name="flag-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Members</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <FlatList
          data={mockMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          contentContainerStyle={styles.membersContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {mockMembers.length} member{mockMembers.length !== 1 ? 's' : ''} in this chat
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  membersList: {
    flex: 1,
  },
  membersContent: {
    paddingVertical: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  memberDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ChatMembersModal;