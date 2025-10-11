import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onComplete }) {
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isVideoEnding, setIsVideoEnding] = useState(false);

  const handleVideoEnd = () => {
    setIsVideoEnding(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      if (onComplete) onComplete();
    });
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
        <Video
          ref={videoRef}
          source={require('../../assets/splash.mp4')}
          style={styles.video}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish && !isVideoEnding) {
              handleVideoEnd();
            }
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: width,
    height: height,
  },
});
