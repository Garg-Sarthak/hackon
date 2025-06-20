import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import AIRecommendations from './components/AIRecommendations'
import MoodRecommendations from './components/MoodRecommendations'
import ContentSection from './components/ContentSection'
import MobileMenu from './components/MobileMenu'
import VoiceSearch from './components/VoiceSearch'
import SearchResults from './components/SearchResults'
import { performSmartSearch, performSmartSearchWithBackend, getTopRatedMovies, getPopularMovies, getMostWatchedMovies, getTrendingForCarousel, getPopularForCarousel, getTopRatedForCarousel, getActionMoviesForCarousel, getDramaForCarousel, getComedyForCarousel, getTVShowsForCarousel } from './services/api'
import './App.css'
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import WatchPartyPlayerPage from './WatchPartyPlayerPage';
import './App.css'
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react' 
// import VideoListPagePlaceholder from './VideoListPagePlaceholder';

// Mock data for different content sections
const mockContent = {
  mostWatched: [
    { id: 1, title: 'Stranger Things', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop', rating: 8.7, year: 2022 },
    { id: 2, title: 'The Boys', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 8.8, year: 2022 },
    { id: 3, title: 'Scam 1992', platform: 'SonyLIV', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=400&fit=crop', rating: 9.5, year: 2020 },
    { id: 4, title: 'Arya', platform: 'Hotstar', image: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=400&fit=crop', rating: 8.9, year: 2023 },
    { id: 5, title: 'The Family Man', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', rating: 8.3, year: 2021 },
    { id: 6, title: 'Mumbai Diaries 26/11', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', rating: 8.1, year: 2021 }
  ],
  trending: [
    { id: 7, title: 'House of Dragons', platform: 'Hotstar', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop', rating: 8.5, year: 2022 },
    { id: 8, title: 'Rudra', platform: 'Hotstar', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 7.9, year: 2022 },
    { id: 9, title: 'Rocket Boys', platform: 'SonyLIV', image: 'https://images.unsplash.com/photo-1478720568477-b36df5c9e7b2?w=300&h=400&fit=crop', rating: 8.6, year: 2022 },
    { id: 10, title: 'Human', platform: 'Hotstar', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop', rating: 8.0, year: 2022 },
    { id: 11, title: 'Ashram', platform: 'MX Player', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', rating: 7.8, year: 2022 }
  ],
  action: [
    { id: 12, title: 'John Wick 4', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop', rating: 8.2, year: 2023 },
    { id: 13, title: 'Extraction 2', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 7.8, year: 2023 },
    { id: 14, title: 'Tiger 3', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=400&fit=crop', rating: 7.5, year: 2023 },
    { id: 15, title: 'Pathaan', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=400&fit=crop', rating: 8.0, year: 2023 }
  ],
  drama: [
    { id: 16, title: 'The Crown', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', rating: 8.7, year: 2023 },
    { id: 17, title: 'Delhi Crime', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', rating: 8.5, year: 2022 },
    { id: 18, title: 'Guilty Minds', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop', rating: 8.1, year: 2022 },
    { id: 19, title: 'Maharani', platform: 'SonyLIV', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 8.3, year: 2021 }
  ]
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false)
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [contentSections, setContentSections] = useState({
    topRated: [],
    popular: [],
    mostWatched: [],
    trending: [],
    action: [],
    drama: [],
    comedy: [],
    tvShows: []
  })
  // Load initial content from TMDB API
  useEffect(() => {
    const loadInitialContent = async () => {
      try {        console.log('📱 Loading initial content from TMDB API...')
        
        const [topRated, popular, mostWatched, trending, action, drama, comedy, tvShows] = await Promise.all([
          getTopRatedForCarousel(),
          getPopularForCarousel(),
          getTrendingForCarousel('movie', 'day'), // Use daily trending for most watched
          getTrendingForCarousel('movie', 'week'),
          getActionMoviesForCarousel(),
          getDramaForCarousel(),
          getComedyForCarousel(),
          getTVShowsForCarousel()
        ])

        setContentSections({
          topRated: topRated,
          popular: popular,
          mostWatched: mostWatched,
          trending: trending,
          action: action,
          drama: drama,
          comedy: comedy,
          tvShows: tvShows
        })

        console.log('📱 TMDB content loaded successfully:', {
          topRated: topRated.length,
          popular: popular.length,
          mostWatched: mostWatched.length,
          trending: trending.length,
          action: action.length,
          drama: drama.length,
          comedy: comedy.length,
          tvShows: tvShows.length
        })
      } catch (error) {
        console.error('📱 Error loading TMDB content:', error)        // Fallback to hardcoded content if TMDB fails
        setContentSections({
          topRated: mockContent.drama || [],
          popular: mockContent.trending || [],
          mostWatched: mockContent.mostWatched || [],
          trending: mockContent.trending || [],
          action: mockContent.action || [],
          drama: mockContent.drama || [],
          comedy: mockContent.action || [], // Fallback to action for comedy
          tvShows: mockContent.trending || [] // Fallback to trending for TV shows
        })
      }
    }

    loadInitialContent()
  }, [])

  const handleVoiceSearchOpen = () => {
    console.log('🎯 App - Voice search button clicked, opening overlay...')
    // Reset all search-related state when opening voice search
    setIsSearchResultsOpen(false)
    setSearchResults([])
    setSearchQuery('')
    setIsSearchLoading(false)
    setIsVoiceSearchOpen(true)
    console.log('🎯 App - Voice search overlay opened and states reset')
  }

  const handleVoiceSearch = async (voiceInput) => {
    console.log('🎯 App - handleVoiceSearch called with input:', voiceInput)
    try {
      setIsSearchLoading(true)
      setSearchQuery(voiceInput)
      setIsVoiceSearchOpen(false)
      setIsSearchResultsOpen(true)
      console.log('🎯 App - UI states updated, starting search process...')

      console.log('🔍 App - Calling performSmartSearchWithBackend with:', voiceInput)
      const searchData = await performSmartSearchWithBackend(voiceInput)
      console.log('🔍 App - performSmartSearch returned:', searchData)
      
      setSearchResults(searchData.results)
      console.log('🔍 App - Search results set:', searchData.results.length, 'items')
    } catch (error) {
      console.error('🔍 App - Voice search error:', error)
      setSearchResults([])
    } finally {
      setIsSearchLoading(false)
      console.log('🔍 App - Search process completed, loading state cleared')
    }
  }

  const closeSearchResults = () => {
    setIsSearchResultsOpen(false)
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <Router> 
    <div className="app">
      
      <Header 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onVoiceSearch={handleVoiceSearchOpen}
      />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        onVoiceSearch={handleVoiceSearchOpen}
      />
      
      <VoiceSearch
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearch={handleVoiceSearch}
      />

      <SearchResults
        isOpen={isSearchResultsOpen}
        onClose={closeSearchResults}
        results={searchResults}
        query={searchQuery}
        isLoading={isSearchLoading}
      />
      
      <Routes>
          {/* Your Existing Home/Main Content View */}
          <Route path="/" element={
            <main className="main-content">
              <Hero />              <div className="content-sections">
                <AIRecommendations content={[]} />
                <MoodRecommendations content={[]} />
                <ContentSection 
                  title="Trending Now" 
                  content={contentSections.trending}
                  showAll={true}
                />
                <ContentSection 
                  title="Top Rated Movies" 
                  content={contentSections.topRated}
                  showAll={true}
                />
                <ContentSection 
                  title="Popular Movies" 
                  content={contentSections.popular}
                  showAll={true}
                />
                <ContentSection 
                  title="Action Movies" 
                  content={contentSections.action}
                  showAll={true}
                />                <ContentSection 
                  title="Drama Series" 
                  content={contentSections.drama}
                  showAll={true}
                />
                <ContentSection 
                  title="Comedy Shows" 
                  content={contentSections.comedy}
                  showAll={true}
                />
                <ContentSection 
                  title="TV Shows" 
                  content={contentSections.tvShows}
                  showAll={true}
                />
                <ContentSection 
                  title="Most Watched" 
                  content={contentSections.mostWatched}
                  showAll={true}
                />
                {/* Add a link to a list of videos to start a watch party */}
                <Link to="/videos">Browse Videos for Watch Party</Link> 
              </div>
            </main>
          } />

          {/* New Routes for Watch Party */}
          {/* <Route path="/videos" element={<VideoListPagePlaceholder />} /> */}
          <Route path="/video/:videoId" element={<WatchPartyPlayerPage />} /> 
          <Route path="/party/:partyId" element={<WatchPartyPlayerPage />} />

          
        </Routes>
    </div>
    </Router>
  )
}

export default App
