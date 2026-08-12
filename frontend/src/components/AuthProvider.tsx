import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  // Track last check time to avoid redundant API calls
  const lastCheckedRef = useRef<number>(0);

  const checkAuthStatus = useCallback(async (force = false) => {
    // Skip redundant checks within 60s unless forced
    const now = Date.now();
    if (!force && lastCheckedRef.current > 0 && now - lastCheckedRef.current < 60000) {
      return;
    }
    
    setIsLoading(true);
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setUsername(authService.getCurrentUsername());
        setUserId(authService.getCurrentUserId());
        setRole(authService.getCurrentRole());
      } else {
        setUsername(null);
        setUserId(null);
        setRole(null);
      }
      lastCheckedRef.current = now;
    } catch {
      setIsAuthenticated(false);
      setUsername(null);
      setUserId(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    setUserId(null);
    setRole(null);
    lastCheckedRef.current = 0;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username,
      userId,
      role,
      isLoading,
      checkAuthStatus,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
