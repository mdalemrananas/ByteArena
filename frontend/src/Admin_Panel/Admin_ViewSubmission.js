import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaBars,
    FaBell,
    FaCode,
    FaCoins,
    FaCommentAlt,
    FaHome,
    FaListOl,
    FaMedal,
    FaSearch,
    FaSignOutAlt,
    FaHome as FaHomeIcon,
    FaTrophy,
    FaCode as FaCodeIcon,
    FaArrowLeft,
    FaUser,
    FaSpinner,
    FaCopy,
    FaDownload
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { 
    getSubmissionWithProblem,
    getSubmissionById,
    getProblemById,
    updateSubmissionStatus,
    updateSubmission,
    deleteSubmission,
    getSubmissionsByProblemId,
    getSubmissionsByUserId,
    searchSubmissions,
    getSubmissionStatistics,
    exportSubmissionData
} from '../services/Admin_View_Submission_Service';
import './Admin_Dashboard.css';
import './Admin_ViewSubmission.css';

const Admin_ViewSubmission = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('submissions');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState(null);
    const [submissionLoading, setSubmissionLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [error, setError] = useState(null);
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const menuItems = [
        { key: 'home', name: 'Dashboard', icon: <FaHomeIcon className="menu-icon" /> },
        { key: 'users', name: 'User Management', icon: <FaUser className="menu-icon" /> },
        { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
        { key: 'problems', name: 'Practice Problem', icon: <FaCodeIcon className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    // Fetch submission and problem data
    const fetchSubmission = async () => {
        try {
            setError(null);
            setSubmissionLoading(true);
            
            // Use the combined service function
            const result = await getSubmissionWithProblem(submissionId);
            
            if (result.success) {
                setSubmission(result.data.submission);
                setProblem(result.data.problem);
            } else {
                setError(result.error || 'Submission not found');
                console.error('Error fetching submission:', result.error);
            }
        } catch (error) {
            setError('Failed to load submission');
            console.error('Unexpected error:', error);
        } finally {
            setSubmissionLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                  displayName: currentUser.displayName || 'Admin',
                  email: currentUser.email,
                  photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Admin'}&background=random`
                });
                setLoading(false);
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchSubmission();
        }
    }, [user, submissionId]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleBack = () => {
        navigate(`/admin_submissions/${submission?.problem_id}`);
    };

    const copyToClipboard = () => {
        if (submission?.submitted_code) {
            navigator.clipboard.writeText(submission.submitted_code);
            // You could add a toast notification here
            alert('Code copied to clipboard!');
        }
    };

    const downloadCode = () => {
        if (submission?.submitted_code) {
            const blob = new Blob([submission.submitted_code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `submission_${submissionId}.${submission.language.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (loading) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                        <span className="admin-badge">ADMIN</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading submission...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
                        <span className="admin-badge">ADMIN</span>
                    </div>
                </aside>
                <main className="ud-main">
                    <div className="auth-container">
                        <h2>Please Login</h2>
                        <p>You need to be logged in to view submissions.</p>
                        <button onClick={() => navigate('/login')} className="login-btn">
                            Login
                        </button>
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
                    <span className="admin-badge">ADMIN</span>
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
                                        navigate('/admin_dashboard');
                                    } else if (item.key === 'users') {
                                        navigate('/admin_users');
                                    } else if (item.key === 'contests') {
                                        navigate('/admin_contests');
                                    } else if (item.key === 'problems') {
                                        navigate('/admin_problems');
                                    } else if (item.key === 'leaderboard') {
                                        navigate('/admin_leaderboard');
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
                            <input type="text" placeholder="Search submissions..." />
                        </div>
                    </div>
                    <div className="ud-topbar-right">
                        <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
                            <FaHome />
                        </button>
                        <div className="profile" onClick={() => navigate('/admin_profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
                            <div className="avatar">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="avatar" />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <span>{user?.displayName || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-vs-content">
                    {/* Problem Navbar */}
                    <div className="admin-vs-navbar">
                        <div className="admin-vs-navbar-left">
                            <button className="admin-vs-nav-btn" onClick={handleBack}>
                                Submissions
                            </button>
                            <button className="admin-vs-nav-btn active">
                                View Code
                            </button>
                        </div>
                    </div>

                    {/* Submission Header */}
                    <div className="admin-vs-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <div className="admin-vs-title-section">
                            <h1 className="admin-vs-title">
                                Submission #{submissionId?.slice(0, 8) || submissionId}
                            </h1>
                            <div className="admin-vs-meta">
                                <span className={`admin-vs-status-badge ${submission?.submission_status?.toLowerCase()}`}>
                                    {submission?.submission_status || 'Unknown'}
                                </span>
                                <span className="admin-vs-language">
                                    {submission?.language || 'Unknown'}
                                </span>
                                <span className="admin-vs-date">
                                    {new Date(submission?.submitted_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="admin-vs-actions">
                            <button className="admin-vs-action-btn" onClick={copyToClipboard} title="Copy to clipboard">
                                <FaCopy />
                            </button>
                            <button className="admin-vs-action-btn" onClick={downloadCode} title="Download code">
                                <FaDownload />
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Question on Left, Code on Right */}
                    <div className="admin-vs-main-layout">
                        {/* Question Section */}
                        <div className="admin-vs-question-section">
                            <div className="admin-vs-question-header">
                                <h3>Problem Information</h3>
                            </div>
                            <div className="admin-vs-question-content">
                                <div className="admin-vs-problem-title">
                                    <h4>{problem?.problem_title || submission?.problem_title || 'Unknown Problem'}</h4>
                                    <div className="admin-vs-problem-meta">
                                        <span className="admin-vs-difficulty">{problem?.difficulty || 'Medium'}</span>
                                        <span className="admin-vs-points">{problem?.points || 0} points</span>
                                        <span className="admin-vs-language">{problem?.problem_language || 'Unknown'}</span>
                                    </div>
                                </div>
                                
                                <div className="admin-vs-problem-description">
                                    <h5>Problem Description</h5>
                                    <div className="admin-vs-description-content">
                                        <p>{problem?.problem_description || submission?.problem_description || 'No problem description available'}</p>
                                    </div>
                                </div>

                                {(problem?.problem_input || submission?.problem_input) && (
                                    <div className="admin-vs-input-section">
                                        <h5>Input Format</h5>
                                        <div className="admin-vs-input-content">
                                            <p>{problem?.problem_input || submission?.problem_input}</p>
                                        </div>
                                    </div>
                                )}

                                {(problem?.problem_output || submission?.problem_output) && (
                                    <div className="admin-vs-output-section">
                                        <h5>Output Format</h5>
                                        <div className="admin-vs-output-content">
                                            <p>{problem?.problem_output || submission?.problem_output}</p>
                                        </div>
                                    </div>
                                )}

                                {(problem?.sample_input || submission?.sample_input) && (
                                    <div className="admin-vs-sample-section">
                                        <h5>Sample Input</h5>
                                        <pre className="admin-vs-sample-box">{problem?.sample_input || submission?.sample_input}</pre>
                                    </div>
                                )}

                                {(problem?.sample_output || submission?.sample_output) && (
                                    <div className="admin-vs-sample-section">
                                        <h5>Sample Output</h5>
                                        <pre className="admin-vs-sample-box">{problem?.sample_output || submission?.sample_output}</pre>
                                    </div>
                                )}

                                {(problem?.constraints || submission?.constraints) && (
                                    <div className="admin-vs-constraints-section">
                                        <h5>Constraints</h5>
                                        <div className="admin-vs-constraints-content">
                                            <p>{problem?.constraints || submission?.constraints}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="admin-vs-problem-info">
                                    <div className="admin-vs-info-row">
                                        <span className="admin-vs-info-label">Problem ID:</span>
                                        <span className="admin-vs-info-value">{submission?.problem_id || 'N/A'}</span>
                                    </div>
                                    <div className="admin-vs-info-row">
                                        <span className="admin-vs-info-label">Author:</span>
                                        <span className="admin-vs-info-value">{problem?.problemsetter_name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Code Section */}
                        <div className="admin-vs-code-section">
                            <div className="admin-vs-code-header">
                                <h3>Submitted Code</h3>
                                <div className="admin-vs-code-info">
                                    <span>Language: <strong>{submission?.language || 'Unknown'}</strong></span>
                                    <span>Status: <strong className={`admin-vs-status-text ${submission?.submission_status?.toLowerCase()}`}>{submission?.submission_status || 'Unknown'}</strong></span>
                                </div>
                            </div>
                            <div className="admin-vs-code-editor">
                                {submissionLoading ? (
                                    <div className="admin-vs-loading">
                                        <FaSpinner className="fa-spin" />
                                        <p>Loading code...</p>
                                    </div>
                                ) : error ? (
                                    <div className="admin-vs-error-display">
                                        <div className="admin-vs-error-icon">⚠️</div>
                                        <p>{error}</p>
                                    </div>
                                ) : (
                                    <textarea
                                        className="admin-vs-code-textarea"
                                        value={submission?.submitted_code || ''}
                                        readOnly
                                        placeholder="No code available"
                                        spellCheck={false}
                                        style={{ 
                                            minHeight: '400px',
                                            width: '100%',
                                            fontFamily: 'monospace',
                                            fontSize: '14px',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            backgroundColor: '#f8f9fa',
                                            resize: 'vertical'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="admin-vs-error-banner" style={{
                            backgroundColor: '#fee',
                            color: '#dc2626',
                            padding: '12px',
                            borderRadius: '8px',
                            margin: '16px 0',
                            border: '1px solid #fecaca'
                        }}>
                            <strong>Error:</strong> {error}
                            <button 
                                onClick={fetchSubmission}
                                style={{
                                    marginLeft: '10px',
                                    padding: '4px 8px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin_ViewSubmission;
