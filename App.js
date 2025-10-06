import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SportProvider } from './src/context/SportContext';

import SplashScreen from './src/screens/SplashScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import CreateMatchScreen from './src/screens/CreateMatchScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import PurchasesScreen from './src/screens/PurchasesScreen';
import LanguagesScreen from './src/screens/LanguagesScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for initial load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#B8E6D5' }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#B8E6D5" />
        <Stack.Navigator>
          {!user ? (
            // Auth Stack - Show when user is not logged in
            <>
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Main App Stack - Show when user is logged in
            <>
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
              <Stack.Screen
                name="AccountSettings"
                component={AccountSettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Purchases"
                component={PurchasesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Languages"
                component={LanguagesScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AppSettings"
                component={AppSettingsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HelpCenter"
                component={HelpCenterScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SportProvider>
          <AppContent />
        </SportProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
