import '../disableWarnings';
import { GluestackUIProvider } from '@gluestack-ui/themed';
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
import { config } from '../gluestack-ui.config';

// Wrapper component to provide GluestackUI with color mode
function ColorModeWrapper({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorModeContext();
  return (
    <GluestackUIProvider config={config} colorMode={colorMode}>
      {children}
    </GluestackUIProvider>
  );
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
      <ColorModeWrapper>
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
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </AuthProvider>
        </AppQueryClientProvider>
      </SafeAreaProvider>
    </ColorModeWrapper>
  </ColorModeProvider>
  );
}
