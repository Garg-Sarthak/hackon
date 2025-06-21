import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Star, Calendar, TrendingUp, Clock, Grid3X3, List } from 'lucide-react'
import ContentCard from './ContentCard'
import { 
  fetchTVShowsWithPagination,
  loadInitialTVShows,
  searchTVShowsAPI,
  trackTVShowInteraction,
  TV_GENRES
} from '../services/tvApi'
import { 
  SORT_OPTIONS, 
  RATING_OPTIONS, 
  YEAR_OPTIONS,
  debounce 
} from '../utils/helpers'
import { getCurrentUser } from '../services/api'
import './TVShowsPage.css'

const TVShowsPage = () => {
  const [tvShows, setTVShows] = useState([])
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

  // Load initial popular TV shows
  useEffect(() => {
    loadUser()
    loadInitialTVShowsData()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadInitialTVShowsData = async () => {
    setLoading(true)
    try {
      const tvShowsData = await loadInitialTVShows()
      
      setTVShows(tvShowsData.results)
      setCurrentPage(1)
      setTotalPages(Math.min(tvShowsData.totalPages, 500)) // TMDB limit
      setHasMore(1 < Math.min(tvShowsData.totalPages, 500))
      setActiveFilter('popular')
    } catch (error) {
      console.error('Error loading initial TV shows:', error)
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
      const searchResults = await searchTVShowsAPI(query, 1)
      setTVShows(searchResults.results)
      setTotalPages(Math.min(searchResults.totalPages || 1, 500))
      setHasMore(searchResults.currentPage < Math.min(searchResults.totalPages || 1, 500))
    } catch (error) {
      console.error('Error searching TV shows:', error)
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
      loadInitialTVShowsData()
    }
  }

  const handleQuickFilter = async (filterType) => {
    setLoading(true)
    setCurrentPage(1)
    setActiveFilter(filterType)

    try {
      const results = await fetchTVShowsWithPagination(filterType, 1)
      setTVShows(results.results)
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
      const results = await fetchTVShowsWithPagination('discover', 1, '', {
        genre: selectedGenre,
        year: selectedYear,
        minRating: selectedRating,
        sortBy: selectedSort
      })
      setTVShows(results.results)
      setTotalPages(Math.min(results.totalPages || 500, 500))
      setHasMore(results.currentPage < Math.min(results.totalPages || 500, 500))
    } catch (error) {
      console.error('Error applying custom filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreTVShows = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      let results
      
      if (activeFilter === 'search') {
        results = await fetchTVShowsWithPagination('search', nextPage, searchQuery)
      } else if (activeFilter === 'custom') {
        results = await fetchTVShowsWithPagination('discover', nextPage, '', {
          genre: selectedGenre,
          year: selectedYear,
          minRating: selectedRating,
          sortBy: selectedSort
        })
      } else {
        results = await fetchTVShowsWithPagination(activeFilter, nextPage)
      }

      setTVShows(prev => [...prev, ...results.results])
      setCurrentPage(nextPage)
      setHasMore(nextPage < Math.min(results.totalPages || 500, 500))
    } catch (error) {
      console.error('Error loading more TV shows:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    loadInitialTVShowsData()
  }

  const resetFilters = () => {
    setSelectedGenre('')
    setSelectedSort('popularity.desc')
    setSelectedRating('')
    setSelectedYear('')
    setShowFilters(false)
    loadInitialTVShowsData()
  }

  const handleTVShowClick = async (tvShow) => {
    // Track TV show click for recommendations
    if (user) {
      try {
        await trackTVShowInteraction(user.id, tvShow)
      } catch (error) {
        console.error('Error tracking TV show click:', error)
      }
    }
  }

  return (
    <div className="tv-shows-page">
      <div className="tv-shows-header">
        <div className="tv-shows-title-section">
          <h1 className="tv-shows-title">
            <span className="title-icon">📺</span>
            TV Shows
          </h1>
          <p className="tv-shows-subtitle">Discover amazing TV shows from around the world</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="tv-shows-search-form">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search TV shows..."
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
                  {TV_GENRES.map(genre => (
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
            {tvShows.length > 0 && (
              <span>{tvShows.length} TV shows found</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="tv-shows-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading TV shows...</p>
          </div>
        ) : (
          <>
            {tvShows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📺</div>
                <h3>No TV shows found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={`content-grid ${viewMode}`}>
                {tvShows.map((tvShow) => (
                  <ContentCard
                    key={tvShow.id}
                    content={tvShow}
                    viewMode={viewMode}
                    onClick={() => handleTVShowClick(tvShow)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && tvShows.length > 0 && (
              <div className="load-more-container">
                <button 
                  onClick={loadMoreTVShows} 
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

            {!hasMore && tvShows.length > 0 && (
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

export default TVShowsPage