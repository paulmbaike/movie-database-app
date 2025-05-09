import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, TOKEN_STORAGE_KEY } from '../constants/api';
import apiClient from './api-client';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

// Auth service functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    const authData = response.data as AuthResponse;
    
    // Store the token
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
    
    return authData;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Registering user with data:', { ...userData, password: '***' });
    console.log('Using endpoint:', API_ENDPOINTS.REGISTER);
    
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
    console.log('Registration response:', response.data);
    
    const authData = response.data as AuthResponse;
    
    // Store the token
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
    console.log('Token stored successfully');
    
    return authData;
  } catch (error: any) {
    console.error('Registration failed:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return !!token;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
};

export const getUserInfo = async (): Promise<AuthResponse | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    
    // This is a simplified approach. In a real app, you might want to decode the JWT
    // or make an API call to get the user info from the server
    return {
      token,
      username: 'username', // This would come from the decoded token or API
    };
  } catch (error) {
    console.error('Get user info failed:', error);
    return null;
  }
};

// Re-export logout from api-client
export { logout } from './api-client';
