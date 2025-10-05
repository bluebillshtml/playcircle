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
        loadProfile(session.user.id);
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
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      console.log('Loading profile for user:', userId);
      let profileData = await profileService.getProfile(userId);
      
      // If no profile exists, create one
      if (!profileData) {
        console.log('No profile found, creating new profile for user:', userId);
        profileData = await profileService.createProfile(userId);
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
      console.error('Error loading profile:', error);
      // If it's a JSON coercion error, log more details
      if (error.message && error.message.includes('coerce')) {
        console.error('JSON coercion error in loadProfile:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }
      setProfile(null);
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
