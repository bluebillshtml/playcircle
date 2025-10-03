import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Mock leaderboard data
const LEADERBOARD_DATA = [
  {
    id: 1,
    name: 'Dalia Kvedaraite',
    rating: 5,
    points: 2847,
    isOnline: true,
    rank: 1,
    avatar: null,
  },
  {
    id: 2,
    name: 'Hilda Murray',
    rating: 4,
    points: 2653,
    isOnline: true,
    rank: 2,
    avatar: null,
  },
  {
    id: 3,
    name: 'Stephanie Kleimann',
    rating: 5,
    points: 2431,
    isOnline: true,
    rank: 3,
    avatar: null,
  },
  {
    id: 4,
    name: 'Alex Martinez',
    rating: 4,
    points: 2198,
    isOnline: true,
    rank: 4,
    avatar: null,
  },
  {
    id: 5,
    name: 'Sarah Johnson',
    rating: 3,
    points: 1987,
    isOnline: false,
    rank: 5,
    avatar: null,
  },
  {
    id: 6,
    name: 'Mike Chen',
    rating: 3,
    points: 1823,
    isOnline: false,
    rank: 6,
    avatar: null,
  },
];

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : colors.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderUserStatus = (isOnline) => {
    if (isOnline) {
      return (
        <View style={styles.statusIndicator}>
          <Ionicons name="checkmark" size={16} color={colors.primary} />
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={styles.challengeButton}>
          <Ionicons name="hand-left-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      );
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsLabel}>WP</Text>
            <Text style={styles.pointsValue}>648,982</Text>
          </View>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>PRO</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerSubtitle}>
          <Text style={styles.subtitleText}>Daily Workout Leaderboard</Text>
          <TouchableOpacity style={styles.chatIcon}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.teamText}>Your Team</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.leaderboardList}
        showsVerticalScrollIndicator={false}
      >
        {LEADERBOARD_DATA.map((user, index) => (
          <TouchableOpacity key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color={colors.text} />
                  </View>
                )}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{user.rank}</Text>
                </View>
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(user.rating)}
                </View>
                <Text style={styles.pointsText}>{user.points.toLocaleString()} points</Text>
              </View>
            </View>
            
            <View style={styles.userActions}>
              {renderUserStatus(user.isOnline)}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spacer: {
    height: 60,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  proButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chatIcon: {
    padding: 4,
  },
  teamText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  leaderboardList: {
    padding: 20,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
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
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  challengeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
