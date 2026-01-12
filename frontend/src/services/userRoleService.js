import { supabase } from './supabaseClient';

export const getUserRole = async (firebaseUid) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'user'; // Default to user role on error
    }

    return data?.role || 'user';
  } catch (error) {
    console.error('Unexpected error fetching user role:', error);
    return 'user'; // Default to user role on error
  }
};
