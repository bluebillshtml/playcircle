import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { profileService, supabase } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfilePicture from '../components/ProfilePicture';
import ProfilePreviewModal from '../components/ProfilePreviewModal';

export default function AccountSettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile, setProfile, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  
  // Privacy settings state
  const [profileVisibilityEnabled, setProfileVisibilityEnabled] = useState(true);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false);
  const [activityTrackingEnabled, setActivityTrackingEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Form state - parse full_name into first and last name
  const parseFullName = (fullName) => {
    if (!fullName) return { first: '', last: '' };
    const parts = fullName.trim().split(' ');
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ') || ''
    };
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(profile?.profile_picture_url || null);
  const [coverImage, setCoverImage] = useState(profile?.cover_picture_url || null);

  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    profileImage: null,
    coverImage: null,
    profileVisibilityEnabled: true,
    dataSharingEnabled: false,
    activityTrackingEnabled: true,
    locationSharingEnabled: false,
    notificationsEnabled: true,
  });

  // Update form state when profile changes
  useEffect(() => {
    if (profile) {
      const { first, last } = parseFullName(profile.full_name);
      const initialValues = {
        firstName: first,
        lastName: last,
        username: profile.username || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        profileImage: profile.profile_picture_url || null,
        coverImage: profile.cover_picture_url || null,
        profileVisibilityEnabled: profile.profile_visibility_enabled ?? true,
        dataSharingEnabled: profile.data_sharing_enabled ?? false,
        activityTrackingEnabled: profile.activity_tracking_enabled ?? true,
        locationSharingEnabled: profile.location_sharing_enabled ?? false,
        notificationsEnabled: profile.notifications_enabled ?? true,
      };
      
      setFirstName(initialValues.firstName);
      setLastName(initialValues.lastName);
      setUsername(initialValues.username);
      setPhone(initialValues.phone);
      setBio(initialValues.bio);
      setLocation(initialValues.location);
      setProfileImage(initialValues.profileImage);
      setCoverImage(initialValues.coverImage);
      
      // Load privacy settings from profile
      const privacySettings = {
        profileVisibility: profile.profile_visibility_enabled ?? true,
        dataSharing: profile.data_sharing_enabled ?? false,
        activityTracking: profile.activity_tracking_enabled ?? true,
        locationSharing: profile.location_sharing_enabled ?? false,
        notifications: profile.notifications_enabled ?? true,
      };
      
      console.log('Loading privacy settings from profile:', privacySettings);
      
      setProfileVisibilityEnabled(privacySettings.profileVisibility);
      setDataSharingEnabled(privacySettings.dataSharing);
      setActivityTrackingEnabled(privacySettings.activityTracking);
      setLocationSharingEnabled(privacySettings.locationSharing);
      setNotificationsEnabled(privacySettings.notifications);
      
      // Store original values for comparison
      setOriginalValues(initialValues);
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const styles = createStyles(colors);

  // Check if any changes have been made
  const hasChanges = () => {
    return (
      firstName !== originalValues.firstName ||
      lastName !== originalValues.lastName ||
      username !== originalValues.username ||
      phone !== originalValues.phone ||
      bio !== originalValues.bio ||
      location !== originalValues.location ||
      profileImage !== originalValues.profileImage ||
      coverImage !== originalValues.coverImage ||
      profileVisibilityEnabled !== originalValues.profileVisibilityEnabled ||
      dataSharingEnabled !== originalValues.dataSharingEnabled ||
      activityTrackingEnabled !== originalValues.activityTrackingEnabled ||
      locationSharingEnabled !== originalValues.locationSharingEnabled ||
      notificationsEnabled !== originalValues.notificationsEnabled
    );
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
        // Only set the local state - don't upload until user saves
        setProfileImage(imageUri);
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
        // Only set the local state - don't upload until user saves
        setCoverImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking cover image:', error);
      Alert.alert('Error', 'Failed to pick cover image. Please try again.');
    }
  };

  const handleManualSave = async () => {
    if (!firstName.trim() || !username.trim()) {
      Alert.alert('Error', 'First name and username are required');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setSaving(true);
    try {
      let profilePictureUrl = originalValues.profileImage;
      let coverPictureUrl = originalValues.coverImage;

      // Handle profile picture upload if changed
      if (profileImage !== originalValues.profileImage && profileImage && !profileImage.startsWith('http')) {
        try {
          const fileName = `profile_${user.id}_${Date.now()}.jpg`;

          // Create FormData for React Native
          const formData = new FormData();
          formData.append('file', {
            uri: profileImage,
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
            setSaving(false);
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          profilePictureUrl = publicUrl;
        } catch (uploadError) {
          console.error('Error uploading:', uploadError);
          Alert.alert('Error', `Failed to save profile picture: ${uploadError.message}`);
          setSaving(false);
          return;
        }
      }

      // Handle cover photo upload if changed
      if (coverImage !== originalValues.coverImage && coverImage && !coverImage.startsWith('http')) {
        try {
          const fileName = `cover_${user.id}_${Date.now()}.jpg`;

          // Create FormData for React Native
          const formData = new FormData();
          formData.append('file', {
            uri: coverImage,
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
            setSaving(false);
            return;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          coverPictureUrl = publicUrl;
        } catch (uploadError) {
          console.error('Error uploading:', uploadError);
          Alert.alert('Error', `Failed to save cover photo: ${uploadError.message}`);
          setSaving(false);
          return;
        }
      }

      const updates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        location: location.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim() || 'User',
        profile_picture_url: profilePictureUrl,
        cover_picture_url: coverPictureUrl,
        // Include current privacy settings
        profile_visibility_enabled: profileVisibilityEnabled,
        data_sharing_enabled: dataSharingEnabled,
        activity_tracking_enabled: activityTrackingEnabled,
        location_sharing_enabled: locationSharingEnabled,
        notifications_enabled: notificationsEnabled,
        updated_at: new Date().toISOString(),
        // Preserve onboarding_completed flag
        onboarding_completed: profile?.onboarding_completed ?? true,
      };

      console.log('Manually saving profile updates:', updates);
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile({ ...profile, ...updatedProfile });

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to update profile';
      if (error.message && error.message.includes('coerce')) {
        errorMessage = 'There was an issue processing your profile data. Please try again.';
        console.error('JSON coercion error details:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setSavingPrivacy(true);
    try {
      const privacyUpdates = {
        profile_visibility_enabled: profileVisibilityEnabled,
        data_sharing_enabled: dataSharingEnabled,
        activity_tracking_enabled: activityTrackingEnabled,
        location_sharing_enabled: locationSharingEnabled,
        notifications_enabled: notificationsEnabled,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving privacy settings:', privacyUpdates);
      const updatedProfile = await profileService.updateProfile(user.id, privacyUpdates);
      setProfile({ ...profile, ...updatedProfile });

      // Update original values to reflect saved state
      setOriginalValues(prev => ({
        ...prev,
        profileVisibilityEnabled,
        dataSharingEnabled,
        activityTrackingEnabled,
        locationSharingEnabled,
        notificationsEnabled,
      }));

      // Close privacy modal and show confirmation
      setShowPrivacyModal(false);
      setShowConfirmationModal(true);
      
      // Auto-close confirmation after 2.5 seconds
      setTimeout(() => {
        setShowConfirmationModal(false);
      }, 2500);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings. Please try again.');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleSendPasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'your-app://reset-password',
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setShowPasswordModal(false);
        Alert.alert(
          'Email Sent',
          'Check your email for password reset instructions.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleProfileVisibility = (setting) => {
    // Update profile visibility setting
    Alert.alert(
      'Profile Visibility Updated',
      `Your profile is now set to: ${setting}`,
      [{ text: 'OK' }]
    );
    setShowPrivacyModal(false);
  };

  const handleDataPrivacy = () => {
    Alert.alert(
      'Data & Privacy',
      'Your data is protected according to our privacy policy. You can download your data or request deletion at any time.',
      [
        {
          text: 'Download My Data',
          onPress: () => {
            Alert.alert('Data Export', 'Your data export will be emailed to you within 24 hours.');
            setShowPrivacyModal(false);
          },
        },
        {
          text: 'Privacy Policy',
          onPress: () => {
            Alert.alert('Privacy Policy', 'Opening privacy policy...');
            setShowPrivacyModal(false);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // First delete the user's profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
      }

      // Then delete the user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        Alert.alert('Error', 'Failed to delete account. Please contact support.');
        console.error('Account deletion error:', authError);
      } else {
        setShowDeleteModal(false);
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Sign out the user
                signOut();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Deletion error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    }
  };

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <TouchableOpacity onPress={handleManualSave} disabled={saving} style={styles.saveButtonContainer}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section with Cover Photo Background */}
        <View style={styles.avatarSection}>
          {/* Cover Photo Background */}
          <View style={styles.coverPhotoBackground}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverPhotoImage} />
            ) : (
              <View style={styles.defaultCoverBackground} />
            )}
            {/* Gradient overlay for better text visibility */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
              style={styles.coverGradientOverlay}
            />
          </View>

          {/* Profile Picture and Controls */}
          <View style={styles.profileContent}>
            <View style={styles.avatarWrapper}>
              <ProfilePicture
                imageUrl={profileImage}
                size={100}
                fallbackText={firstName?.charAt(0) || profile?.first_name?.charAt(0) || profile?.username?.charAt(0)}
                borderColor="rgba(255, 255, 255, 0.8)"
                borderWidth={3}
                style={styles.profilePicture}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
                <Ionicons name="camera-outline" size={16} color={colors.primary} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.changeCoverButton} onPress={handlePickCoverImage}>
                <Ionicons name="image-outline" size={16} color={colors.primary} />
                <Text style={styles.changeCoverText}>Change Cover</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.previewButton, 
                !hasChanges() && styles.previewButtonDisabled
              ]} 
              onPress={() => hasChanges() && setShowPreview(true)}
              disabled={!hasChanges()}
            >
              <Ionicons 
                name="eye-outline" 
                size={16} 
                color={hasChanges() ? colors.text : colors.textSecondary} 
              />
              <Text style={[
                styles.previewButtonText,
                !hasChanges() && styles.previewButtonTextDisabled
              ]}>
                Preview Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.sectionCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconGlow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="key-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePrivacySettings}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]} 
              onPress={handleDeleteAccount}
            >
              <View style={[styles.actionIconContainer, styles.dangerIconContainer]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>

    {/* Profile Preview Modal */}
    <ProfilePreviewModal
      visible={showPreview}
      onClose={() => setShowPreview(false)}
      previewData={{
        firstName,
        lastName,
        username,
        location,
        bio,
        profileImage,
        coverImage,
      }}
    />

    {/* Change Password Modal */}
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPasswordModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPasswordModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(6, 95, 70, 0.5)', 'rgba(6, 95, 70, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="key-outline" size={56} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalMessage}>
                You will receive an email with instructions to reset your password.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleSendPasswordReset}
                >
                  <Text style={styles.modalConfirmText}>Send Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Privacy Settings Modal */}
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPrivacyModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPrivacyModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalCard}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Privacy Settings</Text>
              <Text style={styles.modalMessage}>
                Adjust your privacy preferences with the toggles below
              </Text>
              
              <View style={styles.privacyToggleContainer}>
                {/* Profile Visibility Toggle */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleContent}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.toggleTitle}>Public Profile</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Allow others to find and view your profile
                    </Text>
                  </View>
                  <Switch
                    value={profileVisibilityEnabled}
                    onValueChange={setProfileVisibilityEnabled}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.primary }}
                    thumbColor={profileVisibilityEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                </View>

                {/* Data Sharing Toggle */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleContent}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.toggleTitle}>Data Sharing</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Share anonymized data to improve app experience
                    </Text>
                  </View>
                  <Switch
                    value={dataSharingEnabled}
                    onValueChange={setDataSharingEnabled}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.primary }}
                    thumbColor={dataSharingEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                </View>

                {/* Activity Tracking Toggle */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleContent}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.toggleTitle}>Activity Tracking</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Track your activity for personalized insights
                    </Text>
                  </View>
                  <Switch
                    value={activityTrackingEnabled}
                    onValueChange={setActivityTrackingEnabled}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.primary }}
                    thumbColor={activityTrackingEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                </View>

                {/* Location Sharing Toggle */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleContent}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="location-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.toggleTitle}>Location Sharing</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Share your location to find nearby players
                    </Text>
                  </View>
                  <Switch
                    value={locationSharingEnabled}
                    onValueChange={setLocationSharingEnabled}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.primary }}
                    thumbColor={locationSharingEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                </View>

                {/* Notifications Toggle */}
                <View style={styles.toggleSection}>
                  <View style={styles.toggleContent}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.toggleTitle}>Push Notifications</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Receive notifications about games and messages
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: colors.primary }}
                    thumbColor={notificationsEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                </View>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowPrivacyModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleSavePrivacySettings}
                  disabled={savingPrivacy}
                >
                  {savingPrivacy ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Save Settings</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Delete Account Modal */}
    <Modal
      visible={showDeleteModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDeleteModal(false)}
        />
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.5)', 'rgba(220, 38, 38, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="warning-outline" size={56} color={colors.error} />
              </View>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalDangerButton]}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.modalDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>

    {/* Settings Saved Confirmation Modal */}
    <Modal
      visible={showConfirmationModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowConfirmationModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.modalDarkOverlay} />
        </BlurView>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowConfirmationModal(false)}
        />
        <View style={styles.confirmationModalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.confirmationModalCard}>
              <View style={styles.confirmationIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.confirmationTitle}>Settings Saved!</Text>
              <Text style={styles.confirmationMessage}>
                Your privacy settings have been updated successfully.
              </Text>
              <TouchableOpacity
                style={styles.confirmationButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.confirmationButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  saveButtonContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  avatarSection: {
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
  },
  coverPhotoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultCoverBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
  },
  coverGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surface + '60',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flex: 1,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignSelf: 'center',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  previewButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surface + '40',
  },
  previewButtonTextDisabled: {
    color: colors.textSecondary,
  },
  changeCoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surface + '60',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flex: 1,
  },
  changeCoverText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  iconGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: colors.card + '80',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  actionsContainer: {
    gap: 12,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dangerIconContainer: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error + '30',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  dangerButton: {
    backgroundColor: colors.card,
    borderColor: colors.error + '30',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalBlur: {
    borderRadius: 24,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalCard: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
  },
  modalDangerButton: {
    backgroundColor: colors.error,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyOptionsContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  privacyOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  privacyOptionDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    left: 48,
    bottom: 8,
  },
  modalDangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  privacyToggleContainer: {
    width: '100%',
    marginBottom: 16,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 14,
  },
  // Confirmation Modal Styles
  confirmationModalContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  confirmationModalCard: {
    padding: 32,
    alignItems: 'center',
  },
  confirmationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  confirmationMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 120,
    alignItems: 'center',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
