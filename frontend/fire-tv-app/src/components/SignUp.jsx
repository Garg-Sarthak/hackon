import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp, validateEmail, validatePassword, checkAccountExists } from '../services/authService'
import '../styles/Auth.css'

const SignUp = ({ onSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    acceptTerms: false,
    acceptMarketing: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState({ google: false, github: false })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0 })
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(null)
  const [step, setStep] = useState(1) // Multi-step form
  const [formProgress, setFormProgress] = useState(25)
  
  const usernameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const navigate = useNavigate()

  // Form progress tracking
  useEffect(() => {
    const fields = ['username', 'email', 'password', 'confirmPassword']
    const filledFields = fields.filter(field => formData[field].trim() !== '').length
    const progress = Math.round((filledFields / fields.length) * 100)
    setFormProgress(Math.max(25, progress))
  }, [formData])

  // Clear errors when user starts typing
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
    if (generalError) {
      setGeneralError('')
    }
  }, [formData.email, formData.password, formData.confirmPassword, formData.username])

  // Update password strength in real-time
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password)
      setPasswordStrength({
        strength: validation.strength,
        score: validation.score
      })
    } else {
      setPasswordStrength({ strength: 'none', score: 0 })
    }
  }, [formData.password])

  // Check if email already exists
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && validateEmail(formData.email).isValid) {
        setIsCheckingEmail(true)
        try {
          const exists = await checkAccountExists(formData.email)
          setEmailExists(exists)
        } catch (error) {
          console.error('Error checking email:', error)
        } finally {
          setIsCheckingEmail(false)
        }
      } else {
        setEmailExists(null)
      }
    }

    const debounceTimer = setTimeout(checkEmail, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.email])

  // Enable resend confirmation after 60 seconds
  useEffect(() => {
    if (needsConfirmation) {
      const timer = setTimeout(() => {
        setCanResendConfirmation(true)
      }, 60000) // 60 seconds

      return () => clearTimeout(timer)
    }
  }, [needsConfirmation])

  // Auto-focus logic removed - let users control their own navigation
  // useEffect(() => {
  //   if (step === 1 && formData.fullName.trim().length >= 2) {
  //     emailRef.current?.focus()
  //   } else if (step === 2 && formData.email && validateEmail(formData.email).isValid) {
  //     passwordRef.current?.focus()
  //   }
  // }, [step, formData.fullName, formData.email])

  const validateForm = () => {
    const newErrors = {}
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters'
    } else if (formData.username.trim().length > 30) {
      newErrors.username = 'Username must be less than 30 characters'
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, dots, dashes, and underscores'
    }
    
    // Email validation
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error
    } else if (emailExists) {
      newErrors.email = 'An account with this email already exists'
    }
    
    // Password validation
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessMessage('')
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await signUp(formData.email, formData.password, {
        display_name: formData.username.trim(),
        acceptMarketing: formData.acceptMarketing
      })
      
      if (result.needsConfirmation) {
        setNeedsConfirmation(true)
        setSuccessMessage(result.message)
      } else {
        setSuccessMessage('Account created successfully! Welcome aboard! 🎉')
        
        // Call callback if provided
        if (onSignUp) {
          onSignUp(result.user)
        }
        
        // Let the auth state change handle navigation automatically
        // No manual navigation needed - ProtectedRoute will handle it
      }
      
    } catch (error) {
      console.error('Sign up error:', error)
      setGeneralError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider) => {
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
        if (onSignUp) {
          onSignUp(result.user)
        }
        // Let auth state change handle navigation
      }
    } catch (error) {
      console.error(`${provider} sign up error:`, error)
      setGeneralError(error.message || `Failed to sign up with ${provider}`)
    } finally {
      setIsSocialLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleResendConfirmation = async () => {
    setGeneralError('')
    setSuccessMessage('')
    setIsLoading(true)
    
    try {
      const result = await resendConfirmation(formData.email)
      setSuccessMessage(result.message)
      setCanResendConfirmation(false)
      
      // Enable resend again after 60 seconds
      setTimeout(() => {
        setCanResendConfirmation(true)
      }, 60000)
      
    } catch (error) {
      setGeneralError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
    
    // Keep focus on the respective field
    setTimeout(() => {
      if (field === 'password') {
        passwordRef.current?.focus()
      }
    }, 0)
  }

  if (needsConfirmation) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">We've sent a confirmation link to {formData.email}</p>
          </div>

          {successMessage && (
            <div className="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {successMessage}
            </div>
          )}

          {generalError && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {generalError}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Please check your email and click the confirmation link to activate your account.
            </p>
            
            {canResendConfirmation ? (
              <button
                type="button"
                className="auth-button"
                onClick={handleResendConfirmation}
                disabled={isLoading}
                style={{ maxWidth: '200px', margin: '0 auto' }}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Resending...
                  </>
                ) : (
                  'Resend Email'
                )}
              </button>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You can resend the confirmation email in a moment
              </p>
            )}
          </div>

          <div className="auth-switch">
            <Link to="/signin" className="auth-switch-link">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Join thousands of users discovering amazing content</p>
          
          {/* Progress bar */}
          <div className="form-progress">
            <div className="form-progress-bar">
              <div 
                className="form-progress-fill" 
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <span className="form-progress-text">{formProgress}% complete</span>
          </div>
        </div>

        {generalError && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {generalError}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {successMessage}
          </div>
        )}

        {/* Social Sign Up Options */}
        <div className="social-auth">
          <div className="social-auth-text">
            <span>Quick sign up with</span>
          </div>
          <div className="social-buttons">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialSignUp('google')}
              disabled={isLoading || isSocialLoading.google}
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
              onClick={() => handleSocialSignUp('github')}
              disabled={isLoading || isSocialLoading.github}
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
          <span>Or create account with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-username">
              Username
              <span className="required">*</span>
            </label>
            <input
              id="signup-username"
              name="username"
              type="text"
              className={`form-input ${errors.username ? 'error' : ''} ${formData.username.trim().length >= 2 ? 'success' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
              autoFocus
              required
              ref={usernameRef}
            />
            {errors.username && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address
              <span className="required">*</span>
              {isCheckingEmail && (
                <span className="checking-indicator">
                  <div className="loading-spinner small"></div>
                  Checking...
                </span>
              )}
              {emailExists === false && formData.email && (
                <span className="account-status available">✓ Available</span>
              )}
              {emailExists === true && (
                <span className="account-status taken">⚠ Already registered</span>
              )}
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''} ${emailExists === false ? 'success' : ''} ${emailExists === true ? 'warning' : ''}`}
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              ref={emailRef}
            />
            {errors.email && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.email}
                {errors.email.includes('already exists') && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to="/signin" className="auth-switch-link">
                      Sign in instead →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
              <span className="required">*</span>
            </label>
            <div className="password-input-container">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
                ref={passwordRef}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('password')}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            
            {formData.password && passwordStrength.strength !== 'none' && (
              <div className="password-strength">
                <div className="password-strength-label">
                  Password strength: 
                  <span className={`strength-${passwordStrength.strength}`}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                <div className="password-strength-bar">
                  <div className={`password-strength-fill ${passwordStrength.strength}`}></div>
                </div>
                <div className="password-requirements">
                  <small>
                    ✓ At least 8 characters • ✓ Upper & lowercase • ✓ Numbers
                  </small>
                </div>
              </div>
            )}
            
            {errors.password && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirmPassword">
              Confirm Password
              <span className="required">*</span>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span className="match-indicator">✓ Passwords match</span>
              )}
            </label>
            <div className="password-input-container">
              <input
                id="signup-confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                I agree to the{' '}
                <Link to="/terms" className="auth-switch-link" target="_blank">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="auth-switch-link" target="_blank">
                  Privacy Policy
                </Link>
                <span className="required">*</span>
              </span>
            </label>
            {errors.acceptTerms && (
              <div className="field-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.acceptTerms}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label checkbox-label optional">
              <input
                type="checkbox"
                name="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                Send me updates about new features and content recommendations
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading || !formData.acceptTerms}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Creating your account...
              </>
            ) : (
              <>
                Create Account
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </>
            )}
          </button>

          {/* Security assurance */}
          <div className="form-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
            </svg>
            <span>Your information is encrypted and secure. We'll never share your data.</span>
          </div>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/signin" className="auth-switch-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignUp
