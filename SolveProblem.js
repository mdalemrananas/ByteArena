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
    FaComments
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
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
    const [code, setCode] = useState(`function solve() {
    // Write your solution here
    console.log("Hello World!");
}`);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
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

    const runCode = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        console.log('Run button clicked');
        setIsRunning(true);
        setOutput('Running code...');
        setTimeout(() => {
            setOutput('Hello World!\nCode executed successfully.');
            setIsRunning(false);
        }, 2000);
        return false;
    };

    // Update line numbers when code changes
    useEffect(() => {
        const newLineNumbers = generateLineNumbers(code);
        setLineNumbers(newLineNumbers);
        console.log('Line numbers updated:', newLineNumbers);
        console.log('Current code length:', code.split('\n').length);
        console.log('Current code:', code);
    }, [code]);

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

    const submitSolution = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Submit button clicked');
        alert('Solution submitted successfully!');
    };

    // Test function to manually trigger line number update
    const testLineNumbers = () => {
        const newLineNumbers = generateLineNumbers(code);
        setLineNumbers(newLineNumbers);
        console.log('Manual test - Line numbers:', newLineNumbers);
    };

    if (loading) {
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
                        <p>Loading...</p>
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

                <div className="sp-content">
                    {/* Problem Navbar */}
                    <div className="sp-navbar">
                        <div className="sp-navbar-left">
                            <button className="sp-nav-btn active">
                                Problems
                            </button>
                            <button className="sp-nav-btn" onClick={() => navigate('/submissions')}>
                                Submissions
                            </button>
                            <button className="sp-nav-btn" onClick={() => navigate('/editorial')}>
                                Editorial
                            </button>
                            <button className="sp-nav-btn" onClick={() => navigate('/individual-leaderboard')}>
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Problem Header */}
                    <div className="sp-header">
                        <div className="sp-title-section">
                            <h1 className="sp-title">Two Sum Problem</h1>
                            <div className="sp-meta">
                                <span className="difficulty-badge medium">Medium</span>
                                <span className="points">+100 points</span>
                                <span className="success-rate">Success Rate: 75%</span>
                            </div>
                        </div>
                    </div>

                    <div className="sp-main-layout">
                        {/* Problem Description */}
                        <div className="sp-problem-section">
                            <div className="sp-section-header">
                                <h2>Problem Description</h2>
                            </div>
                            <div className="sp-problem-content">
                                <div className="sp-problem-statement">
                                    <h3>Problem Statement</h3>
                                    <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                                    
                                    <h3>Example</h3>
                                    <div className="sp-example">
                                        <p><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
                                        <p><strong>Output:</strong> [0,1]</p>
                                        <p><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                                    </div>

                                    <h3>Constraints</h3>
                                    <ul className="sp-constraints">
                                        <li>2 ≤ nums.length ≤ 10^4</li>
                                        <li>-10^9 ≤ nums[i] ≤ 10^9</li>
                                        <li>-10^9 ≤ target ≤ 10^9</li>
                                        <li>Only one valid answer exists.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className="sp-editor-section">
                            <div className="sp-editor-header">
                                <div className="sp-editor-left">
                                    <div className="language-selector">
                                        <label>Write Language:</label>
                                        <select className="language-select">
                                            <option value="cpp">C++</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                            <option value="javascript">JavaScript</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="sp-editor-actions">
                                    <div className="run-icon-container" onClick={runCode}>
                                        <FaPlayCircle className={`run-icon ${isRunning ? 'running' : ''}`} />
                                        <span className="run-text">{isRunning ? 'Running...' : 'Run'}</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={submitSolution} 
                                        className="action-btn primary"
                                    >
                                        <FaPlayCircle />
                                        {isRunning ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                            <div className="sp-editor-container">
                                <div className="sp-editor">
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
                                            onChange={(e) => setCode(e.target.value)}
                                            className="code-textarea"
                                            placeholder="Write your code here..."
                                            spellCheck={false}
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
                </div>
            </main>
        </div>
    );
};

export default SolveProblem;
