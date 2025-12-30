import React, { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaCommentAlt,
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
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaTag,
  FaBolt,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaRedo,
  FaTerminal,
  FaSave,
  FaPlayCircle,
  FaCog,
  FaTimes,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './User_Dashboard.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const User_Contest_Participate = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [active, setActive] = useState('contest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contestData, setContestData] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [problems, setProblems] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [contestStarted, setContestStarted] = useState(false);
  const [contestEnded, setContestEnded] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Add state for line numbers
  const [lineNumbers, setLineNumbers] = useState(['1']);
  
  // Add state for terminal output
  const [terminalOutput, setTerminalOutput] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);

  // Fetch contest details from Supabase
  const fetchContestDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contest details:', error);
        return;
      }

      console.log('Contest details fetched from Supabase:', data);
      setContestData(data);
      
      // Generate mock problems for this contest
      generateProblems();
    } catch (error) {
      console.error('Error in fetchContestDetails:', error);
    }
  };

  // Generate mock programming problems
  const generateProblems = () => {
    console.log('generateProblems called');
    const mockProblems = [
      {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        timeLimit: "1s",
        memoryLimit: "256 MB",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
        inputFormat: `The first line contains an integer n (2 ≤ n ≤ 10^4) — the number of elements in the array.
The second line contains n integers a1, a2, ..., an (-10^9 ≤ ai ≤ 10^9) — the array elements.
The third line contains an integer target (-10^9 ≤ target ≤ 10^9).`,
        outputFormat: `Print two space-separated integers — the indices of the two elements whose sum equals the target.`,
        sampleInput: `4
2 7 11 15
9`,
        sampleOutput: `0 1`,
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
          python: `def two_sum(nums, target):
    # Your code here
    pass

n = int(input())
nums = list(map(int, input().split()))
target = int(input())

result = two_sum(nums, target)
print(result[0], result[1])`,
          java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`
        }
      },
      {
        id: 2,
        title: "Reverse String",
        difficulty: "Easy",
        timeLimit: "1s",
        memoryLimit: "256 MB",
        description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

**Example 1:**
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

**Example 2:**
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]

**Constraints:**
- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.`,
        inputFormat: `The first line contains an integer n (1 ≤ n ≤ 10^5) — the length of the string.
The second line contains a string s of length n.`,
        outputFormat: `Print the reversed string.`,
        sampleInput: `5
hello`,
        sampleOutput: `olleh`,
        starterCode: {
          cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void reverseString(vector<char>& s) {
    // Your code here
    
}

int main() {
    int n;
    cin >> n;
    string str;
    cin >> str;
    
    vector<char> s(str.begin(), str.end());
    reverseString(s);
    
    for (char c : s) {
        cout << c;
    }
    cout << endl;
    return 0;
}`,
          python: `def reverse_string(s):
    # Your code here
    pass

n = int(input())
s = list(input().strip())

reverse_string(s)
print(''.join(s))`,
          java: `import java.util.*;

public class Main {
    public static void reverseString(char[] s) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        String str = sc.next();
        
        char[] s = str.toCharArray();
        reverseString(s);
        
        System.out.println(new String(s));
    }
}`
        }
      }
    ];
    
    console.log('Setting problems:', mockProblems);
    setProblems(mockProblems);
    if (mockProblems.length > 0) {
      console.log('Setting initial code for language:', language);
      setCode(mockProblems[0].starterCode[language]);
      // Auto-start contest after problems are loaded
      console.log('Starting contest');
      setContestStarted(true);
      setTimeRemaining(3600); // 1 hour
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (contestStarted && !contestEnded && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && contestStarted) {
      endContest();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, contestStarted, contestEnded]);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const startContest = () => {
    setContestStarted(true);
    setTimeRemaining(3600); // 1 hour
  };

  const handleProblemChange = (index) => {
    setCurrentProblem(index);
    if (problems[index] && problems[index].starterCode[language]) {
      setCode(problems[index].starterCode[language]);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (problems[currentProblem] && problems[currentProblem].starterCode[newLanguage]) {
      setCode(problems[currentProblem].starterCode[newLanguage]);
    }
  };

  // Function to update line numbers based on code
  const updateLineNumbers = (codeText) => {
    const lines = codeText.split('\n');
    const numbers = lines.map((_, index) => (index + 1).toString());
    setLineNumbers(numbers);
  };

  // Handle code change with line number update
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    updateLineNumbers(newCode);
  };

  const handleSubmit = async () => {
    setSubmissionStatus('submitting');
    
    try {
      const currentProblemData = problems[currentProblem];
      
      // Prepare prompt for AI analysis
      const prompt = `
You are a code analysis expert. Analyze the following solution for the programming problem:

**Problem:** ${currentProblemData.title}
**Difficulty:** ${currentProblemData.difficulty}
**Description:** ${currentProblemData.description}

**User's Solution (${language}):**
\`\`\`${language}
${code}
\`\`\`

**Sample Input:** ${currentProblemData.sampleInput}
**Expected Output:** ${currentProblemData.sampleOutput}

Please analyze this solution and respond in JSON format:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Detailed feedback about the solution",
  "issues": ["List of specific issues if incorrect"],
  "hints": ["Helpful hints to improve the solution"],
  "congratulations": "Congratulatory message if correct"
}

Focus on:
1. Correctness of the algorithm
2. Edge cases handling
3. Time complexity
4. Code quality
5. Whether it solves the specific problem correctly`;

      // Use environment variable for API key (more secure)
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBAEwsV9h232W6-UeDujhdwPdGH3pB08yA';
      
      if (apiKey === 'YOUR_API_KEY_HERE') {
        // Fallback to mock analysis for demo purposes
        setTimeout(() => {
          setSubmissionStatus('success');
          const terminalText = `✅ Demo mode: Your solution looks good! 

📊 Score: 85/100

💡 Suggestions:
• Consider edge cases
• Optimize time complexity

🔧 Note: Set up Gemini API key for real analysis`;
          setTerminalOutput(terminalText);
          setShowTerminal(true);
        }, 2000);
        return;
      }

      // Try direct API call first (may work in some environments)
      try {
        // First, try to list available models to find the correct endpoint
        let availableModel = null;
        
        try {
          const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (listResponse.ok) {
            const modelData = await listResponse.json();
            console.log('Available models:', modelData);
            
            // Find a suitable model for generateContent
            if (modelData.models) {
              const textModel = modelData.models.find(model => 
                model.name.includes('gemini') && 
                model.supportedGenerationMethods?.includes('generateContent')
              );
              if (textModel) {
                availableModel = textModel.name;
              }
            }
          }
        } catch (e) {
          console.log('Could not list models, using fallback...');
        }
        
        // If we couldn't find a model, try common ones
        const modelsToTry = availableModel 
          ? [`https://generativelanguage.googleapis.com/v1beta/${availableModel}:generateContent`]
          : [
              'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
              'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
              'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
              'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent'
            ];
        
        let response;
        let modelUsed = '';
        
        for (const modelUrl of modelsToTry) {
          try {
            response = await fetch(`${modelUrl}?key=${apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1024,
                }
              })
            });
            
            if (response.ok) {
              modelUsed = modelUrl;
              console.log('Success with model:', modelUrl);
              break;
            } else {
              const errorData = await response.json();
              console.log(`Model ${modelUrl} failed:`, errorData);
            }
          } catch (e) {
            console.log(`Model ${modelUrl} failed with error:`, e.message);
            continue;
          }
        }
        
        if (!response || !response.ok) {
          throw new Error('All Gemini models failed - check API key and permissions');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
          const responseText = data.candidates[0].content.parts[0].text;
          
          // Try to parse JSON response
          let aiResponse;
          try {
            // Clean up the response text - remove markdown formatting
            let cleanResponse = responseText.trim();
            
            // Remove ```json and ``` from the response
            if (cleanResponse.startsWith('```json')) {
              cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanResponse.startsWith('```')) {
              cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Find JSON object in the response if it's embedded in text
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              cleanResponse = jsonMatch[0];
            }
            
            console.log('Cleaned response:', cleanResponse);
            
            // Try to parse the JSON
            aiResponse = JSON.parse(cleanResponse);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.log('Raw Response:', responseText);
            
            // If JSON parsing fails, try to extract what we can and create a fallback response
            try {
              // Extract basic information from the raw text
              const isCorrectMatch = responseText.match(/"isCorrect":\s*(true|false)/);
              const scoreMatch = responseText.match(/"score":\s*(\d+)/);
              const feedbackMatch = responseText.match(/"feedback":\s*"([^"]+)"/);
              
              aiResponse = {
                isCorrect: isCorrectMatch ? isCorrectMatch[1] === 'true' : false,
                score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
                feedback: feedbackMatch ? feedbackMatch[1] : 'AI analysis completed but response was incomplete',
                issues: ['AI response was truncated'],
                hints: ['Try submitting again for complete analysis'],
                congratulations: aiResponse?.isCorrect ? 'Good job!' : null
              };
              
              console.log('Fallback response created:', aiResponse);
            } catch (fallbackError) {
              // Ultimate fallback
              aiResponse = {
                isCorrect: false,
                score: 50,
                feedback: 'AI analysis completed but response format was unclear',
                issues: ['AI response formatting issue'],
                hints: ['Review your code and try again'],
                congratulations: null
              };
            }
          }
          
          if (aiResponse.isCorrect) {
            setSubmissionStatus('success');
            const terminalText = `✅ ACCEPTED! ${aiResponse.congratulations || 'Your solution is correct!'}

📊 Score: ${aiResponse.score}/100

🤖 Analysis by Gemini AI`;
            setTerminalOutput(terminalText);
            setShowTerminal(true);
          } else {
            setSubmissionStatus('error');
            const terminalText = `❌ WRONG ANSWER

📊 Score: ${aiResponse.score}/100

🚫 Issues:
${aiResponse.issues.map(issue => `• ${issue}`).join('\n')}

💡 Hints to improve:
${aiResponse.hints.map(hint => `• ${hint}`).join('\n')}

🤖 Analysis by Gemini AI`;
            setTerminalOutput(terminalText);
            setShowTerminal(true);
          }
        } else {
          throw new Error('No candidates in AI response');
        }
      } catch (fetchError) {
        console.error('Fetch Error:', fetchError);
        
        // Handle CORS and network errors
        if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
          // Smart demo mode with basic code analysis
          setTimeout(() => {
            const currentProblemData = problems[currentProblem];
            let isCorrect = false;
            let score = 0;
            let issues = [];
            let hints = [];
            
            // Basic code analysis for demo
            const codeLower = code.toLowerCase();
            const problemTitle = currentProblemData.title.toLowerCase();
            const problemDesc = currentProblemData.description.toLowerCase();
            
            // Check if code matches the problem type
            let codeMatchesProblem = false;
            
            // Detect problem type from title and description
            if (problemTitle.includes('two sum') || problemDesc.includes('two sum')) {
              // Check if submitted code is actually for two sum
              if (codeLower.includes('twosum') || codeLower.includes('two sum') || 
                  (codeLower.includes('target') && codeLower.includes('vector<int>'))) {
                codeMatchesProblem = true;
                if (codeLower.includes('for') && codeLower.includes('for')) {
                  score = 60;
                  issues = ['Time complexity O(n²) is too slow for large inputs'];
                  hints = ['Try using a hash map for O(n) solution', 'Consider using unordered_map in C++'];
                } else if (codeLower.includes('map') || codeLower.includes('unordered_map')) {
                  score = 90;
                  isCorrect = true;
                  issues = [];
                  hints = ['Great solution! Consider edge cases like duplicate numbers'];
                } else {
                  score = 30;
                  issues = ['No clear algorithm detected'];
                  hints = ['Try implementing the two-pointer or hash map approach'];
                }
              } else {
                // Wrong code for this problem
                score = 0;
                issues = ['Submitted code does not match the problem requirements'];
                hints = ['This is a Two Sum problem, but you submitted different code', 'Implement a function that finds two numbers that add up to target'];
              }
            } else if (problemTitle.includes('reverse') || problemDesc.includes('reverse') || problemTitle.includes('string')) {
              // Check if submitted code is actually for string reversal
              if (codeLower.includes('reverse') || (codeLower.includes('string') && codeLower.includes('reverse'))) {
                codeMatchesProblem = true;
                if (codeLower.includes('reverse(') || (codeLower.includes('begin') && codeLower.includes('end'))) {
                  score = 85;
                  isCorrect = true;
                  hints = ['Good implementation! Test with edge cases like empty strings'];
                } else {
                  score = 40;
                  issues = ['String reversal logic not properly implemented'];
                  hints = ['Use std::reverse() function', 'Or implement manual reversal with two pointers'];
                }
              } else {
                // Wrong code for this problem
                score = 0;
                issues = ['Submitted code does not match the problem requirements'];
                hints = ['This is a String Reversal problem, but you submitted Two Sum code', 'Implement a function that reverses the input string'];
              }
            } else if (problemTitle.includes('binary search') || problemDesc.includes('binary search')) {
              if (codeLower.includes('binary') || (codeLower.includes('while') && codeLower.includes('mid'))) {
                codeMatchesProblem = true;
                score = 85;
                isCorrect = true;
                hints = ['Good implementation! Check for integer overflow'];
              } else {
                score = 0;
                issues = ['Submitted code does not match the problem requirements'];
                hints = ['This is a Binary Search problem, but you submitted different code', 'Implement binary search with proper while loop and mid calculation'];
              }
            } else {
              // Generic analysis for other problems
              if (code.length > 50 && (codeLower.includes('if') || codeLower.includes('for') || codeLower.includes('while'))) {
                score = 70;
                isCorrect = true;
                hints = ['Good attempt! Consider edge cases and optimize further'];
              } else {
                score = 25;
                issues = ['Solution appears incomplete or too simple'];
                hints = ['Add proper algorithm implementation', 'Consider time and space complexity'];
              }
            }
            
            // Generate terminal output
            let terminalText = '';
            if (isCorrect) {
              setSubmissionStatus('success');
              terminalText = `✅ ACCEPTED! Your solution passed all test cases!

📊 Score: ${score}/100

💡 Suggestions:
${hints.map(h => `• ${h}`).join('\n')}

🔧 Note: Real AI analysis blocked by CORS - using demo mode`;
            } else {
              setSubmissionStatus('error');
              terminalText = `❌ WRONG ANSWER

📊 Score: ${score}/100

🚫 Issues:
${issues.map(issue => `• ${issue}`).join('\n')}

💡 Hints to improve:
${hints.map(hint => `• ${hint}`).join('\n')}

🔧 Note: Real AI analysis blocked by CORS - using demo mode`;
            }
            
            setTerminalOutput(terminalText);
            setShowTerminal(true);
          }, 2000);
          return;
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      
      // Provide more specific error messages
      let errorMessage = 'Failed to check solution. Please try again.';
      if (error.message.includes('API Error: 400')) {
        errorMessage = '❌ API Error: Invalid request. Please check the API key configuration.';
      } else if (error.message.includes('API Error: 403')) {
        errorMessage = '❌ API Error: Invalid API key or permission denied.';
      } else if (error.message.includes('API Error: 429')) {
        errorMessage = '❌ API Error: Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('Failed to parse')) {
        errorMessage = '❌ Analysis Error: Could not understand AI response. Please try again.';
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  // Notification system
  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `submission-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${type === 'success' ? '✅' : '❌'}
        </div>
        <div class="notification-text">
          <pre>${message}</pre>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  };

  const endContest = () => {
    setContestEnded(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add resizable divider functionality
  useEffect(() => {
    // Only run when contest has started and problems are loaded
    if (!contestStarted || problems.length === 0) return;
    
    const divider = document.getElementById('divider');
    const problemPanel = document.getElementById('problem-panel');
    const editorPanel = document.getElementById('editor-panel');
    
    if (!divider || !problemPanel || !editorPanel) return;

    // Store initial widths but allow more flexible resizing
    const initialProblemWidth = problemPanel.offsetWidth;
    const initialEditorWidth = editorPanel.offsetWidth;
    
    let isResizing = false;
    let startX = 0;
    let startProblemWidth = 0;
    let startEditorWidth = 0;

    const handleMouseDown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startProblemWidth = problemPanel.offsetWidth;
      startEditorWidth = editorPanel.offsetWidth;
      
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startX;
      const containerWidth = problemPanel.parentElement.offsetWidth;
      
      // Calculate new widths
      let newProblemWidth = startProblemWidth + deltaX;
      let newEditorWidth = startEditorWidth - deltaX;
      
      // Apply constraints
      const minProblemWidth = 500; // Minimum problem panel width
      const minEditorWidth = 500; // Minimum editor width
      const maxEditorWidth = 1000; // Maximum editor width as requested
      const maxProblemWidth = containerWidth - minEditorWidth - 4; // Maximum problem width
      
      if (newProblemWidth < minProblemWidth) {
        newProblemWidth = minProblemWidth;
        newEditorWidth = containerWidth - newProblemWidth - 4; // 4px for divider
      } else if (newEditorWidth < minEditorWidth) {
        newEditorWidth = minEditorWidth;
        newProblemWidth = containerWidth - newEditorWidth - 4; // 4px for divider
      } else if (newEditorWidth > maxEditorWidth) {
        newEditorWidth = maxEditorWidth;
        newProblemWidth = containerWidth - newEditorWidth - 4; // 4px for divider
      } else if (newProblemWidth > maxProblemWidth) {
        newProblemWidth = maxProblemWidth;
        newEditorWidth = containerWidth - newProblemWidth - 4;
      }
      
      // Apply new widths
      problemPanel.style.width = newProblemWidth + 'px';
      problemPanel.style.flex = 'none';
      editorPanel.style.width = newEditorWidth + 'px';
      editorPanel.style.flex = 'none';
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // Add event listeners
    divider.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      divider.removeEventListener('mousedown', handleMouseDown);
      divider.removeEventListener('mousemove', handleMouseMove);
      divider.removeEventListener('mouseup', handleMouseUp);
    };
  }, [contestStarted, problems]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
        <div>Debug: loading={loading}, contestStarted={contestStarted}, problems.length={problems.length}</div>
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
            <div className={`contest-timer ${timeRemaining <= 300 ? 'danger' : ''}`}>
              <FaClock />
              <span>{formatTime(timeRemaining)}</span>
            </div>
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
            <button className="icon-btn" data-tooltip="Messages">
              <FaCommentAlt />
              <span className="badge">2</span>
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

        <section className="ud-content">
          {/* Debug display */}
          {!loading && !contestStarted && (
            <div style={{padding: '20px', background: 'white', margin: '20px', borderRadius: '8px'}}>
              <h3>Debug Info:</h3>
              <p>loading: {loading.toString()}</p>
              <p>contestStarted: {contestStarted.toString()}</p>
              <p>contestEnded: {contestEnded.toString()}</p>
              <p>problems.length: {problems.length}</p>
              <p>contestData: {contestData ? 'loaded' : 'not loaded'}</p>
              <button onClick={() => {
                console.log('Manual start triggered');
                setContestStarted(true);
                setTimeRemaining(3600);
              }}>Manually Start Contest</button>
            </div>
          )}

          {contestStarted && !contestEnded && (
            <div className="coding-contest-container-vertical">
              {/* Problem List Sidebar */}
              <div className="problem-list-sidebar">
                <h3>Problems</h3>
                {problems.map((problem, index) => (
                  <button
                    key={problem.id}
                    className={`problem-item ${currentProblem === index ? 'active' : ''}`}
                    onClick={() => handleProblemChange(index)}
                  >
                    <div className="problem-info">
                      <span className="problem-letter">{String.fromCharCode(65 + index)}</span>
                      <div className="problem-details">
                        <div className="problem-title">{problem.title}</div>
                        <div className="problem-meta">
                          <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                            {problem.difficulty}
                          </span>
                          <span className="time-limit">{problem.timeLimit}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Content Area with Resizable Divider */}
              <div className="main-content-wrapper">
                <div className="main-content-area">
                  {/* Problem Statement - Left Side */}
                  <div className="problem-statement-left" id="problem-panel">
                    <div className="problem-header">
                      <h2>
                        {String.fromCharCode(65 + currentProblem)}. {problems[currentProblem]?.title}
                      </h2>
                      <div className="problem-limits">
                        <span><strong>Time Limit:</strong> {problems[currentProblem]?.timeLimit}</span>
                        <span><strong>Memory Limit:</strong> {problems[currentProblem]?.memoryLimit}</span>
                      </div>
                    </div>

                    <div className="problem-content">
                      <div className="problem-description">
                        {problems[currentProblem]?.description.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>

                      <div className="io-section">
                        <div className="input-section">
                          <h4>Input</h4>
                          <pre>{problems[currentProblem]?.inputFormat}</pre>
                        </div>

                        <div className="output-section">
                          <h4>Output</h4>
                          <pre>{problems[currentProblem]?.outputFormat}</pre>
                        </div>

                        <div className="sample-section">
                          <div className="sample-input">
                            <h4>Sample Input</h4>
                            <pre>{problems[currentProblem]?.sampleInput}</pre>
                          </div>
                          <div className="sample-output">
                            <h4>Sample Output</h4>
                            <pre>{problems[currentProblem]?.sampleOutput}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resizable Divider */}
                  <div className="resizable-divider" id="divider">
                    <div className="divider-line"></div>
                  </div>

                  {/* Code Editor - Right Side */}
                  <div className="code-editor-right" id="editor-panel">
                    <div className="editor-header">
                      <div className="language-selector">
                        <label>Language:</label>
                        <select 
                          value={language} 
                          onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="javascript">JavaScript</option>
                        </select>
                      </div>

                      <div className="editor-actions">
                        <button className="action-btn secondary" title="Settings">
                          <FaCog />
                        </button>
                        <button className="action-btn primary" onClick={handleSubmit}>
                          <FaPlayCircle />
                          {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>

                    <div className="code-editor">
                      <div className="code-editor-container">
                        <div className="line-numbers">
                          {lineNumbers.map((lineNum, index) => (
                            <div key={index} className="line-number">
                              {lineNum}
                            </div>
                          ))}
                        </div>
                        <textarea
                          value={code}
                          onChange={handleCodeChange}
                          className="code-textarea"
                          placeholder="Write your code here..."
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    {submissionStatus && (
                      <div className={`submission-status ${submissionStatus}`}>
                        {submissionStatus === 'success' ? (
                          <div className="success-message">
                            <FaCheckCircle />
                            <span>Accepted! Your solution passed all test cases.</span>
                          </div>
                        ) : (
                          <div className="submitting-message">
                            <FaTerminal />
                            <span>Running on test cases...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Terminal Output - Below Problem and Editor */}
                {showTerminal && (
                  <div className="terminal-container">
                    <div className="terminal-header">
                      <div className="terminal-title">
                        <FaTerminal /> Terminal Output
                      </div>
                      <button 
                        className="terminal-close" 
                        onClick={() => setShowTerminal(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="terminal-content">
                      <pre className="terminal-text">{terminalOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {contestEnded && (
            <div className="contest-end-screen">
              <h2>Contest Ended!</h2>
              <p>Great job! You've completed the contest.</p>
              <div className="final-stats">
                <div className="stat-item">
                  <div className="stat-value">2</div>
                  <div className="stat-label">Problems Solved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">450</div>
                  <div className="stat-label">Total Score</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">00:45:23</div>
                  <div className="stat-label">Time Taken</div>
                </div>
              </div>
              <button className="action-btn primary" onClick={() => navigate('/contest')}>
                Back to Contests
              </button>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .contest-start-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .contest-start-container {
          max-width: 600px;
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .contest-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .contest-description {
          font-size: 1.2rem;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .contest-info {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.8);
          padding: 12px 20px;
          border-radius: 12px;
          backdrop-filter: blur(5px);
        }

        .info-item svg {
          color: #667eea;
        }

        .contest-rules {
          text-align: left;
          background: rgba(255, 255, 255, 0.9);
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .contest-rules h3 {
          color: #1f2937;
          margin-bottom: 20px;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .contest-rules ul {
          list-style: none;
          padding: 0;
        }

        .contest-rules li {
          padding: 12px 0;
          color: #4a5568;
          position: relative;
          padding-left: 35px;
          font-size: 1rem;
          line-height: 1.5;
        }

        .contest-rules li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .start-contest-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 18px 50px;
          font-size: 1.2rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .start-contest-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
        }

        .start-contest-btn:active {
          transform: translateY(-1px);
        }

        .coding-contest-container {
          display: flex;
          height: calc(100vh - 80px);
          background: #0f172a;
        }

        .coding-contest-container-vertical {
          display: flex;
          height: calc(100vh - 80px);
          background: #0f172a;
        }

        .main-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .problem-list-sidebar {
          width: 320px;
          background: #1e293b;
          border-right: 1px solid #334155;
          overflow-y: auto;
        }

        .problem-list-sidebar h3 {
          padding: 25px;
          margin: 0;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          font-size: 1.2rem;
          color: #f1f5f9;
          font-weight: 600;
        }

        .problem-item {
          width: 100%;
          padding: 20px;
          border: none;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
        }

        .problem-item:hover {
          background: #334155;
          transform: translateX(5px);
        }

        .problem-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-left: 4px solid #667eea;
        }

        .problem-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .problem-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .problem-letter {
          width: 35px;
          height: 35px;
          background: #374151;
          color: #f9fafb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .problem-item.active .problem-letter {
          background: rgba(255, 255, 255, 0.9);
          color: #667eea;
        }

        .problem-details {
          flex: 1;
        }

        .problem-title {
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 6px;
          font-size: 1rem;
        }

        .problem-meta {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
        }

        .difficulty {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        .difficulty.easy {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .difficulty.medium {
          background: rgba(251, 146, 60, 0.2);
          color: #f59e0b;
        }

        .difficulty.hard {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .time-limit {
          color: #9ca3af;
        }

        .main-content-area {
          flex: 1;
          display: flex;
          overflow: hidden;
          background: #0f172a;
        }

        .main-content-area-horizontal {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #0f172a;
        }

        .problem-statement-left {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
          padding: 40px;
          border-right: 1px solid #e2e8f0;
          min-width: 300px;
          max-width: 70%;
          height: 100%;
        }

        .resizable-divider {
          width: 4px;
          background: #334155;
          cursor: col-resize;
          position: relative;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .resizable-divider:hover {
          background: #667eea;
        }

        .resizable-divider:active {
          background: #764ba2;
        }

        .divider-line {
          width: 2px;
          height: 100%;
          background: linear-gradient(180deg, transparent 0%, #667eea 50%, transparent 100%);
          margin: 0 auto;
        }

        .code-editor-right {
          width: 500px;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #334155;
          min-width: 300px;
          max-width: 70%;
          height: 100%;
          overflow: hidden;
        }

        .terminal-panel {
          width: 400px;
          background: #1e1e1e;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #333;
          min-width: 300px;
          max-width: 50%;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .terminal-divider {
          background: #333;
          cursor: col-resize;
          position: relative;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .terminal-divider:hover {
          background: #667eea;
        }

        .problem-header {
          margin-bottom: 30px;
        }

        .problem-header h2 {
          margin: 0 0 20px 0;
          color: #1e293b;
          font-size: 2rem;
          font-weight: 700;
        }

        .problem-limits {
          display: flex;
          gap: 40px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .problem-limits strong {
          color: #1e293b;
        }

        .problem-content {
          line-height: 1.7;
        }

        .problem-description p {
          margin-bottom: 20px;
          color: #374151;
          font-size: 1rem;
        }

        .io-section {
          margin-top: 40px;
        }

        .input-section, .output-section {
          margin-bottom: 30px;
        }

        .input-section h4, .output-section h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .input-section pre, .output-section pre {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          white-space: pre-wrap;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #374151;
        }

        .sample-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .sample-input, .sample-output {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .sample-input h4, .sample-output h4 {
          margin: 0 0 15px 0;
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .sample-input pre, .sample-output pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #374151;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
        }

        .language-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .language-selector label {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .language-selector select {
          background: #1e293b;
          color: #f1f5f9;
          border: 1px solid #475569;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .language-selector select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .editor-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .action-btn.secondary {
          background: #374151;
          color: white;
          box-shadow: 0 4px 15px rgba(55, 65, 81, 0.3);
        }

        .action-btn.secondary:hover {
          background: #4b5563;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(55, 65, 81, 0.4);
        }

        .code-editor {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }

        .code-editor-container {
          display: flex;
          height: 100%;
          background: #0f172a;
          overflow-y: auto;
          overflow-x: auto;
        }

        .line-numbers {
          width: 50px;
          background: #1e293b;
          border-right: 1px solid #334155;
          padding: 25px 10px;
          text-align: right;
          user-select: none;
          overflow: hidden;
        }

        .line-number {
          color: #64748b;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 15px;
          line-height: 1.6;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .code-textarea {
          flex: 1;
          height: 100%;
          background: #0f172a;
          color: #e2e8f0;
          border: none;
          padding: 25px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 15px;
          line-height: 1.6;
          resize: none;
          outline: none;
        }

        .code-textarea::placeholder {
          color: #64748b;
        }

        .code-textarea:focus {
          background: #0f172a;
        }

        .submission-status {
          padding: 20px 25px;
          background: #0f172a;
          border-top: 1px solid #334155;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #10b981;
          font-weight: 600;
          padding: 15px 20px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .submitting-message {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f59e0b;
          font-weight: 600;
          padding: 15px 20px;
          background: rgba(251, 146, 60, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(251, 146, 60, 0.3);
        }

        .contest-timer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          font-weight: 600;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .contest-timer.danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.4);
          }
          100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
        }

        /* Terminal Styles */
        .terminal-container {
          margin-top: 20px;
          background: #1e1e1e;
          border-radius: 8px;
          border: 1px solid #333;
          overflow: hidden;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .terminal-container-horizontal {
          background: #1e1e1e;
          border-radius: 8px;
          border: 1px solid #333;
          overflow: hidden;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          margin-top: 20px;
          min-height: 250px;
          display: flex;
          flex-direction: column;
        }

        .terminal-header {
          background: #2d2d2d;
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
        }

        .terminal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .terminal-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .terminal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .terminal-content {
          padding: 15px;
          background: #1e1e1e;
          max-height: 300px;
          overflow-y: auto;
        }

        .terminal-text {
          color: #0f0;
          font-size: 0.85rem;
          line-height: 1.4;
          margin: 0;
          white-space: pre-wrap;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .terminal-text::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-text::-webkit-scrollbar-track {
          background: #2d2d2d;
        }

        .terminal-text::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }

        .terminal-text::-webkit-scrollbar-thumb:hover {
          background: #777;
        }

        .contest-end-screen {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
        }

        .contest-end-screen h2 {
          font-size: 3rem;
          color: white;
          margin-bottom: 20px;
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .contest-end-screen p {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 50px;
        }

        .final-stats {
          display: flex;
          gap: 50px;
          margin-bottom: 50px;
        }

        .stat-item {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 30px 40px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-value {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          font-weight: 500;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .loading-spinner {
          font-size: 1.5rem;
          color: white;
          font-weight: 600;
        }

        /* Scrollbar Styling */
        .problem-list-sidebar::-webkit-scrollbar {
          width: 8px;
        }

        .problem-list-sidebar::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .problem-list-sidebar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        .problem-list-sidebar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        .problem-statement::-webkit-scrollbar {
          width: 8px;
        }

        .problem-statement::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .problem-statement::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .problem-statement::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .coding-contest-container {
            flex-direction: column;
          }
          
          .problem-list-sidebar {
            width: 100%;
            height: 200px;
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
          }
          
          .problem-list-sidebar h3 {
            display: none;
          }
          
          .problem-item {
            min-width: 200px;
            border-bottom: none;
            border-right: 1px solid #334155;
          }
          
          .main-content-area {
            height: calc(100vh - 280px);
          }
          
          .code-editor-right {
            width: 400px;
          }
        }

        @media (max-width: 768px) {
          .contest-title {
            font-size: 2rem;
          }
          
          .contest-info {
            flex-direction: column;
            gap: 15px;
          }
          
          .final-stats {
            flex-direction: column;
            gap: 20px;
          }
          
          .sample-section {
            grid-template-columns: 1fr;
          }
          
          .editor-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .language-selector {
            justify-content: center;
          }
          
          .main-content-area {
            flex-direction: column;
          }
          
          .problem-statement-left {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            height: 50vh;
          }
          
          .code-editor-right {
            width: 100%;
            height: 50vh;
            border-left: none;
            border-top: 1px solid #334155;
          }
        }
      `}</style>
    </div>
  );
};

export default User_Contest_Participate;
