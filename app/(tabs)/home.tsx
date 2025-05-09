import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Platform, Pressable, RefreshControl, StyleSheet } from 'react-native';

import movieService, { Movie, MovieResponse } from '@/services/movie-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorModeContext } from '../../contexts/color-mode-context';

export default function HomeScreen() {
  const router = useRouter();
  const { colorMode } = useColorModeContext();
  const isDark = colorMode === 'dark';
  
  // Calculate dimensions for the grid
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 2;
  const spacing = 12;
  const cardWidth = (screenWidth - (spacing * (numColumns + 1))) / numColumns;
  
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<MovieResponse, Error>({
    queryKey: ['movies', page],
    queryFn: () => movieService.getMovies(page, limit),
  });
  
  // Keep track of all loaded movies to prevent flickering during pagination
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  
  // Helper function to check if we have movies data
  const hasMovies = (): boolean => {
    return allMovies.length > 0 || (!!data && Array.isArray(data.items) && data.items.length > 0);
  };
  
  // Update allMovies when data changes
  React.useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        // Reset movies on first page
        setAllMovies(data.items);
      } else {
        // Append new movies for pagination
        setAllMovies(prev => [...prev, ...data.items]);
      }
    }
  }, [data, page]);


  const handleRefresh = () => {
    setPage(1);
    setAllMovies([]);
    refetch();
  };

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = () => {
    if (data?.hasNext && !isLoadingMore && !isFetching) {
      setIsLoadingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  React.useEffect(() => {
    if (!isFetching) {
      setIsLoadingMore(false);
    }
  }, [isFetching]);

  const navigateToMovieDetail = (movieId: number) => {
    router.push(`/movie/${movieId.toString()}`);
  };

  const navigateToCreateMovie = () => {
    router.push('/movie/create');
  };

  const renderMovieItem = ({ item, index }: { item: Movie; index: number }) => {
    // Calculate margin based on position in grid
    const marginLeft = index % numColumns === 0 ? spacing : spacing / 2;
    const marginRight = index % numColumns === numColumns - 1 ? spacing : spacing / 2;
    
    return (
      <Pressable
        onPress={() => navigateToMovieDetail(item.id)}
        style={({ pressed }) => [{
          width: cardWidth,
          marginLeft,
          marginRight,
          marginBottom: spacing,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
            },
            android: {
              elevation: 4,
            },
          }),
        }]}
      >
        <Box 
          borderRadius="$xl" 
          overflow="hidden"
          bg={isDark ? '$backgroundDark800' : '$white'}
        >
          {/* Poster */}
          <Box width="100%" height={180} position="relative">
            {item.posterUrl ? (
              <Image
                source={{ uri: item.posterUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Box
                width="100%"
                height="100%"
                bg={isDark ? '$backgroundDark700' : '$backgroundLight200'}
                justifyContent="center"
                alignItems="center"
              >
                <MaterialIcons name="movie" size={42} color={isDark ? '#666' : '#999'} />
              </Box>
            )}
            
            {/* Release year badge */}
            <Box
              position="absolute"
              top={8}
              right={8}
              bg="rgba(0,0,0,0.6)"
              px="$2"
              py="$1"
              borderRadius="$md"
            >
              <Text color="$white" fontWeight="$bold" size="xs">
                {item.releaseYear}
              </Text>
            </Box>
          </Box>
          
          {/* Content */}
          <VStack p="$3" space="xs">
            <Heading size="sm" numberOfLines={1}>
              {item.title}
            </Heading>
            
            <Text 
              size="xs" 
              numberOfLines={1} 
              color={isDark ? '$textDark300' : '$textLight600'}
            >
              {item.genres?.join(', ') || 'No genres'}
            </Text>
          </VStack>
        </Box>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg={isDark ? '$backgroundDark900' : '$backgroundLight100'}>
        {/* Header */}
        <VStack space="xs" p="$4" pb="$2">
          <HStack justifyContent="space-between" alignItems="center" mb="$2">
            <Heading size="2xl">Movies</Heading>
            <HStack space="sm">
              <Button
                size="sm"
                variant="outline"
                borderRadius="$full"
                onPress={handleRefresh}
                isDisabled={isLoading || isFetching}
              >
                <MaterialIcons name="refresh" size={18} color={isDark ? '#e4e4e7' : '#27272a'} />
              </Button>
              <Button
                size="sm"
                variant="solid"
                borderRadius="$full"
                bgColor="$primary500"
                onPress={navigateToCreateMovie}
              >
                <MaterialIcons name="add" size={18} color="white" />
              </Button>
            </HStack>
          </HStack>
          <Text color="$textLight500" $dark-color="$textDark400">
            Manage your movie collection
          </Text>
        </VStack>

        {/* Only show full-screen loading on first page load with no data */}
        {isLoading && page === 1 && !hasMovies() ? (
          <Box flex={1} m="$4" justifyContent="center" alignItems="center">
            <Spinner size="large" />
            <Text mt="$2">Loading movies...</Text>
          </Box>
        ) : (
          <FlatList
            data={allMovies}
            renderItem={({ item, index }) => renderMovieItem({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing }}
            numColumns={numColumns}
            key={`grid-${numColumns}`} // Force re-render when columns change
            columnWrapperStyle={{
              justifyContent: 'flex-start',
            }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={handleRefresh}
                tintColor={isDark ? '#fff' : '#000'}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              <Box py="$2" alignItems="center">
                {/* Show loading indicator during pagination */}
                {isFetching && (
                  <HStack space="sm" alignItems="center" bg={isDark ? '$backgroundDark800' : '$backgroundLight100'} px="$3" py="$2" borderRadius="$full">
                    <Spinner size="small" color={isDark ? '$primary400' : '$primary500'} />
                    <Text size="xs" color={isDark ? '$textDark400' : '$textLight500'}>Loading more movies...</Text>
                  </HStack>
                )}
                {/* Show message when no more content */}
                {!isFetching && !data?.hasNext && hasMovies() && (
                  <Text size="xs" color={isDark ? '$textDark400' : '$textLight500'}>End of movies list</Text>
                )}
                {/* Show message when more content is available */}
                {/* {!isFetching && data?.hasNext && (
                  <Text size="xs" color={isDark ? '$textDark400' : '$textLight500'}>Scroll to load more movies</Text>
                )} */}
              </Box>
            }
            ListEmptyComponent={
              // Only show empty component if we're not loading and truly have no data
              !isFetching && page === 1 ? (
                <Box flex={1} justifyContent="center" alignItems="center" py="$8">
                  <MaterialIcons name="movie-filter" size={48} color={isDark ? '#666' : '#999'} />
                  <Text mt="$2">No movies found</Text>
                  <Button mt="$4" onPress={() => refetch()}>
                    <ButtonText>Refresh</ButtonText>
                  </Button>
                </Box>
              ) : null
            }
          />
        )}
        {isError && (
          <Box py="$4" alignItems="center">
            <MaterialIcons name="error-outline" size={24} color="#FF5252" />
            <Text size="sm" mt="$2" color={isDark ? '$textDark400' : '$textLight500'}>
              {(error as Error)?.message || 'Failed to load more movies'}
            </Text>
            <Button size="sm" mt="$2" onPress={() => refetch()}>
              <ButtonText>Retry</ButtonText>
            </Button>
          </Box>
        )}

        {/* FAB removed in favor of header buttons */}
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  posterContainer: {
    width: 80,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  posterPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
