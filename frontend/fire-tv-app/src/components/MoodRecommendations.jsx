import { useState, useEffect } from 'react'
import { Heart, Zap, Coffee, Moon, Laugh, Drama } from 'lucide-react'
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

const MoodRecommendations = ({ content }) => {
  const [selectedMood, setSelectedMood] = useState('action')
  const [moodContent, setMoodContent] = useState(content || [])
  const [loading, setLoading] = useState(false)

  const handleMoodChange = async (moodId) => {
    setSelectedMood(moodId)
    setLoading(true)
    
    try {
      console.log('🧠 Fetching recommendations for mood:', moodId)
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
      
      setMoodContent(transformedContent)
      console.log('🧠 Mood content updated:', transformedContent.length, 'items')
    } catch (error) {
      console.error('🧠 Error fetching mood recommendations:', error)
      // Fallback to original content if available
      setMoodContent(content || [])
    } finally {
      setLoading(false)
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
              className={`mood-btn ${selectedMood === mood.id ? 'active' : ''} ${loading ? 'loading' : ''}`}
              onClick={() => handleMoodChange(mood.id)}
              style={{ '--mood-color': mood.color }}
              disabled={loading}
            >
              <IconComponent size={20} />
              <span>{mood.name}</span>
            </button>
          )
        })}
      </div>
      
      <div className="mood-content">
        {loading ? (
          <div className="loading-indicator">
            <p>Finding perfect matches for your mood...</p>
          </div>
        ) : (
          <ContentCarousel content={moodContent} isLarge={false} />
        )}
      </div>
    </section>
  )
}

export default MoodRecommendations
