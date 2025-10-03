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
    <View style={styles.wrapper}>
      <View style={styles.spacer} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color="#FFFFFF" />
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
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spacer: {
    height: 60,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 32,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
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
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
    letterSpacing: -0.4,
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    marginBottom: 6,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '500',
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
    gap: 14,
    backgroundColor: colors.surface,
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.error,
    letterSpacing: -0.2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 20,
  },
});
