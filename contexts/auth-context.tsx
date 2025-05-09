import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { z } from 'zod';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY } from '../constants/api';
import apiClient, { logout } from '../services/api-client';

// Define storage keys for user data
const USER_DATA_KEY = 'user_data';

// Define user schema with Zod for validation
const UserSchema = z.object({
  username: z.string(),
  role: z.string().default('user')
});

export type User = z.infer<typeof UserSchema>;

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check for stored tokens
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  clearError: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored auth token on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (token) {
          // Try to get stored user data
          const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
          let user: User;
          
          if (userDataString) {
            // Use stored user data if available
            user = JSON.parse(userDataString);
          } else {
            // Fallback if only token exists but no user data
            user = { username: 'user', role: 'user' };
            // Store this basic user data for future
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
          }
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'No stored credentials' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await logout();
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        username,
        password,
      });
      
      const { token, username: userName, role } = response.data;
      
      // Create user object
      const user = { username: userName, role: role || 'user' };
      
      // Store token and user data
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      // Return true to indicate success
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      // Throw the error so it can be caught by login form
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    
    try {
      console.log('Auth context: Registering user', { username, email });
      
      // Use the auth service to register
      const registerData = {
        username,
        email,
        password,
        confirmPassword: password
      };
      
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, registerData);
      console.log('Auth context: Registration response', response.data);
      
      // Extract username from response or use the provided username
      const userName = response.data.username || username;
      
      // Create user object with role
      const user = { 
        username: userName, 
        role: response.data.role || 'user' 
      };
      
      // Store token and user data if token exists
      if (response.data.token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      }
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
      
      // Return true to indicate success
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      
      // Throw the error so it can be caught by registration form
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logoutUser = async () => {
    // Clear auth storage without API call
    await logout();
    // Also clear user data
    await AsyncStorage.removeItem(USER_DATA_KEY);
    // Update auth state
    dispatch({ type: 'LOGOUT' });
    // Redirect to login screen
    const { router } = require('expo-router');
    router.replace('/login');
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logoutUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
