import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthApi, setAccessToken } from './api';
import { useRouter } from './router';

// The backend Login/Refresh response only returns { ok, accessToken }.
// It does NOT return the User object. 
// We must extract the User ID (sub) from the JWT.
interface User {
  id: string;
  email?: string; // Email might not be available on refresh if not in token
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Helper to parse JWT payload
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouter();

  const handleToken = (token: string, emailHint?: string) => {
      setAccessToken(token);
      const payload = parseJwt(token);
      if (payload && payload.sub) {
          setUser({ 
              id: payload.sub,
              email: emailHint // We try to persist email if we know it, otherwise it's undefined
          });
      }
  };

  // Initial session check - Run only once on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Create a timeout promise (e.g., 1000ms) to prevent hanging if backend is down
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Backend timeout')), 1000)
        );

        // Attempt silent refresh, but race against the timeout
        // If backend is unreachable, timeout wins and we go to catch block -> loading=false
        const data = await Promise.race([AuthApi.refresh(), timeoutPromise]) as any;
        
        if (data && data.ok && data.accessToken) {
            handleToken(data.accessToken);
        }
      } catch (err) {
        // Session invalid, network error, or timeout - strictly logged out
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for forced logout from API client (e.g. 401 on refresh)
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      navigate('/auth');
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [navigate]);

  const login = async (creds: { email: string; password: string }) => {
    const data = await AuthApi.login(creds);
    if (data.ok && data.accessToken) {
        handleToken(data.accessToken, creds.email);
        navigate('/');
    }
  };

  const register = async (creds: any) => {
    await AuthApi.register(creds);
    // Spec: Register returns { id }, does NOT log in automatically.
    // UI should tell user to check email.
  };

  const logout = async () => {
    await AuthApi.logout();
    setUser(null);
    setAccessToken(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};