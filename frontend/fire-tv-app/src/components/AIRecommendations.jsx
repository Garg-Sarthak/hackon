import { useState, useEffect } from 'react'
import { Brain, TrendingUp } from 'lucide-react'
import ContentCarousel from './ContentCarousel'
import { getPersonalizedRecommendations } from '../services/api'
import './AIRecommendations.css'

const AIRecommendations = ({ content }) => {
  const [aiContent, setAiContent] = useState(content || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      if (!content || content.length === 0) {
        setLoading(true)
        try {
          console.log('🤖 Fetching personalized AI recommendations...')
          const recommendations = await getPersonalizedRecommendations()
          
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
          
          setAiContent(transformedContent)
          console.log('🤖 AI content updated:', transformedContent.length, 'items')
        } catch (error) {
          console.error('🤖 Error fetching personalized recommendations:', error)
          // Keep original content if available
          if (content && content.length > 0) {
            setAiContent(content)
          }
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPersonalizedRecommendations()
  }, [content])

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
      
      {loading ? (
        <div className="loading-indicator">
          <p>AI is analyzing your preferences...</p>
        </div>
      ) : (
        <ContentCarousel content={aiContent} isLarge={true} />
      )}
    </section>
  )
}

export default AIRecommendations
