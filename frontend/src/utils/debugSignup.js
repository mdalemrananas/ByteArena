// Debug utility for signup issues
// This helps identify what's causing the "An authentication error occurred" message

import { auth } from '../firebase';
import { fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from 'firebase/auth';

export const debugSignup = async (email, password, name) => {
  console.log('=== DEBUG SIGNUP START ===');
  console.log('Input:', { email, password: '***', name });
  
  try {
    // Step 1: Check if email exists
    console.log('Step 1: Checking if email exists...');
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    console.log('Sign in methods:', signInMethods);
    
    if (signInMethods.length > 0) {
      console.log('Email already exists');
      return { success: false, error: 'Email already registered. Please sign in instead.' };
    }
    
    // Step 2: Try to create user
    console.log('Step 2: Creating user...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', result.user);
    
    // Step 3: Update profile
    console.log('Step 3: Updating profile...');
    await result.user.updateProfile({ displayName: name });
    console.log('Profile updated');
    
    console.log('=== DEBUG SIGNUP SUCCESS ===');
    return { success: true, user: result.user };
    
  } catch (error) {
    console.log('=== DEBUG SIGNUP ERROR ===');
    console.log('Full error object:', error);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error name:', error.name);
    console.log('Error stack:', error.stack);
    console.log('Error typeof:', typeof error);
    
    // Try to get more specific error info
    if (error.customData) {
      console.log('Custom data:', error.customData);
    }
    
    return { success: false, error: error };
  }
};

// Add this to your browser console to test:
// import { debugSignup } from './utils/debugSignup.js';
// debugSignup('test@example.com', 'password123', 'Test User')
