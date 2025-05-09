import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';

import { useColorModeContext } from '../../contexts/color-mode-context';

export default function ProfileLayout() {
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Change Password',
          headerRight: () => (
            <MaterialIcons name="lock" size={24} color={isDark ? '#ffffff' : '#000000'} style={{ marginRight: 15 }} />
          ),
        }}
      />
    </Stack>
  );
}
