import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { friendsService } from '../services/friendsService';

export default function UserProfileScreen({ route, navigation }) {
  const { userId, userData } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const [friendStatus, setFriendStatus] = useState('none'); // 'none', 'pending', 'friends'
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

  const handleAddFriend = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to send friend requests');
      return;
    }

    setLoading(true);
    try {
      const result = await friendsService.sendFriendRequest(user.id, userId);
      
      if (result.success) {
        setFriendStatus('pending');
        Alert.alert('Success', 'Friend request sent!');
      } else {
        Alert.alert('Error', result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('Messages', { userId });
  };

  const handleInvite = () => {
    Alert.alert('Invite to Game', 'Game invitation feature coming soon!');
  };

  const renderActionButton = () => {
    if (friendStatus === 'friends') {
      return (
        <TouchableOpacity style={[styles.actionButton, styles.friendsButton]} disabled>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.actionButtonText, { color: colors.success }]}>Friends</Text>
        </TouchableOpacity>
      );
    }

    if (friendStatus === 'pending') {
      return (
        <TouchableOpacity style={[styles.actionButton, styles.pendingButton]} disabled>
          <Ionicons name="time" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Pending</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.actionButton, styles.addFriendButton, { backgroundColor: colors.primary }]}
        onPress={handleAddFriend}
        disabled={loading}
      >
        <Ionicons name="person-add" size={20} color="#FFFFFF" />
        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
          {loading ? 'Sending...' : 'Add Friend'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: userData.color || colors.primary }]}>
              {userData.avatar ? (
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={64} color="#FFFFFF" />
              )}
            </View>

            <Text style={[styles.name, { color: colors.text }]}>{userData.name}</Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>{userData.username}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{userData.points}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>#{userData.rank}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rank</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {userData.trend === 'up' ? '↑' : '↓'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trend</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {renderActionButton()}

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}
              onPress={handleInvite}
            >
              <Ionicons name="game-controller-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Invite</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>San Francisco, CA</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>Joined January 2024</Text>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              No recent activity to display
            </Text>
          </View>
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addFriendButton: {
    // Primary button with colors.primary background
  },
  friendsButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  pendingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
  },
});
