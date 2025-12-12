// Firebase Authentication Error Handler
// Converts Firebase error codes to user-friendly messages

export const getAuthErrorMessage = (error) => {
  // If error is already a custom message, return as-is
  if (typeof error === 'string' && !error.includes('auth/')) {
    return error;
  }

  const errorCode = error.code || error;
  
  const errorMessages = {
    // Sign in errors
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/user-not-found': 'No account found with this email address. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    
    // Sign up errors
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/missing-password': 'Please enter a password.',
    'auth/password-does-not-meet-requirements': 'Password does not meet the requirements. Please check the password requirements.',
    
    // Password reset errors
    'auth/missing-email': 'Please enter your email address.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email address.',
    
    // Social auth errors
    'auth/popup-closed-by-user': 'Authentication was cancelled. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups and try again.',
    'auth/cancelled-popup-request': 'Authentication was cancelled. Please try again.',
    
    // Network and general errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/timeout': 'Authentication timed out. Please try again.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    
    // Default fallback
    'default': 'An authentication error occurred. Please try again.'
  };

  return errorMessages[errorCode] || errorMessages['default'];
};

export const handleAuthError = (error) => {
  // Enhanced logging for debugging
  console.error('Auth Error Details:', {
    error: error,
    code: error?.code,
    message: error?.message,
    typeof: typeof error
  });
  
  const userFriendlyMessage = getAuthErrorMessage(error);
  return userFriendlyMessage;
};
