import { Brain, TrendingUp } from 'lucide-react'
import ContentCarousel from './ContentCarousel'
import './AIRecommendations.css'

const AIRecommendations = ({ content }) => {
  return (
    <section className="ai-recommendations">
      <div className="ai-header">
        <div className="ai-title-container">
          <Brain className="ai-icon" size={28} />
          <div>
            <h2 className="ai-title">AI Recommendations</h2>
            <p className="ai-subtitle">Based on your watch history</p>
          </div>
        </div>
        <div className="ai-stats">
          <TrendingUp size={16} />
          <span>97% match accuracy</span>
        </div>
      </div>
      
      <div className="ai-description">
        <p>Our AI has analyzed your viewing patterns across all platforms and found these perfect matches for you.</p>
      </div>
      
      <ContentCarousel content={content} isLarge={true} />
    </section>
  )
}

export default AIRecommendations
