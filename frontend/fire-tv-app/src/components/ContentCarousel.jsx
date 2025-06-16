import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ContentCard from './ContentCard'
import './ContentCarousel.css'

const ContentCarousel = ({ content, isLarge = false }) => {
  const carouselRef = useRef(null)
  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = isLarge ? 240 : 170
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = isLarge ? 240 : 170
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="carousel-container">
      <button className="carousel-btn left" onClick={scrollLeft}>
        <ChevronLeft size={24} />
      </button>
      
      <div className="carousel" ref={carouselRef}>
        {content.map((item) => (
          <ContentCard key={item.id} content={item} isLarge={isLarge} />
        ))}
      </div>
      
      <button className="carousel-btn right" onClick={scrollRight}>
        <ChevronRight size={24} />
      </button>
    </div>
  )
}

export default ContentCarousel
