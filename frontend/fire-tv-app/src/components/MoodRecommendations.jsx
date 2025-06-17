import { useState } from 'react'
import { Heart, Zap, Coffee, Moon, Laugh, Drama } from 'lucide-react'
import ContentCarousel from './ContentCarousel'
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
              className={`mood-btn ${selectedMood === mood.id ? 'active' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
              style={{ '--mood-color': mood.color }}
            >
              <IconComponent size={20} />
              <span>{mood.name}</span>
            </button>
          )
        })}
      </div>
      
      <div className="mood-content">
        <ContentCarousel content={content} isLarge={false} />
      </div>
    </section>
  )
}

export default MoodRecommendations
