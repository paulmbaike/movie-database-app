import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GluestackUIProvider, useColorMode } from '@gluestack-ui/themed';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import { config } from '../gluestack-ui.config';

// Define ColorMode type since it's not exported from gluestack
type ColorMode = 'light' | 'dark';

// Key for storing color mode in AsyncStorage
const COLOR_MODE_KEY = 'app_color_mode';
// Key for storing if we should follow system preference
const FOLLOW_SYSTEM_KEY = 'app_follow_system';

// Context interface
interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  followSystemColorScheme: boolean;
  setFollowSystemColorScheme: (value: boolean) => void;
  isDark: boolean;
}

// Create context
const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

// Provider component
export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as ColorSchemeName;
  
  // Manage our own color mode state
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [followSystemColorScheme, setFollowSystemScheme] = useState(true);
  const isDark = colorMode === 'dark';
  
  // Handle system color scheme changes
  useEffect(() => {
    if (followSystemColorScheme && systemColorScheme) {
      setColorMode(systemColorScheme as ColorMode);
    }
  }, [systemColorScheme, followSystemColorScheme]);
  
  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedMode, savedFollowSystem] = await Promise.all([
          AsyncStorage.getItem(COLOR_MODE_KEY),
          AsyncStorage.getItem(FOLLOW_SYSTEM_KEY)
        ]);
        
        // Set follow system preference
        if (savedFollowSystem !== null) {
          const followSystem = savedFollowSystem === 'true';
          setFollowSystemScheme(followSystem);
          
          // If following system, use system preference
          if (followSystem && systemColorScheme) {
            setColorMode(systemColorScheme as ColorMode);
            return;
          }
        }
        
        // Otherwise use saved mode if available
        if (savedMode === 'dark' || savedMode === 'light') {
          setColorMode(savedMode as ColorMode);
        }
      } catch (error) {
        console.error('Failed to load color mode preferences:', error);
      }
    };
    
    loadPreferences();
    
    // Set up listener for system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (followSystemColorScheme && colorScheme) {
        setColorMode(colorScheme as ColorMode);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Toggle color mode function
  const toggleColorMode = async () => {
    // Only manually toggle if not following system
    if (!followSystemColorScheme) {
      const newMode = colorMode === 'light' ? 'dark' : 'light';
      setColorMode(newMode);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem(COLOR_MODE_KEY, newMode);
      } catch (error) {
        console.error('Failed to save color mode:', error);
      }
    }
  };
  
  // Set follow system preference
  const setFollowSystemColorScheme = async (value: boolean) => {
    setFollowSystemScheme(value);
    
    try {
      await AsyncStorage.setItem(FOLLOW_SYSTEM_KEY, value.toString());
      
      // If enabling follow system, immediately use system preference
      if (value && systemColorScheme) {
        setColorMode(systemColorScheme as ColorMode);
      }
    } catch (error) {
      console.error('Failed to save follow system preference:', error);
    }
  };
  
  // Context value
  const value: ColorModeContextType = {
    colorMode,
    toggleColorMode,
    followSystemColorScheme,
    setFollowSystemColorScheme,
    isDark,
  };
  
  return (
    <ColorModeContext.Provider value={value}>
      <GluestackUIProvider config={config} colorMode={colorMode}>
        {children}
      </GluestackUIProvider>
    </ColorModeContext.Provider>
  );
};

// Custom hook for using color mode context
export const useColorModeContext = (): ColorModeContextType => {
  const context = useContext(ColorModeContext);
  
  if (context === undefined) {
    throw new Error('useColorModeContext must be used within a ColorModeProvider');
  }
  
  return context;
};
