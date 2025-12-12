// Test examples for authErrorHandler.js
import { getAuthErrorMessage } from './authErrorHandler.js';

// Example usage and test cases
const testErrors = [
  {
    code: 'auth/invalid-credential',
    message: 'Firebase: Error (auth/invalid-credential).'
  },
  {
    code: 'auth/user-not-found',
    message: 'Firebase: Error (auth/user-not-found).'
  },
  {
    code: 'auth/wrong-password',
    message: 'Firebase: Error (auth/wrong-password).'
  },
  {
    code: 'auth/email-already-in-use',
    message: 'Firebase: Error (auth/email-already-in-use).'
  },
  {
    code: 'auth/too-many-requests',
    message: 'Firebase: Error (auth/too-many-requests).'
  },
  {
    code: 'auth/network-request-failed',
    message: 'Firebase: Error (auth/network-request-failed).'
  }
];

console.log('Firebase Error Message Translation Examples:');
console.log('==========================================');

testErrors.forEach((error, index) => {
  const userFriendlyMessage = getAuthErrorMessage(error);
  console.log(`\n${index + 1}. Original: ${error.code}`);
  console.log(`   User-friendly: ${userFriendlyMessage}`);
});

// Test with custom message
console.log('\nCustom Message Test:');
console.log(`Original: "Email already registered. Please sign in instead."`);
console.log(`User-friendly: ${getAuthErrorMessage('Email already registered. Please sign in instead.')}`);
