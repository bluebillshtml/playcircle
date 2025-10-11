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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { profileService, supabase } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfilePicture from '../components/ProfilePicture';
import ProfilePreviewModal from '../components/ProfilePreviewModal';

export default function AccountSettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile, setProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      };
      
      setFirstName(initialValues.firstName);
      setLastName(initialValues.lastName);
      setUsername(initialValues.username);
      setPhone(initialValues.phone);
      setBio(initialValues.bio);
      setLocation(initialValues.location);
      setProfileImage(initialValues.profileImage);
      setCoverImage(initialValues.coverImage);
      
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
      coverImage !== originalValues.coverImage
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
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <ProfilePicture
              imageUrl={profileImage}
              size={100}
              fallbackText={firstName?.charAt(0) || profile?.first_name?.charAt(0) || profile?.username?.charAt(0)}
              borderColor={colors.primary + '40'}
              borderWidth={3}
              style={styles.profilePicture}
            />
          </View>
          <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
          
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

        {/* Cover Photo Section */}
        <View style={styles.coverPhotoSection}>
          <Text style={styles.sectionLabel}>Cover Photo</Text>
          <View style={styles.coverPhotoContainer}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverPhotoPreview} />
            ) : (
              <View style={styles.defaultCoverPhoto}>
                <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.noCoverText}>No cover photo</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changeCoverButton} onPress={handlePickCoverImage}>
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={styles.changeCoverText}>Change Cover Photo</Text>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="key-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
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
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    marginBottom: 16,
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
    alignSelf: 'center',
    marginBottom: 12,
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
  coverPhotoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  coverPhotoContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  coverPhotoPreview: {
    width: '100%',
    height: '100%',
  },
  defaultCoverPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  noCoverText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
    alignSelf: 'center',
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
});
