import React, { memo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { Box, Heading, Text, Pressable, HStack, Icon } from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MovieCard from './movie-card';
import { Movie } from '../../services/movie-service';
import * as Haptics from 'expo-haptics';

interface HorizontalMovieListProps {
  title: string;
  movies: Movie[];
  onSeeAllPress?: () => void;
  seeAllRoute?: string;
  isLoading?: boolean;
  emptyText?: string;
}

const HorizontalMovieList: React.FC<HorizontalMovieListProps> = ({
  title,
  movies,
  onSeeAllPress,
  seeAllRoute,
  isLoading = false,
  emptyText = 'No movies available'
}) => {
  const router = useRouter();

  const handleSeeAllPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSeeAllPress) {
      onSeeAllPress();
    } else if (seeAllRoute) {
      router.push(seeAllRoute);
    }
  };

  const renderItem: ListRenderItem<Movie> = ({ item }) => (
    <MovieCard movie={item} />
  );

  // Render loading skeleton
  if (isLoading) {
    return (
      <Box mb="$6">
        <HStack justifyContent="space-between" alignItems="center" mb="$3">
          <Box width="40%" height="$5" bg="$backgroundLight200" borderRadius="$md" $dark-bg="$backgroundDark700" />
          <Box width="20%" height="$4" bg="$backgroundLight200" borderRadius="$md" $dark-bg="$backgroundDark700" />
        </HStack>
        <FlatList
          data={[1, 2, 3, 4]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
          renderItem={() => (
            <Box 
              width={150} 
              height={270} 
              mx="$1" 
              borderRadius="$lg" 
              bg="$backgroundLight200" 
              $dark-bg="$backgroundDark700"
            />
          )}
          keyExtractor={(_, index) => `skeleton-${index}`}
        />
      </Box>
    );
  }

  // Render empty state
  if (!isLoading && (!movies || movies.length === 0)) {
    return (
      <Box mb="$6">
        <Heading size="md" mb="$3">{title}</Heading>
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
          <Icon as={MaterialIcons} size="xl" color="$textLight400" $dark-color="$textDark500">
            <MaterialIcons name="movie" />
          </Icon>
          <Text mt="$2" color="$textLight500" $dark-color="$textDark400">
            {emptyText}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box mb="$6">
      <HStack justifyContent="space-between" alignItems="center" mb="$3">
        <Heading size="md">{title}</Heading>
        {(onSeeAllPress || seeAllRoute) && (
          <Pressable onPress={handleSeeAllPress}>
            <HStack alignItems="center" space="xs">
              <Text color="$primary500" fontWeight="$medium">See All</Text>
              <Icon as={MaterialIcons} color="$primary500">
                <MaterialIcons name="chevron-right" />
              </Icon>
            </HStack>
          </Pressable>
        )}
      </HStack>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16 }}
        renderItem={renderItem}
        keyExtractor={(item) => `movie-${item.id}`}
      />
    </Box>
  );
};

export default memo(HorizontalMovieList);
