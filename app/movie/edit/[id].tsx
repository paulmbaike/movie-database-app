import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  FormControl,
  HStack,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
  useColorMode,
  useToast
} from '@gluestack-ui/themed';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { actorService } from '@/services/actor-service';
import { directorService } from '@/services/director-service';
import { genreService } from '@/services/genre-service';
import movieService from '@/services/movie-service';

// Define movie form schema with Zod
const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  plot: z.string().min(1, 'Plot is required'),
  releaseYear: z.string().regex(/^\d{4}$/, 'Must be a valid 4-digit year').transform(Number),
  posterUrl: z.string().url('Must be a valid URL').or(z.string().length(0)),
  runtimeMinutes: z.string().regex(/^\d+$/, 'Must be a valid number').transform(Number).pipe(
    z.number().positive('Runtime minutes must be a positive number')
  ),
  directorId: z.number().positive('Director is required'),
  genreIds: z.array(z.number()).min(1, 'At least one genre is required'),
  actorIds: z.array(z.number()).min(1, 'At least one actor is required'),
});

// Define base form type for state management
type MovieFormInput = {
  title: string;
  plot: string;
  releaseYear: string;
  posterUrl: string;
  runtimeMinutes: string;
  directorId: number;
  genreIds: number[];
  actorIds: number[];
};

// Define processed form type after schema validation
type MovieForm = z.output<typeof movieSchema>;

