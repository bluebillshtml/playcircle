import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSport } from '../context/SportContext';

import SportSelector from '../components/SportSelector';
import AnimatedBackground from '../components/AnimatedBackground';

const COURTS = [
  { id: 1, name: 'Downtown Sports Club', pricePerHour: 40, sports: ['padel', 'tennis', 'pickleball'] },
  { id: 2, name: 'Sunset Sports Center', pricePerHour: 35, sports: ['tennis', 'basketball', 'volleyball'] },
  { id: 3, name: 'Elite Sports Academy', pricePerHour: 50, sports: ['padel', 'tennis', 'squash', 'badminton'] },
  { id: 4, name: 'City Basketball Arena', pricePerHour: 30, sports: ['basketball'] },
  { id: 5, name: 'Soccer Fields Complex', pricePerHour: 25, sports: ['soccer'] },
];

const DURATIONS = [60, 90, 120];

export default function CreateMatchScreen({ navigation }) {
  const { colors } = useTheme();
  const { selectedSport } = useSport();
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [matchType, setMatchType] = useState('casual');
  const [duration, setDuration] = useState(90);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(selectedSport.maxPlayers);

  // Update total players when sport changes
  React.useEffect(() => {
    setTotalPlayers(selectedSport.maxPlayers);
  }, [selectedSport]);

  // Filter courts based on selected sport
  const availableCourts = COURTS.filter(court => 
    court.sports.includes(selectedSport.id)
  );

  const calculateCost = () => {
    if (!selectedCourt) return 0;
    const court = availableCourts.find((c) => c.id === selectedCourt);
    return (court.pricePerHour * duration) / 60;
  };

  const calculatePricePerPlayer = () => {
    return (calculateCost() / totalPlayers).toFixed(2);
  };

  const handleCreateMatch = () => {
    if (!selectedCourt) {
      Alert.alert('Error', 'Please select a court');
      return;
    }
    if (!date || !time) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }
    if (!description) {
      Alert.alert('Error', 'Please add a description');
      return;
    }

    Alert.alert('Success!', 'Your match has been created and is now live!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Matches'),
      },
    ]);
  };

  const styles = createStyles(colors);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Invisible Header Spacer */}
        <View style={styles.invisibleHeader} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Match</Text>
      </View>
      
      {/* Sport Selector */}
      <SportSelector navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select {selectedSport.name} Court</Text>
        {availableCourts.map((court) => (
            <TouchableOpacity
              key={court.id}
              style={[
                styles.courtOption,
                selectedCourt === court.id && styles.courtOptionSelected,
              ]}
              onPress={() => setSelectedCourt(court.id)}
            >
              <View style={styles.courtOptionContent}>
                <View style={styles.radioButton}>
                  {selectedCourt === court.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.courtOptionInfo}>
                  <Text style={styles.courtOptionName}>{court.name}</Text>
                  <Text style={styles.courtOptionPrice}>
                    ${court.pricePerHour}/hour
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Type</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                matchType === 'casual' && styles.segmentButtonActive,
              ]}
              onPress={() => setMatchType('casual')}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  matchType === 'casual' && styles.segmentButtonTextActive,
                ]}
              >
                Casual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                matchType === 'competitive' && styles.segmentButtonActive,
              ]}
              onPress={() => setMatchType('competitive')}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  matchType === 'competitive' && styles.segmentButtonTextActive,
                ]}
              >
                Competitive
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.optionsGrid}>
            {DURATIONS.map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.optionButton,
                  duration === dur && styles.optionButtonActive,
                ]}
                onPress={() => setDuration(dur)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    duration === dur && styles.optionButtonTextActive,
                  ]}
                >
                  {dur} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-10-05"
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="18:00"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Players</Text>
          <View style={styles.playerSelector}>
            <TouchableOpacity
              style={styles.playerButton}
              onPress={() => totalPlayers > selectedSport.minPlayers && setTotalPlayers(totalPlayers - 1)}
              disabled={totalPlayers <= selectedSport.minPlayers}
            >
              <Ionicons
                name="remove-circle"
                size={32}
                color={totalPlayers <= selectedSport.minPlayers ? colors.border : colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.playerCount}>{totalPlayers}</Text>
            <TouchableOpacity
              style={styles.playerButton}
              onPress={() => totalPlayers < selectedSport.maxPlayers && setTotalPlayers(totalPlayers + 1)}
              disabled={totalPlayers >= selectedSport.maxPlayers}
            >
              <Ionicons
                name="add-circle"
                size={32}
                color={totalPlayers >= selectedSport.maxPlayers ? colors.border : colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            {selectedSport.minPlayers}-{selectedSport.maxPlayers} players allowed for {selectedSport.name}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell players about your match..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {selectedCourt && (
          <View style={styles.costSummary}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Total court cost</Text>
              <Text style={styles.costValue}>${calculateCost()}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Players</Text>
              <Text style={styles.costValue}>{totalPlayers}</Text>
            </View>
            <View style={[styles.costRow, styles.costRowFinal]}>
              <Text style={styles.costLabelFinal}>Cost per player</Text>
              <Text style={styles.costValueFinal}>
                ${calculatePricePerPlayer()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateMatch}
        >
          <Text style={styles.createButtonText}>Create Match</Text>
        </TouchableOpacity>
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
  invisibleHeader: {
    height: 80,
    backgroundColor: 'transparent',
  },
  spacer: {
    height: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 24,
    marginTop: 12,
    borderRadius: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  courtOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  courtOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  courtOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  courtOptionInfo: {
    flex: 1,
  },
  courtOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  courtOptionPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    backgroundColor: colors.surface,
  },
  playerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  playerButton: {
    padding: 8,
  },
  playerCount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  costSummary: {
    backgroundColor: colors.card,
    padding: 20,
    marginTop: 12,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  costRowFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  costLabelFinal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  costValueFinal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  spacer: {
    height: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
