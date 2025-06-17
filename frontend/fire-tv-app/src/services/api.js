// API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_tmdb_api_key_here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your_gemini_api_key_here'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

// Genre mapping for mood-based searches
const genreMapping = {
  action: { movie: 28, tv: 10759 },
  adventure: { movie: 12, tv: 10759 },
  comedy: { movie: 35, tv: 35 },
  drama: { movie: 18, tv: 18 },
  horror: { movie: 27, tv: 10767 },
  romance: { movie: 10749, tv: 10749 },
  thriller: { movie: 53, tv: 9648 },
  scifi: { movie: 878, tv: 10765 },
  fantasy: { movie: 14, tv: 10765 },
  mystery: { movie: 9648, tv: 9648 },
  crime: { movie: 80, tv: 80 },
  family: { movie: 10751, tv: 10751 },
  animation: { movie: 16, tv: 16 },
  documentary: { movie: 99, tv: 99 }
}

// Company mapping for production company searches
const companyMapping = {
  'marvel': 420,
  'dc': 9993,
  'disney': 2,
  'pixar': 3,
  'netflix': 213,
  'hbo': 3268,
  'warner bros': 174,
  'universal': 33,
  'paramount': 4,
  'sony': 5,
  'fox': 25,
  'dreamworks': 521,
  'studio ghibli': 10342,
  'a24': 41077,
  'blumhouse': 3172,
  'lucasfilm': 1
}

// Mock fallback data
const mockResults = {
  movies: [
    { id: 1, title: 'Stranger Things', poster_path: '/path1.jpg', vote_average: 8.7, release_date: '2022-07-01', overview: 'A sci-fi horror series...' },
    { id: 2, title: 'The Boys', poster_path: '/path2.jpg', vote_average: 8.8, release_date: '2022-06-03', overview: 'A superhero satire...' },
    { id: 3, title: 'Breaking Bad', poster_path: '/path3.jpg', vote_average: 9.5, release_date: '2008-01-20', overview: 'A chemistry teacher turns to cooking meth...' },
    { id: 4, title: 'Game of Thrones', poster_path: '/path4.jpg', vote_average: 9.2, release_date: '2011-04-17', overview: 'A fantasy drama series...' },
    { id: 5, title: 'The Witcher', poster_path: '/path5.jpg', vote_average: 8.1, release_date: '2019-12-20', overview: 'A monster hunter in a fantasy world...' },
    { id: 6, title: 'House of the Dragon', poster_path: '/path6.jpg', vote_average: 8.4, release_date: '2022-08-21', overview: 'A Game of Thrones prequel...' }
  ],
  action: [
    { id: 11, title: 'John Wick 4', poster_path: '/path11.jpg', vote_average: 8.2, release_date: '2023-03-24', overview: 'Action-packed thriller...' },
    { id: 12, title: 'Fast X', poster_path: '/path12.jpg', vote_average: 7.8, release_date: '2023-05-19', overview: 'High-octane car action...' },
    { id: 13, title: 'Extraction 2', poster_path: '/path13.jpg', vote_average: 7.9, release_date: '2023-06-16', overview: 'Military action thriller...' }
  ],
  comedy: [
    { id: 21, title: 'Ted Lasso', poster_path: '/path21.jpg', vote_average: 8.8, release_date: '2020-08-14', overview: 'Heartwarming comedy series...' },
    { id: 22, title: 'The Office', poster_path: '/path22.jpg', vote_average: 9.0, release_date: '2005-03-24', overview: 'Workplace mockumentary...' },
    { id: 23, title: 'Brooklyn Nine-Nine', poster_path: '/path23.jpg', vote_average: 8.4, release_date: '2013-09-17', overview: 'Police comedy series...' }
  ]
}

