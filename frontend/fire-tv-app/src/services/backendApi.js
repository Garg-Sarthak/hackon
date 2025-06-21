// Backend API Configuration
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

// --- BACKEND MOVIE API FUNCTIONS ---

// Get popular movies from backend
export const getPopularMoviesFromBackend = async () => {
  try {
    // console.log('🎬 Backend - getPopularMoviesFromBackend called')
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/popular`)
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const movies = await response.json()
    // console.log('🎬 Backend - Popular movies fetched:', movies.length)
    return movies
  } catch (error) {
    console.error('🎬 Backend - Error fetching popular movies:', error)
    throw error
  }
}

// Get top-rated movies from backend
export const getTopRatedMoviesFromBackend = async () => {
  try {
    // console.log('⭐ Backend - getTopRatedMoviesFromBackend called')
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/top-rated`)
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const movies = await response.json()
    console.log('⭐ Backend - Top-rated movies fetched:', movies.length)
    return movies
  } catch (error) {
    console.error('⭐ Backend - Error fetching top-rated movies:', error)
    throw error
  }
}

// Get most watched movies from backend
export const getMostWatchedMoviesFromBackend = async () => {
  try {
    console.log('👁️ Backend - getMostWatchedMoviesFromBackend called')
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/most-watched`)
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const movies = await response.json()
    console.log('👁️ Backend - Most watched movies fetched:', movies.length)
    return movies
  } catch (error) {
    console.error('👁️ Backend - Error fetching most watched movies:', error)
    throw error
  }
}

// Get mood-based recommendations from backend
export const getMoodRecommendationsFromBackend = async (mood) => {
  try {
    console.log('🧠 Backend - getMoodRecommendationsFromBackend called with mood:', mood)
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/recommendations?mood=${encodeURIComponent(mood)}`)
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const movies = await response.json()
    console.log('🧠 Backend - Mood recommendations fetched:', movies.length)
    return movies
  } catch (error) {
    console.error('🧠 Backend - Error fetching mood recommendations:', error)
    throw error
  }
}

// Get personalized recommendations from backend
export const getPersonalizedRecommendationsFromBackend = async (userId) => {
  try {
    console.log('🤖 Backend - getPersonalizedRecommendationsFromBackend called for user:', userId)
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/personalized?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const movies = await response.json()
    console.log('🤖 Backend - Personalized recommendations fetched:', movies.length)
    return movies
  } catch (error) {
    console.error('🤖 Backend - Error fetching personalized recommendations:', error)
    throw error
  }
}

// --- USER TRACKING FUNCTIONS ---

// Track movie click for recommendations
export const trackMovieClick = async (userId, movieData) => {
  try {
    console.log('📊 Backend - trackMovieClick called for user:', userId, 'movie:', movieData.title)
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        movieId: movieData.id,
        movieTitle: movieData.title,
        movieGenreIds: movieData.genre_ids || [],
        movieRating: movieData.rating || movieData.vote_average || 0
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('📊 Backend - Failed to track movie click:', response.status, errorData)
      throw new Error(`Failed to track movie click: ${response.status}`)
    }
    
    console.log('📊 Backend - Movie click tracked successfully')
    return await response.json()
  } catch (error) {
    console.error('📊 Backend - Error tracking movie click:', error)
    // Don't throw the error to avoid breaking UI experience
    return null
  }
}

// --- USER HISTORY FUNCTIONS ---

// Get user's movie history
export const getUserHistory = async (userId, options = {}) => {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'clicked_at',
      order = 'desc'
    } = options
    
    console.log('📚 Backend - getUserHistory called for user:', userId)
    
    const response = await fetch(
      `${BACKEND_BASE_URL}/api/user-history?userId=${userId}&limit=${limit}&offset=${offset}&sortBy=${sortBy}&order=${order}`
    )
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📚 Backend - User history fetched:', data.history?.length || 0, 'entries')
    return data
  } catch (error) {
    console.error('📚 Backend - Error fetching user history:', error)
    throw error
  }
}

// Delete movie from user's history
export const deleteFromHistory = async (userId, movieId) => {
  try {
    console.log('🗑️ Backend - deleteFromHistory called for user:', userId, 'movie:', movieId)
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/user-history/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    })
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    console.log('🗑️ Backend - Movie deleted from history successfully')
    return await response.json()
  } catch (error) {
    console.error('🗑️ Backend - Error deleting from history:', error)
    throw error
  }
}

// Clear all user history
export const clearUserHistory = async (userId) => {
  try {
    console.log('🧹 Backend - clearUserHistory called for user:', userId)
    
    const response = await fetch(`${BACKEND_BASE_URL}/api/user-history/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    })
    
    if (!response.ok) {
      throw new Error(`Backend API failed: ${response.status}`)
    }
    
    console.log('🧹 Backend - User history cleared successfully')
    return await response.json()
  } catch (error) {
    console.error('🧹 Backend - Error clearing history:', error)
    throw error
  }
}
