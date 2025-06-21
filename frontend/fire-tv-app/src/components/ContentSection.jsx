import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ContentCarousel from './ContentCarousel'

const ContentSection = ({ title, content, showAll = false, isLarge = false }) => {
  return (
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showAll && (
          <Link to="/movies" className="view-all-btn">
            View All
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <ContentCarousel content={content} isLarge={isLarge} />
    </section>
  )
}

export default ContentSection
