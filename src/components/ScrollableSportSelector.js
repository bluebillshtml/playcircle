import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SPORTS_LIST = [
  { id: 'padel', name: 'Padel', icon: 'tennisball' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'soccer', name: 'Soccer', icon: 'football' },
  { id: 'volleyball', name: 'Volleyball', icon: 'tennisball' },
];

const FADE_DISTANCE = 100; // Distance over which fade occurs
const EDGE_PADDING = 80; // Padding from edges where fade starts

export default function ScrollableSportSelector({
  activeSport,
  onSportChange,
  colors,
  onNotificationPress
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      {/* Hamburger Menu - Fixed Left */}
      <View style={styles.leftIcon}>
        {/* NavigationButton will be placed here by parent */}
      </View>

      {/* Scrollable Sport Buttons */}
      <View style={styles.scrollContainer}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
        >
          {SPORTS_LIST.map((sport, index) => {
            // Calculate position of this button
            const buttonPosition = index * 90; // Approximate button width + gap
            const maxScroll = Math.max(0, contentWidth - scrollViewWidth);

            // Fade in from left edge
            const leftFadeStart = Math.max(0, buttonPosition - 60);
            const leftFadeEnd = Math.max(0, buttonPosition - 20);

            // Fade out at right edge
            const rightFadeStart = Math.max(leftFadeEnd + 1, maxScroll - 60);
            const rightFadeEnd = Math.max(rightFadeStart + 1, maxScroll);

            const opacity = scrollX.interpolate({
              inputRange: [0, leftFadeStart, leftFadeEnd, rightFadeStart, rightFadeEnd, rightFadeEnd + 100],
              outputRange: [1, 1, 1, 1, 0.3, 0],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View key={sport.id} style={{ opacity }}>
                <TouchableOpacity
                  style={[
                    styles.sportCard,
                    activeSport === sport.id && styles.sportCardActive,
                  ]}
                  onPress={() => onSportChange(sport.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={sport.icon}
                    size={18}
                    color={activeSport === sport.id ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.sportCardText,
                      activeSport === sport.id && styles.sportCardTextActive(colors),
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>

      {/* Notification Button - Fixed Right */}
      <TouchableOpacity
        style={[styles.notificationButton, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}
        onPress={onNotificationPress}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  leftIcon: {
    width: 48,
    height: 48,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
    height: 48,
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    zIndex: 1,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    zIndex: 1,
  },
  sportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  sportCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  sportCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sportCardTextActive: (colors) => ({
    color: colors.primary,
    fontWeight: '700',
  }),
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
