import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY } from '../constants/api';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Define types for auth tokens
interface AuthTokens {
  token: string;
  userId: string;
  username: string;
}

// Create API client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Platform': Platform.OS,
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor for adding auth token and handling offline state
apiClient.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error('No internet connection'));
    }

    // Add auth token if available
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized error (token expired)
    if (error.response?.status === 401) {
      // Token expired or invalid, user needs to login again
      await logout();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle logout - only clears local storage
export const logout = async (): Promise<void> => {
  // Simply clear the token from storage without making API call
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
};

export default apiClient;
