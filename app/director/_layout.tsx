import { Stack } from 'expo-router';
import React from 'react';

export default function DirectorLayout() {
  return (
    <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Directors',
            }}
          />
        </Stack>
  );
}
