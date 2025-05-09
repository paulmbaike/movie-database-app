import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from './api-client';
import { Actor, ActorResponse, ActorSchema } from './types';


// Define response schemas
const PaginatedActorsSchema = z.object({
  results: z.array(ActorSchema),
  totalCount: z.number(),
});

// Query keys
export const actorKeys = {
  all: ['actors'] as const,
  lists: () => [...actorKeys.all, 'list'] as const,
  list: (filters: string) => [...actorKeys.lists(), { filters }] as const,
  details: () => [...actorKeys.all, 'detail'] as const,
  detail: (id: number) => [...actorKeys.details(), id] as const,
};

interface ActorSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ActorService {
  private readonly version = 'v1';

  async getActors(pageNumber: number = 1, pageSize: number = 10): Promise<ActorResponse> {
    const response = await apiClient.get<ActorResponse>(`${API_ENDPOINTS.ACTORS}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getActor(id: number): Promise<Actor> {
    const response = await apiClient.get<Actor>(`${API_ENDPOINTS.ACTOR_DETAILS(id.toString())}`, {
      params: { version: this.version }
    });
    return response.data;
  }

  async createActor(actor: Omit<Actor, 'id'>): Promise<Actor> {
    const response = await apiClient.post<Actor>(API_ENDPOINTS.ACTORS, actor, {
      params: { version: this.version }
    });
    return response.data;
  }

  async updateActor(id: number, actor: Partial<Actor>): Promise<void> {
    await apiClient.put(`${API_ENDPOINTS.ACTOR_DETAILS(id.toString())}`, actor, {
      params: { version: this.version }
    });
  }

  async deleteActor(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ACTOR_DETAILS(id.toString())}`, {
      params: { version: this.version }
    });
  }

  async searchActors(query: string, pageNumber: number = 1, pageSize: number = 10): Promise<ActorResponse> {
    const response = await apiClient.get<ActorResponse>(`${API_ENDPOINTS.SEARCH_ACTORS}`, {
      params: { query, pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getActorMovies(id: number, pageNumber: number = 1, pageSize: number = 10): Promise<ActorResponse> {
    const response = await apiClient.get<ActorResponse>(`${API_ENDPOINTS.ACTOR_MOVIES(id.toString())}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }
}

export const actorService = new ActorService();

// React Query hooks
export const useActors = (params: ActorSearchParams = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: actorKeys.list(JSON.stringify(params)),
    queryFn: () => actorService.getActors(params.pageNumber, params.pageSize),
  });
};

export const useActor = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: actorKeys.detail(id),
    queryFn: () => actorService.getActor(id),
    enabled: !!id,
  });
};

export const useCreateActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actorService.createActor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actorKeys.lists() });
    },
  });
};

export const useUpdateActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Actor> & { id: number }) =>
      actorService.updateActor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: actorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: actorKeys.detail(variables.id) });
    },
  });
};

export const useDeleteActor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: actorService.deleteActor,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: actorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: actorKeys.detail(id) });
    },
  });
};

export const useActorMovies = (id: number, params: ActorSearchParams = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [...actorKeys.detail(id), 'movies', JSON.stringify(params)],
    queryFn: () => actorService.getActorMovies(id, params.pageNumber, params.pageSize),
    enabled: !!id,
  });
};

export default actorService;
