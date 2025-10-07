import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
const Drawer = createDrawerNavigator();

// Drawer Navigator for main app screens
function MainDrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.card,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -10,
        },
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        edgeWidth: 80,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Matches"
        component={MatchesScreen}
        options={({ navigation }) => ({
          title: 'Find Matches',
          drawerLabel: 'Find Matches',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Create"
        component={CreateMatchScreen}
        options={({ navigation }) => ({
          title: 'Create Match',
          drawerLabel: 'Create Match',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          title: 'Statistics',
          drawerLabel: 'Statistics',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </Drawer.Navigator>
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
                name="MainDrawer"
                component={MainDrawerNavigator}
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
