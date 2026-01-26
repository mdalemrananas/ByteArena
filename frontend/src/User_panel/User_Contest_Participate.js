import React, { useState, useEffect } from 'react';
import { Play, Eye, Edit3, Download, Copy, Settings, ChevronDown } from 'lucide-react';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaChartLine,
  FaFire,
  FaHome,
  FaListOl,
  FaMedal,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTrophy,
  FaUser,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './User_Dashboard.css';
import './Notifications.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

export default function CodingProblemPage() {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [active, setActive] = useState('contest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [problems, setProblems] = useState([]);
  const [contestData, setContestData] = useState(null);

  // Store user-written code for each problem
  const [problemCodes, setProblemCodes] = useState({});
  // Store selected language for each problem
  const [problemLanguages, setProblemLanguages] = useState({});
  // Store output for each problem
  const [problemOutputs, setProblemOutputs] = useState({});
  // Store custom input for each problem
  const [problemInputs, setProblemInputs] = useState({});

  const [selectedProblem, setSelectedProblem] = useState(0);
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('0.0000 secs');
  const [memory, setMemory] = useState('0.0 Mb');
  const [yourOutput, setYourOutput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({ type: '', message: '' });
  const [notification, setNotification] = useState(null);

  // Function to validate user output against expected output
  const validateOutput = (userOutput, expectedOutput) => {
    // Normalize both outputs by trimming whitespace and normalizing line endings
    const normalizedUserOutput = userOutput.trim().replace(/\r\n/g, '\n');
    const normalizedExpectedOutput = expectedOutput.trim().replace(/\r\n/g, '\n');
    
    // Debug logging
    console.log('User Output:', JSON.stringify(normalizedUserOutput));
    console.log('Expected Output:', JSON.stringify(normalizedExpectedOutput));
    console.log('Match:', normalizedUserOutput === normalizedExpectedOutput);
    
    // Compare the normalized outputs
    return normalizedUserOutput === normalizedExpectedOutput;
  };

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Function to update leaderboard table
  const updateLeaderboard = async (userId, points) => {
    try {
      // Check if user already exists in leaderboard
      const { data: existingLeaderboardEntry, error: fetchError } = await supabase
        .from('leaderboard')
        .select('id, score, problem_solve, level')
        .eq('participate_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching leaderboard entry:', fetchError);
        return;
      }

      // Get total solved problems count for the user
      const totalSolvedProblems = await getSolvedProblemsCount(userId, contestId);
      
      // Calculate level based on total solved problems
      let newLevel = 1;
      if (totalSolvedProblems >= 20) {
        newLevel = 4; // master
      } else if (totalSolvedProblems >= 15) {
        newLevel = 3; // elite
      } else if (totalSolvedProblems >= 10) {
        newLevel = 2; // silver
      } else if (totalSolvedProblems >= 5) {
        newLevel = 1; // bronze
      }

      // Determine badge based on level
      const badgeMap = {
        1: 'bronze',
        2: 'silver', 
        3: 'elite',
        4: 'master'
      };
      const newBadge = badgeMap[newLevel] || 'bronze';

      if (existingLeaderboardEntry) {
        // Update existing leaderboard entry
        const { error: updateError } = await supabase
          .from('leaderboard')
          .update({
            score: existingLeaderboardEntry.score + points,
            problem_solve: totalSolvedProblems,
            level: newLevel,
            badge: newBadge,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLeaderboardEntry.id);

        if (updateError) {
          console.error('Error updating leaderboard entry:', updateError);
        } else {
          console.log('Leaderboard entry updated successfully');
        }
      } else {
        // Insert new leaderboard entry
        const { error: insertError } = await supabase
          .from('leaderboard')
          .insert({
            participate_id: userId,
            score: points,
            problem_solve: totalSolvedProblems,
            level: newLevel,
            badge: newBadge
          });

        if (insertError) {
          console.error('Error inserting leaderboard entry:', insertError);
        } else {
          console.log('Leaderboard entry created successfully');
        }
      }
    } catch (error) {
      console.error('Error in updateLeaderboard:', error);
    }
  };

  // Function to get count of solved problems by user
  const getSolvedProblemsCount = async (userId, contestId) => {
    try {
      const { data, error } = await supabase
        .from('contest_question_solves')
        .select('question_id')
        .eq('participate_id', userId);
      
      if (error) {
        console.error('Error fetching solved problems:', error);
        return 0;
      }
      
      // Get unique question IDs that user has solved
      const solvedQuestionIds = data ? [...new Set(data.map(solve => solve.question_id))] : [];
      return solvedQuestionIds.length;
    } catch (error) {
      console.error('Error in getSolvedProblemsCount:', error);
      return 0;
    }
  };

  const handleSubmit = async () => {
    if (!user || !contestId || !problems[currentProblem]) {
      showNotification('User not authenticated or contest data missing', 'error');
      return;
    }

    // Check if code has been run and output is available
    if (!yourOutput) {
      showNotification('Please run your code first to check output before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({ type: 'info', message: 'Validating your solution...' });

    try {
      // Get the current question details
      const currentQuestion = problems[currentProblem];
      
      // Use the sample output from the problem data for validation
      const expectedOutput = currentQuestion.sampleOutput;
      
      // Debug logging
      console.log('Current Question:', currentQuestion);
      console.log('Sample Output:', JSON.stringify(expectedOutput));
      console.log('User Output:', JSON.stringify(yourOutput));

      // Validate the output
      const isValidOutput = validateOutput(yourOutput, expectedOutput);
      
      if (!isValidOutput) {
        showNotification('Your output does not match the expected output. Please check your solution and try again.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Get the user's ID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (userError || !userData) {
        throw new Error('User not found in database');
      }
      
      // Map frontend language values to database expected values
      const languageMap = {
        'cpp': 'c++',
        'c': 'c',
        'python': 'python',
        'java': 'java',
        'javascript': 'javascript'
      };
      
      const dbLanguage = languageMap[language] || 'c++';
      
      // Check if user already has a submission for this question
      const { data: existingSubmission, error: fetchError } = await supabase
        .from('contest_question_solves')
        .select('id')
        .eq('question_id', currentQuestion.id)
        .eq('participate_id', userData.id)
        .maybeSingle();

      let result;
      
      if (existingSubmission) {
        // Update existing submission
        const { data: updatedData, error: updateError } = await supabase
          .from('contest_question_solves')
          .update({
            language: dbLanguage,
            code: code,
            time_taken: parseFloat(time.split(' ')[0]) || 0,
            memory_taken: parseFloat(memory.split(' ')[0]) || 0,
            solve_updated_at: new Date().toISOString()
          })
          .eq('id', existingSubmission.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        result = updatedData;
        showNotification('Solution updated successfully!', 'success');
        
        // Update leaderboard for existing submission (no additional points for updates)
        await updateLeaderboard(userData.id, 0);
      } else {
        // Create new submission
        const { data: newData, error: insertError } = await supabase
          .from('contest_question_solves')
          .insert({
            question_id: currentQuestion.id,
            participate_id: userData.id,
            language: dbLanguage,
            code: code,
            time_taken: parseFloat(time.split(' ')[0]) || 0,
            memory_taken: parseFloat(memory.split(' ')[0]) || 0
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        result = newData;
        
        // Award 5 points for solving the problem and update contest participant score
        try {
          // First, get current participant record
          const { data: participantData, error: participantError } = await supabase
            .from('contest_participants')
            .select('score')
            .eq('contest_id', contestId)
            .eq('user_id', userData.id)
            .single();

          let isAllProblemsSolved = false;

          if (participantError && participantError.code !== 'PGRST116') {
            // If participant record doesn't exist, create it
            if (participantError.code === 'PGRST116') {
              const { error: createError } = await supabase
                .from('contest_participants')
                .insert({
                  contest_id: contestId,
                  user_id: userData.id,
                  score: 5,
                  status: 'in_progress'
                });
              if (createError) throw createError;
            } else {
              throw participantError;
            }
          } else {
            // Update existing participant score by adding 5 points
            const currentScore = participantData?.score || 0;
            const newScore = currentScore + 5;
            
            // Check if all problems are solved after this submission
            const totalProblems = problems.length;
            const solvedProblems = await getSolvedProblemsCount(userData.id, contestId);
            isAllProblemsSolved = solvedProblems + 1 >= totalProblems;
            
            const { error: updateScoreError } = await supabase
              .from('contest_participants')
              .update({
                score: newScore,
                status: isAllProblemsSolved ? 'completed' : 'in_progress',
                updated_at: new Date().toISOString()
              })
              .eq('contest_id', contestId)
              .eq('user_id', userData.id);
              
            if (updateScoreError) throw updateScoreError;
          }
          
          const pointsMessage = isAllProblemsSolved ? 
            'Solution submitted successfully! +5 points earned! Contest completed!' : 
            'Solution submitted successfully! +5 points earned!';
          
          showNotification(pointsMessage, 'success');
          
          // Update leaderboard for new submission (5 points awarded)
          await updateLeaderboard(userData.id, 5);
        } catch (scoreError) {
          console.error('Error updating score:', scoreError);
          // Still show success notification even if score update fails
          showNotification('Solution submitted successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      showNotification(error.message || 'Failed to submit solution. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
  // Get file extension based on language
  const fileExtensions = {
    'cpp': 'cpp',
    'c': 'c',
    'python': 'py',
    'java': 'java',
    'javascript': 'js'
  };
  
  const extension = fileExtensions[language] || 'txt';
  const filename = `code.${extension}`;
  
  // Create a blob with the code content
  const blob = new Blob([code], { type: 'text/plain' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  const fetchContestDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contest details:', error);
        navigate('/contest');
        return;
      }

      // Check if contest is approved
      if (!data || data.status !== 'approved') {
        console.log('Contest not found or not approved:', data);
        navigate('/contest');
        return;
      }

      console.log('Contest details fetched from Supabase:', data);
      setContestData(data);
      
      // Fetch contest questions from database
      fetchContestQuestions(id);
    } catch (error) {
      console.error('Error in fetchContestDetails:', error);
    }
  };

  // Fetch contest questions from Supabase
  const fetchContestQuestions = async (contestId) => {
    try {
      console.log('Fetching contest questions for contest:', contestId);
      
      const { data, error } = await supabase
        .from('contest_questions')
        .select('*')
        .eq('contest_id', contestId)
        .order('question_created_at', { ascending: true });

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Error fetching contest questions:', error);
        setProblems([]);
        return;
      }

      console.log('Contest questions fetched from Supabase:', data);
      
      if (data && data.length > 0) {
        // Transform database data to the expected format
        const formattedProblems = data.map((question) => {
          return {
            id: question.id, // Use the actual UUID from the database
            title: question.question_title,
            difficulty: "Medium",
            timeLimit: "1s",
            memoryLimit: "256 MB",
            description: question.question_description,
            inputFormat: question.question_input,
            outputFormat: question.question_output,
            sampleInput: question.question_sample_input || '',
            sampleOutput: question.question_sample_output || '',
            starterCode: {
              cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

// Write your solution here
int main() {
    // Your code here
    return 0;
}`,
              c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
int main() {
    // Your code here
    return 0;
}`,
              python: `# Write your solution here
def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`,
              java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
              javascript: `// Write your solution here
function main() {
    // Your code here
}

main();`
            }
          };
        });

        console.log('Formatted problems:', formattedProblems);
        setProblems(formattedProblems);
        
        // Set initial code for the first problem
        if (formattedProblems.length > 0) {
          setCode(formattedProblems[0].starterCode[language]);
        }
      } else {
        console.log('No questions found for this contest');
        setProblems([]);
      }
    } catch (error) {
      console.error('Error in fetchContestQuestions:', error);
      setProblems([]);
    }
  };

  const handleProblemChange = (index) => {
    // Save current code, language, output, and input before switching
    if (currentProblem !== null && problems[currentProblem]) {
      const currentProblemId = problems[currentProblem].id;
      setProblemCodes(prev => ({
        ...prev,
        [currentProblemId]: code
      }));
      setProblemLanguages(prev => ({
        ...prev,
        [currentProblemId]: language
      }));
      setProblemOutputs(prev => ({
        ...prev,
        [currentProblemId]: yourOutput
      }));
      setProblemInputs(prev => ({
        ...prev,
        [currentProblemId]: customInput
      }));
    }
    
    setCurrentProblem(index);
    setSelectedProblem(index);
    const problem = problems[index];
    if (problem) {
      const problemId = problem.id;
      // Check if user has a saved language for this problem
      const savedLanguage = problemLanguages[problemId];
      if (savedLanguage) {
        // Use the saved language
        setLanguage(savedLanguage);
      }
      
      // Check if user has written code for this problem
      const savedCode = problemCodes[problemId];
      if (savedCode) {
        // Use the user's saved code
        setCode(savedCode);
      } else {
        // Use the starter code for the selected language if available, otherwise use the first available language
        const currentLang = savedLanguage || language;
        const codeToSet = problem.starterCode[currentLang] || 
                         Object.values(problem.starterCode)[0] || 
                         '';
        setCode(codeToSet);
      }
      
      // Restore or clear output for this problem
      const savedOutput = problemOutputs[problemId];
      setYourOutput(savedOutput || '');
      
      // Restore or clear custom input for this problem
      const savedInput = problemInputs[problemId];
      setCustomInput(savedInput || '');
      
      // Reset status when switching problems
      setStatus('');
      setTime('0.0000 secs');
      setMemory('0.0 Mb');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Save the language preference for the current problem
    if (currentProblem !== null && problems[currentProblem]) {
      const currentProblemId = problems[currentProblem].id;
      setProblemLanguages(prev => ({
        ...prev,
        [currentProblemId]: newLanguage
      }));
    }
    
    const problem = problems[currentProblem];
    if (problem) {
      const problemId = problem.id;
      // Check if user has written code for this problem
      const savedCode = problemCodes[problemId];
      if (savedCode) {
        // Keep the user's code even when changing language
        setCode(savedCode);
      } else {
        // Use the starter code for the new language if available
        if (problem.starterCode[newLanguage]) {
          setCode(problem.starterCode[newLanguage]);
        }
      }
    }
  };

  // Load Emscripten for C/C++ execution
  const loadEmscripten = async () => {
    return new Promise((resolve, reject) => {
      if (window.wasmModule) {
        resolve(window.wasmModule);
        return;
      }

      // Load Emscripten runtime
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/emscripten@3.1.27/emscripten.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        resolve(window.emscripten);
      };
      script.onerror = (error) => {
        console.error('Emscripten loading error:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  };

  // Compile and execute C/C++/Java code using Judge0 API
  const executeWandboxCode = async (code, language, input) => {
    try {
      const languageMap = {
        'cpp': 54,    // C++ (GCC 9.2.0)
        'c': 50,      // C (GCC 9.2.0)
        'java': 62    // Java (OpenJDK 13.0.1)
      };

      // First, submit the code for compilation
      const submitResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-key': '1234567890abcdef1234567890abcdef', // Free tier key (limited)
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          language_id: languageMap[language],
          source_code: code,
          stdin: input || ''
        })
      });

      if (!submitResponse.ok) {
        // Fallback to alternative API if Judge0 fails
        return await executeCodeWithPiston(code, language, input);
      }

      const result = await submitResponse.json();
      
      let output = '';
      if (result.compile_output) {
        output = `Compilation Error:\n${result.compile_output}`;
      } else if (result.runtime_error) {
        output = `Runtime Error:\n${result.runtime_error}`;
      } else if (result.stdout) {
        output = result.stdout;
      } else {
        output = 'No output';
      }

      // Extract memory usage from Judge0 API response
      let memoryUsage = 'N/A';
      if (result.memory) {
        memoryUsage = `${(result.memory / 1024).toFixed(2)} MB`; // Convert KB to MB
      }

      return {
        output: output.trim() || 'No output',
        memory: memoryUsage,
        status: result.compile_output || result.runtime_error ? 'Runtime Error' : 'Successfully executed'
      };
    } catch (error) {
      console.error('Judge0 compilation error, trying Piston API:', error);
      // Fallback to Piston API
      return await executeCodeWithPiston(code, language, input);
    }
  };

  // Fallback: Compile and execute using Piston API (free, no authentication needed)
  const executeCodeWithPiston = async (code, language, input) => {
    try {
      const languageMap = {
        'cpp': 'cpp',
        'c': 'c',
        'java': 'java'
      };

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: languageMap[language],
          version: '*',
          files: [
            {
              name: language === 'java' ? 'Main.java' : `main.${language === 'cpp' ? 'cpp' : 'c'}`,
              content: code
            }
          ],
          stdin: input || ''
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      let output = '';
      if (result.compile && result.compile.stderr) {
        output = `Compilation Error:\n${result.compile.stderr}`;
      } else if (result.run && result.run.stderr) {
        output = `Runtime Error:\n${result.run.stderr}`;
      } else if (result.run && result.run.stdout) {
        output = result.run.stdout;
      } else {
        output = 'No output';
      }

      // Extract memory usage from Piston API response
      let memoryUsage = 'N/A';
      if (result.run && result.run.memory) {
        memoryUsage = `${(result.run.memory / 1024).toFixed(2)} MB`; // Convert KB to MB
      }

      return {
        output: output.trim() || 'No output',
        memory: memoryUsage,
        status: (result.compile && result.compile.stderr) || (result.run && result.run.stderr) ? 'Runtime Error' : 'Successfully executed'
      };
    } catch (error) {
      console.error('Piston API error:', error);
      return {
        output: `Error: ${error.message}\n\nTroubleshooting:\n1. Check your code syntax\n2. Ensure code compiles locally\n3. Check input format`,
        memory: 'N/A',
        status: 'Compilation Error'
      };
    }
  };

  // Detect code language based on syntax patterns
  const detectCodeLanguage = (code) => {
    const trimmedCode = code.trim();
    
    // Language signatures
    const signatures = {
      java: [
        /\bpublic\s+class\s+\w+/,
        /import\s+java\./,
        /System\.out\.println/
      ],
      python: [
        /^\s*def\s+\w+\s*\(/m,
        /^\s*import\s+\w+/m,
        /^\s*from\s+\w+\s+import/m,
        /print\s*\(/,
        /:\s*$/m
      ],
      cpp: [
        /#include\s*[<"]/,
        /using\s+namespace\s+std/,
        /int\s+main\s*\(/,
        /cout\s*<<|cin\s*>>/
      ],
      c: [
        /#include\s*<stdio\.h>/,
        /int\s+main\s*\(/,
        /printf|scanf/
      ],
      javascript: [
        /function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=/,
        /console\.log/,
        /=>|function/
      ]
    };
    
    let detectedLanguages = [];
    
    for (const [lang, patterns] of Object.entries(signatures)) {
      const matches = patterns.filter(pattern => pattern.test(trimmedCode)).length;
      if (matches > 0) {
        detectedLanguages.push({ lang, score: matches });
      }
    }
    
    return detectedLanguages.sort((a, b) => b.score - a.score).map(d => d.lang);
  };

  // Validate if selected language matches code language
  const validateCodeLanguage = (code, selectedLanguage) => {
    const detectedLangs = detectCodeLanguage(code);
    
    if (detectedLangs.length === 0) {
      return { isValid: true, message: '' };
    }
    
    const detectedLang = detectedLangs[0];
    
    if (detectedLang !== selectedLanguage) {
      return {
        isValid: false,
        message: `⚠️ Language Mismatch!\n\nYou selected ${selectedLanguage.toUpperCase()}, but your code appears to be written in ${detectedLang.toUpperCase()}.\n\nPlease either:\n1. Change your code to ${selectedLanguage.toUpperCase()}\n2. Switch the language selector to ${detectedLang.toUpperCase()}`,
        detectedLang
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Browser-based code execution
  const executeCode = async (code, language, input) => {
    const startTime = performance.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    try {
      let output = '';
      let status = 'Successfully executed';
      
      if (language === 'javascript') {
        // Create a console capture mechanism
        const originalConsoleLog = console.log;
        const logs = [];
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        };
        
        try {
          // Create a safer execution environment
          const inputArray = (input && typeof input === 'string') ? input.split('\n').map(line => line.trim()) : [];
          let currentIndex = 0;
          const customReadline = () => inputArray[currentIndex++] || '';
          
          // Mock readline for Node.js compatibility
          const readline = {
            createInterface: () => ({
              on: () => {},
              close: () => {}
            }),
            sync: {
              question: () => ''
            }
          };
          
          // Execute the code in a try-catch block
          const wrappedCode = `
            try {
              (function() {
                ${code}
              })();
            } catch (e) {
              console.log('Error:', e.message);
            }
          `;
          
          const userFunction = new Function('console', 'input', 'inputArray', 'currentIndex', 'customReadline', 'readline', wrappedCode);
          userFunction({ log: console.log }, input, inputArray, currentIndex, customReadline, readline);
          output = logs.join('\n');
        } catch (error) {
          output = `Error: ${error.message}`;
          status = 'Runtime Error';
        } finally {
          console.log = originalConsoleLog;
        }
      } else if (language === 'python') {
        // For Python, we'll use Pyodide (needs to be loaded)
        try {
          if (typeof window.pyodide === 'undefined') {
            // Load Pyodide if not already loaded
            await loadPyodide();
          }
          
          const pyodide = window.pyodide;
          
          // Reset stdout and stderr
          pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
          `);
          
          // Set up input handling
          if (input && typeof input === 'string') {
            const escapedInput = input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdin = StringIO('${escapedInput}')
`);
          }
          
          // Execute user code
          pyodide.runPython(code);
          
          // Get output
          output = pyodide.runPython('sys.stdout.getvalue()');
          
          // Check for errors
          const stderrOutput = pyodide.runPython('sys.stderr.getvalue()');
          if (stderrOutput) {
            output = `Error: ${stderrOutput}`;
            status = 'Runtime Error';
          }
          
        } catch (error) {
          console.error('Python execution error:', error);
          output = `Error: ${error.message || error.toString()}`;
          status = 'Runtime Error';
        }
      } else if (language === 'cpp' || language === 'c' || language === 'java') {
        // Use Wandbox API for C/C++/Java execution
        const wandboxResult = await executeWandboxCode(code, language, input);
        output = wandboxResult.output;
        status = wandboxResult.status;
      } else {
        output = `Language ${language} is not supported for browser execution.`;
        status = 'Not Supported';
      }
      
      const endTime = performance.now();
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const executionTime = ((endTime - startTime) / 1000).toFixed(4);
      
      // Calculate memory usage
      let memoryUsage = 'N/A';
      if (performance.memory) {
        const memoryUsedBytes = endMemory - startMemory;
        const memoryUsedMB = (memoryUsedBytes / (1024 * 1024)).toFixed(2);
        memoryUsage = `${memoryUsedMB} MB`;
      }
      
      return {
        output: output || 'No output',
        time: executionTime,
        memory: memoryUsage,
        status: status
      };
      
    } catch (error) {
      return {
        output: `Execution Error: ${error.message}`,
        time: '0.0000',
        memory: 'N/A',
        status: 'Runtime Error'
      };
    }
  };
  
  // Load Pyodide for Python execution
  const loadPyodide = async () => {
    return new Promise((resolve, reject) => {
      if (window.pyodide) {
        resolve(window.pyodide);
        return;
      }
      
      // Create a unique script element to avoid conflicts
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = async () => {
        try {
          // Initialize Pyodide with error handling
          window.pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
          });
          
          // Load core packages
          await window.pyodide.loadPackage(['micropip']);
          
          resolve(window.pyodide);
        } catch (error) {
          console.error('Pyodide loading error:', error);
          reject(error);
        }
      };
      
      script.onerror = (error) => {
        console.error('Pyodide script loading error:', error);
        reject(error);
      };
      
      // Add script to head with error handling
      try {
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleRun = async () => {
    if (isRunning) return;
    
    // Validate language match
    const validation = validateCodeLanguage(code, language);
    
    if (!validation.isValid) {
      setStatus('Language Mismatch');
      setYourOutput(validation.message);
      setTime('0.0000 secs');
      setMemory('N/A');
      return;
    }
    
    setIsRunning(true);
    setStatus('Running...');
    setYourOutput('');
    
    try {
      const result = await executeCode(code, language, customInput);
      
      setStatus(result.status);
      setYourOutput(result.output);
      setTime(result.time + ' secs');
      setMemory(result.memory);
    } catch (error) {
      setStatus('Runtime Error');
      setYourOutput(`Error: ${error.message}`);
      setTime('0.0000 secs');
      setMemory('N/A');
    } finally {
      setIsRunning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        // Fetch contest details when user is authenticated and contestId is available
        if (contestId) {
          fetchContestDetails(contestId);
        }
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate, contestId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`ud-root ${sidebarOpen ? '' : 'collapsed'}`}>
      <aside className="ud-sidebar">
        <div className="ud-logo">
          <span className="byte">Byte</span>
          <span className="arena">Arena</span>
        </div>
        <nav className="ud-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/dashboard');
                  } else if (item.key === 'contest') {
                    navigate('/contest');
                  } else if (item.key === 'practice') {
                    navigate('/practice');
                  } else if (item.key === 'leaderboard') {
                    navigate('/leaderboard');
                  }
                }
              }}
            >
              <span className="icon" style={{ marginRight: '12px' }}>{item.icon}</span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="ud-main">
        <header className="ud-topbar">
          <div className="ud-topbar-left">
            <button
              className="ud-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FaBars />
            </button>
            <div className="search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search problems, contests..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button
              className="icon-btn"
              onClick={() => {
                console.log('Home button clicked, navigating to /');
                navigate('/');
              }}
              data-tooltip="Home"
            >
              <FaHome />
            </button>
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">4</span>
            </button>
            <div className="balance" data-tooltip="Reward Coins">
              <FaCoins className="balance-icon" />
              <span>1200.00</span>
            </div>
            <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Notification Component */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: notification.type === 'success' ? '#28a745' : 
                           notification.type === 'error' ? '#dc3545' : '#17a2b8',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '300px',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <span style={{ flex: 1 }}>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
        )}

        <section className="ud-content">
          <div style={{
            display: 'flex',
            height: 'calc(150vh - 20px)',
            backgroundColor: '#f5f5f5',
            overflow: 'hidden'
          }}>
            {/* Left Sidebar - Problems List */}
            <div style={{
              width: '250px',
              backgroundColor: '#2c3e50',
              color: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '1.5rem 1rem',
                borderBottom: '1px solid #34495e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white'
                }}>Problems</h2>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#cccccc' : '#e23333ff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s',
                      opacity: isSubmitting ? 0.8 : 1,
                      ':hover': {
                        backgroundColor: isSubmitting ? '#cccccc' : '#c12a2a'
                      }
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  {submissionStatus.message && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: submissionStatus.type === 'error' ? '#ff6b6b' : 
                             submissionStatus.type === 'success' ? '#51cf66' : '#339af0',
                      textAlign: 'right',
                      maxWidth: '200px',
                      padding: '0.25rem 0'
                    }}>
                      {submissionStatus.message}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: 1, overflow: 'auto' }}>
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    onClick={() => handleProblemChange(index)}
                    style={{
                      padding: '1rem',
                      backgroundColor: selectedProblem === index ? '#5a6fd8' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid #34495e',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProblem !== index) {
                        e.currentTarget.style.backgroundColor = '#34495e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProblem !== index) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: selectedProblem === index ? 'rgba(255,255,255,0.2)' : '#5a6fd8',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          {problem.title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                          <span style={{
                            backgroundColor: '#f39c12',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '3px',
                            fontWeight: '600'
                          }}>
                            {problem.difficulty}
                          </span>
                          <span style={{ color: '#bdc3c7' }}>{problem.timeLimit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Top Section - Problem Statement */}
              <div style={{
                height: '60%',
                backgroundColor: 'white',
                borderBottom: '2px solid #e0e0e0',
                overflow: 'auto'
              }}>
                <div style={{ padding: '2rem' }}>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#2c3e50',
                    margin: '0 0 1rem 0',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.025em'
                  }}>
                    {String.fromCharCode(65 + currentProblem)}. {problems[currentProblem]?.title || 'Loading...'}
                  </h1>

                  <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    color: '#7f8c8d'
                  }}>
                    <div>
                      <strong>Time Limit:</strong> {problems[currentProblem]?.timeLimit || '1s'}
                    </div>
                    <div>
                      <strong>Memory Limit:</strong> {problems[currentProblem]?.memoryLimit || '256 MB'}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#34495e',
                    marginBottom: '1.5rem'
                  }}>
                    {problems[currentProblem]?.description?.split('\n').map((line, index) => (
                      <p key={index} style={{ marginBottom: '1rem' }}>{line}</p>
                    ))}
                  </div>

                  {/* Input Section */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      margin: '0 0 0.75rem 0',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Input
                    </h3>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: '#2c3e50',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid #e9ecef'
                    }}>
                      {problems[currentProblem]?.inputFormat || 'No input format specified'}
                    </div>
                  </div>

                  {/* Output Section */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      margin: '0 0 0.75rem 0',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Output
                    </h3>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: '#2c3e50',
                      border: '1px solid #e9ecef'
                    }}>
                      {problems[currentProblem]?.outputFormat || 'No output format specified'}
                    </div>
                  </div>

                  {/* Sample Test Cases */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: '0 0 0.5rem 0',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Sample Input
                      </h4>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        color: '#2c3e50',
                        whiteSpace: 'pre',
                        border: '1px solid #e9ecef'
                      }}>
                        {problems[currentProblem]?.sampleInput || 'No sample input'}
                      </div>
                    </div>

                    <div>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: '0 0 0.5rem 0',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Sample Output
                      </h4>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        color: '#2c3e50',
                        border: '1px solid #e9ecef'
                      }}>
                        {problems[currentProblem]?.sampleOutput || 'No sample output'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Code Editor and Output */}
              <div style={{
                height: '60%',
                display: 'flex',
                overflow: 'hidden'
              }}>
                {/* Code Editor (Left) */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#1e1e1e',
                  borderRight: '2px solid #e0e0e0'
                }}>
                  {/* Toolbar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#2d2d2d',
                    borderBottom: '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{
                          padding: '0.5rem 2rem 0.5rem 0.75rem',
                          backgroundColor: '#3c3c3c',
                          color: '#d4d4d4',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#d4d4d4',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#d4d4d4',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                        onClick={handleDownload}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#d4d4d4',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                        onClick={(event) => {
                          navigator.clipboard.writeText(code);
                          setShowCopied(true);
                          setTimeout(() => {
                            setShowCopied(false);
                          }, 2000);
                        }}
                      >
                        <Copy size={18} />
                      </button>
                      {showCopied && (
                        <span style={{
                          color: '#4CAF50',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          borderRadius: '4px',
                          animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                          Copied!
                        </span>
                      )}
                      <button
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#d4d4d4',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={handleRun}
                        disabled={isRunning}
                        style={{
                          padding: '0.5rem 1.5rem',
                          backgroundColor: isRunning ? '#6c757d' : '#28a745',
                          border: 'none',
                          color: 'white',
                          cursor: isRunning ? 'not-allowed' : 'pointer',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginLeft: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: isRunning ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isRunning) e.target.style.backgroundColor = '#218838';
                        }}
                        onMouseLeave={(e) => {
                          if (!isRunning) e.target.style.backgroundColor = '#28a745';
                        }}
                      >
                        <Play size={16} />
                        {isRunning ? 'Running...' : 'Run'}
                      </button>
                    </div>
                  </div>

                  {/* Code Area */}
                  <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <div style={{
                      padding: '1rem 0.5rem',
                      backgroundColor: '#1e1e1e',
                      color: '#858585',
                      fontSize: '0.875rem',
                      textAlign: 'right',
                      userSelect: 'none',
                      minWidth: '3rem',
                      borderRight: '1px solid #333',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {code.split('\n').map((_, i) => (
                        <div key={i} style={{ lineHeight: '1.5rem' }}>{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5rem',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* IDE Output (Right) */}
                <div style={{
                  width: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#252526'
                }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #333',
                    backgroundColor: '#2d2d2d'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#cccccc',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Output
                    </h3>
                  </div>

                  <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1rem'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: '4px',
                      marginBottom: '1.5rem',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <strong>Status:</strong> {status}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '2rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <div style={{ color: '#858585', marginBottom: '0.25rem' }}>Time:</div>
                        <div style={{ color: '#d4d4d4' }}>{time}</div>
                      </div>
                      <div>
                        <div style={{ color: '#858585', marginBottom: '0.25rem' }}>Memory:</div>
                        <div style={{ color: '#d4d4d4' }}>{memory}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#cccccc',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Input
                      </h4>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter input here..."
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '0.75rem',
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                          border: '1px solid #3c3c3c',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontFamily: 'var(--font-mono)',
                          resize: 'vertical',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <h4 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#cccccc',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Your Output
                      </h4>
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#1e1e1e',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#d4d4d4',
                        minHeight: '60px',
                        border: '1px solid #3c3c3c'
                      }}>
                        {yourOutput}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}