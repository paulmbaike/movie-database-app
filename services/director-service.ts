import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from './api-client';
import type { Director, DirectorResponse } from './types';

// Zod schemas
export const DirectorSchema = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PaginatedDirectorsSchema = z.object({
  items: z.array(DirectorSchema),
  totalCount: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
});

// Query keys
export const directorKeys = {
  all: ['directors'] as const,
  lists: () => [...directorKeys.all, 'list'] as const,
  list: (filters: string) => [...directorKeys.lists(), { filters }] as const,
  details: () => [...directorKeys.all, 'detail'] as const,
  detail: (id: number) => [...directorKeys.details(), id] as const,
};

interface DirectorSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class DirectorService {
  private readonly version = 'v1';

  async getDirectors(pageNumber: number = 1, pageSize: number = 10): Promise<DirectorResponse> {
    const response = await apiClient.get<DirectorResponse>(`${API_ENDPOINTS.DIRECTORS}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getDirector(id: number): Promise<Director> {
    const response = await apiClient.get<Director>(`${API_ENDPOINTS.DIRECTOR_DETAILS(id.toString())}`, {
      params: { version: this.version }
    });
    return response.data;
  }

  async createDirector(director: Omit<Director, 'id'>): Promise<Director> {
    const response = await apiClient.post<Director>(API_ENDPOINTS.DIRECTORS, director, {
      params: { version: this.version }
    });
    return response.data;
  }

  async updateDirector(id: number, director: Partial<Director>): Promise<void> {
    await apiClient.put(`${API_ENDPOINTS.DIRECTOR_DETAILS(id.toString())}`, director, {
      params: { version: this.version }
    });
  }

  async deleteDirector(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.DIRECTOR_DETAILS(id.toString())}`, {
      params: { version: this.version }
    });
  }

  async searchDirectors(query: string, pageNumber: number = 1, pageSize: number = 10): Promise<DirectorResponse> {
    const response = await apiClient.get<DirectorResponse>(`${API_ENDPOINTS.SEARCH_DIRECTORS}`, {
      params: { query, pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }
}

export const directorService = new DirectorService();

// React Query hooks
export const useDirectors = (params: DirectorSearchParams = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: directorKeys.list(JSON.stringify(params)),
    queryFn: () => directorService.getDirectors(params.pageNumber, params.pageSize),
  });
};

export const useDirector = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: directorKeys.detail(id),
    queryFn: () => directorService.getDirector(id),
    enabled: !!id,
  });
};

export const useCreateDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: directorService.createDirector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directorKeys.lists() });
    },
  });
};

export const useUpdateDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Director> & { id: number }) =>
      directorService.updateDirector(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: directorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: directorKeys.detail(variables.id) });
    },
  });
};

export const useDeleteDirector = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: directorService.deleteDirector,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: directorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: directorKeys.detail(id) });
    },
  });
};

export default directorService;
