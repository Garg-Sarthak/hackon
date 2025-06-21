// TMDB API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_tmdb_api_key_here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// --- MOVIE API FUNCTIONS ---

// Get popular movies with pagination
export const getPopularMovies = async (page = 1) => {
  try {
    console.log('🎬 TMDB - getPopularMovies called with page:', page)
    
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    console.log('🎬 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎬 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Popular Movies API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎬 TMDB - Popular movies results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('🎬 TMDB - Error getting popular movies:', error)
    throw error
  }
}

// Get top-rated movies with pagination
export const getTopRatedMovies = async (page = 1) => {
  try {
    console.log('⭐ TMDB - getTopRatedMovies called with page:', page)
    
    const url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    console.log('⭐ TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('⭐ TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Top Rated Movies API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('⭐ TMDB - Top rated movies results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('⭐ TMDB - Error getting top rated movies:', error)
    throw error
  }
}

// Search movies with pagination
export const searchMovies = async (query, page = 1) => {
  try {
    console.log('🔍 TMDB - searchMovies called with query:', query, 'page:', page)
    
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
    console.log('🔍 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🔍 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Search API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 TMDB - Search results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('🔍 TMDB - Error searching movies:', error)
    throw error
  }
}

// Discover movies with filters and pagination
export const discoverMovies = async (filters = {}, page = 1) => {
  try {
    console.log('🔧 TMDB - discoverMovies called with filters:', filters, 'page:', page)
    
    const {
      genre,
      year,
      minRating,
      maxRating,
      sortBy = 'popularity.desc'
    } = filters
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      sort_by: sortBy,
      page: page.toString()
    })
    
    if (genre) params.append('with_genres', genre)
    if (year) params.append('primary_release_year', year)
    if (minRating) params.append('vote_average.gte', minRating)
    if (maxRating) params.append('vote_average.lte', maxRating)
    
    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`
    console.log('🔧 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🔧 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Discover API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔧 TMDB - Discover results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('🔧 TMDB - Error discovering movies:', error)
    throw error
  }
}

// Get movies by genre with pagination
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    console.log('🎭 TMDB - getMoviesByGenre called with genreId:', genreId, 'page:', page)
    
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=${page}`
    console.log('🎭 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎭 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Genre Movies API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎭 TMDB - Genre movies results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('🎭 TMDB - Error getting movies by genre:', error)
    throw error
  }
}

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    console.log('🎬 TMDB - getMovieDetails called with movieId:', movieId)
    
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    console.log('🎬 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎬 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Movie Details API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎬 TMDB - Movie details:', data.title)
    return data
  } catch (error) {
    console.error('🎬 TMDB - Error getting movie details:', error)
    throw error
  }
}

// --- TV SHOW API FUNCTIONS ---

// Get popular TV shows with pagination
export const getPopularTVShows = async (page = 1) => {
  try {
    console.log('📺 TMDB - getPopularTVShows called with page:', page)
    
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    console.log('📺 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('📺 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Popular TV Shows API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📺 TMDB - Popular TV shows results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('📺 TMDB - Error getting popular TV shows:', error)
    throw error
  }
}

// Get top-rated TV shows with pagination
export const getTopRatedTVShows = async (page = 1) => {
  try {
    console.log('⭐📺 TMDB - getTopRatedTVShows called with page:', page)
    
    const url = `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    console.log('⭐📺 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('⭐📺 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Top Rated TV Shows API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('⭐📺 TMDB - Top rated TV shows results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('⭐📺 TMDB - Error getting top rated TV shows:', error)
    throw error
  }
}

// Search TV shows with pagination
export const searchTVShows = async (query, page = 1) => {
  try {
    console.log('🔍📺 TMDB - searchTVShows called with query:', query, 'page:', page)
    
    const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
    console.log('🔍📺 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🔍📺 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB TV Search API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍📺 TMDB - TV search results:', data.results?.length || 0)
    return data
  } catch (error) {
    console.error('🔍📺 TMDB - Error searching TV shows:', error)
    throw error
  }
}

// --- UTILITY FUNCTIONS ---

// Transform movie data to consistent format
export const transformMovieData = (movie) => {
  if (!movie) {
    console.warn('transformMovieData received null/undefined movie data')
    return {
      id: 0,
      title: 'Unknown',
      image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
      rating: 0,
      year: 'N/A',
      platform: 'Various',
      genre_ids: [],
      overview: 'No description available'
    }
  }

  return {
    id: movie.id || 0,
    title: movie.title || 'Unknown Title',
    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
    rating: movie.vote_average || 0,
    year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
    platform: 'Various',
    genre_ids: movie.genre_ids || [],
    overview: movie.overview || 'No description available'
  }
}

// Transform TV show data to consistent format
export const transformTVShowData = (show) => {
  if (!show) {
    console.warn('transformTVShowData received null/undefined show data')
    return {
      id: 0,
      title: 'Unknown',
      image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
      rating: 0,
      year: 'N/A',
      platform: 'Various',
      genre_ids: [],
      overview: 'No description available'
    }
  }

  return {
    id: show.id || 0,
    title: show.name || show.original_name || 'Unknown Title',
    image: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
    rating: show.vote_average || 0,
    year: show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A',
    platform: 'Various',
    genre_ids: show.genre_ids || [],
    overview: show.overview || 'No description available'
  }
}

// Movie genres
export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
]

// TV genres
export const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
]
