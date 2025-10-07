import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSport } from '../context/SportContext';
import { profileService } from '../services/supabase';
import AnimatedBackground from '../components/AnimatedBackground';

const SPORTS = [
  { id: 'padel', name: 'Padel', icon: 'tennisball' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
  { id: 'pickleball', name: 'Pickleball', icon: 'baseball' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'volleyball', name: 'Volleyball', icon: 'football' },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const POSITIONS = {
  padel: ['Left Side', 'Right Side', 'No Preference'],
  tennis: ['Singles', 'Doubles', 'No Preference'],
  pickleball: ['Singles', 'Doubles', 'No Preference'],
  basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'No Preference'],
  volleyball: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite', 'Libero', 'No Preference'],
};

export default function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, profile, setProfile } = useAuth();
  const { setSelectedSport } = useSport();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

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
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      
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

      // Set the profile locally
      setProfile(updatedProfile);

      Alert.alert(
        'Onboarding Skipped',
        'You can set up your sport preferences anytime in your Profile settings.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to main app - this will be handled by the auth state change
            },
          },
        ]
      );
    } catch (error) {
      console.error('Skip onboarding error:', error);
      Alert.alert('Welcome!', 'You can set up your preferences anytime in Profile settings.');
    } finally {
      setLoading(false);
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
      for (const sport of selectedSports) {
        try {
          await profileService.createUserSportProfile(user.id, {
            sport_id: sport.id,
            skill_level: skillLevels[sport.id],
            preferred_position: positions[sport.id],
          });
        } catch (error) {
          console.log('Error creating sport profile (expected if no Supabase):', error);
        }
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
        {/* Progress Indicator */}
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

        {/* Content */}
        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </View>

        {/* Navigation */}
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
      </View>
    </AnimatedBackground>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
});