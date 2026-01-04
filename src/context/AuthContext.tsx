
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '../services/userService';

export type UserRole = 'guest' | 'free' | 'premium' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  legalForm?: string;
  address?: string;
  nif?: string;
  rc?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  hasAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('comptalink_active_session');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Refresh from DB to get latest roles/info
        const latest = userService.findUserByEmail(parsed.email);
        if (latest) {
            setUser(latest);
        } else {
            setUser(parsed);
        }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = userService.findUserByEmail(email);
    if (!found) throw new Error("Utilisateur non trouvé");
    // En mode démo, on accepte n'importe quel password pour les tests
    setUser(found);
    localStorage.setItem('comptalink_active_session', JSON.stringify(found));
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = userService.createUser(name, email, 'free');
    setUser(newUser);
    localStorage.setItem('comptalink_active_session', JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('comptalink_active_session');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    userService.updateUserProfile(user.id, data);
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('comptalink_active_session', JSON.stringify(updated));
  };

  const hasAccess = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (requiredRole === 'premium') return user.role === 'premium';
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
