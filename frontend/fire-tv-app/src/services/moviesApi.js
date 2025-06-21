// Movies API - All movie-related API functions
import { 
  getPopularMovies,
  getTopRatedMovies,
  searchMovies,
  discoverMovies,
  getMoviesByGenre,
  getMovieDetails,
  transformMovieData,
  MOVIE_GENRES
} from './tmdbApi'

import {
  getPopularMoviesFromBackend,
  getTopRatedMoviesFromBackend,
  getMostWatchedMoviesFromBackend,
  getMoodRecommendationsFromBackend,
  getPersonalizedRecommendationsFromBackend,
  trackMovieClick,
  getUserHistory,
  deleteFromHistory,
  clearUserHistory
} from './backendApi'

// --- MAIN MOVIE DATA FETCHING ---

// Fetch movies with pagination and optional filters
export const fetchMoviesWithPagination = async (type = 'popular', page = 1, query = '', filters = {}) => {
  try {
    console.log(`🎬 Movies API - fetchMoviesWithPagination: ${type}, page: ${page}`)
    
    let response
    
    switch (type) {
      case 'popular':
        response = await getPopularMovies(page)
        break
      case 'top-rated':
        response = await getTopRatedMovies(page)
        break
      case 'search':
        response = await searchMovies(query, page)
        break
      case 'discover':
        response = await discoverMovies({
          genre: filters.genre,
          year: filters.year,
          minRating: filters.minRating,
          maxRating: filters.maxRating,
          sortBy: filters.sortBy
        }, page)
        break
      default:
        response = await getPopularMovies(page)
    }
    
    const transformedResults = response.results.map(transformMovieData).filter(movie => movie && movie.id)
    
    return {
      results: transformedResults,
      totalPages: response.total_pages,
      totalResults: response.total_results,
      currentPage: response.page
    }
  } catch (error) {
    console.error('🎬 Movies API - Error fetching movies:', error)
    throw error
  }
}

// Load initial movies data
export const loadInitialMovies = async () => {
  try {
    console.log('🎬 Movies API - Loading initial movies data')
    
    // First try to get data from backend
    try {
      const backendMovies = await getPopularMoviesFromBackend()
      if (backendMovies && backendMovies.length > 0) {
        console.log('🎬 Movies API - Using backend data:', backendMovies.length, 'movies')
        
        // Transform backend data to consistent format
        const transformedBackendData = backendMovies.map(movie => ({
          id: movie.id || 0,
          title: movie.title || 'Unknown Title',
          image: movie.poster_url || movie.image || 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
          rating: movie.rating || movie.vote_average || 0,
          year: movie.release_year || movie.year || 'N/A',
          platform: movie.platform || 'Various',
          genre_ids: movie.genre_ids || [],
          overview: movie.overview || 'No description available'
        }))
        
        return {
          results: transformedBackendData,
          totalPages: 1,
          totalResults: backendMovies.length,
          currentPage: 1,
          source: 'backend'
        }
      }
    } catch (backendError) {
      console.warn('🎬 Movies API - Backend not available, falling back to TMDB:', backendError.message)
    }
    
    // Fallback to TMDB
    const tmdbData = await getPopularMovies(1)
    return {
      results: tmdbData.results.map(transformMovieData),
      totalPages: tmdbData.total_pages,
      totalResults: tmdbData.total_results,
      currentPage: tmdbData.page,
      source: 'tmdb'
    }
  } catch (error) {
    console.error('🎬 Movies API - Error loading initial movies:', error)
    throw error
  }
}

// Search movies
export const searchMoviesAPI = async (query, page = 1) => {
  try {
    console.log('🔍 Movies API - Searching movies:', query)
    
    if (!query.trim()) {
      return await fetchMoviesWithPagination('popular', page)
    }
    
    const searchResults = await fetchMoviesWithPagination('search', page, query)
    console.log('🔍 Movies API - Search completed:', searchResults.results.length, 'results')
    return searchResults
  } catch (error) {
    console.error('🔍 Movies API - Error searching movies:', error)
    throw error
  }
}

// --- MOVIE RECOMMENDATION FUNCTIONS ---

