import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useNavigation } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { config } from '@/gluestack-ui.config';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '../../contexts/auth-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  
  // Get primary color from gluestack config
  const primaryColor = config.tokens.colors.primary500;

  const handleNavigate = (path: string) => {
    if (!isAuthenticated) {
      navigation.navigate('auth/login' as never);
    } else {
      navigation.navigate(path as never);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('auth/login');
            }
          },
        })}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MaterialIcons name="more-horiz" size={24} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('auth/login');
            }
          },
        })}
      />
    </Tabs>
  );
}
