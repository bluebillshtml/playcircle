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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

export default function HelpCenterScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      icon: 'mail-outline',
      color: colors.primary,
      action: () => handleContactSupport(),
    },
    {
      id: 2,
      title: 'Report a Bug',
      description: 'Let us know about any issues',
      icon: 'bug-outline',
      color: '#FF9800',
      action: () => handleReportBug(),
    },
    {
      id: 3,
      title: 'Feature Request',
      description: 'Suggest new features',
      icon: 'bulb-outline',
      color: '#9C27B0',
      action: () => handleFeatureRequest(),
    },
    {
      id: 4,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: 'document-text-outline',
      color: '#607D8B',
      action: () => handleOpenTerms(),
    },
    {
      id: 5,
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      icon: 'shield-checkmark-outline',
      color: '#4CAF50',
      action: () => handleOpenPrivacy(),
    },
  ];

  const handleContactSupport = () => {
    const email = 'support@playcircle.com';
    const subject = 'Support Request';
    const body = `Hi PlayCircle Support,\n\nUser ID: ${user?.id}\nEmail: ${user?.email}\n\nIssue Description:\n`;

    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const handleReportBug = () => {
    Alert.alert(
      'Report a Bug',
      'Please describe the issue you encountered. We\'ll investigate and fix it as soon as possible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            const email = 'bugs@playcircle.com';
            const subject = 'Bug Report';
            const body = `Bug Description:\n\nSteps to Reproduce:\n\nExpected Behavior:\n\nActual Behavior:\n\nUser ID: ${user?.id}\nApp Version: 1.0.0\n`;
            Linking.openURL(
              `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`
            );
          },
        },
      ]
    );
  };

  const handleFeatureRequest = () => {
    Alert.alert(
      'Feature Request',
      'We love hearing your ideas! Please describe the feature you\'d like to see.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            const email = 'feedback@playcircle.com';
            const subject = 'Feature Request';
            const body = `Feature Request:\n\nDescription:\n\nUse Case:\n\nUser ID: ${user?.id}\n`;
            Linking.openURL(
              `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`
            );
          },
        },
      ]
    );
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://playcircle.com/terms');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://playcircle.com/privacy');
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

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.supportCard}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={[styles.supportIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {filteredFAQs.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          ) : (
            filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqCard}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text}
                  />
                </View>
                {expandedFAQ === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.primary} />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to help you with any questions or concerns.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Ionicons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  faqCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  contactSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    marginTop: 16,
    backgroundColor: colors.surface,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
