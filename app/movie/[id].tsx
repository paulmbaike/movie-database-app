import { MaterialIcons } from '@expo/vector-icons';
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Text,
  useColorMode,
  VStack
} from '@gluestack-ui/themed';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView as RNScrollView, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Toast, ToastDescription, ToastTitle, useToast } from '@gluestack-ui/themed';
import { useAuth } from '../../contexts/auth-context';
import movieService from '../../services/movie-service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch movie details
  const movieQuery = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovie(parseInt(id as string)),
    enabled: !!id,
  });
  
  // Share movie
  const shareMovie = async () => {
    if (!movieQuery.data) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Share.share({
        message: `Check out ${movieQuery.data.title} on Movie Database!`,
        url: `moviedb://movie/${id}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };
  
  // Navigate to actor/director profile
  const navigateToProfile = (personId: string) => {
    router.push(`/actor/${personId}`);
  };

  // Navigate to edit movie
  const navigateToEditMovie = () => {
    router.push(`/movie/edit/${id}`);
  };
  
  // Delete movie mutation
  const deleteMovieMutation = useMutation({
    mutationFn: () => movieService.deleteMovie(parseInt(id as string)),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.show({
        placement: "top",
        render: ({ id: toastId }) => {
          return (
            <Toast nativeID={toastId} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>Success</ToastTitle>
                <ToastDescription>Movie deleted successfully</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
      router.replace('/');
    },
    onError: (error) => {
      toast.show({
        placement: "top",
        render: ({ id: toastId }) => {
          return (
            <Toast nativeID={toastId} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>{(error as Error).message || 'Failed to delete movie'}</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    }
  });
  
  // Handle delete movie - show confirmation modal
  const handleDeleteMovie = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowDeleteModal(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    setShowDeleteModal(false);
    deleteMovieMutation.mutate();
  };
  
  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };
  
  // Format movie duration
  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Early access to movie to avoid flickering
  const movie = movieQuery.data || {
    title: '',
    posterUrl: '',
    runtimeMinutes: null,
    releaseYear: null,
    genres: [],
    plot: '',
    directorName: '',
    actors: []
  };
  
  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <Modal isOpen={showDeleteModal} onClose={cancelDelete}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Delete Movie</Heading>
          <ModalCloseButton>
            <Icon as={MaterialIcons} name="close" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <Text>
            Are you sure you want to delete "{movie.title}"? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            action="secondary"
            mr="$3"
            onPress={cancelDelete}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            size="sm"
            action="negative"
            onPress={confirmDelete}
            isDisabled={deleteMovieMutation.isPending}
          >
            {deleteMovieMutation.isPending ? (
              <Spinner size="small" color="$white" />
            ) : (
              <ButtonText>Delete</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Box flex={1} bg={isDark ? '$backgroundDark950' : '$backgroundLight50'}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        {/* Movie poster header */}
        <Box height={HEADER_HEIGHT} overflow="hidden">
          {movieQuery.isLoading ? (
            <Box
              bg={isDark ? '$backgroundDark800' : '$backgroundLight100'}
              height="100%"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner size="large" />
            </Box>
          ) : movie.posterUrl !== '' ? (
            <Image
              source={{ uri: movie.posterUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
          ) : (
            <Box 
              width="100%" 
              height="100%" 
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={MaterialIcons} name="image" size={24} color="$textLight400" $dark-color="$textDark500" />
              <Text fontSize={10} textAlign="center" mt="$1">No Poster</Text>
            </Box>
           
          )}
          
          {/* Gradient overlay at the bottom */}
          {movie.posterUrl !== '' && (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 150,
              }}
            />
          )}
        </Box>
        
        <RNScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 150 }}
          style={{ flex: 1 }}
        >
          {movieQuery.isLoading ? (
            <Box flex={1} p="$5" alignItems="center" justifyContent="center">
              <Spinner size="large" />
              <Text mt="$4" color={isDark ? '$textDark400' : '$textLight500'}>
                Loading movie details...
              </Text>
            </Box>
          ) : movieQuery.error ? (
            <Box flex={1} p="$5" alignItems="center" justifyContent="center">
              <Icon 
                as={MaterialIcons}
                name="error-outline"
                size="5xl"
                color="$error600"
                mb="$4"
              />
              <Heading size="lg" mb="$2" textAlign="center">Error Loading Movie</Heading>
              <Text textAlign="center" color={isDark ? '$textDark400' : '$textLight500'} mb="$6">
                {(movieQuery.error as Error)?.message || 'Failed to load movie details'}
              </Text>
              <Button onPress={() => router.back()}>
                <ButtonText>Go Back</ButtonText>
              </Button>
            </Box>
          ) : movieQuery.data ? (
            <Box px="$5" pt="$5" pb="$20">
              {/* Movie Poster and Basic Info */}
              <HStack space="md" mb="$6">
                <Box width={120} height={180} borderRadius="$lg" overflow="hidden">
                  {movie.posterUrl !== '' ? (
                    <Image
                      source={{ uri: movie.posterUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Box 
                      width="100%" 
                      height="100%" 
                      bg="$backgroundLight100"
                      $dark-bg="$backgroundDark800"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={MaterialIcons} name="image" size={24} color="$textLight400" $dark-color="$textDark500" />
                      <Text fontSize={10} textAlign="center" mt="$1">No Poster</Text>
                    </Box>
                  )}
                </Box>
                <VStack flex={1} justifyContent="space-between">
                  <VStack space="xs">
                    <Heading size="xl">{movie.title}</Heading>
                    <HStack space="xs" mb="$1">
                      {movie.runtimeMinutes && (
                        <>
                          <Text>{formatDuration(movie.runtimeMinutes)}</Text>
                          <Text>•</Text>
                        </>
                      )}
                      {movie.releaseYear && <Text>{movie.releaseYear}</Text>}
                    </HStack>
                  </VStack>
                  
                  {/* Genre Tags */}
                  {movie.genres && movie.genres.length > 0 && (
                    <HStack flexWrap="wrap" space="xs" mb="$2">
                      {movie.genres.map(genre => (
                        <Badge key={genre} variant="outline" action="muted">
                          <BadgeText>{genre}</BadgeText>
                        </Badge>
                      ))}
                    </HStack>
                  )}
                  
                  {/* Action Buttons */}
                  <HStack flexWrap="wrap" space="sm" mt="$2">
                    <Button
                      variant="outline"
                      size="sm"
                      borderRadius="$full"
                      onPress={shareMovie}
                      mb="$2"
                    >
                      <ButtonIcon as={MaterialIcons} name="share" color="$textLight900" $dark-color="$textDark100" />
                    </Button>
                    {isAuthenticated && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          borderRadius="$full"
                          onPress={navigateToEditMovie}
                          mb="$2"
                        >
                          <ButtonIcon as={MaterialIcons} name="edit" color="$textLight900" $dark-color="$textDark100" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          borderRadius="$full"
                          onPress={handleDeleteMovie}
                          borderColor="$error500"
                          $dark-borderColor="$error500"
                          mb="$2"
                          isDisabled={deleteMovieMutation.isPending}
                        >
                          {deleteMovieMutation.isPending ? (
                            <Spinner size="small" color="$error500" />
                          ) : (
                            <ButtonIcon as={MaterialIcons} name="delete" color="$error500" />
                          )}
                        </Button>
                      </>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              
              {/* Plot */}
              {movie.plot && (
                <VStack space="sm" mb="$6">
                  <Heading size="md">Plot</Heading>
                  <Text>{movie.plot}</Text>
                </VStack>
              )}
              
              {/* Director */}
              {movie.directorName && (
                <VStack space="sm" mb="$6">
                  <Heading size="md">Director</Heading>
                  <Box
                    p="$3"
                    borderRadius="$lg"
                    bg="$backgroundLight50"
                    $dark-bg="$backgroundDark800"
                  >
                    <Text fontWeight="$medium" size="lg">{movie.directorName}</Text>
                    <Text color="$textLight500" $dark-color="$textDark400">Director</Text>
                  </Box>
                </VStack>
              )}
              
              {/* Cast */}
              {movie.actors && movie.actors.length > 0 && (
                <VStack space="sm" mb="$6">
                  <Heading size="md">Cast</Heading>
                  <Box p="$3" borderRadius="$lg" bg="$backgroundLight50" $dark-bg="$backgroundDark800">
                    {movie.actors.map((actor, index) => (
                      <Text key={index} fontWeight="$medium">{actor}</Text>
                    ))}
                  </Box>
                </VStack>
              )}
            </Box>
          ) : null}
        </RNScrollView>
      </SafeAreaView>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </Box>
  );
}
