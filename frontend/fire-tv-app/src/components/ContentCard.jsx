import { Play, Star } from 'lucide-react'
import { trackMovieClick } from '../services/api'
import { Link } from 'react-router-dom';
import './ContentCard.css'

// Platform icons mapping
const platformIcons = {
  'Netflix': '🇳',
  'Prime Video': 'P',
  'Hotstar': 'H',
  'SonyLIV': 'S',
  'Zee5': 'Z',
  'MX Player': 'M'
}

const platformColors = {
  'Netflix': '#e50914',
  'Prime Video': '#00a8e1',
  'Hotstar': '#1f80e0',
  'SonyLIV': '#6c5ce7',
  'Zee5': '#7b68ee',
  'MX Player': '#ff6b35'
}

const ContentCard = ({ content, isLarge = false }) => {
  const handleClick = async () => {
    try {
      // Track the click for personalized recommendations
      await trackMovieClick({
        id: content.id,
        title: content.title,
        vote_average: content.rating,
        genre_ids: content.genre_ids || []
      })
      
      console.log('🎬 Movie click tracked:', content.title)
    } catch (error) {
      console.error('🎬 Error tracking movie click:', error)
    }
  }

  return (
    <Link 
      to={`/video/${content.id}`}  // Navigate to the video player page
      className={`content-card-link ${isLarge ? 'large-link' : ''}`} // Add classes for styling if needed
      onClick={handleClick} // You can still call your tracking function on click
    >
    <div className={`content-card ${isLarge ? 'large' : ''}`} onClick={handleClick}>
      <div className="card-image-container">
        <img 
          src={content.image} 
          alt={content.title}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <div className="card-actions">
            <button className="play-btn">
              <Play size={20} />
            </button>
          </div>
        </div>
        <div 
          className="platform-badge"
          style={{ backgroundColor: platformColors[content.platform] }}
        >
          {platformIcons[content.platform] || content.platform.charAt(0)}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{content.title}</h3>
        <div className="card-meta">
          <div className="rating">
            <Star size={12} fill="currentColor" />
            <span>{content.rating}</span>
          </div>
          <span className="year">{content.year}</span>
        </div>
        <div className="platform-name">{content.platform}</div>
      </div>
    </div>
    </Link>
  )
}

export default ContentCard
