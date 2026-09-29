import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: number;
  email: string;
  role: string;
  full_name: string;
  nickname?: string;
  profile_picture_url?: string;
  onboarding_completed?: boolean;
  consent_completed?: boolean;
  permissions_reviewed?: boolean;
  profile_completed?: boolean;
  check_in_streak?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await api.get('/api/auth/me');
          const u = res.data;
          const fullName = u.role === 'PROFESSIONAL' 
            ? u.professional_profile?.full_name 
            : u.survivor_profile?.full_name;
          const nickname = u.survivor_profile?.nickname;
          const profile_picture_url = u.survivor_profile?.profile_picture_url;
          const onboarding_completed = u.survivor_profile?.onboarding_completed;
          const consent_completed = u.survivor_profile?.consent_completed;
          const permissions_reviewed = u.survivor_profile?.permissions_reviewed;
          const profile_completed = u.survivor_profile?.profile_completed;
          const check_in_streak = u.survivor_profile?.check_in_streak;
          
          setUser({ 
            id: u.id, 
            email: u.email, 
            role: u.role, 
            full_name: fullName, 
            nickname, 
            profile_picture_url,
            onboarding_completed,
            consent_completed,
            permissions_reviewed,
            profile_completed,
            check_in_streak
          });
          
          if (u.survivor_profile?.preferred_language) {
             const lang = u.survivor_profile.preferred_language;
             import('../i18n').then((module) => {
                 module.default.changeLanguage(lang === 'Hindi' ? 'hi' : lang === 'Bengali' ? 'bn' : lang === 'en' ? 'en' : 'en');
             });
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
