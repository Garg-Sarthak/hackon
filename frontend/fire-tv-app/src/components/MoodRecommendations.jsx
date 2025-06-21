import { useState, useEffect } from 'react'
import { Heart, Zap, Coffee, Moon, Laugh, Drama, Search } from 'lucide-react'
import ContentCarousel from './ContentCarousel'
import { getMoodRecommendations } from '../services/api'
import './MoodRecommendations.css'

const moodOptions = [
  { id: 'romantic', name: 'Romantic', icon: Heart, color: '#ff6b9d' },
  { id: 'action', name: 'Action', icon: Zap, color: '#ffd93d' },
  { id: 'chill', name: 'Chill', icon: Coffee, color: '#6bcf7f' },
  { id: 'dark', name: 'Dark', icon: Moon, color: '#a8a8a8' },
  { id: 'comedy', name: 'Comedy', icon: Laugh, color: '#ff9500' },
  { id: 'drama', name: 'Drama', icon: Drama, color: '#ff6b6b' }
]

// Cache for mood recommendations to prevent unnecessary refetches
const moodRecommendationsCache = new Map()
const CACHE_EXPIRY = 3 * 60 * 1000 // 3 minutes cache for each mood

const MoodRecommendations = ({ content }) => {
  const [selectedMood, setSelectedMood] = useState('action')
  const [moodContent, setMoodContent] = useState(content || [])
  const [loading, setLoading] = useState(false)
  const [customMoodSearch, setCustomMoodSearch] = useState('')
  const [isCustomMoodActive, setIsCustomMoodActive] = useState(false)
  const handleMoodChange = async (moodId) => {
    if (selectedMood === moodId && moodContent.length > 0 && !isCustomMoodActive) {
      // Same mood selected and we have content, no need to refetch
      return
    }

    setSelectedMood(moodId)
    setIsCustomMoodActive(false) // Reset custom mood state
    
    // Check cache first
    const cacheKey = moodId
    const cachedData = moodRecommendationsCache.get(cacheKey)
    const now = Date.now()
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('🧠 Using cached mood recommendations for:', moodId)
      setMoodContent(cachedData.data)
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🧠 Fetching fresh recommendations for mood:', moodId)
      const recommendations = await getMoodRecommendations(moodId)
        // Transform backend data to match frontend format
      const transformedContent = recommendations.map(movie => ({
        id: movie.id,
        title: movie.title,
        platform: 'Various', // Backend doesn't provide platform info
        image: movie.poster_url || 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
        rating: movie.rating,
        year: movie.release_year,
        overview: movie.overview
      }))
      
      // Cache the results
      moodRecommendationsCache.set(cacheKey, {
        data: transformedContent,
        timestamp: Date.now()
      })
      
      setMoodContent(transformedContent)
      console.log('🧠 Mood content updated and cached:', transformedContent.length, 'items')
    } catch (error) {
      console.error('🧠 Error fetching mood recommendations:', error)
      // Fallback to original content if available
      setMoodContent(content || [])
    } finally {
      setLoading(false)
    }
  }
  const handleCustomMoodSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return

    console.log(`🔍 Custom mood search initiated for: "${searchTerm}"`)
    
    setSelectedMood('') // Clear selected predefined mood
    setIsCustomMoodActive(true)
    
    // Check cache first for custom mood
    const cacheKey = `custom_${searchTerm.toLowerCase()}`
    const cachedData = moodRecommendationsCache.get(cacheKey)
    const now = Date.now()
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('🧠 Using cached custom mood recommendations for:', searchTerm)
      setMoodContent(cachedData.data)
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🧠 Fetching custom mood recommendations for:', searchTerm)
      const recommendations = await getMoodRecommendations(searchTerm)
      
      console.log('🎬 Raw recommendations received:', recommendations.length, 'items')
      console.log('🎬 Sample recommendation:', recommendations[0])
      
      // Transform backend data to match frontend format
      const transformedContent = recommendations.map(movie => ({
        id: movie.id,
        title: movie.title,
        platform: 'Various',
        image: movie.poster_url || 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop',
        rating: movie.rating,
        year: movie.release_year,
        overview: movie.overview
      }))
      
      console.log('🎬 Transformed content:', transformedContent.length, 'items')
      
      // Cache the results
      moodRecommendationsCache.set(cacheKey, {
        data: transformedContent,
        timestamp: Date.now()
      })
      
      setMoodContent(transformedContent)
      console.log('🧠 Custom mood content updated and cached:', transformedContent.length, 'items')
      
      if (transformedContent.length === 0) {
        console.warn('⚠️ No movies found for mood:', searchTerm)
      }
    } catch (error) {
      console.error('🧠 Error fetching custom mood recommendations:', error)
      console.error('🧠 Error details:', error.message, error.stack)
      setMoodContent([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (customMoodSearch.trim()) {
      handleCustomMoodSearch(customMoodSearch.trim())
    }
  }

  const handleSearchChange = (e) => {
    setCustomMoodSearch(e.target.value)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e)
    }
  }

  // Load initial content for default mood
  useEffect(() => {
    if (!content || content.length === 0) {
      handleMoodChange(selectedMood)
    }
  }, [])

  return (
    <section className="mood-recommendations">
      <div className="mood-header">
        <h2 className="mood-title">Recommendations by Mood</h2>
        <p className="mood-subtitle">What's your vibe today?</p>
      </div>
        <div className="mood-selector">
        {moodOptions.map((mood) => {
          const IconComponent = mood.icon
          return (
            <button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id && !isCustomMoodActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
              onClick={() => handleMoodChange(mood.id)}
              style={{ '--mood-color': mood.color }}
              disabled={loading}
            >
              <IconComponent size={20} />
              <span>{mood.name}</span>
            </button>
          )
        })}
        
        {/* Custom Mood Search */}
        <form className="mood-search-container" onSubmit={handleSearchSubmit}>
          <Search 
            size={18} 
            className="mood-search-icon"
            onClick={(e) => {
              e.preventDefault()
              if (customMoodSearch.trim()) {
                handleSearchSubmit(e)
              }
            }}
            style={{ cursor: 'pointer' }}
          />
          <input
            type="text"
            placeholder="Search custom mood..."
            className={`mood-search-input ${isCustomMoodActive ? 'active' : ''}`}
            value={customMoodSearch}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            disabled={loading}
          />
        </form>
      </div>
        <div className="mood-content">
        {loading ? (
          <div className="loading-indicator">
            <p>Finding perfect matches for your mood...</p>
          </div>
        ) : (
          <>
            {/* {isCustomMoodActive && customMoodSearch && (
              <div className="current-mood-indicator">
                <p>Showing results for mood: <strong>"{customMoodSearch}"</strong></p>
              </div>
            )} */}
            <ContentCarousel content={moodContent} isLarge={false} />
            {moodContent.length === 0 && !loading && (
              <div className="no-mood-results">
                <p>No movies found for this mood. Try a different mood!</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default MoodRecommendations
