// frontend/src/User_panel/Sign_in.js
import React, { useState, useEffect } from 'react';
import { FaGoogle, FaGithub, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import './Sign_in.css';

const SignIn = ({ onClose }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    userType: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const checkPasswordStrength = (password) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  // Check if all form fields are valid
  const validateForm = () => {
    if (!isSignUp) return true; // Always enable for sign in

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
    const isPasswordsMatch = formData.password === formData.confirmPassword;
    const isAllFieldsFilled = 
      formData.name.trim() !== '' && 
      formData.email.trim() !== '' && 
      formData.password.trim() !== '' && 
      formData.confirmPassword.trim() !== '' &&
      formData.userType !== '';

    return isPasswordStrong && isPasswordsMatch && isAllFieldsFilled;
  };

  // Update form validity when any dependency changes
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, passwordStrength, isSignUp]);

  const handleAuthSwitch = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setIsFlipping(false);
      setPasswordError('');
      setFormData({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
        userType: 'user'
      });
      setPasswordStrength({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    }, 200); // Match this with CSS animation duration
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength when password field changes
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear error when user starts typing in confirm password
    if (name === 'confirmPassword' && passwordError) {
      setPasswordError('');
    }
  };

  // Function to save user data to Supabase after successful signup
  const saveUserDataToSupabase = async (firebaseUser) => {
    try {
      const userData = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        auth_provider: 'email',
        display_name: formData.name,
        username: firebaseUser.email.split('@')[0], // Generate username from email
        skills: [], // Empty skills array initially
        rating: 1000, // Default rating
        wins: 0,
        losses: 0,
        matches_played: 0,
        is_active: true,
        is_verified: false,
        role: formData.userType,
        preferences: {},
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error saving user data to Supabase:', error);
        // Don't throw error here to avoid blocking signup flow
        // User will still be able to use the app even if database save fails
      } else {
        console.log('User data saved to Supabase successfully:', data);
      }
    } catch (error) {
      console.error('Unexpected error saving user data:', error);
    }
  };

  // Function to update Firebase user profile
  const updateFirebaseUserProfile = async (firebaseUser) => {
    try {
      // Update Firebase user profile with display name
      await updateProfile(firebaseUser, {
        displayName: formData.name
      });
      console.log('Firebase user profile updated successfully');
    } catch (error) {
      console.error('Error updating Firebase user profile:', error);
      // Don't throw error here to avoid blocking signup flow
    }
  };

  // Function to update last login timestamp
  const updateLastLoginInSupabase = async (firebaseUser) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUser.uid);

      if (error) {
        console.error('Error updating last login:', error);
        // Don't throw error here to avoid blocking sign in flow
      } else {
        console.log('Last login updated successfully');
      }
    } catch (error) {
      console.error('Unexpected error updating last login:', error);
    }
  };

  // Function to handle social authentication users (Google/GitHub)
  const handleSocialAuthUser = async (firebaseUser, provider) => {
    try {
      // First check if user already exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing user:', fetchError);
        return;
      }

      if (existingUser) {
        // User exists, just update last login
        await updateLastLoginInSupabase(firebaseUser);
        console.log('Existing social user logged in:', existingUser);
      } else {
        // New user, create record in Supabase
        const userData = {
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          auth_provider: provider,
          display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          username: firebaseUser.email?.split('@')[0] || `user_${Date.now()}`,
          avatar_url: firebaseUser.photoURL || null,
          skills: [], // Empty skills array initially
          rating: 1000, // Default rating
          wins: 0,
          losses: 0,
          matches_played: 0,
          is_active: true,
          is_verified: false,
          role: 'user',
          preferences: {},
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (error) {
          console.error('Error creating social user in Supabase:', error);
          // Don't throw error here to avoid blocking auth flow
        } else {
          console.log('New social user created in Supabase successfully:', data);
        }
      }
    } catch (error) {
      console.error('Unexpected error handling social auth user:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      
      // Check password strength requirements
      const strength = checkPasswordStrength(formData.password);
      const isStrongPassword = Object.values(strength).every(Boolean);
      
      if (!isStrongPassword) {
        setPasswordError('Please ensure your password meets all requirements');
        return;
      }
    }
    
    setPasswordError('');
    setAuthError('');
    setIsLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        console.log('Attempting sign up with:', {
          email: formData.email,
          passwordLength: formData.password.length,
          name: formData.name
        });
        result = await signUpWithEmail(formData.email, formData.password, formData.name);
        
        // If signup is successful, save user data to both Firebase and Supabase
        if (result.success && result.user) {
          // Update Firebase user profile
          await updateFirebaseUserProfile(result.user);
          
          // Save user data to Supabase
          await saveUserDataToSupabase(result.user);
        }
      } else {
        console.log('Attempting sign in with:', { email: formData.email });
        result = await signInWithEmail(formData.email, formData.password);
        
        // If sign in is successful, update last login in Supabase
        if (result.success && result.user) {
          await updateLastLoginInSupabase(result.user);
        }
      }
      
      if (result.success) {
        console.log('Authentication successful:', result.user);
        navigate('/dashboard');
        if (onClose) onClose();
      } else {
        console.log('Authentication failed with result:', result);
        console.log('Error message:', result.error);
        console.log('Error type:', typeof result.error);
        setAuthError(result.error);
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        console.log('Google authentication successful:', result.user);
        
        // Check if user exists in Supabase, if not create new user record
        await handleSocialAuthUser(result.user, 'google');
        
        navigate('/dashboard');
        if (onClose) onClose();
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      const result = await signInWithGithub();
      
      if (result.success && result.user) {
        console.log('GitHub authentication successful:', result.user);
        
        // Check if user exists in Supabase, if not create new user record
        await handleSocialAuthUser(result.user, 'github');
        
        navigate('/dashboard');
        if (onClose) onClose();
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-overlay">
      <div className="signin-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className={`signin-form-wrapper ${isFlipping ? 'flipping' : ''} ${isSignUp ? 'sign-up' : 'sign-in'}`}>
          <div className="signin-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-form">
            {isSignUp && (
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {isSignUp && (
              <div className="form-group">
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="user-type-select"
                  required
                >
                  <option disabled value="">Select User Type</option>
                  <option value="user">User</option>
                  <option value="moderator">Question Setter</option>
                </select>
              </div>
            )}
            <div className="form-group password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="password-input"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {isSignUp && (
              <>
                <div className="form-group password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={isSignUp}
                    minLength="6"
                    className={`password-input ${passwordError ? 'error' : ''}`}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {passwordError && <div className="error-message">{passwordError}</div>}
                </div>
                
                <div className="password-requirements">
                  <div className="requirement-title">Password must contain:</div>
                  <div className={`requirement ${passwordStrength.hasMinLength ? 'met' : ''}`}>
                    {passwordStrength.hasMinLength ? '✓' : '•'} At least 8 characters
                  </div>
                  <div className={`requirement ${passwordStrength.hasUpperCase ? 'met' : ''}`}>
                    {passwordStrength.hasUpperCase ? '✓' : '•'} At least one uppercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.hasLowerCase ? 'met' : ''}`}>
                    {passwordStrength.hasLowerCase ? '✓' : '•'} At least one lowercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.hasNumber ? 'met' : ''}`}>
                    {passwordStrength.hasNumber ? '✓' : '•'} At least one number
                  </div>
                  <div className={`requirement ${passwordStrength.hasSpecialChar ? 'met' : ''}`}>
                    {passwordStrength.hasSpecialChar ? '✓' : '•'} At least one special character
                  </div>
                </div>
              </>
            )}
            
            {authError && <div className="error-message auth-error">{authError}</div>}
            
            <button 
              type="submit" 
              className={`signin-btn ${!isFormValid || isLoading ? 'disabled' : ''}`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">Processing...</span>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button 
              className="social-btn google" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FaGoogle /> {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
            <button 
              className="social-btn github" 
              onClick={handleGithubSignIn}
              disabled={isLoading}
            >
              <FaGithub /> {isSignUp ? 'Sign up with GitHub' : 'Sign in with GitHub'}
            </button>
          </div>

          <div className="switch-auth">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              onClick={handleAuthSwitch} 
              className="switch-btn"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;