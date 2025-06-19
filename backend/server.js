import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { GOOGLE_API_KEY, TMDB_API_KEY, TMDB_BEARER_TOKEN } = process.env;
const PORT = process.env.PORT || 8080;

if (!GOOGLE_API_KEY || !TMDB_API_KEY) {
  console.error('Error: GOOGLE_API_KEY and/or TMDB_API_KEY must be set in your .env file.');
  process.exit(1);
}

// --- Configuration & Clients ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const app = express();

const tmdbHeaders = TMDB_BEARER_TOKEN
  ? {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
    }
  : undefined;

// Axios TMDB instance
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: tmdbHeaders,
});

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Type Definitions (for documentation purposes) ---
// Movie interface structure:
// {
//   id: number;
//   title: string;
//   overview: string;
//   poster_url: string | null;
//   release_year: string;
//   rating: number;
// }

// MovieHistory interface structure:
// {
//   id?: number;
//   user_id: string;
//   movie_id: number;
//   movie_title: string;
//   movie_genre_ids: number[];
//   clicked_at?: string;
//   movie_rating: number;
// }

// --- Helper Functions ---

/**
 * Transforms raw TMDB API movie data into our simplified Movie object.
 * @param {Object} tmdbMovie - The movie object from the TMDB API.
 * @returns {Object} A simplified Movie object.
 */
const formatTmdbMovie = (tmdbMovie) => ({
  id: tmdbMovie.id,
  title: tmdbMovie.title,
  overview: tmdbMovie.overview,
  poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
  release_year: tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : 'N/A',
  rating: tmdbMovie.vote_average,
});

// --- API Logic ---

/**
 * Fetches the current top-rated movies directly from TMDB.
 * @returns {Promise<Array>} A promise that resolves to a list of top-rated movies.
 */
const getTopRatedMovies = async () => {
  const url = `/movie/top_rated?language=en-US&page=1`;
  const response = await tmdbAxios.get(url);
  if (!response.data || !response.data.results) {
    throw new Error('Failed to fetch top-rated movies from TMDB.');
  }
  return response.data.results.slice(0, 20).map(formatTmdbMovie);
};

/**
 * Fetches the current popular movies directly from TMDB.
 * @returns {Promise<Array>} A promise that resolves to a list of popular movies.
 */
const getPopularMovies = async () => {
  const url = '/movie/popular?language=en-US&page=1';
  const response = await tmdbAxios.get(url);
  if (!response.data || !response.data.results) {
    throw new Error('Failed to fetch popular movies from TMDB.');
  }
  return response.data.results.slice(0, 20).map(formatTmdbMovie);
};

/**
 * Gets mood-based movie recommendations by asking the LLM for a single genre,
 * then fetching the most popular movies from that genre on TMDB.
 * @param {string} mood The user's mood.
 * @returns {Promise<Array>} A promise that resolves to a list of recommended movies.
 */
const getMoodRecommendations = async (mood) => {
  // Step 1: Ask Gemini to translate the mood into one or more genres.
  const genreList = "Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western";
  const prompt = `
    A user wants to watch movies that fit a "${mood}" mood.
    From the following list of official TMDB movie genres, choose the 1-3 best genres that represent this mood:
    ${genreList}

    Return ONLY a comma-separated list of genre names, and nothing else.
    Your response should not contain any special formatting, quotes, or introductory text.

    Example for mood "I want to laugh out loud":
    Comedy

    Example for mood "feeling scared and on edge":
    Horror, Thriller

    Now, provide the best genres for the mood: "${mood}"
  `;

  const result = await model.generateContent(prompt);
  const genreNames = result.response.text().trim().split(',').map(g => g.trim().toLowerCase());
  console.log(`Gemini suggested genres for "${mood}":`, genreNames);

  // Step 2: Map genre names to TMDB genre IDs
  const genreIds = genreNames
    .map(name => TMDB_GENRE_MAP[name])
    .filter(Boolean)
    .join(',');

  if (!genreIds) {
    console.warn(`Could not find valid TMDB genres for "${genreNames}". Falling back to top-rated movies.`);
    return getTopRatedMovies();
  }
  console.log(`Found TMDB genre IDs: ${genreIds} for genres: "${genreNames.join(', ')}"`);

  // Step 3: Use TMDB Discover endpoint with multiple genres, sorted by rating, limited to 10
  const discoverUrl = `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false&with_genres=${genreIds}&page=1`;
  const discoverResponse = await tmdbAxios.get(discoverUrl);

  if (!discoverResponse.data || !discoverResponse.data.results || discoverResponse.data.results.length === 0) {
    console.warn(`Discovery for genres "${genreNames.join(', ')}" returned no results. Falling back to top-rated movies.`);
    return getTopRatedMovies();
  }

  // Step 4: Return the top 20 movies from the discovery results.
  return discoverResponse.data.results.slice(0, 20).map(formatTmdbMovie);
};

/**
 * Gets personalized recommendations based on user's movie history
 * @param {string} userId The user's ID
 * @returns {Promise<Array>} A promise that resolves to a list of recommended movies
 */
