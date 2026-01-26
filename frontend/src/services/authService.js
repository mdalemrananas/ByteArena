import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase';
import { supabase } from './supabaseClient';
import { handleAuthError } from '../utils/authErrorHandler';

export const signInWithEmail = async (email, password) => {
  try {
    // First, try to sign in with Firebase
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login in Supabase
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('firebase_uid', result.user.uid);
    
    if (supabaseError) {
      console.error('Error updating last login in Supabase:', supabaseError);
    }
    
    return { success: true, user: result.user };
  } catch (error) {
    // Check if the error is because user doesn't exist in Firebase
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Check if user exists in Supabase (created by admin)
      const { data: supabaseUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!fetchError && supabaseUser) {
        // User exists in Supabase but not in Firebase, create Firebase account
        try {
          console.log('Creating Firebase account for existing Supabase user:', email);
          const createResult = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update the Supabase record with the real Firebase UID
          await supabase
            .from('users')
            .update({ 
              firebase_uid: createResult.user.uid,
              last_login: new Date().toISOString()
            })
            .eq('id', supabaseUser.id);
          
          // Update Firebase profile with display name
          if (supabaseUser.display_name) {
            await updateProfile(createResult.user, { displayName: supabaseUser.display_name });
          }
          
          return { success: true, user: createResult.user };
        } catch (createError) {
          console.error('Error creating Firebase account:', createError);
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
      }
    }
    
    return { success: false, error: handleAuthError(error) };
  }
};

export const signUpWithEmail = async (email, password, name) => {
  try {
    console.log('Starting sign up process for:', email);
    
    // Check if email already exists in Firebase
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      return { success: false, error: 'Email already registered. Please sign in instead.' };
    }

    console.log('Creating user in Firebase...');
    // Create user in Firebase
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    console.log('User created successfully, updating profile...');
    // Update user profile with display name
    await updateProfile(result.user, { displayName: name });
    
    console.log('Saving user data to Supabase...');
    // Save user data to Supabase
    const { error: supabaseError } = await supabase
      .from('users')
      .insert({
        firebase_uid: result.user.uid,
        email: result.user.email,
        display_name: name,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });
    
    if (supabaseError) {
      console.error('Error saving to Supabase:', supabaseError);
      // Don't fail the signup if Supabase fails, but log the error
    }
    
    console.log('Sign up completed successfully');
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Sign up error in authService:', error);
    return { success: false, error: handleAuthError(error) };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists in Supabase, if not create
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', result.user.uid)
      .single();
    
    if (!existingUser) {
      // Create new user in Supabase
      const { error: supabaseError } = await supabase
        .from('users')
        .insert({
          firebase_uid: result.user.uid,
          email: result.user.email,
          display_name: result.user.displayName || result.user.email.split('@')[0],
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          auth_provider: 'google'
        });
      
      if (supabaseError) {
        console.error('Error saving Google user to Supabase:', supabaseError);
      }
    } else {
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('firebase_uid', result.user.uid);
    }
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    
    // Check if user exists in Supabase, if not create
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', result.user.uid)
      .single();
    
    if (!existingUser) {
      // Create new user in Supabase
      const { error: supabaseError } = await supabase
        .from('users')
        .insert({
          firebase_uid: result.user.uid,
          email: result.user.email,
          display_name: result.user.displayName || result.user.email?.split('@')[0] || 'GitHub User',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          auth_provider: 'github'
        });
      
      if (supabaseError) {
        console.error('Error saving GitHub user to Supabase:', supabaseError);
      }
    } else {
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('firebase_uid', result.user.uid);
    }
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: handleAuthError(error) };
  }
};
