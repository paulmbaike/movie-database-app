import { MaterialIcons } from '@expo/vector-icons';
import {
  Alert,
  AlertIcon,
  AlertText,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  Icon,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { API_ENDPOINTS } from '../../constants/api';
import { useColorModeContext } from '../../contexts/color-mode-context';
import apiClient from '../../services/api-client';

// Define validation schema
const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';
  
  // State to prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  // UI state
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Update form data
  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setFormErrors({});
  };
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => 
      apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      // Reset submission state
      setIsSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessMessage('Password changed successfully');
      setErrorMessage(null);
      resetForm();
      
      // Navigate back to profile after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(error.response?.data?.message || 'Failed to change password');
      setSuccessMessage(null);
    },
  });
  
  // Validate form using Zod and return true if valid
  const validateForm = (): boolean => {
    try {
      passwordSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof PasswordFormData;
          errors[path] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    
    if (validateForm()) {
      try {
        // Set submitting state to prevent duplicate calls
        setIsSubmitting(true);
        
        // Use mutateAsync which returns a promise
        await changePasswordMutation.mutateAsync(formData);
        // Success handling is in onSuccess callback
      } catch (error) {
        // Error handling is in onError callback
        console.error('Error changing password:', error);
        // Reset submitting state on error
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} p="$4">
          <VStack space="xl">
            {/* Header */}
            <VStack space="md">
              <Heading size="xl">Change Password</Heading>
              <Text color={isDark ? '$textDark400' : '$textLight500'}>
                Update your password to keep your account secure
              </Text>
            </VStack>
            
            {/* Error Message */}
            {errorMessage && (
              <Alert action="error">
                <AlertIcon as={MaterialIcons} name="error-outline" />
                <AlertText>{errorMessage}</AlertText>
              </Alert>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <Alert action="success">
                <AlertIcon as={MaterialIcons} name="check-circle-outline" />
                <AlertText>{successMessage}</AlertText>
              </Alert>
            )}
            
            {/* Password Form */}
            <VStack space="md">
              {/* Old Password */}
              <FormControl isInvalid={!!formErrors.oldPassword} isRequired>
                <FormControlLabel>
                  <FormControlLabelText>Old Password</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={formData.oldPassword}
                    onChangeText={(value) => handleChange('oldPassword', value)}
                    autoCapitalize="none"
                  />
                  <InputSlot onPress={() => setShowOldPassword(!showOldPassword)}>
                    <InputIcon as={MaterialIcons} name={showOldPassword ? "visibility" : "visibility-off"} />
                  </InputSlot>
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={MaterialIcons} name="error-outline" />
                  <FormControlErrorText>{formErrors.oldPassword}</FormControlErrorText>
                </FormControlError>
              </FormControl>
              
              {/* New Password */}
              <FormControl isInvalid={!!formErrors.newPassword} isRequired>
                <FormControlLabel>
                  <FormControlLabelText>New Password</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChangeText={(value) => handleChange('newPassword', value)}
                    autoCapitalize="none"
                  />
                  <InputSlot onPress={() => setShowNewPassword(!showNewPassword)}>
                    <InputIcon as={MaterialIcons} name={showNewPassword ? "visibility" : "visibility-off"} />
                  </InputSlot>
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={MaterialIcons} name="error-outline" />
                  <FormControlErrorText>{formErrors.newPassword}</FormControlErrorText>
                </FormControlError>
              </FormControl>
              
              {/* Confirm Password */}
              <FormControl isInvalid={!!formErrors.confirmPassword} isRequired>
                <FormControlLabel>
                  <FormControlLabelText>Confirm Password</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    autoCapitalize="none"
                  />
                  <InputSlot onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <InputIcon as={MaterialIcons} name={showConfirmPassword ? "visibility" : "visibility-off"} />
                  </InputSlot>
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={MaterialIcons} name="error-outline" />
                  <FormControlErrorText>{formErrors.confirmPassword}</FormControlErrorText>
                </FormControlError>
              </FormControl>
            </VStack>
            
            {/* Submit Button */}
            <Button
              size="lg"
              onPress={handleSubmit}
              isDisabled={isSubmitting || changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <Spinner color="$white" />
              ) : (
                <ButtonText>Change Password</ButtonText>
              )}
            </Button>
            
            {/* Cancel Button */}
            <Button
              variant="outline"
              size="lg"
              onPress={() => router.back()}
              isDisabled={isSubmitting || changePasswordMutation.isPending}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </VStack>
      </Box>
    </SafeAreaView>
  );
}
