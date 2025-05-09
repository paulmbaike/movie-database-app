import '../disableWarnings';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/auth-context';
import { ColorModeProvider, useColorModeContext } from '../contexts/color-mode-context';
import { AppQueryClientProvider } from '../contexts/query-client-provider';

// Status bar component that responds to color mode changes
function StatusBarManager() {
  const { isDark } = useColorModeContext();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ColorModeProvider>
      <StatusBarManager />
      <SafeAreaProvider>
        <AppQueryClientProvider>
          <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="movie" options={{ headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false }} />
                <Stack.Screen name="genre" options={{ headerShown: false }} />
                <Stack.Screen name="director" options={{ headerShown: false }} />
                <Stack.Screen name="actor" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </AuthProvider>
        </AppQueryClientProvider>
      </SafeAreaProvider>
    </ColorModeProvider>
  );
}
