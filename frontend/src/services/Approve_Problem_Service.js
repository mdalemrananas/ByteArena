import { supabase } from './supabaseClient';

// Get all practice problems with pagination and filtering
export const getAllProblems = async (page = 1, limit = 10, search = '', filters = {}) => {
  try {
    let query = supabase
      .from('practice_problem')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.difficulty && filters.difficulty !== 'All Levels') {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.language && filters.language !== 'All Categories') {
      query = query.eq('problem_language', filters.language);
    }

    if (filters.status && filters.status !== 'All') {
      query = query.eq('admin_status', filters.status.toLowerCase());
    }

    // Apply search
    if (search) {
      query = query.or(
        `problem_title.ilike.%${search}%,problemsetter_name.ilike.%${search}%,problem_description.ilike.%${search}%`
      );
    }

    // Apply pagination and ordering
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching problems:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get problem by ID
export const getProblemById = async (problemId) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('*')
      .eq('problem_id', problemId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching problem by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create new problem
export const createProblem = async (problemData) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .insert([
        {
          problem_title: problemData.problem_title,
          problemsetter_name: problemData.problemsetter_name,
          difficulty: problemData.difficulty,
          problem_language: problemData.problem_language,
          problem_description: problemData.problem_description,
          problem_input: problemData.problem_input,
          problem_output: problemData.problem_output,
          sample_input: problemData.sample_input,
          sample_output: problemData.sample_output,
          points: problemData.points || 0,
          admin_status: 'pending',
          status: 'unsolved'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Problem created successfully'
    };
  } catch (error) {
    console.error('Error creating problem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update problem admin status (approve/reject)
export const updateProblemStatus = async (problemId, status) => {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error('Invalid status. Must be: pending, approved, or rejected');
    }

    const { data, error } = await supabase
      .from('practice_problem')
      .update({ 
        admin_status: status.toLowerCase()
      })
      .eq('problem_id', problemId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: `Problem ${status} successfully`
    };
  } catch (error) {
    console.error('Error updating problem status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Approve problem
export const approveProblem = async (problemId) => {
  return updateProblemStatus(problemId, 'approved');
};

// Reject problem
export const rejectProblem = async (problemId) => {
  return updateProblemStatus(problemId, 'rejected');
};

// Delete problem
export const deleteProblem = async (problemId) => {
  try {
    const { error } = await supabase
      .from('practice_problem')
      .delete()
      .eq('problem_id', problemId);

    if (error) throw error;

    return {
      success: true,
      message: 'Problem deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting problem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get problems count by status
export const getProblemsCountByStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('admin_status')
      .order('admin_status');

    if (error) throw error;

    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: data?.length || 0
    };

    data?.forEach(item => {
      if (counts.hasOwnProperty(item.admin_status)) {
        counts[item.admin_status]++;
      }
    });

    return {
      success: true,
      data: counts
    };
  } catch (error) {
    console.error('Error getting problems count by status:', error);
    return {
      success: false,
      error: error.message,
      data: { pending: 0, approved: 0, rejected: 0, total: 0 }
    };
  }
};

// Get problems by difficulty
export const getProblemsByDifficulty = async (difficulty) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('*')
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error getting problems by difficulty:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get problems by language
export const getProblemsByLanguage = async (language) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('*')
      .eq('problem_language', language)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error getting problems by language:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Search problems
export const searchProblems = async (searchTerm, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_problem')
      .select('*', { count: 'exact' })
      .or(
        `problem_title.ilike.%${searchTerm}%,problemsetter_name.ilike.%${searchTerm}%,problem_description.ilike.%${searchTerm}%,problem_language.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error searching problems:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get recent problems (last 7 days)
export const getRecentProblems = async (limit = 10) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('practice_problem')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error getting recent problems:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get problems statistics
export const getProblemsStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('difficulty, problem_language, admin_status, problem_rating, points');

    if (error) throw error;

    const stats = {
      totalProblems: data?.length || 0,
      byDifficulty: {
        Easy: 0,
        Medium: 0,
        Hard: 0
      },
      byLanguage: {},
      byStatus: {
        pending: 0,
        approved: 0,
        rejected: 0
      },
      averageRating: 0,
      totalPoints: 0
    };

    let totalRating = 0;
    let ratingCount = 0;

    data?.forEach(item => {
      // Count by difficulty
      if (stats.byDifficulty.hasOwnProperty(item.difficulty)) {
        stats.byDifficulty[item.difficulty]++;
      }

      // Count by language
      if (!stats.byLanguage[item.problem_language]) {
        stats.byLanguage[item.problem_language] = 0;
      }
      stats.byLanguage[item.problem_language]++;

      // Count by status
      if (stats.byStatus.hasOwnProperty(item.admin_status)) {
        stats.byStatus[item.admin_status]++;
      }

      // Calculate rating and points
      if (item.problem_rating) {
        totalRating += parseFloat(item.problem_rating);
        ratingCount++;
      }
      stats.totalPoints += item.points || 0;
    });

    stats.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting problems statistics:', error);
    return {
      success: false,
      error: error.message,
      data: {
        totalProblems: 0,
        byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
        byLanguage: {},
        byStatus: { pending: 0, approved: 0, rejected: 0 },
        averageRating: 0,
        totalPoints: 0
      }
    };
  }
};

// Bulk update problems status
export const bulkUpdateProblemsStatus = async (problemIds, status) => {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error('Invalid status. Must be: pending, approved, or rejected');
    }

    const { data, error } = await supabase
      .from('practice_problem')
      .update({ 
        admin_status: status.toLowerCase()
      })
      .in('problem_id', problemIds)
      .select();

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      message: `${data?.length || 0} problems ${status} successfully`
    };
  } catch (error) {
    console.error('Error bulk updating problems status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Bulk delete problems
export const bulkDeleteProblems = async (problemIds) => {
  try {
    const { error } = await supabase
      .from('practice_problem')
      .delete()
      .in('problem_id', problemIds);

    if (error) throw error;

    return {
      success: true,
      message: `${problemIds.length} problems deleted successfully`
    };
  } catch (error) {
    console.error('Error bulk deleting problems:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get problems by rating range
export const getProblemsByRatingRange = async (minRating = 0, maxRating = 5) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .select('*')
      .gte('problem_rating', minRating)
      .lte('problem_rating', maxRating)
      .order('problem_rating', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error getting problems by rating range:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Export problems data (for admin reports)
export const exportProblemsData = async (filters = {}) => {
  try {
    let query = supabase
      .from('practice_problem')
      .select('problem_id, problem_title, problemsetter_name, difficulty, problem_language, admin_status, problem_rating, points, created_at');

    // Apply filters
    if (filters.difficulty && filters.difficulty !== 'All Levels') {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.language && filters.language !== 'All Categories') {
      query = query.eq('problem_language', filters.language);
    }

    if (filters.status && filters.status !== 'All') {
      query = query.eq('admin_status', filters.status.toLowerCase());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Format data for export
    const exportData = data?.map(item => ({
      ID: item.problem_id,
      Title: item.problem_title,
      Author: item.problemsetter_name,
      Difficulty: item.difficulty,
      Language: item.problem_language,
      Status: item.admin_status,
      Rating: item.problem_rating || 0,
      Points: item.points || 0,
      Created: new Date(item.created_at).toLocaleDateString()
    })) || [];

    return {
      success: true,
      data: exportData
    };
  } catch (error) {
    console.error('Error exporting problems data:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};
