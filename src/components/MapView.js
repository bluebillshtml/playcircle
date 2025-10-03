import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Web-compatible map component
const WebMapView = ({ style, region, children, ...props }) => {
  return (
    <View style={[styles.webMapContainer, style]}>
      <Text style={styles.webMapText}>🗺️ Map View</Text>
      <Text style={styles.webMapSubtext}>
        Location: {region?.latitude?.toFixed(4)}, {region?.longitude?.toFixed(4)}
      </Text>
      <Text style={styles.webMapNote}>
        Interactive map available on mobile devices
      </Text>
      {children}
    </View>
  );
};

// Native map component - only import on native platforms
let NativeMapView;
if (Platform.OS !== 'web') {
  try {
    const ReactNativeMaps = require('react-native-maps');
    NativeMapView = ReactNativeMaps.default;
  } catch (e) {
    console.warn('react-native-maps not available');
    NativeMapView = WebMapView;
  }
} else {
  NativeMapView = WebMapView;
}

const MapView = (props) => {
  if (Platform.OS === 'web') {
    return <WebMapView {...props} />;
  }
  
  return <NativeMapView {...props} />;
};

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  webMapText: {
    fontSize: 24,
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  webMapNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default MapView;
