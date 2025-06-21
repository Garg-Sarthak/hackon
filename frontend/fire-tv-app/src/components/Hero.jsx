import { useState, useEffect } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPopularMovies } from '../services/api'
import './Hero.css'
import { Link } from 'react-router-dom'

// Fallback static data in case backend fails
const fallbackMovies = [
  {
    id: 1,
    title: 'Stranger Things 4',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
    image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=1920&h=1080&fit=crop',
    platform: 'Netflix',
    rating: 8.7,
    year: 2022
  },
  {
    id: 2,
    title: 'The Boys',
    description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1920&h=1080&fit=crop',
    platform: 'Prime Video',
    rating: 8.8,
    year: 2022
  },
  {
    id: 3,
    title: 'House of the Dragon',
    description: 'The Targaryen civil war begins. House of the Dragon tells the story of the Targaryen dynasty.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
    platform: 'Hotstar',
    rating: 8.5,
    year: 2022
  },
  {
    id: 4,
    title: 'Scam 1992',
    description: 'Set in 1980s and 90s Bombay, it follows the life of Harshad Mehta, a stockbroker.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop',
    platform: 'SonyLIV',
    rating: 9.5,
    year: 2020
  }
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [trendingMovies, setTrendingMovies] = useState(fallbackMovies)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        console.log('🏠 Hero - Fetching trending movies from backend...')
        const movies = await getPopularMovies()
          if (movies && movies.length > 0) {
          // Transform backend data to Hero component format - only take top 4 most popular
          const transformedMovies = movies.slice(0, 4).map(movie => ({
            id: movie.id,
            title: movie.title,
            description: movie.overview || 'No description available.',
            image: movie.poster_url 
              ? movie.poster_url.replace('w500', 'w1920') // Get higher resolution image for hero
              : 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=1920&h=1080&fit=crop',
            platform: 'Various', // Backend doesn't provide platform info
            rating: movie.rating || 0,
            year: movie.release_year || 'N/A'
          }))
          
          setTrendingMovies(transformedMovies)
          console.log('🏠 Hero - Updated with backend movies:', transformedMovies.length)
        }
      } catch (error) {
        console.error('🏠 Hero - Error fetching trending movies:', error)
        console.log('🏠 Hero - Using fallback static data')
        // Keep fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingMovies()
  }, [])

  useEffect(() => {
    if (!loading && trendingMovies.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % trendingMovies.length)      }, 5000) // Auto-advance every 5 seconds

      return () => clearInterval(timer)
    }
  }, [loading, trendingMovies.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingMovies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length)
  }
  const currentMovie = trendingMovies[currentSlide]
  
  if (loading) {
    return (
      <section className="hero-carousel-container">
        <div className="hero-carousel">
          <div className="carousel-wrapper">
            <div className="hero-card" style={{ 
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="hero-overlay">
                <div className="hero-content">
                  <div className="hero-info">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                      Loading trending content...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="hero-carousel-container">
      <div className="hero-carousel">
        <button className="carousel-nav prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>
          <div className="carousel-wrapper">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {trendingMovies.map((movie, index) => (
              <div 
                key={movie.id}
                className="hero-card"
                style={{ backgroundImage: `url(${movie.image})` }}
              >
                <div className="hero-overlay">
                  <div className="hero-content">
                    <div className="hero-info">
                      <span className="hero-platform">{movie.platform}</span>
                      <h1 className="hero-title">{movie.title}</h1>
                      <p className="hero-description">{movie.description}</p>
                      <div className="hero-meta">
                        <span className="hero-rating">★ {movie.rating}</span>
                        <span className="hero-year">{movie.year}</span>
                      </div>
                      <div className="hero-buttons">
                        <Link to={`/video/${movie.id}`}>
                          <button className="btn-primary">
                            <Play size={20} />
                            Watch Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="carousel-indicators">
            {trendingMovies.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
          <button className="carousel-nav next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  )
}

export default Hero
