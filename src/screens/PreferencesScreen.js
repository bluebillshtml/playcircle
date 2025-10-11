import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
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
    const [editingSport, setEditingSport] = useState(null);

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
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading preferences...</Text>
                    </View>
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
                    <Text style={styles.headerTitle}>Preferences</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.saveButton}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.scrollView} 
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sports Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconGlow}>
                                <Ionicons name="sports" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>Sports You Play</Text>
                        </View>
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

                    {/* Sport Summary Cards */}
                    {selectedSports.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconGlow}>
                                    <Ionicons name="settings-outline" size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.sectionTitle}>Sport Preferences</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Tap any sport to customize your skill level and position</Text>
                            
                            <View style={styles.sportSummaryContainer}>
                                {selectedSports.map((sport) => (
                                    <TouchableOpacity
                                        key={sport.id}
                                        style={styles.sportSummaryCard}
                                        onPress={() => setEditingSport(sport)}
                                    >
                                        <View style={styles.sportSummaryLeft}>
                                            <View style={styles.sportIconContainer}>
                                                <Ionicons name={sport.icon} size={20} color={colors.primary} />
                                            </View>
                                            <View style={styles.sportSummaryInfo}>
                                                <Text style={styles.sportSummaryName}>{sport.name}</Text>
                                                <Text style={styles.sportSummaryDetails}>
                                                    {skillLevels[sport.id] || 'Beginner'} • {positions[sport.id] || 'No Preference'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

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

            {/* Sport Editing Modal */}
            <Modal
                visible={editingSport !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditingSport(null)}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark">
                        <View style={styles.modalDarkOverlay} />
                    </BlurView>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setEditingSport(null)}
                    />
                    <View style={styles.modalContainer}>
                        <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.5)', 'rgba(5, 150, 105, 0.6)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <ScrollView 
                                style={styles.modalScrollView}
                                contentContainerStyle={styles.modalCard}
                                showsVerticalScrollIndicator={false}
                            >
                                {editingSport && (
                                    <>
                                        <View style={styles.modalIconContainer}>
                                            <Ionicons name={editingSport.icon} size={40} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.modalTitle}>{editingSport.name} Preferences</Text>
                                        <Text style={styles.modalMessage}>
                                            Customize your skill level and preferred position
                                        </Text>
                                        
                                        {/* Skill Level Section */}
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalSectionTitle}>Skill Level</Text>
                                            <View style={styles.modalOptionsGrid}>
                                                {SKILL_LEVELS.map((level) => {
                                                    const isSelected = skillLevels[editingSport.id] === level;
                                                    return (
                                                        <TouchableOpacity
                                                            key={level}
                                                            style={[
                                                                styles.modalOptionCard,
                                                                isSelected && styles.modalOptionCardSelected,
                                                            ]}
                                                            onPress={() => handleSkillLevelSelect(editingSport.id, level)}
                                                        >
                                                            <Text style={[
                                                                styles.modalOptionText,
                                                                isSelected && styles.modalOptionTextSelected,
                                                            ]}>
                                                                {level}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        {/* Position Section */}
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalSectionTitle}>Preferred Position</Text>
                                            <View style={styles.modalOptionsGrid}>
                                                {POSITIONS[editingSport.id]?.map((position) => {
                                                    const isSelected = positions[editingSport.id] === position;
                                                    return (
                                                        <TouchableOpacity
                                                            key={position}
                                                            style={[
                                                                styles.modalOptionCard,
                                                                isSelected && styles.modalOptionCardSelected,
                                                            ]}
                                                            onPress={() => handlePositionSelect(editingSport.id, position)}
                                                        >
                                                            <Text style={[
                                                                styles.modalOptionText,
                                                                isSelected && styles.modalOptionTextSelected,
                                                            ]}>
                                                                {position}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.modalDoneButton}
                                            onPress={() => setEditingSport(null)}
                                        >
                                            <Text style={styles.modalDoneButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </ScrollView>
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
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        width: 40,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
        paddingTop: 8,
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
    section: {
        marginHorizontal: 20,
        marginBottom: 16,
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
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    sportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    sportCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        width: 100,
        borderWidth: 1.5,
        borderColor: colors.glassBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sportCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        transform: [{ scale: 1.02 }],
    },
    sportName: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginTop: 8,
        textAlign: 'center',
    },
    sportNameSelected: {
        color: '#FFFFFF',
    },

    sportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    sportIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    sportSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.5,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        backgroundColor: colors.card,
        borderRadius: 20,
        marginHorizontal: 20,
        borderWidth: 1.5,
        borderColor: colors.glassBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
        letterSpacing: -0.5,
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
    // Sport Summary Cards
    sportSummaryContainer: {
        paddingHorizontal: 20,
    },
    sportSummaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: colors.glassBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sportSummaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sportSummaryInfo: {
        marginLeft: 12,
        flex: 1,
    },
    sportSummaryName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    sportSummaryDetails: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalDarkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        maxHeight: '85%',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 20,
    },
    modalBlur: {
        borderRadius: 24,
    },
    modalScrollView: {
        maxHeight: '100%',
    },
    modalCard: {
        padding: 24,
        alignItems: 'center',
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    modalMessage: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalSection: {
        width: '100%',
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalOptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    modalOptionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalOptionCardSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    modalOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    modalOptionTextSelected: {
        color: '#FFFFFF',
    },
    modalDoneButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginTop: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    modalDoneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});