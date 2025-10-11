import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { paymentService } from '../services/supabase';

export default function PurchasesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchases, setPurchases] = useState([]);

  // Test data for demonstration
  const testPurchases = [
    {
      id: '1',
      amount: 25.00,
      status: 'succeeded',
      created_at: '2024-10-15T18:30:00Z',
      payment_method: 'card',
      match: {
        court: { name: 'Downtown Tennis Club' },
        match_date: '2024-10-15',
        match_time: '6:00 PM',
        sport: 'Tennis'
      },
      description: 'Court booking fee'
    },
    {
      id: '2',
      amount: 15.50,
      status: 'succeeded',
      created_at: '2024-10-12T14:15:00Z',
      payment_method: 'card',
      match: {
        court: { name: 'City Basketball Arena' },
        match_date: '2024-10-12',
        match_time: '2:30 PM',
        sport: 'Basketball'
      },
      description: 'Match entry fee'
    },
    {
      id: '3',
      amount: 30.00,
      status: 'pending',
      created_at: '2024-10-10T10:45:00Z',
      payment_method: 'card',
      match: {
        court: { name: 'Padel Paradise' },
        match_date: '2024-10-18',
        match_time: '7:00 PM',
        sport: 'Padel'
      },
      description: 'Premium court booking'
    },
    {
      id: '4',
      amount: 20.00,
      status: 'succeeded',
      created_at: '2024-10-08T16:20:00Z',
      payment_method: 'card',
      match: {
        court: { name: 'Volleyball Center' },
        match_date: '2024-10-08',
        match_time: '4:30 PM',
        sport: 'Volleyball'
      },
      description: 'Court rental'
    },
    {
      id: '5',
      amount: 12.75,
      status: 'refunded',
      created_at: '2024-10-05T12:00:00Z',
      payment_method: 'card',
      match: {
        court: { name: 'Pickleball Pro' },
        match_date: '2024-10-05',
        match_time: '12:15 PM',
        sport: 'Pickleball'
      },
      description: 'Match cancellation refund'
    }
  ];

  const styles = createStyles(colors);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      // Use test data for now - in production, uncomment the line below
      // const data = await paymentService.getUserPayments(user.id);
      setPurchases(testPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
      // Fallback to test data if API fails
      setPurchases(testPurchases);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      case 'refunded':
        return '#9E9E9E';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'succeeded':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'tennis':
        return 'tennisball';
      case 'padel':
        return 'tennisball-outline';
      case 'basketball':
        return 'basketball';
      case 'volleyball':
        return 'football';
      case 'pickleball':
        return 'baseball';
      default:
        return 'receipt-outline';
    }
  };

  const renderPurchase = (purchase) => (
    <TouchableOpacity
      key={purchase.id}
      style={styles.purchaseCard}
      activeOpacity={0.7}
    >
      <View style={styles.purchaseHeader}>
        <View style={styles.purchaseIconContainer}>
          <Ionicons name={getSportIcon(purchase.match?.sport)} size={24} color={colors.primary} />
        </View>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseTitle}>
            {purchase.match?.court?.name || 'Match Payment'}
          </Text>
          <Text style={styles.purchaseDate}>
            {formatDate(purchase.created_at)} at {formatTime(purchase.created_at)}
          </Text>
        </View>
        <View style={styles.purchaseAmount}>
          <Text style={styles.amountText}>${purchase.amount.toFixed(2)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(purchase.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(purchase.status) }]}
            >
              {getStatusText(purchase.status)}
            </Text>
          </View>
        </View>
      </View>

      {purchase.match && (
        <View style={styles.purchaseDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {formatDate(purchase.match.match_date)} at {purchase.match.match_time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {purchase.match.sport} • {purchase.description}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {purchase.payment_method === 'card' ? 'Credit Card' : purchase.payment_method}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Purchases Yet</Text>
      <Text style={styles.emptyText}>
        Your purchase history will appear here once you join your first match.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Explore Matches</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AnimatedBackground>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading purchases...</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {purchases.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Summary Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{purchases.length}</Text>
                  <Text style={styles.statLabel}>Total Purchases</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    ${purchases
                      .filter((p) => p.status === 'succeeded')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>
              </View>

              {/* Purchase List */}
              <View style={styles.purchaseList}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconGlow}>
                    <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Recent Transactions</Text>
                </View>
                {purchases.map(renderPurchase)}
              </View>
            </>
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  purchaseList: {
    marginHorizontal: 20,
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
  purchaseCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  purchaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  purchaseDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  purchaseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  purchaseDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 40,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
