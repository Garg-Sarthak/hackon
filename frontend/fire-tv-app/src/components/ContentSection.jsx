import { ChevronRight } from 'lucide-react'
import ContentCarousel from './ContentCarousel'

const ContentSection = ({ title, content, showAll = false, isLarge = false }) => {
  return (
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showAll && (
          <button className="view-all-btn">
            View All
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      <ContentCarousel content={content} isLarge={isLarge} />
    </section>
  )
}

export default ContentSection
