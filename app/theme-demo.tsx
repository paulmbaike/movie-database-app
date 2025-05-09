import React from 'react';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  ScrollView,
  Text,
  VStack,
  Badge,
  BadgeText,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorMode,
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '../components/theme';
import { useColorModeContext } from '../contexts/color-mode-context';
import { Stack } from 'expo-router';

export default function ThemeDemoScreen() {
  const { colorMode } = useColorMode();
  const { isDark } = useColorModeContext();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Theme Demo',
          headerStyle: {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          },
          headerTintColor: isDark ? '#ffffff' : '#000000',
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView 
        style={{ flex: 1 }} 
        edges={['bottom', 'left', 'right']}
      >
        <ScrollView 
          bg={isDark ? '$backgroundDark900' : '$backgroundLight50'}
          contentContainerStyle={{ padding: 16 }}
        >
          <VStack space="xl">
            {/* Theme Toggle */}
            <Card>
              <CardHeader>
                <Heading size="md">Theme Settings</Heading>
              </CardHeader>
              <CardBody>
                <ThemeToggle />
              </CardBody>
            </Card>
            
            <Divider />
            
            {/* Typography Demo */}
            <Box>
              <Heading size="lg" mb="$2">Typography</Heading>
              <VStack space="md">
                <Heading size="xl">Heading XL</Heading>
                <Heading size="lg">Heading LG</Heading>
                <Heading size="md">Heading MD</Heading>
                <Heading size="sm">Heading SM</Heading>
                <Text fontSize="$xl">Text XL</Text>
                <Text fontSize="$lg">Text LG</Text>
                <Text fontSize="$md">Text MD</Text>
                <Text fontSize="$sm">Text SM</Text>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Input Components */}
            <Box>
              <Heading size="lg" mb="$2">Input Components</Heading>
              <VStack space="md">
                <Input>
                  <InputField placeholder="Regular input" />
                </Input>
                
                <Input isDisabled>
                  <InputField placeholder="Disabled input" />
                </Input>
                
                <Input isInvalid>
                  <InputField placeholder="Invalid input" />
                </Input>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Buttons */}
            <Box>
              <Heading size="lg" mb="$2">Buttons</Heading>
              <VStack space="md">
                <HStack space="md">
                  <Button>
                    <ButtonText>Primary</ButtonText>
                  </Button>
                  
                  <Button variant="outline">
                    <ButtonText>Outline</ButtonText>
                  </Button>
                  
                  <Button variant="link">
                    <ButtonText>Link</ButtonText>
                  </Button>
                </HStack>
                
                <HStack space="md">
                  <Button action="positive">
                    <ButtonText>Success</ButtonText>
                  </Button>
                  
                  <Button action="negative">
                    <ButtonText>Error</ButtonText>
                  </Button>
                  
                  <Button action="warning">
                    <ButtonText>Warning</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Cards */}
            <Box>
              <Heading size="lg" mb="$2">Cards</Heading>
              <Card mb="$4">
                <CardHeader>
                  <Heading size="md">Card Title</Heading>
                </CardHeader>
                <CardBody>
                  <Text>This is a simple card component with header, body, and footer. It has proper styling for both light and dark mode.</Text>
                </CardBody>
                <CardFooter>
                  <HStack space="md">
                    <Button size="sm" variant="outline">
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button size="sm">
                      <ButtonText>OK</ButtonText>
                    </Button>
                  </HStack>
                </CardFooter>
              </Card>
            </Box>
            
            <Divider />
            
            {/* Badges */}
            <Box>
              <Heading size="lg" mb="$2">Badges</Heading>
              <HStack space="sm" flexWrap="wrap">
                <Badge>
                  <BadgeText>Default</BadgeText>
                </Badge>
                
                <Badge action="error">
                  <BadgeText>Error</BadgeText>
                </Badge>
                
                <Badge action="warning">
                  <BadgeText>Warning</BadgeText>
                </Badge>
                
                <Badge action="success">
                  <BadgeText>Success</BadgeText>
                </Badge>
                
                <Badge action="info">
                  <BadgeText>Info</BadgeText>
                </Badge>
                
                <Badge action="muted">
                  <BadgeText>Muted</BadgeText>
                </Badge>
              </HStack>
            </Box>
            
            <Divider />
            
            {/* Icons */}
            <Box>
              <Heading size="lg" mb="$2">Icons</Heading>
              <HStack space="md" flexWrap="wrap">
                <Box alignItems="center">
                  <MaterialIcons 
                    name="movie" 
                    size={24} 
                    color={isDark ? "#EFEFEF" : "#333333"} 
                  />
                  <Text fontSize="$xs" mt="$1">Movie</Text>
                </Box>
                
                <Box alignItems="center">
                  <MaterialIcons 
                    name="person" 
                    size={24} 
                    color={isDark ? "#EFEFEF" : "#333333"} 
                  />
                  <Text fontSize="$xs" mt="$1">Person</Text>
                </Box>
                
                <Box alignItems="center">
                  <MaterialIcons 
                    name="category" 
                    size={24} 
                    color={isDark ? "#EFEFEF" : "#333333"} 
                  />
                  <Text fontSize="$xs" mt="$1">Category</Text>
                </Box>
                
                <Box alignItems="center">
                  <MaterialIcons 
                    name="star" 
                    size={24} 
                    color={isDark ? "#EFEFEF" : "#333333"} 
                  />
                  <Text fontSize="$xs" mt="$1">Star</Text>
                </Box>
                
                <Box alignItems="center">
                  <MaterialIcons 
                    name="search" 
                    size={24} 
                    color={isDark ? "#EFEFEF" : "#333333"} 
                  />
                  <Text fontSize="$xs" mt="$1">Search</Text>
                </Box>
              </HStack>
            </Box>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
