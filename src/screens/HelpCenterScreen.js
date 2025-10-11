import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

export default function HelpCenterScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const styles = createStyles(colors);

  const faqs = [
    {
      id: 1,
      question: 'How do I join a match?',
      answer:
        'Browse available matches on the Home screen, tap on a match to view details, and click the "Join Match" button. You\'ll need to complete payment to confirm your spot.',
    },
    {
      id: 2,
      question: 'How do I create a match?',
      answer:
        'Tap the "+" button in the navigation, select a court, date, time, and skill level. Set the price and number of players, then publish your match.',
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer:
        'We accept all major credit cards, debit cards, and digital wallets through our secure payment processor Stripe.',
    },
    {
      id: 4,
      question: 'How do I cancel a match?',
      answer:
        'Go to your Matches tab, select the match you want to cancel, and tap "Leave Match". Refund policies apply based on how far in advance you cancel.',
    },
    {
      id: 5,
      question: 'How is my skill level determined?',
      answer:
        'You can set your initial skill level during signup. As you play more matches, the system will track your performance and suggest adjustments to ensure fair matchmaking.',
    },
    {
      id: 6,
      question: 'Can I invite friends to a match?',
      answer:
        'Yes! When viewing match details, tap the Share button to send an invitation link to your friends via text, email, or social media.',
    },
    {
      id: 7,
      question: 'What if I need to contact support?',
      answer:
        'You can reach our support team via the Contact Support button below, or email us directly at support@playcircle.com. We typically respond within 24 hours.',
    },
  ];

  const supportOptions = [
    {
      id: 1,
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'headset-outline',
      color: colors.primary,
      action: () => handleContactSupport(),
    },
    {
      id: 2,
      title: 'Report a Bug',
      description: 'Let us know about any issues',
      icon: 'bug-outline',
      color: '#FF6B6B',
      action: () => handleReportBug(),
    },
    {
      id: 3,
      title: 'Want a Feature Added',
      description: 'Request new features or improvements',
      icon: 'add-circle-outline',
      color: '#4ECDC4',
      action: () => handleFeatureRequest(),
    },
    {
      id: 4,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: 'document-text-outline',
      color: '#95A5A6',
      action: () => handleOpenTerms(),
    },
    {
      id: 5,
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      icon: 'shield-checkmark-outline',
      color: '#2ECC71',
      action: () => handleOpenPrivacy(),
    },
  ];

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleSendEmail = (type, subject) => {
    setShowContactModal(false);
    const email = type === 'support' ? 'support@playcircle.com' : 
                  type === 'bug' ? 'bugs@playcircle.com' : 'feedback@playcircle.com';
    
    let body = '';
    if (type === 'support') {
      body = `Hi PlayCircle Support Team,\n\nI need help with:\n\n\nDetails:\n\n\nUser Information:\nUser ID: ${user?.id}\nEmail: ${user?.email}\n\nThank you for your assistance!`;
    } else if (type === 'bug') {
      body = `Hi PlayCircle Team,\n\nI found a bug in the app:\n\nWhat happened:\n\n\nSteps to reproduce:\n1. \n2. \n3. \n\nWhat I expected to happen:\n\n\nDevice Info:\nUser ID: ${user?.id}\nEmail: ${user?.email}\nApp Version: 1.0.0\n\nThanks for fixing this!`;
    } else {
      body = `Hi PlayCircle Team,\n\nI would like to request a new feature:\n\nFeature Description:\n\n\nWhy this would be helpful:\n\n\nUser Details:\nUser ID: ${user?.id}\nEmail: ${user?.email}\n\nThanks for considering my suggestion!`;
    }
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const handleReportBug = () => {
    setShowBugModal(true);
  };

  const handleFeatureRequest = () => {
    setShowFeatureModal(true);
  };

  const handleOpenTerms = () => {
    setShowTermsModal(true);
  };

  const handleOpenPrivacy = () => {
    setShowPrivacyModal(true);
  };

  const handleSendBugReport = () => {
    setShowBugModal(false);
    const email = 'bugs@playcircle.com';
    const subject = 'Bug Report - PlayCircle';
    const body = `Hi PlayCircle Team,\n\nI found a bug in the app:\n\nWhat happened:\n\n\nSteps to reproduce:\n1. \n2. \n3. \n\nWhat I expected to happen:\n\n\nDevice Info:\nUser ID: ${user?.id}\nEmail: ${user?.email}\nApp Version: 1.0.0\n\nThanks for fixing this!`;
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const handleSendFeatureRequest = () => {
    setShowFeatureModal(false);
    const email = 'feedback@playcircle.com';
    const subject = 'Feature Request - PlayCircle';
    const body = `Hi PlayCircle Team,\n\nI would like to request a new feature:\n\nFeature Description:\n\n\nWhy this would be helpful:\n\n\nUser Details:\nUser ID: ${user?.id}\nEmail: ${user?.email}\n\nThanks for considering my suggestion!`;
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const handleOpenTermsLink = () => {
    setShowTermsModal(false);
    Linking.openURL('https://playcircle.com/terms').catch(() => {
      Alert.alert('Error', 'Unable to open Terms of Service. Please try again later.');
    });
  };

  const handleOpenPrivacyLink = () => {
    setShowPrivacyModal(false);
    Linking.openURL('https://playcircle.com/privacy').catch(() => {
      Alert.alert('Error', 'Unable to open Privacy Policy. Please try again later.');
    });
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for help..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Support Options */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Get Help</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Choose how you'd like to get assistance</Text>
            
            <View style={styles.supportGrid}>
              {supportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.supportCard}
                  onPress={option.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.supportIcon, { backgroundColor: option.color + '15' }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <Text style={styles.supportTitle}>{option.title}</Text>
                  <Text style={styles.supportDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconGlow}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Find quick answers to common questions</Text>
            
            {filteredFAQs.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search terms</Text>
              </View>
            ) : (
              <View style={styles.faqContainer}>
                {filteredFAQs.map((faq) => (
                  <TouchableOpacity
                    key={faq.id}
                    style={styles.faqCard}
                    onPress={() => toggleFAQ(faq.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <View style={[
                        styles.faqToggle,
                        expandedFAQ === faq.id && styles.faqToggleExpanded
                      ]}>
                        <Ionicons
                          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={expandedFAQ === faq.id ? colors.primary : colors.textSecondary}
                        />
                      </View>
                    </View>
                    {expandedFAQ === faq.id && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Contact CTA */}
          <View style={styles.contactSection}>
            <LinearGradient
              colors={[colors.primary + '15', colors.primary + '05']}
              style={styles.contactGradient}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="headset-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.contactTitle}>Still need help?</Text>
              <Text style={styles.contactText}>
                Our support team is here to help you with any questions or concerns.
              </Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                <Ionicons name="mail" size={18} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.modalDarkOverlay} />
          </BlurView>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowContactModal(false)}
          />
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.modalCard}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="headset-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Contact Support</Text>
                <Text style={styles.modalMessage}>
                  Choose how you'd like to get in touch with our support team
                </Text>
                
                <View style={styles.modalOptions}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => handleSendEmail('support', 'General Support Request - PlayCircle')}
                  >
                    <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.modalOptionText}>General Support</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => handleSendEmail('bug', 'Bug Report - PlayCircle')}
                  >
                    <Ionicons name="bug-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.modalOptionText}>Report a Bug</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => handleSendEmail('feedback', 'Feature Request - PlayCircle')}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.modalOptionText}>Request Feature</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowContactModal(false)}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>

      {/* Bug Report Modal */}
      <Modal
        visible={showBugModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBugModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.modalDarkOverlay} />
          </BlurView>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowBugModal(false)}
          />
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.5)', 'rgba(239, 68, 68, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.modalCard}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="bug-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Report a Bug</Text>
                <Text style={styles.modalMessage}>
                  Found something that's not working right? Let us know and we'll fix it!
                </Text>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowBugModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleSendBugReport}
                  >
                    <Text style={styles.modalConfirmText}>Report Bug</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>

      {/* Feature Request Modal */}
      <Modal
        visible={showFeatureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeatureModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.modalDarkOverlay} />
          </BlurView>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFeatureModal(false)}
          />
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(78, 205, 196, 0.5)', 'rgba(56, 178, 172, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.modalCard}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="add-circle-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Want a Feature Added?</Text>
                <Text style={styles.modalMessage}>
                  We love hearing your ideas! Tell us what feature you'd like to see in PlayCircle.
                </Text>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowFeatureModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleSendFeatureRequest}
                  >
                    <Text style={styles.modalConfirmText}>Send Request</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.modalDarkOverlay} />
          </BlurView>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTermsModal(false)}
          />
          <View style={styles.modalContainer}>
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(149, 165, 166, 0.5)', 'rgba(127, 140, 141, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.modalCard}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="document-text-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Terms of Service</Text>
                <Text style={styles.modalMessage}>
                  View our terms and conditions to understand how PlayCircle works.
                </Text>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowTermsModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleOpenTermsLink}
                  >
                    <Text style={styles.modalConfirmText}>Open Terms</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
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
                colors={['rgba(139, 69, 19, 0.5)', 'rgba(101, 67, 33, 0.6)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.modalCard}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
                <Text style={styles.modalMessage}>
                  Learn how we protect and handle your personal information.
                </Text>
                
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowPrivacyModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleOpenPrivacyLink}
                  >
                    <Text style={styles.modalConfirmText}>View Policy</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  searchSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  supportGrid: {
    gap: 12,
  },
  supportCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  faqContainer: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
    lineHeight: 20,
  },
  faqToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  faqToggleExpanded: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '30',
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    lineHeight: 20,
    paddingRight: 40,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  contactSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contactGradient: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalCard: {
    padding: 32,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalOptions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalConfirmButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
