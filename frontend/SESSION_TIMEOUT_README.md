# Session Timeout Implementation

This document explains the session timeout functionality implemented in the RushCoder project.

## Overview

The session timeout system automatically signs out users after a period of inactivity to enhance security. The system includes:

- **Automatic timeout** after 30 minutes of inactivity
- **Warning modal** shown 5 minutes before timeout
- **Activity tracking** to detect user interaction
- **Manual session extension** option

## Features

### 1. Automatic Session Timeout
- **Default timeout duration**: 30 minutes
- **Warning duration**: 5 minutes before timeout
- **Activity events tracked**: mouse movement, clicks, keyboard input, scrolling, touch events

### 2. User Warning System
- Modal dialog appears 5 minutes before session expires
- User can choose to "Stay Signed In" or "Sign Out"
- Automatic signout if no action is taken

### 3. Session Management
- Session extends automatically with any user activity
- Manual session extension available
- Clean cleanup when user signs out manually

## Implementation Details

### Files Created/Modified

1. **`src/services/sessionTimeoutService.js`** (NEW)
   - Core session timeout logic
   - Activity tracking
   - Timer management
   - Automatic logout functionality

2. **`src/App.js`** (MODIFIED)
   - Integration with Firebase authentication
   - Warning modal UI
   - Session state management

3. **`src/utils/sessionTimeoutTest.js`** (NEW)
   - Testing utilities
   - Demo functions
   - Console commands for debugging

## Usage

### For Users
1. User logs in normally
2. Session timer starts automatically
3. Any activity (mouse, keyboard, scroll) resets the timer
4. Warning appears 5 minutes before timeout
5. User can extend session or sign out

### For Developers

#### Basic Usage
```javascript
import sessionTimeoutService from './services/sessionTimeoutService';

// Initialize with warning callback
sessionTimeoutService.init((warning) => {
  // Handle warning (e.g., show modal)
  console.log('Session about to expire!');
});
```

#### Testing
```javascript
// Import test utilities
import { TEST_CONFIGS, testSessionTimeout, demoSessionTimeout } from './utils/sessionTimeoutTest';

// Quick test (30 seconds)
testSessionTimeout(TEST_CONFIGS.QUICK_TEST);

// Demo mode
demoSessionTimeout();
```

## Configuration

### Default Settings
- **Timeout Duration**: 30 minutes (1,800,000 ms)
- **Warning Duration**: 5 minutes (300,000 ms)
- **Activity Events**: mousedown, mousemove, keypress, scroll, touchstart, click, keydown, keyup

### Custom Configuration
```javascript
// Change timeout duration
sessionTimeoutService.setTimeoutDuration(60 * 60 * 1000); // 1 hour

// Initialize with custom settings
sessionTimeoutService.init(warningCallback);
```

## Security Benefits

1. **Prevents unauthorized access** on unattended devices
2. **Reduces session hijacking risks**
3. **Compliance with security best practices**
4. **User-friendly warnings** before automatic logout

## Browser Compatibility

The implementation uses standard JavaScript APIs and is compatible with:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Session not timing out**
   - Check if user activity events are being captured
   - Verify the service is properly initialized

2. **Warning not showing**
   - Ensure warning callback is provided
   - Check browser console for errors

3. **Immediate logout**
   - Verify Firebase authentication state
   - Check for conflicting auth listeners

### Debug Commands
Open browser console and run:
```javascript
// Check time remaining
sessionTimeoutService.getTimeRemaining()

// Check if about to expire
sessionTimeoutService.isAboutToExpire()

// Extend session manually
sessionTimeoutService.extendSession()

// Cleanup
sessionTimeoutService.cleanup()
```

## Future Enhancements

Potential improvements:
1. **Configurable timeout duration** per user preference
2. **Multiple warning levels** (10 min, 5 min, 1 min)
3. **Session persistence** across browser tabs
4. **Admin override** for extended sessions
5. **Analytics tracking** for timeout events

## Testing

### Automated Testing
Run the demo function to test the complete flow:
```javascript
import { demoSessionTimeout } from './utils/sessionTimeoutTest';
demoSessionTimeout();
```

### Manual Testing Steps
1. Log in to the application
2. Wait for 25 minutes (or use quick test mode)
3. Verify warning modal appears
4. Test both "Stay Signed In" and "Sign Out" options
5. Verify automatic logout after timeout

## Support

For issues or questions about the session timeout implementation, refer to the code comments in the implementation files or contact the development team.
