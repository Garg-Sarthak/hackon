// Test script to verify authentication and movie tracking
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BACKEND_URL = 'http://localhost:8081';

async function testAuthentication() {
  try {
    console.log('🔐 Testing Supabase Authentication...');
    
    // Test with a test user email
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    console.log('👤 Trying to sign up test user...');
    
    // Try to sign up (will fail if user already exists, which is fine)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('❌ Sign up error:', signUpError);
      return;
    }
    
    console.log('✅ Sign up successful or user already exists');
    
    // Sign in
    console.log('🔑 Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError);
      return;
    }
    
    console.log('✅ Successfully signed in!');
    console.log('👤 User ID:', signInData.user.id);
    
    // Test movie click tracking
    console.log('🎬 Testing movie click tracking...');
    
    const response = await fetch(`${BACKEND_URL}/api/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: signInData.user.id,
        movieId: 12345,
        movieTitle: 'Test Movie Authentication',
        movieGenreIds: [28, 12],
        movieRating: 8.5
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Movie click tracking successful!');
      console.log('📊 Result:', result);
    } else {
      console.error('❌ Movie click tracking failed:');
      console.error('📊 Error:', result);
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('👋 Signed out successfully');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testAuthentication();
