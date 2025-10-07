import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app screens
function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{ tabBarLabel: 'Find' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateMatchScreen}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
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
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1a1a1a" />
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
                name="MainTabs"
                component={MainTabNavigator}
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
