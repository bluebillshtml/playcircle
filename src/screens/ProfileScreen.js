import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
import { supabase, profileService } from '../services/supabase';
import NavigationButton from '../components/NavigationButton';
import AnimatedBackground from '../components/AnimatedBackground';


export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(profile?.avatar_url || null);

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

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        try {
          const fileName = `profile_${user.id}_${Date.now()}.jpg`;

          // Read file as base64 for Supabase upload
          const base64 = await fetch(imageUri).then(res => res.text());

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, base64, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            Alert.alert('Error', `Failed to upload image: ${uploadError.message}`);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          await profileService.updateProfile(user.id, {
            avatar_url: publicUrl,
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
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          {/* Zoomed and Blurred Profile Background */}
          <View style={styles.headerBackgroundContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.headerBackground}
              />
            ) : (
              <Image
                source={require('../../background1.jpg')}
                style={styles.headerBackground}
              />
            )}
            <View style={styles.headerBackgroundDarkOverlay} />
            <BlurView intensity={60} tint="dark" style={styles.headerBackgroundBlur} />
            <View style={styles.headerEdgeFade} />
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
                  <Ionicons name="person" size={48} color="#FFFFFF" />
                )}
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{getUserName()}</Text>
              <Text style={styles.userEmail}>{getUserEmail()}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
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
          </BlurView>
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
  headerWrapper: {
    overflow: 'hidden',
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
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
  headerBackgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  headerEdgeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    backgroundColor: 'transparent',
    zIndex: 3,
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
    color: '#FFFFFF',
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
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '400',
    opacity: 0.8,
  },
  menuContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
