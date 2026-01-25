import { supabase } from './supabaseClient';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Get all users with pagination and filtering
export const getAllUsers = async (page = 1, limit = 10, searchTerm = '', roleFilter = 'all') => {
  try {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply role filter if specified
    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    
    return {
      success: true,
      data: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    // Create user record in Supabase
    const newUser = {
      firebase_uid: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      username: userData.username,
      display_name: userData.display_name || userData.username,
      role: userData.role || 'user',
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      is_verified: userData.is_verified || false,
      rating: userData.rating || 1000,
      wins: userData.wins || 0,
      losses: userData.losses || 0,
      matches_played: userData.matches_played || 0,
      skills: userData.skills || [],
      preferences: userData.preferences || {},
      metadata: userData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) throw error;
    
    return { 
      success: true, 
      data,
      message: 'User created successfully!'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.firebase_uid;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      totalUsers: data.length,
      activeUsers: data.filter(user => user.is_active).length,
      inactiveUsers: data.filter(user => !user.is_active).length,
      adminUsers: data.filter(user => user.role === 'admin').length,
      moderatorUsers: data.filter(user => user.role === 'moderator').length,
      regularUsers: data.filter(user => user.role === 'user').length,
      newUsersThisMonth: data.filter(user => {
        const createdAt = new Date(user.created_at);
        const thisMonth = new Date();
        return createdAt.getMonth() === thisMonth.getMonth() && 
               createdAt.getFullYear() === thisMonth.getFullYear();
      }).length
    };

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Search users by multiple criteria
export const searchUsers = async (searchTerm, filters = {}) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search term
    if (searchTerm) {
      query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
    }

    // Apply filters
    if (filters.role && filters.role !== 'all') {
      query = query.eq('role', filters.role);
    }
    
    if (filters.status === 'active') {
      query = query.eq('is_active', true);
    } else if (filters.status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (filters.verified === true) {
      query = query.eq('is_verified', true);
    } else if (filters.verified === false) {
      query = query.eq('is_verified', false);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    const { data, error } = await query.limit(50); // Limit search results

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Bulk operations
export const bulkUpdateUsers = async (userIds, updates) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .in('id', userIds)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bulkDeleteUsers = async (userIds) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .in('id', userIds);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get users by rating range
export const getUsersByRating = async (minRating = 0, maxRating = 3000, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .gte('rating', minRating)
      .lte('rating', maxRating)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export users data (for admin reports)
export const exportUsersData = async (format = 'json') => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, display_name, role, rating, wins, losses, matches_played, is_active, is_verified, country, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');
      
      return { success: true, data: csvContent, format: 'csv' };
    }

    return { success: true, data, format: 'json' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
