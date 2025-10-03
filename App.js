import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import CreateMatchScreen from './src/screens/CreateMatchScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: '#1B3C53' }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1B3C53" />
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Matches"
            component={MatchesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Create"
            component={CreateMatchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MatchDetail"
            component={MatchDetailScreen}
            options={{
              headerTitle: 'Match Details',
              headerTitleAlign: 'left',
              headerStyle: {
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontSize: 20,
                fontWeight: '700',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
