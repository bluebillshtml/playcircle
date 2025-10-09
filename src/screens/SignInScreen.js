import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function SignInScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { signIn, devBypass } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    console.log('🔐 SignInScreen mounted - User should see sign in page');
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleWebSignIn = async () => {
    // TODO: Replace with actual web URL when backend is ready
    const webUrl = 'https://playcircle.com/signin';

    const supported = await Linking.canOpenURL(webUrl);
    if (supported) {
      await Linking.openURL(webUrl);
    } else {
      console.error("Don't know how to open URI: " + webUrl);
    }
  };

  const handleDevBypass = () => {
    // Dev bypass - creates a mock user session and goes to onboarding
    console.log('🚀 Dev bypass activated');
    devBypass();
  };

  const styles = createStyles(colors);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={styles.logoGradient}
            >
              <Ionicons name="tennisball" size={56} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>PlayCircle</Text>
          <Text style={styles.appTagline}>Your Ultimate Sport Community</Text>
        </Animated.View>

        {/* Glass Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: cardSlideAnim },
              ],
            },
          ]}
        >
          <BlurView
            intensity={isDarkMode ? 40 : 80}
            tint={isDarkMode ? 'dark' : 'light'}
            style={styles.glassCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={32} color={colors.primary} />
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>
                  Sign in to connect with players and join matches
                </Text>
              </View>

              {/* Web Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleWebSignIn}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.signInButtonText}>Sign In via Web</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  You'll be redirected to our secure web portal to sign in or create an account
                </Text>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Find players near you</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Join or create matches</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Track your stats & progress</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Dev Bypass Button - Hidden in plain sight */}
        <TouchableOpacity
          style={styles.devBypassButton}
          onPress={handleDevBypass}
          onLongPress={handleDevBypass}
        >
          <Text style={styles.devBypassText}>Dev Mode</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.glassBorder,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 500,
  },
  glassCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardContent: {
    padding: 32,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  signInButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  devBypassButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    opacity: 0.5,
  },
  devBypassText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
