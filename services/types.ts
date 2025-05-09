import { z } from 'zod';

// Common pagination response schema
export const PaginationSchema = z.object({
  items: z.array(z.any()),
  totalCount: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
});

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

// Movie schemas
export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  releaseYear: z.number(),
  plot: z.string().nullable(),
  runtimeMinutes: z.number(),
  posterUrl: z.string().nullable(),
  directorName: z.string(),
  genres: z.array(z.string()),
  actors: z.array(z.string()),
});

export const MovieResponseSchema = PaginationSchema.extend({
  items: z.array(MovieSchema),
});

// Actor schemas
export const ActorSchema = z.object({
  id: z.number(),
  name: z.string(),
  dateOfBirth: z.string(),
  bio: z.string().nullable(),
});

export const ActorResponseSchema = PaginationSchema.extend({
  items: z.array(ActorSchema),
});

// Director schemas
export const DirectorSchema = z.object({
  id: z.number(),
  name: z.string(),
  dateOfBirth: z.string(),
  bio: z.string().nullable(),
});

export const DirectorResponseSchema = PaginationSchema.extend({
  items: z.array(DirectorSchema),
});

// Genre schemas
export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

export const GenreResponseSchema = PaginationSchema.extend({
  items: z.array(GenreSchema),
});

// Types
export type Movie = z.infer<typeof MovieSchema>;
export type Actor = z.infer<typeof ActorSchema>;
export type Director = z.infer<typeof DirectorSchema>;
export type Genre = z.infer<typeof GenreSchema>;

export type MovieResponse = z.infer<typeof MovieResponseSchema>;
export type ActorResponse = z.infer<typeof ActorResponseSchema>;
export type DirectorResponse = z.infer<typeof DirectorResponseSchema>;
export type GenreResponse = z.infer<typeof GenreResponseSchema>;
