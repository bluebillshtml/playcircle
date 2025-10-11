import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import ProfilePicture from './ProfilePicture';

/**
 * ProfilePreviewModal Component
 * 
 * Shows a preview of how the user's profile will look with the current form data
 * before they save their changes in AccountSettings.
 */
const ProfilePreviewModal = ({
  visible,
  onClose,
  previewData,
}) => {
  const { colors } = useTheme();

  const getUserName = () => {
    if (previewData?.firstName && previewData?.lastName) {
      return `${previewData.firstName} ${previewData.lastName}`.trim();
    }
    if (previewData?.firstName) {
      return previewData.firstName;
    }
    return 'User';
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
        </BlurView>

        <View style={styles.modalContainer}>
          <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
            <LinearGradient
              colors={[colors.glass, colors.surface]}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile Preview</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* Profile Card Preview */}
                <View style={styles.previewCard}>
                  <BlurView intensity={40} style={styles.cardBlur}>
                    <LinearGradient
                      colors={[colors.glass, colors.surface]}
                      style={styles.cardGradient}
                    >
                      {/* Profile Section */}
                      <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                          <ProfilePicture
                            imageUrl={previewData?.profileImage}
                            size={48}
                            fallbackText={previewData?.firstName?.charAt(0) || previewData?.username?.charAt(0)}
                            borderColor="rgba(255, 255, 255, 0.2)"
                            borderWidth={2}
                          />
                        </View>
                        
                        <View style={styles.userInfoContainer}>
                          <Text style={styles.userName}>{getUserName()}</Text>
                          <Text style={styles.userEmail}>
                            @{previewData?.username || 'username'}
                          </Text>
                        </View>
                      </View>

                      {/* Additional Info Preview */}
                      <View style={styles.infoSection}>
                        {previewData?.location && (
                          <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{previewData.location}</Text>
                          </View>
                        )}
                        
                        {previewData?.bio && (
                          <View style={styles.bioSection}>
                            <Text style={styles.bioText} numberOfLines={3}>
                              {previewData.bio}
                            </Text>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>

                {/* Empty Cards Preview */}
                <View style={styles.emptyCardsSection}>
                  <Text style={styles.sectionTitle}>Profile Cards Preview</Text>
                  
                  {/* Upcoming Matches Card - Empty */}
                  <View style={styles.emptyCard}>
                    <BlurView intensity={30} style={styles.emptyCardBlur}>
                      <View style={styles.emptyCardHeader}>
                        <View style={styles.iconGlow}>
                          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyCardTitle}>Upcoming Matches</Text>
                      </View>
                      <View style={styles.emptyCardContent}>
                        <Text style={styles.emptyCardText}>Your upcoming matches will appear here</Text>
                      </View>
                    </BlurView>
                  </View>

                  {/* Stats Card - Empty */}
                  <View style={styles.emptyCard}>
                    <BlurView intensity={30} style={styles.emptyCardBlur}>
                      <View style={styles.emptyCardHeader}>
                        <View style={styles.iconGlow}>
                          <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyCardTitle}>Your Stats</Text>
                      </View>
                      <View style={styles.emptyCardContent}>
                        <Text style={styles.emptyCardText}>Your game statistics will appear here</Text>
                      </View>
                    </BlurView>
                  </View>

                  {/* Friends Card - Empty */}
                  <View style={styles.emptyCard}>
                    <BlurView intensity={30} style={styles.emptyCardBlur}>
                      <View style={styles.emptyCardHeader}>
                        <View style={styles.iconGlow}>
                          <Ionicons name="people-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyCardTitle}>Friends</Text>
                      </View>
                      <View style={styles.emptyCardContent}>
                        <Text style={styles.emptyCardText}>Your friends will appear here</Text>
                      </View>
                    </BlurView>
                  </View>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  This is how your profile will look after saving changes
                </Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalBlur: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  previewCard: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBlur: {
    borderRadius: 20,
  },
  cardGradient: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  bioSection: {
    paddingTop: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    opacity: 0.9,
  },
  emptyCardsSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyCardBlur: {
    borderRadius: 16,
  },
  emptyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    gap: 12,
  },
  iconGlow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyCardText: {
    fontSize: 14,
    color: colors.textSecondary,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default ProfilePreviewModal;