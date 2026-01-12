import { supabase } from './supabaseClient';

// Practice Submissions Leaderboard Service
export const practiceSubmissionsService = {
  // Get leaderboard data with ranking based on highest points per user
  async getLeaderboard(problemId = null) {
    try {
      // First, get the highest points for each user
      let query = supabase
        .from('practice_submission')
        .select('problem_solver_id, problem_solver_name, country, language, points');

      // Filter by problemId if provided
      if (problemId) {
        query = query.eq('problem_id', problemId);
      }

      const { data: maxPointsData, error: maxPointsError } = await query.order('points', { ascending: false });

      if (maxPointsError) {
        console.error('Error fetching max points:', maxPointsError);
        return { success: false, error: maxPointsError.message };
      }

      // Group by user and get highest points per user
      const userMaxPoints = {};
      maxPointsData?.forEach(submission => {
        const userId = submission.problem_solver_id;
        if (!userMaxPoints[userId] || submission.points > userMaxPoints[userId].points) {
          userMaxPoints[userId] = {
            problem_solver_id: submission.problem_solver_id,
            problem_solver_name: submission.problem_solver_name,
            country: submission.country,
            language: submission.language,
            points: submission.points
          };
        }
      });

      // Convert to array and sort by points (descending)
      const leaderboardData = Object.values(userMaxPoints)
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      return { success: true, data: leaderboardData };
    } catch (error) {
      console.error('Unexpected error fetching leaderboard:', error);
      return { success: false, error: 'Failed to fetch leaderboard data' };
    }
  },

  // Alternative approach using SQL query for better performance
  async getLeaderboardOptimized(problemId = null) {
    try {
      let query = supabase
        .from('practice_submission')
        .select(`
          problem_solver_id,
          problem_solver_name,
          country,
          language,
          points
        `);

      // Filter by problemId if provided
      if (problemId) {
        query = query.eq('problem_id', problemId);
      }

      const { data, error } = await query.order('points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error: error.message };
      }

      // Process data to get unique users with highest points
      const uniqueUsers = new Map();
      
      data?.forEach(submission => {
        const userId = submission.problem_solver_id;
        const existingUser = uniqueUsers.get(userId);
        
        // Only keep the submission with highest points for each user
        if (!existingUser || submission.points > existingUser.points) {
          uniqueUsers.set(userId, {
            problem_solver_id: submission.problem_solver_id,
            problem_solver_name: submission.problem_solver_name,
            country: submission.country,
            language: submission.language,
            points: submission.points
          });
        }
      });

      // Convert to array, sort by points, and add ranks
      const leaderboard = Array.from(uniqueUsers.values())
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      return { success: true, data: leaderboard };
    } catch (error) {
      console.error('Unexpected error fetching optimized leaderboard:', error);
      return { success: false, error: 'Failed to fetch leaderboard data' };
    }
  },

  // Get leaderboard with pagination
  async getLeaderboardPaginated(page = 1, limit = 50, problemId = null) {
    try {
      let query = supabase
        .from('practice_submission')
        .select(`
          problem_solver_id,
          problem_solver_name,
          country,
          language,
          points
        `);

      // Filter by problemId if provided
      if (problemId) {
        query = query.eq('problem_id', problemId);
      }

      const { data, error } = await query.order('points', { ascending: false });

      if (error) {
        console.error('Error fetching paginated leaderboard:', error);
        return { success: false, error: error.message };
      }

      // Process data to get unique users with highest points
      const uniqueUsers = new Map();
      
      data?.forEach(submission => {
        const userId = submission.problem_solver_id;
        const existingUser = uniqueUsers.get(userId);
        
        if (!existingUser || submission.points > existingUser.points) {
          uniqueUsers.set(userId, {
            problem_solver_id: submission.problem_solver_id,
            problem_solver_name: submission.problem_solver_name,
            country: submission.country,
            language: submission.language,
            points: submission.points
          });
        }
      });

      // Convert to array, sort by points, and add ranks
      const leaderboard = Array.from(uniqueUsers.values())
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = leaderboard.slice(startIndex, endIndex);

      return { 
        success: true, 
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: leaderboard.length,
          totalPages: Math.ceil(leaderboard.length / limit)
        }
      };
    } catch (error) {
      console.error('Unexpected error fetching paginated leaderboard:', error);
      return { success: false, error: 'Failed to fetch leaderboard data' };
    }
  },

  // Get user's rank and position
  async getUserRank(userId) {
    try {
      const { data, error } = await this.getLeaderboardOptimized();
      
      if (error || !data) {
        return { success: false, error: error || 'Failed to get user rank' };
      }

      const userEntry = data.find(user => user.problem_solver_id === userId);
      
      return { 
        success: true, 
        data: {
          rank: userEntry?.rank || null,
          points: userEntry?.points || 0,
          totalUsers: data.length
        }
      };
    } catch (error) {
      console.error('Unexpected error getting user rank:', error);
      return { success: false, error: 'Failed to get user rank' };
    }
  },

  // Get leaderboard statistics
  async getLeaderboardStats() {
    try {
      const { data, error } = await this.getLeaderboardOptimized();
      
      if (error || !data) {
        return { success: false, error: error || 'Failed to get leaderboard stats' };
      }

      const stats = {
        totalParticipants: data.length,
        averagePoints: data.reduce((sum, user) => sum + user.points, 0) / data.length,
        topScore: data[0]?.points || 0,
        countryDistribution: {},
        languageDistribution: {}
      };

      // Calculate distributions
      data.forEach(user => {
        stats.countryDistribution[user.country] = (stats.countryDistribution[user.country] || 0) + 1;
        stats.languageDistribution[user.language] = (stats.languageDistribution[user.language] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Unexpected error getting leaderboard stats:', error);
      return { success: false, error: 'Failed to get leaderboard statistics' };
    }
  }
};