// Get mood-based movie recommendations
export const getMoodBasedMovies = async (mood) => {
  try {
    console.log('🧠 Movies API - Getting mood-based recommendations:', mood)
    
    // Try backend first
    try {
      const backendRecs = await getMoodRecommendationsFromBackend(mood)
      if (backendRecs && backendRecs.length > 0) {
        return backendRecs
      }
    } catch (backendError) {
      console.warn('🧠 Movies API - Backend mood recs not available, using TMDB fallback')
    }
    
    // Fallback to TMDB with genre mapping
    const moodToGenreMap = {
      'happy': [35, 10751, 16], // Comedy, Family, Animation
      'sad': [18, 10749], // Drama, Romance
      'excited': [28, 12, 878], // Action, Adventure, Sci-Fi
      'relaxed': [35, 10751], // Comedy, Family
      'adventurous': [12, 14, 28], // Adventure, Fantasy, Action
      'romantic': [10749, 35], // Romance, Comedy
      'thrilled': [53, 27, 80], // Thriller, Horror, Crime
      'nostalgic': [18, 36], // Drama, History
    }
    
    const genres = moodToGenreMap[mood.toLowerCase()] || [28, 35] // Default to Action, Comedy
    const randomGenre = genres[Math.floor(Math.random() * genres.length)]
    
    const response = await getMoviesByGenre(randomGenre, 1)
    return response.results.map(transformMovieData)
  } catch (error) {
    console.error('🧠 Movies API - Error getting mood-based movies:', error)
    throw error
  }
}

// Get personalized movie recommendations
export const getPersonalizedMovies = async (userId) => {
  try {
    console.log('🤖 Movies API - Getting personalized recommendations for user:', userId)
    
    if (!userId) {
      // If no user, return popular movies
      const response = await getPopularMovies(1)
      return response.results.map(transformMovieData)
    }
    
    // Try backend first
    try {
      const backendRecs = await getPersonalizedRecommendationsFromBackend(userId)
      if (backendRecs && backendRecs.length > 0) {
        return backendRecs
      }
    } catch (backendError) {
      console.warn('🤖 Movies API - Backend personalized recs not available, using TMDB fallback')
    }
    
    // Fallback to TMDB popular movies
    const response = await getPopularMovies(1)
    return response.results.map(transformMovieData)
  } catch (error) {
    console.error('🤖 Movies API - Error getting personalized movies:', error)
    throw error
  }
}

// --- MOVIE INTERACTION FUNCTIONS ---

// Track movie click for analytics and recommendations
export const trackMovieInteraction = async (userId, movieData) => {
  try {
    if (!userId || !movieData) {
      console.warn('📊 Movies API - Missing userId or movieData for tracking')
      return null
    }
    
    console.log('📊 Movies API - Tracking movie interaction:', movieData.title)
    return await trackMovieClick(userId, movieData)
  } catch (error) {
    console.error('📊 Movies API - Error tracking movie interaction:', error)
    // Don't throw to avoid breaking UI
    return null
  }
}

// --- USER HISTORY FUNCTIONS ---

// Get user's movie viewing history
export const getMovieHistory = async (userId, options = {}) => {
  try {
    console.log('📚 Movies API - Getting movie history for user:', userId)
    
    if (!userId) {
      return { history: [], total: 0, hasMore: false }
    }
    
    return await getUserHistory(userId, options)
  } catch (error) {
    console.error('📚 Movies API - Error getting movie history:', error)
    throw error
  }
}

// Remove movie from user's history
export const removeFromMovieHistory = async (userId, movieId) => {
  try {
    console.log('🗑️ Movies API - Removing movie from history:', movieId)
    
    if (!userId || !movieId) {
      throw new Error('Missing userId or movieId')
    }
    
    return await deleteFromHistory(userId, movieId)
  } catch (error) {
    console.error('🗑️ Movies API - Error removing from history:', error)
    throw error
  }
}

// Clear all movie history for user
export const clearMovieHistory = async (userId) => {
  try {
    console.log('🧹 Movies API - Clearing all movie history for user:', userId)
    
    if (!userId) {
      throw new Error('Missing userId')
    }
    
    return await clearUserHistory(userId)
  } catch (error) {
    console.error('🧹 Movies API - Error clearing movie history:', error)
    throw error
  }
}

// --- MOVIE DETAILS ---

// Get detailed information about a specific movie
export const getMovieDetailsById = async (movieId) => {
  try {
    console.log('🎬 Movies API - Getting movie details for ID:', movieId)
    
    const movieDetails = await getMovieDetails(movieId)
    return transformMovieData(movieDetails)
  } catch (error) {
    console.error('🎬 Movies API - Error getting movie details:', error)
    throw error
  }
}

// --- EXPORTS ---

// Re-export utility functions and constants
export {
  transformMovieData,
  MOVIE_GENRES
}

// Re-export backend functions that might be used directly
export {
  getPopularMoviesFromBackend,
  getTopRatedMoviesFromBackend,
  getMostWatchedMoviesFromBackend
}
