import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSport } from '../context/SportContext';

const { width, height } = Dimensions.get('window');

export default function SportSelector({ onSportChange, navigation, userSports }) {
  const { colors } = useTheme();
  const { selectedSport, changeSport, allSports } = useSport();
  
  // Use userSports if provided, otherwise use allSports
  const availableSports = userSports && userSports.length > 0 ? userSports : allSports;
  const [modalVisible, setModalVisible] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionSport, setTransitionSport] = useState(null);
  const [chevronRotation] = useState(new Animated.Value(0));
  const [modalTranslateY] = useState(new Animated.Value(-400));
  const [modalOpacity] = useState(new Animated.Value(0));

  // Transition animation values
  const transitionScale = useRef(new Animated.Value(0)).current;
  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const transitionRotate = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(12)].map(() => ({
    scale: new Animated.Value(0),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate: new Animated.Value(0),
  }))).current;

  const handleSportSelect = async (sport) => {
    // Don't show animation if selecting the same sport
    if (sport.id === selectedSport.id) {
      closeModal();
      return;
    }

    setTransitionSport(sport);
    closeModal();

    // Show transition overlay
    setTimeout(() => {
      setShowTransition(true);
      playTransitionAnimation(sport);
    }, 300);
  };

  const playTransitionAnimation = async (sport) => {
    // Reset all animations
    transitionScale.setValue(0);
    transitionOpacity.setValue(0);
    transitionRotate.setValue(0);
    glowScale.setValue(0);
    glowOpacity.setValue(0);
    ringScale.setValue(0.8);
    ringOpacity.setValue(0);
    textSlide.setValue(30);
    textOpacity.setValue(0);
    particleAnims.forEach(anim => {
      anim.scale.setValue(0);
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
      anim.opacity.setValue(0);
      anim.rotate.setValue(0);
    });

    // Main animation sequence
    Animated.sequence([
      // Phase 1: Glow and ring appear
      Animated.parallel([
        Animated.spring(glowScale, {
          toValue: 2,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1.2,
          tension: 30,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: Icon appears with rotation
      Animated.parallel([
        Animated.spring(transitionScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(transitionOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(transitionRotate, {
          toValue: 2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Ring expands
        Animated.timing(ringScale, {
          toValue: 2.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Phase 3: Hold
      Animated.delay(300),
      // Phase 4: Elegant exit
      Animated.parallel([
        Animated.timing(transitionScale, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(transitionOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(async () => {
      setShowTransition(false);
      await changeSport(sport.id);
      if (onSportChange) {
        onSportChange(sport);
      }
      if (navigation) {
        navigation.navigate('Home');
      }
    });

    // Particle spiral animation
    const particleAnimations = particleAnims.map((anim, index) => {
      const angle = (index / particleAnims.length) * Math.PI * 2;
      const spiralFactor = index / particleAnims.length;
      const distance = 120 + (spiralFactor * 80);

      return Animated.sequence([
        Animated.delay(index * 40),
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 0.8 + (Math.random() * 0.4),
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: Math.cos(angle + spiralFactor) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: Math.sin(angle + spiralFactor) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(particleAnimations).start();
  };

  const animateChevron = (isOpen) => {
    Animated.timing(chevronRotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const openModal = () => {
    setModalVisible(true);
    animateChevron(true);
    
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    animateChevron(false);
    
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: -400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const handleModalToggle = () => {
    if (modalVisible) {
      closeModal();
    } else {
      openModal();
    }
  };

  const styles = createStyles(colors);

  const rotateInterpolate = transitionRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={handleModalToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.sportIcon, { backgroundColor: selectedSport.color }]}>
          <Ionicons name={selectedSport.icon} size={20} color="#FFFFFF" />
        </View>
        <Animated.View
          style={[
            styles.chevron,
            {
              transform: [
                {
                  rotate: chevronRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Sport Transition Animation */}
      <Modal
        visible={showTransition}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.transitionOverlay}>
          <BlurView intensity={100} tint="dark" style={styles.transitionBlur}>
            {transitionSport && (
              <>
                {/* Outer glow effect */}
                <Animated.View
                  style={[
                    styles.glowOuter,
                    {
                      backgroundColor: transitionSport.color,
                      transform: [{ scale: glowScale }],
                      opacity: glowOpacity,
                    },
                  ]}
                />

                {/* Expanding ring */}
                <Animated.View
                  style={[
                    styles.expandingRing,
                    {
                      borderColor: transitionSport.color,
                      transform: [{ scale: ringScale }],
                      opacity: ringOpacity,
                    },
                  ]}
                />

                {/* Particle effects - sleek geometric shapes */}
                {particleAnims.map((anim, index) => {
                  const isSquare = index % 3 === 0;
                  const isDiamond = index % 3 === 1;

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        isSquare ? styles.particleSquare : isDiamond ? styles.particleDiamond : styles.particleCircle,
                        {
                          backgroundColor: transitionSport.color,
                          transform: [
                            { translateX: anim.translateX },
                            { translateY: anim.translateY },
                            { scale: anim.scale },
                            {
                              rotate: anim.rotate.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              })
                            },
                          ],
                          opacity: anim.opacity,
                        },
                      ]}
                    />
                  );
                })}

                {/* Main sport icon with glass effect */}
                <Animated.View
                  style={[
                    styles.transitionIconContainer,
                    {
                      transform: [
                        { scale: transitionScale },
                        { rotate: rotateInterpolate },
                      ],
                      opacity: transitionOpacity,
                    },
                  ]}
                >
                  <View style={styles.glassIconWrapper}>
                    <View style={[styles.transitionIcon, { backgroundColor: transitionSport.color }]}>
                      <Ionicons name={transitionSport.icon} size={72} color="#FFFFFF" />
                    </View>
                    <View style={[styles.iconGlassOverlay, { borderColor: transitionSport.color }]} />
                  </View>
                </Animated.View>

                {/* Sport name with slide animation */}
                <Animated.View
                  style={[
                    styles.transitionTextContainer,
                    {
                      transform: [{ translateY: textSlide }],
                      opacity: textOpacity,
                    },
                  ]}
                >
                  <Text style={styles.transitionText}>{transitionSport.name}</Text>
                  <View style={[styles.textUnderline, { backgroundColor: transitionSport.color }]} />
                </Animated.View>
              </>
            )}
          </BlurView>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.blurBackground}>
            <TouchableOpacity 
              style={styles.backdrop} 
              activeOpacity={1} 
              onPress={closeModal}
            />
          </BlurView>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalTranslateY }],
                opacity: modalOpacity,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sportsList} showsVerticalScrollIndicator={false}>
              {availableSports.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportOption,
                    selectedSport.id === sport.id && styles.selectedSportOption
                  ]}
                  onPress={() => handleSportSelect(sport)}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={[
                      styles.sportOptionBlur,
                      selectedSport.id === sport.id && styles.selectedSportOptionBlur
                    ]}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: sport.color }]}>
                      <Ionicons name={sport.icon} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={[
                        styles.optionName,
                        selectedSport.id === sport.id && styles.selectedOptionName
                      ]}>
                        {sport.name}
                      </Text>
                      <Text style={styles.optionDescription}>{sport.description}</Text>
                      <View style={styles.optionDetails}>
                        <View style={styles.detailBadge}>
                          <Text style={styles.optionDetail}>
                            {sport.minPlayers}-{sport.maxPlayers} players
                          </Text>
                        </View>
                        <View style={styles.detailBadge}>
                          <Text style={styles.optionDetail}>
                            {sport.teamSize === 1 ? 'Singles/Doubles' : `${sport.teamSize}v${sport.teamSize}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {selectedSport.id === sport.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </BlurView>
                </TouchableOpacity>
              ))}
              
              {/* Add More Sports Option - only show if userSports is provided */}
              {userSports && userSports.length > 0 && (
                <TouchableOpacity
                  style={styles.addMoreOption}
                  onPress={() => {
                    closeModal();
                    navigation?.navigate('Preferences');
                  }}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} tint="light" style={styles.addMoreOptionBlur}>
                    <View style={styles.addMoreIcon}>
                      <Ionicons name="add" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.addMoreText}>Add More Sports</Text>
                      <Text style={styles.addMoreDescription}>
                        Manage your sport preferences
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </BlurView>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors) => StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  chevron: {
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(27, 60, 83, 0.95)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 34,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 10000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sportsList: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sportOption: {
    borderRadius: 20,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedSportOption: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  sportOptionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  selectedSportOptionBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  selectedOptionName: {
    color: colors.primary,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
    opacity: 0.9,
  },
  optionDetails: {
    flexDirection: 'row',
    gap: 10,
  },
  detailBadge: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '600',
  },
  transitionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transitionBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  glowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  expandingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  transitionIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glassIconWrapper: {
    position: 'relative',
  },
  transitionIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 25,
  },
  iconGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  transitionTextContainer: {
    position: 'absolute',
    top: '60%',
    alignItems: 'center',
  },
  transitionText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  textUnderline: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  particleCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  particleSquare: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  particleDiamond: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addMoreOption: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addMoreOptionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addMoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  addMoreDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
