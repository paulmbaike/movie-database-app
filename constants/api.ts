// API endpoints and configuration
export const API_BASE_URL = 'http://192.168.0.41:5036'; // Local API URL
export const API_VERSION = 'v1';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `/api/${API_VERSION}/auth/login`,
  REGISTER: `/api/${API_VERSION}/auth/register`,
  REFRESH_TOKEN: `/api/${API_VERSION}/auth/refresh`,
  LOGOUT: `/api/${API_VERSION}/auth/logout`,
  CHANGE_PASSWORD: `/api/${API_VERSION}/auth/change-password`,
  
  // Movies
  MOVIES: `/api/${API_VERSION}/movies`,
  MOVIE_DETAILS: (id: string) => `/api/${API_VERSION}/movies/${id}`,
  SEARCH_MOVIES: `/api/${API_VERSION}/movies/search`,
  ACTOR_MOVIES: (id: string) => `/api/${API_VERSION}/movies/actors/${id}`,
  
  // Genres
  GENRES: `/api/${API_VERSION}/genres`,
  GENRE_DETAILS: (id: string) => `/api/${API_VERSION}/genres/${id}`,
  POPULAR_GENRES: `/api/${API_VERSION}/movies/genre/popular`,
  
  // Actors
  ACTORS: `/api/${API_VERSION}/actors`,
  ACTOR_DETAILS: (id: string) => `/api/${API_VERSION}/actors/${id}`,
  SEARCH_ACTORS: `/api/${API_VERSION}/actors/search`,
  
  // Directors
  DIRECTORS: `/api/${API_VERSION}/directors`,
  DIRECTOR_DETAILS: (id: string) => `/api/${API_VERSION}/directors/${id}`,
  SEARCH_DIRECTORS: `/api/${API_VERSION}/directors/search`,
  
  // People (combined actors and directors)
  PEOPLE: `/api/${API_VERSION}/movies/people`,
  POPULAR_PEOPLE: `/api/${API_VERSION}/movies/people/popular`,
  PERSON_DETAILS: (id: string) => `/api/${API_VERSION}/movies/people/${id}`,
  SEARCH_PEOPLE: `/api/${API_VERSION}/movies/people/search`,
  ADMIN_PEOPLE: `/api/${API_VERSION}/admin/people`,
  
  // For future implementation
  // User specific
  FAVORITES: `/api/${API_VERSION}/user/favorites`,
  WATCHLIST: `/api/${API_VERSION}/user/watchlist`,
};

export const TOKEN_STORAGE_KEY = 'movie_database_auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'movie_database_refresh_token';
