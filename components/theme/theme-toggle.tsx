import React, { useCallback } from 'react';
import { 
  Box, 
  HStack, 
  Switch, 
  Text, 
  VStack,
  useColorMode
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorModeContext } from '../../contexts/color-mode-context';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true }) => {
  // We don't need to use gluestack's useColorMode hook directly since we have enhanced context
  const { isDark, toggleColorMode, followSystemColorScheme, setFollowSystemColorScheme } = useColorModeContext();

  const handleThemeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleColorMode();
  }, [toggleColorMode]);

  const handleSystemToggle = useCallback((value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowSystemColorScheme(value);
  }, [setFollowSystemColorScheme]);

  return (
    <VStack space="md">
      <HStack alignItems="center" space="md">
        <MaterialIcons 
          name={isDark ? "nightlight" : "wb-sunny"} 
          size={24} 
          color={isDark ? "#EFEFEF" : "#333333"} 
        />
        <Text 
          flex={1} 
          color={isDark ? "$textDark100" : "$textLight900"}
        >
          {showLabel && (isDark ? "Dark Mode" : "Light Mode")}
        </Text>
        <Switch
          size="md"
          value={isDark}
          onToggle={handleThemeToggle}
          disabled={followSystemColorScheme}
          trackColor={{
            false: "$backgroundLight200",
            true: "$primary600"
          }}
        />
      </HStack>
      
      <HStack alignItems="center" space="md">
        <MaterialIcons 
          name="settings-system-daydream" 
          size={24} 
          color={isDark ? "#EFEFEF" : "#333333"} 
        />
        <Text 
          flex={1} 
          color={isDark ? "$textDark100" : "$textLight900"}
        >
          {showLabel && "Use System Settings"}
        </Text>
        <Switch
          size="md"
          value={followSystemColorScheme}
          onToggle={handleSystemToggle}
          trackColor={{
            false: "$backgroundLight200",
            true: "$primary600"
          }}
        />
      </HStack>
    </VStack>
  );
};

export default ThemeToggle;
