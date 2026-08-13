import api from '../api/axios';

// Cache for authentication status
let authCache = {
  isAuthenticated: false,
  timestamp: 0,
  userData: null as any
};

// Maximum age of cached auth status in milliseconds (1 minute)
const AUTH_CACHE_MAX_AGE = 60000;

// Helper function to get cookie value by name
export const getCookie = (name: string): string | null => {
  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
};

// Helper function to clear a specific cookie
const clearCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// User authentication service
const authService = {
  // Get the current user ID
  getCurrentUserId: (): string | null => {
    if (authCache.userData && authCache.userData.id) {
      return authCache.userData.id;
    }
    try {
      const userId = getCookie('USERID');
      return userId || null;
    } catch (error) {
      console.error('Error retrieving user ID from token:', error);
      return null;
    }
  },
  
  // Get the current username
  getCurrentUsername: (): string => {
    if (authCache.userData && authCache.userData.userName) {
      return authCache.userData.userName;
    }
    try {
      const username = getCookie('USERNAME');
      if (username) {
        return username;
      }
      return 'Guest';
    } catch (error) {
      console.error('Error retrieving username from token:', error);
      return 'Guest';
    }
  },

  // Get the current user role
  getCurrentRole: (): string | null => {
    if (authCache.userData && authCache.userData.roleName) {
      return authCache.userData.roleName;
    }
    try {
      const role = getCookie('ROLE');
      return role || null;
    } catch (error) {
      console.error('Error retrieving role from token:', error);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async (force = false): Promise<boolean> => {
    // Use cached value if still valid
    const now = Date.now();
    if (!force && authCache.timestamp > 0 && now - authCache.timestamp < AUTH_CACHE_MAX_AGE) {
      return authCache.isAuthenticated;
    }
    
    try {
      const response = await api.post('/api/auth/verify', {});
      
      // Update cache
      authCache = {
        isAuthenticated: response.status === 200,
        timestamp: now,
        userData: response.data
      };
      
      return authCache.isAuthenticated;
    } catch {
      // Update cache for failed auth
      authCache = {
        isAuthenticated: false,
        timestamp: now,
        userData: null
      };
      
      return false;
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    try {
      // Clear any old, potentially invalid tokens before attempting to log in again.
      // If we don't do this, Axios will attach the old token to the login request,
      // and Spring Security's BasicAuthenticationFilter will return 401 before
      // the controller even receives the new credentials.
      sessionStorage.removeItem('AUTHORIZATION');

      const response = await api.post('/api/auth/login', {
        username,
        password
      });
      
      if (response.status >= 200 && response.status < 300) {
        sessionStorage.setItem('AUTHORIZATION', response.data);
        // Clear auth cache on successful login
        authCache = { isAuthenticated: true, timestamp: Date.now(), userData: null };
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch {
      // Logout API call failed, still clear local state
    }

    // Properly clear cookies by setting expiry to past date
    clearCookie('USERID');
    clearCookie('USERNAME');
    clearCookie('ROLE');
    clearCookie('JSESSIONID');
    sessionStorage.removeItem('AUTHORIZATION');
    // Clear auth cache on logout
    authCache = { isAuthenticated: false, timestamp: Date.now(), userData: null };
  },

  register: async (name: string, username: string, password: string, email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        username,
        password,
        email
      });
      
      if (response.status >= 200 && response.status < 300) {
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Registration failed';
      return { success: false, message: errorMessage };
    }
  },
};

export default authService;
