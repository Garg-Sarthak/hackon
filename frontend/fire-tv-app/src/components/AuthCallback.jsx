import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/api'

const AuthCallback = ({ onSignIn }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          // User successfully authenticated
          const user = data.session.user
          
          if (onSignIn) {
            onSignIn(user)
          }
          
          // Redirect to the intended page or home
          const redirectTo = searchParams.get('redirectTo') || '/'
          navigate(redirectTo, { replace: true })
        } else {
          // No session found, redirect to sign in
          navigate('/signin', { 
            replace: true,
            state: { error: 'Authentication failed. Please try again.' }
          })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError(error.message)
        
        // Redirect to sign in with error message
        setTimeout(() => {
          navigate('/signin', { 
            replace: true,
            state: { error: error.message }
          })
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, onSignIn, searchParams])

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <h1 className="auth-title">Completing Sign In...</h1>
            <p className="auth-subtitle">Please wait while we set up your account</p>
          </div>
          
          <div style={{ margin: '2rem 0' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>
              This should only take a moment
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <h1 className="auth-title">Authentication Error</h1>
            <p className="auth-subtitle">Something went wrong during sign in</p>
          </div>
          
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {error}
          </div>
          
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            Redirecting to sign in page...
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback
