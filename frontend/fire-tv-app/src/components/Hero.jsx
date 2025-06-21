import { useState, useEffect } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { getHeroCarouselContent } from '../services/api'
import { Link } from 'react-router-dom'
import './Hero.css'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroMovies, setHeroMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        setLoading(true)
        console.log('🦸 Loading hero carousel content...')
        const content = await getHeroCarouselContent()
        setHeroMovies(content)
        console.log('🦸 Hero content loaded:', content.length, 'movies')
      } catch (error) {
        console.error('🦸 Error loading hero content:', error)
        // Fallback to hardcoded content
        setHeroMovies([
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
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadHeroContent()
  }, [])

  useEffect(() => {
    if (heroMovies.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroMovies.length)
      }, 5000) // Auto-advance every 5 seconds

      return () => clearInterval(timer)
    }
  }, [heroMovies.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)
  }

  if (loading) {
    return (
      <section className="hero-carousel-container">
        <div className="hero-loading">
          <p>Loading featured content...</p>
        </div>
      </section>
    )
  }

  if (heroMovies.length === 0) {
    return null
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
            {heroMovies.map((movie, index) => (
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
                        <Link  to={`/video/${movie.id}`}>
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
            {heroMovies.map((_, index) => (
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
