import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  FlatList,
  Heading,
  Icon,
  Spinner,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import MovieCard from '../../../components/movie/movie-card';
import { useColorModeContext } from '../../../contexts/color-mode-context';
import { useActor } from '../../../services/actor-service';
import { Movie, useMoviesByActor } from '../../../services/movie-service';

export default function ActorMoviesScreen() {
  const router = useRouter();
  const { actorId } = useLocalSearchParams<{ actorId: string }>();
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  // Get actor details
  const actorQuery = useActor(Number(actorId));
  const actor = actorQuery.data;
  
  // Get movies by actor
  const moviesQuery = useMoviesByActor(Number(actorId));
  const movies: Movie[] = moviesQuery.data?.items || [];
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      actorQuery.refetch(),
      moviesQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  // Go back handler
  const handleGoBack = () => {
    router.back();
  };

  // Navigate to movie details
  const navigateToMovie = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };
  
  return (
    <Box flex={1} bg={isDark ? '$backgroundDark950' : '$backgroundLight50'}>
        {/* Header */}
        {/* <HStack 
          alignItems="center" 
          space="md" 
          p="$4"
          bg={isDark ? '$backgroundDark900' : '$white'}
          borderBottomWidth={1}
          borderBottomColor={isDark ? '$borderDark800' : '$borderLight200'}
        >
          <Pressable 
            onPress={handleGoBack}
            p="$2"
            borderRadius="$full"
          >
            <Icon 
              as={MaterialIcons}
              size="xl" 
              color={isDark ? '$textDark200' : '$textLight800'} 
            >
              <MaterialIcons name="arrow-back" />
            </Icon>
          </Pressable>
          <VStack flex={1}>
            <Text size="sm" color={isDark ? '$textDark400' : '$textLight500'}>Actor</Text>
            <Heading size="lg" numberOfLines={1}>
              {actorQuery.isLoading ? 'Loading...' : actor?.name || 'Unknown Actor'}
            </Heading>
          </VStack>
        </HStack> */}

        {/* Content */}
        {moviesQuery.isLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" />
            <Text mt="$4" color={isDark ? '$textDark400' : '$textLight500'}>
              Loading movies...
            </Text>
          </Box>
        ) : movies.length > 0 ? (
          <FlatList
            data={movies}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 16
            }}
            columnWrapperStyle={{
              marginBottom: 16
            }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Box width="48%" mx="1%">
                <MovieCard movie={item as Movie} onPress={() => navigateToMovie((item as Movie).id)} />
              </Box>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListHeaderComponent={
              <Box mb="$4">
                {actor && (
                  <VStack space="sm" mb="$4">
                    <Heading size="xl">{actor.name} Movies</Heading>
                    <Text color={isDark ? '$textDark400' : '$textLight500'}>
                      {movies.length} {movies.length === 1 ? 'movie' : 'movies'} found
                    </Text>
                  </VStack>
                )}
              </Box>
            }
          />
        ) : (
          <Box flex={1} p="$4" alignItems="center" justifyContent="center">
            <Icon 
              as={MaterialIcons}
              size="2xl"
              color={isDark ? '$textDark700' : '$textLight300'} 
              mb="$4"
            >
              <MaterialIcons name="movie" size={48} />
            </Icon>
            <Heading size="lg" mb="$2" textAlign="center">No Movies Found</Heading>
            <Text textAlign="center" color={isDark ? '$textDark400' : '$textLight500'}>
              There are no movies available for this actor.
            </Text>
          </Box>
        )}
    </Box>
  );
}
