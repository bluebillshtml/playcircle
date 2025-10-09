import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { profileService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPORTS = [
  { id: 'padel', name: 'Padel', icon: 'tennisball' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
  { id: 'pickleball', name: 'Pickleball', icon: 'baseball' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

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
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
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
      <Text style={styles.stepTitle}>What sports do you play?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      
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
            >
              <Ionicons
                name={sport.icon}
                size={32}
                color={isSelected ? colors.white : colors.primary}
              />
              <Text style={[
                styles.sportName,
                isSelected && styles.sportNameSelected,
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your skill level?</Text>
      <Text style={styles.stepSubtitle}>Select for each sport</Text>
      
      <ScrollView style={styles.sportsList}>
        {selectedSports.map((sport) => (
          <View key={sport.id} style={styles.sportSection}>
            <View style={styles.sportHeader}>
              <Ionicons name={sport.icon} size={24} color={colors.primary} />
              <Text style={styles.sportSectionTitle}>{sport.name}</Text>
            </View>
            
            <View style={styles.skillLevelGrid}>
              {SKILL_LEVELS.map((level) => {
                const isSelected = skillLevels[sport.id] === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.skillLevelCard,
                      isSelected && styles.skillLevelCardSelected,
                    ]}
                    onPress={() => handleSkillLevelSelect(sport.id, level)}
                  >
                    <Text style={[
                      styles.skillLevelText,
                      isSelected && styles.skillLevelTextSelected,
                    ]}>
                      {level}
                    </Text>
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
      <Text style={styles.stepTitle}>Preferred positions?</Text>
      <Text style={styles.stepSubtitle}>Select for each sport</Text>
      
      <ScrollView style={styles.sportsList}>
        {selectedSports.map((sport) => (
          <View key={sport.id} style={styles.sportSection}>
            <View style={styles.sportHeader}>
              <Ionicons name={sport.icon} size={24} color={colors.primary} />
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
                  >
                    <Text style={[
                      styles.positionText,
                      isSelected && styles.positionTextSelected,
                    ]}>
                      {position}
                    </Text>
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
          <Ionicons name="tennisball" size={64} color={colors.primary} />
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
              <Ionicons name={sport.icon} size={28} color={colors.primary} />
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      <View style={styles.introInfoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
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
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContainer}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        <Text style={styles.welcomeTitle}>Welcome to PlayCircle!</Text>
        <Text style={styles.welcomeSubtitle}>
          You're all set up and ready to find players and join matches.
        </Text>

        <Text style={styles.settingsNote}>
          You can update these preferences anytime in your Profile settings.
        </Text>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Profile:</Text>
          {selectedSports.map((sport) => (
            <View key={sport.id} style={styles.summaryItem}>
              <Ionicons name={sport.icon} size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                {sport.name} • {skillLevels[sport.id]} • {positions[sport.id]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <AnimatedBackground>
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  sportCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  sportNameSelected: {
    color: colors.white,
  },
  sportsList: {
    flex: 1,
  },
  sportSection: {
    marginBottom: 24,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sportSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  skillLevelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillLevelCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  skillLevelCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  skillLevelTextSelected: {
    color: colors.white,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  positionCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  positionTextSelected: {
    color: colors.white,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  settingsNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  summaryContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.glassBorder,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
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
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  introTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  introInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
    color: colors.text,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  infoStepText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  introStartButton: {
    backgroundColor: colors.primary,
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
    color: colors.white,
  },
});