// TV Shows API - All TV show-related API functions
import { 
  getPopularTVShows,
  getTopRatedTVShows,
  searchTVShows,
  transformTVShowData,
  TV_GENRES
} from './tmdbApi'

// Note: Backend doesn't have TV show endpoints yet, so we'll primarily use TMDB

// --- MAIN TV SHOW DATA FETCHING ---

// Fetch TV shows with pagination and optional filters
export const fetchTVShowsWithPagination = async (type = 'popular', page = 1, query = '', filters = {}) => {
  try {
    console.log(`📺 TV API - fetchTVShowsWithPagination: ${type}, page: ${page}`)
    
    let response
    
    switch (type) {
      case 'popular':
        response = await getPopularTVShows(page)
        break
      case 'top-rated':
        response = await getTopRatedTVShows(page)
        break
      case 'search':
        response = await searchTVShows(query, page)
        break
      case 'discover':
        // For now, fallback to popular since TMDB TV discover is more complex
        response = await getPopularTVShows(page)
        break
      default:
        response = await getPopularTVShows(page)
    }
    
    const transformedResults = response.results.map(transformTVShowData)
    
    return {
      results: transformedResults,
      totalPages: response.total_pages,
      totalResults: response.total_results,
      currentPage: response.page
    }
  } catch (error) {
    console.error('📺 TV API - Error fetching TV shows:', error)
    throw error
  }
}

// Load initial TV shows data
export const loadInitialTVShows = async () => {
  try {
    console.log('📺 TV API - Loading initial TV shows data')
    
    // For now, we only have TMDB data for TV shows
    const tmdbData = await getPopularTVShows(1)
    return {
      results: tmdbData.results.map(transformTVShowData),
      totalPages: tmdbData.total_pages,
      totalResults: tmdbData.total_results,
      currentPage: tmdbData.page,
      source: 'tmdb'
    }
  } catch (error) {
    console.error('📺 TV API - Error loading initial TV shows:', error)
    throw error
  }
}

// Search TV shows
export const searchTVShowsAPI = async (query, page = 1) => {
  try {
    console.log('🔍 TV API - Searching TV shows:', query)
    
    if (!query.trim()) {
      return await fetchTVShowsWithPagination('popular', page)
    }
    
    const searchResults = await fetchTVShowsWithPagination('search', page, query)
    console.log('🔍 TV API - Search completed:', searchResults.results.length, 'results')
    return searchResults
  } catch (error) {
    console.error('🔍 TV API - Error searching TV shows:', error)
    throw error
  }
}

// --- TV SHOW RECOMMENDATION FUNCTIONS ---

// Get mood-based TV show recommendations
export const getMoodBasedTVShows = async (mood) => {
  try {
    console.log('🧠 TV API - Getting mood-based recommendations:', mood)
    
    // Use TMDB popular TV shows as fallback for mood recommendations
    // In the future, this could be enhanced with genre-based filtering
    const response = await getPopularTVShows(1)
    return response.results.map(transformTVShowData)
  } catch (error) {
    console.error('🧠 TV API - Error getting mood-based TV shows:', error)
    throw error
  }
}

// Get personalized TV show recommendations
export const getPersonalizedTVShows = async (userId) => {
  try {
    console.log('🤖 TV API - Getting personalized recommendations for user:', userId)
    
    // For now, return popular TV shows
    // In the future, this could use backend personalization
    const response = await getPopularTVShows(1)
    return response.results.map(transformTVShowData)
  } catch (error) {
    console.error('🤖 TV API - Error getting personalized TV shows:', error)
    throw error
  }
}

// --- TV SHOW INTERACTION FUNCTIONS ---

// Track TV show click for analytics and recommendations
export const trackTVShowInteraction = async (userId, tvShowData) => {
  try {
    if (!userId || !tvShowData) {
      console.warn('📊 TV API - Missing userId or tvShowData for tracking')
      return null
    }
    
    console.log('📊 TV API - Tracking TV show interaction:', tvShowData.title)
    
    // For now, we don't have backend TV show tracking
    // In the future, this could call a backend API similar to trackMovieClick
    console.log('📊 TV API - TV show tracking not implemented yet')
    return null
  } catch (error) {
    console.error('📊 TV API - Error tracking TV show interaction:', error)
    // Don't throw to avoid breaking UI
    return null
  }
}

// --- TV SHOW FILTERING HELPERS ---

// Filter TV shows by genre (client-side filtering for now)
export const filterTVShowsByGenre = (tvShows, genreId) => {
  if (!genreId) return tvShows
  
  return tvShows.filter(show => 
    show.genre_ids && show.genre_ids.includes(parseInt(genreId))
  )
}

// Filter TV shows by rating (client-side filtering)
export const filterTVShowsByRating = (tvShows, minRating, maxRating) => {
  if (!minRating && !maxRating) return tvShows
  
  return tvShows.filter(show => {
    const rating = show.rating || 0
    const meetsMin = !minRating || rating >= parseFloat(minRating)
    const meetsMax = !maxRating || rating <= parseFloat(maxRating)
    return meetsMin && meetsMax
  })
}

// Filter TV shows by year (client-side filtering)
export const filterTVShowsByYear = (tvShows, year) => {
  if (!year) return tvShows
  
  return tvShows.filter(show => show.year === year.toString())
}

// Sort TV shows
export const sortTVShows = (tvShows, sortBy) => {
  const sorted = [...tvShows]
  
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'year':
      return sorted.sort((a, b) => parseInt(b.year) - parseInt(a.year))
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'popularity':
    default:
      // Already sorted by popularity from TMDB
      return sorted
  }
}

// Apply all filters and sorting to TV shows
export const applyTVShowFilters = (tvShows, filters) => {
  let filteredShows = [...tvShows]
  
  if (filters.genre) {
    filteredShows = filterTVShowsByGenre(filteredShows, filters.genre)
  }
  
  if (filters.minRating || filters.maxRating) {
    filteredShows = filterTVShowsByRating(filteredShows, filters.minRating, filters.maxRating)
  }
  
  if (filters.year) {
    filteredShows = filterTVShowsByYear(filteredShows, filters.year)
  }
  
  if (filters.sortBy) {
    filteredShows = sortTVShows(filteredShows, filters.sortBy)
  }
  
  return filteredShows
}

// --- EXPORTS ---

// Re-export utility functions and constants
export {
  transformTVShowData,
  TV_GENRES
}

// Export TMDB functions that might be used directly
export {
  getPopularTVShows,
  getTopRatedTVShows,
  searchTVShows
}
