import { MaterialIcons } from '@expo/vector-icons';
import {
  Badge,
  BadgeText,
  Box,
  Divider,
  Heading,
  HStack,
  Icon,
  Text,
  VStack
} from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Movie } from '../../services/movie-service';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'horizontal' | 'featured' | 'compact';
  onPress?: () => void;
  showRating?: boolean;
}

const MovieCard = ({ 
  movie, 
  variant = 'default', 
  onPress, 
  showRating = true 
}: MovieCardProps) => {
  const router = useRouter();
  const { id, title, posterUrl, releaseDate, rating, genres } = movie;
  
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push(`/movie/${id}`);
    }
  };
  
  // Placeholder image when posterUrl is null
  const placeholderImage = 'https://dummyimage.com/300x450/fefefe&text=No+Poster';
  
  if (variant === 'horizontal') {
    return (
      <Pressable onPress={handlePress}>
        <Box 
          bg="$backgroundLight50" 
          borderRadius="$lg" 
          overflow="hidden"
          mb="$3"
          borderColor="$borderLight200"
          borderWidth={1}
          $dark-bg="$backgroundDark900"
          $dark-borderColor="$borderDark800"
        >
          <HStack>
            <Box width={100} height={150}>
              <Image
                source={{ uri: posterUrl || placeholderImage }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
              />
            </Box>
            <VStack flex={1} p="$3" space="xs">
              <Heading size="sm" numberOfLines={2}>{title}</Heading>
              {releaseYear && (
                <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                  {releaseYear}
                </Text>
              )}
              {showRating && rating && (
                <HStack alignItems="center" space="xs" mt="$1">
                  <Icon as={MaterialIcons} color="$amber500" size="sm">
                    <MaterialIcons name="star" />
                  </Icon>
                  <Text fontWeight="$medium">{rating.toFixed(1)}</Text>
                </HStack>
              )}
              {genres && genres.length > 0 && (
                <HStack flexWrap="wrap" space="xs" mt="$2">
                  {genres.slice(0, 2).map((genre) => (
                    <Badge key={genre.id} size="sm" variant="outline" action="muted">
                      <BadgeText>{genre.name}</BadgeText>
                    </Badge>
                  ))}
                  {genres.length > 2 && (
                    <Badge size="sm" variant="outline" action="muted">
                      <BadgeText>+{genres.length - 2}</BadgeText>
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>
        </Box>
      </Pressable>
    );
  }
  
  if (variant === 'featured') {
    return (
      <Pressable onPress={handlePress}>
        <Box 
          width="100%" 
          height={220} 
          borderRadius="$lg" 
          overflow="hidden"
          mb="$3"
        >
          <Image
            source={{ uri: movie.backdropUrl || posterUrl || placeholderImage }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
          />
          <Box 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0}
            bg="$backgroundDark950:alpha.80"
            p="$3"
          >
            <Heading color="$white" size="md" numberOfLines={1}>{title}</Heading>
            <HStack alignItems="center" space="sm" mt="$1">
              {releaseYear && (
                <Text color="$textLight100">{releaseYear}</Text>
              )}
              {releaseYear && showRating && rating && (
                <Box mx="$1">
                  <Divider 
                    orientation="vertical" 
                    bg="$textLight400" 
                    h="$3" 
                    w={1} 
                  />
                </Box>
              )}
              {showRating && rating && (
                <HStack alignItems="center" space="xs">
                  <Icon as={MaterialIcons} color="$amber500" size="sm">
                    <MaterialIcons name="star" />
                  </Icon>
                  <Text color="$textLight100" fontWeight="$medium">{rating.toFixed(1)}</Text>
                </HStack>
              )}
            </HStack>
            {genres && genres.length > 0 && (
              <HStack flexWrap="wrap" space="xs" mt="$2">
                {genres.slice(0, 3).map((genre) => (
                  <Badge key={genre.id} size="sm" bgColor="$primary500:alpha.80">
                    <BadgeText color="$white">{genre.name}</BadgeText>
                  </Badge>
                ))}
              </HStack>
            )}
          </Box>
        </Box>
      </Pressable>
    );
  }
  
  // Compact card for search results
  if (variant === 'compact') {
    return (
      <Pressable onPress={handlePress}>
        <Box 
          borderRadius="$lg" 
          overflow="hidden"
          bg="$backgroundLight50"
          borderColor="$borderLight200"
          borderWidth={1}
          $dark-bg="$backgroundDark900"
          $dark-borderColor="$borderDark800"
        >
          <Box height={160}>
            <Image
              source={{ uri: posterUrl || placeholderImage }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
            {showRating && rating && (
              <Box 
                position="absolute" 
                top={8} 
                right={8}
                bg="$backgroundDark950:alpha.80"
                borderRadius="$full"
                p="$1"
                px="$2"
              >
                <HStack alignItems="center" space="xs">
                  <Icon as={MaterialIcons} color="$amber500" size="xs">
                    <MaterialIcons name="star" />
                  </Icon>
                  <Text color="$white" fontWeight="$medium" size="xs">
                    {rating.toFixed(1)}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
          <VStack p="$1.5">
            <Heading size="xs" fontSize="$xs" numberOfLines={1} mb="$0.5">{title}</Heading>
            {releaseYear && (
              <Text size="2xs" color="$textLight500" $dark-color="$textDark400">
                {releaseYear}
              </Text>
            )}
          </VStack>
        </Box>
      </Pressable>
    );
  }
  
  // Default vertical card
  return (
    <Pressable onPress={handlePress}>
      <Box 
        width="100%"
        mb="$3"
      >
        <Box 
          borderRadius="$lg" 
          overflow="hidden"
          bg="$backgroundLight50"
          borderColor="$borderLight200"
          borderWidth={1}
          $dark-bg="$backgroundDark900"
          $dark-borderColor="$borderDark800"
        >
          <Box height={225}>
            <Image
              source={{ uri: posterUrl || placeholderImage }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
            {showRating && rating && (
              <Box 
                position="absolute" 
                top={8} 
                right={8}
                bg="$backgroundDark950:alpha.80"
                borderRadius="$full"
                p="$1"
                px="$2"
              >
                <HStack alignItems="center" space="xs">
                  <Icon as={MaterialIcons} color="$amber500" size="xs">
                    <MaterialIcons name="star" />
                  </Icon>
                  <Text color="$white" fontWeight="$medium" size="xs">
                    {rating.toFixed(1)}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
          <VStack p="$2">
            <Heading size="xs" numberOfLines={2} mb="$1">{title}</Heading>
            {releaseYear && (
              <Text size="xs" color="$textLight500" $dark-color="$textDark400">
                {releaseYear}
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    </Pressable>
  );
};

export default memo(MovieCard);
