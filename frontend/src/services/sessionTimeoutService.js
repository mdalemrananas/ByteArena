import { logoutUser } from './authService';

class SessionTimeoutService {
  constructor() {
    this.timeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.warningDuration = 5 * 60 * 1000; // 5 minutes warning before timeout
    this.timeoutId = null;
    this.warningId = null;
    this.lastActivity = Date.now();
    this.warningCallback = null;
    this.isInitialized = false;
    
    // List of events that reset the timer
    this.activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown', 'keyup'
    ];
    
    this.handleActivity = this.handleActivity.bind(this);
  }

  // Initialize the session timeout
  init(warningCallback = null) {
    if (this.isInitialized) {
      this.cleanup();
    }
    
    this.warningCallback = warningCallback;
    this.lastActivity = Date.now();
    this.isInitialized = true;
    
    // Add event listeners for user activity
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    // Start the timers
    this.startTimers();
    
    console.log('Session timeout service initialized');
  }

  // Handle user activity
  handleActivity() {
    this.lastActivity = Date.now();
    
    // If we showed a warning, clear it since user is active
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
    
    // Restart the timers
    this.restartTimers();
  }

  // Start the timeout and warning timers
  startTimers() {
    const timeUntilWarning = this.timeoutDuration - this.warningDuration;
    
    // Set warning timer
    this.warningId = setTimeout(() => {
      this.showWarning();
    }, timeUntilWarning);
    
    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutDuration);
  }

  // Restart the timers
  restartTimers() {
    this.clearTimers();
    this.startTimers();
  }

  // Clear all timers
  clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  // Show warning to user
  showWarning() {
    if (this.warningCallback) {
      this.warningCallback();
    } else {
      // Default warning using browser alert
      const timeRemaining = Math.floor(this.warningDuration / 1000 / 60);
      const userResponse = window.confirm(
        `Your session will expire in ${timeRemaining} minutes due to inactivity. Do you want to stay signed in?`
      );
      
      if (userResponse) {
        this.handleActivity(); // User wants to stay signed in
      }
    }
  }

  // Handle session timeout
  async handleTimeout() {
    console.log('Session timed out due to inactivity');
    
    // Show message to user
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    message.textContent = 'Session expired. You have been signed out due to inactivity.';
    document.body.appendChild(message);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
    
    // Logout user
    await this.logout();
  }

  // Logout user and cleanup
  async logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.cleanup();
      // Redirect to home page
      window.location.href = '/';
    }
  }

  // Force logout (for manual sign out)
  async forceLogout() {
    console.log('Manual sign out triggered');
    await this.logout();
  }

  // Get time remaining until timeout
  getTimeRemaining() {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = Math.max(0, this.timeoutDuration - elapsed);
    return remaining;
  }

  // Check if session is about to expire
  isAboutToExpire() {
    const timeRemaining = this.getTimeRemaining();
    return timeRemaining <= this.warningDuration && timeRemaining > 0;
  }

  // Manually extend session
  extendSession() {
    this.handleActivity();
  }

  // Update timeout duration
  setTimeoutDuration(duration) {
    this.timeoutDuration = duration;
    this.restartTimers();
  }

  // Cleanup service
  cleanup() {
    this.clearTimers();
    
    // Remove event listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    this.isInitialized = false;
    console.log('Session timeout service cleaned up');
  }
}

// Create singleton instance
const sessionTimeoutService = new SessionTimeoutService();

export default sessionTimeoutService;
