# Supabase Database Setup Instructions

## 1. Create the Users Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create users table for storing user data from Firebase authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email', -- 'email', 'google', 'github'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}', -- User preferences as JSON
  metadata JSONB DEFAULT '{}' -- Additional metadata as JSON
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (firebase_uid = auth.uid());

-- Create policy for users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (firebase_uid = auth.uid());

-- Create policy for inserting new users (any authenticated user)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (firebase_uid = auth.uid());
```

## 2. Authentication Flow

### Email/Password Signup
1. Firebase validates email format and creates user
2. User data is saved to Supabase users table
3. User is redirected to Dashboard

### Email/Password Login
1. Firebase authenticates user credentials
2. Last login timestamp is updated in Supabase
3. User is redirected to Dashboard

### Social Login (Google/GitHub)
1. Firebase authenticates with provider
2. Check if user exists in Supabase
3. If not exists, create new user record
4. Update last login timestamp
5. Redirect to Dashboard

## 3. Files Modified/Created

- `frontend/src/services/supabaseClient.js` - Supabase client configuration
- `frontend/src/services/authService.js` - Updated with Supabase integration
- `frontend/src/services/userService.js` - User profile management functions
- `frontend/src/User_panel/Sign_in.js` - Updated to redirect to Dashboard after auth
- `database_schema.sql` - Database schema file

## 4. Key Features

- **Email Validation**: Firebase checks if email is valid/exists during signup
- **Duplicate Prevention**: Firebase prevents duplicate email registrations
- **Data Synchronization**: User data is automatically saved to Supabase
- **Social Auth Support**: Google and GitHub authentication with automatic user creation
- **Login Tracking**: Last login timestamps are maintained
- **Error Handling**: Graceful error handling with user-friendly messages

## 5. Environment Variables

The Supabase API key is hardcoded in `supabaseClient.js`. For production, consider:

1. Create a `.env` file in the frontend root
2. Add: `VITE_SUPABASE_KEY=your_supabase_key`
3. Update supabaseClient.js to use: `const supabaseKey = import.meta.env.VITE_SUPABASE_KEY`

## 6. Testing

Test the authentication flow:
1. Try signing up with a new email
2. Verify user appears in Supabase users table
3. Try signing in with the same credentials
4. Test social login options
5. Verify redirect to Dashboard works correctly
