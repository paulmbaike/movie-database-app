import { config as defaultConfig } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-ui/themed';

export const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      // Custom colors for our movie database app
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
      
      // Neutral colors
      dark50: '#E5E5E5',
      dark100: '#CCCCCC',
      dark200: '#999999',
      dark300: '#666666',
      dark400: '#333333',
      dark500: '#1A1A1A', // Main dark color for text
      dark600: '#141414',
      dark700: '#0F0F0F',
      dark800: '#0A0A0A',
      dark900: '#050505',
    },
  },
  components: {
    ...defaultConfig.components,
    // Customize components as needed
    Button: {
      theme: {
        ...defaultConfig.components.Button.theme,
        borderRadius: '$md',
      },
    },
    Card: {
      theme: {
        ...defaultConfig.components.Card.theme,
        borderRadius: '$lg',
        shadowColor: '$dark900',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
    },
  },
});

type ConfigType = typeof config;

declare module '@gluestack-ui/themed' {
  interface UIConfig extends ConfigType {}
}
