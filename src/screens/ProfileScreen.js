import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Mock user data
const USER_DATA = {
  name: 'Alex Martinez',
  email: 'alex.martinez@email.com',
  rating: 4.7,
  matchesPlayed: 87,
  matchesWon: 52,
  skillLevel: 'Intermediate',
  memberSince: 'January 2024',
};

const MATCH_HISTORY = [
  {
    id: 1,
    courtName: 'Downtown Padel Club',
    date: '2025-09-28',
    result: 'won',
    type: 'competitive',
  },
  {
    id: 2,
    courtName: 'Sunset Sports Center',
    date: '2025-09-25',
    result: 'lost',
    type: 'casual',
  },
  {
    id: 3,
    courtName: 'Elite Padel Academy',
    date: '2025-09-22',
    result: 'won',
    type: 'competitive',
  },
];

export default function ProfileScreen() {
  const { colors, isDarkMode, themePreference, setThemePreference } = useTheme();
  const winRate = ((USER_DATA.matchesWon / USER_DATA.matchesPlayed) * 100).toFixed(
    0
  );

  const styles = createStyles(colors);

  const handleThemeChange = (value) => {
    if (themePreference === 'dark') {
      setThemePreference('light');
    } else if (themePreference === 'light') {
      setThemePreference('system');
    } else {
      setThemePreference('dark');
    }
  };

  const getThemeLabel = () => {
    if (themePreference === 'system') return 'System';
    if (themePreference === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{USER_DATA.name}</Text>
        <Text style={styles.email}>{USER_DATA.email}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={colors.warning} />
          <Text style={styles.rating}>{USER_DATA.rating}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{USER_DATA.matchesPlayed}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{USER_DATA.skillLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        {MATCH_HISTORY.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchCardLeft}>
              <View
                style={[
                  styles.resultBadge,
                  match.result === 'won'
                    ? styles.resultBadgeWon
                    : styles.resultBadgeLost,
                ]}
              >
                <Text
                  style={[
                    styles.resultText,
                    match.result === 'won'
                      ? styles.resultTextWon
                      : styles.resultTextLost,
                  ]}
                >
                  {match.result.toUpperCase()}
                </Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={styles.matchCourtName}>{match.courtName}</Text>
                <Text style={styles.matchDate}>
                  {new Date(match.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.typeBadge,
                match.type === 'competitive'
                  ? styles.typeBadgeCompetitive
                  : styles.typeBadgeCasual,
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {match.type === 'competitive' ? 'COMPETITIVE' : 'CASUAL'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleThemeChange}>
          <View style={styles.menuItemLeft}>
            <Ionicons
              name={themePreference === 'system' ? 'phone-portrait-outline' : (isDarkMode ? 'moon' : 'sunny')}
              size={22}
              color={colors.text}
            />
            <View>
              <Text style={styles.menuItemText}>Theme</Text>
              <Text style={styles.menuItemSubtext}>{getThemeLabel()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="card-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Payment Methods</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="time-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Match History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="mail-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Contact Us</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
            <Text style={styles.menuItemText}>Terms & Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statsCard: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    marginTop: 12,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resultBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeWon: {
    backgroundColor: colors.winBackground,
  },
  resultBadgeLost: {
    backgroundColor: colors.lossBackground,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultTextWon: {
    color: colors.winText,
  },
  resultTextLost: {
    color: colors.lossText,
  },
  matchInfo: {
    flex: 1,
  },
  matchCourtName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  matchDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeCompetitive: {
    backgroundColor: colors.badgeCompetitive,
  },
  typeBadgeCasual: {
    backgroundColor: colors.badgeCasual,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.badgeCompetitiveText,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItemSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 20,
  },
});
