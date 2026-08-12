import { createContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  role: string | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with null default so useAuth can detect usage outside provider
export const AuthContext = createContext<AuthContextType | null>(null);
