import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
      // Default cache time of 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay in ms (with exponential backoff)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
      // Check network connection before refetching
      networkMode: 'online',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Network mode
      networkMode: 'online',
    },
  },
});

// Set up network status listener to pause/resume queries based on connectivity
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  }
});

export const AppQueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