export default function EditMovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Form state
  const [form, setForm] = useState<MovieFormInput>({
    title: '',
    plot: '',
    releaseYear: new Date().getFullYear().toString(),
    posterUrl: '',
    runtimeMinutes: '',
    directorId: 0,
    genreIds: [],
    actorIds: [],
  });
  
  // Reference for scroll view to scroll to top after submission
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    plot?: string;
    releaseYear?: string;
    posterUrl?: string;
    runtimeMinutes?: string;
    directorId?: string;
    genreIds?: string;
    actorIds?: string;
  }>({});

  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovie(parseInt(id as string)),
    enabled: !!id,
  });

  // Fetch genres, directors, and actors
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreService.getGenres(1, 100)
  });

  const { data: directors } = useQuery({
    queryKey: ['directors'],
    queryFn: () => directorService.getDirectors(1, 100),
  });

  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: () => actorService.getActors(1, 100),
  });

  // Update form with movie data when it's loaded
  useEffect(() => {
    if (movie && directors?.items && genres?.items && actors?.items) {
      // Find directorId from directorName
      const director = directors.items.find(d => d.name === movie.directorName);
      
      // Map genre strings to genre IDs
      const genreIds = movie.genres ? 
        genres.items.filter(g => movie.genres?.includes(g.name)).map(g => g.id) : [];
      
      // Map actor strings to actor IDs
      const actorIds = movie.actors ? 
        actors.items.filter(a => movie.actors?.includes(a.name)).map(a => a.id) : [];
      
      setForm({
        title: movie.title || '',
        plot: movie.plot || '',
        releaseYear: movie.releaseYear?.toString() || '',
        posterUrl: movie.posterUrl || '',
        runtimeMinutes: movie.runtimeMinutes?.toString() || '',
        directorId: director?.id || 0,
        genreIds,
        actorIds,
      });
    }
  }, [movie, directors, genres, actors]);

  // Update movie mutation
  const updateMovieMutation = useMutation({
    mutationFn: (movieData: MovieForm) => movieService.updateMovie(id, movieData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>Success</ToastTitle>
                <ToastDescription>Movie updated successfully</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
      router.back();
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error" variant="solid">
              <VStack space="xs">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>{(error as Error).message || 'Failed to update movie'}</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    },
  });

  // Handle input change
  const handleChange = (field: keyof MovieFormInput, value: any) => {
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle genre selection
  const handleGenreChange = (genreId: number) => {
    setForm(prev => {
      const genreIds = prev.genreIds.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId];
      
      // Clear genre error if at least one genre is selected
      if (genreIds.length > 0 && formErrors.genreIds) {
        setFormErrors(prev => ({ ...prev, genreIds: undefined }));
      }
      
      return { ...prev, genreIds };
    });
  };

  // Handle actor selection
  const handleActorChange = (actorId: number) => {
    setForm(prev => {
      const actorIds = prev.actorIds.includes(actorId)
        ? prev.actorIds.filter(id => id !== actorId)
        : [...prev.actorIds, actorId];
      
      // Clear actor error if at least one actor is selected
      if (actorIds.length > 0 && formErrors.actorIds) {
        setFormErrors(prev => ({ ...prev, actorIds: undefined }));
      }
      
      return { ...prev, actorIds };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Validate form
      const validatedData = movieSchema.parse(form);
      
      // Submit form with properly typed data
      updateMovieMutation.mutate({
        id: parseInt(id as string),
        ...validatedData, // Already transformed by Zod
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof MovieFormInput] = err.message;
          }
        });
        setFormErrors(errors);
        
        // Vibrate to indicate error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  if (isLoadingMovie) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f5f5f5' }} edges={['bottom', 'left', 'right']}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
          <Text mt="$2">Loading movie details...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f5f5f5' }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Box flex={1} p="$5">
            {/* <HStack space="md" alignItems="center" mb="$4">
              <Pressable
                onPress={() => router.back()}
                hitSlop={20}
              >
                <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
              </Pressable>
              <Heading size="xl">Edit Movie</Heading>
            </HStack> */}

            <VStack space="lg">
              {/* Title input */}
              <FormControl isInvalid={!!formErrors.title}>
                <FormControl.Label>Title</FormControl.Label>
                <Input
                  size="md"
                  borderRadius="$lg"
                >
                  <InputField
                    placeholder="Movie title"
                    value={form.title}
                    onChangeText={(value) => handleChange('title', value)}
                  />
                </Input>
                <FormControl.Error>{formErrors.title}</FormControl.Error>
              </FormControl>

              {/* Plot input */}
              <FormControl isInvalid={!!formErrors.plot}>
                <FormControl.Label>Plot</FormControl.Label>
                <Box
                  borderWidth={1}
                  borderRadius="$lg"
                  p="$2"
                  borderColor={formErrors.plot ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.plot ? '$error600' : '$borderDark700'}
                  bg={isDark ? '$backgroundDark800' : '$white'}
                >
                  <TextInput
                    placeholder="Movie plot"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={form.plot}
                    onChangeText={(value) => handleChange('plot', value)}
                    multiline={true}
                    numberOfLines={4}
                    style={{
                      minHeight: 100,
                      textAlignVertical: 'top',
                      fontSize: 16,
                      padding: 0,
                      color: isDark ? '#fff' : '#000',
                      outline: 'none',
                      outlineWidth: 0
                    }}
                  />
                </Box>
                <FormControl.Error>{formErrors.plot}</FormControl.Error>
              </FormControl>

              {/* Release Year input */}
              <FormControl isInvalid={!!formErrors.releaseYear}>
                <FormControl.Label>Release Year</FormControl.Label>
                <Input
                  size="md"
                  borderRadius="$lg"
                >
                  <InputField
                    placeholder="YYYY"
                    value={form.releaseYear}
                    onChangeText={(value) => handleChange('releaseYear', value)}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </Input>
                <FormControl.Error>{formErrors.releaseYear}</FormControl.Error>
              </FormControl>

              {/* Runtime Minutes */}
              <FormControl isInvalid={!!formErrors.runtimeMinutes}>
                <FormControl.Label>Runtime (minutes)</FormControl.Label>
                <Input
                  size="md"
                  borderRadius="$lg"
                  borderColor={formErrors.runtimeMinutes ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.runtimeMinutes ? '$error600' : '$borderDark700'}
                >
                  <InputField
                    placeholder="Runtime in minutes"
                    value={form.runtimeMinutes}
                    onChangeText={(value) => handleChange('runtimeMinutes', value)}
                    keyboardType="number-pad"
                  />
                </Input>
                <FormControl.Error>{formErrors.runtimeMinutes}</FormControl.Error>
              </FormControl>

              {/* Poster URL input */}
              <FormControl isInvalid={!!formErrors.posterUrl}>
                <FormControl.Label>Poster URL (optional)</FormControl.Label>
                <Input
                  size="md"
                  borderRadius="$lg"
                >
                  <InputField
                    placeholder="https://example.com/poster.jpg"
                    value={form.posterUrl}
                    onChangeText={(value) => handleChange('posterUrl', value)}
                    autoCapitalize="none"
                  />
                </Input>
                <FormControl.Error>{formErrors.posterUrl}</FormControl.Error>
              </FormControl>

              {/* Director selection */}
              <FormControl isInvalid={!!formErrors.directorId}>
                <FormControl.Label>Director</FormControl.Label>
                <Box
                  borderWidth={1}
                  borderColor={formErrors.directorId ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.directorId ? '$error600' : '$borderDark700'}
                  borderRadius="$lg"
                  p="$2"
                >
                  {directors?.items && directors.items.length > 0 ? (
                    <ScrollView style={{ maxHeight: 150 }}>
                      {directors.items.map((director) => (
                        <Pressable
                          key={director.id}
                          onPress={() => handleChange('directorId', director.id)}
                        >
                          <HStack
                            bg={form.directorId === director.id ? '$primary100' : 'transparent'}
                            $dark-bg={form.directorId === director.id ? '$primary950' : 'transparent'}
                            p="$2"
                            borderRadius="$md"
                            alignItems="center"
                            space="sm"
                          >
                            <Box
                              width={24}
                              height={24}
                              borderRadius="$full"
                              borderWidth={2}
                              borderColor="$primary500"
                              justifyContent="center"
                              alignItems="center"
                              bg={form.directorId === director.id ? '$primary500' : 'transparent'}
                            >
                              {form.directorId === director.id && (
                                <MaterialIcons name="check" size={16} color="white" />
                              )}
                            </Box>
                            <Text
                              color={isDark ? '$textDark300' : '$textLight600'}
                              fontWeight={form.directorId === director.id ? '$medium' : '$normal'}
                            >
                              {director.name}
                            </Text>
                          </HStack>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text color={isDark ? '$textDark400' : '$textLight500'}>No directors available</Text>
                  )}
                </Box>
                <FormControl.Error>{formErrors.directorId}</FormControl.Error>
              </FormControl>

              {/* Genre selection */}
              <FormControl isInvalid={!!formErrors.genreIds}>
                <FormControl.Label>Genres</FormControl.Label>
                <Box
                  borderWidth={1}
                  borderColor={formErrors.genreIds ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.genreIds ? '$error600' : '$borderDark700'}
                  borderRadius="$lg"
                  p="$2"
                >
                  <HStack flexWrap="wrap" space="sm">
                    {genres?.items.map((genre) => (
                      <Pressable
                        key={genre.id}
                        onPress={() => handleGenreChange(genre.id)}
                      >
                        <Box
                          bg={form.genreIds.includes(genre.id) ? '$primary500' : isDark ? '$backgroundDark700' : '$backgroundLight200'}
                          px="$3"
                          py="$1"
                          borderRadius="$full"
                          mb="$2"
                        >
                          <Text
                            color={form.genreIds.includes(genre.id) ? 'white' : isDark ? '$textDark300' : '$textLight600'}
                            fontWeight={form.genreIds.includes(genre.id) ? '$medium' : '$normal'}
                          >
                            {genre.name}
                          </Text>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                </Box>
                <FormControl.Error>{formErrors.genreIds}</FormControl.Error>
              </FormControl>

              {/* Actor selection */}
              <FormControl isInvalid={!!formErrors.actorIds}>
                <FormControl.Label>Actors</FormControl.Label>
                <Box
                  borderWidth={1}
                  borderColor={formErrors.actorIds ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.actorIds ? '$error600' : '$borderDark700'}
                  borderRadius="$lg"
                  p="$2"
                  maxHeight={150}
                >
                  <ScrollView>
                    <VStack space="xs">
                      {actors?.items.map((actor) => (
                        <Pressable
                          key={actor.id}
                          onPress={() => handleActorChange(actor.id)}
                        >
                          <HStack
                            bg={form.actorIds.includes(actor.id) ? '$primary100' : 'transparent'}
                            $dark-bg={form.actorIds.includes(actor.id) ? '$primary950' : 'transparent'}
                            p="$2"
                            borderRadius="$md"
                            alignItems="center"
                            space="sm"
                          >
                            <Box
                              width={24}
                              height={24}
                              borderRadius="$full"
                              borderWidth={2}
                              borderColor="$primary500"
                              justifyContent="center"
                              alignItems="center"
                              bg={form.actorIds.includes(actor.id) ? '$primary500' : 'transparent'}
                            >
                              {form.actorIds.includes(actor.id) && (
                                <MaterialIcons name="check" size={16} color="white" />
                              )}
                            </Box>
                            <Text
                              color={isDark ? '$textDark300' : '$textLight600'}
                              fontWeight={form.actorIds.includes(actor.id) ? '$medium' : '$normal'}
                            >
                              {actor.name}
                            </Text>
                          </HStack>
                        </Pressable>
                      ))}
                    </VStack>
                  </ScrollView>
                </Box>
                <FormControl.Error>{formErrors.actorIds}</FormControl.Error>
              </FormControl>

              {/* Submit button */}
              <Button
                size="lg"
                borderRadius="$lg"
                bg="$primary500"
                onPress={handleSubmit}
                isDisabled={updateMovieMutation.isPending}
                mt="$4"
              >
                <Text color="white" fontWeight="$medium">
                  {updateMovieMutation.isPending ? 'Updating...' : 'Update Movie'}
                </Text>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
