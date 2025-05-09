import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorModeContext } from '../../contexts/color-mode-context';
import genreService from '../../services/genre-service';
import peopleService from '../../services/people-service';

export default function ExploreScreen() {
  const router = useRouter();
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';
  
  // Fetch popular genres
  const genresQuery = useQuery({
    queryKey: ['popularGenres'],
    queryFn: () => genreService.getPopularGenres(),
  });
  
  // Fetch popular people
  const peopleQuery = useQuery({
    queryKey: ['popularPeople'],
    queryFn: () => peopleService.getPopularPeople(),
  });
  
  // Handle refresh
  const handleRefresh = () => {
    genresQuery.refetch();
    peopleQuery.refetch();
  };
  
  // Navigate to genre screen
  const navigateToGenre = (genreId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/movie/genre/${genreId}`);
  };
  
  // Navigate to person screen
  const navigateToPerson = (personId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/movie/actor/${personId}`);
  };
  
  // Navigate to search screen
  const navigateToSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/search');
  };
  
  // Check if any query is loading for refresh control
  const isRefreshing = genresQuery.isLoading || peopleQuery.isLoading;
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Box p="$4">
          {/* Header */}
          <VStack space="md" mb="$6">
            <Heading size="2xl">Explore</Heading>
            <Text color="$textLight500" $dark-color="$textDark400">
              Discover movies by genre or find your favorite actors and directors
            </Text>
            
            {/* Search Button */}
            <Pressable 
              onPress={navigateToSearch}
              bg="$primary500"
              py="$3"
              borderRadius="$lg"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              mt="$2"
            >
              <Icon as={MaterialIcons} name="search" color="$white" size="md" mr="$2"/>
              <Text color="$white" fontWeight="$medium">Search Movies & People</Text>
            </Pressable>
          </VStack>

          {/* Popular People Section */}
          <VStack space="md" mb="$6">
            <Heading size="xl">Popular People</Heading>
            {peopleQuery.isLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="md" py="$2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <VStack key={index} alignItems="center" width="$24">
                      <Box
                        width="$20"
                        height="$20"
                        borderRadius="$full"
                        bg={isDark ? '$backgroundDark700' : '$backgroundLight200'}
                        justifyContent="center"
                        alignItems="center"
                        mb="$2"
                      />
                      <Box 
                        width="$16" 
                        height="$4" 
                        bg={isDark ? '$backgroundDark700' : '$backgroundLight200'}
                        borderRadius="$md"
                      />
                    </VStack>
                  ))}
                </HStack>
              </ScrollView>
            ) : peopleQuery.data && peopleQuery.data.length > 0 ? (
              <FlatList
                data={peopleQuery.data}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigateToPerson(String(item.actor.id))}
                    mx="$1"
                  >
                    <VStack alignItems="center">
                      <Box 
                        width={80} 
                        height={80} 
                        borderRadius="$full" 
                        overflow="hidden" 
                        mb="$2" 
                        bg={isDark ? '$backgroundDark800' : '$backgroundLight200'}
                        justifyContent="center" 
                        alignItems="center"
                      >
                        <Text 
                          color={isDark ? '$primary400' : '$primary500'} 
                          fontWeight="$bold" 
                          size="xl"
                        >
                          {item.actor.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </Box>
                      <Text fontWeight="$medium" textAlign="center" numberOfLines={2}>
                        {item.actor.name}
                      </Text>
                      <Text
                        size="xs"
                        color="$textLight500"
                        $dark-color="$textDark400"
                        textAlign="center"
                      >
                        {item.movieCount} movies
                      </Text>
                    </VStack>
                  </Pressable>
                )}
                keyExtractor={(item) => String(item.actor.id)}
              />
            ) : (
              <Box 
                py="$6" 
                alignItems="center" 
                justifyContent="center"
                borderRadius="$lg"
                bg="$backgroundLight50"
                borderColor="$borderLight200"
                borderWidth={1}
                $dark-bg="$backgroundDark900"
                $dark-borderColor="$borderDark800"
              >
                <Icon as={MaterialIcons} name="people" size="xl" color="$textLight400" $dark-color="$textDark500"/>
                <Text mt="$2" color="$textLight500" $dark-color="$textDark400">
                  No people available
                </Text>
              </Box>
            )}
          </VStack>
          
          {/* Genres Section */}
          <VStack space="md" mb="$6">
            <Heading size="xl">Top 5 Genres</Heading>
            {genresQuery.isLoading ? (
              <VStack space="sm">
                {[1, 2, 3, 4].map((_, index) => (
                  <Box 
                    key={index}
                    height="$16"
                    bg="$backgroundLight200"
                    $dark-bg="$backgroundDark700"
                    borderRadius="$lg"
                  />
                ))}
              </VStack>
            ) : genresQuery.data && genresQuery.data.length > 0 ? (
              <VStack space="sm">
                {genresQuery.data.map((item) => (
                  <Pressable 
                    key={item.genre.id}
                    onPress={() => navigateToGenre(String(item.genre.id))}
                  >
                    <Box
                      bg={isDark ? '$backgroundDark800' : '$white'}
                      borderRadius="$lg"
                      p="$4"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <VStack>
                        <Text fontWeight="$medium" size="lg">
                          {item.genre.name}
                        </Text>
                        <Text 
                          color={isDark ? '$textDark400' : '$textLight500'} 
                          size="sm"
                        >
                          {item.movieCount} {item.movieCount === 1 ? 'movie' : 'movies'}
                        </Text>
                      </VStack>
                      <MaterialIcons 
                        name="chevron-right" 
                        size={24} 
                        color={isDark ? '#a1a1aa' : '#a3a3a3'} 
                      />
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            ) : (
              <Box 
                py="$6" 
                alignItems="center" 
                justifyContent="center"
                borderRadius="$lg"
                bg="$backgroundLight50"
                borderColor="$borderLight200"
                borderWidth={1}
                $dark-bg="$backgroundDark900"
                $dark-borderColor="$borderDark800"
              >
                <Icon as={MaterialIcons} name="category" size="xl" color="$textLight400" $dark-color="$textDark500"/>
                <Text mt="$2" color="$textLight500" $dark-color="$textDark400">
                  No genres available
                </Text>
              </Box>
            )}
          </VStack>

        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}


