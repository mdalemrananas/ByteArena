# Admin Panel

This is the admin panel for Byte Arena platform.

## Setup Instructions

### Initial Admin Account Setup

1. **Sign Up as Admin:**
   - Go to the homepage
   - Click "Sign In" 
   - Switch to "Sign Up" tab
   - Use the following credentials:
     - Email: `lamiakamalnusny@gmail.com`
     - Password: `Lamia@1234.`
     - Name: `Admin User`
   - Complete the signup process

2. **Access Admin Panel:**
   - After signing up, navigate to `/admin/login`
   - Log in with the admin credentials
   - You will be redirected to `/admin/dashboard`

### Alternative Setup (Browser Console)

If the admin account needs to be set up manually:

1. Open browser console (F12)
2. Run: `window.setupAdmin()`
3. This will set up the admin account in the database

## Admin Credentials

- **Email:** lamiakamalnusny@gmail.com
- **Password:** Lamia@1234.
- **Role:** Administrator

## Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard/homepage

## Admin Features

The admin panel includes:
- User management
- Contest management
- Problem management
- Submission management
- Analytics dashboard
- System settings

## File Structure

```
Admin-panel/
├── admin_login.js          # Admin login component
├── admin_login.css         # Admin login styles
├── admin_homepage.js       # Admin dashboard/homepage
├── admin_homepage.css      # Admin dashboard styles
├── admin_setup.js          # Admin setup utility
└── README.md              # This file
```

## Notes

- The admin email is automatically granted admin privileges during signup
- Admin access is verified through Supabase `is_admin` flag
- Admin routes are protected and require authentication
