import { config as defaultConfig } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-ui/themed';

// Semantic color tokens for our movie database app
export const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      // Primary colors
      primary50: '#E6F1FF',
      primary100: '#CCE4FF',
      primary200: '#99C9FF',
      primary300: '#66ADFF',
      primary400: '#3392FF',
      primary500: '#0077FF', // Main primary color
      primary600: '#005FCC',
      primary700: '#004799',
      primary800: '#003066',
      primary900: '#001833',
      
      // Secondary color (for accents)
      secondary50: '#FFF2E6',
      secondary100: '#FFE5CC',
      secondary200: '#FFCB99',
      secondary300: '#FFB166',
      secondary400: '#FF9733',
      secondary500: '#FF7D00', // Main secondary color
      secondary600: '#CC6400',
      secondary700: '#994B00',
      secondary800: '#663200',
      secondary900: '#331900',
      
      // Dark mode background gradient colors
      backgroundDark950: '#121212', // Darkest background
      backgroundDark900: '#1a1a1a', // Main dark background
      backgroundDark800: '#282828', // Secondary dark background
      backgroundDark700: '#333333', // Tertiary dark background
      
      // Light mode background colors
      backgroundLight50: '#FFFFFF', // Main light background
      backgroundLight100: '#F5F5F5', // Secondary light background
      backgroundLight200: '#EEEEEE', // Tertiary light background
      
      // Semantic text colors
      textDark50: '#FFFFFF',  // Bright white text for dark backgrounds
      textDark100: '#EFEFEF', // Primary text on dark background
      textDark200: '#CCCCCC', // Secondary text on dark background
      textDark300: '#AAAAAA', // Tertiary text on dark background
      textDark400: '#888888', // Disabled text on dark background
      
      textLight900: '#000000', // Primary text on light background
      textLight800: '#333333', // Secondary text on light background
      textLight700: '#666666', // Tertiary text on light background
      textLight500: '#999999', // Disabled text on light background
      
      // Border colors
      borderDark900: '#333333', // Primary border on dark background
      borderDark800: '#444444', // Secondary border on dark background
      borderDark700: '#555555', // Input border on dark background
      
      borderLight300: '#E0E0E0', // Primary border on light background
      borderLight200: '#EEEEEE', // Secondary border on light background
      borderLight100: '#F5F5F5', // Input border on light background
      
      // Status colors with dark mode versions
      error600: '#D32F2F',
      error500: '#F44336',
      error100: '#FFEBEE',
      errorDark600: '#CF6679',
      
      success600: '#2E7D32',
      success500: '#4CAF50',
      success100: '#E8F5E9',
      successDark600: '#00C853',
      
      warning600: '#F57C00',
      warning500: '#FF9800',
      warning100: '#FFF3E0',
      warningDark600: '#FFB74D',
      
      info600: '#0288D1',
      info500: '#03A9F4',
      info100: '#E1F5FE',
      infoDark600: '#4FC3F7',
    },
  },
  components: {
    ...defaultConfig.components,
    // Enhanced component styling for consistent dark mode support
    Button: {
      theme: {
        ...defaultConfig.components.Button.theme,
        borderRadius: '$md',
        // Add dark mode specific styling
        _dark: {
          bg: '$primary600',
          borderColor: '$primary700',
        },
      },
    },
    Card: {
      theme: {
        ...defaultConfig.components.Card.theme,
        borderRadius: '$lg',
        bg: '$backgroundLight50',
        borderColor: '$borderLight300',
        shadowColor: '$textLight700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
        // Add dark mode specific styling
        _dark: {
          bg: '$backgroundDark800',
          borderColor: '$borderDark800',
          shadowColor: '$textDark300',
        },
      },
    },
    Text: {
      theme: {
        ...defaultConfig.components.Text.theme,
        color: '$textLight900',
        // Add dark mode specific styling
        _dark: {
          color: '$textDark100',
        },
      },
    },
    Heading: {
      theme: {
        ...defaultConfig.components.Heading.theme,
        color: '$textLight900',
        // Add dark mode specific styling
        _dark: {
          color: '$textDark50',
        },
      },
    },
    Input: {
      theme: {
        ...defaultConfig.components.Input.theme,
        borderColor: '$borderLight300',
        bg: '$backgroundLight50',
        // Add dark mode specific styling
        _dark: {
          borderColor: '$borderDark700',
          bg: '$backgroundDark800',
          color: '$textDark100',
          placeholderTextColor: '$textDark400',
        },
      },
    },
    FormControl: {
      theme: {
        ...defaultConfig.components.FormControl.theme,
        _errorText: {
          color: '$error600',
          _dark: {
            color: '$errorDark600',
          },
        },
      },
    },
    Box: {
      theme: {
        ...defaultConfig.components.Box.theme,
        _dark: {
          bg: '$backgroundDark900',
          borderColor: '$borderDark800',
        },
      },
    },
    Modal: {
      theme: {
        ...defaultConfig.components.Modal.theme,
      },
    },
    ModalBackdrop: {
      theme: {
        ...defaultConfig.components.ModalBackdrop.theme,
        bg: '$backgroundLight900:alpha.85',
        _dark: {
          bg: '$backgroundDark950:alpha.90',
        },
      },
    },
    // Other components can be added here with dark mode support
  },
});

type ConfigType = typeof config;

declare module '@gluestack-ui/themed' {
  interface UIConfig extends ConfigType {}
}
