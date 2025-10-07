<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
=======
import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions, ImageBackground, Easing, AppState } from 'react-native';
>>>>>>> background
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

<<<<<<< HEAD
export default function AnimatedBackground({ children }) {
  // Create multiple animated values for different wave layers
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const wave5 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Wave animation 1 - Horizontal slow drift with easing
    const wave1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, {
          toValue: 1,
          duration: 28000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave1, {
          toValue: 0,
          duration: 28000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Wave animation 2 - Vertical drift with smooth easing
    const wave2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 0,
          duration: 20000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Wave animation 3 - Diagonal drift (slowest)
    const wave3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave3, {
          toValue: 1,
=======
const AnimatedBackground = memo(({ children }) => {
  // Animated values - start with zoomed in state
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1.2)).current;
  const appState = useRef(AppState.currentState);
  const wave1AnimRef = useRef(null);
  const wave2AnimRef = useRef(null);
  const scaleAnimRef = useRef(null);

  useEffect(() => {
    // Slow horizontal movement
    wave1AnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, {
          toValue: 1,
>>>>>>> background
          duration: 40000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
<<<<<<< HEAD
        Animated.timing(wave3, {
=======
        Animated.timing(wave1, {
>>>>>>> background
          toValue: 0,
          duration: 40000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

<<<<<<< HEAD
    // Wave animation 4 - Opposite horizontal drift
    const wave4Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave4, {
          toValue: 1,
          duration: 25000,
          easing: Easing.inOut(Easing.circle),
          useNativeDriver: true,
        }),
        Animated.timing(wave4, {
          toValue: 0,
          duration: 25000,
          easing: Easing.inOut(Easing.circle),
=======
    // Slow vertical movement
    wave2AnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, {
          toValue: 1,
          duration: 35000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 0,
          duration: 35000,
          easing: Easing.inOut(Easing.ease),
>>>>>>> background
          useNativeDriver: true,
        }),
      ])
    );

<<<<<<< HEAD
    // Wave animation 5 - Complex diagonal movement
    const wave5Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wave5, {
          toValue: 1,
          duration: 32000,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
        Animated.timing(wave5, {
          toValue: 0,
          duration: 32000,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
      ])
    );

    // Beautiful scale pulsing
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 22000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 22000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Secondary scale for depth
    const scale2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale2, {
          toValue: 1.05,
          duration: 18000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale2, {
          toValue: 1,
          duration: 18000,
=======
    // Slow zoom animation - always zoomed in
    scaleAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 30000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 30000,
>>>>>>> background
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

<<<<<<< HEAD
    // Opacity breathing effect
    const opacity1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity1, {
          toValue: 0.8,
          duration: 15000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0.6,
          duration: 15000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const opacity2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity2, {
          toValue: 0.6,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0.3,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    wave1Animation.start();
    wave2Animation.start();
    wave3Animation.start();
    wave4Animation.start();
    wave5Animation.start();
    scaleAnimation.start();
    scale2Animation.start();
    opacity1Animation.start();
    opacity2Animation.start();

    return () => {
      wave1Animation.stop();
      wave2Animation.stop();
      wave3Animation.stop();
      wave4Animation.stop();
      wave5Animation.stop();
      scaleAnimation.stop();
      scale2Animation.stop();
      opacity1Animation.stop();
      opacity2Animation.stop();
    };
  }, []);

  // Interpolate values for smooth wave movements
  const wave1TranslateX = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-25, 25],
=======
    // Start animations
    wave1AnimRef.current.start();
    wave2AnimRef.current.start();
    scaleAnimRef.current.start();

    // Listen to app state changes to pause/resume animations
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground - resume animations
        wave1AnimRef.current?.start();
        wave2AnimRef.current?.start();
        scaleAnimRef.current?.start();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to background - stop animations to save resources
        wave1AnimRef.current?.stop();
        wave2AnimRef.current?.stop();
        scaleAnimRef.current?.stop();
      }
      appState.current = nextAppState;
    });

    return () => {
      wave1AnimRef.current?.stop();
      wave2AnimRef.current?.stop();
      scaleAnimRef.current?.stop();
      subscription?.remove();
    };
  }, []);

  // Slow movement interpolations
  const wave1TranslateX = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
>>>>>>> background
  });

  const wave2TranslateY = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

<<<<<<< HEAD
  const wave3TranslateX = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });

  const wave3TranslateY = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -15],
  });

  const wave4TranslateX = wave4.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -18],
  });

  const wave4TranslateY = wave4.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  const wave5TranslateX = wave5.interpolate({
    inputRange: [0, 1],
    outputRange: [-22, 22],
  });

  const wave5TranslateY = wave5.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -18],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background Layer 1 - Base layer with main movement */}
=======
  return (
    <View style={styles.container}>
      {/* Single animated layer */}
>>>>>>> background
      <Animated.View
        style={[
          styles.backgroundLayer,
          {
            transform: [
              { translateX: wave1TranslateX },
              { translateY: wave2TranslateY },
              { scale: scale },
            ],
<<<<<<< HEAD
            opacity: 0.9,
          },
        ]}
      >
        <LinearGradient
          colors={['#B8E6D5', '#A8D5C5', '#98C4B5']}
          style={styles.backgroundImage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Gradient Background Layer 2 - Diagonal slow wave */}
      <Animated.View
        style={[
          styles.backgroundLayer,
          styles.overlayLayer,
          {
            transform: [
              { translateX: wave3TranslateX },
              { translateY: wave3TranslateY },
              { scale: scale2 },
            ],
            opacity: opacity1,
          },
        ]}
      >
        <LinearGradient
          colors={['#A8D5C5', '#B8E6D5', '#C8F6E5']}
          style={styles.backgroundImage}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Gradient Background Layer 3 - Opposite horizontal wave */}
      <Animated.View
        style={[
          styles.backgroundLayer,
          styles.overlayLayer,
          {
            transform: [
              { translateX: wave4TranslateX },
              { translateY: wave4TranslateY },
              { scale: scale },
            ],
            opacity: opacity2,
          },
        ]}
      >
        <LinearGradient
          colors={['#98C4B5', '#A8D5C5', '#B8E6D5']}
          style={styles.backgroundImage}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Gradient Background Layer 4 - Complex diagonal movement */}
      <Animated.View
        style={[
          styles.backgroundLayer,
          styles.overlayLayer,
          {
            transform: [
              { translateX: wave5TranslateX },
              { translateY: wave5TranslateY },
              { scale: scale2 },
            ],
            opacity: 0.25,
          },
        ]}
      >
        <LinearGradient
          colors={['#C8F6E5', '#B8E6D5', '#A8D5C5']}
          style={styles.backgroundImage}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Soft gradient overlay for depth and beauty */}
      <View style={styles.gradientOverlay} />

      {/* Subtle blur effect for glass morphism */}
      <BlurView intensity={2} tint="light" style={styles.blurOverlay} />

=======
          },
        ]}
      >
        <ImageBackground
          source={require('../../background1.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Soft overlay */}
      <View style={styles.gradientOverlay} />

>>>>>>> background
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
<<<<<<< HEAD
}
=======
});

export default AnimatedBackground;
>>>>>>> background

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8E6D5',
  },
  backgroundLayer: {
    position: 'absolute',
    top: -60,
    left: -60,
    right: -60,
    bottom: -60,
    width: width + 120,
    height: height + 120,
  },
  overlayLayer: {
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(184, 230, 213, 0.15)',
    zIndex: 5,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
