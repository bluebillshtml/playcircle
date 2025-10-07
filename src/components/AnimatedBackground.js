import React from 'react';
import { View, StyleSheet } from 'react-native';

const AnimatedBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default AnimatedBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark shade of black
  },
  content: {
    flex: 1,
  },
});
