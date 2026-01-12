import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaCode, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaBars, FaSearch, FaHome, FaBell, FaCommentAlt, FaCoins, FaUser, FaSignOutAlt, FaHome as FaHomeIcon, FaTrophy, FaCode as FaCodeIcon, FaListOl, FaSpinner } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { practiceSubmissionsDataService } from '../services/practiceSubmissionsDataService';
import './Submissions.css';

const Submissions = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [submissions, setSubmissions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { problemId } = useParams();
    const navigate = useNavigate();


    // Fetch submissions data
    const fetchSubmissions = async () => {
        try {
            setError(null);
            // For problem-specific submissions, don't filter by user
            // For general submissions, try to filter by user but handle UUID validation
            const userId = problemId ? null : user?.uid;
            const result = await practiceSubmissionsDataService.getSubmissions(problemId, userId);
            
            if (result.success) {
                setSubmissions(result.data || []);
            } else {
                setError(result.error);
                console.error('Error fetching submissions:', result.error);
            }
        } catch (error) {
            setError('Failed to load submissions');
            console.error('Unexpected error:', error);
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
            fetchSubmissions();
        }
    }, [user, problemId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
    };

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

    const handleViewCode = (submissionId) => {
        navigate(`/submissions/view/${submissionId}`);
    };

    const handleBack = () => {
        if (problemId) {
            navigate(`/practice/solve/${problemId}`);
        } else {
            navigate('/practice');
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
                                Problems
                            </button>
                            <button className="sp-nav-btn active">
                                Submissions
                            </button>
                            <button 
                                className="sp-nav-btn" 
                                onClick={() => {
                                    if (problemId) {
                                        navigate(`/practice/editorial/${problemId}`);
                                    } else {
                                        navigate('/editorial');
                                    }
                                }}
                            >
                                Editorial
                            </button>
                            <button 
                                className="sp-nav-btn" 
                                onClick={() => {
                                    if (problemId) {
                                        navigate(`/practice/leaderboard/${problemId}`);
                                    } else {
                                        navigate('/individual-leaderboard');
                                    }
                                }}
                            >
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Minimal Header */}
                    <div className="sp-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <div className="sp-title-section" style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <h1 className="sp-title" style={{ margin: 0 }}>
                                {problemId ? 'My Submissions' : 'My Submissions'}
                            </h1>
                            {problemId && (
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    backgroundColor: '#f3f4f6',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    marginLeft: '12px'
                                }}>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Submissions Table Only */}
                    <div className="submissions-full-width">
                        {error && (
                            <div className="sp-error" style={{
                                backgroundColor: '#fee',
                                color: '#dc2626',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid #fecaca'
                            }}>
                                <strong>Error:</strong> {error}
                                <button 
                                    onClick={fetchSubmissions}
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
                        
                        <div className="submissions-table-wrapper">
                            {submissions.length === 0 && !error ? (
                                <div className="sp-empty" style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#64748b',
                                    fontSize: '16px'
                                }}>
                                    <FaBook style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }} />
                                    <div>No submissions yet</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                        {problemId 
                                            ? 'Be the first to solve this problem!' 
                                            : 'Start solving problems to see your submissions here!'
                                        }
                                    </div>
                                </div>
                            ) : (
                                <table className="submissions-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Status</th>
                                            <th>Language</th>
                                            <th>Submitted At</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((submission) => (
                                            <tr key={submission.submission_id} className={`submission-row ${getStatusClass(submission.submission_status)}`}>
                                                <td className="submission-id">#{submission.submission_id?.slice(0, 8) || submission.id}</td>
                                                <td className="submission-status">
                                                    <div className="status-content">
                                                        {getStatusIcon(submission.submission_status)}
                                                        <span>{submission.submission_status}</span>
                                                    </div>
                                                </td>
                                                <td className="submission-language">{submission.language}</td>
                                                <td className="submission-date">
                                                    {new Date(submission.submitted_at).toLocaleString()}
                                                </td>
                                                <td className="submission-points">
                                                    {submission.submission_status === 'Accepted' ? `+${submission.points || 100}` : '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Submissions;
