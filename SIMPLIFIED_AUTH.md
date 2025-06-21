# Simplified Authentication System

## Overview
Simplified the authentication system to use only:
- Supabase's built-in `auth.users` table
- Basic email/password authentication
- No OAuth providers (Google, GitHub)
- No email confirmation
- No complex user syncing

## What Was Removed
1. **OAuth Providers**: Removed Google and GitHub sign-in
2. **Email Confirmation**: Users can sign up and sign in immediately
3. **Password Reset**: Removed password reset functionality
4. **Complex User Sync**: No custom user table syncing
5. **Registration Checking**: Simplified to not pre-check user existence

## Current Authentication Functions

### Core Functions
- `signUp(email, password)` - Create new user account
- `signIn(email, password)` - Sign in existing user
- `signOut()` - Sign out current user
- `getCurrentUser()` - Get current authenticated user
- `getSession()` - Get current session

### Validation Functions  
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `checkAccountExists(email)` - Returns null (simplified)

### State Management
- `onAuthStateChange(callback)` - Listen for auth state changes

## Database Structure
- Uses Supabase's `auth.users` table for authentication
- Uses `public.movie_history` table for tracking user movie interactions
- User IDs from `auth.users` are used as foreign keys in `movie_history`

## Backend Endpoints
- `/api/track-click` - Track movie clicks (simplified, no user existence check)
- All movie recommendation endpoints remain unchanged

## Frontend Components
- `SignIn.jsx` - Simplified to only email/password
- `SignUp.jsx` - Simplified to only email/password
- Removed: `AuthCallback.jsx`, `UserOnboarding.jsx`, `ResetPassword.jsx`

## Usage
1. User signs up with email/password using `signUp()`
2. User signs in with email/password using `signIn()`
3. Movie clicks are tracked using the user ID from Supabase auth
4. Personalized recommendations work based on movie history

This system is much simpler and uses Supabase's authentication exactly as intended, without any additional complexity.
