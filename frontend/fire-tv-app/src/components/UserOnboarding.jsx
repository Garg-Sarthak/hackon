import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile, getCurrentUser } from '../services/authService'
import '../styles/Auth.css'

const UserOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [preferences, setPreferences] = useState({
    favoriteGenres: [],
    contentLanguages: ['en'],
    ageRating: 'all',
    notifications: {
      recommendations: true,
      updates: true,
      watchParty: true
    }
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 
    'Thriller', 'Sci-Fi', 'Fantasy', 'Mystery', 'Crime', 'Family',
    'Animation', 'Documentary', 'Musical', 'War', 'Western', 'Biography'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' }
  ]

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        navigate('/signin')
      }
    }
    loadUser()
  }, [navigate])

  const handleGenreToggle = (genre) => {
    setPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }))
  }

  const handleLanguageToggle = (languageCode) => {
    setPreferences(prev => ({
      ...prev,
      contentLanguages: prev.contentLanguages.includes(languageCode)
        ? prev.contentLanguages.filter(l => l !== languageCode)
        : [...prev.contentLanguages, languageCode]
    }))
  }

  const handleNotificationChange = (type) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      await updateProfile({
        onboarding_completed: true,
        favorite_genres: preferences.favoriteGenres,
        content_languages: preferences.contentLanguages,
        age_rating_preference: preferences.ageRating,
        notification_preferences: preferences.notifications
      })

      // Navigate to home with welcome message
      navigate('/', { 
        state: { 
          welcomeMessage: `Welcome to the platform, ${user?.user_metadata?.display_name || user?.email}! 🎉` 
        }
      })
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setErrors({ general: 'Failed to save preferences. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/')
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Welcome! Let\'s personalize your experience'
      case 2: return 'What genres do you enjoy?'
      case 3: return 'Preferred content languages'
      case 4: return 'Notification preferences'
      default: return 'Welcome!'
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'We\'ll help you discover content you\'ll love'
      case 2: return 'Select all genres you\'re interested in (choose at least 3)'
      case 3: return 'Choose languages for content recommendations'
      case 4: return 'How would you like to stay updated?'
      default: return ''
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container onboarding">
        <div className="auth-header">
          <h1 className="auth-title">{getStepTitle()}</h1>
          <p className="auth-subtitle">{getStepSubtitle()}</p>
          
          {/* Progress indicator */}
          <div className="onboarding-progress">
            <div className="progress-steps">
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  className={`progress-step ${step <= currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                >
                  {step < currentStep ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {errors.general}
          </div>
        )}

        <div className="onboarding-content">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="onboarding-step">
              <div className="welcome-illustration">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="var(--accent-orange)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="welcome-text">
                <h3>Hello {user?.user_metadata?.display_name || 'there'}! 👋</h3>
                <p>
                  Let's set up your profile to give you the best personalized experience. 
                  This will only take a minute and you can always change these settings later.
                </p>
                <div className="feature-highlights">
                  <div className="feature">
                    <span className="feature-icon">🎯</span>
                    <span>Personalized recommendations</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🌍</span>
                    <span>Multi-language content</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔔</span>
                    <span>Smart notifications</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Genres */}
          {currentStep === 2 && (
            <div className="onboarding-step">
              <div className="genre-grid">
                {genres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    className={`genre-chip ${preferences.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <div className="selection-count">
                {preferences.favoriteGenres.length} selected 
                {preferences.favoriteGenres.length < 3 && (
                  <span className="min-requirement">(minimum 3)</span>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Languages */}
          {currentStep === 3 && (
            <div className="onboarding-step">
              <div className="language-grid">
                {languages.map(language => (
                  <button
                    key={language.code}
                    type="button"
                    className={`language-chip ${preferences.contentLanguages.includes(language.code) ? 'selected' : ''}`}
                    onClick={() => handleLanguageToggle(language.code)}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
              
              <div className="age-rating-section">
                <h4>Content Rating Preference</h4>
                <div className="rating-options">
                  {[
                    { value: 'all', label: 'All audiences' },
                    { value: 'teen', label: 'Teen and above' },
                    { value: 'mature', label: 'Mature content only' }
                  ].map(option => (
                    <label key={option.value} className="radio-option">
                      <input
                        type="radio"
                        name="ageRating"
                        value={option.value}
                        checked={preferences.ageRating === option.value}
                        onChange={(e) => setPreferences(prev => ({ ...prev, ageRating: e.target.value }))}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Notifications */}
          {currentStep === 4 && (
            <div className="onboarding-step">
              <div className="notification-options">
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Content Recommendations</h4>
                    <p>Get notified about new movies and shows you might like</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.recommendations}
                      onChange={() => handleNotificationChange('recommendations')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Platform Updates</h4>
                    <p>Stay informed about new features and improvements</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.updates}
                      onChange={() => handleNotificationChange('updates')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Watch Party Invitations</h4>
                    <p>Get notified when friends invite you to watch parties</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.watchParty}
                      onChange={() => handleNotificationChange('watchParty')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          <div className="action-buttons">
            {currentStep > 1 && (
              <button 
                type="button"
                className="back-button"
                onClick={handleBack}
                disabled={isLoading}
              >
                ← Back
              </button>
            )}
            
            <button
              type="button"
              className="skip-button"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </button>
            
            <button
              type="button"
              className="next-button"
              onClick={handleNext}
              disabled={isLoading || (currentStep === 2 && preferences.favoriteGenres.length < 3)}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : currentStep === 4 ? (
                'Complete Setup →'
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserOnboarding
