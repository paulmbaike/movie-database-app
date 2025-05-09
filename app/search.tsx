import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import MovieCard from '../components/movie/movie-card';
import genreService from '../services/genre-service';
import movieService, { MovieSearchParams } from '../services/movie-service';

// Define search params schema
const searchParamsSchema = z.object({
  searchTerm: z.string().optional(),
  genreIds: z.array(z.number()).optional(),
  releaseYear: z.number().optional(),
  sortBy: z.enum(['title', 'releaseDate', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    searchTerm: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'releaseDate',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Fetch genres for filters
  const genresQuery = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreService.getGenres(1, 100),
  });
  
  // Track if user has initiated a search
  const [hasSearched, setHasSearched] = useState(false);
  
  // Track when Apply button is clicked
  const [applyClicked, setApplyClicked] = useState(false);
  
  // Search movies query
  const searchMoviesQuery = useQuery({
    queryKey: ['searchMovies', searchParams],
    queryFn: () => movieService.searchMovies(searchParams as MovieSearchParams),
    enabled: hasSearched && (!!searchParams.searchTerm || selectedGenres.length > 0 || !!selectedYear || applyClicked),
  });
  
  // Handle search submit
  const handleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    
    setSearchParams(prev => ({
      ...prev,
      searchTerm: searchQuery,
      pageNumber: 1, // Reset to first page on new search
    }));
    
    setHasSearched(true);
  };
  
  // Apply filters
  const applyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSearchParams(prev => ({
      ...prev,
      genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
      releaseYear: selectedYear || undefined,
      pageNumber: 1, // Reset to first page when filters change
    }));
    
    // Set apply clicked to true to force a search
    setApplyClicked(true);
    setShowFilters(false);
    setHasSearched(true);
    
    // Reset apply clicked after a short delay
    setTimeout(() => {
      setApplyClicked(false);
    }, 500);
  };
  
  // Reset filters
  const resetFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedGenres([]);
    setSelectedYear(null);
    
    // Apply the reset filters
    setSearchParams(prev => ({
      ...prev,
      genreIds: undefined,
      releaseYear: undefined,
      pageNumber: 1,
    }));
    
    setHasSearched(true);
    setShowFilters(false);
  };
  
  // Toggle genre selection - only updates local state, doesn't trigger search
  const toggleGenre = (genreId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    // No search is triggered here
  };
  
  // Handle year selection - only updates local state, doesn't trigger search
  const handleYearSelect = (year: number | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedYear(year);
    // No search is triggered here
  };
  
  // Load more results (pagination)
  const loadMore = () => {
    if (searchMoviesQuery.data && 
        searchMoviesQuery.data.pageNumber < searchMoviesQuery.data.totalPages) {
      setSearchParams(prev => ({
        ...prev,
        pageNumber: (prev.pageNumber || 1) + 1,
      }));
    }
  };
  
  // Generate years for filter (last 100 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="$backgroundLight50" $dark-bg="$backgroundDark900">
        <VStack space="md" flex={1} px="$4" pt="$4">
          {/* Search Bar */}
          <HStack space="sm" alignItems="center">
            <Pressable onPress={() => router.back()} p="$2">
              <Icon as={MaterialIcons} name="arrow-back" size="xl" />
            </Pressable>
            <Input
              flex={1}
              size="md"
              borderRadius="$full"
              borderWidth={1}
              borderColor="$borderLight300"
              $dark-borderColor="$borderDark700"
              bgColor="$backgroundLight50"
              $dark-bgColor="$backgroundDark900"
            >
              <InputSlot pl="$3">
                <InputIcon>
                  <Icon as={MaterialIcons} name="search" color="$textLight400" $dark-color="$textDark500" />
                </InputIcon>
              </InputSlot>
              <InputField
                placeholder="Search movies, actors, directors..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <InputSlot pr="$3">
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Icon as={MaterialIcons} name="close" color="$textLight400" $dark-color="$textDark500" />
                  </Pressable>
                </InputSlot>
              )}
            </Input>
            <Pressable 
              onPress={() => setShowFilters(prev => !prev)}
              p="$2"
              borderRadius="$full"
              bg={showFilters ? "$primary100" : "transparent"}
              $dark-bg={showFilters ? "$primary900" : "transparent"}
            >
              <Icon 
                as={MaterialIcons}
                name="filter-list" 
                size="xl" 
                color={showFilters ? "$primary500" : "$textLight900"}
                $dark-color={showFilters ? "$primary400" : "$textDark100"}
              />
            </Pressable>
          </HStack>
          
          {/* Filters */}
          {showFilters && (
            <Box 
              bg="$backgroundLight50" 
              $dark-bg="$backgroundDark900"
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor="$borderLight200"
              $dark-borderColor="$borderDark800"
            >
              <VStack space="md">
                <Text fontWeight="$bold" size="lg">Filters</Text>
                
                {/* Genre Filter */}
                <VStack space="sm">
                  <Text fontWeight="$medium">Genres</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="xs">
                      {genresQuery.isLoading ? (
                        <Spinner />
                      ) : genresQuery.data ? (
                        genresQuery.data.items.map(genre => (
                          <Pressable 
                            key={genre.id}
                            onPress={() => toggleGenre(genre.id)}
                          >
                            <Box
                              bg={selectedGenres.includes(genre.id) ? "$primary500" : "$backgroundLight200"}
                              $dark-bg={selectedGenres.includes(genre.id) ? "$primary700" : "$backgroundDark800"}
                              borderRadius="$full"
                              px="$3"
                              py="$1"
                            >
                              <Text 
                                color={selectedGenres.includes(genre.id) ? "$white" : "$textLight900"}
                                $dark-color={selectedGenres.includes(genre.id) ? "$white" : "$textDark100"}
                              >
                                {genre.name}
                              </Text>
                            </Box>
                          </Pressable>
                        ))
                      ) : (
                        <Text>Failed to load genres</Text>
                      )}
                    </HStack>
                  </ScrollView>
                </VStack>
                
                {/* Year Filter */}
                <VStack space="sm">
                  <Text fontWeight="$medium">Release Year</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="xs">
                      <Pressable onPress={() => handleYearSelect(null)}>
                        <Box
                          bg={selectedYear === null ? "$primary500" : "$backgroundLight200"}
                          $dark-bg={selectedYear === null ? "$primary700" : "$backgroundDark800"}
                          borderRadius="$full"
                          px="$3"
                          py="$1"
                        >
                          <Text 
                            color={selectedYear === null ? "$white" : "$textLight900"}
                            $dark-color={selectedYear === null ? "$white" : "$textDark100"}
                          >
                            Any
                          </Text>
                        </Box>
                      </Pressable>
                      {years.slice(0, 20).map(year => (
                        <Pressable 
                          key={year}
                          onPress={() => handleYearSelect(year)}
                        >
                          <Box
                            bg={selectedYear === year ? "$primary500" : "$backgroundLight200"}
                            $dark-bg={selectedYear === year ? "$primary700" : "$backgroundDark800"}
                            borderRadius="$full"
                            px="$3"
                            py="$1"
                          >
                            <Text 
                              color={selectedYear === year ? "$white" : "$textLight900"}
                              $dark-color={selectedYear === year ? "$white" : "$textDark100"}
                            >
                              {year}
                            </Text>
                          </Box>
                        </Pressable>
                      ))}
                    </HStack>
                  </ScrollView>
                </VStack>
                
                {/* Filter Actions */}
                <HStack space="sm" justifyContent="flex-end">
                  <Button variant="outline" onPress={resetFilters}>
                    <ButtonText>Reset</ButtonText>
                  </Button>
                  <Button onPress={applyFilters}>
                    <ButtonText>Apply</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}
          
          {/* Search Results Container */}
          <Box flex={1} pb="$2">
            {searchMoviesQuery.isLoading ? (
              <Box flex={1} justifyContent="center" alignItems="center">
                <ActivityIndicator size="large" color="#0077FF" />
                <Text mt="$2">Searching...</Text>
              </Box>
            ) : searchMoviesQuery.data ? (
              <>
                <Text mb="$2" px="$2" fontSize="$sm" fontWeight="$medium" color="$textLight700" $dark-color="$textDark300">
                  {searchMoviesQuery.data.totalCount} results found
                </Text>
                <FlatList
                  data={searchMoviesQuery.data.items}
                  numColumns={2}
                  contentContainerStyle={{ padding: 16 }}
                  columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <Box flex={1} maxWidth="48%">
                      <MovieCard 
                        movie={item} 
                        onPress={() => router.push(`/movie/${item.id}`)}
                        variant="compact" 
                      />
                    </Box>
                  )}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    searchMoviesQuery.isFetchingNextPage ? (
                      <Box py="$4" alignItems="center">
                        <Spinner />
                      </Box>
                    ) : null
                  }
                />
              </>
            ) : hasSearched && (searchParams.searchTerm || selectedGenres.length > 0 || selectedYear || applyClicked) ? (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Icon as={MaterialIcons} name="error-outline" size="6xl" color="$textLight400" $dark-color="$textDark500" />
                <Text mt="$4" textAlign="center">Failed to load results</Text>
                <Text mt="$2" textAlign="center" color="$textLight500" $dark-color="$textDark400">
                  Please try again later
                </Text>
              </Box>
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Text mt="$4" textAlign="center">Search for movies</Text>
                <Text mt="$2" textAlign="center" color="$textLight500" $dark-color="$textDark400">
                  Use the search bar or filters to find movies
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
