import { supabase } from './supabaseClient';

// Get submission by ID with problem details
export const getSubmissionWithProblem = async (submissionId) => {
  try {
    // Get submission details including submitted_code
    const { data: submissionData, error: submissionError } = await supabase
      .from('practice_submission')
      .select('*')
      .eq('submission_id', submissionId)
      .single();

    if (submissionError) throw submissionError;

    // Get problem details if problem_id exists
    let problemData = null;
    if (submissionData?.problem_id) {
      const { data: problem, error: problemError } = await supabase
        .from('practice_problem')
        .select('*')
        .eq('problem_id', submissionData.problem_id)
        .single();

      if (problemError) throw problemError;
      problemData = problem;
    }

    return {
      success: true,
      data: {
        submission: submissionData,
        problem: problemData
      }
    };
  } catch (error) {
    console.error('Error fetching submission with problem:', error);
    return {
      success: false,
      error: error.message,
      data: {
        submission: null,
        problem: null
      }
    };
  }
};

// Get submission by ID only
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

// Export submission data
export const exportSubmissionData = async (submissionId) => {
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
    console.error('Error exporting submission data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};
