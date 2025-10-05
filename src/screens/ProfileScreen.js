import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NavigationButton from '../components/NavigationButton';
import AnimatedBackground from '../components/AnimatedBackground';


export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();

  const styles = createStyles(colors);

  const getUserName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`.trim();
    } else if (profile?.first_name) {
      return profile.first_name;
    } else if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@email.com';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.headerTop}>
          <NavigationButton navigation={navigation} currentScreen="Profile" />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
          
          {/* Profile Picture and Edit Button */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{getUserName()}</Text>
            <Text style={styles.userEmail}>{getUserEmail()}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Account Setting */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AccountSettings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Account Setting</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Purchases */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Purchases')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Purchases</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Languages */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Languages')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="globe-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Languages</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AppSettings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Help Center */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '400',
    opacity: 0.8,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 20,
  },
});
