import { useQuery } from '@tanstack/react-query';
import apiClient from './api-client';
import { API_ENDPOINTS } from '../constants/api';
import { z } from 'zod';

// Define a simple Movie schema for filmography
const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  posterUrl: z.string().nullable(),
  releaseYear: z.number().optional(),
  character: z.string().nullable().optional(), // For actors
  job: z.string().nullable().optional(), // For crew/directors
});

// Define Actor schema with Zod for validation
export const ActorSchema = z.object({
  id: z.number(),
  name: z.string(),
  dateOfBirth: z.string(),
  bio: z.string().nullable(),
  createdAt: z.string(),
  modifiedAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  modifiedBy: z.string().nullable(),
  isDeleted: z.boolean()
});

// Define PopularActor schema with Zod for validation
export const PopularActorSchema = z.object({
  actor: ActorSchema,
  movieCount: z.number()
});

// Define Person schema with Zod for validation (for backward compatibility)
export const PersonSchema = z.object({
  id: z.number(),
  name: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  placeOfBirth: z.string().nullable().optional(),
  isDirector: z.boolean().default(false),
  isActor: z.boolean().default(false),
  movies: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      posterUrl: z.string().nullable(),
      releaseDate: z.string().nullable(),
      character: z.string().nullable(), // For actors
      job: z.string().nullable(), // For crew/directors
    })
  ).default([])
});

// Define response schemas
const PaginatedPeopleSchema = z.object({
  results: z.array(PersonSchema),
  totalCount: z.number(),
  page: z.number(),
  totalPages: z.number()
});

// Types
export type Actor = z.infer<typeof ActorSchema>;
export type PopularActor = z.infer<typeof PopularActorSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type PaginatedPeople = z.infer<typeof PaginatedPeopleSchema>;

// People search params
export interface PeopleSearchParams {
  query?: string;
  type?: 'actor' | 'director' | 'all';
  page?: number;
  limit?: number;
}

// People service
const peopleService = {
  // Get popular people
  getPopularPeople: async (): Promise<PopularActor[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POPULAR_PEOPLE);
      return z.array(PopularActorSchema).parse(response.data);
    } catch (error) {
      console.error('Failed to fetch popular people:', error);
      throw error;
    }
  },

  // Get person details
  getPersonDetails: async (id: string): Promise<Person> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PERSON_DETAILS(id));
      return PersonSchema.parse(response.data);
    } catch (error) {
      console.error(`Failed to fetch person details for ID ${id}:`, error);
      throw error;
    }
  },

  // Search people
  searchPeople: async (params: PeopleSearchParams): Promise<PaginatedPeople> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_PEOPLE, { params });
      return PaginatedPeopleSchema.parse(response.data);
    } catch (error) {
      console.error('Failed to search people:', error);
      throw error;
    }
  },

  // Get person's filmography
  getFilmography: async (id: string): Promise<{ asActor: z.infer<typeof MovieSchema>[], asDirector: z.infer<typeof MovieSchema>[] }> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PERSON_DETAILS(id)}/filmography`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch filmography for person ID ${id}:`, error);
      throw error;
    }
  },

  // Admin: Create person
  createPerson: async (personData: Omit<Person, 'id'>): Promise<Person> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN_PEOPLE, personData);
      return PersonSchema.parse(response.data);
    } catch (error) {
      console.error('Failed to create person:', error);
      throw error;
    }
  },

  // Admin: Update person
  updatePerson: async (id: string, personData: Partial<Person>): Promise<Person> => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ADMIN_PEOPLE}/${id}`, personData);
      return PersonSchema.parse(response.data);
    } catch (error) {
      console.error(`Failed to update person ID ${id}:`, error);
      throw error;
    }
  },

  // Admin: Delete person
  deletePerson: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_PEOPLE}/${id}`);
    } catch (error) {
      console.error(`Failed to delete person ID ${id}:`, error);
      throw error;
    }
  }
};

// Query keys
export const personKeys = {
  all: ['people'] as const,
  details: () => [...personKeys.all, 'detail'] as const,
  detail: (id: number) => [...personKeys.details(), id] as const,
};

// React Query hooks
export const usePerson = (id: number) => {
  return useQuery({
    queryKey: personKeys.detail(id),
    queryFn: () => peopleService.getPersonDetails(String(id)),
    enabled: !!id
  });
};

export default peopleService;
