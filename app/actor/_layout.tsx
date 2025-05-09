import { Stack } from 'expo-router';
import React from 'react';

export default function ActorLayout() {
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
                title: 'Actors',
              }}
            />
          </Stack>
  );
}
