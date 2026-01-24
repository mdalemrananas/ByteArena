import { supabase } from './supabaseClient';

// Get leaderboard entry by participant ID
export const getLeaderboardEntry = async (participantId) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('participate_id', participantId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching leaderboard entry:', error);
    return { success: false, error: error.message };
  }
};

// Check if user has already earned points for a specific problem
export const hasUserEarnedPointsForProblem = async (participantId, problemId) => {
  try {
    const { data, error } = await supabase
      .from('practice_submission')
      .select('submission_id')
      .eq('problem_solver_id', participantId)
      .eq('problem_id', problemId)
      .eq('submission_status', 'Accepted')
      .limit(1);

    if (error) {
      throw error;
    }

    // If we found any accepted submissions for this problem, user has already earned points
    const hasEarned = data && data.length > 0;
    return { success: true, hasEarned };
  } catch (error) {
    console.error('Error checking problem points:', error);
    return { success: false, error: error.message };
  }
};

// Create new leaderboard entry
export const createLeaderboardEntry = async (participantId, score, level = 1, problemSolve = 1, badge = 'bronze') => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        participate_id: participantId,
        score: score,
        level: level,
        problem_solve: problemSolve,
        badge: badge
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
    return { success: false, error: error.message };
  }
};

// Update existing leaderboard entry
export const updateLeaderboardEntry = async (participantId, additionalScore, incrementProblems = true) => {
  try {
    // First get current entry
    const { data: currentEntry, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('participate_id', participantId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Calculate new values
    const newScore = currentEntry.score + additionalScore;
    const newProblemSolve = incrementProblems ? currentEntry.problem_solve + 1 : currentEntry.problem_solve;
    
    // Determine new badge based on score
    let newBadge = currentEntry.badge;
    if (newScore >= 1000) {
      newBadge = 'master';
    } else if (newScore >= 500) {
      newBadge = 'elite';
    } else if (newScore >= 200) {
      newBadge = 'silver';
    } else {
      newBadge = 'bronze';
    }

    // Update the entry
    const { data, error } = await supabase
      .from('leaderboard')
      .update({
        score: newScore,
        problem_solve: newProblemSolve,
        badge: newBadge,
        updated_at: new Date().toISOString()
      })
      .eq('participate_id', participantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
    return { success: false, error: error.message };
  }
};

// Update or create leaderboard entry when user solves a problem
export const updateLeaderboardOnProblemSolve = async (participantId, problemId, points) => {
  try {
    // First check if user has already earned points for this problem
    const pointsCheck = await hasUserEarnedPointsForProblem(participantId, problemId);
    if (!pointsCheck.success) {
      throw new Error('Failed to check problem points status');
    }

    if (pointsCheck.hasEarned) {
      // User has already earned points for this problem, don't add again
      console.log('User has already earned points for this problem');
      return { success: true, alreadyEarned: true, message: 'Points already earned for this problem' };
    }

    // Check if user has a leaderboard entry
    const entryResult = await getLeaderboardEntry(participantId);
    
    if (!entryResult.success) {
      throw new Error('Failed to check leaderboard entry');
    }

    let result;
    if (entryResult.data) {
      // User exists, update their entry
      result = await updateLeaderboardEntry(participantId, points);
    } else {
      // User doesn't exist, create new entry
      result = await createLeaderboardEntry(participantId, points);
    }

    return { success: true, alreadyEarned: false, data: result.data };
  } catch (error) {
    console.error('Error updating leaderboard on problem solve:', error);
    return { success: false, error: error.message };
  }
};

// Get full leaderboard
export const getLeaderboard = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        *,
        users:participate_id (
          username,
          display_name,
          country
        )
      `)
      .order('score', { ascending: false })
      .order('problem_solve', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { success: false, error: error.message };
  }
};

// Default export containing all functions
const leaderboardService = {
  getLeaderboardEntry,
  hasUserEarnedPointsForProblem,
  createLeaderboardEntry,
  updateLeaderboardEntry,
  updateLeaderboardOnProblemSolve,
  getLeaderboard
};

export default leaderboardService;
