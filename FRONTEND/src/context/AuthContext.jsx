import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();
const SESSION_EXPIRY_KEY = 'shrink_session_expires_at';
const SESSION_DURATION_MS = 10 * 60 * 1000;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let logoutTimer;

    const clearSessionExpiry = () => {
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      window.clearTimeout(logoutTimer);
    };

    const scheduleAutoLogout = async () => {
      const storedExpiry = Number(localStorage.getItem(SESSION_EXPIRY_KEY));
      const expiresAt = storedExpiry > Date.now()
        ? storedExpiry
        : Date.now() + SESSION_DURATION_MS;

      localStorage.setItem(SESSION_EXPIRY_KEY, String(expiresAt));
      window.clearTimeout(logoutTimer);
      logoutTimer = window.setTimeout(async () => {
        clearSessionExpiry();
        await supabase.auth.signOut();
      }, expiresAt - Date.now());
    };

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) scheduleAutoLogout();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session || event === 'SIGNED_OUT') {
        clearSessionExpiry();
      } else if (event === 'SIGNED_IN') {
        localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
        scheduleAutoLogout();
      }
    });

    return () => {
      window.clearTimeout(logoutTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.file',
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error signing in:', err.message);
    }
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
