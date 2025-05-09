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
  Icon,
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

// Define registration form schema with Zod
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, isLoading, clearError } = useAuth();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Form state
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input change
  const handleChange = (field: keyof RegisterForm, value: string) => {
    // Clear auth error when user starts typing
    if (error) clearError();
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    // Prevent duplicate submissions
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Clear any previous errors
      setFormErrors({});
      
      // Validate form
      registerSchema.parse(form);
      
      // Call register function from auth context and wait for result
      const registerSuccess = await register(form.username, form.email, form.password);
      
      // If registration was successful, redirect to home
      if (registerSuccess) {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof RegisterForm] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        // Handle API errors (displayed via the error state from context)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Navigate to login screen
  const navigateToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
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
                Sign up to start your movie journey
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

              {/* Email input */}
              <FormControl isInvalid={!!formErrors.email}>
                <Input
                  size="lg"
                  borderRadius="$lg"
                  borderWidth={2}
                  borderColor={isDark ? '$borderDark700' : '$borderLight300'}
                  $invalid-borderColor="$error600"
                >
                  <InputField
                    placeholder="Email"
                    value={form.email}
                    onChangeText={(value) => handleChange('email', value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>{formErrors.email}</FormControlErrorText>
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
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => togglePasswordVisibility('password')} p="$2">
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

              {/* Confirm Password input */}
              <FormControl isInvalid={!!formErrors.confirmPassword}>
                <Input
                  size="lg"
                  borderRadius="$lg"
                  borderWidth={2}
                  borderColor={isDark ? '$borderDark700' : '$borderLight300'}
                  $invalid-borderColor="$error600"
                >
                  <InputField
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => togglePasswordVisibility('confirmPassword')} p="$2">
                    <Icon
                      as={MaterialIcons}
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size="sm"
                      color="$textLight400"
                      $dark-color="$textDark500"
                    />
                  </Pressable>
                </Input>
                <FormControlError>
                  <FormControlErrorText>{formErrors.confirmPassword}</FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Auth error message */}
              {error && (
                <Box bg="$error100" p="$3" borderRadius="$md" $dark-bg="$error950">
                  <Text color="$error600" $dark-color="$error400">{error}</Text>
                </Box>
              )}

              {/* Register button */}
              <Button
                size="lg"
                borderRadius="$lg"
                bg="$primary500"
                onPress={handleRegister}
                isDisabled={isLoading}
              >
                {isLoading ? (
                  <Text color="$white" fontWeight="$medium">Creating account...</Text>
                ) : (
                  <HStack space="xs" alignItems="center">
                    <Text color="$white" fontWeight="$medium">Create Account</Text>
                    <Icon 
                      as={MaterialIcons}
                      name="arrow-forward"
                      size="sm"
                      color="$white"
                    />
                  </HStack>
                )}
              </Button>

              {/* Login link */}
              <HStack space="xs" justifyContent="center">
                <Text>Already have an account?</Text>
                <Pressable onPress={navigateToLogin}>
                  <Text color="$primary500" fontWeight="$medium">Sign In</Text>
                </Pressable>
              </HStack>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
