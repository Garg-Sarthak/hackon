import { ArrowLeft, Search, Filter, Star } from 'lucide-react'
import ContentCard from './ContentCard'
import './SearchResults.css'

const SearchResults = ({ isOpen, onClose, results, query, isLoading }) => {
  if (!isOpen) return null

  const formatResults = (tmdbResults) => {
    // Ensure tmdbResults is an array
    if (!Array.isArray(tmdbResults)) {
      console.warn('SearchResults - tmdbResults is not an array:', tmdbResults)
      return []
    }
    
    return tmdbResults.map(item => ({
      id: item.id,
      title: item.title || item.name,
      platform: 'TMDB', // You can enhance this to map to actual platforms
      image: item.poster_path 
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
      rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
      year: item.release_date 
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date 
        ? new Date(item.first_air_date).getFullYear()
        : 'N/A',
      overview: item.overview
    }))
  }

  // Handle different result formats
  let actualResults = []
  if (results) {
    if (Array.isArray(results)) {
      // Results is already an array
      actualResults = results
    } else if (results.results && Array.isArray(results.results)) {
      // Results is an object with a results property
      actualResults = results.results
    } else {
      console.warn('SearchResults - Unexpected results format:', results)
      actualResults = []
    }
  }

  const formattedResults = formatResults(actualResults)

  return (
    <div className="search-results-overlay">
      <div className="search-results-content">
        <div className="search-results-header">
          <button className="back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
            Back to Home
          </button>
          
          <div className="search-info">
            <div className="search-query">
              <Search size={20} />
              <span>"{query}"</span>
            </div>
            {!isLoading && formattedResults.length > 0 && (
              <div className="results-count">
                {formattedResults.length} results found
              </div>
            )}
          </div>
          
          <button className="filter-btn">
            <Filter size={20} />
            Filter
          </button>
        </div>

        <div className="search-results-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Searching...</h3>
              <p>Finding the best movies and shows for you</p>
            </div>
          ) : formattedResults.length > 0 ? (
            <div className="results-container">
              <div className="results-grid">
                {formattedResults.map((item) => (
                  <div key={item.id} className="result-item">
                    <ContentCard content={item} isLarge={false} />
                    {item.overview && (
                      <div className="result-overview">
                        <p>{item.overview.substring(0, 150)}...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <Search size={48} />
              </div>
              <h3>No results found</h3>
              <p>Try searching with different keywords or check your spelling</p>
              <div className="search-suggestions">
                <h4>Try searching for:</h4>
                <div className="suggestion-tags">
                  <span className="suggestion-tag">Action movies</span>
                  <span className="suggestion-tag">Comedy shows</span>
                  <span className="suggestion-tag">Thriller</span>
                  <span className="suggestion-tag">Romance</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults
