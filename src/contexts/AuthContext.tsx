import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/presentation/store/auth.store';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchCurrentUser = useAuthStore(state => state.fetchCurrentUser);
  const storeUser = useAuthStore(state => state.user);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch profile if user is logged in
      if (session?.user) {
        fetchCurrentUser();
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch profile or clear user based on auth state
      if (session?.user) {
        fetchCurrentUser();
      } else {
        useAuthStore.setState({ user: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCurrentUser]);

  const logout = async () => {
    try {
      await useAuthStore.getState().logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Legacy login function for backward compatibility
  const login = async () => {
    // This function is kept for backward compatibility
    // The actual authentication state is now managed by onAuthStateChange
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setSession(session);
      setUser(session.user);
    }
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        loading,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