// TMDB API functions with fallback
export const searchMovies = async (query) => {
  try {
    console.log('🎬 TMDB - searchMovies called with query:', query)
    console.log('🎬 TMDB - Using API key:', TMDB_API_KEY.substring(0, 8) + '...')
    
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    console.log('🎬 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎬 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('🎬 TMDB - API error:', response.status, response.statusText)
      throw new Error(`TMDB API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎬 TMDB - Raw response data:', data)
    console.log('🎬 TMDB - Movies found:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('🎬 TMDB - Error searching movies:', error)
    console.log('🎬 TMDB - Falling back to mock data')
    // Return mock data as fallback
    const mockResult = mockResults.movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    )
    console.log('🎬 TMDB - Mock movies returned:', mockResult.length)
    return mockResult
  }
}

export const searchTVShows = async (query) => {
  try {
    console.log('📺 TMDB - searchTVShows called with query:', query)
    
    const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    console.log('📺 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('📺 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('📺 TMDB - API error:', response.status, response.statusText)
      throw new Error(`TMDB API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📺 TMDB - Raw response data:', data)
    console.log('📺 TMDB - TV shows found:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('📺 TMDB - Error searching TV shows:', error)
    console.log('📺 TMDB - Falling back to mock data')
    // Return mock data as fallback
    const mockResult = mockResults.movies.filter(show => 
      show.title.toLowerCase().includes(query.toLowerCase())
    )
    console.log('📺 TMDB - Mock TV shows returned:', mockResult.length)
    return mockResult
  }
}

export const searchMulti = async (query) => {
  try {
    console.log('🔍 TMDB - searchMulti called with query:', query)
    
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    console.log('🔍 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🔍 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('🔍 TMDB - API error:', response.status, response.statusText)
      throw new Error(`TMDB API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 TMDB - Raw response data:', data)
    console.log('🔍 TMDB - Multi search results found:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('🔍 TMDB - Error in multi search:', error)
    console.log('🔍 TMDB - Falling back to mock data')
    // Return mock data as fallback
    const mockResult = mockResults.movies.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    )
    console.log('🔍 TMDB - Mock multi search returned:', mockResult.length)
    return mockResult
  }
}

export const getMoviesByGenre = async (genreId) => {
  try {
    console.log('Getting movies by genre:', genreId)
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies by genre')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching movies by genre:', error)
    throw error
  }
}

export const getTVShowsByGenre = async (genreId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch TV shows by genre')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching TV shows by genre:', error)
    throw error
  }
}

// Search for people (actors, directors, etc.)
export const searchPerson = async (personName) => {
  try {
    console.log('👤 TMDB - searchPerson called with:', personName)
    
    const url = `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(personName)}&language=en-US&page=1`
    console.log('👤 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('👤 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Person Search API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('👤 TMDB - Person search results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('👤 TMDB - Error searching person:', error)
    throw error
  }
}

// Get movies by person (actor/director)
export const getMoviesByPerson = async (personId, jobType = 'actor') => {
  try {
    console.log('🎭 TMDB - getMoviesByPerson called with personId:', personId, 'jobType:', jobType)
    
    // For actors, use cast; for directors/crew, use crew
    const endpoint = jobType === 'actor' ? 'movie_credits' : 'movie_credits'
    const url = `${TMDB_BASE_URL}/person/${personId}/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`
    console.log('🎭 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎭 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Person Credits API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎭 TMDB - Person credits data:', data)
    
    // Return cast for actors, crew for directors/writers
    if (jobType === 'actor') {
      return data.cast || []
    } else {
      // Filter crew by job type (Director, Writer, Producer, etc.)
      const crew = data.crew || []
      if (jobType === 'director') {
        return crew.filter(item => item.job === 'Director').map(item => item)
      } else if (jobType === 'writer') {
        return crew.filter(item => item.job === 'Writer' || item.job === 'Screenplay').map(item => item)
      } else {
        return crew
      }
    }
  } catch (error) {
    console.error('🎭 TMDB - Error getting movies by person:', error)
    throw error
  }
}

// Get TV shows by person
export const getTVShowsByPerson = async (personId) => {
  try {
    console.log('📺👤 TMDB - getTVShowsByPerson called with personId:', personId)
    
    const url = `${TMDB_BASE_URL}/person/${personId}/tv_credits?api_key=${TMDB_API_KEY}&language=en-US`
    console.log('📺👤 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('📺👤 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Person TV Credits API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📺👤 TMDB - Person TV credits:', data.cast?.length || 0)
    return data.cast || []
  } catch (error) {
    console.error('📺👤 TMDB - Error getting TV shows by person:', error)
    throw error
  }
}

// Discover movies by year
export const getMoviesByYear = async (year) => {
  try {
    console.log('📅 TMDB - getMoviesByYear called with year:', year)
    
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=${year}&language=en-US&sort_by=popularity.desc&page=1`
    console.log('📅 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('📅 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Year Discovery API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📅 TMDB - Movies by year results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('📅 TMDB - Error getting movies by year:', error)
    throw error
  }
}

// Discover TV shows by year
export const getTVShowsByYear = async (year) => {
  try {
    console.log('📅📺 TMDB - getTVShowsByYear called with year:', year)
    
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date_year=${year}&language=en-US&sort_by=popularity.desc&page=1`
    console.log('📅📺 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('📅📺 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB TV Year Discovery API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📅📺 TMDB - TV shows by year results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('📅📺 TMDB - Error getting TV shows by year:', error)
    throw error
  }
}

// Get trending content
export const getTrendingContent = async (mediaType = 'all', timeWindow = 'week') => {
  try {
    console.log('🔥 TMDB - getTrendingContent called with:', mediaType, timeWindow)
    
    const url = `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=en-US`
    console.log('🔥 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🔥 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Trending API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔥 TMDB - Trending results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('🔥 TMDB - Error getting trending content:', error)
    throw error
  }
}

// Get top rated content
export const getTopRatedContent = async (mediaType = 'movie') => {
  try {
    console.log('⭐ TMDB - getTopRatedContent called with mediaType:', mediaType)
    
    const url = `${TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    console.log('⭐ TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('⭐ TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Top Rated API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('⭐ TMDB - Top rated results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('⭐ TMDB - Error getting top rated content:', error)
    throw error
  }
}

// Get now playing movies
export const getNowPlayingMovies = async () => {
  try {
    console.log('🎬🎭 TMDB - getNowPlayingMovies called')
    
    const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    console.log('🎬🎭 TMDB - Request URL:', url)
    
    const response = await fetch(url)
    console.log('🎬🎭 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Now Playing API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🎬🎭 TMDB - Now playing results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('🎬🎭 TMDB - Error getting now playing movies:', error)
    throw error
  }
}

// Advanced discover with multiple filters
export const discoverContent = async (filters = {}) => {
  try {
    console.log('🔍 TMDB - discoverContent called with filters:', filters)
    
    const {
      mediaType = 'movie',
      genre,
      year,
      minRating,
      maxRating,
      sortBy = 'popularity.desc',
      withPeople,
      withCompanies,
      withKeywords
    } = filters
    
    const baseUrl = `${TMDB_BASE_URL}/discover/${mediaType}`
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      sort_by: sortBy,
      page: '1'
    })
    
    if (genre) params.append('with_genres', genre)
    if (year) {
      if (mediaType === 'movie') {
        params.append('primary_release_year', year)
      } else {
        params.append('first_air_date_year', year)
      }
    }
    if (minRating) params.append('vote_average.gte', minRating)
    if (maxRating) params.append('vote_average.lte', maxRating)
    if (withPeople) params.append('with_people', withPeople)
    if (withCompanies) params.append('with_companies', withCompanies)
    if (withKeywords) params.append('with_keywords', withKeywords)
    
    const url = `${baseUrl}?${params.toString()}`
    console.log('🔍 TMDB - Discover URL:', url)
    
    const response = await fetch(url)
    console.log('🔍 TMDB - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`TMDB Discover API failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('🔍 TMDB - Discover results:', data.results?.length || 0)
    return data.results || []
  } catch (error) {
    console.error('🔍 TMDB - Error in discover content:', error)
    throw error
  }
}

// Gemini API function
export const processVoiceInput = async (input) => {
  console.log('🤖 Gemini - processVoiceInput called with:', input)
  console.log('🤖 Gemini - Using API key:', GEMINI_API_KEY.substring(0, 8) + '...')
    try {    const prompt = `
    You are an advanced AI assistant for a comprehensive movie/TV show search system. Analyze and process this user voice input: "${input}"
    
    Your tasks:
    1. CORRECT any errors in the name of movies/TV shows/people by inferring the correct spelling (e.g., "strange rings" → "Stranger Things", "avingers" → "Avengers", "Amir khan" → "Aamir Khan")
    2. INTERPRET the user's intent and extract search parameters including complex multi-criteria searches
    3. CLASSIFY the search type and determine appropriate content filtering and API calls needed
    4. EXTRACT specific parameters like years, ratings, people names, companies, etc.
    
    Search Types:
    - "specific": Searching for a particular title (movie/show name)
    - "genre": Looking for content by genre/mood (action, comedy, horror, etc.)
    - "person": Searching by actor, director, writer, producer name
    - "year": Searching by release year or decade
    - "trending": Looking for trending/popular content
    - "top_rated": Looking for highest rated content
    - "now_playing": Looking for currently playing movies
    - "company": Searching by production company (Disney, Netflix, Marvel, etc.)
    - "multi_criteria": Complex searches with multiple filters (e.g., "90s action movies with Bruce Willis")
    - "mood_time": Time-based mood searches (e.g., "weekend binge watch", "date night movies")
    - "general": General or unclear queries
    
    Content Types:
    - "movie": User specifically wants movies
    - "tv": User specifically wants TV shows/series
    - "both": No specific preference or both mentioned
    
    Person Types (for person searches):
    - "actor": Searching for actor's filmography
    - "director": Searching for director's works
    - "writer": Searching for writer's works
    - "producer": Searching for producer's works
    - "any": Any person-related search
    
    Available Genres: action, adventure, comedy, drama, horror, romance, thriller, scifi, fantasy, mystery, crime, family, animation, documentary
    
    Special Keywords Recognition:
    - Time periods: "90s", "2000s", "recent", "old", "classic", "new releases"
    - Quality: "best", "top rated", "highly rated", "award winning", "critically acclaimed"
    - Popularity: "trending", "popular", "viral", "hot", "latest"
    - Mood: "feel good", "uplifting", "dark", "intense", "light hearted", "binge watch"
    - Occasion: "date night", "family time", "weekend", "Friday night", "holiday"
    - Production: "Marvel", "DC", "Disney", "Netflix", "HBO", "Pixar", "Studio Ghibli"
    
    IMPORTANT INTERPRETATION RULES:
    - Fix obvious speech recognition errors in titles, names, and companies
    - Interpret casual language and slang appropriately
    - Handle multi-part queries (e.g., "Aamir Khan comedy movies from 2010s")
    - Extract specific years from decade references (e.g., "90s" → years 1990-1999)
    - Recognize production companies and franchises
    - Understand regional cinema references (Bollywood, Hollywood, etc.)
    - Handle comparative queries (e.g., "like Breaking Bad but funnier")
    
    Respond in this EXACT JSON format:
    {
      "type": "specific" | "genre" | "person" | "year" | "trending" | "top_rated" | "now_playing" | "company" | "multi_criteria" | "mood_time" | "general",
      "query": "corrected and cleaned primary search term",
      "content_type": "movie" | "tv" | "both",
      "person_name": "person name" (only if type includes person search),
      "person_type": "actor" | "director" | "writer" | "producer" | "any" (only for person searches),
      "genre": "genre_name" (if genre is involved),
      "year": "YYYY" | "YYYY-YYYY" (if year/decade is specified),
      "company": "company_name" (if production company mentioned),
      "rating_filter": "high" | "medium" | "any" (quality preference),
      "mood": "feel_good" | "dark" | "intense" | "light" | "binge" | "date_night" | "family" | null,
      "specific_titles": ["title1", "title2"] (if multiple specific titles mentioned),
      "filters": {
        "min_rating": number (if quality specified),
        "sort_by": "popularity" | "rating" | "release_date" | "relevance",
        "time_period": "recent" | "classic" | "decade" | null
      },
      "search_strategy": "single_api" | "multi_step" | "complex_discovery",
      "api_calls_needed": ["search_person", "get_movies_by_person", "discover_with_filters", etc.],
      "confidence": 0.0-1.0,
      "original_corrected": "explanation of any corrections made and interpretation logic"
    }
    
    Examples:
    - "Show me Aamir Khan movies" → {"type": "person", "query": "Aamir Khan", "person_name": "Aamir Khan", "person_type": "actor", "content_type": "movie", "search_strategy": "multi_step", "api_calls_needed": ["search_person", "get_movies_by_person"], "confidence": 0.95, "original_corrected": "Recognized person search for actor"}
    
    - "90s action movies with Bruce Willis" → {"type": "multi_criteria", "query": "90s action Bruce Willis", "content_type": "movie", "person_name": "Bruce Willis", "person_type": "actor", "genre": "action", "year": "1990-1999", "search_strategy": "complex_discovery", "api_calls_needed": ["search_person", "discover_with_filters"], "confidence": 0.9, "original_corrected": "Multi-criteria search combining decade, genre, and actor"}
    
    - "What's trending right now" → {"type": "trending", "query": "trending now", "content_type": "both", "search_strategy": "single_api", "api_calls_needed": ["get_trending"], "confidence": 0.9, "original_corrected": "Trending content request"}
    
    - "Best Marvel movies" → {"type": "company", "query": "Marvel movies", "content_type": "movie", "company": "Marvel", "rating_filter": "high", "search_strategy": "complex_discovery", "api_calls_needed": ["discover_with_company", "sort_by_rating"], "confidence": 0.85, "original_corrected": "Company-specific high-quality content"}
    
    - "Something funny for date night" → {"type": "mood_time", "query": "romantic comedy", "content_type": "both", "genre": "comedy", "mood": "date_night", "search_strategy": "single_api", "api_calls_needed": ["get_by_genre_filtered"], "confidence": 0.8, "original_corrected": "Interpreted as romantic comedy for couples"}
    
    - "Christopher Nolan sci-fi films" → {"type": "multi_criteria", "query": "Christopher Nolan sci-fi", "person_name": "Christopher Nolan", "person_type": "director", "genre": "scifi", "content_type": "movie", "search_strategy": "multi_step", "api_calls_needed": ["search_person", "get_movies_by_person", "filter_by_genre"], "confidence": 0.95, "original_corrected": "Director-specific genre filtering"}
    
    - "Top rated TV shows from 2020" → {"type": "multi_criteria", "query": "top rated TV 2020", "content_type": "tv", "year": "2020", "rating_filter": "high", "search_strategy": "complex_discovery", "api_calls_needed": ["discover_by_year", "sort_by_rating"], "confidence": 0.9, "original_corrected": "Year and quality specific TV search"}
    `

    console.log('🤖 Gemini - Sending prompt to API...')
    console.log('🤖 Gemini - Prompt length:', prompt.length, 'characters')
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }
    
    console.log('🤖 Gemini - Request body:', JSON.stringify(requestBody, null, 2))
    
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`
    console.log('🤖 Gemini - Request URL:', url.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('🤖 Gemini - Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('🤖 Gemini - API error response:', errorText)
      throw new Error('Failed to process voice input with Gemini')
    }

    const data = await response.json()
    console.log('🤖 Gemini - Raw response data:', JSON.stringify(data, null, 2))
    
    const responseText = data.candidates[0].content.parts[0].text
    console.log('🤖 Gemini - Response text:', responseText)
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('🤖 Gemini - No JSON found in response:', responseText)
      throw new Error('Invalid response format from Gemini')
    }    const analysis = JSON.parse(jsonMatch[0])
    console.log('🤖 Gemini - Parsed analysis:', analysis)
    
    // Log corrections made by Gemini
    if (analysis.original_corrected && analysis.original_corrected !== "No corrections needed") {
      console.log('🤖 Gemini - CORRECTION MADE:', analysis.original_corrected)
      console.log('🤖 Gemini - Original input:', input)
      console.log('🤖 Gemini - Corrected query:', analysis.query)
    }
    
    return analysis
  } catch (error) {
    console.error('🤖 Gemini - Error processing voice input:', error)
    console.log('🤖 Gemini - Falling back to general search')
    // Fallback: treat as general search
    const fallback = {
      type: 'general',
      query: input,
      content_type: 'both'
    }
    console.log('🤖 Gemini - Fallback analysis:', fallback)
    return fallback
  }
}

// Main search function that uses Gemini analysis
export const performSmartSearch = async (voiceInput) => {
  console.log('🚀 SmartSearch - Starting with voice input:', voiceInput)
  
  try {
    // Step 1: Process with Gemini API first
    console.log('🚀 SmartSearch - Step 1: Sending to Gemini for analysis...')
    const analysis = await processVoiceInput(voiceInput)
    console.log('🚀 SmartSearch - Gemini analysis result:', analysis)
    
    // Step 2: Use Gemini's analysis to determine search strategy
    let results = []
    const searchQuery = analysis.query || voiceInput // Use Gemini's corrected query
    console.log('🚀 SmartSearch - Step 2: Using processed query for TMDB:', searchQuery)
    
    try {
      // Advanced search strategy based on Gemini's analysis
      switch (analysis.type) {
        case 'person':
          console.log('🚀 SmartSearch - Person search detected:', analysis.person_name)
          results = await handlePersonSearch(analysis)
          break
          
        case 'year':
          console.log('🚀 SmartSearch - Year search detected:', analysis.year)
          results = await handleYearSearch(analysis)
          break
          
        case 'trending':
          console.log('🚀 SmartSearch - Trending search detected')
          results = await handleTrendingSearch(analysis)
          break
          
        case 'top_rated':
          console.log('🚀 SmartSearch - Top rated search detected')
          results = await handleTopRatedSearch(analysis)
          break
          
        case 'now_playing':
          console.log('🚀 SmartSearch - Now playing search detected')
          results = await getNowPlayingMovies()
          break
          
        case 'company':
          console.log('🚀 SmartSearch - Company search detected:', analysis.company)
          results = await handleCompanySearch(analysis)
          break
          
        case 'multi_criteria':
          console.log('🚀 SmartSearch - Multi-criteria search detected')
          results = await handleMultiCriteriaSearch(analysis)
          break
          
        case 'mood_time':
          console.log('🚀 SmartSearch - Mood/time search detected:', analysis.mood)
          results = await handleMoodTimeSearch(analysis)
          break
          
        case 'genre':
          console.log('🚀 SmartSearch - Genre search detected:', analysis.genre)
          results = await handleGenreSearch(analysis)
          break
          
        case 'specific':
          console.log('🚀 SmartSearch - Specific title search detected')
          results = await handleSpecificSearch(analysis)
          break
          
        default:
          console.log('🚀 SmartSearch - General search fallback')
          results = await handleGeneralSearch(analysis)
      }
      
      console.log('🚀 SmartSearch - TMDB search completed, results count:', results.length)
      console.log('🚀 SmartSearch - Sample results:', results.slice(0, 3))
      
    } catch (tmdbError) {
      console.error('🚀 SmartSearch - TMDB search failed, using mock data:', tmdbError)
      
      // Use mock data based on Gemini's analysis
      if (analysis.type === 'genre' && analysis.genre) {
        if (analysis.genre === 'action') {
          console.log('🚀 SmartSearch - Using action mock data')
          results = mockResults.action
        } else if (analysis.genre === 'comedy') {
          console.log('🚀 SmartSearch - Using comedy mock data')
          results = mockResults.comedy
        } else {
          console.log('🚀 SmartSearch - Using general mock data for genre:', analysis.genre)
          results = mockResults.movies
        }
      } else {
        // Fallback to keyword-based mock selection
        const lowerInput = searchQuery.toLowerCase()
        if (lowerInput.includes('action') || lowerInput.includes('fight') || lowerInput.includes('gun')) {
          console.log('🚀 SmartSearch - Using action mock data for:', lowerInput)
          results = mockResults.action
        } else if (lowerInput.includes('funny') || lowerInput.includes('comedy') || lowerInput.includes('laugh')) {
          console.log('🚀 SmartSearch - Using comedy mock data for:', lowerInput)
          results = mockResults.comedy
        } else {
          console.log('🚀 SmartSearch - Using general mock data for:', lowerInput)
          results = mockResults.movies
        }
      }
      console.log('🚀 SmartSearch - Mock data selected, count:', results.length)
    }
    
    const finalResults = results.slice(0, 12) // Limit to 12 results
    console.log('🚀 SmartSearch - Final results after limiting:', finalResults.length)
    
    const searchResponse = {
      results: finalResults,
      analysis: analysis, // Use the actual Gemini analysis
      originalQuery: voiceInput,
      processedQuery: searchQuery // Include the processed query
    }
    
    console.log('🚀 SmartSearch - Returning search response:', {
      resultsCount: searchResponse.results.length,
      analysis: searchResponse.analysis,
      originalQuery: searchResponse.originalQuery,
      processedQuery: searchResponse.processedQuery
    })
    
    return searchResponse
    
  } catch (error) {
    console.error('🚀 SmartSearch - Error performing smart search:', error)
    console.log('🚀 SmartSearch - Returning fallback mock data')
    
    // Return mock data as absolute fallback
    const fallbackResponse = {
      results: mockResults.movies.slice(0, 12),
      analysis: { type: 'general', query: voiceInput, content_type: 'both' },
      originalQuery: voiceInput,
      processedQuery: voiceInput
    }
    
    console.log('🚀 SmartSearch - Fallback response:', {
      resultsCount: fallbackResponse.results.length,
      analysis: fallbackResponse.analysis,
      originalQuery: fallbackResponse.originalQuery
    })
    
    return fallbackResponse
  }
}

// Export statement for testing/debugging
export { genreMapping, companyMapping }

// Search handler functions
const handlePersonSearch = async (analysis) => {
  console.log('👤 Handling person search for:', analysis.person_name)
  
  try {
    // Step 1: Search for the person
    const people = await searchPerson(analysis.person_name)
    if (!people || people.length === 0) {
      console.log('👤 No person found, falling back to general search')
      return await searchMulti(analysis.query)
    }
    
    const person = people[0] // Get the first (most relevant) person
    console.log('👤 Found person:', person.name, 'ID:', person.id)
    
    // Step 2: Get their filmography
    let results = []
    if (analysis.content_type === 'movie' || analysis.content_type === 'both') {
      const movies = await getMoviesByPerson(person.id, analysis.person_type || 'actor')
      results = [...results, ...movies]
    }
    
    if (analysis.content_type === 'tv' || analysis.content_type === 'both') {
      const tvShows = await getTVShowsByPerson(person.id)
      results = [...results, ...tvShows]
    }
    
    // Step 3: Sort by popularity and return
    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    return results.slice(0, 12)
    
  } catch (error) {
    console.error('👤 Error in person search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleYearSearch = async (analysis) => {
  console.log('📅 Handling year search for:', analysis.year)
  
  try {
    let results = []
    const year = analysis.year.includes('-') ? analysis.year.split('-')[0] : analysis.year
    
    if (analysis.content_type === 'movie' || analysis.content_type === 'both') {
      const movies = await getMoviesByYear(year)
      results = [...results, ...movies]
    }
    
    if (analysis.content_type === 'tv' || analysis.content_type === 'both') {
      const tvShows = await getTVShowsByYear(year)
      results = [...results, ...tvShows]
    }
    
    return results.slice(0, 12)
    
  } catch (error) {
    console.error('📅 Error in year search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleTrendingSearch = async (analysis) => {
  console.log('🔥 Handling trending search')
  
  try {
    const mediaType = analysis.content_type === 'both' ? 'all' : analysis.content_type
    return await getTrendingContent(mediaType, 'week')
  } catch (error) {
    console.error('🔥 Error in trending search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleTopRatedSearch = async (analysis) => {
  console.log('⭐ Handling top rated search')
  
  try {
    let results = []
    
    if (analysis.content_type === 'movie' || analysis.content_type === 'both') {
      const movies = await getTopRatedContent('movie')
      results = [...results, ...movies]
    }
    
    if (analysis.content_type === 'tv' || analysis.content_type === 'both') {
      const tvShows = await getTopRatedContent('tv')
      results = [...results, ...tvShows]
    }
    
    return results.slice(0, 12)
    
  } catch (error) {
    console.error('⭐ Error in top rated search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleCompanySearch = async (analysis) => {
  console.log('🏢 Handling company search for:', analysis.company)
  
  try {
    const companyName = analysis.company.toLowerCase()
    const companyId = companyMapping[companyName]
    
    if (companyId) {
      const filters = {
        mediaType: analysis.content_type === 'both' ? 'movie' : analysis.content_type,
        withCompanies: companyId,
        sortBy: analysis.rating_filter === 'high' ? 'vote_average.desc' : 'popularity.desc'
      }
      
      let results = await discoverContent(filters)
      
      // If searching both movies and TV, get TV shows too
      if (analysis.content_type === 'both') {
        const tvFilters = { ...filters, mediaType: 'tv' }
        const tvResults = await discoverContent(tvFilters)
        results = [...results.slice(0, 6), ...tvResults.slice(0, 6)]
      }
      
      return results.slice(0, 12)
    } else {
      // Fallback to text search if company not in mapping
      return await searchMulti(analysis.query)
    }
    
  } catch (error) {
    console.error('🏢 Error in company search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleMultiCriteriaSearch = async (analysis) => {
  console.log('🔍 Handling multi-criteria search')
  
  try {
    // Handle person + genre combination
    if (analysis.person_name && analysis.genre) {
      console.log('🔍 Person + Genre search:', analysis.person_name, '+', analysis.genre)
      
      // First get person's filmography
      const people = await searchPerson(analysis.person_name)
      if (people && people.length > 0) {
        const person = people[0]
        let personResults = []
        
        if (analysis.content_type === 'movie' || analysis.content_type === 'both') {
          const movies = await getMoviesByPerson(person.id, analysis.person_type || 'actor')
          personResults = [...personResults, ...movies]
        }
        
        if (analysis.content_type === 'tv' || analysis.content_type === 'both') {
          const tvShows = await getTVShowsByPerson(person.id)
          personResults = [...personResults, ...tvShows]
        }
        
        // Filter by genre
        const genreId = genreMapping[analysis.genre]
        if (genreId) {
          const genreIdToUse = analysis.content_type === 'tv' ? genreId.tv : genreId.movie
          personResults = personResults.filter(item => 
            item.genre_ids && item.genre_ids.includes(genreIdToUse)
          )
        }
        
        return personResults.slice(0, 12)
      }
    }
    
    // Handle year + genre combination
    if (analysis.year && analysis.genre) {
      console.log('🔍 Year + Genre search:', analysis.year, '+', analysis.genre)
      
      const genreId = genreMapping[analysis.genre]
      if (genreId) {
        const filters = {
          mediaType: analysis.content_type === 'both' ? 'movie' : analysis.content_type,
          genre: analysis.content_type === 'tv' ? genreId.tv : genreId.movie,
          year: analysis.year.includes('-') ? analysis.year.split('-')[0] : analysis.year,
          sortBy: analysis.rating_filter === 'high' ? 'vote_average.desc' : 'popularity.desc'
        }
        
        let results = await discoverContent(filters)
        
        if (analysis.content_type === 'both') {
          const tvFilters = { ...filters, mediaType: 'tv', genre: genreId.tv }
          const tvResults = await discoverContent(tvFilters)
          results = [...results.slice(0, 6), ...tvResults.slice(0, 6)]
        }
        
        return results.slice(0, 12)
      }
    }
    
    // Handle advanced discover with multiple filters
    const filters = {
      mediaType: analysis.content_type === 'both' ? 'movie' : analysis.content_type,
      sortBy: analysis.rating_filter === 'high' ? 'vote_average.desc' : 'popularity.desc'
    }
    
    if (analysis.genre) {
      const genreId = genreMapping[analysis.genre]
      if (genreId) {
        filters.genre = analysis.content_type === 'tv' ? genreId.tv : genreId.movie
      }
    }
    
    if (analysis.year) {
      filters.year = analysis.year.includes('-') ? analysis.year.split('-')[0] : analysis.year
    }
    
    if (analysis.filters?.min_rating) {
      filters.minRating = analysis.filters.min_rating
    }
    
    return await discoverContent(filters)
    
  } catch (error) {
    console.error('🔍 Error in multi-criteria search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleMoodTimeSearch = async (analysis) => {
  console.log('😊 Handling mood/time search:', analysis.mood)
  
  try {
    let filters = {
      mediaType: analysis.content_type === 'both' ? 'movie' : analysis.content_type,
      sortBy: 'popularity.desc'
    }
    
    // Map moods to appropriate genres and filters
    switch (analysis.mood) {
      case 'date_night':
        filters.genre = genreMapping.romance.movie
        filters.minRating = 7.0
        break
      case 'family':
        filters.genre = genreMapping.family.movie
        break
      case 'feel_good':
        filters.genre = genreMapping.comedy.movie
        filters.minRating = 7.0
        break
      case 'binge':
        filters.mediaType = 'tv'
        filters.sortBy = 'vote_average.desc'
        break
      case 'intense':
        filters.genre = genreMapping.thriller.movie
        break
      case 'dark':
        filters.genre = genreMapping.horror.movie
        break
      default:
        if (analysis.genre) {
          const genreId = genreMapping[analysis.genre]
          if (genreId) {
            filters.genre = analysis.content_type === 'tv' ? genreId.tv : genreId.movie
          }
        }
    }
    
    return await discoverContent(filters)
    
  } catch (error) {
    console.error('😊 Error in mood/time search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleGenreSearch = async (analysis) => {
  console.log('🎭 Handling genre search:', analysis.genre)
  
  try {
    const genreId = genreMapping[analysis.genre]
    if (genreId) {
      let results = []
      
      if (analysis.content_type === 'movie') {
        results = await getMoviesByGenre(genreId.movie)
      } else if (analysis.content_type === 'tv') {
        results = await getTVShowsByGenre(genreId.tv)
      } else {
        // Both - get movies and TV shows
        const [movies, tvShows] = await Promise.all([
          getMoviesByGenre(genreId.movie),
          getTVShowsByGenre(genreId.tv)
        ])
        results = [...movies.slice(0, 6), ...tvShows.slice(0, 6)]
      }
      
      return results.slice(0, 12)
    } else {
      return await searchMulti(analysis.query)
    }
    
  } catch (error) {
    console.error('🎭 Error in genre search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleSpecificSearch = async (analysis) => {
  console.log('🎯 Handling specific search:', analysis.query)
  
  try {
    if (analysis.content_type === 'movie') {
      return await searchMovies(analysis.query)
    } else if (analysis.content_type === 'tv') {
      return await searchTVShows(analysis.query)
    } else {
      return await searchMulti(analysis.query)
    }
    
  } catch (error) {
    console.error('🎯 Error in specific search:', error)
    return await searchMulti(analysis.query)
  }
}

const handleGeneralSearch = async (analysis) => {
  console.log('🌐 Handling general search:', analysis.query)
  
  try {
    if (analysis.content_type === 'movie') {
      return await searchMovies(analysis.query)
    } else if (analysis.content_type === 'tv') {
      return await searchTVShows(analysis.query)
    } else {
      return await searchMulti(analysis.query)
    }
    
  } catch (error) {
    console.error('🌐 Error in general search:', error)
    return []
  }
}

