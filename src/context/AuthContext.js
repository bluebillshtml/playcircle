import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, authService, profileService } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId, userSession = null) => {
    const currentSession = userSession || session;
    try {
      console.log('Loading profile for user:', userId);
      let profileData = await profileService.getProfile(userId);

      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating new profile for user:', userId);
        try {
          profileData = await profileService.createProfile(userId);
        } catch (createError) {
          // Ignore user_stats RLS errors - this is a known database trigger issue
          if (createError.code === '42501' && createError.message?.includes('user_stats')) {
            console.log('Ignoring user_stats RLS error during profile creation');
            // Try to get the profile again - it may have been created despite the trigger error
            profileData = await profileService.getProfile(userId);
          } else {
            throw createError;
          }
        }
      }

      // If still no profile data, create a default one using user metadata
      if (!profileData) {
        console.log('Using default profile data from user metadata');
        const userMetadata = currentSession?.user?.user_metadata || {};
        profileData = {
          id: userId,
          username: userMetadata.username || `user_${userId.slice(0, 8)}`,
          full_name: userMetadata.full_name || userMetadata.name || null,
          first_name: userMetadata.first_name || null,
          last_name: userMetadata.last_name || null,
        };
      }

      // Map the database fields to the expected format
      const mappedProfile = {
        ...profileData,
        // Map full_name to first_name and last_name for backward compatibility
        first_name: profileData.first_name || (profileData.full_name ? profileData.full_name.split(' ')[0] : ''),
        last_name: profileData.last_name || (profileData.full_name ? profileData.full_name.split(' ').slice(1).join(' ') : ''),
        // Ensure skill_level exists (it might be in user_sport_profiles)
        skill_level: profileData.skill_level || 'Beginner',
      };

      console.log('Profile loaded successfully:', mappedProfile);
      setProfile(mappedProfile);
    } catch (error) {
      // Ignore user_stats RLS errors
      if (error.code === '42501' && error.message?.includes('user_stats')) {
        console.log('Ignoring user_stats RLS error - using default profile');
        const userMetadata = currentSession?.user?.user_metadata || {};
        setProfile({
          id: userId,
          username: userMetadata.username || `user_${userId.slice(0, 8)}`,
          full_name: userMetadata.full_name || userMetadata.name || null,
          first_name: userMetadata.first_name || null,
          last_name: userMetadata.last_name || null,
          skill_level: 'Beginner',
        });
      } else {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await authService.signIn(email, password);
    return data;
  };

  const signUp = async (email, password, userData) => {
    const data = await authService.signUp(email, password, userData);
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resendConfirmation = async (email) => {
    const data = await authService.resendConfirmation(email);
    return data;
  };

  const value = {
    user,
    profile,
    setProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
    loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
