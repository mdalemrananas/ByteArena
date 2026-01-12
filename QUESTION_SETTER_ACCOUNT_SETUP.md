# Question Setter Account Setup

## Account Credentials
- **Email:** alimran7164@gmail.com
- **Password:** anas@2026

## Setup Instructions

### Option 1: Sign Up Through the UI (Recommended)
1. Start the frontend application
2. Click on "Sign In" button
3. Switch to "Sign Up" mode
4. Enter the following details:
   - **Full Name:** (Any name you prefer, e.g., "Question Setter")
   - **Email:** alimran7164@gmail.com
   - **Password:** anas@2026
   - **Confirm Password:** anas@2026
5. Click "Sign Up"
6. After successful signup, you will be automatically redirected to `/question-setter` homepage

### Option 2: Sign In (If account already exists)
1. Start the frontend application
2. Click on "Sign In" button
3. Enter:
   - **Email:** alimran7164@gmail.com
   - **Password:** anas@2026
4. Click "Sign In"
5. You will be automatically redirected to `/question-setter` homepage

## Automatic Redirect
The application is configured to automatically redirect users with email `alimran7164@gmail.com` to the Question Setter homepage (`/question-setter`) instead of the regular dashboard after login.

This works for:
- Email/Password authentication
- Google Sign In
- GitHub Sign In

## Routes Available
- `/question-setter` - Question Setter Homepage
- `/question-setter/explore` - Explore Questions Page
- `/question-setter/create` - Create Question Page

