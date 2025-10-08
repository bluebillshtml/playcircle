import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';
import AnimatedBackground from '../components/AnimatedBackground';


export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(profile?.profile_picture_url || null);

  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to change your profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        // Upload to Supabase storage
        try {
          const fileName = `profile_${user.id}_${Date.now()}.jpg`;

          // Fetch the image and convert to blob for React Native
          const response = await fetch(imageUri);
          const blob = await response.blob();

          // Upload to Supabase storage bucket
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            Alert.alert('Error', `Failed to upload image: ${uploadError.message}`);
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          // Update profile in database
          await supabaseService.updateProfile(user.id, {
            profile_picture_url: publicUrl,
          });

          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (uploadError) {
          console.error('Error uploading:', uploadError);
          Alert.alert('Error', `Failed to save profile picture: ${uploadError.message}`);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
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
        scrollEventThrottle={16}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          {/* Zoomed and Blurred Profile Background */}
          <View style={styles.headerBackgroundContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.headerBackground}
                blurRadius={10}
              />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.headerBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <View style={styles.headerBackgroundDarkOverlay} />
            <LinearGradient
              colors={['transparent', 'rgba(184, 230, 213, 0.05)', 'rgba(184, 230, 213, 0.15)', 'rgba(184, 230, 213, 0.3)', 'rgba(184, 230, 213, 0.5)', 'rgba(184, 230, 213, 0.7)', 'rgba(184, 230, 213, 0.85)', 'rgba(184, 230, 213, 0.95)', '#B8E6D5']}
              style={styles.headerEdgeFade}
              locations={[0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.92, 1]}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <NavigationButton navigation={navigation} currentScreen="Profile" />
              <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {/* Profile Picture and Edit Button */}
            <View style={styles.profileSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                )}
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{getUserName()}</Text>
                <Text style={styles.userEmail}>{getUserEmail()}</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={handlePickImage}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upcoming Matches Section */}
        <View style={styles.upcomingMatchesCard}>
          <View style={styles.cardBlur}>
            <View style={styles.cardHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="calendar-outline" size={22} color="#67E8F9" />
              </View>
              <Text style={styles.cardTitle}>Upcoming Matches</Text>
            </View>

            <View style={styles.matchesList}>
              {/* Match Item */}
              <View style={styles.matchItem}>
                <View style={styles.matchDateContainer}>
                  <Text style={styles.matchDay}>15</Text>
                  <Text style={styles.matchMonth}>OCT</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchSport}>Basketball</Text>
                  <Text style={styles.matchTime}>6:00 PM - 8:00 PM</Text>
                  <Text style={styles.matchLocation}>Downtown Court</Text>
                </View>
                <View style={styles.matchStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              </View>

              {/* Match Item */}
              <View style={styles.matchItem}>
                <View style={styles.matchDateContainer}>
                  <Text style={styles.matchDay}>18</Text>
                  <Text style={styles.matchMonth}>OCT</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchSport}>Tennis</Text>
                  <Text style={styles.matchTime}>4:00 PM - 6:00 PM</Text>
                  <Text style={styles.matchLocation}>City Tennis Club</Text>
                </View>
                <View style={styles.matchStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              </View>

              {/* Match Item */}
              <View style={styles.matchItem}>
                <View style={styles.matchDateContainer}>
                  <Text style={styles.matchDay}>22</Text>
                  <Text style={styles.matchMonth}>OCT</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchSport}>Soccer</Text>
                  <Text style={styles.matchTime}>7:00 PM - 9:00 PM</Text>
                  <Text style={styles.matchLocation}>Park Field #3</Text>
                </View>
                <View style={styles.matchStatus}>
                  <Ionicons name="time-outline" size={24} color="#F59E0B" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Performance Card */}
          <View style={styles.statCard}>
            <View style={styles.cardBlur}>
              <View style={styles.cardHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="trophy" size={22} color="#FF6B9D" />
                </View>
                <Text style={styles.cardTitle}>Performance</Text>
              </View>

              <Text style={styles.cardSubtitle}>This Month</Text>

              <View style={[styles.progressBar, { backgroundColor: '#FF6B9D' }]} />

              <Text style={styles.mainStat}>24</Text>
              <Text style={styles.mainStatLabel}>matches played</Text>

              <View style={styles.circleStatsRow}>
                <View style={styles.circleStatContainer}>
                  <View style={styles.circleProgress}>
                    <View style={styles.circleInner}>
                      <Text style={styles.circlePercent}>65%</Text>
                    </View>
                  </View>
                  <Text style={styles.circleLabel}>Wins</Text>
                </View>

                <View style={styles.circleStatContainer}>
                  <View style={styles.circleProgress}>
                    <View style={styles.circleInner}>
                      <Text style={styles.circlePercent}>90%</Text>
                    </View>
                  </View>
                  <Text style={styles.circleLabel}>Attendance</Text>
                </View>

                <View style={styles.circleStatContainer}>
                  <View style={styles.circleProgress}>
                    <View style={styles.circleInner}>
                      <Text style={styles.circlePercent}>45%</Text>
                    </View>
                  </View>
                  <Text style={styles.circleLabel}>Skill</Text>
                </View>
              </View>

              <View style={styles.bottomStats}>
                <View style={styles.bottomStatItem}>
                  <View style={styles.iconGlowSmall}>
                    <Ionicons name="calendar" size={18} color="#FFA06B" />
                  </View>
                  <Text style={styles.bottomStatNumber}>18</Text>
                  <Text style={styles.bottomStatLabel}>this week</Text>
                </View>

                <View style={styles.bottomStatItem}>
                  <View style={styles.iconGlowSmall}>
                    <Ionicons name="flame" size={18} color="#FF6B9D" />
                  </View>
                  <Text style={styles.bottomStatNumber}>7</Text>
                  <Text style={styles.bottomStatLabel}>win streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Achievements Card */}
          <View style={styles.statCard}>
            <View style={styles.cardBlur}>
              <View style={styles.cardHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="ribbon" size={22} color="#FFD06B" />
                </View>
                <Text style={styles.cardTitle}>Achievements</Text>
              </View>

              <View style={styles.achievementsList}>
                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="star" size={18} color="#FFD06B" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>First Victory</Text>
                    <View style={styles.achievementProgress}>
                      <View style={[styles.achievementProgressBar, { width: '100%', backgroundColor: '#FFD06B' }]} />
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="people" size={18} color="#C768FF" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Team Player</Text>
                    <View style={styles.achievementProgress}>
                      <View style={[styles.achievementProgressBar, { width: '75%', backgroundColor: '#C768FF' }]} />
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="flash" size={18} color="#FF6B9D" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Speed Demon</Text>
                    <View style={styles.achievementProgress}>
                      <View style={[styles.achievementProgressBar, { width: '50%', backgroundColor: '#FF6B9D' }]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <View style={styles.blurContainer}>
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
            
              {/* Sport Preferences */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Preferences')}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="options-outline" size={24} color={colors.text} />
                  <Text style={styles.menuItemText}>Preferences</Text>
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
    paddingTop: 0,
  },
  headerWrapper: {
    overflow: 'hidden',
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: -200,
    left: 0,
    right: 0,
    height: 600,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    transform: [{ scale: 1.5 }],
    resizeMode: 'cover',
  },
  headerBackgroundDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  headerEdgeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    zIndex: 3,
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    opacity: 0.7,
  },
  upcomingMatchesCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0,
    overflow: 'hidden',
  },
  matchesList: {
    gap: 12,
    marginTop: 8,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchDateContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 232, 249, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.3)',
  },
  matchDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#67E8F9',
    lineHeight: 28,
  },
  matchMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#67E8F9',
    opacity: 0.8,
  },
  matchDetails: {
    flex: 1,
  },
  matchSport: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
    fontWeight: '500',
  },
  matchLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  matchStatus: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    gap: 16,
    marginTop: 16,
  },
  statCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(52, 73, 94, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0,
    overflow: 'hidden',
  },
  cardBlur: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconGlowSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  mainStat: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1,
  },
  mainStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    fontWeight: '500',
  },
  circleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  circleStatContainer: {
    alignItems: 'center',
  },
  circleProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderWidth: 3,
    borderColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  circleLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  bottomStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  achievementsList: {
    gap: 16,
    marginTop: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  achievementProgress: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  menuContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(82, 95, 94, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
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
