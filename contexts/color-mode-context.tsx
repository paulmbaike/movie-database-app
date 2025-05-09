import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define ColorMode type since it's not exported from gluestack
type ColorMode = 'light' | 'dark';

// Key for storing color mode in AsyncStorage
const COLOR_MODE_KEY = 'app_color_mode';

// Context interface
interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

// Create context
const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

// Provider component
export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
  // Load saved color mode on mount
  useEffect(() => {
    const loadColorMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(COLOR_MODE_KEY);
        if (savedMode === 'dark' || savedMode === 'light') {
          setColorMode(savedMode as ColorMode);
        }
      } catch (error) {
        console.error('Failed to load color mode:', error);
      }
    };
    
    loadColorMode();
  }, []);
  
  // Toggle color mode function
  const toggleColorMode = async () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(COLOR_MODE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save color mode:', error);
    }
  };
  
  // Context value
  const value: ColorModeContextType = {
    colorMode,
    toggleColorMode,
  };
  
  return (
    <ColorModeContext.Provider value={value}>
      {children}
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
