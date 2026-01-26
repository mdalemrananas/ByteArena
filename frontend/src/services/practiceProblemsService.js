import { supabase } from './supabaseClient';

// Practice Problems Service
export const practiceProblemsService = {
  // Fetch all problems with optional filters
  async getProblems(filters = {}, page = 1, limit = 5, userId = null) {
    try {
      let query = supabase
        .from('practice_problem')
        .select('*')
        .eq('admin_status', 'approved')
        .order('created_at', { ascending: false });

      // Calculate range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Apply filters
      if (filters.difficulty && filters.difficulty !== 'All Levels') {
        // Handle both cases for difficulty (Easy/EASY, Medium/MEDIUM, Hard/HARD)
        if (filters.difficulty === 'Easy') {
          query = query.or('difficulty.eq.Easy,difficulty.eq.EASY');
        } else if (filters.difficulty === 'Medium') {
          query = query.or('difficulty.eq.Medium,difficulty.eq.MEDIUM');
        } else if (filters.difficulty === 'Hard') {
          query = query.or('difficulty.eq.Hard,difficulty.eq.HARD');
        }
      }

      if (filters.language && filters.language !== 'All Categories') {
        query = query.eq('problem_language', filters.language);
      }

      if (filters.search) {
        query = query.or(`problem_title.ilike.%${filters.search}%,problemsetter_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // If status filter is applied and userId is provided, filter the results
      let filteredData = data;
      if (filters.status && filters.status !== 'All' && userId) {
        // Get user's submissions to determine solved status
        const { data: submissions, error: submissionError } = await supabase
          .from('practice_submission')
          .select('problem_id')
          .eq('problem_solver_id', userId)
          .eq('submission_status', 'Accepted');

        if (submissionError) {
          throw submissionError;
        }

        const solvedProblemIds = new Set(submissions.map(sub => sub.problem_id));

        if (filters.status === 'Solved') {
          filteredData = data.filter(problem => solvedProblemIds.has(problem.problem_id));
        } else if (filters.status === 'Unsolved') {
          filteredData = data.filter(problem => !solvedProblemIds.has(problem.problem_id));
        }
      }

      return { success: true, data: filteredData };
    } catch (error) {
      console.error('Error fetching practice problems:', error);
      return { success: false, error: error.message };
    }
  },

  // Get total count of problems (for pagination)
  async getProblemsCount(filters = {}) {
    try {
      let query = supabase
        .from('practice_problem')
        .select('*', { count: 'exact', head: true })
        .eq('admin_status', 'approved');

      // Apply same filters as getProblems
      if (filters.difficulty && filters.difficulty !== 'All Levels') {
        if (filters.difficulty === 'Easy') {
          query = query.or('difficulty.eq.Easy,difficulty.eq.EASY');
        } else if (filters.difficulty === 'Medium') {
          query = query.or('difficulty.eq.Medium,difficulty.eq.MEDIUM');
        } else if (filters.difficulty === 'Hard') {
          query = query.or('difficulty.eq.Hard,difficulty.eq.HARD');
        }
      }

      if (filters.language && filters.language !== 'All Categories') {
        query = query.eq('problem_language', filters.language);
      }

      if (filters.status && filters.status !== 'All') {
        if (filters.status === 'Solved') {
          query = query.or('status.eq.solved,status.eq.SOLVED');
        } else if (filters.status === 'Unsolved') {
          query = query.or('status.eq.unsolved,status.eq.UNSOLVED');
        }
      }

      if (filters.search) {
        query = query.or(`problem_title.ilike.%${filters.search}%,problemsetter_name.ilike.%${filters.search}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error getting problems count:', error);
        return { success: false, error: error.message };
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Unexpected error getting problems count:', error);
      return { success: false, error: 'Failed to get problems count' };
    }
  },
  async getProblemById(problemId) {
    try {
      const { data, error } = await supabase
        .from('practice_problem')
        .select('*')
        .eq('admin_status', 'approved')
        .eq('problem_id', problemId)
        .single();

      if (error) {
        console.error('Error fetching problem:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching problem:', error);
      return { success: false, error: 'Failed to fetch problem' };
    }
  },

  // Get problems by difficulty
  async getProblemsByDifficulty(difficulty) {
    try {
      const { data, error } = await supabase
        .from('practice_problem')
        .select('*')
        .eq('admin_status', 'approved')
        .eq('difficulty', difficulty)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching problems by difficulty:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching problems by difficulty:', error);
      return { success: false, error: 'Failed to fetch problems' };
    }
  },

  // Get problems by language
  async getProblemsByLanguage(language) {
    try {
      const { data, error } = await supabase
        .from('practice_problem')
        .select('*')
        .eq('admin_status', 'approved')
        .eq('problem_language', language)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching problems by language:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching problems by language:', error);
      return { success: false, error: 'Failed to fetch problems' };
    }
  },

  // Update problem status (for marking as solved)
  async updateProblemStatus(problemId, status) {
    try {
      const { data, error } = await supabase
        .from('practice_problem')
        .update({ status })
        .eq('problem_id', problemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating problem status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error updating problem status:', error);
      return { success: false, error: 'Failed to update problem status' };
    }
  },

  // Get problem statistics
  async getProblemStats() {
    try {
      const { data, error } = await supabase
        .from('practice_problem')
        .select('difficulty, status, problem_language')
        .eq('admin_status', 'approved');

      if (error) {
        console.error('Error fetching problem stats:', error);
        return { success: false, error: error.message };
      }

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        byDifficulty: {
          Easy: data?.filter(p => p.difficulty === 'Easy' || p.difficulty === 'EASY').length || 0,
          Medium: data?.filter(p => p.difficulty === 'Medium' || p.difficulty === 'MEDIUM').length || 0,
          Hard: data?.filter(p => p.difficulty === 'Hard' || p.difficulty === 'HARD').length || 0,
        },
        byLanguage: {},
        solved: data?.filter(p => p.status === 'solved' || p.status === 'SOLVED').length || 0,
        unsolved: data?.filter(p => p.status === 'unsolved' || p.status === 'UNSOLVED').length || 0,
      };

      // Count by language
      data?.forEach(problem => {
        stats.byLanguage[problem.problem_language] = 
          (stats.byLanguage[problem.problem_language] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error fetching problem stats:', error);
      return { success: false, error: 'Failed to fetch problem statistics' };
    }
  }
};
