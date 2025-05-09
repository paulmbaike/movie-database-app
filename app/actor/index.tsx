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
  useColorMode
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
// Alert, FlatList, Platform, RefreshControl already imported above

import { z } from 'zod';

import { actorService } from '@/services/actor-service';

// Define actor form schema with Zod
const actorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  biography: z.string().optional(),
  birthDate: z.string().optional(),
});

type ActorForm = z.infer<typeof actorSchema>;

export default function ActorsScreen() {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;
  
  // State for the modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  
  // Form state
  const [form, setForm] = useState<ActorForm>({
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

  // Fetch actors
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['actors', page],
    queryFn: () => actorService.getActors(page, limit),
  });

  // Create actor mutation
  const createActorMutation = useMutation({
    mutationFn: (actorData: ActorForm) => actorService.createActor(actorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Update actor mutation
  const updateActorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ActorForm }) => 
      actorService.updateActor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      handleCloseModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Delete actor mutation
  const deleteActorMutation = useMutation({
    mutationFn: (id: number) => actorService.deleteActor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
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
      profileImageUrl: '',
    });
    setFormErrors({});
    setModalMode('create');
    setShowModal(true);
  };

  const handleOpenEditModal = (actor: any) => {
    const birthDate = actor.dateOfBirth || '';
    setForm({
      name: actor.name || '',
      biography: actor.bio || '',
      birthDate: birthDate,
    });
    
    if (birthDate) {
      setSelectedDate(new Date(birthDate));
    } else {
      setSelectedDate(null);
    }
    setFormErrors({});
    setSelectedActor(actor);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedActor(null);
  };

  const handleChange = (field: keyof ActorForm, value: string) => {
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
      actorSchema.parse(form);
      
      // Submit form
      if (modalMode === 'create') {
        createActorMutation.mutate({
          name: form.name,
          dateOfBirth: form.birthDate || null,
          bio: form.biography || null
        });
      } else {
        updateActorMutation.mutate({ 
          id: selectedActor.id, 
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
            errors[err.path[0] as keyof ActorForm] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleDeleteActor = (actor: Actor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedActor(actor);
    setShowDeleteModal(true);
  };

  const confirmDeleteActor = () => {
    if (deleteActorMutation.isPending || !selectedActor) return;
    deleteActorMutation.mutate(selectedActor.id);
    setShowDeleteModal(false);
  };

  const renderActorItem = ({ item }: { item: any }) => (
    <Box
      bg={isDark ? '$backgroundDark800' : '$white'}
      p="$4"
      mb="$3"
      borderRadius="$lg"
      shadow="$1"
      borderLeftWidth={3}
      borderLeftColor="$primary500"
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack space="xs" flex={1}>
          <Heading size="md">{item.name}</Heading>
          {item.dateOfBirth && (
            <HStack alignItems="center" space="xs">
              <MaterialIcons name="event" size={16} color={isDark ? '#999' : '#666'} />
              <Text size="sm" color={isDark ? '$textDark400' : '$textLight500'}>
                Born: {item.dateOfBirth}
              </Text>
            </HStack>
          )}
          
          {item.bio && (
            <Box mt="$1">
              <Text 
                fontSize="$sm" 
                color={isDark ? '$textDark400' : '$textLight500'}
                lineHeight="$sm"
              >
                {truncateText(item.bio, 120)}
              </Text>
            </Box>
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
            onPress={() => handleDeleteActor(item)}
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
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
          <Text mt="$2">Loading actors...</Text>
        </Box>
      ) : isError ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text mt="$2">Error: {(error as Error)?.message || 'Failed to load actors'}</Text>
          <Button mt="$4" onPress={() => refetch()}>
            <ButtonText>Try Again</ButtonText>
          </Button>
        </Box>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderActorItem}
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
              <Text mt="$2">No actors found</Text>
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

      {/* Create/Edit Actor Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{modalMode === 'create' ? 'Add Actor' : 'Edit Actor'}</Heading>
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
                    placeholder="Actor name"
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
                    placeholder="Actor biography"
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
              isDisabled={createActorMutation.isPending || updateActorMutation.isPending}
            >
              <ButtonText>
                {modalMode === 'create' 
                  ? (createActorMutation.isPending ? 'Adding...' : 'Add Actor')
                  : (updateActorMutation.isPending ? 'Updating...' : 'Update Actor')
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
              Are you sure you want to delete actor "{selectedActor?.name}"? This action cannot be undone.
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
              onPress={confirmDeleteActor}
              isDisabled={deleteActorMutation.isPending}
            >
              <ButtonText>
                {deleteActorMutation.isPending ? 'Deleting...' : 'Delete'}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>

  );
}
