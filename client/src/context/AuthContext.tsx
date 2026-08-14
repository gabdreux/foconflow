import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchUserProfile = async (userId: string, email: string, metadataName?: string) => {
    try {
      const { data } = await supabase
        .from('professionals')
        .select('role, name')
        .eq('id', userId)
        .single();

      setUser({
        id: userId,
        email: email,
        name: data?.name || metadataName || email.split('@')[0],
        role: data?.role || 'USER',
      });
    } catch {
      setUser({
        id: userId,
        email: email,
        name: metadataName || email.split('@')[0],
        role: 'USER',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUserProfile(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.name
        );
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.name
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      await fetchUserProfile(
        data.user.id, 
        data.user.email || '', 
        data.user.user_metadata?.name
      );
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);