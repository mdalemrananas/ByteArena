import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { supabase } from './supabaseClient';

/**
 * Initialize admin user in Firebase and Supabase
 * This should be called once to set up the admin account
 */
export const initializeAdminUser = async () => {
  try {
    const adminEmail = 'lamiakamalnusny@gmail.com';
    const adminPassword = 'Lamia@1234.';
    const adminName = 'Admin User';

    console.log('Initializing admin user...');

    // Check if user already exists in Firebase
    try {
      // Try to create the user
      const result = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: adminName
      });

      console.log('Admin user created in Firebase:', result.user.uid);

      // Save to Supabase
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // User doesn't exist in Supabase, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            firebase_uid: result.user.uid,
            email: adminEmail,
            display_name: adminName,
            is_admin: true,
            role: 'admin',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            auth_provider: 'email'
          });

        if (insertError) {
          console.error('Error creating admin in Supabase:', insertError);
          throw insertError;
        }

        console.log('Admin user created in Supabase successfully');
      } else if (existingUser) {
        // User exists, update to admin
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_admin: true,
            role: 'admin'
          })
          .eq('email', adminEmail);

        if (updateError) {
          console.error('Error updating admin in Supabase:', updateError);
          throw updateError;
        }

        console.log('Admin user updated in Supabase successfully');
      }

      return { success: true, user: result.user };
    } catch (error) {
      // User might already exist
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists in Firebase. Updating Supabase...');
        
        // Get current user
        const { data: userData } = await supabase
          .from('users')
          .select('firebase_uid')
          .eq('email', adminEmail)
          .single();

        // Update or create in Supabase
        if (userData) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              is_admin: true,
              role: 'admin'
            })
            .eq('email', adminEmail);

          if (updateError) {
            console.error('Error updating admin in Supabase:', updateError);
            throw updateError;
          }
        } else {
          // Create in Supabase without Firebase UID (we'll link it later)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              email: adminEmail,
              display_name: adminName,
              is_admin: true,
              role: 'admin',
              created_at: new Date().toISOString(),
              auth_provider: 'email'
            });

          if (insertError) {
            console.error('Error creating admin in Supabase:', insertError);
            throw insertError;
          }
        }

        return { success: true, message: 'Admin user already exists, updated Supabase' };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a user is an admin
 */
export const isAdminUser = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin === true || data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Ensure admin user exists (for setup)
 * This function can be called manually to set up the admin account
 */
export const ensureAdminExists = async () => {
  try {
    const adminEmail = 'lamiakamalnusny@gmail.com';
    
    // Check if admin exists in Supabase
    const { data: existingAdmin, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (error && error.code === 'PGRST116') {
      // Admin doesn't exist, we need to create it
      // Since we can't create Firebase users from client side without credentials,
      // we'll create a placeholder in Supabase that will be linked when they sign up
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          display_name: 'Admin User',
          is_admin: true,
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating admin placeholder:', insertError);
        return { success: false, error: insertError.message };
      }

      return { 
        success: true, 
        message: 'Admin placeholder created. Please sign up with the admin email to complete setup.' 
      };
    } else if (existingAdmin) {
      // Ensure admin flag is set
      if (!existingAdmin.is_admin) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_admin: true,
            role: 'admin'
          })
          .eq('email', adminEmail);

        if (updateError) {
          console.error('Error updating admin status:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      return { success: true, message: 'Admin user already exists and is configured.' };
    }

    return { success: true, message: 'Admin user exists.' };
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
    return { success: false, error: error.message };
  }
};
