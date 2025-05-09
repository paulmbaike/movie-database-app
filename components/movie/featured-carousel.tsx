import React, { useState, useRef, useCallback } from 'react';
import { FlatList, Dimensions, ViewToken, StyleSheet } from 'react-native';
import { Box, HStack } from '@gluestack-ui/themed';
import MovieCard from './movie-card';
import { Movie } from '../../services/movie-service';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedCarouselProps {
  movies: Movie[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface ViewableItemsChangedInfo {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ 
  movies, 
  autoPlay = true, 
  autoPlayInterval = 4000 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  
  // Auto play timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlay && movies.length > 1) {
      interval = setInterval(() => {
        if (activeIndex === movies.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: 0,
            animated: true,
          });
        } else {
          flatListRef.current?.scrollToIndex({
            index: activeIndex + 1,
            animated: true,
          });
        }
      }, autoPlayInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeIndex, autoPlay, autoPlayInterval, movies.length]);
  
  // Handle viewable items changed
  const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChangedInfo) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);
  
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };
  
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);
  
  // Handle scroll event
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };
  
  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <HStack space="xs" justifyContent="center" mt="$3">
        {movies.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const isActive = activeIndex === index;
            return {
              width: withTiming(isActive ? 24 : 8, { duration: 300 }),
              opacity: withTiming(isActive ? 1 : 0.5, { duration: 300 }),
              backgroundColor: isActive ? '#0077FF' : '#CCCCCC',
            };
          });
          
          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, animatedDotStyle]}
            />
          );
        })}
      </HStack>
    );
  };
  
  return (
    <Box>
      <FlatList
        ref={flatListRef}
        data={movies}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        renderItem={({ item }) => (
          <Box width={SCREEN_WIDTH} px="$4">
            <MovieCard movie={item} variant="featured" />
          </Box>
        )}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      {movies.length > 1 && renderPaginationDots()}
    </Box>
  );
};

const styles = StyleSheet.create({
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
});

export default FeaturedCarousel;
