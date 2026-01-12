import { supabase } from './supabaseClient';

// Practice Submissions Data Service
export const practiceSubmissionsDataService = {
  // Helper function to validate UUID
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Get submissions data with optional problem filtering
  async getSubmissions(problemId = null, userId = null) {
    try {
      let query = supabase
        .from('practice_submission')
        .select(`
          *,
          practice_problem (
            problem_title,
            difficulty,
            problem_language
          )
        `)
        .order('submitted_at', { ascending: false });

      // Filter by problemId if provided
      if (problemId) {
        query = query.eq('problem_id', problemId);
      }

      // Filter by userId only if it's a valid UUID
      if (userId && this.isValidUUID(userId)) {
        query = query.eq('problem_solver_id', userId);
      } else if (userId) {
        console.warn('Invalid UUID format for userId, skipping user filter:', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching submissions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching submissions:', error);
      return { success: false, error: 'Failed to fetch submissions data' };
    }
  },

  // Get submissions with pagination
  async getSubmissionsPaginated(page = 1, limit = 50, problemId = null, userId = null) {
    try {
      let query = supabase
        .from('practice_submission')
        .select(`
          *,
          practice_problem (
            problem_title,
            difficulty,
            problem_language
          )
        `, { count: 'exact' })
        .order('submitted_at', { ascending: false });

      // Filter by problemId if provided
      if (problemId) {
        query = query.eq('problem_id', problemId);
      }

      // Filter by userId only if it's a valid UUID
      if (userId && this.isValidUUID(userId)) {
        query = query.eq('problem_solver_id', userId);
      } else if (userId) {
        console.warn('Invalid UUID format for userId, skipping user filter:', userId);
      }

      // Calculate range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching paginated submissions:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Unexpected error fetching paginated submissions:', error);
      return { success: false, error: 'Failed to fetch submissions data' };
    }
  },

  // Get submission by ID
  async getSubmissionById(submissionId) {
    try {
      const { data, error } = await supabase
        .from('practice_submission')
        .select(`
          *,
          practice_problem (
            problem_title,
            difficulty,
            problem_language,
            problem_description,
            sample_input,
            sample_output
          )
        `)
        .eq('submission_id', submissionId)
        .single();

      if (error) {
        console.error('Error fetching submission:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching submission:', error);
      return { success: false, error: 'Failed to fetch submission' };
    }
  },

  // Get user's submissions statistics
  async getUserSubmissionsStats(userId) {
    try {
      let query = supabase
        .from('practice_submission')
        .select('submission_status, language, points, submitted_at');

      // Filter by userId only if it's a valid UUID
      if (userId && this.isValidUUID(userId)) {
        query = query.eq('problem_solver_id', userId);
      } else if (userId) {
        console.warn('Invalid UUID format for userId, returning empty stats:', userId);
        return { 
          success: true, 
          data: {
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            totalPoints: 0,
            languageDistribution: {},
            statusDistribution: {
              Accepted: 0,
              'Wrong Answer': 0,
              'Time Limit Exceeded': 0,
              'Runtime Error': 0,
              'Compilation Error': 0,
              Other: 0
            }
          }
        };
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user submissions stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        totalSubmissions: data?.length || 0,
        acceptedSubmissions: data?.filter(s => s.submission_status === 'Accepted').length || 0,
        totalPoints: data?.reduce((sum, s) => sum + (s.points || 0), 0) || 0,
        languageDistribution: {},
        statusDistribution: {
          Accepted: 0,
          'Wrong Answer': 0,
          'Time Limit Exceeded': 0,
          'Runtime Error': 0,
          'Compilation Error': 0,
          Other: 0
        }
      };

      // Calculate distributions
      data?.forEach(submission => {
        // Language distribution
        const lang = submission.language || 'Unknown';
        stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1;

        // Status distribution
        const status = submission.submission_status || 'Other';
        if (stats.statusDistribution.hasOwnProperty(status)) {
          stats.statusDistribution[status]++;
        } else {
          stats.statusDistribution.Other++;
        }
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error getting user submissions stats:', error);
      return { success: false, error: 'Failed to get submissions statistics' };
    }
  },

  // Get problem submissions statistics
  async getProblemSubmissionsStats(problemId) {
    try {
      const { data, error } = await supabase
        .from('practice_submission')
        .select('submission_status, language, points, problem_solver_id')
        .eq('problem_id', problemId);

      if (error) {
        console.error('Error fetching problem submissions stats:', error);
        return { success: false, error: error.message };
      }

      const uniqueUsers = new Set();
      const stats = {
        totalSubmissions: data?.length || 0,
        uniqueSubmitters: 0,
        acceptedSubmissions: data?.filter(s => s.submission_status === 'Accepted').length || 0,
        averagePoints: 0,
        languageDistribution: {},
        statusDistribution: {
          Accepted: 0,
          'Wrong Answer': 0,
          'Time Limit Exceeded': 0,
          'Runtime Error': 0,
          'Compilation Error': 0,
          Other: 0
        }
      };

      // Calculate statistics
      let totalPoints = 0;
      data?.forEach(submission => {
        uniqueUsers.add(submission.problem_solver_id);
        totalPoints += submission.points || 0;

        // Language distribution
        const lang = submission.language || 'Unknown';
        stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1;

        // Status distribution
        const status = submission.submission_status || 'Other';
        if (stats.statusDistribution.hasOwnProperty(status)) {
          stats.statusDistribution[status]++;
        } else {
          stats.statusDistribution.Other++;
        }
      });

      stats.uniqueSubmitters = uniqueUsers.size;
      stats.averagePoints = data?.length > 0 ? totalPoints / data.length : 0;

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error getting problem submissions stats:', error);
      return { success: false, error: 'Failed to get problem submissions statistics' };
    }
  }
};
