import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from './api-client';

export interface MovieResponse {
  items: Movie[];
  hasNext: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export interface Movie {
  id: number;
  title: string;
  releaseYear: number;
  plot?: string;
  runtimeMinutes?: number;
  posterUrl?: string;
  directorName?: string;
  genres?: string[];
  actors?: string[];
}

// Query keys
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: string) => [...movieKeys.lists(), { filters }] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
  byActor: () => [...movieKeys.all, 'byActor'] as const,
  actorMovies: (id: number) => [...movieKeys.byActor(), id] as const,
  byGenre: () => [...movieKeys.all, 'byGenre'] as const,
  genreMovies: (id: number) => [...movieKeys.byGenre(), id] as const,
};

export interface MovieSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  releaseYear?: number;
  genreIds?: number[];
}

class MovieService {
  private readonly version = 'v1';

  async getMovies(pageNumber: number = 1, pageSize: number = 10): Promise<MovieResponse> {
    // Add artificial delay only for pagination (not first page)
    if (pageNumber > 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    const response = await apiClient.get<MovieResponse>(`${API_ENDPOINTS.MOVIES}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getMovie(id: number): Promise<Movie> {
    const response = await apiClient.get<Movie>(`${API_ENDPOINTS.MOVIES}/${id}`, {
      params: { version: this.version }
    });
    return response.data;
  }

  async createMovie(movie: Omit<Movie, 'id'>): Promise<Movie> {
    const response = await apiClient.post<Movie>(API_ENDPOINTS.MOVIES, movie, {
      params: { version: this.version }
    });
    return response.data;
  }

  async updateMovie(id: number, movie: Partial<Movie>): Promise<void> {
    await apiClient.put(`${API_ENDPOINTS.MOVIES}/${id}`, movie, {
      params: { version: this.version }
    });
  }

  async deleteMovie(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MOVIES}/${id}`, {
      params: { version: this.version }
    });
  }

  async getMoviesByActor(actorId: number, pageNumber: number = 1, pageSize: number = 10): Promise<MovieResponse> {
    const response = await apiClient.get<MovieResponse>(`${API_ENDPOINTS.MOVIES}/actor/${actorId}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async getMoviesByGenre(genreId: number, pageNumber: number = 1, pageSize: number = 10): Promise<MovieResponse> {
    const response = await apiClient.get<MovieResponse>(`${API_ENDPOINTS.MOVIES}/genre/${genreId}`, {
      params: { pageNumber, pageSize, version: this.version }
    });
    return response.data;
  }

  async searchMovies(params: MovieSearchParams): Promise<MovieResponse> {
    // Create a URLSearchParams object to properly format the query parameters
    const queryParams = new URLSearchParams();
    
    // Add basic parameters
    if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
    queryParams.append('PageNumber', String(params.pageNumber || 1));
    queryParams.append('PageSize', String(params.pageSize || 10));
    if (params.sortBy) queryParams.append('SortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('SortOrder', params.sortOrder);
    if (params.releaseYear) queryParams.append('ReleaseYear', String(params.releaseYear));
    queryParams.append('version', this.version);
    
    // Add genre IDs individually to get the correct format
    if (params.genreIds && params.genreIds.length > 0) {
      params.genreIds.forEach(genreId => {
        queryParams.append('GenreIds', String(genreId));
      });
    }
    
    // Make the request with the formatted URL
    const url = `${API_ENDPOINTS.MOVIES}/search?${queryParams.toString()}`;
    const response = await apiClient.get<MovieResponse>(url);
    return response.data;
  }
}

export const movieService = new MovieService();

// React Query hooks
export const useMovies = (params: MovieSearchParams = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: movieKeys.list(JSON.stringify(params)),
    queryFn: () => movieService.getMovies(params.pageNumber, params.pageSize),
  });
};

export const useMovie = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: movieKeys.detail(id),
    queryFn: () => movieService.getMovie(id),
    enabled: !!id,
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieService.createMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Movie> & { id: number }) =>
      movieService.updateMovie(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(variables.id) });
    },
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieService.deleteMovie,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(id) });
    },
  });
};

// Hook for fetching movies by actor
export const useMoviesByActor = (actorId: number, pageNumber: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: movieKeys.actorMovies(actorId),
    queryFn: () => movieService.getMoviesByActor(actorId, pageNumber, pageSize),
    enabled: !!actorId
  });
};

// Hook for fetching movies by genre
export const useMoviesByGenre = (genreId: number, pageNumber: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: movieKeys.genreMovies(genreId),
    queryFn: () => movieService.getMoviesByGenre(genreId, pageNumber, pageSize),
    enabled: !!genreId
  });
};

export default movieService;
