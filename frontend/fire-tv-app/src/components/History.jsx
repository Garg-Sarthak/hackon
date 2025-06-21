import React, { useState, useEffect } from 'react'
import { Clock, Trash2, Filter, Search, Calendar, RotateCcw, AlertCircle, Star, Play } from 'lucide-react'
import { getUserHistoryWithPosters, deleteFromHistory, clearUserHistory, updateHistoryGenreIds } from '../services/api'
import ContentCard from './ContentCard'
import './History.css'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('clicked_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterPeriod, setFilterPeriod] = useState('all') // all, today, week, month
  const [showClearModal, setShowClearModal] = useState(false)
  const [filteredHistory, setFilteredHistory] = useState([])

  // Load initial history
  useEffect(() => {
    loadHistory()
  }, [sortBy, sortOrder])

  // Filter history based on search and time period
  useEffect(() => {
    filterHistory()
  }, [history, searchQuery, filterPeriod])

  const loadHistory = async (page = 1, append = false) => {
    try {
      setLoading(true)
      setError('')
      
      const offset = (page - 1) * 20
      const response = await getUserHistoryWithPosters({
        limit: 20,
        offset,
        sortBy,
        order: sortOrder
      })
      
      if (append) {
        setHistory(prev => [...prev, ...response.history])
      } else {
        setHistory(response.history)
      }
      
      setTotalCount(response.totalCount)
      setCurrentPage(page)
      setHasMore(response.hasMore)
      
    } catch (err) {
      console.error('Error loading history:', err)
      setError('Failed to load viewing history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = [...history]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.movie_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genreNames?.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Filter by time period
    if (filterPeriod !== 'all') {
      const now = new Date()
      filtered = filtered.filter(item => {
        const clickDate = new Date(item.clicked_at)
        const diffInDays = (now - clickDate) / (1000 * 60 * 60 * 24)
        
        switch (filterPeriod) {
          case 'today':
            return diffInDays < 1
          case 'week':
            return diffInDays < 7
          case 'month':
            return diffInDays < 30
          default:
            return true
        }
      })
    }

    setFilteredHistory(filtered)
  }

  const handleDeleteItem = async (movieId) => {
    try {
      await deleteFromHistory(movieId)
      setHistory(prev => prev.filter(item => item.movie_id !== movieId))
      setTotalCount(prev => prev - 1)
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Failed to delete item from history.')
    }
  }

  const handleClearHistory = async () => {
    try {
      await clearUserHistory()
      setHistory([])
      setTotalCount(0)
      setShowClearModal(false)
    } catch (err) {
      console.error('Error clearing history:', err)
      setError('Failed to clear history.')
    }
  }

  const handleUpdateGenreIds = async () => {
    try {
      setLoading(true)
      setError('')
      setIsSuccess(false)
      console.log('🔧 Starting genre IDs update...')
      
      const result = await updateHistoryGenreIds()
      console.log('🔧 Genre IDs update completed:', result)
      
      // Reload history to show updated data
      await loadHistory(1, false)
      
      // Show success message
      setError(`✅ Successfully updated genre IDs for ${result.updatedCount} out of ${result.total} movies.`)
      setIsSuccess(true)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setError('')
        setIsSuccess(false)
      }, 5000)
      
    } catch (err) {
      console.error('Error updating genre IDs:', err)
      setError('Failed to update genre IDs. Please try again.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      loadHistory(currentPage + 1, true)
    }
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    loadHistory(1, false)
  }

  const formatMovieData = (historyItem) => ({
    id: historyItem.movie_id,
    title: historyItem.movie_title,
    image: historyItem.poster_url || 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop', // Fallback to a nice movie poster-like image
    rating: historyItem.movie_rating,
    platform: 'Various',
    year: new Date(historyItem.clicked_at).getFullYear(),
    genre_ids: historyItem.movie_genre_ids,
    lastWatched: historyItem.watchedAgo,
    genreNames: historyItem.genreNames,
    overview: historyItem.overview || `Watched ${historyItem.watchedAgo}`,
    clicked_at: historyItem.clicked_at
  })

  if (loading && history.length === 0) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your viewing history...</h2>
          <p>Gathering your watched movies and shows</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="history-title">
          <Clock size={28} />
          <h1>Watch Again</h1>
          <span className="history-count">({totalCount} movies)</span>
        </div>
        
        <div className="history-actions">
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            <RotateCcw size={18} />
            Refresh
          </button>
          
          {/* <button 
            className="fix-genres-btn" 
            onClick={handleUpdateGenreIds} 
            disabled={loading}
            title="Update missing genre information for movies"
          >
            <Star size={18} />
            Fix Genres
          </button> */}
          
          {history.length > 0 && (
            <button 
              className="clear-btn" 
              onClick={() => setShowClearModal(true)}
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={`history-error ${isSuccess ? 'success' : ''}`}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => {
            setError('')
            setIsSuccess(false)
          }}>×</button>
        </div>
      )}

      <div className="history-filters">
        <div className="search-filter">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="history-search"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="period-filter"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="sort-filter"
          >
            <option value="clicked_at-desc">Most Recent</option>
            <option value="clicked_at-asc">Oldest First</option>
            <option value="movie_title-asc">Title A-Z</option>
            <option value="movie_title-desc">Title Z-A</option>
            <option value="movie_rating-desc">Highest Rated</option>
            <option value="movie_rating-asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="history-empty">
          {history.length === 0 ? (
            <>
              <Clock size={80} />
              <h2>No viewing history yet</h2>
              <p>Start watching movies to build your personalized history and get better recommendations!</p>
              <div className="empty-actions">
                <button className="browse-btn" onClick={() => window.location.href = '/'}>
                  <Play size={18} />
                  Start Watching
                </button>
              </div>
            </>
          ) : (
            <>
              <Search size={64} />
              <h2>No results found</h2>
              <p>Try adjusting your search or filter criteria.</p>
              <div className="empty-actions">
                <button className="clear-filters-btn" onClick={() => {
                  setSearchQuery('')
                  setFilterPeriod('all')
                }}>
                  <RotateCcw size={18} />
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="history-grid">
            {filteredHistory.map((item) => (
              <div key={`${item.movie_id}-${item.clicked_at}`} className="history-item">
                <ContentCard content={formatMovieData(item)} />
                <div className="history-meta">
                  <div className="history-details">
                    <span className="watch-time">{item.watchedAgo}</span>
                    {/* {item.genreNames && item.genreNames.length > 0 && (
                    //   <div className="genre-tags">
                    //     {item.genreNames.slice(0, 3).map(genre => (
                    //       <span key={genre} className="genre-tag">{genre}</span>
                    //     ))}
                    //   </div>
                    )} */}
                  </div>
                  <button
                    className="delete-item-btn"
                    onClick={() => handleDeleteItem(item.movie_id)}
                    title="Remove from history"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="load-more-section">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Clear History Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Clear Viewing History</h3>
            <p>Are you sure you want to clear your entire viewing history? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn danger"
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
