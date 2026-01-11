/**
 * Admin Setup Utility
 * This file contains functions to set up the admin user
 * You can import and call these functions to initialize the admin account
 */

import { ensureAdminExists, initializeAdminUser } from '../services/adminService';

/**
 * Setup admin user - call this function to initialize admin account
 * This can be called from browser console or a setup page
 */
export const setupAdmin = async () => {
  console.log('Starting admin setup...');
  
  try {
    // First, ensure admin entry exists in Supabase
    const ensureResult = await ensureAdminExists();
    console.log('Ensure admin result:', ensureResult);

    // Then try to initialize in Firebase (if not already exists)
    const initResult = await initializeAdminUser();
    console.log('Initialize admin result:', initResult);

    if (ensureResult.success || initResult.success) {
      console.log('✅ Admin setup completed successfully!');
      console.log('Admin credentials:');
      console.log('Email: lamiakamalnusny@gmail.com');
      console.log('Password: Lamia@1234.');
      console.log('You can now log in at /admin/login');
      return { success: true, message: 'Admin setup completed' };
    } else {
      console.error('❌ Admin setup failed');
      return { success: false, error: 'Setup failed' };
    }
  } catch (error) {
    console.error('Error during admin setup:', error);
    return { success: false, error: error.message };
  }
};

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  window.setupAdmin = setupAdmin;
  console.log('💡 Admin setup function available. Call window.setupAdmin() to initialize admin account.');
}

export default setupAdmin;
