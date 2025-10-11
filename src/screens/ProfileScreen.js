import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  TextInput,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfilePicture from '../components/ProfilePicture';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, profile, signOut, refreshProfile, setProfile } = useAuth();
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(profile?.profile_picture_url || null);
  const [coverImage, setCoverImage] = useState(profile?.cover_picture_url || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [bioHeight, setBioHeight] = useState(0);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  
  // Animation value for smooth bio transitions
  const bioTextOpacity = useRef(new Animated.Value(1)).current;

  // Enable LayoutAnimation on Android
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Refresh profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (refreshProfile) {
        refreshProfile();
      }
      // Update profile image if it changed
      if (profile?.profile_picture_url) {
        setProfileImage(profile.profile_picture_url);
      }
      // Update cover image if it changed
      if (profile?.cover_picture_url) {
        setCoverImage(profile.cover_picture_url);
      }
    }, [profile?.profile_picture_url, profile?.cover_picture_url, refreshProfile])
  );


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

  // Check if bio needs expand/collapse functionality
  const handleBioTextLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setBioHeight(height);
    // If height is more than 3 lines (3 * 18px line height = 54px)
    setShouldShowExpandButton(height > 54);
  };

  // Toggle bio expansion with smooth animation
  const toggleBioExpansion = () => {
    // First fade out the text
    Animated.timing(bioTextOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // After fade out completes, change the state
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleY,
        },
      });
      
      setIsBioExpanded(!isBioExpanded);
      
      // Then fade the text back in with new content
      setTimeout(() => {
        Animated.timing(bioTextOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 50);
    });
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

          // Create FormData for React Native
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
          });

          // Upload to Supabase storage bucket using FormData
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, formData, {
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
          const updatedProfile = await supabaseService.updateProfile(user.id, {
            profile_picture_url: publicUrl,
          });

          // Update profile in auth context
          setProfile({ ...profile, ...updatedProfile });

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

  const handlePickCoverImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to change your cover photo.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Wide aspect ratio for cover photo
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCoverImage(imageUri);

        // Upload to Supabase storage
        try {
          const fileName = `cover_${user.id}_${Date.now()}.jpg`;

          // Create FormData for React Native
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
          });

          // Upload to Supabase storage bucket using FormData
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, formData, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            Alert.alert('Error', `Failed to upload cover image: ${uploadError.message}`);
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          // Update profile in database
          const updatedProfile = await supabaseService.updateProfile(user.id, {
            cover_picture_url: publicUrl,
          });

          setProfile({ ...profile, ...updatedProfile });

          Alert.alert('Success', 'Cover photo updated successfully!');
        } catch (uploadError) {
          console.error('Error uploading:', uploadError);
          Alert.alert('Error', `Failed to save cover photo: ${uploadError.message}`);
        }
      }
    } catch (error) {
      console.error('Error picking cover image:', error);
      Alert.alert('Error', 'Failed to pick cover image. Please try again.');
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
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => console.log('Menu pressed')}
          >
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search games"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={styles.coverEditButton}
              onPress={handlePickCoverImage}
            >
              <Ionicons name="camera-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
        {/* Header with Cover Photo */}
        <View style={styles.headerWrapper}>
          {/* Cover Photo Background */}
          <View style={styles.coverPhotoContainer}>
            {coverImage ? (
              <Image 
                source={{ uri: coverImage }} 
                style={styles.coverPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultCoverPhoto} />
            )}
            {/* Gradient overlay for text readability */}
            <LinearGradient
              colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.coverGradient}
            />
          </View>

          <View style={styles.header}>
            {/* Profile Section - Vertical Layout */}
            <View style={styles.profileSection}>
              {/* Profile Picture */}
              <View style={styles.avatarRow}>
                <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
                  <ProfilePicture
                    imageUrl={profileImage}
                    size={64}
                    fallbackText={profile?.first_name?.charAt(0) || profile?.username?.charAt(0)}
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderWidth={2}
                  />
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* User Info Below Picture */}
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{getUserName()}</Text>
                <Text style={styles.userEmail}>@{profile?.username || 'username'}</Text>
                
                {/* Location */}
                {profile?.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.locationText}>{profile.location}</Text>
                  </View>
                )}
                
                {/* Bio */}
                {profile?.bio && (
                  <View style={styles.bioContainer}>
                    {/* Hidden text to measure full height */}
                    <Text
                      style={[styles.bioText, styles.hiddenBioText]}
                      onLayout={handleBioTextLayout}
                    >
                      {profile.bio}
                    </Text>
                    
                    {/* Visible bio text */}
                    <Animated.Text 
                      style={[
                        styles.bioText,
                        { opacity: bioTextOpacity }
                      ]} 
                      numberOfLines={isBioExpanded ? undefined : 3}
                    >
                      {profile.bio}
                    </Animated.Text>
                    
                    {/* Show expand/collapse button if bio is longer than 3 lines */}
                    {shouldShowExpandButton && (
                      <TouchableOpacity 
                        style={styles.expandButton}
                        onPress={toggleBioExpansion}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.expandButtonText}>
                          {isBioExpanded ? 'Show less' : 'View more'}
                        </Text>
                        <Ionicons 
                          name={isBioExpanded ? 'chevron-up' : 'chevron-down'} 
                          size={12} 
                          color={colors.primary} 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Horizontal Scrollable Cards Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardsContainer}
          style={styles.horizontalCardsScroll}
          pagingEnabled={true}
          decelerationRate="fast"
          snapToInterval={376}
          snapToAlignment="start"
          onScroll={(event) => {
            const scrollPosition = event.nativeEvent.contentOffset.x;
            const cardIndex = Math.round(scrollPosition / 376);
            setCurrentCardIndex(cardIndex);
          }}
          scrollEventThrottle={16}
        >
          {/* Upcoming Matches Card */}
          <View style={styles.horizontalCard}>
            <View style={styles.cardBlur}>
              <View style={styles.cardHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="calendar-outline" size={22} color={colors.primary} />
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

          {/* Performance Card */}
          <View style={styles.horizontalCard}>
            <View style={styles.cardBlur}>
              <View style={styles.cardHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="trophy" size={22} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Performance</Text>
              </View>

              <Text style={styles.cardSubtitle}>This Month</Text>

              <View style={styles.progressBar} />

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
                    <Ionicons name="calendar" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.bottomStatNumber}>18</Text>
                  <Text style={styles.bottomStatLabel}>this week</Text>
                </View>

                <View style={styles.bottomStatItem}>
                  <View style={styles.iconGlowSmall}>
                    <Ionicons name="flame" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.bottomStatNumber}>7</Text>
                  <Text style={styles.bottomStatLabel}>win streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Achievements Card */}
          <View style={styles.horizontalCard}>
            <View style={styles.cardBlur}>
              <View style={styles.cardHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="ribbon" size={22} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Achievements</Text>
              </View>

              <View style={styles.achievementsList}>
                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="star" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>First Victory</Text>
                    <View style={styles.achievementProgress}>
                      <View
                        style={[
                          styles.achievementProgressBar,
                          { width: '100%', backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="people" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Team Player</Text>
                    <View style={styles.achievementProgress}>
                      <View
                        style={[
                          styles.achievementProgressBar,
                          { width: '75%', backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name="flash" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Speed Demon</Text>
                    <View style={styles.achievementProgress}>
                      <View
                        style={[
                          styles.achievementProgressBar,
                          { width: '50%', backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Card Scroll Indicator */}
        <View style={styles.scrollIndicator}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                {
                  backgroundColor:
                    currentCardIndex === index ? colors.primary : colors.primary + '40',
                  transform: [{ scale: currentCardIndex === index ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
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

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
        statusBarTranslucent={true}
      >
        <BlurView intensity={80} style={styles.modalOverlay} tint="dark">
          <View style={styles.modalDarkOverlay} />
          <View style={styles.notificationsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowNotifications(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.notificationsContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Notification Items */}
              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Match Reminder</Text>
                  <Text style={styles.notificationMessage}>
                    Basketball game starts in 30 minutes at Downtown Court
                  </Text>
                  <Text style={styles.notificationTime}>5 minutes ago</Text>
                </View>
                <View style={styles.notificationDot} />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="people" size={20} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>New Friend Request</Text>
                  <Text style={styles.notificationMessage}>
                    Alex Johnson wants to connect with you
                  </Text>
                  <Text style={styles.notificationTime}>2 hours ago</Text>
                </View>
                <View style={styles.notificationDot} />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="trophy" size={20} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Achievement Unlocked</Text>
                  <Text style={styles.notificationMessage}>
                    You've completed the "Team Player" achievement!
                  </Text>
                  <Text style={styles.notificationTime}>1 day ago</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="chatbubble" size={20} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>New Message</Text>
                  <Text style={styles.notificationMessage}>
                    Sarah: "Great game today! Same time next week?"
                  </Text>
                  <Text style={styles.notificationTime}>2 days ago</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Court Update</Text>
                  <Text style={styles.notificationMessage}>
                    Tennis Court #2 is now available for booking
                  </Text>
                  <Text style={styles.notificationTime}>3 days ago</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.notificationActions}>
              <TouchableOpacity style={styles.markAllReadButton}>
                <Text style={styles.markAllReadText}>Mark All as Read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    gap: 12,
    elevation: 1000,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverEditButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerWrapper: {
    position: 'relative',
    marginTop: 0,
    paddingTop: 24,
  },
  coverPhotoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  defaultCoverPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    backgroundColor: 'transparent',
    paddingTop: 120,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    alignSelf: 'center',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface + '80',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignSelf: 'center',
  },
  userInfoContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  bioText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    opacity: 0.9,
    fontWeight: '400',
  },
  bioContainer: {
    position: 'relative',
    marginTop: 4,
  },
  hiddenBioText: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    pointerEvents: 'none',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalCardsScroll: {
    marginTop: 16,
  },
  horizontalCardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  horizontalCard: {
    width: 360,
    borderRadius: 24,
    backgroundColor: colors.glass,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  matchesList: {
    gap: 12,
    marginTop: 8,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  matchDateContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  matchDay: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 28,
  },
  matchMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    opacity: 0.8,
  },
  matchDetails: {
    flex: 1,
  },
  matchSport: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  matchLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
    opacity: 0.8,
  },
  matchStatus: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  iconGlowSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainStat: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -1,
  },
  mainStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    flex: 1,
    marginHorizontal: 2,
    minWidth: 90,
  },
  circleProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary + '20',
    borderWidth: 3,
    borderColor: colors.primary,
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
    color: colors.text,
  },
  circleLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1,
    maxWidth: 80,
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  bottomStatItem: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    flex: 1,
    marginHorizontal: 4,
  },
  bottomStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  bottomStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
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
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  achievementIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  achievementProgress: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  menuContainer: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.glass,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationsModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    position: 'relative',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  notificationActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  markAllReadButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
