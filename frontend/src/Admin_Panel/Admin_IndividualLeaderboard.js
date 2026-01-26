import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaCommentAlt,
  FaHome,
  FaListOl,
  FaSearch,
  FaSignOutAlt,
  FaTrophy,
  FaUser,
  FaSyncAlt,
  FaSpinner,
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { practiceSubmissionsService } from '../services/practiceSubmissionsService';
import './Admin_Dashboard.css';
import './Admin_IndividualLeaderboard.css';

const Admin_IndividualLeaderboard = () => {
    const navigate = useNavigate();
    const { problemId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [active, setActive] = useState('problems');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const menuItems = [
        { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
        { key: 'users', name: 'User Management', icon: <FaUser className="menu-icon" /> },
        { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
        { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
        { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
        { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
    ];

    console.log('Admin Individual Leaderboard - problemId:', problemId);

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
        try {
            setError(null);
            const result = await practiceSubmissionsService.getLeaderboardOptimized(problemId);
            
            if (result.success) {
                setRows(result.data || []);
            } else {
                setError(result.error);
                console.error('Error fetching leaderboard:', result.error);
            }
        } catch (error) {
            setError('Failed to load leaderboard');
            console.error('Unexpected error:', error);
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
            fetchLeaderboard();
        }
    }, [user, problemId]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLeaderboard();
        setRefreshing(false);
    };

    const initialsFor = (name) => {
        if (!name) return 'U';
        const parts = name.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] || '';
        const second = (parts[1]?.[0] || parts[0]?.[1] || '') || '';
        return `${first}${second}`.toUpperCase();
    };

    const tabItems = useMemo(
        () => [
            { 
                key: 'problem', 
                label: 'Problem', 
                onClick: () => {
                    console.log('Problem tab clicked, problemId:', problemId);
                    if (problemId) {
                        navigate(`/admin_problems/${problemId}`);
                    } else {
                        navigate('/admin_problems');
                    }
                }
            },
            { 
                key: 'submissions', 
                label: 'Submissions', 
                onClick: () => {
                    console.log('Submissions tab clicked, problemId:', problemId);
                    if (problemId) {
                        navigate(`/admin_submissions/${problemId}`);
                    } else {
                        navigate('/admin_submissions');
                    }
                }
            },
            { 
                key: 'leaderboard', 
                label: 'LeaderBoard', 
                onClick: () => {
                    console.log('Leaderboard tab clicked, problemId:', problemId);
                    if (problemId) {
                        navigate(`/admin/leaderboard/${problemId}`);
                    } else {
                        navigate('/admin_leaderboard');
                    }
                }
            },
        ],
        [navigate, problemId]
    );

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
                        <p>Loading leaderboard...</p>
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
                            <input type="text" placeholder="Search problems, categories, creators..." />
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

                <div className="admin-ilb-page">
                    <div className="admin-ilb-header" style={{
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                        }}>
                            {problemId ? 'Problem Leaderboard' : 'Admin Leaderboard'}
                        </h2>
                        <button 
                            className="admin-refresh-btn" 
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FaSpinner className={refreshing ? 'spinning' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    
                    <div className="admin-ilb-tabs">
                        {tabItems.map((t) => (
                            <button
                                key={t.key}
                                className={`admin-ilb-tab ${t.key === 'leaderboard' ? 'active' : ''}`}
                                onClick={t.onClick}
                                type="button"
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="admin-ilb-card">
                        {error && (
                            <div className="admin-ilb-error" style={{
                                backgroundColor: '#fee',
                                color: '#dc2626',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid #fecaca'
                            }}>
                                <strong>Error:</strong> {error}
                                <button 
                                    onClick={fetchLeaderboard}
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
                        
                        <div className="admin-ilb-table-toolbar">
                            <div className="admin-ilb-toolbar-spacer" />
                            <button
                                className="admin-ilb-refresh"
                                type="button"
                                aria-label="Refresh"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                style={{ opacity: refreshing ? 0.6 : 1 }}
                            >
                                {refreshing ? <FaSpinner className="fa-spin" /> : <FaSyncAlt />}
                            </button>
                        </div>

                        <div className="admin-ilb-table-wrap">
                            {rows.length === 0 && !error ? (
                                <div className="admin-ilb-empty" style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#64748b',
                                    fontSize: '16px'
                                }}>
                                    <FaTrophy style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }} />
                                    <div>No submissions yet</div>
                                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                        {problemId 
                                            ? 'Be the first to solve this problem!' 
                                            : 'Start solving problems to see leaderboard entries!'
                                        }
                                    </div>
                                </div>
                            ) : (
                                <table className="admin-ilb-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-col-participant">Participant</th>
                                            <th className="admin-col-rank">Rank</th>
                                            <th className="admin-col-country">Country</th>
                                            <th className="admin-col-language">Language</th>
                                            <th className="admin-col-points">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r) => (
                                            <tr 
                                                key={`${r.rank}-${r.problem_solver_id}`}
                                                className="admin-ilb-table-row"
                                            >
                                                <td className="admin-cell-participant">
                                                    <div className="admin-ilb-user">
                                                        <div className="admin-ilb-user-avatar">{initialsFor(r.problem_solver_name)}</div>
                                                        <div className="admin-ilb-user-name">
                                                            {r.problem_solver_name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="admin-cell-rank">{r.rank}</td>
                                                <td className="admin-cell-country">{r.country}</td>
                                                <td className="admin-cell-language">{r.language}</td>
                                                <td className="admin-cell-points">{r.points}</td>
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

export default Admin_IndividualLeaderboard;
