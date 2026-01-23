import { supabase } from './supabaseClient';

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

// Update problem details
export const updateProblem = async (problemId, problemData) => {
  try {
    const { data, error } = await supabase
      .from('practice_problem')
      .update({
        problem_title: problemData.problem_title,
        problemsetter_name: problemData.problemsetter_name,
        difficulty: problemData.difficulty,
        problem_language: problemData.problem_language,
        problem_description: problemData.problem_description,
        problem_input: problemData.problem_input,
        problem_output: problemData.problem_output,
        sample_input: problemData.sample_input,
        sample_output: problemData.sample_output,
        problem_rating: parseFloat(problemData.problem_rating),
        points: parseInt(problemData.points) || 0,
        admin_status: problemData.admin_status?.toLowerCase() || 'pending'
      })
      .eq('problem_id', problemId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Problem updated successfully'
    };
  } catch (error) {
    console.error('Error updating problem:', error);
    return {
      success: false,
      error: error.message
    };
  }
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

// Update problem status (admin_status)
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
      message: `Problem status updated to ${status} successfully`
    };
  } catch (error) {
    console.error('Error updating problem status:', error);
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
      .insert({
        problem_title: problemData.problem_title,
        problemsetter_name: problemData.problemsetter_name,
        difficulty: problemData.difficulty,
        problem_language: problemData.problem_language,
        problem_description: problemData.problem_description,
        problem_input: problemData.problem_input,
        problem_output: problemData.problem_output,
        sample_input: problemData.sample_input,
        sample_output: problemData.sample_output,
        problem_rating: parseFloat(problemData.problem_rating),
        points: parseInt(problemData.points) || 0,
        admin_status: problemData.admin_status?.toLowerCase() || 'pending'
      })
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

// Get all problems (for admin view)
export const getAllProblems = async (page = 1, limit = 10, filters = {}) => {
  try {
    let query = supabase
      .from('practice_problem')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.difficulty && filters.difficulty !== 'All') {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.language && filters.language !== 'All') {
      query = query.eq('problem_language', filters.language);
    }

    if (filters.status && filters.status !== 'All') {
      query = query.eq('admin_status', filters.status.toLowerCase());
    }

    // Apply search
    if (filters.search) {
      query = query.or(
        `problem_title.ilike.%${filters.search}%,problemsetter_name.ilike.%${filters.search}%,problem_description.ilike.%${filters.search}%`
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

// Get problems by author
export const getProblemsByAuthor = async (authorName, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_problem')
      .select('*', { count: 'exact' })
      .eq('problemsetter_name', authorName)
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
    console.error('Error getting problems by author:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get problems by difficulty
export const getProblemsByDifficulty = async (difficulty, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_problem')
      .select('*', { count: 'exact' })
      .eq('difficulty', difficulty)
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
    console.error('Error getting problems by difficulty:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get problems by language
export const getProblemsByLanguage = async (language, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_problem')
      .select('*', { count: 'exact' })
      .eq('problem_language', language)
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
    console.error('Error getting problems by language:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
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

// Get problem statistics
export const getProblemStatistics = async () => {
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
    console.error('Error getting problem statistics:', error);
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

// Duplicate problem
export const duplicateProblem = async (problemId, newTitle) => {
  try {
    // First get the original problem
    const originalResult = await getProblemById(problemId);
    if (!originalResult.success) {
      throw new Error('Original problem not found');
    }

    const original = originalResult.data;

    // Create a new problem with the same data but new title
    const { data, error } = await supabase
      .from('practice_problem')
      .insert({
        problem_title: newTitle || `${original.problem_title} (Copy)`,
        problemsetter_name: original.problemsetter_name,
        difficulty: original.difficulty,
        problem_language: original.problem_language,
        problem_description: original.problem_description,
        problem_input: original.problem_input,
        problem_output: original.problem_output,
        sample_input: original.sample_input,
        sample_output: original.sample_output,
        problem_rating: original.problem_rating,
        points: original.points,
        admin_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Problem duplicated successfully'
    };
  } catch (error) {
    console.error('Error duplicating problem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export problem data
export const exportProblemData = async (problemId) => {
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
    console.error('Error exporting problem data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
