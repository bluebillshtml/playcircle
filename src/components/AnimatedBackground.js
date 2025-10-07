import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions, ImageBackground, Easing, AppState } from 'react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

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
          duration: 40000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wave1, {
          toValue: 0,
          duration: 40000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

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
          useNativeDriver: true,
        }),
      ])
    );

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
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

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
  });

  const wave2TranslateY = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  return (
    <View style={styles.container}>
      {/* Single animated layer */}
      <Animated.View
        style={[
          styles.backgroundLayer,
          {
            transform: [
              { translateX: wave1TranslateX },
              { translateY: wave2TranslateY },
              { scale: scale },
            ],
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

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
});

export default AnimatedBackground;

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
