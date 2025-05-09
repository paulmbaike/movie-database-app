import { MaterialIcons } from '@expo/vector-icons';
import {
    Box,
    Button,
    Divider,
    Heading,
    HStack,
    Icon,
    Pressable,
    Text,
    VStack,
    useColorMode,
} from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '../../components/theme';
import { useAuth } from '../../contexts/auth-context';
// Using built-in useColorMode hook for unified theming

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, user, logoutUser } = useAuth();
  const colorMode = useColorMode();
  const isDark = colorMode === 'dark';
  
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Navigate to login
  const navigateToLogin = () => {
    router.push('/auth/login');
  };
  

  
  // Handle logout
  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await logoutUser();
    
    // Redirect to login page directly
    router.replace('/auth/login');
    
    // Alert.alert(
    //   'Logout',
    //   'Are you sure you want to logout?',
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Logout',
    //       onPress: async () => {
    //         // Perform logout
    //         await logoutUser();
            
    //         // Redirect to login page directly
    //         router.replace('/auth/login');
    //       },
    //       style: 'destructive',
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };
  
  // Navigate to admin dashboard (admin only)
  const navigateToAdmin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin');
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }} edges={['top', 'bottom', 'left', 'right']}>
        <Box flex={1} p="$5" justifyContent="center" alignItems="center" bg={isDark ? '$backgroundDark900' : '$backgroundLight50'}>
          <Icon 
            as={MaterialIcons} 
            name="account-circle" 
            size="6xl" 
            color="$textLight400" 
            $dark-color="$textDark500" 
          />
          <Heading mt="$6" textAlign="center">Sign in to your account</Heading>
          <Text mt="$2" textAlign="center" color="$textLight500" $dark-color="$textDark400">
            Create an account or sign in to access your profile and saved content.
          </Text>
          <Button mt="$6" size="lg" onPress={navigateToLogin}>
            <Text color="$white" fontWeight="$medium">Sign In</Text>
          </Button>
          
          {/* Theme toggle for non-authenticated users */}
          <Box mt="$10" width="100%">
            <ThemeToggle />
          </Box>
        </Box>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }} edges={['top', 'bottom', 'left', 'right']}>
      <Box flex={1} p="$4" bg={isDark ? '$backgroundDark900' : '$backgroundLight50'}>
        {/* Header */}
        <VStack space="xs" mb="$6" alignItems="center">
          <Box
            width="$24"
            height="$24"
            borderRadius="$full"
            bg="$primary100"
            $dark-bg="$primary900"
            alignItems="center"
            justifyContent="center"
            mb="$2"
          >
            <Text fontSize="$6xl" color="$primary500">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </Text>
          </Box>
          <Text fontSize="$lg" color="$primary500" fontWeight="$medium" mb="$1">
            {getGreeting()}, {user?.username || 'User'} 👋
          </Text>
          <Text color="$textLight500" $dark-color="$textDark400" mb="$2">
            Welcome back! 😊
          </Text>
        </VStack>
        
        {/* Settings Sections */}
        <VStack space="lg" divider={<Divider />}>
          {/* Account Section */}
          <VStack space="sm">
            <Heading size="md" mb="$2">Account</Heading>
            
            <Pressable
              onPress={() => router.push('/profile/change-password')}
              py="$3"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Icon as={MaterialIcons} name="lock" size="xl" color="$textLight900" $dark-color="$textDark100"/>
                  <Text fontWeight="$medium">Change Password</Text>
                </HStack>
                <Icon as={MaterialIcons} name="chevron-right" size="lg" color="$textLight500" $dark-color="$textDark400"/>
              </HStack>
            </Pressable>
          </VStack>
          
          {/* Preferences Section */}
          <VStack space="sm">
            <Heading size="md" mb="$2">Appearance</Heading>
            <Box py="$3">
              <ThemeToggle />
            </Box>
          </VStack>
          

          
          {/* Logout Button */}
          <Button
            variant="outline"
            action="negative"
            onPress={handleLogout}
            my="$2"
          >
            <Text color="$error600" fontWeight="$medium">Logout</Text>
          </Button>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