const getPersonalizedRecommendations = async (userId) => {
  try {
    // Fetch last 20 movies from user's history
    const { data: history, error } = await supabase
      .from('movie_history')
      .select('*')
      .eq('user_id', userId)
      .order('clicked_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching user history:', error);
      return getTopRatedMovies();
    }

    if (!history || history.length === 0) {
      console.log('No history found for user, returning top-rated movies');
      return getTopRatedMovies();
    }

    // Prepare movie history for Gemini
    const movieList = history.map(h => `${h.movie_title} (Rating: ${h.movie_rating})`).join(', ');
    
    const genreList = "Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western";
    
    const prompt = `
      Based on a user's movie watching history, suggest 1-3 genres that would best match their preferences.
      
      User's recently watched movies: ${movieList}
      
      From the following list of official TMDB movie genres, choose the 1-3 best genres that represent this user's preferences:
      ${genreList}

      Return ONLY a comma-separated list of genre names, and nothing else.
      Your response should not contain any special formatting, quotes, or introductory text.

      Example response:
      Action, Thriller

      Now, provide the best genres for this user's preferences:
    `;

    const result = await model.generateContent(prompt);
    const genreNames = result.response.text().trim().split(',').map(g => g.trim().toLowerCase());
    console.log(`Gemini suggested genres based on history:`, genreNames);

    // Map genre names to TMDB genre IDs
    const genreIds = genreNames
      .map(name => TMDB_GENRE_MAP[name])
      .filter(Boolean)
      .join(',');

    if (!genreIds) {
      console.warn(`Could not find valid TMDB genres for "${genreNames}". Falling back to top-rated movies.`);
      return getTopRatedMovies();
    }

    // Use TMDB Discover endpoint with suggested genres
    const discoverUrl = `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false&with_genres=${genreIds}&page=1`;
    const discoverResponse = await tmdbAxios.get(discoverUrl);

    if (!discoverResponse.data || !discoverResponse.data.results || discoverResponse.data.results.length === 0) {
      console.warn(`Discovery for personalized genres returned no results. Falling back to top-rated movies.`);
      return getTopRatedMovies();
    }

    return discoverResponse.data.results.slice(0, 20).map(formatTmdbMovie);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return getTopRatedMovies();
  }
};

/**
 * Fetches the most watched movies (using "now playing" as a proxy for current engagement).
 * @returns {Promise<Array>} A promise that resolves to a list of most watched movies.
 */
const getMostWatchedMovies = async () => {
  const url = '/movie/now_playing?language=en-US&page=1';
  const response = await tmdbAxios.get(url);
  if (!response.data || !response.data.results) {
    throw new Error('Failed to fetch most watched movies from TMDB.');
  }
  // Sort by popularity and vote count to get truly "most watched" feel
  const sortedMovies = response.data.results
    .filter(movie => movie.vote_count > 100) // Filter movies with sufficient votes
    .sort((a, b) => (b.popularity * b.vote_count) - (a.popularity * a.vote_count))
    .slice(0, 20);
  
  return sortedMovies.map(formatTmdbMovie);
};

// --- Hardcoded TMDB Genre Name to ID Map ---
const TMDB_GENRE_MAP = {
  "action": 28,
  "adventure": 12,
  "animation": 16,
  "comedy": 35,
  "crime": 80,
  "documentary": 99,
  "drama": 18,
  "family": 10751,
  "fantasy": 14,
  "history": 36,
  "horror": 27,
  "music": 10402,
  "mystery": 9648,
  "romance": 10749,
  "science fiction": 878,
  "tv movie": 10770,
  "thriller": 53,
  "war": 10752,
  "western": 37,
};

// --- API Server Setup ---
app.use(cors());
app.use(express.json());

// Endpoint for top-rated movies
app.get('/api/top-rated', async (req, res) => {
  try {
    console.log("Fetching top-rated movies...");
    const movies = await getTopRatedMovies();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching top-rated movies:', error);
    res.status(500).json({ error: 'Failed to get top-rated movies.' });
  }
});

// Endpoint for popular movies
app.get('/api/popular', async (req, res) => {
  try {
    console.log("Fetching popular movies...");
    const movies = await getPopularMovies();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Failed to get popular movies.' });
  }
});

// Endpoint for mood-based recommendations
app.get('/api/recommendations', async (req, res) => {
  const { mood } = req.query;

  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ error: 'A "mood" query parameter is required.' });
  }

  try {
    console.log(`Getting recommendations for mood: "${mood}"`);
    const movies = await getMoodRecommendations(mood);
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error processing recommendation request:', error);
    res.status(500).json({ error: 'Failed to get recommendations.' });
  }
});

// Add new endpoint for personalized recommendations
app.get('/api/personalized', async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'A "userId" query parameter is required.' });
  }

  try {
    console.log(`Getting personalized recommendations for user: ${userId}`);
    const movies = await getPersonalizedRecommendations(userId);
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error processing personalized recommendation request:', error);
    res.status(500).json({ error: 'Failed to get personalized recommendations.' });
  }
});

// Add endpoint to track movie clicks
app.post('/api/track-click', async (req, res) => {
  const { userId, movieId, movieTitle, movieGenreIds, movieRating } = req.body;

  if (!userId || !movieId || !movieTitle) {
    return res.status(400).json({ error: 'userId, movieId, and movieTitle are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('movie_history')
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          movie_title: movieTitle,
          movie_genre_ids: movieGenreIds || [],
          movie_rating: movieRating || 0,
          clicked_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error tracking movie click:', error);
      return res.status(500).json({ error: 'Failed to track movie click.' });
    }

    res.status(200).json({ message: 'Movie click tracked successfully.' });
  } catch (error) {
    console.error('Error tracking movie click:', error);
    res.status(500).json({ error: 'Failed to track movie click.' });
  }
});

// Endpoint for most watched movies
app.get('/api/most-watched', async (req, res) => {
  try {
    console.log("Fetching most watched movies...");
    const movies = await getMostWatchedMovies();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching most watched movies:', error);
    res.status(500).json({ error: 'Failed to get most watched movies.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});