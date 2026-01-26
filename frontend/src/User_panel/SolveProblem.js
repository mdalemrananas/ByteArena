import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaBars,
    FaBell,
    FaCode,
    FaCoins,
    FaCommentAlt,
    FaFire,
    FaHome,
    FaListOl,
    FaMedal,
    FaSearch,
    FaSignOutAlt,
    FaStar,
    FaTrophy,
    FaUser,
    FaPlayCircle,
    FaArrowLeft,
    FaBook,
    FaComments,
    FaTimes,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { practiceProblemsService } from '../services/practiceProblemsService';
import { practiceSubmissionsService } from '../services/practiceSubmissionsService';
import leaderboardService from '../services/leaderboardService';
import { supabase } from '../services/supabaseClient';
import './User_Dashboard.css';
import './SolveProblem.css';

const menuItems = [
    { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
    { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
    { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
    { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const SolveProblem = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userScore, setUserScore] = useState(0);
    const [problem, setProblem] = useState(null);
    const [problemLoading, setProblemLoading] = useState(true);
    // Language-specific code templates
    const getCodeTemplate = (language) => {
        const templates = {
            'python': `# Python solution
def solve():
    # Write your solution here
    print("Hello World!")

if __name__ == "__main__":
    solve()`,
            'javascript': `// JavaScript solution
function solve() {
    // Write your solution here
    console.log("Hello World!");
}

solve();`,
            'java': `// Java solution template
public class Main {
    public static void main(String[] args) throws Exception {
        // Write your solution here
        System.out.println("Hello World!");
        System.out.flush();
    }
}`,
            'cpp': '#include <iostream>\n\nint main(void)\n{\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}',
            'c': '#include <stdio.h>\n\nint main(void)\n{\n    printf("Hello World!");\n    return 0;\n}'
        };
        return templates[language] || templates['python'];
    };

    const [code, setCode] = useState(getCodeTemplate('python'));
    const [output, setOutput] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const { problemId } = useParams();
    const navigate = useNavigate();

    // Generate line numbers based on actual code content
    const generateLineNumbers = (code) => {
        const lines = code.split('\n');
        const lineCount = Math.max(lines.length, 1); // Generate based on actual code lines, minimum 1
        console.log('Code lines:', lines.length, 'Generated lines:', lineCount);
        console.log('Code content:', JSON.stringify(code));
        return Array.from({ length: lineCount }, (_, i) => i + 1);
    };

    const [lineNumbers, setLineNumbers] = useState(generateLineNumbers(code));

    // Fetch problem data
    const fetchProblem = async () => {
        setProblemLoading(true);
        const result = await practiceProblemsService.getProblemById(problemId);
        
        if (result.success) {
            setProblem(result.data);
        } else {
            console.error('Error fetching problem:', result.error);
        }
        setProblemLoading(false);
    };

    const fetchUserScore = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('score')
                .eq('participate_id', userId)
                .single();

            if (error) {
                console.error('Error fetching user score:', error);
                // If no leaderboard entry exists, return 0
                if (error.code === 'PGRST116') {
                    return 0;
                }
                throw error;
            }

            return data?.score || 0;
        } catch (error) {
            console.error('Error in fetchUserScore:', error);
            return 0;
        }
    };

    useEffect(() => {
        fetchProblem();
    }, [problemId]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                // Fetch user's Supabase ID and score
                try {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('firebase_uid', currentUser.uid)
                        .single();

                    if (!userError && userData) {
                        const score = await fetchUserScore(userData.id);
                        setUserScore(score);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
            
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const showSuccess = (title, message) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setShowSuccessDialog(true);
    };

    const showError = (title, message) => {
        setDialogTitle(title);
        setDialogMessage(message);
        setShowErrorDialog(true);
    };

    const closeSuccessDialog = () => {
        setShowSuccessDialog(false);
        setDialogMessage('');
        setDialogTitle('');
        if (shouldNavigate) {
            navigate(`/practice/submissions/${problemId}`);
            setShouldNavigate(false);
        }
    };

    const closeErrorDialog = () => {
        setShowErrorDialog(false);
        setDialogMessage('');
        setDialogTitle('');
    };

    // Execute code using Piston API
    const runCode = async (e) => {
        console.log('=== RUN CODE FUNCTION START ===');
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        console.log('Run button clicked');
        setIsRunning(true);
        setOutput('Running code...');
        
        console.log('About to call executeCodeWithPiston...');
        try {
            const result = await executeCodeWithPiston(code, selectedLanguage);
            console.log('executeCodeWithPiston returned:', result);
            setOutput(result.output);
        } catch (error) {
            console.log('executeCodeWithPiston error:', error);
            setOutput('Error: ' + error.message);
        } finally {
            setIsRunning(false);
        }
        return false;
    };

    // Submit solution function
    const submitSolution = async (e) => {
        console.log('=== SUBMIT SOLUTION FUNCTION START ===');
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        console.log('Submit button clicked');
        
        if (!user) {
            showError('Login Required', 'Please login to submit your solution');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // First, run the code silently
            setOutput('Validating solution...');
            const result = await executeCodeWithPiston(code, selectedLanguage);
            
            // Compare output with sample output
            const userOutput = result.output.trim();
            const expectedOutput = problem?.sample_output?.trim();
            
            console.log('User output:', userOutput);
            console.log('Expected output:', expectedOutput);
            
            if (userOutput === expectedOutput) {
                // Output matches, submit to database
                console.log('Output matches! Submitting to database...');
                
                // First, get the user's UUID from database using their Firebase UID
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('firebase_uid', user.uid)
                    .single();
                
                if (userError || !userData) {
                    console.error('Error fetching user UUID:', userError);
                    showError('User Error', 'User not found in database. Please ensure your account is properly set up.');
                    return;
                }
                
                const submissionData = {
                    problem_id: problem?.problem_id, // Problem UUID from database
                    problem_solver_id: userData.id, // User UUID from database (id column)
                    problem_solver_name: user.displayName || 'Anonymous',
                    country: user.country || '',
                    language: selectedLanguage,
                    submission_status: 'Accepted',
                    points: problem?.points || 0,
                    submitted_code: code
                };
                
                console.log('Submission data:', submissionData);
                
                // Check if user has already earned points for this problem BEFORE submitting
                const pointsCheck = await leaderboardService.hasUserEarnedPointsForProblem(
                    userData.id, // participant_id
                    problem?.problem_id // problem_id
                );
                
                if (!pointsCheck.success) {
                    console.error('Failed to check problem points status:', pointsCheck.error);
                } else if (pointsCheck.hasEarned) {
                    console.log('User has already earned points for this problem');
                } else {
                    console.log('User has not earned points for this problem yet');
                }
                
                // Submit to database using service
                const result = await practiceSubmissionsService.submitSolution(submissionData);
                
                if (result.success) {
                    console.log('Submission successful:', result.data);
                    
                    // Update leaderboard only if user hasn't earned points before
                    if (pointsCheck.success && !pointsCheck.hasEarned) {
                        try {
                            // Check if user has a leaderboard entry
                            const entryResult = await leaderboardService.getLeaderboardEntry(userData.id);
                            
                            let leaderboardResult;
                            if (entryResult.success && entryResult.data) {
                                // User exists, update their entry
                                leaderboardResult = await leaderboardService.updateLeaderboardEntry(userData.id, problem?.points || 0);
                            } else {
                                // User doesn't exist, create new entry
                                leaderboardResult = await leaderboardService.createLeaderboardEntry(userData.id, problem?.points || 0);
                            }
                            
                            if (leaderboardResult.success) {
                                console.log('Leaderboard updated successfully:', leaderboardResult.data);
                            } else {
                                console.error('Leaderboard update failed:', leaderboardResult.error);
                            }
                        } catch (leaderboardError) {
                            console.error('Error updating leaderboard:', leaderboardError);
                            // Don't fail the submission if leaderboard update fails
                        }
                    } else {
                        console.log('Skipping leaderboard update - user already earned points for this problem');
                    }
                    
                    // Show success dialog and set navigation flag
                    setShouldNavigate(true);
                    showSuccess('Success!', `Congratulations! 🎉\n\nYour solution has been submitted successfully!\nYou earned ${problem?.points || 0} points!`);
                } else {
                    console.error('Submission error:', result.error);
                    showError('Submission Error', 'Error submitting solution: ' + result.error);
                }
            } else {
                // Output doesn't match
                console.log('Output does not match');
                setOutput(`Wrong Answer!\n\nYour output:\n${userOutput}\n\nExpected output:\n${expectedOutput}`);
                showError('Wrong Answer', 'Your output does not match the expected output.\n\nPlease check your code and try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setOutput('Error: ' + error.message);
            showError('Error', 'Error submitting solution: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
        return false;
    };

    // Piston API execution function
    const executeCodeWithPiston = async (code, language) => {
        console.log('=== EXECUTE CODE WITH PISTON START ===');
        console.log('Executing code with language:', language);
        console.log('Code to execute:', code);
        
        const languageMap = {
            'python': 'python',
            'javascript': 'javascript',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'go': 'go',
            'rust': 'rust'
        };

        const runtime = languageMap[language] || languageMap['python'];
        console.log('Using runtime:', runtime);

        // Prepare code based on language
        let preparedCode = code;
        let filename = 'main';
        
        if (language === 'java') {
            // Java requires class name to match the file name
            filename = 'Main';
            // Extract class name from code or use 'Main'
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            if (classMatch) {
                filename = classMatch[1];
            }
            console.log('Java filename:', filename);
        } else if (language === 'c') {
            // C might need specific filename
            filename = 'main';
            console.log('C filename:', filename);
        } else if (language === 'javascript') {
            // JavaScript might need specific filename
            filename = 'main';
            console.log('JavaScript filename:', filename);
        }

        // Handle multi-line input properly
        let stdinInput = customInput.trim() || problem?.sample_input || '';
        
        console.log('Problem data:', problem);
        console.log('Original sample input:', problem?.sample_input);
        console.log('Sample input type:', typeof problem?.sample_input);
        console.log('Sample input length:', problem?.sample_input?.length);
        console.log('Current language:', language);
        console.log('Current stdinInput before processing:', stdinInput);
        
        // Auto-format input for different language requirements
        if (language === 'javascript' && typeof stdinInput === 'string') {
            console.log('Processing JavaScript input...');
            // For JavaScript, handle different input formats
            const lines = stdinInput.trim().split('\n');
            console.log('JavaScript input lines:', lines);
            console.log('JavaScript line count:', lines.length);
            console.log('JavaScript lines array:', JSON.stringify(lines));
            
            // Smart auto-formatting: detect expected format from user's code
            let needsFormatting = false;
            let formattedInput = stdinInput;
            
            // Check if code expects multi-line input (readline interface)
            const expectsMultiLine = code.includes('readline') || code.includes('inputLines');
            console.log('Code expects multi-line input:', expectsMultiLine);
            
            if (lines.length === 1 && expectsMultiLine) {
                // Single line input but code expects multi-line - convert to multi-line
                const parts = lines[0].trim().split(' ');
                console.log('JavaScript single line parts:', parts);
                console.log('JavaScript parts count:', parts.length);
                console.log('JavaScript parts array:', JSON.stringify(parts));
                
                if (parts.length > 2) {
                    // If we have multiple parts, format as multi-line for JavaScript
                    // Example: "3 3 2 5 b" -> "3\n3 2 5\nb"
                    const first = parts[0];
                    const middle = parts.slice(1, -1).join(' ');
                    const last = parts[parts.length - 1];
                    formattedInput = `${first}\n${middle}\n${last}`;
                    needsFormatting = true;
                    console.log('Auto-formatted single-line to multi-line JavaScript input:', formattedInput);
                } else {
                    console.log('JavaScript input does not need formatting');
                }
            } else if (lines.length >= 3 && expectsMultiLine) {
                // Multi-line input - check if it matches expected format
                console.log('JavaScript has multi-line input, checking format...');
                
                // Expected format: line 0 = number, line 1 = marks, line 2 = gender
                if (lines.length === 3) {
                    console.log('JavaScript input is already 3-line, no formatting needed');
                } else {
                    // Convert to 3-line format (first line, middle lines, last line)
                    const first = lines[0];
                    const middle = lines.slice(1, -1).join(' ');
                    const last = lines[lines.length - 1];
                    formattedInput = `${first}\n${middle}\n${last}`;
                    needsFormatting = true;
                    console.log('Auto-formatted multi-line to 3-line JavaScript input:', formattedInput);
                }
            } else {
                console.log('JavaScript input format does not match code expectations');
            }
            
            if (needsFormatting) {
                stdinInput = formattedInput;
            }
            
            console.log('Final JavaScript input after processing:', stdinInput);
        } else if (language === 'python' && typeof stdinInput === 'string') {
            console.log('Processing Python input...');
            // For Python, handle different input formats
            const lines = stdinInput.trim().split('\n');
            console.log('Python input lines:', lines);
            console.log('Python line count:', lines.length);
            console.log('Python lines array:', JSON.stringify(lines));
            
            if (lines.length === 1) {
                // Single line input - check if it needs to be split into multiple lines
                const parts = lines[0].trim().split(' ');
                console.log('Python single line parts:', parts);
                console.log('Python parts count:', parts.length);
                
                if (parts.length > 2) {
                    // If we have multiple parts, format as multi-line for Python
                    // Example: "3 3 2 5 b" -> "3\n3 2 5\nb"
                    const first = parts[0];
                    const middle = parts.slice(1, -1).join(' ');
                    const last = parts[parts.length - 1];
                    stdinInput = `${first}\n${middle}\n${last}`;
                    console.log('Auto-formatted Python input:', stdinInput);
                } else {
                    console.log('Python input does not need formatting');
                }
            } else if (lines.length === 5) {
                // 5-line input - convert to 3-line format
                // Example: "3\n3\n2\n5\nb" -> "3\n3 2 5\nb"
                const first = lines[0];
                const middle = lines.slice(1, -1).join(' ');
                const last = lines[lines.length - 1];
                stdinInput = `${first}\n${middle}\n${last}`;
                console.log('Auto-formatted 5-line to 3-line Python input:', stdinInput);
            } else if (lines.length === 3) {
                // Already 3-line input - no formatting needed
                console.log('Python input is already 3-line, no formatting needed');
            } else {
                console.log('Python input has unexpected line count:', lines.length);
            }
        } else if (language === 'java' && typeof stdinInput === 'string') {
            console.log('Processing Java input...');
            // For Java, handle different input formats
            const lines = stdinInput.trim().split('\n');
            console.log('Java input lines:', lines);
            console.log('Java line count:', lines.length);
            
            if (lines.length === 1) {
                // Single line input - check if it needs to be split into multiple lines
                const parts = lines[0].trim().split(' ');
                console.log('Java single line parts:', parts);
                console.log('Java parts count:', parts.length);
                
                if (parts.length > 2) {
                    // If we have multiple parts, format as multi-line for Java
                    // Example: "3 3 2 5 b" -> "3\n3 2 5\nb"
                    const first = parts[0];
                    const middle = parts.slice(1, -1).join(' ');
                    const last = parts[parts.length - 1];
                    stdinInput = `${first}\n${middle}\n${last}`;
                    console.log('Auto-formatted Java input:', stdinInput);
                } else {
                    console.log('Java input does not need formatting');
                }
            } else if (lines.length === 5) {
                // 5-line input - convert to 3-line format
                // Example: "3\n3\n2\n5\nb" -> "3\n3 2 5\nb"
                const first = lines[0];
                const middle = lines.slice(1, -1).join(' ');
                const last = lines[lines.length - 1];
                stdinInput = `${first}\n${middle}\n${last}`;
                console.log('Auto-formatted 5-line to 3-line Java input:', stdinInput);
            } else if (lines.length === 3) {
                // Already 3-line input - no formatting needed
                console.log('Java input is already 3-line, no formatting needed');
            } else {
                console.log('Java input has unexpected line count:', lines.length);
            }
        } else if (language === 'cpp' && typeof stdinInput === 'string') {
            console.log('Processing C++ input...');
            // For C++, handle different input formats
            const lines = stdinInput.trim().split('\n');
            console.log('C++ input lines:', lines);
            console.log('C++ line count:', lines.length);
            
            if (lines.length === 1) {
                // Single line input - check if it needs to be split into multiple lines
                const parts = lines[0].trim().split(' ');
                console.log('C++ single line parts:', parts);
                console.log('C++ parts count:', parts.length);
                
                if (parts.length > 2) {
                    // If we have multiple parts, format as multi-line for C++
                    // Example: "3 3 2 5 b" -> "3\n3 2 5\nb"
                    const first = parts[0];
                    const middle = parts.slice(1, -1).join(' ');
                    const last = parts[parts.length - 1];
                    stdinInput = `${first}\n${middle}\n${last}`;
                    console.log('Auto-formatted C++ input:', stdinInput);
                } else {
                    console.log('C++ input does not need formatting');
                }
            } else if (lines.length === 5) {
                // 5-line input - convert to 3-line format
                // Example: "3\n3\n2\n5\nb" -> "3\n3 2 5\nb"
                const first = lines[0];
                const middle = lines.slice(1, -1).join(' ');
                const last = lines[lines.length - 1];
                stdinInput = `${first}\n${middle}\n${last}`;
                console.log('Auto-formatted 5-line to 3-line C++ input:', stdinInput);
            } else if (lines.length === 3) {
                // Already 3-line input - no formatting needed
                console.log('C++ input is already 3-line, no formatting needed');
            } else {
                console.log('C++ input has unexpected line count:', lines.length);
            }
        } else if (language === 'c' && typeof stdinInput === 'string') {
            console.log('Processing C input...');
            // For C, handle different input formats
            const lines = stdinInput.trim().split('\n');
            console.log('C input lines:', lines);
            console.log('C line count:', lines.length);
            
            if (lines.length === 1) {
                // Single line input - check if it needs to be split into multiple lines
                const parts = lines[0].trim().split(' ');
                console.log('C single line parts:', parts);
                console.log('C parts count:', parts.length);
                
                if (parts.length > 2) {
                    // If we have multiple parts, format as multi-line for C
                    // Example: "3 3 2 5 b" -> "3\n3 2 5\nb"
                    const first = parts[0];
                    const middle = parts.slice(1, -1).join(' ');
                    const last = parts[parts.length - 1];
                    stdinInput = `${first}\n${middle}\n${last}`;
                    console.log('Auto-formatted C input:', stdinInput);
                } else {
                    console.log('C input does not need formatting');
                }
            } else if (lines.length === 5) {
                // 5-line input - convert to 3-line format
                // Example: "3\n3\n2\n5\nb" -> "3\n3 2 5\nb"
                const first = lines[0];
                const middle = lines.slice(1, -1).join(' ');
                const last = lines[lines.length - 1];
                stdinInput = `${first}\n${middle}\n${last}`;
                console.log('Auto-formatted 5-line to 3-line C input:', stdinInput);
            } else if (lines.length === 3) {
                // Already 3-line input - no formatting needed
                console.log('C input is already 3-line, no formatting needed');
            } else {
                console.log('C input has unexpected line count:', lines.length);
            }
        } else {
            console.log('Not processing input for language:', language);
        }
        
        const requestBody = {
            language: runtime,
            version: '*',
            files: [
                {
                    name: filename,
                    content: preparedCode
                }
            ],
            stdin: stdinInput
        };
        
        console.log('Final stdin input being sent:', JSON.stringify(stdinInput));
        console.log('Request body stdin:', JSON.stringify(requestBody.stdin));

        try {
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const result = await response.json();
            console.log('Full API response:', JSON.stringify(result, null, 2));
            console.log('Response type:', typeof result);
            console.log('Response keys:', Object.keys(result));
            console.log('Response structure analysis:');
            console.log('- result.run exists:', !!result.run);
            console.log('- result.compile exists:', !!result.compile);
            
            if (result.run) {
                console.log('- result.run type:', typeof result.run);
                console.log('- result.run keys:', Object.keys(result.run));
                console.log('- result.run values:', {
                    output: result.run.output,
                    stdout: result.run.stdout,
                    stderr: result.run.stderr,
                    code: result.run.code,
                    signal: result.run.signal,
                    exit_code: result.run.exit_code
                });
            }
            
            if (result.compile) {
                console.log('- result.compile type:', typeof result.compile);
                console.log('- result.compile keys:', Object.keys(result.compile));
                console.log('- result.compile values:', {
                    stdout: result.compile.stdout,
                    stderr: result.compile.stderr,
                    code: result.compile.code,
                    signal: result.compile.signal
                });
            }
            
            // Check for compilation errors
            if (result.compile && result.compile.code !== 0) {
                console.log('Compilation error details:', result.compile);
                console.log('Compilation error stderr:', result.compile.stderr);
                console.log('Compilation error stdout:', result.compile.stdout);
                return { output: 'Compilation Error:\n' + result.compile.stderr };
            }
            
            // Check for runtime errors
            if (result.run && result.run.stderr) {
                console.log('Runtime error:', result.run.stderr);
                return { output: 'Runtime Error:\n' + result.run.stderr };
            }
            
            // Extract output properly - try multiple possible fields
            let output = 'No output generated';
            if (result.run) {
                // Try different output fields that Piston might use
                console.log('Checking output fields...');
                console.log('- result.run.output:', result.run.output);
                console.log('- result.run.stdout:', result.run.stdout);
                console.log('- result.run.code:', result.run.code);
                console.log('- result.run.exit_code:', result.run.exit_code);
                console.log('- result.run.signal:', result.run.signal);
                
                output = result.run.stdout || 
                         result.run.output || 
                         result.run.code ||
                         'Code executed but no output captured';
                         
                console.log('Selected output:', output);
            }
            
            console.log('Final output:', output);
            console.log('Execution time:', result.run ? result.run.time : 'N/A');
            console.log('Memory usage:', result.run ? result.run.memory : 'N/A');
            
            return { 
                output: output,
                time: result.run ? result.run.time : 0,
                memory: result.run ? result.run.memory : 0
            };
        } catch (error) {
            console.error('API call failed:', error);
            return { output: 'API Error: ' + error.message };
        }
    };

    // Update line numbers when code changes
    useEffect(() => {
        const newLineNumbers = generateLineNumbers(code);
        setLineNumbers(newLineNumbers);
        console.log('Line numbers updated:', newLineNumbers);
        console.log('Current code length:', code.split('\n').length);
        console.log('Current code:', code);
    }, [code]);

    // Track output changes for debugging
    useEffect(() => {
        console.log('Output state changed:', output);
        console.log('Output length:', output.length);
    }, [output]);

    // Synchronize scrolling between line numbers and code
    useEffect(() => {
        const lineNumbersContainer = document.querySelector('.line-numbers');
        const codeTextarea = document.querySelector('.code-textarea');
        
        if (lineNumbersContainer && codeTextarea) {
            const handleCodeScroll = () => {
                lineNumbersContainer.scrollTop = codeTextarea.scrollTop;
            };
            
            codeTextarea.addEventListener('scroll', handleCodeScroll);
            
            return () => {
                codeTextarea.removeEventListener('scroll', handleCodeScroll);
            };
        }
    }, []);

    if (loading || problemLoading) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>{loading ? 'Loading user...' : 'Loading problem...'}</p>
                    </div>
                </main>
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
                            <input type="text" placeholder="Search problems..." />
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
                        <div className="balance" data-tooltip="Reward Coins">
                            <FaCoins className="balance-icon" />
                            <span>{userScore.toFixed(2)}</span>
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

                <div className="sp-content">
                    {/* Problem Navbar */}
                    <div className="sp-navbar">
                        <div className="sp-navbar-left">
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to practice');
                                navigate('/practice');
                            }}>
                                Problems
                            </button>
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to submissions for problem:', problemId);
                                navigate(`/practice/submissions/${problemId}`);
                            }}>
                                Submissions
                            </button>
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to editorial for problem:', problemId);
                                navigate(`/practice/editorial/${problemId}`);
                            }}>
                                Editorial
                            </button>
                            <button className="sp-nav-btn" onClick={() => {
                                console.log('Navigating to leaderboard for problem:', problemId);
                                navigate(`/practice/leaderboard/${problemId}`);
                            }}>
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Problem Header */}
                    <div className="sp-header">
                        <div className="sp-title-section">
                            <h1 className="sp-title">{problem?.problem_title || 'Loading Problem...'}</h1>
                            <div className="sp-meta">
                                <span className={`difficulty-badge ${problem?.difficulty?.toLowerCase()}`}>
                                    {problem?.difficulty}
                                </span>
                                <span className="points">+{problem?.points || 0} points</span>
                            </div>
                        </div>
                    </div>

                    <div className="sp-main-layout">
                        {/* Left Column - Problem Sections */}
                        <div className="sp-problems-column">
                            {/* Problem Description */}
                            <div className="sp-problem-section">
                                <div className="sp-section-header">
                                    <h2>Problem Description</h2>
                                </div>
                                <div className="sp-problem-content">
                                    <div className="sp-problem-statement">
                                        <p>{problem?.problem_description || 'Problem description loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Input Format */}
                            <div className="sp-problem-section">
                                <div className="sp-section-header">
                                    <h2>Input Format</h2>
                                </div>
                                <div className="sp-problem-content">
                                    <div className="sp-input-format">
                                        <p>{problem?.problem_input || 'Input format information loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Output Format */}
                            <div className="sp-problem-section">
                                <div className="sp-section-header">
                                    <h2>Output Format</h2>
                                </div>
                                <div className="sp-problem-content">
                                    <div className="sp-output-format">
                                        <p>{problem?.problem_output || 'Output format information loading...'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Input and Output */}
                            <div className="sp-problem-section">
                                <div className="sp-section-header">
                                    <h2>Sample Input & Output</h2>
                                </div>
                                <div className="sp-problem-content">
                                    <div className="sp-samples">
                                        <div className="sp-sample-section">
                                            <h3>Sample Input</h3>
                                            <div className="sp-sample-box">
                                                <pre>{problem?.sample_input || 'Sample input loading...'}</pre>
                                            </div>
                                        </div>
                                        <div className="sp-sample-section">
                                            <h3>Sample Output</h3>
                                            <div className="sp-sample-box">
                                                <pre>{problem?.sample_output || 'Sample output loading...'}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Code Editor */}
                        <div className="sp-editor-section">
                            <div className="sp-editor-header">
                                <div className="sp-editor-left">
                                    <div className="language-selector">
                                        <label>Write Language:</label>
                                        <select 
                                            className="language-select"
                                            value={selectedLanguage}
                                            onChange={(e) => {
                                                const newLanguage = e.target.value;
                                                setSelectedLanguage(newLanguage);
                                                setCode(getCodeTemplate(newLanguage));
                                            }}
                                        >
                                            <option value="cpp">C++</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="c">C</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="sp-editor-actions">
                                    <div className="run-icon-container" onClick={runCode}>
                                        <FaPlayCircle className={`run-icon ${isRunning ? 'running' : ''}`} />
                                        <span className="run-text">{isRunning ? 'Running...' : 'Run'}</span>
                                    </div>
                                    <div className="submit-icon-container" onClick={submitSolution}>
                                        <FaTrophy className={`submit-icon ${isSubmitting ? 'submitting' : ''}`} />
                                        <span className="submit-text">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="sp-editor-container">
                                <div className="sp-editor">
                                    <div className="code-editor-container">
                                        <textarea
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="code-textarea"
                                            placeholder="Write your code here..."
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sp-input-section">
                                <h3>Custom Input</h3>
                                <div className="input-container">
                                    <textarea
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        className="custom-input-textarea"
                                        placeholder="Enter custom input here (leave empty to use sample input)..."
                                        spellCheck={false}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="sp-output">
                                <h3>Output</h3>
                                <div className="output-content">
                                    <pre>{output}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="success-dialog-overlay">
                    <div className="success-dialog">
                        <div className="success-dialog-header">
                            <h3>{dialogTitle}</h3>
                            <button className="close-btn" onClick={closeSuccessDialog}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="success-dialog-body">
                            <div className="success-icon">
                                <FaCheckCircle />
                            </div>
                            <p>{dialogMessage}</p>
                        </div>
                        <div className="success-dialog-footer">
                            <button className="success-ok-btn" onClick={closeSuccessDialog}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Dialog */}
            {showErrorDialog && (
                <div className="error-dialog-overlay">
                    <div className="error-dialog">
                        <div className="error-dialog-header">
                            <h3>{dialogTitle}</h3>
                            <button className="close-btn" onClick={closeErrorDialog}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="error-dialog-body">
                            <div className="error-icon">
                                <FaExclamationTriangle />
                            </div>
                            <p>{dialogMessage}</p>
                        </div>
                        <div className="error-dialog-footer">
                            <button className="error-ok-btn" onClick={closeErrorDialog}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolveProblem;
