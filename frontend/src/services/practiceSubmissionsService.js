import { supabase } from './supabaseClient';

// Helper function to convert Firebase UID to UUID format
const convertToUUID = (firebaseUid) => {
  // Remove any non-alphanumeric characters and ensure proper UUID format
  const cleanUid = firebaseUid.replace(/[^a-zA-Z0-9]/g, '');
  
  // If it's already a valid UUID format, return as is
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(firebaseUid)) {
    return firebaseUid;
  }
  
  // Convert Firebase UID to UUID-like format
  // This is a workaround - ideally you'd store Firebase UIDs as TEXT in the database
  if (cleanUid.length >= 32) {
    return `${cleanUid.substring(0, 8)}-${cleanUid.substring(8, 12)}-${cleanUid.substring(12, 16)}-${cleanUid.substring(16, 20)}-${cleanUid.substring(20, 32)}`;
  }
  
  // If too short, pad with zeros
  const padded = cleanUid.padEnd(32, '0');
  return `${padded.substring(0, 8)}-${padded.substring(8, 12)}-${padded.substring(12, 16)}-${padded.substring(16, 20)}-${padded.substring(20, 32)}`;
};

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
      // First get the submission data
      let submissionQuery = supabase
        .from('practice_submission')
        .select(`
          problem_solver_id,
          problem_solver_name,
          language,
          points
        `);

      // Filter by problemId if provided
      if (problemId) {
        submissionQuery = submissionQuery.eq('problem_id', problemId);
      }

      const { data: submissionData, error: submissionError } = await submissionQuery.order('points', { ascending: false });

      if (submissionError) {
        console.error('Error fetching submissions:', submissionError);
        return { success: false, error: submissionError.message };
      }

      console.log('Submission data:', submissionData);

      // Get unique user IDs from submissions (these are database UUIDs)
      const uniqueUserIds = [...new Set(submissionData?.map(s => s.problem_solver_id) || [])];
      console.log('Unique user IDs:', uniqueUserIds);

      // Fetch user data including country for these users using database UUID (id field)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, firebase_uid, country')
        .in('id', uniqueUserIds);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return { success: false, error: userError.message };
      }

      console.log('User data:', userData);

      // Create a map of user data by database UUID (id)
      const userMap = {};
      userData?.forEach(user => {
        userMap[user.id] = user;
      });

      console.log('User map:', userMap);

      // Process data to get unique users with highest points and country
      const uniqueUsers = new Map();
      
      submissionData?.forEach(submission => {
        const userId = submission.problem_solver_id; // This is database UUID
        const existingUser = uniqueUsers.get(userId);
        const userInfo = userMap[userId]; // Match by database UUID
        
        console.log('Processing submission for user:', userId, 'User info:', userInfo);
        
        // Only keep the submission with highest points for each user
        if (!existingUser || submission.points > existingUser.points) {
          uniqueUsers.set(userId, {
            problem_solver_id: submission.problem_solver_id,
            problem_solver_name: submission.problem_solver_name,
            country: userInfo?.country || 'Unknown',
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

      console.log('Final leaderboard:', leaderboard);

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

  // Submit a new solution
  async submitSolution(submissionData) {
    try {
      console.log('Submitting data:', submissionData);
      
      // Direct submission - database schema now supports TEXT for UUID fields
      const { data, error } = await supabase
        .from('practice_submission')
        .insert([submissionData])
        .select();

      if (error) {
        console.error('Error submitting solution:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Unexpected error submitting solution:', error);
      return { success: false, error: 'Failed to submit solution' };
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
