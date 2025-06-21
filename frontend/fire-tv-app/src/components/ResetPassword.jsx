import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updatePassword, validatePassword } from '../services/authService'
import '../styles/Auth.css'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0 })
  const [successMessage, setSuccessMessage] = useState('')
  const [generalError, setGeneralError] = useState('')
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check for reset token in URL
  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (error) {
      setGeneralError(errorDescription || 'Invalid or expired reset link. Please request a new one.')
      setTimeout(() => {
        navigate('/signin')
      }, 5000)
    }
  }, [searchParams, navigate])

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

  // Clear errors when user types
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
    if (generalError) {
      setGeneralError('')
    }
  }, [formData.password, formData.confirmPassword])

  const validateForm = () => {
    const newErrors = {}
    
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
      await updatePassword(formData.password)
      setSuccessMessage('Password updated successfully! Redirecting to sign in...')
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin', {
          state: { 
            message: 'Password updated successfully. Please sign in with your new password.' 
          }
        })
      }, 3000)
      
    } catch (error) {
      console.error('Password reset error:', error)
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

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Reset Your Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        {generalError && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {generalError}
            {generalError.includes('Invalid or expired') && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                  Redirecting to sign in page...
                </span>
              </div>
            )}
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

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-password">New Password</label>
            <div className="password-input-container">
              <input
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your new password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                autoFocus
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
            <label className="form-label" htmlFor="reset-confirmPassword">
              Confirm New Password
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span className="match-indicator">✓ Passwords match</span>
              )}
            </label>
            <div className="password-input-container">
              <input
                id="reset-confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading || !formData.password || !formData.confirmPassword}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="auth-switch">
          Remember your password?{' '}
          <a href="/signin" className="auth-switch-link">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
