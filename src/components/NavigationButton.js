import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function NavigationButton({ navigation, currentScreen, hide = false }) {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [navModalVisible, setNavModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Safety check for navigation prop
  if (!navigation) {
    console.error('NavigationButton: navigation prop is undefined');
    return null;
  }

  // Hide the navigation button if requested
  if (hide) {
    return null;
  }

  const navItems = [
    { name: 'Discover', icon: 'home', screen: 'Home' },
    { name: 'Leaderboard', icon: 'trophy', screen: 'Dashboard' },
    { name: 'Friends', icon: 'people', screen: 'Friends' },
    { name: 'Messages', icon: 'chatbubbles', screen: 'Messages' },
    { name: 'Profile', icon: 'person', screen: 'Profile' },
  ];

  const openModal = () => {
    setNavModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -width,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        damping: 15,
        stiffness: 100,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNavModalVisible(false);
    });
  };

  const styles = createStyles(colors);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <>
      <Animated.View style={[styles.navButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={openModal}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerContainer}>
            <Animated.View 
              style={[
                styles.hamburgerLine,
                styles.hamburgerLine1,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    })
                  }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.hamburgerLine,
                styles.hamburgerLine2,
                {
                  opacity: rotateAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0, 0],
                  })
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.hamburgerLine,
                styles.hamburgerLine3,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-45deg'],
                    })
                  }]
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={navModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
          </BlurView>
          <Animated.View
            style={[
              styles.navDrawer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <View style={styles.navDrawerWrapper}>
              <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
                  style={[StyleSheet.absoluteFill, { borderTopRightRadius: 24, borderBottomRightRadius: 24 }]}
                />
              <View style={styles.drawerHeader}>
                <View style={styles.drawerHeaderContent}>
                  <View style={styles.appIcon}>
                    <Ionicons name="tennisball" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>PlayCircle</Text>
                    <Text style={styles.appSubtitle}>Sport Community</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.navItems}>
                {navItems.map((item, index) => (
                  <Animated.View
                    key={item.screen}
                    style={{
                      transform: [{
                        translateX: slideAnim.interpolate({
                          inputRange: [-width, 0],
                          outputRange: [-50 - (index * 20), 0],
                          extrapolate: 'clamp',
                        })
                      }],
                      opacity: slideAnim.interpolate({
                        inputRange: [-width, -width + 100, 0],
                        outputRange: [0, 0, 1],
                        extrapolate: 'clamp',
                      })
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.navItem,
                        currentScreen === item.screen && styles.navItemActive
                      ]}
                      onPress={() => {
                        closeModal();
                        navigation.navigate(item.screen);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.navItemIcon,
                        currentScreen === item.screen && styles.navItemIconActive
                      ]}>
                        <Ionicons
                          name={item.icon}
                          size={28}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text style={[
                        styles.navItemText,
                        currentScreen === item.screen && styles.navItemTextActive
                      ]}>
                        {item.name}
                      </Text>
                      {currentScreen === item.screen && (
                        <View style={styles.navItemIndicator}>
                          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              <View style={styles.drawerFooter}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    {profile?.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} style={styles.userAvatarImage} />
                    ) : (
                      <Ionicons name="person" size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : profile?.full_name || profile?.username || 'Player'}
                    </Text>
                    <Text style={styles.userStatus}>Online</Text>
                  </View>
                </View>
              </View>
            </BlurView>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const createStyles = (colors) => StyleSheet.create({
  navButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1000,
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hamburgerContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: colors.text,
    borderRadius: 1.5,
    width: 24,
    opacity: 0.9,
    marginVertical: 2.5,
  },
  hamburgerLine1: {
    transformOrigin: 'center',
  },
  hamburgerLine2: {
    transformOrigin: 'center',
  },
  hamburgerLine3: {
    transformOrigin: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  navDrawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 320,
  },
  navDrawerWrapper: {
    flex: 1,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderLeftWidth: 0,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(6, 95, 70, 0.4)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomWidth: 0,
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navItemIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navItemIconActive: {
  },
  navItemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    flex: 1,
  },
  navItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navItemIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});
