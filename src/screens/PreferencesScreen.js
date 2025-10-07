import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function PreferencesScreen({ navigation }) {
    const { colors } = useTheme();
    const { user, profile, setProfile } = useAuth();
    const { selectedSport, setSelectedSport } = useSport();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSports, setSelectedSports] = useState([]);
    const [skillLevels, setSkillLevels] = useState({});
    const [positions, setPositions] = useState({});

    const styles = createStyles(colors);

    useEffect(() => {
        loadData();
    }, [user, profile]);

    // Local storage functions for fallback when Supabase isn't available
    const saveToLocalStorage = async (sportProfiles) => {
        try {
            const key = `sport_profiles_${user.id}`;
            await AsyncStorage.setItem(key, JSON.stringify(sportProfiles));
            console.log('💾 Successfully saved sport profiles to local storage:', sportProfiles);
        } catch (error) {
            console.log('❌ Error saving to local storage:', error);
        }
    };

    const loadFromLocalStorage = async () => {
        try {
            const key = `sport_profiles_${user.id}`;
            const data = await AsyncStorage.getItem(key);
            if (data) {
                const sportProfiles = JSON.parse(data);
                console.log('💾 Successfully loaded sport profiles from local storage:', sportProfiles);
                return sportProfiles;
            } else {
                console.log('📭 No data found in local storage for key:', key);
            }
        } catch (error) {
            console.log('❌ Error loading from local storage:', error);
        }
        return [];
    };

    const loadData = async () => {
        console.log('Loading preferences data...');
        console.log('User:', user?.id);
        console.log('Profile:', profile);

        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Try to load sport profiles from database first
            let sportProfiles = [];
            let dataSource = 'none';

            try {
                sportProfiles = await profileService.getUserSportProfiles(user.id);
                if (sportProfiles && sportProfiles.length > 0) {
                    console.log('✅ Loaded sport profiles from Supabase DB:', sportProfiles);
                    dataSource = 'database';
                } else {
                    console.log('📭 No sport profiles found in Supabase DB');
                    throw new Error('No data in database');
                }
            } catch (error) {
                console.log('❌ Error loading from Supabase (expected if no connection):', error.message);
                // Try local storage as fallback
                sportProfiles = await loadFromLocalStorage();
                if (sportProfiles && sportProfiles.length > 0) {
                    console.log('💾 Loaded sport profiles from local storage:', sportProfiles);
                    dataSource = 'localStorage';
                } else {
                    console.log('📭 No sport profiles found in local storage');
                }
            }

            if (sportProfiles && sportProfiles.length > 0) {
                // Use loaded data (from database or local storage)
                const sports = sportProfiles.map(sp =>
                    SPORTS.find(s => s.id === sp.sport_id)
                ).filter(Boolean);

                const skillLevelsMap = {};
                const positionsMap = {};

                sportProfiles.forEach(sp => {
                    skillLevelsMap[sp.sport_id] = sp.skill_level;
                    positionsMap[sp.sport_id] = sp.preferred_position;
                });

                console.log(`📊 Setting data from ${dataSource}:`);
                console.log('  - Sports:', sports.map(s => s.name));
                console.log('  - Skill levels:', skillLevelsMap);
                console.log('  - Positions:', positionsMap);

                setSelectedSports(sports);
                setSkillLevels(skillLevelsMap);
                setPositions(positionsMap);

                // Verify state was set correctly
                setTimeout(() => {
                    console.log(`✅ State verification after loading from ${dataSource}:`);
                    console.log('  - selectedSports length:', sports.length);
                    console.log('  - skillLevels keys:', Object.keys(skillLevelsMap));
                    console.log('  - positions keys:', Object.keys(positionsMap));
                }, 100);
            } else if (profile?.favorite_sports && Array.isArray(profile.favorite_sports)) {
                // Use profile data as fallback
                const sports = profile.favorite_sports.map(sportId =>
                    SPORTS.find(s => s.id === sportId)
                ).filter(Boolean);

                const skillLevelsMap = {};
                const positionsMap = {};

                sports.forEach(sport => {
                    skillLevelsMap[sport.id] = 'Beginner';
                    positionsMap[sport.id] = POSITIONS[sport.id]?.[0] || 'No Preference';
                });

                console.log('Setting from profile - Sports:', sports);
                console.log('Setting from profile - Skill levels:', skillLevelsMap);
                console.log('Setting from profile - Positions:', positionsMap);

                setSelectedSports(sports);
                setSkillLevels(skillLevelsMap);
                setPositions(positionsMap);
            } else {
                // No data found
                console.log('No data found, using empty state');
                setSelectedSports([]);
                setSkillLevels({});
                setPositions({});
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setSelectedSports([]);
            setSkillLevels({});
            setPositions({});
        } finally {
            setLoading(false);
        }
    };

    const handleSportToggle = (sport) => {
        console.log('Toggling sport:', sport.name);

        if (selectedSports.find(s => s.id === sport.id)) {
            // Remove sport
            const newSports = selectedSports.filter(s => s.id !== sport.id);
            const newSkillLevels = { ...skillLevels };
            const newPositions = { ...positions };
            delete newSkillLevels[sport.id];
            delete newPositions[sport.id];

            setSelectedSports(newSports);
            setSkillLevels(newSkillLevels);
            setPositions(newPositions);
        } else {
            // Add sport
            const newSports = [...selectedSports, sport];
            const newSkillLevels = {
                ...skillLevels,
                [sport.id]: 'Beginner',
            };
            const newPositions = {
                ...positions,
                [sport.id]: POSITIONS[sport.id]?.[0] || 'No Preference',
            };

            setSelectedSports(newSports);
            setSkillLevels(newSkillLevels);
            setPositions(newPositions);
        }
    };

    const handleSkillLevelSelect = (sportId, level) => {
        console.log(`Setting skill level for ${sportId}: ${level}`);
        setSkillLevels({
            ...skillLevels,
            [sportId]: level,
        });
    };

    const handlePositionSelect = (sportId, position) => {
        console.log(`Setting position for ${sportId}: ${position}`);
        setPositions({
            ...positions,
            [sportId]: position,
        });
    };

    const handleSave = async () => {
        console.log('=== SAVE BUTTON PRESSED ===');
        console.log('Selected sports:', selectedSports);
        console.log('Skill levels:', skillLevels);
        console.log('Positions:', positions);

        try {
            setSaving(true);

            // Delete existing sport profiles first
            try {
                await profileService.deleteUserSportProfiles(user.id);
                console.log('Deleted existing sport profiles');
            } catch (error) {
                console.log('Error deleting sport profiles (expected if no Supabase):', error);
            }

            // Create new sport profiles for selected sports
            console.log('=== PREFERENCES SAVE DEBUG ===');
            console.log('Selected sports:', selectedSports);
            console.log('Skill levels state:', skillLevels);
            console.log('Positions state:', positions);

            const sportProfilesToSave = [];

            for (const sport of selectedSports) {
                const sportProfileData = {
                    sport_id: sport.id,
                    skill_level: skillLevels[sport.id] || 'Beginner',
                    preferred_position: positions[sport.id] || POSITIONS[sport.id]?.[0] || 'No Preference',
                };

                console.log(`Creating sport profile for ${sport.name}:`, sportProfileData);
                console.log(`  - Skill level from state: ${skillLevels[sport.id]}`);
                console.log(`  - Position from state: ${positions[sport.id]}`);

                sportProfilesToSave.push(sportProfileData);

                try {
                    await profileService.createUserSportProfile(user.id, sportProfileData);
                    console.log(`✅ Successfully saved ${sport.name} to Supabase`);
                } catch (error) {
                    console.log(`❌ Error saving ${sport.name} to Supabase (expected if no connection):`, error.message);
                }
            }

            // Always save to local storage as backup/fallback
            await saveToLocalStorage(sportProfilesToSave);
            console.log('💾 Saved all sport profiles to local storage as backup');

            // Update main profile with favorite sports array
            try {
                const profileUpdate = {
                    favorite_sports: selectedSports.map(s => s.id),
                    updated_at: new Date().toISOString(),
                };

                const updatedProfile = await profileService.updateProfile(user.id, profileUpdate);
                console.log('Updated profile with favorite sports:', profileUpdate);

                // Update local profile state
                setProfile({
                    ...profile,
                    ...profileUpdate,
                });
            } catch (error) {
                console.log('Error updating profile (expected if no Supabase):', error);
                // Update local profile even if database fails
                setProfile({
                    ...profile,
                    favorite_sports: selectedSports.map(s => s.id),
                    updated_at: new Date().toISOString(),
                });
            }

            // Update selected sport context if current one is no longer selected
            if (selectedSports.length > 0 && !selectedSports.find(s => s.id === selectedSport?.id)) {
                setSelectedSport(selectedSports[0]);
                console.log(`Updated selected sport to: ${selectedSports[0].name}`);
            }

            Alert.alert('Success', 'Your sport preferences have been updated!');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving preferences:', error);
            Alert.alert('Error', 'Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AnimatedBackground>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading preferences...</Text>
                </View>
            </AnimatedBackground>
        );
    }

    return (
        <AnimatedBackground>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sport Preferences</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.saveButton}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Sports Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sports You Play</Text>
                        <Text style={styles.sectionSubtitle}>Select all sports you're interested in</Text>

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
                                            size={28}
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

                    {/* Debug Section */}
                    {selectedSports.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Debug Info</Text>
                            <Text style={styles.debugText}>Selected Sports: {selectedSports.map(s => s.name).join(', ')}</Text>
                            <Text style={styles.debugText}>Skill Levels: {JSON.stringify(skillLevels)}</Text>
                            <Text style={styles.debugText}>Positions: {JSON.stringify(positions)}</Text>

                            <TouchableOpacity
                                style={styles.debugButton}
                                onPress={() => {
                                    console.log('=== DEBUG BUTTON PRESSED ===');
                                    console.log('Current state:');
                                    console.log('  selectedSports:', selectedSports);
                                    console.log('  skillLevels:', skillLevels);
                                    console.log('  positions:', positions);
                                    Alert.alert('Debug', 'Check console for current state');
                                }}
                            >
                                <Text style={styles.debugButtonText}>Log Current State</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Sport Details */}
                    {selectedSports.map((sport) => (
                        <View key={sport.id} style={styles.section}>
                            <View style={styles.sportHeader}>
                                <Ionicons name={sport.icon} size={24} color={colors.primary} />
                                <Text style={styles.sportSectionTitle}>{sport.name}</Text>
                            </View>

                            {/* Skill Level */}
                            <View style={styles.subsection}>
                                <Text style={styles.subsectionTitle}>Skill Level</Text>
                                <Text style={styles.debugText}>Current: {skillLevels[sport.id] || 'None'}</Text>
                                <View style={styles.optionsGrid}>
                                    {SKILL_LEVELS.map((level) => {
                                        const isSelected = skillLevels[sport.id] === level;
                                        return (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.optionCard,
                                                    isSelected && styles.optionCardSelected,
                                                ]}
                                                onPress={() => handleSkillLevelSelect(sport.id, level)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextSelected,
                                                ]}>
                                                    {level}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Preferred Position */}
                            <View style={styles.subsection}>
                                <Text style={styles.subsectionTitle}>Preferred Position</Text>
                                <Text style={styles.debugText}>Current: {positions[sport.id] || 'None'}</Text>
                                <View style={styles.optionsGrid}>
                                    {POSITIONS[sport.id]?.map((position) => {
                                        const isSelected = positions[sport.id] === position;
                                        return (
                                            <TouchableOpacity
                                                key={position}
                                                style={[
                                                    styles.optionCard,
                                                    isSelected && styles.optionCardSelected,
                                                ]}
                                                onPress={() => handlePositionSelect(sport.id, position)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextSelected,
                                                ]}>
                                                    {position}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    ))}

                    {selectedSports.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="sports" size={64} color={colors.textSecondary} />
                            <Text style={styles.emptyStateTitle}>No Sports Selected</Text>
                            <Text style={styles.emptyStateText}>
                                Select the sports you play to customize your experience
                            </Text>
                        </View>
                    )}

                    <View style={styles.bottomPadding} />
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
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    loadingText: {
        color: colors.textSecondary,
        marginTop: 12,
        textAlign: 'center',
    },
    section: {
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
    },
    sportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sportCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        minWidth: 90,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sportCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sportName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        marginTop: 6,
        textAlign: 'center',
    },
    sportNameSelected: {
        color: colors.white,
    },
    sportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    sportSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    subsection: {
        marginBottom: 20,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    debugText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionCard: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    optionCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    optionTextSelected: {
        color: colors.white,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomPadding: {
        height: 40,
    },
    debugButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 8,
    },
    debugButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});