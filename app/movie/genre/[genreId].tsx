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
import { useGenre } from '../../../services/genre-service';
import { Movie, useMoviesByGenre } from '../../../services/movie-service';

export default function GenreMoviesScreen() {
  const router = useRouter();
  const { genreId } = useLocalSearchParams<{ genreId: string }>();
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';
  const [refreshing, setRefreshing] = useState(false);

  // Get genre details
  const genreQuery = useGenre(Number(genreId));
  const genre = genreQuery.data;
  
  // Get movies by genre
  const moviesQuery = useMoviesByGenre(Number(genreId));
  const movies: Movie[] = moviesQuery.data?.items || [];
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      genreQuery.refetch(),
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
            <Text size="sm" color={isDark ? '$textDark400' : '$textLight500'}>Genre</Text>
            <Heading size="lg" numberOfLines={1}>
              {genreQuery.isLoading ? 'Loading...' : genre?.name || 'Unknown Genre'}
            </Heading>
          </VStack>
        </HStack> */}

        {/* Content */}
        {moviesQuery.isLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color={isDark ? '$primary400' : '$primary500'} />
            <Text mt="$4" color={isDark ? '$textDark200' : '$textLight700'}>
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
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh} 
                tintColor={isDark ? '#fff' : '#000'}
                colors={['#0077FF']}
              />
            }
            ListHeaderComponent={
              <Box mb="$4">
                {genre && (
                  <VStack space="sm" mb="$4">
                    <Heading size="xl">{genre.name} Movies</Heading>
                    <Text color={isDark ? '$textDark400' : '$textLight500'}>
                      {movies.length} {movies.length === 1 ? 'movie' : 'movies'} found
                    </Text>
                    {genre.description && (
                      <Box
                        bg={isDark ? '$backgroundDark800' : '$white'}
                        borderRadius="$lg"
                        p="$4"
                        borderWidth={1}
                        borderColor={isDark ? '$borderDark700' : '$borderLight200'}
                        mt="$2"
                      >
                        <Text color={isDark ? '$textDark300' : '$textLight600'}>
                          {genre.description}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                )}
              </Box>
            }
          />
        ) : (
          <Box flex={1} p="$4" alignItems="center" justifyContent="center">
            <Icon 
              as={MaterialIcons}
              name="movie"
              size="2xl"
              color={isDark ? '$textDark600' : '$textLight300'} 
              mb="$4"
            />
            <Heading size="lg" mb="$2" textAlign="center" color={isDark ? '$textDark50' : '$textLight900'}>No Movies Found</Heading>
            <Text textAlign="center" color={isDark ? '$textDark300' : '$textLight500'}>
              There are no movies available in this genre.
            </Text>
          </Box>
        )}
    </Box>
  );
}
