import { supabase } from './supabaseClient';

// Get problem by ID (needed for submission view)
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

// Get submissions by problem ID
export const getSubmissionsByProblemId = async (problemId, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .eq('problem_id', problemId)
      .order('submitted_at', { ascending: false })
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
    console.error('Error fetching submissions by problem ID:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get submissions by user ID
export const getSubmissionsByUserId = async (userId, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .eq('problem_solver_id', userId)
      .order('submitted_at', { ascending: false })
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
    console.error('Error fetching submissions by user ID:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get submission by ID
export const getSubmissionById = async (submissionId) => {
  try {
    const { data, error } = await supabase
      .from('practice_submission')
      .select('*')
      .eq('submission_id', submissionId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching submission by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all submissions with pagination and filtering
export const getAllSubmissions = async (page = 1, limit = 10, filters = {}) => {
  try {
    let query = supabase
      .from('practice_submission')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.problem_id) {
      query = query.eq('problem_id', filters.problem_id);
    }

    if (filters.problem_solver_id) {
      query = query.eq('problem_solver_id', filters.problem_solver_id);
    }

    if (filters.language && filters.language !== 'All') {
      query = query.eq('language', filters.language);
    }

    if (filters.submission_status && filters.submission_status !== 'All') {
      query = query.eq('submission_status', filters.submission_status);
    }

    if (filters.country && filters.country !== 'All') {
      query = query.eq('country', filters.country);
    }

    // Apply date range filter
    if (filters.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    // Apply pagination and ordering
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('submitted_at', { ascending: false })
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
    console.error('Error fetching all submissions:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Create new submission
export const createSubmission = async (submissionData) => {
  try {
    const { data, error } = await supabase
      .from('practice_submission')
      .insert({
        problem_id: submissionData.problem_id,
        problem_solver_id: submissionData.problem_solver_id,
        problem_solver_name: submissionData.problem_solver_name,
        country: submissionData.country || null,
        language: submissionData.language,
        submission_status: submissionData.submission_status,
        points: parseInt(submissionData.points) || 0,
        rank: submissionData.rank || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Submission created successfully'
    };
  } catch (error) {
    console.error('Error creating submission:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update submission
export const updateSubmission = async (submissionId, submissionData) => {
  try {
    const { data, error } = await supabase
      .from('practice_submission')
      .update({
        submission_status: submissionData.submission_status,
        points: parseInt(submissionData.points) || 0,
        rank: submissionData.rank || null
      })
      .eq('submission_id', submissionId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Submission updated successfully'
    };
  } catch (error) {
    console.error('Error updating submission:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete submission
export const deleteSubmission = async (submissionId) => {
  try {
    const { error } = await supabase
      .from('practice_submission')
      .delete()
      .eq('submission_id', submissionId);

    if (error) throw error;

    return {
      success: true,
      message: 'Submission deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting submission:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update submission status
export const updateSubmissionStatus = async (submissionId, status) => {
  try {
    const validStatuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error('Invalid status. Must be one of: accepted, wrong_answer, time_limit_exceeded, memory_limit_exceeded, runtime_error, compilation_error');
    }

    const { data, error } = await supabase
      .from('practice_submission')
      .update({ 
        submission_status: status.toLowerCase()
      })
      .eq('submission_id', submissionId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: `Submission status updated to ${status} successfully`
    };
  } catch (error) {
    console.error('Error updating submission status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get submissions by language
export const getSubmissionsByLanguage = async (language, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .eq('language', language)
      .order('submitted_at', { ascending: false })
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
    console.error('Error getting submissions by language:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get submissions by status
export const getSubmissionsByStatus = async (status, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .eq('submission_status', status)
      .order('submitted_at', { ascending: false })
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
    console.error('Error getting submissions by status:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get submissions by country
export const getSubmissionsByCountry = async (country, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .eq('country', country)
      .order('submitted_at', { ascending: false })
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
    console.error('Error getting submissions by country:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Search submissions
export const searchSubmissions = async (searchTerm, page = 1, limit = 10) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('practice_submission')
      .select('*', { count: 'exact' })
      .or(
        `problem_solver_name.ilike.%${searchTerm}%,language.ilike.%${searchTerm}%,submission_status.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`
      )
      .order('submitted_at', { ascending: false })
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
    console.error('Error searching submissions:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      total: 0
    };
  }
};

// Get submission statistics
export const getSubmissionStatistics = async (filters = {}) => {
  try {
    let query = supabase
      .from('practice_submission')
      .select('submission_status, language, country, points, rank');

    // Apply filters
    if (filters.problem_id) {
      query = query.eq('problem_id', filters.problem_id);
    }

    if (filters.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      totalSubmissions: data?.length || 0,
      byStatus: {
        accepted: 0,
        wrong_answer: 0,
        time_limit_exceeded: 0,
        memory_limit_exceeded: 0,
        runtime_error: 0,
        compilation_error: 0
      },
      byLanguage: {},
      byCountry: {},
      totalPoints: 0,
      averagePoints: 0,
      averageRank: 0
    };

    let totalPoints = 0;
    let totalRank = 0;
    let rankCount = 0;

    data?.forEach(item => {
      // Count by status
      if (stats.byStatus.hasOwnProperty(item.submission_status)) {
        stats.byStatus[item.submission_status]++;
      }

      // Count by language
      if (!stats.byLanguage[item.language]) {
        stats.byLanguage[item.language] = 0;
      }
      stats.byLanguage[item.language]++;

      // Count by country
      if (item.country) {
        if (!stats.byCountry[item.country]) {
          stats.byCountry[item.country] = 0;
        }
        stats.byCountry[item.country]++;
      }

      // Calculate points and rank
      totalPoints += item.points || 0;
      if (item.rank) {
        totalRank += item.rank;
        rankCount++;
      }
    });

    stats.totalPoints = totalPoints;
    stats.averagePoints = data?.length > 0 ? (totalPoints / data.length).toFixed(1) : 0;
    stats.averageRank = rankCount > 0 ? (totalRank / rankCount).toFixed(1) : 0;

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting submission statistics:', error);
    return {
      success: false,
      error: error.message,
      data: {
        totalSubmissions: 0,
        byStatus: {},
        byLanguage: {},
        byCountry: {},
        totalPoints: 0,
        averagePoints: 0,
        averageRank: 0
      }
    };
  }
};

// Bulk update submissions status
export const bulkUpdateSubmissionsStatus = async (submissionIds, status) => {
  try {
    const validStatuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error('Invalid status. Must be one of: accepted, wrong_answer, time_limit_exceeded, memory_limit_exceeded, runtime_error, compilation_error');
    }

    const { data, error } = await supabase
      .from('practice_submission')
      .update({ 
        submission_status: status.toLowerCase()
      })
      .in('submission_id', submissionIds)
      .select();

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      message: `${data?.length || 0} submissions status updated to ${status} successfully`
    };
  } catch (error) {
    console.error('Error bulk updating submissions status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Bulk delete submissions
export const bulkDeleteSubmissions = async (submissionIds) => {
  try {
    const { error } = await supabase
      .from('practice_submission')
      .delete()
      .in('submission_id', submissionIds);

    if (error) throw error;

    return {
      success: true,
      message: `${submissionIds.length} submissions deleted successfully`
    };
  } catch (error) {
    console.error('Error bulk deleting submissions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export submissions data
export const exportSubmissionsData = async (filters = {}) => {
  try {
    let query = supabase
      .from('practice_submission')
      .select('*');

    // Apply filters
    if (filters.problem_id) {
      query = query.eq('problem_id', filters.problem_id);
    }

    if (filters.problem_solver_id) {
      query = query.eq('problem_solver_id', filters.problem_solver_id);
    }

    if (filters.language && filters.language !== 'All') {
      query = query.eq('language', filters.language);
    }

    if (filters.submission_status && filters.submission_status !== 'All') {
      query = query.eq('submission_status', filters.submission_status);
    }

    if (filters.country && filters.country !== 'All') {
      query = query.eq('country', filters.country);
    }

    // Apply date range filter
    if (filters.date_from) {
      query = query.gte('submitted_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('submitted_at', filters.date_to);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error exporting submissions data:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};
