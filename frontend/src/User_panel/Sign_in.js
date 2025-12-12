// frontend/src/User_panel/Sign_in.js
import React, { useState, useEffect } from 'react';
import { FaGoogle, FaGithub, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './Sign_in.css';

const SignIn = ({ onClose }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
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
      formData.confirmPassword.trim() !== '';

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
        confirmPassword: ''
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
      } else {
        console.log('Attempting sign in with:', { email: formData.email });
        result = await signInWithEmail(formData.email, formData.password);
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
      
      if (result.success) {
        console.log('Google authentication successful:', result.user);
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
      
      if (result.success) {
        console.log('GitHub authentication successful:', result.user);
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