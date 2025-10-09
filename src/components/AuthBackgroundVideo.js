import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function AuthBackgroundVideo() {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = () => {
    setIsLoaded(true);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../../playcircle.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        onLoad={onLoad}
        usePoster={false}
      />
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
