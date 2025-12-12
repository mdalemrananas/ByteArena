import { supabase } from './supabaseClient';

export const getUserByFirebaseUid = async (firebaseUid) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (firebaseUid, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteUserProfile = async (firebaseUid) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('firebase_uid', firebaseUid);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
