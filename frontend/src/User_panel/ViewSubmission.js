import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaCode, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaBars, FaSearch, FaHome, FaBell, FaCommentAlt, FaCoins, FaUser, FaSignOutAlt, FaHome as FaHomeIcon, FaTrophy, FaCode as FaCodeIcon, FaListOl, FaCopy, FaDownload } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { practiceSubmissionsDataService } from '../services/practiceSubmissionsDataService';
import './ViewSubmission.css';

const ViewSubmission = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissionLoading, setSubmissionLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [submission, setSubmission] = useState(null);
    const [error, setError] = useState(null);
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const passedProblemId = location.state?.problemId;

    // Fetch submission data
    const fetchSubmission = async () => {
        try {
            setSubmissionLoading(true);
            setError(null);
            const result = await practiceSubmissionsDataService.getSubmissionById(submissionId);
            
            console.log('Submission result:', result);
            console.log('Submission data:', result.data);
            
            if (result.success) {
                setSubmission(result.data);
                
                // If no passed problemId, try to get it from submission data
                if (!passedProblemId && result.data?.problem_id) {
                    console.log('Using problem_id from submission data:', result.data.problem_id);
                    // Update the passedProblemId with the one from submission
                    location.state = { ...location.state, problemId: result.data.problem_id };
                }
            } else {
                setError(result.error);
                console.error('Error fetching submission:', result.error);
            }
        } catch (error) {
            setError('Failed to load submission');
            console.error('Unexpected error:', error);
        } finally {
            setSubmissionLoading(false);
        }
    };

    const menuItems = [
        { key: 'home', name: 'Home', icon: <FaHomeIcon className="menu-icon" /> },
        { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
        { key: 'practice', name: 'Practice Problem', icon: <FaCodeIcon className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchSubmission();
        }
    }, [user, submissionId]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Accepted':
                return <FaCheckCircle className="status-icon accepted" />;
            case 'Wrong Answer':
                return <FaTimesCircle className="status-icon wrong" />;
            case 'Time Limit Exceeded':
                return <FaClock className="status-icon timeout" />;
            case 'Runtime Error':
                return <FaTimesCircle className="status-icon error" />;
            default:
                return <FaClock className="status-icon pending" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Accepted':
                return 'status-accepted';
            case 'Wrong Answer':
                return 'status-wrong';
            case 'Time Limit Exceeded':
                return 'status-timeout';
            case 'Runtime Error':
                return 'status-error';
            default:
                return 'status-pending';
        }
    };

    const handleCopyCode = () => {
        if (submission?.submitted_code) {
            navigator.clipboard.writeText(submission.submitted_code);
            alert('Code copied to clipboard!');
        }
    };

    const handleDownloadCode = () => {
        if (submission?.submitted_code) {
            const blob = new Blob([submission.submitted_code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `submission_${submissionId}.${submission.language?.toLowerCase() || 'txt'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleBack = () => {
        console.log('handleBack called');
        console.log('passedProblemId:', passedProblemId);
        console.log('submission.practice_problem?.problem_id:', submission?.practice_problem?.problem_id);
        console.log('submission.problem_id:', submission?.problem_id);
        
        // Use the passed problemId first, then problem_id from submission, then from practice_problem
        const targetProblemId = passedProblemId || submission?.problem_id || submission?.practice_problem?.problem_id;
        
        console.log('targetProblemId:', targetProblemId);
        
        if (targetProblemId) {
            console.log('Navigating to:', `/practice/submissions/${targetProblemId}`);
            navigate(`/practice/submissions/${targetProblemId}`);
        } else {
            console.log('Navigating to general submissions');
            navigate('/practice/submissions');
        }
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

    if (!user) {
        return (
            <div className="ud-root">
                <aside className="ud-sidebar">
                    <div className="ud-logo">
                        <span className="byte">Byte</span>
                        <span className="arena">Arena</span>
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
                            <button className="sp-nav-btn" onClick={handleBack}>
                                Submissions
                            </button>
                            <button className="sp-nav-btn active">
                                View Submission
                            </button>
                        </div>
                    </div>

                    {/* Submission Details */}
                    <div className="submission-details">
                        {submissionLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading submission...</p>
                            </div>
                        ) : error ? (
                            <div className="sp-error">
                                <strong>Error:</strong> {error}
                                <button onClick={fetchSubmission} className="retry-btn">
                                    Retry
                                </button>
                            </div>
                        ) : submission ? (
                            <div className="submission-content">
                                {/* Submission Header */}
                                <div className="submission-header">
                                    <div className="submission-info">
                                        <h2>{submission.practice_problem?.problem_title || 'Unknown Problem'}</h2>
                                        <div className="submission-meta">
                                            <span className={`submission-status ${getStatusClass(submission.submission_status)}`}>
                                                {getStatusIcon(submission.submission_status)}
                                                {submission.submission_status}
                                            </span>
                                            <span className="submission-language">{submission.language}</span>
                                            <span className="submission-points">
                                                {submission.submission_status === 'Accepted' ? `+${submission.points || 0} points` : '0 points'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Problem Description */}
                                <div className="problem-section">
                                    <h3>Problem Description</h3>
                                    <div className="problem-description">
                                        <div 
                                            dangerouslySetInnerHTML={{ 
                                                __html: (submission.practice_problem?.problem_description || 'No description available')
                                                    .replace(/\n/g, '<br />')
                                                    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
                                                    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                    .replace(/^- (.+)/gm, '<li>$1</li>')
                                                    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Sample Input */}
                                {submission.practice_problem?.sample_input && (
                                    <div className="problem-section">
                                        <h3>Sample Input</h3>
                                        <div className="sample-input-output">
                                            <pre>{submission.practice_problem.sample_input}</pre>
                                        </div>
                                    </div>
                                )}

                                {/* Sample Output */}
                                {submission.practice_problem?.sample_output && (
                                    <div className="problem-section">
                                        <h3>Sample Output</h3>
                                        <div className="sample-input-output">
                                            <pre>{submission.practice_problem.sample_output}</pre>
                                        </div>
                                    </div>
                                )}

                                {/* Submitted Code */}
                                <div className="code-section">
                                    <div className="code-section-header">
                                        <h3>Submitted Code</h3>
                                        <div className="code-actions">
                                            <button onClick={handleCopyCode} className="action-btn" title="Copy code">
                                                <FaCopy />
                                                Copy
                                            </button>
                                            <button onClick={handleDownloadCode} className="action-btn" title="Download code">
                                                <FaDownload />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        overflow: 'auto',
                                        maxHeight: '500px'
                                    }}>
                                        <pre style={{
                                            margin: 0,
                                            fontFamily: 'Fira Code, Courier New, monospace',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            color: '#e2e8f0',
                                            whiteSpace: 'pre-wrap',
                                            wordWrap: 'break-word'
                                        }}>
                                            {submission?.submitted_code || 'No code available'}
                                        </pre>
                                    </div>
                                </div>

                                {/* Submission Details */}
                                <div className="submission-meta-section">
                                    <h3>Submission Details</h3>
                                    <div className="meta-grid">
                                        <div className="meta-item">
                                            <label>Submitted By:</label>
                                            <span>{submission.problem_solver_name || 'Anonymous'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <label>Language:</label>
                                            <span>{submission.language}</span>
                                        </div>
                                        <div className="meta-item">
                                            <label>Submitted At:</label>
                                            <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <label>Status:</label>
                                            <span className={`status-badge ${getStatusClass(submission.submission_status)}`}>
                                                {submission.submission_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sp-empty">
                                <FaBook style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }} />
                                <div>Submission not found</div>
                                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                    The submission you're looking for doesn't exist or you don't have permission to view it.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViewSubmission;
