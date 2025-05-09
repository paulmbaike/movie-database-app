import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputField,
  Pressable,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  useColorMode,
  useToast,
  VStack
} from '@gluestack-ui/themed';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { actorService } from '@/services/actor-service';
import { directorService } from '@/services/director-service';
import { genreService } from '@/services/genre-service';
import { movieService } from '@/services/movie-service';

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

export default function CreateMovieScreen() {
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

  // Fetch genres, directors, and actors
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreService.getGenres(),
  });

  const { data: directors } = useQuery({
    queryKey: ['directors'],
    queryFn: () => directorService.getDirectors(1, 100),
  });

  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: () => actorService.getActors(1, 100),
  });

  // Default form state
  const defaultFormState: MovieFormInput = {
    title: '',
    plot: '',
    releaseYear: new Date().getFullYear().toString(),
    posterUrl: '',
    runtimeMinutes: '',
    directorId: 0,
    genreIds: [],
    actorIds: [],
  };

  // Reset form to initial state
  const resetForm = () => {
    setForm({...defaultFormState});
    setFormErrors({});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Create movie mutation
  const createMovieMutation = useMutation({
    mutationFn: (movieData: MovieForm) => movieService.createMovie(movieData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="success" variant="solid">
              <VStack space="xs">
                <ToastTitle>Success</ToastTitle>
                <ToastDescription>Movie created successfully</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
      // Reset the form instead of navigating back
      resetForm();
      // Scroll to top
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
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
                <ToastDescription>{(error as Error).message || 'Failed to create movie'}</ToastDescription>
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
      createMovieMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof MovieForm] = err.message;
          }
        });
        setFormErrors(errors);
        
        // Vibrate to indicate error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Helper function to render error message with proper null handling
  const renderErrorMessage = (errorText?: string) => {
    if (!errorText) {
      return null;
    }
    return (
      <Box pt="$1">
        <Text color="$error700" fontSize="$sm">{errorText}</Text>
      </Box>
    );
  };
  
  if (!genres || !directors || !actors) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f5f5f5' }} edges={['bottom', 'left', 'right']}>
        <Box flex={1} p="$5" justifyContent="center" alignItems="center">
          <HStack space="md" alignItems="center">
            <MaterialIcons name="movie" size={24} color={isDark ? '#fff' : '#000'} />
            <Heading size="lg">Loading resources...</Heading>
          </HStack>
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
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}>
        
          <Box flex={1} p="$5">
            <VStack space="lg">
              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Title</Text>
                <Input
                  size="md"
                  borderRadius="$lg"
                  borderColor={formErrors.title ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.title ? '$error600' : '$borderDark700'}
                >
                  <InputField
                    placeholder="Movie title"
                    value={form.title}
                    onChangeText={(value) => handleChange('title', value)}
                  />
                </Input>
                {renderErrorMessage(formErrors.title)}
              </VStack>

              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Plot</Text>
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
                {renderErrorMessage(formErrors.plot)}
              </VStack>
              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Release Year</Text>
                <Input
                  size="md"
                  borderRadius="$lg"
                  borderColor={formErrors.releaseYear ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.releaseYear ? '$error600' : '$borderDark700'}
                >
                  <InputField
                    placeholder="YYYY"
                    value={form.releaseYear}
                    onChangeText={(value) => handleChange('releaseYear', value)}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </Input>
                {renderErrorMessage(formErrors.releaseYear)}
              </VStack>

              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Runtime (minutes)</Text>
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
                {renderErrorMessage(formErrors.runtimeMinutes)}
              </VStack>

              <VStack>
                <Text fontWeight="$medium" mb="$1">Poster URL (optional)</Text>
                <Input
                  size="md"
                  borderRadius="$lg"
                  borderColor={formErrors.posterUrl ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.posterUrl ? '$error600' : '$borderDark700'}
                >
                  <InputField
                    placeholder="https://..."
                    value={form.posterUrl}
                    onChangeText={(value) => handleChange('posterUrl', value)}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </Input>
                {renderErrorMessage(formErrors.posterUrl)}
              </VStack>

              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Director</Text>
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
                {renderErrorMessage(formErrors.directorId)}
              </VStack>

              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Genres</Text>
                <Box
                  borderWidth={1}
                  borderColor={formErrors.genreIds ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.genreIds ? '$error600' : '$borderDark700'}
                  borderRadius="$lg"
                  p="$2"
                >
                  {genres?.items && genres.items.length > 0 ? (
                    <Box width="100%">
                      <HStack flexWrap="wrap" space="sm">
                        {genres.items.map((genre) => (
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
                  ) : (
                    <Text color={isDark ? '$textDark400' : '$textLight500'}>No genres available</Text>
                  )}
                </Box>
                {renderErrorMessage(formErrors.genreIds)}
              </VStack>

              
              <VStack>
                <Text fontWeight="$medium" mb="$1">Actors</Text>
                <Box
                  borderWidth={1}
                  borderColor={formErrors.actorIds ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.actorIds ? '$error600' : '$borderDark700'}
                  borderRadius="$lg"
                  p="$2"
                >
                  {actors?.items && actors.items.length > 0 ? (
                    <ScrollView style={{ maxHeight: 150 }}>
                      {actors.items.map((actor) => (
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
                    </ScrollView>
                  ) : (
                    <Text color={isDark ? '$textDark400' : '$textLight500'}>No actors available</Text>
                  )}
                </Box>
                {renderErrorMessage(formErrors.actorIds)}
              </VStack>
              <Button
                size="lg"
                borderRadius="$lg"
                bg="$primary500"
                onPress={handleSubmit}
                isDisabled={createMovieMutation.isPending}
                mt="$4"
              >
                <Text color="white" fontWeight="$medium">
                  {createMovieMutation.isPending ? 'Creating...' : 'Create Movie'}
                </Text>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
