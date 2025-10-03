import React from 'react';
import { Platform, View } from 'react-native';

// Web-compatible marker component
const WebMarker = ({ coordinate, children, onPress, ...props }) => {
  return (
    <View 
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
      onPress={onPress}
    >
      {children}
    </View>
  );
};

// Native marker component - only import on native platforms
let NativeMarker;
if (Platform.OS !== 'web') {
  try {
    const ReactNativeMaps = require('react-native-maps');
    NativeMarker = ReactNativeMaps.Marker;
  } catch (e) {
    console.warn('react-native-maps not available');
    NativeMarker = WebMarker;
  }
} else {
  NativeMarker = WebMarker;
}

const Marker = (props) => {
  if (Platform.OS === 'web') {
    return <WebMarker {...props} />;
  }
  
  return <NativeMarker {...props} />;
};

export default Marker;
