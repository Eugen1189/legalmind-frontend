import React, { createContext, useContext, useState, useEffect } from 'react';

// --- EMBEDDING TYPES DIRECTLY HERE TO AVOID IMPORT ERRORS ---
export type UserLanguage = 'ru' | 'en' | 'it' | 'uk';

export interface User {
  email: string;
  language: UserLanguage;
  token?: string; 
}
// -------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  login: (email: string, language: UserLanguage) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('legalmind_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const login = (email: string, language: UserLanguage) => {
    const newUser: User = { email, language };
    setUser(newUser);
    localStorage.setItem('legalmind_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('legalmind_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
