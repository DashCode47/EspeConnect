/**
 * Supabase Client Configuration for CamPlus
 *
 * This file initializes and exports the Supabase client for use throughout the app.
 * Make sure you have SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.
 */

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase credentials from environment variables
const supabaseUrl = Config.SUPABASE_URL;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '- SUPABASE_URL\n' +
    '- SUPABASE_ANON_KEY\n\n' +
    'Get these from: https://supabase.com/dashboard/project/[your-project]/settings/api'
  );
}

/**
 * Supabase Client Instance
 *
 * This client is configured to work with React Native, including:
 * - AsyncStorage for session persistence
 * - Auto-refresh of authentication tokens
 * - Row Level Security (RLS) policies
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage to persist the user session
    storage: AsyncStorage,

    // Auto refresh tokens before they expire
    autoRefreshToken: true,

    // Persist the session across app restarts
    persistSession: true,

    // Detect session from URL (useful for magic links, OAuth)
    detectSessionInUrl: false,
  },
});

/**
 * Helper function to get the current authenticated user
 *
 * @returns The current user or null if not authenticated
 *
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
};

/**
 * Helper function to get the current session
 *
 * @returns The current session or null if not authenticated
 *
 * @example
 * const session = await getSession();
 * if (session) {
 *   console.log('Access token:', session.access_token);
 * }
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
};

/**
 * Helper function to sign out the current user
 *
 * @example
 * await signOut();
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Export the client as default for convenience
export default supabase;
