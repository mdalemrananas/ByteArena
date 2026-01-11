import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../services/authService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './admin_login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email matches admin email
      if (email.toLowerCase() !== 'lamiakamalnusny@gmail.com') {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      const result = await signInWithEmail(email, password);

      if (result.success) {
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        // Verify and set admin status in Supabase
        const { supabase } = await import('../services/supabaseClient');
        
        // Check if user exists in Supabase
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // User doesn't exist in Supabase, create with admin privileges
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              firebase_uid: currentUser.uid,
              email: email,
              display_name: currentUser.displayName || 'Admin',
              is_admin: true,
              role: 'admin',
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              auth_provider: 'email'
            });

          if (insertError) {
            console.error('Error creating admin in Supabase:', insertError);
            // Still allow login, but log the error
          }
        } else if (existingUser) {
          // Update user to ensure admin status
          const { error: updateError } = await supabase
            .from('users')
            .update({
              is_admin: true,
              role: 'admin',
              firebase_uid: currentUser.uid,
              last_login: new Date().toISOString()
            })
            .eq('email', email);

          if (updateError) {
            console.error('Error updating admin status:', updateError);
          }
        }

        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>Admin Panel</h1>
          <p>Byte Arena Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <div className="admin-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Secure admin access only</p>
          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
