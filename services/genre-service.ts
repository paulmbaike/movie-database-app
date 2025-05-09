import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from './api-client';
import type { Genre, GenreResponse } from './types';

// Zod schemas
export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  modifiedAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  modifiedBy: z.string().nullable(),
  isDeleted: z.boolean(),
});

// Popular genre schema
export const PopularGenreSchema = z.object({
  genre: GenreSchema,
  movieCount: z.number(),
});

export const PaginatedGenresSchema = z.object({
  items: z.array(GenreSchema),
  totalCount: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
});

// Query keys
export const genreKeys = {
  all: ['genres'] as const,
  lists: () => [...genreKeys.all, 'list'] as const,
  list: (filters: string) => [...genreKeys.lists(), { filters }] as const,
  details: () => [...genreKeys.all, 'detail'] as const,
  detail: (id: number) => [...genreKeys.details(), id] as const,
};

interface GenreSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class GenreService {
  private readonly version = 'v1';

  async getGenres(pageNumber: number = 1, pageSize: number = 10): Promise<GenreResponse> {
    const response = await apiClient.get<GenreResponse>(`${API_ENDPOINTS.GENRES}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getGenre(id: string): Promise<Genre> {
    const response = await apiClient.get<Genre>(`${API_ENDPOINTS.GENRE_DETAILS(id)}`, {
      params: { version: this.version }
    });
    return response.data;
  }

  async createGenre(genre: Omit<Genre, 'id'>): Promise<Genre> {
    const response = await apiClient.post<Genre>(API_ENDPOINTS.GENRES, genre, {
      params: { version: this.version }
    });
    return response.data;
  }

  async updateGenre(id: string, genre: Partial<Genre>): Promise<void> {
    await apiClient.put(`${API_ENDPOINTS.GENRE_DETAILS(id)}`, genre, {
      params: { version: this.version }
    });
  }

  async deleteGenre(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.GENRE_DETAILS(id)}`, {
      params: { version: this.version }
    });
  }
  
  async getAllGenres(): Promise<string[]> {
    const response = await apiClient.get<GenreResponse>(`${API_ENDPOINTS.GENRES}`, {
      params: { pageSize: 100, version: this.version }
    });
    return response.data.items.map(genre => genre.name);
  }
  
  async getPopularGenres(): Promise<z.infer<typeof PopularGenreSchema>[]> {
    const response = await apiClient.get(API_ENDPOINTS.POPULAR_GENRES, {
      params: { version: this.version }
    });
    return z.array(PopularGenreSchema).parse(response.data);
  }
}

export const genreService = new GenreService();

// React Query hooks
export const useGenres = (params: GenreSearchParams = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: genreKeys.list(JSON.stringify(params)),
    queryFn: () => genreService.getGenres(params.pageNumber, params.pageSize),
  });
};

export const useGenre = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: genreKeys.detail(Number(id)),
    queryFn: () => genreService.getGenre(id),
    enabled: !!id,
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: genreService.createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Genre> & { id: string }) =>
      genreService.updateGenre(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      queryClient.invalidateQueries({ queryKey: genreKeys.detail(Number(variables.id)) });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: genreService.deleteGenre,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      queryClient.invalidateQueries({ queryKey: genreKeys.detail(Number(id)) });
    },
  });
};

export default genreService;
