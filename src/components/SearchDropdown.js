import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SearchDropdown = ({
  users = [],
  loading = false,
  onUserSelect,
  onAddFriend,
  actionLoading,
  visible = false,
  style,
}) => {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, style]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Searching users...
          </Text>
        </View>
      ) : users.length > 0 ? (
        users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userRow}
            onPress={() => onUserSelect?.(user)}
          >
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={[styles.userAvatarText, { color: colors.primary }]}>
                  {(user.first_name || user.full_name || user.username || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.full_name || user.username}
                </Text>
                <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
                  @{user.username}
                </Text>
                {user.favorite_sports && user.favorite_sports.length > 0 && (
                  <View style={styles.userSports}>
                    {user.favorite_sports.slice(0, 2).map((sport, sportIndex) => (
                      <View key={sportIndex} style={[styles.sportTag, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.sportTagText, { color: colors.primary }]}>
                          {sport}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.addFriendButton, { backgroundColor: colors.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                onAddFriend(user.id);
              }}
              disabled={actionLoading === `add-${user.id}`}
            >
              {actionLoading === `add-${user.id}` ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="person-add" size={14} color="#FFFFFF" />
                  <Text style={styles.addFriendButtonText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No users found
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 300,
    zIndex: 99999,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 12,
    fontWeight: '500',
  },
  userSports: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  sportTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sportTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SearchDropdown;
