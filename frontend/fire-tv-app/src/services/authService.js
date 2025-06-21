import { supabase } from './api'

// Custom error class for auth errors
export class AuthError extends Error {
  constructor(message, code = null, details = null) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.details = details
  }
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
}

/**
 * Validates email format
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Validates password strength
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'none' }
  }
  
  const errors = []
  let strength = 0
  
  // Length check
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`)
  } else {
    strength += 1
  }
  
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_RULES.maxLength} characters`)
  }
  
  // Character requirements
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (PASSWORD_RULES.requireUppercase) {
    strength += 1
  }
  
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (PASSWORD_RULES.requireLowercase) {
    strength += 1
  }
  
  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (PASSWORD_RULES.requireNumbers) {
    strength += 1
  }
  
  if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else if (PASSWORD_RULES.requireSpecialChars) {
    strength += 1
  }
  
  // Additional strength indicators
  if (password.length >= 12) strength += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
  
  let strengthLevel = 'weak'
  if (strength >= 6) strengthLevel = 'strong'
  else if (strength >= 4) strengthLevel = 'good'
  else if (strength >= 2) strengthLevel = 'fair'
  
  return {
    isValid: errors.length === 0,
    error: errors.join('. '),
    strength: strengthLevel,
    score: strength
  }
}

/**
 * Enhanced error message mapping
 */
const getAuthErrorMessage = (error) => {
  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
    'Too many requests': 'Too many attempts. Please wait a moment before trying again.',
    'User already registered': 'An account with this email already exists. Try signing in instead.',
    'Signup disabled': 'Account registration is currently disabled. Please contact support.',
    'Invalid email': 'Please enter a valid email address.',
    'Weak password': 'Password is too weak. Please choose a stronger password.',
    'Password too short': 'Password must be at least 8 characters long.',
    'Email already exists': 'An account with this email already exists.',
    'User not found': 'No account found with this email address.',
    'Invalid token': 'The verification link has expired or is invalid.',
    'Token expired': 'The verification link has expired. Please request a new one.',
  }
  
  const message = error?.message || error
  
  // Check for specific error patterns
  for (const [key, value] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Default fallback
  return message || 'An unexpected error occurred. Please try again.'
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message)
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to get user information')
  }
}

/**
 * Sign up a new user with optional metadata
 */
export const signUp = async (email, password, metadata = {}) => {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw new AuthError(emailValidation.error, 'INVALID_EMAIL')
    }
    
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new AuthError(passwordValidation.error, 'INVALID_PASSWORD')
    }
    
    // console.log('🔐 Attempting signup for:', email, 'with metadata:', metadata)
    
    // Prepare signup data
    const signUpData = {
      email: email.toLowerCase().trim(),
      password
    }
    
    // Add user metadata if provided
    if (Object.keys(metadata).length > 0) {
      signUpData.options = {
        data: metadata
      }
    }
    
    // Attempt signup - Supabase will handle email confirmation based on project settings
    const { data, error } = await supabase.auth.signUp(signUpData)
    
    // console.log('🔐 Signup response:', { 
    //   user: !!data.user, 
    //   session: !!data.session, 
    //   userConfirmed: data.user?.email_confirmed_at ? 'yes' : 'no',
    //   error: error?.message 
    // })
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    // For now, return the data as-is, whether confirmation is needed or not
    return {
      user: data.user,
      session: data.session,
      needsConfirmation: data.user && !data.session
    }
    
  } catch (error) {
    console.error('Sign up error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(getAuthErrorMessage(error))
  }
}

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw new AuthError(emailValidation.error, 'INVALID_EMAIL')
    }
    
    if (!password) {
      throw new AuthError('Password is required', 'MISSING_PASSWORD')
    }
    
    // Attempt signin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    })
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    return {
      user: data.user,
      session: data.session
    }
    
  } catch (error) {
    console.error('Sign in error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(getAuthErrorMessage(error))
  }
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Sign out error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to sign out. Please try again.')
  }
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword) => {
  try {
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      throw new AuthError(passwordValidation.error, 'INVALID_PASSWORD')
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Password update error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to update password. Please try again.')
  }
}

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    })
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to update profile. Please try again.')
  }
}

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

/**
 * Get session information
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new AuthError(getAuthErrorMessage(error), error.message, error)
    }
    
    return session
    
  } catch (error) {
    console.error('Get session error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to get session information')
  }
}

/**
 * Check if an account exists with the given email (simplified)
 */
export const checkAccountExists = async (email) => {
  try {
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return null
    }
    
    // For simplicity, we'll do a sign-in attempt with a fake password
    // If user exists, we'll get "Invalid login credentials"
    // If user doesn't exist, we'll get "Invalid login credentials" (same message for security)
    // So we'll just return null for now and let the actual sign-in handle it
    return null
    
  } catch (error) {
    console.error('Error checking account existence:', error)
    return null
  }
}
