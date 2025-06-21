import { Play, Star } from 'lucide-react'
import { trackMovieClick } from '../services/api'
import { Link } from 'react-router-dom';
import './ContentCard.css'

// Genre mapping for TMDB genre IDs
const genreNames = {
  28: 'Action',
  12: 'Adventure', 
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
}

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
        title: content.title || content.name, // Handle both movie title and TV show name
        vote_average: content.rating || content.vote_average,
        genre_ids: content.genre_ids || [],
        genres: content.genres || [], // Include genres array if available
        movie_genre_ids: content.movie_genre_ids || [] // Include if coming from history
      })
      
      console.log('🎬 Movie click tracked:', content.title || content.name)
    } catch (error) {
      console.error('🎬 Error tracking movie click:', error)
      // Don't prevent navigation even if tracking fails
    }
  }

  // Get genre names from genre IDs
  const getGenreNames = () => {
    const genreIds = content.genre_ids || []
    return genreIds.map(id => genreNames[id]).filter(Boolean).slice(0, 2) // Show max 2 genres
  }

  const displayGenres = getGenreNames()

  return (
    <Link 
      to={`/video/${content.id}`}  // Navigate to the video player page
      className={`content-card-link ${isLarge ? 'large-link' : ''}`} // Add classes for styling if needed
      onClick={handleClick} // Track the click for personalized recommendations
    >
    <div className={`content-card ${isLarge ? 'large' : ''}`}>
      <div className="card-image-container">
        <img 
          src={content.image} 
          alt={content.title || content.name || 'Content'}
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
        {/* <div 
          className="platform-badge"
          style={{ backgroundColor: platformColors[content.platform] }}
        >
          {platformIcons[content.platform] || (content.platform && content.platform.charAt(0)) || '?'}
        </div> */}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{content.title || content.name || 'Unknown Title'}</h3>
        <div className="card-meta">
          <div className="rating">
            <Star size={12} fill="currentColor" />
            <span>{content.rating || content.vote_average || 'N/A'}</span>
          </div>
          <span className="year">{content.year || 'N/A'}</span>
        </div>
        {/* {displayGenres.length > 0 && (
          <div className="card-genre-tags">
            {displayGenres.map(genre => (
              <span key={genre} className="card-genre-tag">{genre}</span>
            ))}
          </div>
        )} */}
        <div className="platform-name">{content.platform || 'Unknown'}</div>
      </div>
    </div>
    </Link>
  )
}

export default ContentCard
