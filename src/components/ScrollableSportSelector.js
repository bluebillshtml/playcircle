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

const { width } = Dimensions.get('window');

const DEFAULT_SPORTS_LIST = [
  { id: 'padel', name: 'Padel', icon: 'tennisball' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'soccer', name: 'Soccer', icon: 'football' },
  { id: 'volleyball', name: 'Volleyball', icon: 'tennisball' },
];

// ===== FADE CONFIGURATION =====
// Adjust these values to control fade behavior
const BUTTON_WIDTH = 90; // Approximate width of each button (including gap)
const FADE_ZONE = 120; // Distance from viewport edge where fade occurs (larger = more gradual)
const MIN_OPACITY = 0; // Minimum opacity at the very edge (0 = fully transparent, 1 = fully visible)
const MAX_OPACITY = 1; // Maximum opacity when button is centered
// ===== END FADE CONFIGURATION =====

export default function ScrollableSportSelector({
  activeSport,
  onSportChange,
  colors,
  onNotificationPress,
  sports = DEFAULT_SPORTS_LIST // Allow custom sports list, fallback to default
}) {
  // ===== ANIMATED SCROLL TRACKING =====
  // scrollX tracks horizontal scroll position in real-time
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  // Store button positions for accurate fade calculations
  const buttonPositions = useRef([]);

  // PERFORMANCE NOTE: Using useNativeDriver: false because we need to interpolate
  // opacity based on scroll position. For better performance with large lists,
  // consider using react-native-reanimated with useNativeDriver: true
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } // Set to false for opacity interpolation
  );

  // Calculate button layout positions for precise fade calculations
  const onButtonLayout = (event, index) => {
    const { x, width } = event.nativeEvent.layout;
    buttonPositions.current[index] = { x, width };
  };

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
          scrollEventThrottle={16} // PERFORMANCE: Lower = more frequent updates (smoother), higher = less CPU (16ms ≈ 60fps)
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
        >
          {sports.map((sport, index) => {
            return (
              <View key={sport.id}>
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
                    color={activeSport === sport.id ? colors.primary : 'rgba(255, 255, 255, 0.7)'}
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
              </View>
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

// ===== STYLES =====
const styles = StyleSheet.create({
  // Main container with hamburger, scrollable buttons, and notification bell
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 12, // Space between hamburger, scroll area, and bell
  },

  // Placeholder for hamburger menu icon (rendered by parent)
  leftIcon: {
    width: 48,
    height: 48,
  },

  // Container for the scrollable sport buttons
  scrollContainer: {
    flex: 1, // Takes remaining space between hamburger and bell
    position: 'relative',
    height: 48,
    justifyContent: 'center',
  },

  // Content inside the ScrollView
  scrollContent: {
    gap: 8, // Space between sport buttons
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  // Individual sport button styling (dark theme with green accent)
  sportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)', // Dark background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
    gap: 6, // Space between icon and text
  },

  // Active sport button styling (green theme)
  sportCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green tint (#10B981 with 20% opacity)
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)', // Green border
  },
  // Sport button text styling
  sportCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)', // Slightly dimmed white
  },

  // Active sport button text styling
  sportCardTextActive: (colors) => ({
    color: colors.primary, // Green color from theme
    fontWeight: '700',
  }),

  // Notification bell button (fixed right)
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

// ===== PERFORMANCE OPTIMIZATION TIPS =====
// 1. For very long lists (20+ items), consider using react-native-reanimated for better performance
// 2. Adjust scrollEventThrottle based on device performance (8-32ms range)
// 3. Use shouldComponentUpdate or React.memo if buttons have complex rendering
// 4. Consider lazy loading buttons that are far off-screen
// 5. Profile with React DevTools to identify bottlenecks
//
// ===== CUSTOMIZATION GUIDE =====
// - Fade distance: Adjust FADE_START_DISTANCE and FADE_END_DISTANCE at the top
// - Opacity range: Modify MIN_OPACITY and MAX_OPACITY constants
// - Button spacing: Change BUTTON_WIDTH to match actual button dimensions
// - Colors: Update sportCard and sportCardActive background/border colors
// - Scroll speed: Modify scrollEventThrottle (lower = smoother, higher = less CPU)
// ===== END NOTES =====
