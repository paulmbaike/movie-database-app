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
  InputIcon,
  InputSlot,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
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
// Use Platform to handle different date picker behaviors between web and native
import { FlatList, Platform, RefreshControl, TextInput } from 'react-native';

// Only import DateTimePicker for native platforms
// We'll use a different approach for web
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

import { z } from 'zod';

import { directorService } from '@/services/director-service';

// Define director form schema with Zod
const directorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  biography: z.string().optional(),
  birthDate: z.string().optional(),
});

type DirectorForm = z.infer<typeof directorSchema>;

export default function DirectorsScreen() {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const isDark = colorMode === 'dark';
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // State for the modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  
  // Form state
  const [form, setForm] = useState<DirectorForm>({
    name: '',
    biography: '',
    birthDate: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    biography?: string;
    birthDate?: string;
    profileImageUrl?: string;
  }>({});

  // Fetch directors
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['directors', page],
    queryFn: () => directorService.getDirectors(page, limit),
  });

  // Create director mutation
  const createDirectorMutation = useMutation({
    mutationFn: (directorData: DirectorForm) => directorService.createDirector(directorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Update director mutation
  const updateDirectorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: DirectorForm }) => 
      directorService.updateDirector(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Delete director mutation
  const deleteDirectorMutation = useMutation({
    mutationFn: (id: number) => directorService.deleteDirector(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const loadMore = () => {
    if (data?.hasNext && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleOpenCreateModal = () => {
    setForm({
      name: '',
      biography: '',
      birthDate: '',
    });
    setFormErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (director: any) => {
    const birthDate = director.dateOfBirth || '';
    setForm({
      name: director.name || '',
      biography: director.bio || '',
      birthDate: birthDate,
    });
    
    if (birthDate) {
      setSelectedDate(new Date(birthDate));
    } else {
      setSelectedDate(null);
    }
    setFormErrors({});
    setSelectedDirector(director);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDirector(null);
  };

  const handleChange = (field: keyof DirectorForm, value: string) => {
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Validate form
      directorSchema.parse(form);
      
      // Submit form
      if (modalMode === 'create') {
        createDirectorMutation.mutate({
          name: form.name,
          dateOfBirth: form.birthDate || null,
          bio: form.biography || null
        });
      } else {
        updateDirectorMutation.mutate({ 
          id: selectedDirector.id, 
          data: {
            name: form.name,
            dateOfBirth: form.birthDate || null,
            bio: form.biography || null
          }
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as keyof DirectorForm] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleDeleteDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowDeleteModal(true);
  };

  const confirmDeleteDirector = () => {
    if (deleteDirectorMutation.isPending || !selectedDirector) return;
    deleteDirectorMutation.mutate(selectedDirector.id);
    setShowDeleteModal(false);
  };

  const renderDirectorItem = ({ item }: { item: any }) => (
    <Box
      bg={isDark ? '$backgroundDark800' : '$white'}
      p="$4"
      mb="$3"
      borderRadius="$md"
      $dark-borderColor="$borderDark700"
      $light-borderColor="$borderLight200"
      $light-borderWidth={1}
      $dark-borderWidth={1}
    >
      <HStack alignItems="center" mb="$2">
        <Box flex={1}>
          <Heading size="md">{item.name}</Heading>
          {item.dateOfBirth && (
            <Text color={isDark ? '$textDark400' : '$textLight500'} size="sm">
              Born: {item.dateOfBirth}
            </Text>
          )}
        </Box>
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
            onPress={() => handleDeleteDirector(item)}
            borderRadius="$full"
            p="$2"
            borderColor="$error500"
            $dark-borderColor="$error500"
          >
            <MaterialIcons name="delete" size={18} color="#ef4444" />
          </Button>
        </HStack>
      </HStack>

      {item.bio && <Text mb="$2" color={isDark ? '$textDark400' : '$textLight500'}>{truncateText(item.bio, 150)}</Text>}
    </Box>
  );

  return (
    <Box flex={1} p="$4" bg={isDark ? '$backgroundDark900' : '$backgroundLight100'}>
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
          <Text mt="$2">Loading directors...</Text>
        </Box>
      ) : isError ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text mt="$2">Error: {(error as Error)?.message || 'Failed to load directors'}</Text>
          <Button mt="$4" onPress={() => refetch()}>
            <ButtonText>Try Again</ButtonText>
          </Button>
        </Box>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderDirectorItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#fff' : '#000'}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Box flex={1} justifyContent="center" alignItems="center" py="$8">
              <MaterialIcons name="person-outline" size={48} color={isDark ? '#666' : '#999'} />
              <Text mt="$2">No directors found</Text>
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
          bottom: 26,
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

      {/* Create/Edit Director Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{modalMode === 'create' ? 'Add Director' : 'Edit Director'}</Heading>
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
                    placeholder="Director name"
                    value={form.name}
                    onChangeText={(value) => handleChange('name', value)}
                  />
                </Input>
                <FormControl.Error>{formErrors.name}</FormControl.Error>
              </FormControl>

              {/* Biography input */}
              <FormControl isInvalid={!!formErrors.biography}>
                <FormControl.Label>Biography (optional)</FormControl.Label>
                <Box
                  borderWidth={1}
                  borderRadius="$lg"
                  p="$2"
                  borderColor={formErrors.biography ? '$error600' : '$borderLight300'}
                  $dark-borderColor={formErrors.biography ? '$error600' : '$borderDark700'}
                  bg={isDark ? '$backgroundDark800' : '$white'}
                >
                  <TextInput
                    placeholder="Director biography"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={form.biography}
                    onChangeText={(value) => handleChange('biography', value)}
                    multiline={true}
                    numberOfLines={4}
                    style={{
                      minHeight: 120,
                      textAlignVertical: 'top',
                      fontSize: 16,
                      padding: 0,
                      color: isDark ? '#fff' : '#000',
                      outline: 'none',
                      outlineWidth: 0
                    }}
                  />
                </Box>
                <FormControl.Error>{formErrors.biography}</FormControl.Error>
              </FormControl>

              {/* Birth Date input */}
              <FormControl isInvalid={!!formErrors.birthDate}>
                <FormControl.Label>Birth Date (optional)</FormControl.Label>
                {Platform.OS === 'web' ? (
                  // Use a simple input with type "date" for web
                  <Input>
                    <InputField
                      placeholder="YYYY-MM-DD"
                      value={form.birthDate}
                      onChangeText={(value) => handleChange('birthDate', value)}
                      // This makes it a date input on web
                      type="date"
                    />
                  </Input>
                ) : (
                  // Use DateTimePicker for native platforms
                  <>
                    <Pressable onPress={() => setShowDatePicker(true)}>
                      <Input>
                        <InputField
                          placeholder="YYYY-MM-DD"
                          value={form.birthDate}
                          editable={false}
                        />
                        <InputSlot pr="$3">
                          <InputIcon as={MaterialIcons} name="calendar-today" />
                        </InputSlot>
                      </Input>
                    </Pressable>
                    {showDatePicker && (
                      // @ts-ignore - DateTimePicker is only used on native platforms
                      <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowDatePicker(false);
                          if (event.type === 'set' && date) {
                            setSelectedDate(date);
                            const formattedDate = date.toISOString().split('T')[0];
                            handleChange('birthDate', formattedDate);
                          }
                        }}
                      />
                    )}
                  </>
                )}
                <FormControl.Error>{formErrors.birthDate}</FormControl.Error>
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
              isDisabled={createDirectorMutation.isPending || updateDirectorMutation.isPending}
            >
              <ButtonText>
                {modalMode === 'create' 
                  ? (createDirectorMutation.isPending ? 'Adding...' : 'Add Director')
                  : (updateDirectorMutation.isPending ? 'Updating...' : 'Update Director')
                }
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Confirm Delete</Heading>
            <ModalCloseButton>
              <MaterialIcons name="close" size={22} color={isDark ? '#fff' : '#000'} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete director "{selectedDirector?.name}"? This action cannot be undone.
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
              onPress={confirmDeleteDirector}
              isDisabled={deleteDirectorMutation.isPending}
            >
              <ButtonText>
                {deleteDirectorMutation.isPending ? 'Deleting...' : 'Delete'}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
