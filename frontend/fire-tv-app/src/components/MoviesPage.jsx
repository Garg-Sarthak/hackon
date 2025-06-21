import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Star, Calendar, TrendingUp, Clock, Grid3X3, List } from 'lucide-react'
import ContentCard from './ContentCard'
import { 
  fetchMoviesWithPagination,
  loadInitialMovies,
  searchMoviesAPI,
  trackMovieInteraction,
  MOVIE_GENRES
} from '../services/moviesApi'
import { 
  SORT_OPTIONS, 
  RATING_OPTIONS, 
  YEAR_OPTIONS,
  debounce 
} from '../utils/helpers'
import { getCurrentUser } from '../services/api'
import './MoviesPage.css'

const MoviesPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedSort, setSelectedSort] = useState('popularity.desc')
  const [selectedRating, setSelectedRating] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  
  // Active filter type
  const [activeFilter, setActiveFilter] = useState('popular') // 'popular', 'top-rated', 'search', 'custom'
  
  // User state
  const [user, setUser] = useState(null)

  // Load initial popular movies
  useEffect(() => {
    loadUser()
    loadInitialMoviesData()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadInitialMoviesData = async () => {
    setLoading(true)
    try {
      const moviesData = await loadInitialMovies()
      console.log('🎬 MoviesPage - Loaded initial data:', {
        source: moviesData.source,
        resultsCount: moviesData.results.length,
        totalPages: moviesData.totalPages,
        currentPage: moviesData.currentPage
      })
      
      setMovies(moviesData.results)
      setCurrentPage(1)
      
      // Check if data is from backend (which has limited pagination) or TMDB
      if (moviesData.source === 'backend') {
        // For backend data, assume we can load more from TMDB if needed
        setTotalPages(500) // Set a reasonable number for TMDB fallback
        setHasMore(true) // Always allow loading more to get TMDB data
        console.log('🎬 MoviesPage - Using backend data, enabling load more for TMDB fallback')
      } else {
        // For TMDB data, use actual pagination
        setTotalPages(Math.min(moviesData.totalPages, 500))
        setHasMore(1 < Math.min(moviesData.totalPages, 500))
        console.log('🎬 MoviesPage - Using TMDB data, hasMore:', 1 < Math.min(moviesData.totalPages, 500))
      }
      
      setActiveFilter('popular')
    } catch (error) {
      console.error('Error loading initial movies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) return

    setLoading(true)
    setCurrentPage(1)
    setActiveFilter('search')

    try {
      const searchResults = await searchMoviesAPI(query, 1)
      setMovies(searchResults.results)
      setTotalPages(Math.min(searchResults.totalPages || 1, 500))
      setHasMore(searchResults.currentPage < Math.min(searchResults.totalPages || 1, 500))
    } catch (error) {
      console.error('Error searching movies:', error)
    } finally {
      setLoading(false)
    }
  }, 500)

  const handleSearch = (e) => {
    e.preventDefault()
    debouncedSearch(searchQuery)
  }

  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      debouncedSearch(query)
    } else {
      loadInitialMoviesData()
    }
  }

  const handleQuickFilter = async (filterType) => {
    setLoading(true)
    setCurrentPage(1)
    setActiveFilter(filterType)

    try {
      const results = await fetchMoviesWithPagination(filterType, 1)
      setMovies(results.results)
      setTotalPages(Math.min(results.totalPages || 500, 500))
      setHasMore(results.currentPage < Math.min(results.totalPages || 500, 500))
    } catch (error) {
      console.error('Error applying quick filter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomFilters = async () => {
    setLoading(true)
    setCurrentPage(1)
    setActiveFilter('custom')

    try {
      const results = await fetchMoviesWithPagination('discover', 1, '', {
        genre: selectedGenre,
        year: selectedYear,
        minRating: selectedRating,
        sortBy: selectedSort
      })
      setMovies(results.results)
      setTotalPages(Math.min(results.totalPages || 500, 500))
      setHasMore(results.currentPage < Math.min(results.totalPages || 500, 500))
    } catch (error) {
      console.error('Error applying custom filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore) {
      console.log('🎬 MoviesPage - Load more blocked:', { loadingMore, hasMore })
      return
    }

    setLoadingMore(true)
    const nextPage = currentPage + 1
    console.log('🎬 MoviesPage - Loading more movies:', { nextPage, activeFilter })

    try {
      let results
      
      if (activeFilter === 'search') {
        results = await fetchMoviesWithPagination('search', nextPage, searchQuery)
      } else if (activeFilter === 'custom') {
        results = await fetchMoviesWithPagination('discover', nextPage, '', {
          genre: selectedGenre,
          year: selectedYear,
          minRating: selectedRating,
          sortBy: selectedSort
        })
      } else {
        // For popular/top-rated, always use TMDB for pagination
        results = await fetchMoviesWithPagination(activeFilter, nextPage)
      }

      console.log('🎬 MoviesPage - Load more results:', {
        newMoviesCount: results.results.length,
        totalPages: results.totalPages,
        currentPage: results.currentPage
      })

      // Filter out duplicates based on movie ID
      const existingIds = new Set(movies.map(movie => movie.id))
      const newMovies = results.results.filter(movie => !existingIds.has(movie.id))
      
      console.log('🎬 MoviesPage - After deduplication:', {
        existingCount: movies.length,
        newUniqueCount: newMovies.length
      })
      
      setMovies(prev => [...prev, ...newMovies])
      setCurrentPage(nextPage)
      const newHasMore = nextPage < Math.min(results.totalPages || 500, 500)
      setHasMore(newHasMore)
      console.log('🎬 MoviesPage - Updated hasMore:', newHasMore)
    } catch (error) {
      console.error('Error loading more movies:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    loadInitialMoviesData()
  }

  const resetFilters = () => {
    setSelectedGenre('')
    setSelectedSort('popularity.desc')
    setSelectedRating('')
    setSelectedYear('')
    setShowFilters(false)
    loadInitialMoviesData()
  }

  const handleMovieClick = async (movie) => {
    // Track movie click for recommendations
    if (user) {
      try {
        await trackMovieInteraction(user.id, movie)
      } catch (error) {
        console.error('Error tracking movie click:', error)
      }
    }
  }

  return (
    <div className="movies-page">
      <div className="movies-header">
        <div className="movies-title-section">
          <h1 className="movies-title">
            <span className="title-icon">🎬</span>
            Movies
          </h1>
          <p className="movies-subtitle">Discover amazing movies from around the world</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="movies-search-form">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="clear-search">
                ×
              </button>
            )}
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Quick Filters */}
        <div className="quick-filters">
          <button 
            className={`filter-button ${activeFilter === 'popular' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('popular')}
          >
            <TrendingUp size={16} />
            Popular
          </button>
          <button 
            className={`filter-button ${activeFilter === 'top-rated' ? 'active' : ''}`}
            onClick={() => handleQuickFilter('top-rated')}
          >
            <Star size={16} />
            Top Rated
          </button>
          <button 
            className={`filter-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={16} className={showFilters ? 'rotate' : ''} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Genre</label>
                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Genres</option>
                  {MOVIE_GENRES.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Year</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="filter-select"
                >
                  {YEAR_OPTIONS.map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Rating</label>
                <select 
                  value={selectedRating} 
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="filter-select"
                >
                  {RATING_OPTIONS.map(rating => (
                    <option key={rating.value} value={rating.value}>{rating.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort By</label>
                <select 
                  value={selectedSort} 
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="filter-select"
                >
                  {SORT_OPTIONS.map(sort => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filter-actions">
              <button 
                onClick={handleCustomFilters} 
                className="apply-filters-button"
              >
                Apply Filters
              </button>
              <button 
                onClick={resetFilters} 
                className="reset-filters-button"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} />
              Grid
            </button>
            <button 
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              List
            </button>
          </div>
          
          <div className="results-info">
            {movies.length > 0 && (
              <span>{movies.length} movies found</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="movies-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading movies...</p>
          </div>
        ) : (
          <>
            {movies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <h3>No movies found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={`content-grid ${viewMode}`}>
                {movies.map((movie) => (
                  <ContentCard
                    key={movie.id}
                    content={movie}
                    viewMode={viewMode}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && movies.length > 0 && (
              <div className="load-more-container">
                <button 
                  onClick={loadMoreMovies} 
                  disabled={loadingMore}
                  className="load-more-button"
                >
                  {loadingMore ? (
                    <>
                      <div className="button-spinner"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
                <p className="page-info">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}

            {!hasMore && movies.length > 0 && (
              <div className="end-of-results">
                <p>🎉 You've reached the end! Explore more with different filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MoviesPage
