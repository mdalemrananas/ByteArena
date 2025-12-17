// Session Timeout Testing Utility
// This file contains utilities to test the session timeout functionality

import sessionTimeoutService from '../services/sessionTimeoutService';

// Test configurations
export const TEST_CONFIGS = {
  // Very short timeout for testing (30 seconds total)
  QUICK_TEST: {
    timeoutDuration: 30 * 1000, // 30 seconds
    warningDuration: 10 * 1000, // 10 seconds warning
  },
  // Medium timeout for demonstration (2 minutes total)
  MEDIUM_TEST: {
    timeoutDuration: 2 * 60 * 1000, // 2 minutes
    warningDuration: 30 * 1000, // 30 seconds warning
  },
  // Production settings (30 minutes total)
  PRODUCTION: {
    timeoutDuration: 30 * 60 * 1000, // 30 minutes
    warningDuration: 5 * 60 * 1000, // 5 minutes warning
  }
};

// Test function to initialize session timeout with custom config
export const testSessionTimeout = (config = TEST_CONFIGS.QUICK_TEST, warningCallback) => {
  console.log('🧪 Testing session timeout with config:', config);
  
  // Set custom timeout durations
  sessionTimeoutService.setTimeoutDuration(config.timeoutDuration);
  
  // Initialize with warning callback
  sessionTimeoutService.init(warningCallback);
  
  return {
    getTimeRemaining: () => sessionTimeoutService.getTimeRemaining(),
    extendSession: () => sessionTimeoutService.extendSession(),
    isAboutToExpire: () => sessionTimeoutService.isAboutToExpire(),
    cleanup: () => sessionTimeoutService.cleanup()
  };
};

// Demo function to show session timeout in action
export const demoSessionTimeout = () => {
  console.log('🎬 Starting session timeout demo...');
  
  const warningCallback = () => {
    console.log('⚠️ Session timeout warning triggered!');
    alert('Your session will expire soon! This is a test.');
  };
  
  const sessionTest = testSessionTimeout(TEST_CONFIGS.QUICK_TEST, warningCallback);
  
  // Log status every 5 seconds
  const statusInterval = setInterval(() => {
    const timeRemaining = sessionTest.getTimeRemaining();
    const isAboutToExpire = sessionTest.isAboutToExpire();
    
    console.log(`⏰ Time remaining: ${Math.round(timeRemaining / 1000)}s, About to expire: ${isAboutToExpire}`);
    
    if (timeRemaining <= 0) {
      clearInterval(statusInterval);
      console.log('🏁 Session timeout demo completed');
    }
  }, 5000);
  
  return () => {
    clearInterval(statusInterval);
    sessionTest.cleanup();
  };
};

// Console commands for manual testing
export const CONSOLE_COMMANDS = `
Session Timeout Testing Commands:
=================================

1. Quick Test (30s timeout):
   testSessionTimeout(TEST_CONFIGS.QUICK_TEST, () => alert('Warning! Session expiring soon!'))

2. Medium Test (2min timeout):
   testSessionTimeout(TEST_CONFIGS.MEDIUM_TEST, () => alert('Warning! Session expiring soon!'))

3. Demo Mode:
   demoSessionTimeout()

4. Check time remaining:
   sessionTimeoutService.getTimeRemaining()

5. Extend session:
   sessionTimeoutService.extendSession()

6. Check if about to expire:
   sessionTimeoutService.isAboutToExpire()

7. Cleanup:
   sessionTimeoutService.cleanup()
`;

export default {
  TEST_CONFIGS,
  testSessionTimeout,
  demoSessionTimeout,
  CONSOLE_COMMANDS
};
