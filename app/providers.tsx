'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
});

async function fetchAndStoreOrg(accessToken: string) {
  try {
    const response = await fetch('/api/organizations/current', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem('organizationId');
      return;
    }

    const { organization } = await response.json();

    if (organization?.id) {
      localStorage.setItem('organizationId', organization.id);
    }
  } catch (err) {
    console.error('Failed to fetch organization:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error as Error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);

        // Store org on initial load if user is already logged in
        if (session?.user) {
          fetchAndStoreOrg(session.access_token);
        }
      }
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setError(null);

      // Store org on sign in, clear on sign out
      if (event === 'SIGNED_IN' && session?.user) {
        fetchAndStoreOrg(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('organizationId');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
