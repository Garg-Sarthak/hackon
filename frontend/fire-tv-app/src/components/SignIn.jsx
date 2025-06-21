import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signIn, validateEmail, checkAccountExists } from '../services/authService'
import '../styles/Auth.css'

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState({ google: false, github: false })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [emailSuggestions, setEmailSuggestions] = useState([])
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [accountExists, setAccountExists] = useState(null)
  const [lastAttempt, setLastAttempt] = useState(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // Email suggestions for common domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com']
  
  // Rate limiting and security
  useEffect(() => {
    const storedAttempts = localStorage.getItem('signin_attempts')
    const storedLastAttempt = localStorage.getItem('signin_last_attempt')
    
    if (storedAttempts && storedLastAttempt) {
      const attempts = parseInt(storedAttempts)
      const lastAttemptTime = parseInt(storedLastAttempt)
      const timeDiff = Date.now() - lastAttemptTime
      
      if (attempts >= 5 && timeDiff < 900000) { // 15 minutes block
        setIsBlocked(true)
        setAttemptCount(attempts)
        setBlockTimeRemaining(900000 - timeDiff)
      } else if (timeDiff >= 900000) {
        // Reset attempts after 15 minutes
        localStorage.removeItem('signin_attempts')
        localStorage.removeItem('signin_last_attempt')
      } else {
        setAttemptCount(attempts)
      }
    }
  }, [])

  // Block countdown timer
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsBlocked(false)
            localStorage.removeItem('signin_attempts')
            localStorage.removeItem('signin_last_attempt')
            return 0
          }
          return prev - 1000
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [isBlocked, blockTimeRemaining])

  // Clear errors when user starts typing
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
    if (generalError) {
      setGeneralError('')
    }
    if (resetMessage) {
      setResetMessage('')
    }
  }, [formData.email, formData.password])

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Email suggestions
  useEffect(() => {
    if (formData.email.includes('@') && !formData.email.includes('.')) {
      const [localPart, domainPart] = formData.email.split('@')
      if (domainPart) {
        const suggestions = commonDomains
          .filter(domain => domain.startsWith(domainPart.toLowerCase()))
          .map(domain => `${localPart}@${domain}`)
          .slice(0, 3)
        setEmailSuggestions(suggestions)
        setShowEmailSuggestions(suggestions.length > 0)
      } else {
        setEmailSuggestions([])
        setShowEmailSuggestions(false)
      }
    } else {
      setEmailSuggestions([])
      setShowEmailSuggestions(false)
    }
  }, [formData.email])

  // Check if account exists when email is valid
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && validateEmail(formData.email).isValid) {
        setIsCheckingEmail(true)
        try {
          const exists = await checkAccountExists(formData.email)
          setAccountExists(exists)
        } catch (error) {
          console.error('Error checking account:', error)
        } finally {
          setIsCheckingEmail(false)
        }
      } else {
        setAccountExists(null)
      }
    }

    const debounceTimer = setTimeout(checkEmail, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.email])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (!isLoading && !isBlocked) {
            handleSubmit(e)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, isBlocked, formData])

  const updateAttempts = () => {
    const newCount = attemptCount + 1
    setAttemptCount(newCount)
    setLastAttempt(Date.now())
    
    localStorage.setItem('signin_attempts', newCount.toString())
    localStorage.setItem('signin_last_attempt', Date.now().toString())
    
    if (newCount >= 5) {
      setIsBlocked(true)
      setBlockTimeRemaining(900000) // 15 minutes
    }
  }

  const formatBlockTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const validateForm = () => {
    const newErrors = {}
    
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isBlocked) {
      setGeneralError(`Too many failed attempts. Please wait ${formatBlockTime(blockTimeRemaining)} before trying again.`)
      return
    }
    
    setGeneralError('')
    setResetMessage('')
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await signIn(formData.email, formData.password)
      
      // Reset attempts on successful login
      localStorage.removeItem('signin_attempts')
      localStorage.removeItem('signin_last_attempt')
      setAttemptCount(0)
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      // Call callback if provided
      if (onSignIn) {
        onSignIn(result.user)
      }
      
      // Let auth state change handle navigation automatically
      setGeneralError('')
      
    } catch (error) {
      console.error('Sign in error:', error)
      updateAttempts()
      
      // Enhanced error handling
      if (error.message.includes('Invalid login credentials')) {
        if (accountExists === false) {
          setGeneralError('No account found with this email address. Would you like to create an account?')
        } else {
          setGeneralError('Incorrect password. Please check your password and try again.')
        }
      } else {
        setGeneralError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider) => {
    if (isBlocked) {
      setGeneralError(`Too many failed attempts. Please wait ${formatBlockTime(blockTimeRemaining)} before trying again.`)
      return
    }

    setIsSocialLoading(prev => ({ ...prev, [provider]: true }))
    setGeneralError('')
    
    try {
      let result
      if (provider === 'google') {
        result = await signInWithGoogle()
      } else if (provider === 'github') {
        result = await signInWithGitHub()
      }
      
      if (result?.user) {
        // Reset attempts on successful login
        localStorage.removeItem('signin_attempts')
        localStorage.removeItem('signin_last_attempt')
        setAttemptCount(0)
        
        if (onSignIn) {
          onSignIn(result.user)
        }
        // Let auth state change handle navigation
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error)
      updateAttempts()
      setGeneralError(error.message || `Failed to sign in with ${provider}`)
    } finally {
      setIsSocialLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setResetMessage('')
    
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error })
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await resetPassword(formData.email)
      setResetMessage(result.message)
      // Auto-switch back to sign in after 3 seconds
      setTimeout(() => {
        setIsResetMode(false)
      }, 3000)
    } catch (error) {
      setGeneralError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEmailSuggestionSelect = (suggestion) => {
    setFormData(prev => ({ ...prev, email: suggestion }))
    setShowEmailSuggestions(false)
    emailRef.current?.focus()
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    // Keep focus on password field
    setTimeout(() => passwordRef.current?.focus(), 0)
  }

  const handleForgotPassword = () => {
    if (formData.email) {
      setIsResetMode(true)
    } else {
      setErrors({ email: 'Please enter your email address first' })
      emailRef.current?.focus()
    }
  }

  if (isResetMode) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>
          </div>

          {generalError && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {generalError}
            </div>
          )}

          {resetMessage && (
            <div className="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {resetMessage}
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Automatically returning to sign in...
              </p>
            </div>
          )}

          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                autoFocus
                ref={emailRef}
              />
              {errors.email && (
                <div className="field-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="auth-switch">
            <button 
              type="button"
              className="auth-switch-link"
              onClick={() => setIsResetMode(false)}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            {accountExists === false 
              ? "No account found with this email" 
              : "Sign in to your account to continue"
            }
          </p>
        </div>

        {/* Rate limiting warning */}
        {isBlocked && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            Account temporarily locked due to multiple failed attempts. 
            Please wait {formatBlockTime(blockTimeRemaining)} before trying again.
          </div>
        )}

        {/* Attempt warning */}
        {attemptCount >= 3 && attemptCount < 5 && !isBlocked && (
          <div className="warning-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            Warning: {5 - attemptCount} attempts remaining before account is temporarily locked.
          </div>
        )}

        {generalError && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {generalError}
            {generalError.includes('No account found') && (
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/signup" className="auth-switch-link">
                  Create an account instead →
                </Link>
              </div>
            )}
          </div>
        )}

        {resetMessage && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {resetMessage}
          </div>
        )}

        {/* Social Sign In Options */}
        <div className="social-auth">
          <div className="social-auth-text">
            <span>Sign in with</span>
          </div>
          <div className="social-buttons">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading || isSocialLoading.google || isBlocked}
            >
              {isSocialLoading.google ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google
            </button>
            <button
              type="button"
              className="social-button github"
              onClick={() => handleSocialSignIn('github')}
              disabled={isLoading || isSocialLoading.github || isBlocked}
            >
              {isSocialLoading.github ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              GitHub
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>Or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">
              Email Address
              {isCheckingEmail && (
                <span className="checking-indicator">
                  <div className="loading-spinner small"></div>
                  Checking...
                </span>
              )}
              {accountExists === true && (
                <span className="account-status found">✓ Account found</span>
              )}
              {accountExists === false && (
                <span className="account-status not-found">⚠ No account found</span>
              )}
            </label>
            <div className="input-container">
              <input
                id="signin-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''} ${accountExists === true ? 'success' : ''} ${accountExists === false ? 'warning' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                autoFocus
                ref={emailRef}
                disabled={isBlocked}
              />
              {showEmailSuggestions && emailSuggestions.length > 0 && (
                <div className="email-suggestions">
                  {emailSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="email-suggestion"
                      onClick={() => handleEmailSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.email && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signin-password">Password</label>
            <div className="password-input-container">
              <input
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                ref={passwordRef}
                disabled={isBlocked}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isBlocked}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.password}
              </div>
            )}
            <div className="forgot-password">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={isBlocked}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isBlocked}
              />
              <span className="checkbox-text">Remember me for 30 days</span>
            </label>
          </div>

          <button 
            type="submit" 
            className={`auth-button ${isBlocked ? 'blocked' : ''}`}
            disabled={isLoading || isBlocked}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Signing in...
              </>
            ) : isBlocked ? (
              `Locked (${formatBlockTime(blockTimeRemaining)})`
            ) : (
              'Sign In'
            )}
          </button>

          {/* Quick access hint */}
          <div className="form-hint">
            <span>💡 Tip: Press Ctrl+Enter (⌘+Enter on Mac) to quickly sign in</span>
          </div>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-switch-link">
            Create one now
          </Link>
        </div>

        {/* Security notice */}
        <div className="security-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
          </svg>
          Your data is protected with enterprise-grade security
        </div>
      </div>
    </div>
  )
}

export default SignIn
