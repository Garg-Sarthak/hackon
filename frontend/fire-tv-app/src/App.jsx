import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import Hero from './components/Hero'
import ContentSection from './components/ContentSection'
import VoiceSearch from './components/VoiceSearch'
import SearchResults from './components/SearchResults'
// Mock data for different content sections
const mockContent = {
  mostWatched: [
    { id: 1, title: 'Stranger Things', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop', rating: 8.7, year: 2022, genre_ids: [18, 9648, 878] },
    { id: 2, title: 'The Boys', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 8.8, year: 2022, genre_ids: [28, 35, 18] },
    { id: 3, title: 'Scam 1992', platform: 'SonyLIV', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=400&fit=crop', rating: 9.5, year: 2020, genre_ids: [18, 80] },
    { id: 4, title: 'Arya', platform: 'Hotstar', image: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=400&fit=crop', rating: 8.9, year: 2023, genre_ids: [28, 53] },
    { id: 5, title: 'The Family Man', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', rating: 8.3, year: 2021, genre_ids: [28, 18, 53] },
    { id: 6, title: 'Mumbai Diaries 26/11', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', rating: 8.1, year: 2021, genre_ids: [18, 53] }
  ],
  action: [
    { id: 12, title: 'John Wick 4', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1489599797670-5c6d5e9b6a3e?w=300&h=400&fit=crop', rating: 8.2, year: 2023, genre_ids: [28, 80, 53] },
    { id: 13, title: 'Extraction 2', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 7.8, year: 2023, genre_ids: [28, 53] },
    { id: 14, title: 'Tiger 3', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=400&fit=crop', rating: 7.5, year: 2023, genre_ids: [28, 12, 53] },
    { id: 15, title: 'Pathaan', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=400&fit=crop', rating: 8.0, year: 2023, genre_ids: [28, 12, 53] }
  ],
  drama: [
    { id: 16, title: 'The Crown', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', rating: 8.7, year: 2023, genre_ids: [18, 36] },
    { id: 17, title: 'Delhi Crime', platform: 'Netflix', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', rating: 8.5, year: 2022, genre_ids: [18, 80, 53] },
    { id: 18, title: 'Guilty Minds', platform: 'Prime Video', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop', rating: 8.1, year: 2022, genre_ids: [18, 9648] },
    { id: 19, title: 'Maharani', platform: 'SonyLIV', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=400&fit=crop', rating: 8.3, year: 2021, genre_ids: [18, 36] }
  ]
}

// Loading component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid var(--border-color)',
        borderTop: '3px solid var(--accent-orange)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }}></div>
      <p>Loading...</p>
    </div>
  </div>
)

// Protected Route component
const ProtectedRoute = ({ children, user, isLoading }) => {
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />
  }
  
  return children
}

// Auth Route component (redirects authenticated users away from auth pages)
const AuthRoute = ({ children, user, isLoading }) => {
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
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
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      // console.log('🔐 Auth state changed:', event, session?.user?.id || 'no user', 'email_confirmed:', session?.user?.email_confirmed_at ? 'yes' : 'no')
      
      if (mounted) {
        setUser(session?.user || null)
        setAuthError('')
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null)
        } else if (event === 'SIGNED_UP') {
          // console.log('🔐 User signed up, session:', !!session)
          setUser(session?.user || null)
        }
      }
    })

    initializeAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleVoiceSearchOpen = () => {
    // console.log('🎯 App - Voice search button clicked, opening overlay...')
    // Reset all search-related state when opening voice search
    setIsSearchResultsOpen(false)
    setSearchResults([])
    setSearchQuery('')
    setIsSearchLoading(false)
    setIsVoiceSearchOpen(true)
    // console.log('🎯 App - Voice search overlay opened and states reset')
  }

  const handleVoiceSearch = async (voiceInput) => {
    // console.log('🎯 App - handleVoiceSearch called with input:', voiceInput)
    try {
      setIsSearchLoading(true)
      setSearchQuery(voiceInput)
      setIsVoiceSearchOpen(false)
      setIsSearchResultsOpen(true)
      
      // Use the enhanced backend search
      const results = await performSmartSearchWithBackend(voiceInput)
      // console.log('🎯 App - Search results received:', results)
      
      setSearchResults(results || [])
    } catch (error) {
      console.error('❌ App - Voice search error:', error)
      setSearchResults([])
    } finally {
      setIsSearchLoading(false)
    }
  }

  const closeSearchResults = () => {
    setIsSearchResultsOpen(false)
    setSearchResults([])
    setSearchQuery('')
    setIsSearchLoading(false)
  }

  const handleSignOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Sign out error:', error)
      setAuthError('Failed to sign out')
    }
  }

  const handleSuccessfulAuth = (authenticatedUser) => {
    setUser(authenticatedUser)
    setAuthError('')
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return <LoadingScreen />
  }

  return (

                />

                <SearchResults
                  isOpen={isSearchResultsOpen}
                  onClose={closeSearchResults}
                  results={searchResults}
                  query={searchQuery}
                  isLoading={isSearchLoading}
                />
                
                <Routes>
                  <Route path="/" element={
                    <main className="main-content">
                      <Hero />
                      <div className="content-sections">
                        <AIRecommendations content={[]} />
                        <MoodRecommendations content={[]} />
                        <ContentSection 
                          title="Top Rated" 
                          content={contentSections.topRated}
                          showAll={true}
                        />
                        <ContentSection 
                          title="Popular Now" 
                          content={contentSections.popular}
                          showAll={true}
                        />
                        <ContentSection 
                          title="Most Watched" 
                          content={contentSections.mostWatched}
                          showAll={true}
                        />
                        <ContentSection 
                          title="Action" 
                          content={contentSections.action}
                          showAll={true}
                        />
                        <ContentSection 
                          title="Drama" 
                          content={contentSections.drama}
                          showAll={true}
                        />
                      </div>
                    </main>
                  } />

                  <Route path="/videos" element={
                    <main className="main-content">
                      <div className="content-sections">
                        <ContentSection 
                          title="Available Videos for Watch Party" 
                          content={[...contentSections.topRated, ...contentSections.popular, ...contentSections.action]}
                          showAll={true}
                        />
                      </div>
                    </main>
                  } />
                  
                  <Route path="/history" element={<History />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/tv-shows" element={<TVShowsPage />} />
                  <Route path="/test-watch-party" element={<WatchPartyTest />} />
                  
                  <Route path="/party/:partyId/:videoId" element={<WatchPartyPlayerPage user={user} />} /> 
                  <Route path="/video/:videoId" element={<WatchPartyPlayerPage user={user} />} /> 
                  <Route path="/party/:partyId" element={<WatchPartyPlayerPage user={user} />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
