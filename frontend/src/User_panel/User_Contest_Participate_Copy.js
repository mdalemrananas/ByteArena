import React, { useState, useEffect } from 'react';
import { Play, Eye, Edit3, Download, Copy, Settings, ChevronDown } from 'lucide-react';
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

  const [selectedProblem, setSelectedProblem] = useState(0);
  const [status, setStatus] = useState('Successfully executed');
  const [time, setTime] = useState('0.0000 secs');
  const [memory, setMemory] = useState('3.58 Mb');
  const [yourOutput, setYourOutput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

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
        const formattedProblems = data.map((question, index) => {
          return {
            id: index,
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
}`
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
    setCurrentProblem(index);
    setSelectedProblem(index);
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

  // Browser-based code execution
  const executeCode = async (code, language, input) => {
    const startTime = performance.now();
    
    try {
      let output = '';
      
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
          }
          
        } catch (error) {
          console.error('Python execution error:', error);
          output = `Error: ${error.message || error.toString()}`;
        }
      } else if (language === 'cpp' || language === 'java') {
        output = `Compilation and execution of ${language.toUpperCase()} is not supported in browser mode. Please use JavaScript or Python for instant execution, or submit your code for server-side evaluation.`;
      } else {
        output = `Language ${language} is not supported for browser execution.`;
      }
      
      const endTime = performance.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(4);
      
      return {
        output: output || 'No output',
        time: executionTime,
        memory: 'N/A',
        status: output.includes('Error') ? 'Runtime Error' : 'Successfully executed'
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
                  } else if (item.key === 'leaderboard') {
                    navigate('/leaderboard');
                  } else if (item.key === 'practice') {
                    navigate('/dashboard');
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
                borderBottom: '1px solid #34495e'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white'
                }}>Problems</h2>
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
                      >
                        <Copy size={18} />
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