import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaCode, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaBars, FaSearch, FaHome, FaBell, FaCommentAlt, FaCoins, FaUser, FaSignOutAlt, FaHome as FaHomeIcon, FaTrophy, FaCode as FaCodeIcon, FaListOl } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Submissions.css';

const Submissions = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('practice');
    const [submissions, setSubmissions] = useState([
        {
            id: 1,
            status: "Accepted",
            time: "2.3s",
            memory: "45.2 MB",
            language: "Python",
            submittedAt: "2024-01-15 10:30:00",
            userId: "user123"
        },
        {
            id: 2,
            status: "Wrong Answer",
            time: "1.8s",
            memory: "42.1 MB",
            language: "C++",
            submittedAt: "2024-01-15 10:25:00",
            userId: "user123"
        },
        {
            id: 3,
            status: "Time Limit Exceeded",
            time: ">3.0s",
            memory: "38.7 MB",
            language: "JavaScript",
            submittedAt: "2024-01-15 10:20:00",
            userId: "user123"
        },
        {
            id: 4,
            status: "Accepted",
            time: "1.2s",
            memory: "41.5 MB",
            language: "Java",
            submittedAt: "2024-01-15 10:15:00",
            userId: "user123"
        },
        {
            id: 5,
            status: "Runtime Error",
            time: "0.5s",
            memory: "39.8 MB",
            language: "Python",
            submittedAt: "2024-01-15 10:10:00",
            userId: "user123"
        },
        {
            id: 6,
            status: "Accepted",
            time: "0.8s",
            memory: "35.2 MB",
            language: "C++",
            submittedAt: "2024-01-15 09:55:00",
            userId: "user123"
        },
        {
            id: 7,
            status: "Wrong Answer",
            time: "2.1s",
            memory: "44.8 MB",
            language: "Java",
            submittedAt: "2024-01-15 09:45:00",
            userId: "user123"
        },
        {
            id: 8,
            status: "Time Limit Exceeded",
            time: ">3.0s",
            memory: "40.1 MB",
            language: "Python",
            submittedAt: "2024-01-15 09:30:00",
            userId: "user123"
        },
        {
            id: 9,
            status: "Accepted",
            time: "1.5s",
            memory: "38.9 MB",
            language: "JavaScript",
            submittedAt: "2024-01-15 09:15:00",
            userId: "user123"
        },
        {
            id: 10,
            status: "Runtime Error",
            time: "0.3s",
            memory: "36.7 MB",
            language: "C++",
            submittedAt: "2024-01-15 09:00:00",
            userId: "user123"
        },
        {
            id: 11,
            status: "Accepted",
            time: "1.1s",
            memory: "37.5 MB",
            language: "Java",
            submittedAt: "2024-01-15 08:45:00",
            userId: "user123"
        },
        {
            id: 12,
            status: "Wrong Answer",
            time: "1.9s",
            memory: "43.2 MB",
            language: "Python",
            submittedAt: "2024-01-15 08:30:00",
            userId: "user123"
        },
        {
            id: 13,
            status: "Time Limit Exceeded",
            time: ">3.0s",
            memory: "41.8 MB",
            language: "JavaScript",
            submittedAt: "2024-01-15 08:15:00",
            userId: "user123"
        },
        {
            id: 14,
            status: "Accepted",
            time: "0.9s",
            memory: "35.8 MB",
            language: "C++",
            submittedAt: "2024-01-15 08:00:00",
            userId: "user123"
        },
        {
            id: 15,
            status: "Runtime Error",
            time: "0.6s",
            memory: "39.5 MB",
            language: "Java",
            submittedAt: "2024-01-15 07:45:00",
            userId: "user123"
        }
    ]);
    const { problemId } = useParams();
    const navigate = useNavigate();

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
        navigate('/practice/solve/1');
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
                            <button className="sp-nav-btn" onClick={handleBack}>
                                Problems
                            </button>
                            <button className="sp-nav-btn active">
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

                    {/* Minimal Header */}
                    <div className="sp-header">
                        <div className="sp-title-section">
                            <h1 className="sp-title">My  Submissions</h1>
                        </div>
                    </div>

                    {/* Submissions Table Only */}
                    <div className="submissions-full-width">
                        <div className="submissions-table-wrapper">
                            <table className="submissions-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Language</th>
                                        <th>Submitted At</th>
                                        <th>Points</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className={`submission-row ${getStatusClass(submission.status)}`}>
                                            <td className="submission-id">#{submission.id}</td>
                                            <td className="submission-status">
                                                <div className="status-content">
                                                    {getStatusIcon(submission.status)}
                                                    <span>{submission.status}</span>
                                                </div>
                                            </td>
                                            <td className="submission-language">{submission.language}</td>
                                            <td className="submission-date">{submission.submittedAt}</td>
                                            <td className="submission-points">{submission.status === 'Accepted' ? '+100' : '0'}</td>
                                            <td className="submission-action">
                                                <button 
                                                    className="view-code-btn"
                                                    onClick={() => handleViewCode(submission.id)}
                                                >
                                                    <FaEye />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Submissions;
