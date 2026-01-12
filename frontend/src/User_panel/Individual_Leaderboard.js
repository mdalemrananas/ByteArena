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
import './User_Dashboard.css';
import './Individual_Leaderboard.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const Individual_Leaderboard = () => {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('practice');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);

  console.log('Individual Leaderboard - problemId:', problemId);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const result = await practiceSubmissionsService.getLeaderboardOptimized(problemId);
      
      if (result.success) {
        setRows(result.data || []);
        
        // Get current user's rank if logged in
        if (user && result.data) {
          const userEntry = result.data.find(row => row.problem_solver_id === user.uid);
          setUserRank(userEntry || null);
        }
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
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [problemId]);

  useEffect(() => {
    // Update user rank when user or rows change
    if (user && rows.length > 0) {
      const userEntry = rows.find(row => row.problem_solver_id === user.uid);
      setUserRank(userEntry || null);
    } else {
      setUserRank(null);
    }
  }, [user, rows]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
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
            navigate(`/practice/solve/${problemId}`);
          } else {
            navigate('/practice');
          }
        }
      },
      { 
        key: 'submissions', 
        label: 'Submissions', 
        onClick: () => {
          console.log('Submissions tab clicked, problemId:', problemId);
          if (problemId) {
            navigate(`/practice/submissions/${problemId}`);
          } else {
            navigate('/submissions');
          }
        }
      },
      { 
        key: 'editorial', 
        label: 'Editorial', 
        onClick: () => {
          console.log('Editorial tab clicked, problemId:', problemId);
          if (problemId) {
            navigate(`/practice/editorial/${problemId}`);
          } else {
            navigate('/editorial');
          }
        }
      },
      { 
        key: 'leaderboard', 
        label: 'LeaderBoard', 
        onClick: () => {
          console.log('Leaderboard tab clicked, problemId:', problemId);
          if (problemId) {
            navigate(`/practice/leaderboard/${problemId}`);
          } else {
            navigate('/individual-leaderboard');
          }
        }
      },
    ],
    [navigate, problemId]
  );

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <FaSpinner className="fa-spin" style={{ marginRight: '10px' }} />
        Loading leaderboard...
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
              <span className="icon" style={{ marginRight: '12px' }}>
                {item.icon}
              </span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>
                {item.name}
              </span>
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
            <button
              className="icon-btn"
              onClick={() => navigate('/')}
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
            <div
              className="profile"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
              data-tooltip="Profile"
            >
              <div className="avatar">
                {user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : <FaUser />}
              </div>
              <span>{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        <div className="ilb-page">
          <div className="ilb-header" style={{
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
              {problemId ? 'Problem Leaderboard' : 'Individual Leaderboard'}
            </h2>
          </div>
          
          <div className="ilb-tabs">
            {tabItems.map((t) => (
              <button
                key={t.key}
                className={`ilb-tab ${t.key === 'leaderboard' ? 'active' : ''}`}
                onClick={t.onClick}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {userRank && (
              <div className="ilb-user-rank" style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaTrophy style={{ color: '#f59e0b', fontSize: '20px' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                    Your Rank
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
                    #{userRank.rank}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {userRank.points} points
                  </div>
                </div>
              </div>
            )}

            <div className="ilb-card">
            {error && (
              <div className="ilb-error" style={{
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
            
            <div className="ilb-table-toolbar">
              <div className="ilb-toolbar-spacer" />
              <button
                className="ilb-refresh"
                type="button"
                aria-label="Refresh"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ opacity: refreshing ? 0.6 : 1 }}
              >
                {refreshing ? <FaSpinner className="fa-spin" /> : <FaSyncAlt />}
              </button>
            </div>

            <div className="ilb-table-wrap">
              {rows.length === 0 && !error ? (
                <div className="ilb-empty" style={{
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
                      : 'Be the first to solve a practice problem!'
                    }
                  </div>
                </div>
              ) : (
                <table className="ilb-table">
                  <thead>
                    <tr>
                      <th className="col-participant">Participant</th>
                      <th className="col-rank">Rank</th>
                      <th className="col-country">Country</th>
                      <th className="col-language">Language</th>
                      <th className="col-points">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr 
                        key={`${r.rank}-${r.problem_solver_id}`}
                        className={user && r.problem_solver_id === user.uid ? 'ilb-current-user' : ''}
                      >
                        <td className="cell-participant">
                          <div className="ilb-user">
                            <div className="ilb-user-avatar">{initialsFor(r.problem_solver_name)}</div>
                            <div className="ilb-user-name">
                              {r.problem_solver_name}
                              {user && r.problem_solver_id === user.uid && (
                                <span style={{
                                  marginLeft: '8px',
                                  padding: '2px 6px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  fontSize: '10px',
                                  borderRadius: '4px',
                                  fontWeight: 'normal'
                                }}>
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="cell-rank">{r.rank}</td>
                        <td className="cell-country">{r.country}</td>
                        <td className="cell-language">{r.language}</td>
                        <td className="cell-points">{r.points}</td>
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

export default Individual_Leaderboard;
