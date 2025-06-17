// API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_tmdb_api_key_here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your_gemini_api_key_here'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

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

// Gemini API function
export const processVoiceInput = async (input) => {
  console.log('🤖 Gemini - processVoiceInput called with:', input)
  console.log('🤖 Gemini - Using API key:', GEMINI_API_KEY.substring(0, 8) + '...')
  
  try {    const prompt = `
    You are an AI assistant for a movie/TV show search system. Analyze and process this user voice input: "${input}"
    
    Your tasks:
    1. CORRECT any speech-to-text errors (e.g., "strange rings" → "Stranger Things", "avingers" → "Avengers")
    2. INTERPRET the user's intent and extract search parameters
    3. CLASSIFY the search type and determine appropriate content filtering
    
    Search Types:
    - "specific": Searching for a particular title (movie/show name)
    - "genre": Looking for content by genre/mood (action, comedy, horror, etc.)
    - "actor": Searching by actor/director name
    - "general": General or unclear queries
    
    Content Types:
    - "movie": User specifically wants movies
    - "tv": User specifically wants TV shows/series
    - "both": No specific preference or both mentioned
    
    Available Genres: action, comedy, drama, horror, romance, thriller, scifi, fantasy, mystery, crime, family, animation, documentary
    
    IMPORTANT: 
    - Fix obvious speech recognition errors in titles and names
    - Interpret casual language (e.g., "something funny" → comedy genre)
    - Extract the core search intent even from complex sentences
    
    Respond in this EXACT JSON format:
    {
      "type": "specific" | "genre" | "actor" | "general",
      "query": "corrected and cleaned search term",
      "genre": "genre_name" (only if type is "genre"),
      "content_type": "movie" | "tv" | "both",
      "confidence": 0.0-1.0,
      "original_corrected": "explanation of any corrections made"
    }
    
    Examples:
    - "Show me strange rings" → {"type": "specific", "query": "Stranger Things", "content_type": "tv", "confidence": 0.9, "original_corrected": "Corrected 'strange rings' to 'Stranger Things'"}
    - "I want some action movies" → {"type": "genre", "query": "action movies", "genre": "action", "content_type": "movie", "confidence": 0.95, "original_corrected": "No corrections needed"}
    - "Something funny to watch tonight" → {"type": "genre", "query": "comedy", "genre": "comedy", "content_type": "both", "confidence": 0.8, "original_corrected": "Interpreted 'funny' as comedy genre"}
    - "Movies with Tom Cruise" → {"type": "actor", "query": "Tom Cruise", "content_type": "movie", "confidence": 0.9, "original_corrected": "No corrections needed"}
    - "Show me the office" → {"type": "specific", "query": "The Office", "content_type": "tv", "confidence": 0.85, "original_corrected": "Capitalized title"}
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
      // Determine which TMDB API to call based on Gemini's analysis
      if (analysis.type === 'genre' && analysis.genre) {
        console.log('🚀 SmartSearch - Genre search detected:', analysis.genre)
        
        // Use genre-based search
        const genreId = genreMapping[analysis.genre]
        if (genreId) {
          if (analysis.content_type === 'movie') {
            console.log('🚀 SmartSearch - Calling getMoviesByGenre with ID:', genreId.movie)
            results = await getMoviesByGenre(genreId.movie)
          } else if (analysis.content_type === 'tv') {
            console.log('🚀 SmartSearch - Calling getTVShowsByGenre with ID:', genreId.tv)
            results = await getTVShowsByGenre(genreId.tv)
          } else {
            // Both - get movies and TV shows
            console.log('🚀 SmartSearch - Getting both movies and TV shows for genre')
            const [movies, tvShows] = await Promise.all([
              getMoviesByGenre(genreId.movie),
              getTVShowsByGenre(genreId.tv)
            ])
            results = [...movies.slice(0, 6), ...tvShows.slice(0, 6)]
          }
        } else {
          console.log('🚀 SmartSearch - Genre not found in mapping, using multi search')
          results = await searchMulti(searchQuery)
        }
      } else if (analysis.content_type === 'movie') {
        console.log('🚀 SmartSearch - Movie-specific search')
        results = await searchMovies(searchQuery)
      } else if (analysis.content_type === 'tv') {
        console.log('🚀 SmartSearch - TV-specific search')
        results = await searchTVShows(searchQuery)
      } else {
        console.log('🚀 SmartSearch - General multi search')
        results = await searchMulti(searchQuery)
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

