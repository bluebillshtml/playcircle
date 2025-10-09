import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
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
import OnboardingScreen from './src/screens/OnboardingScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
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
import NavigationButton from './src/components/NavigationButton';
import AuthBackgroundVideo from './src/components/AuthBackgroundVideo';

const Stack = createNativeStackNavigator();

// Helper component to add NavigationButton to screens
function ScreenWithNavButton({ component: Component, currentScreen, ...rest }) {
  return (props) => {
    return (
      <View style={{ flex: 1 }}>
        <Component {...props} {...rest} />
        <NavigationButton 
          navigation={props.navigation} 
          currentScreen={currentScreen}
        />
      </View>
    );
  };
}

function AppContent() {
  const { colors } = useTheme();
  const { user, profile, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for initial load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show loading while auth is initializing
  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  // Check if user needs onboarding
  const needsOnboarding = user && (!profile?.onboarding_completed);

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      {/* Background video for auth screens only */}
      {!user && <AuthBackgroundVideo />}

      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } }}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
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
          ) : needsOnboarding ? (
            // Onboarding Stack - Show when user needs onboarding
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
          ) : (
            // Main App Stack - Show when user is logged in
            <>
              <Stack.Screen
                name="Home"
                component={ScreenWithNavButton({ component: HomeScreen, currentScreen: 'Home' })}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Matches"
                component={ScreenWithNavButton({ component: MatchesScreen, currentScreen: 'Matches' })}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Create"
                component={ScreenWithNavButton({ component: CreateMatchScreen, currentScreen: 'Create' })}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Dashboard"
                component={ScreenWithNavButton({ component: DashboardScreen, currentScreen: 'Dashboard' })}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Profile"
                component={ScreenWithNavButton({ component: ProfileScreen, currentScreen: 'Profile' })}
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
              <Stack.Screen
                name="Preferences"
                component={PreferencesScreen}
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
