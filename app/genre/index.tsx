import { MaterialIcons } from '@expo/vector-icons';
import {
    Box,
    Button,
    ButtonText,
    Fab,
    FormControl,
    HStack,
    Heading,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Text,
    VStack,
    useColorMode,
    useToast
} from '@gluestack-ui/themed';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, RefreshControl, TextInput } from 'react-native';
// Remove SafeAreaView to match actor/director pages
import { z } from 'zod';

import { genreService } from '@/services/genre-service';

// Define genre form schema with Zod
const genreSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type GenreForm = z.infer<typeof genreSchema>;

export default function GenresScreen() {
  const router = useRouter();
  const colorMode = useColorMode();
  const toast = useToast();
  const isDark = colorMode === 'dark';
  const queryClient = useQueryClient();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  
  // Form state
  const [form, setForm] = useState<GenreForm>({
    name: '',
    description: '',
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Fetch genres
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genreService.getGenres(1,100),
  });

  // Create genre mutation
  const createGenreMutation = useMutation({
    mutationFn: (genreData: GenreForm) => genreService.createGenre(genreData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Update genre mutation
  const updateGenreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: GenreForm }) => 
      genreService.updateGenre(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({
        title: "Success",
        description: "Genre updated successfully",
        placement: "top"
      });
    },
    onError: (error) => {
      toast.show({
        title: "Error",
        description: (error as Error)?.message || "Failed to update genre",
        placement: "top"
      });
    },
  });

  // Delete genre mutation
  const deleteGenreMutation = useMutation({
    mutationFn: (id: number) => genreService.deleteGenre(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({
        title: "Success",
        description: "Genre deleted successfully",
        placement: "top"
      });
    },
    onError: (error) => {
      toast.show({
        title: "Error",
        description: (error as Error)?.message || "Failed to delete genre",
        placement: "top"
      });
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleOpenCreateModal = () => {
    setForm({
      name: '',
      description: '',
    });
    setFormErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (genre: any) => {
    setForm({
      name: genre.name || '',
      description: genre.description || '',
    });
    setFormErrors({});
    setSelectedGenre(genre);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGenre(null);
  };

  const handleChange = (field: keyof GenreForm, value: string) => {
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Validate form
      genreSchema.parse(form);
      
      // Submit form
      if (modalMode === 'create') {
        createGenreMutation.mutate(form);
      } else {
        updateGenreMutation.mutate({ id: selectedGenre.id, data: form });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof GenreForm] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteGenre = (genre: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedGenre(genre);
    setShowDeleteModal(true);
  };

  const confirmDeleteGenre = () => {
    if (deleteGenreMutation.isPending || !selectedGenre) return;
    deleteGenreMutation.mutate(selectedGenre.id);
    setShowDeleteModal(false);
  };

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const renderGenreItem = ({ item }: { item: any }) => (
    <Box
      bg={isDark ? '$backgroundDark800' : '$white'}
      p="$4"
      mb="$3"
      borderRadius="$lg"
      borderLeftWidth={3}
      borderLeftColor="$secondary500"
      shadow="$1"
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack space="xs" flex={1}>
          <Heading size="md">{item.name}</Heading>
          {item.description && (
            <Text 
              fontSize="$sm" 
              color={isDark ? '$textDark400' : '$textLight500'}
              lineHeight="$sm"
              mt="$1"
            >
              {truncateText(item.description, 120)}
            </Text>
          )}
        </VStack>
        <HStack space="sm">
          <Button
            variant="outline"
            size="sm"
            onPress={() => handleOpenEditModal(item)}
            borderRadius="$full"
            p="$2"
          >
            <MaterialIcons name="edit" size={18} color={isDark ? '#fff' : '#000'} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => handleDeleteGenre(item)}
            borderRadius="$full"
            p="$2"
            borderColor="$error500"
            $dark-borderColor="$error500"
          >
            <MaterialIcons name="delete" size={18} color="#ef4444" />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );

  return (
    <Box flex={1} p="$4" bg={isDark ? '$backgroundDark900' : '$backgroundLight100'}>
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <Heading size="xl">Genres</Heading>
          <Button
            variant="outline"
            size="sm"
            borderRadius="$full"
            onPress={handleRefresh}
            isDisabled={isLoading || isFetching}
          >
            <ButtonText>Refresh</ButtonText>
          </Button>
        </HStack>

        {isLoading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" />
            <Text mt="$2">Loading genres...</Text>
          </Box>
        ) : isError ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <MaterialIcons name="error-outline" size={48} color="#FF5252" />
            <Text mt="$2">Error: {(error as Error)?.message || 'Failed to load genres'}</Text>
            <Button mt="$4" onPress={() => refetch()}>
              <ButtonText>Try Again</ButtonText>
            </Button>
          </Box>
        ) : (
          <FlatList
            data={data?.items || []}
            renderItem={renderGenreItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={handleRefresh}
                tintColor={isDark ? '#fff' : '#000'}
              />
            }
            ListEmptyComponent={
              <Box flex={1} justifyContent="center" alignItems="center" py="$8">
                <MaterialIcons name="category" size={48} color={isDark ? '#666' : '#999'} />
                <Text mt="$2">No genres found</Text>
                <Button mt="$4" onPress={() => refetch()}>
                  <ButtonText>Refresh</ButtonText>
                </Button>
              </Box>
            }
          />
        )}

        <Fab
          size="lg"
          bgColor="$primary500"
          onPress={handleOpenCreateModal}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
              },
              android: {
                elevation: 4,
              },
              web: {
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
              },
            }),
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </Fab>

        {/* Create/Edit Genre Modal */}
        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <ModalBackdrop 
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)', 
              backdropFilter: 'blur(2px)'  
            }}
          />
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">{modalMode === 'create' ? 'Add Genre' : 'Edit Genre'}</Heading>
              <ModalCloseButton>
                <MaterialIcons name="close" size={22} color={isDark ? '#fff' : '#000'} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                {/* Name input */}
                <FormControl isInvalid={!!formErrors.name}>
                  <FormControl.Label>Name</FormControl.Label>
                  <Input>
                    <InputField
                      placeholder="Genre name"
                      value={form.name}
                      onChangeText={(value) => handleChange('name', value)}
                    />
                  </Input>
                  <FormControl.Error>{formErrors.name}</FormControl.Error>
                </FormControl>

                {/* Description input */}
                <FormControl isInvalid={!!formErrors.description}>
                  <FormControl.Label>Description (optional)</FormControl.Label>
                  <Box
                    borderWidth={1}
                    borderRadius="$lg"
                    p="$2"
                    borderColor={formErrors.description ? '$error600' : '$borderLight300'}
                    $dark-borderColor={formErrors.description ? '$error600' : '$borderDark700'}
                    bg={isDark ? '$backgroundDark800' : '$white'}
                  >
                    <TextInput
                      placeholder="Genre description"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      value={form.description}
                      onChangeText={(value) => handleChange('description', value)}
                      multiline={true}
                      numberOfLines={3}
                      style={{
                        minHeight: 80,
                        textAlignVertical: 'top',
                        fontSize: 16,
                        padding: 0,
                        color: isDark ? '#fff' : '#000',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        outlineWidth: 0
                      }}
                    />
                  </Box>
                  <FormControl.Error>{formErrors.description}</FormControl.Error>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                size="sm"
                mr="$3"
                onPress={handleCloseModal}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                size="sm"
                bg="$primary500"
                onPress={handleSubmit}
                isDisabled={createGenreMutation.isPending || updateGenreMutation.isPending}
              >
                <ButtonText>
                  {modalMode === 'create' 
                    ? (createGenreMutation.isPending ? 'Adding...' : 'Add Genre')
                    : (updateGenreMutation.isPending ? 'Updating...' : 'Update Genre')
                  }
                </ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalBackdrop 
          style={{
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)', 
            backdropFilter: 'blur(2px)'  
          }}
        />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Confirm Delete</Heading>
            <ModalCloseButton>
              <MaterialIcons name="close" size={22} color={isDark ? '#fff' : '#000'} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete genre "{selectedGenre?.name}"? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              mr="$3"
              onPress={() => setShowDeleteModal(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              bg="$error600"
              onPress={confirmDeleteGenre}
              isDisabled={deleteGenreMutation.isPending}
            >
              <ButtonText>
                {deleteGenreMutation.isPending ? 'Deleting...' : 'Delete'}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
  );
}
