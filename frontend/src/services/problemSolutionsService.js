import { supabase } from './supabaseClient';

const problemSolutionsService = {
    // Get solution by problem ID
    async getSolutionByProblemId(problemId) {
        try {
            console.log('Querying problem_solution table for problemId:', problemId);
            console.log('ProblemId type:', typeof problemId);
            
            const { data, error } = await supabase
                .from('problem_solution')
                .select('*')
                .eq('problem_id', problemId)
                .single();

            console.log('Supabase query result:', { data, error });

            if (error) {
                // Handle case where no solution exists
                if (error.code === 'PGRST116') {
                    console.log('No solution found for problem:', problemId);
                    return { success: true, data: null };
                }
                console.error('Error fetching solution:', error);
                return { success: false, error: error.message };
            }

            console.log('Solution found:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Unexpected error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all solutions (for debugging)
    async getAllSolutionsForDebug() {
        try {
            const { data, error } = await supabase
                .from('problem_solution')
                .select('*');

            if (error) {
                console.error('Error fetching all solutions:', error);
                return { success: false, error: error.message };
            }

            console.log('All solutions in database:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Unexpected error:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all solutions (for admin purposes)
    async getAllSolutions() {
        try {
            const { data, error } = await supabase
                .from('problem_solution')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching all solutions:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Unexpected error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create or update solution
    async upsertSolution(solutionData) {
        try {
            const { data, error } = await supabase
                .from('problem_solution')
                .upsert(solutionData, {
                    onConflict: 'problem_id',
                    returning: '*'
                });

            if (error) {
                console.error('Error upserting solution:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Unexpected error:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete solution
    async deleteSolution(problemId) {
        try {
            const { error } = await supabase
                .from('problem_solution')
                .delete()
                .eq('problem_id', problemId);

            if (error) {
                console.error('Error deleting solution:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Unexpected error:', error);
            return { success: false, error: error.message };
        }
    }
};

export default problemSolutionsService;
