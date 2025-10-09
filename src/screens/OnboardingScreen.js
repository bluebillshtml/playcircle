import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { profileService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPORTS = [
  {
    id: 'padel',
    name: 'Padel',
    icon: 'tennisball',
    gradient: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.4)'],
    // image: require('../assets/sports/padel.jpg'), // Add your image here
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: 'tennisball-outline',
    gradient: ['rgba(59, 130, 246, 0.3)', 'rgba(37, 99, 235, 0.4)'],
    // image: require('../assets/sports/tennis.jpg'), // Add your image here
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    icon: 'baseball',
    gradient: ['rgba(245, 158, 11, 0.3)', 'rgba(217, 119, 6, 0.4)'],
    // image: require('../assets/sports/pickleball.jpg'), // Add your image here
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: 'basketball',
    gradient: ['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.4)'],
    // image: require('../assets/sports/basketball.jpg'), // Add your image here
  },
];

const SKILL_LEVELS = [
  { level: 'Beginner', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  { level: 'Intermediate', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  { level: 'Advanced', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  { level: 'Expert', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
];

const POSITIONS = {
  padel: ['Left Side', 'Right Side', 'No Preference'],
  tennis: ['Singles', 'Doubles', 'No Preference'],
  pickleball: ['Singles', 'Doubles', 'No Preference'],
  basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'No Preference'],
};

export default function OnboardingScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { user, profile, setProfile } = useAuth();
  const { setSelectedSport } = useSport();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for intro screen
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);
  const [backgroundOpacity] = useState(new Animated.Value(0));
  const gradientAnimation1 = useRef(new Animated.Value(0)).current;
  const gradientAnimation2 = useRef(new Animated.Value(0)).current;
  const gradientAnimation3 = useRef(new Animated.Value(0)).current;

  // Animation refs for intro screen
  const introFadeAnim = useRef(new Animated.Value(0)).current;
  const introScaleAnim = useRef(new Animated.Value(0.9)).current;
  const sportIconsAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-50)).current;

  // Animation refs for step transitions
  const stepFadeAnim = useRef(new Animated.Value(1)).current;
  const stepSlideAnim = useRef(new Animated.Value(0)).current;

  const styles = createStyles(colors);

  // Intro screen animation on mount
  useEffect(() => {
    if (currentStep === 0) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(introFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(introScaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(titleSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(sportIconsAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [currentStep]);


  // Start the flowing gradient animations with different speeds
  useEffect(() => {
    if (selectedSports.length > 0) {
      // First layer - slow movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation1, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnimation1, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Second layer - medium movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation2, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnimation2, {
            toValue: 0,
            duration: 7000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Third layer - faster movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation3, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnimation3, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [selectedSports.length]);

  const handleSportToggle = (sport) => {
    if (selectedSports.find(s => s.id === sport.id)) {
      setSelectedSports(selectedSports.filter(s => s.id !== sport.id));
      // Remove skill level and position for deselected sport
      const newSkillLevels = { ...skillLevels };
      const newPositions = { ...positions };
      delete newSkillLevels[sport.id];
      delete newPositions[sport.id];
      setSkillLevels(newSkillLevels);
      setPositions(newPositions);

      // Fade out background if no sports selected
      if (selectedSports.length === 1) {
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }).start();
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
      // Animate background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }
  };

  // Get gradient colors based on ALL selected sports
  const getGradientColors = () => {
    if (selectedSports.length === 0) {
      return [];
    }

    // If one sport, use its gradient
    if (selectedSports.length === 1) {
      return [...selectedSports[0].gradient, 'rgba(0, 0, 0, 0.7)'];
    }

    // If multiple sports, blend their colors
    const colors = [];
    selectedSports.forEach((sport, index) => {
      colors.push(sport.gradient[0]);
      colors.push(sport.gradient[1]);
    });
    colors.push('rgba(0, 0, 0, 0.7)');

    return colors;
  };

  const handleSkillLevelSelect = (sportId, level) => {
    setSkillLevels({
      ...skillLevels,
      [sportId]: level,
    });
  };

  const handlePositionSelect = (sportId, position) => {
    setPositions({
      ...positions,
      [sportId]: position,
    });
  };

  const canProceedFromStep1 = selectedSports.length > 0;
  const canProceedFromStep2 = selectedSports.every(sport => skillLevels[sport.id]);
  const canProceedFromStep3 = selectedSports.every(sport => positions[sport.id]);

  const handleNext = () => {
    if (currentStep < 4) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(stepFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(stepSlideAnim, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);

        // If moving from intro to step 1 and sports are selected, fade in background
        if (currentStep === 0 && selectedSports.length > 0) {
          Animated.timing(backgroundOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }).start();
        }

        // Reset and animate in new step
        stepSlideAnim.setValue(30);
        Animated.parallel([
          Animated.timing(stepFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(stepSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(stepFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(stepSlideAnim, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        // Reset and animate in previous step
        stepSlideAnim.setValue(-30);
        Animated.parallel([
          Animated.timing(stepFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(stepSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };


  const handleSkip = async () => {
    try {
      // Mark onboarding as completed without setting preferences
      const updatedProfile = {
        ...profile,
        onboarding_completed: true,
      };

      try {
        await profileService.updateProfile(user.id, updatedProfile);
      } catch (error) {
        console.log('Error updating profile (expected if no Supabase):', error);
      }

      // Set flag to show skip notification on Home screen
      await AsyncStorage.setItem('show_skip_notification', 'true');

      // Set the profile locally - this will trigger navigation to Home
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Skip onboarding error:', error);
      Alert.alert('Welcome!', 'You can set up your preferences anytime in Profile settings.');
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Update profile with onboarding data
      const updatedProfile = {
        ...profile,
        favorite_sports: selectedSports.map(s => s.id),
        onboarding_completed: true,
      };

      // Create sport profiles for each selected sport
      console.log('=== ONBOARDING SAVE DEBUG ===');
      console.log('Selected sports:', selectedSports);
      console.log('Skill levels:', skillLevels);
      console.log('Positions:', positions);
      
      const sportProfilesToSave = [];
      
      for (const sport of selectedSports) {
        const sportProfileData = {
          sport_id: sport.id,
          skill_level: skillLevels[sport.id],
          preferred_position: positions[sport.id],
        };
        
        console.log(`Creating sport profile for ${sport.name}:`, sportProfileData);
        sportProfilesToSave.push(sportProfileData);
        
        try {
          await profileService.createUserSportProfile(user.id, sportProfileData);
          console.log(`✅ Successfully saved ${sport.name} to Supabase from onboarding`);
        } catch (error) {
          console.log(`❌ Error saving ${sport.name} to Supabase (expected if no connection):`, error.message);
        }
      }
      
      // Always save to local storage as backup/fallback
      try {
        const key = `sport_profiles_${user.id}`;
        await AsyncStorage.setItem(key, JSON.stringify(sportProfilesToSave));
        console.log('💾 Successfully saved sport profiles to local storage from onboarding:', sportProfilesToSave);
      } catch (error) {
        console.log('❌ Error saving to local storage from onboarding:', error);
      }

      // Update main profile
      try {
        await profileService.updateProfile(user.id, updatedProfile);
      } catch (error) {
        console.log('Error updating profile (expected if no Supabase):', error);
      }

      // Set the profile locally
      setProfile(updatedProfile);
      
      // Set the first selected sport as the default
      setSelectedSport(selectedSports[0]);

      Alert.alert(
        'Welcome to PlayCircle!',
        'Your profile has been set up successfully. You can update these preferences anytime in your Profile settings.',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // Navigate to main app - this will be handled by the auth state change
            },
          },
        ]
      );
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Setup Complete', 'Welcome to PlayCircle! You can update your preferences anytime in settings.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What sports do you play?</Text>
        <Text style={styles.stepSubtitle}>Select all that apply</Text>
      </View>

      <View style={styles.sportsGridContainer}>
        <View style={styles.sportsGrid}>
          {SPORTS.map((sport) => {
            const isSelected = selectedSports.find(s => s.id === sport.id);
            return (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportCard,
                  isSelected && styles.sportCardSelected,
                ]}
                onPress={() => handleSportToggle(sport)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.sportIconCircle,
                  isSelected && styles.sportIconCircleSelected
                ]}>
                  <Ionicons
                    name={sport.icon}
                    size={36}
                    color={isSelected ? '#FFFFFF' : '#10B981'}
                  />
                </View>
                <Text style={[
                  styles.sportName,
                  isSelected && styles.sportNameSelected,
                ]}>
                  {sport.name}
                </Text>
                {isSelected && (
                  <View style={styles.sportCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What's your skill level?</Text>
        <Text style={styles.stepSubtitle}>Select for each sport</Text>
      </View>

      <ScrollView
        style={styles.sportsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sportsListContent}
      >
        {selectedSports.map((sport) => (
          <View key={sport.id} style={styles.sportSectionCard}>
            <View style={styles.sportHeader}>
              <View style={styles.sportIconBadgeSmall}>
                <Ionicons name={sport.icon} size={20} color="#10B981" />
              </View>
              <Text style={styles.sportSectionTitle}>{sport.name}</Text>
            </View>

            <View style={styles.skillLevelGrid}>
              {SKILL_LEVELS.map((skillLevel) => {
                const isSelected = skillLevels[sport.id] === skillLevel.level;
                return (
                  <TouchableOpacity
                    key={skillLevel.level}
                    style={[
                      styles.skillLevelCard,
                      {
                        backgroundColor: isSelected ? skillLevel.color : skillLevel.bgColor,
                        borderColor: isSelected ? skillLevel.color : '#374151',
                      }
                    ]}
                    onPress={() => handleSkillLevelSelect(sport.id, skillLevel.level)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.skillLevelContent}>
                      <View style={[styles.skillLevelDot, { backgroundColor: skillLevel.color }]} />
                      <Text style={[
                        styles.skillLevelText,
                        { color: isSelected ? '#FFFFFF' : skillLevel.color }
                      ]}>
                        {skillLevel.level}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Preferred positions?</Text>
        <Text style={styles.stepSubtitle}>Select for each sport</Text>
      </View>

      <ScrollView
        style={styles.sportsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sportsListContent}
      >
        {selectedSports.map((sport) => (
          <View key={sport.id} style={styles.sportSectionCard}>
            <View style={styles.sportHeader}>
              <View style={styles.sportIconBadgeSmall}>
                <Ionicons name={sport.icon} size={20} color="#10B981" />
              </View>
              <Text style={styles.sportSectionTitle}>{sport.name}</Text>
            </View>

            <View style={styles.positionGrid}>
              {POSITIONS[sport.id]?.map((position) => {
                const isSelected = positions[sport.id] === position;
                return (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.positionCard,
                      isSelected && styles.positionCardSelected,
                    ]}
                    onPress={() => handlePositionSelect(sport.id, position)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.positionText,
                      isSelected && styles.positionTextSelected,
                    ]}>
                      {position}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderIntroScreen = () => (
    <Animated.View
      style={[
        styles.introContainer,
        {
          opacity: introFadeAnim,
          transform: [{ scale: introScaleAnim }]
        }
      ]}
    >
      <Animated.View
        style={[
          styles.introHeader,
          { transform: [{ translateY: titleSlideAnim }] }
        ]}
      >
        <View style={styles.introIconContainer}>
          <Ionicons name="tennisball" size={64} color="#10B981" />
        </View>
        <Text style={styles.introTitle}>Welcome to PlayCircle</Text>
        <Text style={styles.introSubtitle}>
          Your ultimate sport game booking community
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.sportIconsContainer,
          { opacity: sportIconsAnim }
        ]}
      >
        {SPORTS.map((sport, index) => (
          <Animated.View
            key={sport.id}
            style={[
              styles.sportIconWrapper,
              {
                opacity: sportIconsAnim,
                transform: [{
                  translateY: sportIconsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.sportIconBadge}>
              <Ionicons name={sport.icon} size={28} color="#10B981" />
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      <View style={styles.introInfoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color="#10B981" />
          <Text style={styles.infoTitle}>Let's set up your profile</Text>
        </View>

        <View style={styles.infoSteps}>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.infoStepText}>Choose your favorite sports</Text>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.infoStepText}>Set your skill levels</Text>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.infoStepText}>Select preferred positions</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.introStartButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.introStartButtonText}>Let's Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContainer}>
        <Animated.View
          style={[
            styles.successIconWrapper,
            {
              transform: [
                {
                  scale: stepFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        <Text style={styles.welcomeTitle}>Welcome to PlayCircle!</Text>
        <Text style={styles.welcomeSubtitle}>
          You're all set up and ready to find players and join matches.
        </Text>

        <Text style={styles.settingsNote}>
          You can update these preferences anytime in your Profile settings.
        </Text>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Ionicons name="person-circle" size={24} color="#10B981" />
            <Text style={styles.summaryTitle}>Your Profile</Text>
          </View>
          {selectedSports.map((sport, index) => (
            <View key={sport.id} style={styles.summaryItem}>
              <View style={styles.summaryIconBadge}>
                <Ionicons name={sport.icon} size={18} color="#10B981" />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryMainText}>{sport.name}</Text>
                <Text style={styles.summarySubText}>
                  {skillLevels[sport.id]} • {positions[sport.id]}
                </Text>
              </View>
              <View style={styles.summaryCheckBadge}>
                <Ionicons name="checkmark" size={14} color="#10B981" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const gradientColors = getGradientColors();

  return (
    <AnimatedBackground>
      {/* Sport-specific gradient overlay */}
      {selectedSports.length > 0 && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backgroundOpacity }
          ]}
          pointerEvents="none"
        >
          {selectedSports.map((sport, index) => {
            // Different gradient directions for each sport
            const directions = [
              { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },   // Top-left to bottom-right
              { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },   // Top-right to bottom-left
              { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },   // Bottom-left to top-right
              { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } }, // Top to bottom
            ];

            const direction = directions[index % directions.length];

            return (
              <LinearGradient
                key={sport.id}
                colors={[...sport.gradient, 'rgba(0, 0, 0, 0)']}
                style={StyleSheet.absoluteFill}
                start={direction.start}
                end={direction.end}
              />
            );
          })}

          {/* Dark overlay for readability */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.6)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <View style={styles.container}>
        {/* Skip button on intro screen */}
        {currentStep === 0 && (
          <View style={styles.introSkipContainer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Indicator - Hide on intro screen */}
        {currentStep > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              {currentStep < 4 && (
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of 4</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {currentStep === 0 && renderIntroScreen()}
          {currentStep === 1 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: stepFadeAnim,
                transform: [{ translateY: stepSlideAnim }]
              }}
            >
              {renderStep1()}
            </Animated.View>
          )}
          {currentStep === 2 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: stepFadeAnim,
                transform: [{ translateY: stepSlideAnim }]
              }}
            >
              {renderStep2()}
            </Animated.View>
          )}
          {currentStep === 3 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: stepFadeAnim,
                transform: [{ translateY: stepSlideAnim }]
              }}
            >
              {renderStep3()}
            </Animated.View>
          )}
          {currentStep === 4 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: stepFadeAnim,
                transform: [{ translateY: stepSlideAnim }]
              }}
            >
              {renderStep4()}
            </Animated.View>
          )}
        </View>

        {/* Navigation - Hide on intro screen */}
        {currentStep > 0 && (
          <View style={styles.navigation}>
            {currentStep > 1 && currentStep < 4 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < 4 ? (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2) ||
                  (currentStep === 3 && !canProceedFromStep3)
                    ? styles.nextButtonDisabled
                    : null,
                ]}
                onPress={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2) ||
                  (currentStep === 3 && !canProceedFromStep3)
                }
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                disabled={loading}
              >
                <Text style={styles.completeButtonText}>
                  {loading ? 'Setting up...' : 'Get Started'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  introSkipContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sportsGridContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sportCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '47%',
    minHeight: 160,
    borderWidth: 2,
    borderColor: '#374151',
    position: 'relative',
  },
  sportCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  sportIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#374151',
  },
  sportIconCircleSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  sportNameSelected: {
    color: '#FFFFFF',
  },
  sportCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  sportsList: {
    flex: 1,
  },
  sportsListContent: {
    paddingBottom: 20,
  },
  sportSection: {
    marginBottom: 24,
  },
  sportSectionCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sportIconBadgeSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  sportSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  skillLevelGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  skillLevelCard: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillLevelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillLevelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  skillLevelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 8,
  },
  positionGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  positionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  positionCardSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  positionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  positionTextSelected: {
    color: '#FFFFFF',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconWrapper: {
    marginBottom: 24,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  settingsNote: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  summaryContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  summaryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  summarySubText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  summaryCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  introIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  introTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  sportIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  sportIconWrapper: {
    alignItems: 'center',
  },
  sportIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  introInfoCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.7)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4B5563',
    marginBottom: 32,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  infoSteps: {
    gap: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoStepText: {
    fontSize: 16,
    color: '#E5E7EB',
    flex: 1,
    fontWeight: '500',
  },
  introStartButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  introStartButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});