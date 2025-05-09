import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  Heading,
  HStack,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  useColorMode,
  VStack
} from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useAuth } from '../../contexts/auth-context';

// Define login form schema with Zod
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, error, isLoading, clearError } = useAuth();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Form state
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (field: keyof LoginForm, value: string) => {
    // Clear auth error when user starts typing
    if (error) clearError();
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(prev => !prev);
  };

  // Handle login
  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Validate form
      loginSchema.parse(form);
      
      // Clear any previous errors
      setFormErrors({});
      
      // Call login function from auth context and wait for result
      const loginSuccess = await login(form.username, form.password);
      
      // If login was successful, redirect to home
      if (loginSuccess) {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginForm] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        // Handle API errors
        setFormErrors({
          general: error.message || 'Failed to login. Please check your credentials.'
        });
        
        // Provide haptic feedback for error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Navigate to register screen
  const navigateToRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Box flex={1} p="$5" justifyContent="center">
            <VStack space="xl" mb="$8">
              {/* App Branding */}
              <Box 
                alignItems="center" 
                justifyContent="center"
                mb="$6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}
              >
                <HStack alignItems="center" space="sm">
                  <MaterialIcons name="movie" size={36} color="#0077FF" />
                  <Heading size="xl" color="$primary500" fontWeight="$bold">Movie Database</Heading>
                </HStack>
                <Text color="$textLight400" $dark-color="$textDark500" fontSize="$xs" mt="$1">
                  Your personal film collection
                </Text>
              </Box>
              
              <Text size="md" color="$textLight500" $dark-color="$textDark400" textAlign="center" mb="$2">
                Sign in to access your movie collection
              </Text>

              {/* Username input */}
              <FormControl isInvalid={!!formErrors.username}>
                <Input
                  size="lg"
                  borderRadius="$lg"
                  borderWidth={2}
                  borderColor={isDark ? '$borderDark700' : '$borderLight300'}
                  $invalid-borderColor="$error600"
                >
                  <InputField
                    placeholder="Username"
                    value={form.username}
                    onChangeText={(value) => handleChange('username', value)}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>{formErrors.username}</FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Password input */}
              <FormControl isInvalid={!!formErrors.password}>
                <Input
                  size="lg"
                  borderRadius="$lg"
                  borderWidth={2}
                  borderColor={isDark ? '$borderDark700' : '$borderLight300'}
                  $invalid-borderColor="$error600"
                >
                  <InputField
                    placeholder="Password"
                    value={form.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <Pressable onPress={togglePasswordVisibility} p="$2">
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={isDark ? '#a1a1aa' : '#a3a3a3'}
                    />
                  </Pressable>
                </Input>
                <FormControlError>
                  <FormControlErrorText>{formErrors.password}</FormControlErrorText>
                </FormControlError>
                <FormControlHelper>
                  <FormControlHelperText>
                    At least 8 characters with uppercase, lowercase, and numbers
                  </FormControlHelperText>
                </FormControlHelper>
              </FormControl>

              {/* Auth error message */}
              {error && (
                <Box bg="$error100" p="$3" borderRadius="$md" $dark-bg="$error950">
                  <Text color="$error600" $dark-color="$error400">{error}</Text>
                </Box>
              )}

              {/* Login button */}
              <Button
                size="lg"
                borderRadius="$lg"
                bg="$primary500"
                onPress={handleLogin}
                isDisabled={isLoading}
              >
                {isLoading ? (
                  <Text color="$white" fontWeight="$medium">Signing in...</Text>
                ) : (
                  <>
                    <Text color="$white" fontWeight="$medium">Sign In</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={{ marginLeft: 4 }}
                    />
                  </>
                )}
              </Button>

              {/* Register link */}
              <HStack space="xs" justifyContent="center">
                <Text>Don't have an account?</Text>
                <Pressable onPress={navigateToRegister}>
                  <Text color="$primary500" fontWeight="$medium">Sign Up</Text>
                </Pressable>
              </HStack>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
