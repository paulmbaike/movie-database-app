import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Divider,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack
} from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorMode } from '@gluestack-ui/themed';

type NavigationItem = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: '/actor' | '/director' | '/genre';
};

const navigationItems: NavigationItem[] = [
  {
    title: 'Actors',
    description: 'Browse and manage the cast members',
    icon: 'people',
    route: '/actor'
  },
  {
    title: 'Directors',
    description: 'View all movie directors',
    icon: 'videocam',
    route: '/director'
  },
  {
    title: 'Genres',
    description: 'Explore movie categories',
    icon: 'category',
    route: '/genre'
  }
];

export default function MoreScreen() {
  const colorMode = useColorMode();
  const isDark = colorMode === 'dark';
  
  const handleNavigation = (route: '/actor' | '/director' | '/genre') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }}>
      <Box flex={1} bg={isDark ? '$backgroundDark900' : '$backgroundLight100'}>
        {/* Header */}
        <VStack space="md" mb="$6" p="$4">
          <Heading size="2xl">More</Heading>
          <Text color="$textLight500" $dark-color="$textDark400">
            Browse categories and discover more content
          </Text>
        </VStack>
        
        {/* Cards Grid */}
        <VStack space="lg" px="$4" pb="$4">
          {navigationItems.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => handleNavigation(item.route)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Box
                bg={isDark ? '$backgroundDark800' : '$white'}
                borderRadius="$xl"
                overflow="hidden"
                {...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 2,
                  },
                })}
              >
                <HStack p="$4" alignItems="center" space="md">
                  <Box
                    bg={isDark ? '$backgroundDark700' : '$backgroundLight200'}
                    width="$12"
                    height="$12"
                    borderRadius="$lg"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <MaterialIcons 
                      name={item.icon} 
                      size={28} 
                      color={isDark ? '$primary400' : '$primary500'} 
                    />
                  </Box>
                  
                  <VStack flex={1} space="xs">
                    <Text
                      fontSize="$lg"
                      fontWeight="$bold"
                      color={isDark ? '$textDark100' : '$textLight900'}
                    >
                      {item.title}
                    </Text>
                    <Text
                      fontSize="$sm"
                      color={isDark ? '$textDark400' : '$textLight500'}
                    >
                      {item.description}
                    </Text>
                  </VStack>
                  
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={isDark ? '#a1a1aa' : '#a3a3a3'} 
                  />
                </HStack>
              </Box>
            </Pressable>
          ))}
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
