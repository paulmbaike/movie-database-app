import { useActor } from '@/services/actor-service';
import { useGenre } from '@/services/genre-service';
import movieService from '@/services/movie-service';
import { MaterialIcons } from '@expo/vector-icons';
import { HStack, Text } from '@gluestack-ui/themed';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function MovieLayout() {
  // Extract all possible path parameters
  const params = useLocalSearchParams<{ id: string; genreId: string; actorId: string }>();
  const { id, genreId, actorId } = params;
  
  const [movieTitle, setMovieTitle] = useState('');
  const [genreTitle, setGenreTitle] = useState('');
  const [actorName, setActorName] = useState('');

  const movieQuery = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovie(Number(id)),
    enabled: !!id,
  });
  const movie = movieQuery.data;

  // Fetch genre if genreId is available
  const genreQuery = useGenre(genreId || '');
  const genre = genreQuery.data;

  // Fetch actor if actorId is available
  const actorQuery = useActor(actorId ? Number(actorId) : 0);
  const actor = actorQuery.data;
  
  // Update the movie title when data changes
  useEffect(() => {
    console.log('Movie data:', movie);
    if (movie?.title) {
      setMovieTitle(movie.title);
    }
  }, [movie]);

  // Update the genre title when data changes
  useEffect(() => {
    if (genre?.name) {
      setGenreTitle(genre.name);
    }
  }, [genre]);
  
  // Update the actor name when data changes
  useEffect(() => {
    if (actor?.name) {
      setActorName(actor.name);
    }
  }, [actor]);

  const shortenedTitle = (movieTitle: string) => {
    return movieTitle.length > 20 
      ? `${movieTitle.substring(0, 20)}...` 
      : movieTitle;
  }

  // Custom movie title renderer for the movie detail page
  const renderMovieDetailTitle = () => {
    if (!movieTitle) return 'Movie Details';
    
    // Shortened title if it's too long
    
    return (
      <HStack space="sm" alignItems="center">
        <MaterialIcons name="movie" size={20} color="#000" />
        <Text fontWeight="$bold">{shortenedTitle(movieTitle)}</Text>
      </HStack>
    );
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        // Fix for the extra space at the top
        headerTransparent: false,
        // Properly handle safe area insets
        headerSafeAreaInsets: { top: 0 }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Movie Collection',
          headerRight: () => (
            <MaterialIcons name="local-movies" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: movieTitle ? shortenedTitle(movieTitle) : 'Movie Details',
          headerRight: () => (
            <MaterialIcons name="movie" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
          // headerTitle: renderMovieDetailTitle,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Add New Movie',
          headerRight: () => (
            <MaterialIcons name="add-circle" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: movieTitle ? `Edit: ${movieTitle}` : 'Edit Movie',
          headerRight: () => (
            <MaterialIcons name="edit" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
        }}
      />
      <Stack.Screen
        name="genre/[genreId]"
        options={{
          title: genreTitle ? `Movies in ${genreTitle}` : 'Genre Movies',
          headerRight: () => (
            <MaterialIcons name="category" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
        }}
      />
      <Stack.Screen
        name="actor/[actorId]"
        options={{
          title: actorName ? `Movies with ${actorName}` : 'Actor Movies',
          headerRight: () => (
            <MaterialIcons name="person" size={24} color="#000" style={{ marginRight: 15 }} />
          ),
        }}
      />
    </Stack>
    
  );
}