import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaCode,
  FaTrophy,
  FaListOl,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaCommentAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Dashboard-1.css';

const menuItems = [
  { name: 'Home', key: 'home', icon: <FaHome /> },
  { name: 'Contest', key: 'contest', icon: <FaTrophy /> },
  { name: 'Practice Problem', key: 'practice', icon: <FaCode /> },
  { name: 'Leaderboard', key: 'leaderboard', icon: <FaListOl /> },
  { name: 'Logout', key: 'logout', icon: <FaSignOutAlt />, className: 'logout' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeKey, setActiveKey] = useState('home');
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes warning
  const [selectedStats, setSelectedStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session timeout settings
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes warning

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        console.log('User data:', {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
      } else {
        // User not logged in, redirect to sign in
        console.log('No user found, redirecting to login');
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Statistics data
  const stats = [
    { id: 1, label: 'Problems Solved', value: '128', icon: '📊', trend: '+12 this month', color: '#8b5cf6' },
    { id: 2, label: 'Contest Rating', value: '1,540', icon: '⭐', trend: '+150 this month', color: '#ec4899' },
    { id: 3, label: 'Current Streak', value: '7 days', icon: '🔥', trend: 'Keep going!', color: '#f97316' },
    { id: 4, label: 'Leaderboard Rank', value: '#24', icon: '🏆', trend: 'Top 2%', color: '#06b6d4' },
  ];

  // Handle user activity
  const handleUserActivity = () => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    // Hide warning if showing
    setShowTimeoutWarning(false);
    setTimeRemaining(300);
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      setShowTimeoutWarning(true);
      
      // Auto logout after warning period
      setTimeout(() => {
      handleLogout();
      }, WARNING_DURATION);
    }, SESSION_DURATION - WARNING_DURATION);
    
    setSessionTimeout(timeoutId);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      // Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Setup session timeout on mount
  useEffect(() => {
    handleUserActivity();
    
    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => handleUserActivity();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Cleanup
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Countdown timer for warning
  useEffect(() => {
    let interval;
    if (showTimeoutWarning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimeoutWarning, timeRemaining]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-app">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {isSidebarOpen && (
              <>
                <span className="logo-byte">Byte</span>
                <span className="logo-arena">Arena</span>
              </>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Collapse' : 'Expand'}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-menu">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.key}
                className={`sidebar-item ${activeKey === item.key ? 'active' : ''} ${item.className || ''}`}
                onClick={() => {
                  if (item.key === 'logout') {
                    handleLogout();
                  } else {
                    setActiveKey(item.key);
                  }
                }}
                title={item.name}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {isSidebarOpen && <span className="sidebar-text">{item.name}</span>}
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          {isSidebarOpen && user && (
            <div className="sidebar-user-info">
              <div className="user-avatar">
                {console.log('Sidebar user:', user)}
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.displayName || 'User'}
                </div>
                <div className="user-badge">Pro Member</div>
                <div className="user-email" style={{fontSize: '0.8rem', color: '#718096'}}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">
              {activeKey === 'home'
                ? '🏠 Dashboard'
                : menuItems.find((m) => m.key === activeKey)?.name}
            </h1>
            <p className="dashboard-subtitle">
              {activeKey === 'home'
                ? 'Welcome back! Here\'s your progress at a glance.'
                : `Explore your ${menuItems.find((m) => m.key === activeKey)?.name.toLowerCase()}`}
            </p>
          </div>
          <div className="header-right">
            <div className="header-search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search problems, contests..." />
            </div>
            <div className="header-stats-mini">
              <div className="mini-stat">
                <span className="mini-stat-label">Level</span>
                <span className="mini-stat-value">⭐ 12</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">Points</span>
                <span className="mini-stat-value">🏆 2,450</span>
              </div>
            </div>
            <div className="header-divider"></div>
            <button className="header-icon-btn notification-btn" title="Notifications">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <button className="header-icon-btn message-btn" title="Messages">
              <FaCommentAlt />
              <span className="message-badge">1</span>
            </button>
            <div className="header-profile-section">
              <div className="profile-image-wrapper">
                {console.log('Header user:', user)}
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="profile-image"
                  />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} 
                    alt="Profile" 
                    className="profile-image"
                  />
                )}
                <div className="profile-status-indicator"></div>
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {user?.displayName || 'User'}
                </div>
                <div className="profile-level">Level 12 • Pro</div>
                <div className="profile-email" style={{fontSize: '0.8rem', color: '#718096'}}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero / Summary Section */}
        <section className="dashboard-hero-new">
          <div className="hero-content">
            <h1>Your Adventure Starts Here:</h1>
            <h2>Share, Learn, Enjoy!</h2>
            <p>Build engaging problems, challenge others</p>
            <button className="btn primary">Explore Problems</button>
          </div>
          <div className="hero-background"></div>
        </section>

        {/* Problems Categories */}
        <section className="problems-categories">
          <div className="section-header">
            <h3>Problems Categories</h3>
            <div className="nav-arrows">
              <button className="arrow-btn">‹</button>
              <button className="arrow-btn">›</button>
            </div>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-badge">Beginner</div>
              <div className="category-title">JavaScript 30 Days</div>
              <div className="category-icon">📚</div>
            </div>
            <div className="category-card">
              <div className="category-badge">Intermediate</div>
              <div className="category-title">Database</div>
              <div className="category-icon">🗄️</div>
            </div>
            <div className="category-card">
              <div className="category-badge">Intermediate</div>
              <div className="category-title">Algorithms</div>
              <div className="category-icon">🔄</div>
            </div>
            <div className="category-card">
              <div className="category-badge">Advanced</div>
              <div className="category-title">Concurrency</div>
              <div className="category-icon">⚡</div>
            </div>
          </div>
        </section>

        {/* Latest Problems */}
        <section className="latest-problems">
          <div className="section-header">
            <h3>Latest Problems</h3>
            <a href="#" className="view-all">View all Problems</a>
          </div>
          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-header">
                <span className="difficulty-badge hard">Hard</span>
              </div>
              <div className="problem-title">Maximum Subarray Sum With Length Divisible by K</div>
              <div className="problem-footer">
                <a href="#" className="view-btn">View</a>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-header">
                <span className="difficulty-badge medium">Medium</span>
              </div>
              <div className="problem-title">Regular Expression Matching</div>
              <div className="problem-footer">
                <a href="#" className="view-btn">View</a>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-header">
                <span className="difficulty-badge medium">Medium</span>
              </div>
              <div className="problem-title">Remove Duplicates from Sorted Array</div>
              <div className="problem-footer">
                <a href="#" className="view-btn">View</a>
              </div>
            </div>
            <div className="problem-card">
              <div className="problem-header">
                <span className="difficulty-badge hard">Hard</span>
              </div>
              <div className="problem-title">A + B Queries II</div>
              <div className="problem-footer">
                <a href="#" className="view-btn">View</a>
              </div>
            </div>
          </div>
        </section>

        {/* Contests Section */}
        <section className="contests-section">
          <div className="section-header">
            <h3>Contests</h3>
            <div className="filter-tabs">
              <button className="filter-tab active">All</button>
              <button className="filter-tab">Hot</button>
              <button className="filter-tab">Trending</button>
              <button className="filter-tab">Editors</button>
            </div>
          </div>
          <div className="contests-grid">
            <div className="contest-card">
              <div className="contest-badge">5 / 5 Expired</div>
              <div className="contest-title">Stateless Quiz: Source Exploration</div>
              <div className="contest-category">Exploratory</div>
              <div className="contest-meta">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Alex" className="avatar" />
                <span className="author">Alex Smith</span>
                <span className="rating">⭐ 4.0</span>
              </div>
              <div className="contest-players">
                <span>2.3k players Register</span>
              </div>
              <button className="btn-register">Register Now</button>
            </div>
            <div className="contest-card">
              <div className="contest-badge">45 / 100 Ongoing</div>
              <div className="contest-title">World Geography Challenge: Capitals &...</div>
              <div className="contest-category">Geography</div>
              <div className="contest-meta">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex2" alt="Alex" className="avatar" />
                <span className="author">Alex Smith</span>
                <span className="rating">⭐ 4.0</span>
              </div>
              <div className="contest-players">
                <span>1.5k players Register</span>
              </div>
              <button className="btn-register">Register Now</button>
            </div>
            <div className="contest-card">
              <div className="contest-badge">20 / 30 Expired</div>
              <div className="contest-title">Brain Teasers & Logic Puzzles</div>
              <div className="contest-category">Puzzles</div>
              <div className="contest-meta">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex3" alt="Alex" className="avatar" />
                <span className="author">Alex Smith</span>
                <span className="rating">⭐ 4.7</span>
              </div>
              <div className="contest-players">
                <span>2.3k players Register</span>
              </div>
              <button className="btn-register">Register Now</button>
            </div>
            <div className="contest-card">
              <div className="contest-badge">80 / 100 Ongoing</div>
              <div className="contest-title">History's Greatest Mysteries</div>
              <div className="contest-category">History</div>
              <div className="contest-meta">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex4" alt="Alex" className="avatar" />
                <span className="author">Alex Smith</span>
                <span className="rating">⭐ 4.0</span>
              </div>
              <div className="contest-players">
                <span>1.8k players Register</span>
              </div>
              <button className="btn-register">Register Now</button>
            </div>
          </div>
        </section>

        {/* Top Programmers */}
        <section className="top-programmers">
          <div className="section-header">
            <h3>🏆 Top Programmers</h3>
            <a href="#" className="view-all">View Full Leaderboard</a>
          </div>
          <div className="programmers-grid">
            <div className="programmer-card">
              <div className="programmer-banner"></div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=heran" alt="Heran" className="programmer-avatar" />
              <div className="programmer-name">Heran</div>
              <div className="programmer-badge">🥇 Gold Member</div>
              <div className="programmer-stats">
                <div className="stat">
                  <div className="stat-value">1,240</div>
                  <div className="stat-label">Points</div>
                </div>
                <div className="stat">
                  <div className="stat-value">24</div>
                  <div className="stat-label">Problems Solved</div>
                </div>
                <div className="stat">
                  <div className="stat-value">1,200</div>
                  <div className="stat-label">Coins</div>
                </div>
              </div>
            </div>
            <div className="programmer-card">
              <div className="programmer-banner"></div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=lanna" alt="Lanna" className="programmer-avatar" />
              <div className="programmer-name">Lanna</div>
              <div className="programmer-badge">🥈 Silver Member</div>
              <div className="programmer-stats">
                <div className="stat">
                  <div className="stat-value">980</div>
                  <div className="stat-label">Points</div>
                </div>
                <div className="stat">
                  <div className="stat-value">20</div>
                  <div className="stat-label">Problems Solved</div>
                </div>
                <div className="stat">
                  <div className="stat-value">950</div>
                  <div className="stat-label">Coins</div>
                </div>
              </div>
            </div>
            <div className="programmer-card">
              <div className="programmer-banner"></div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ariana" alt="Ariana" className="programmer-avatar" />
              <div className="programmer-name">Ariana</div>
              <div className="programmer-badge">🥉 Bronze Member</div>
              <div className="programmer-stats">
                <div className="stat">
                  <div className="stat-value">850</div>
                  <div className="stat-label">Points</div>
                </div>
                <div className="stat">
                  <div className="stat-value">18</div>
                  <div className="stat-label">Problems Solved</div>
                </div>
                <div className="stat">
                  <div className="stat-value">800</div>
                  <div className="stat-label">Coins</div>
                </div>
              </div>
            </div>
            <div className="programmer-card">
              <div className="programmer-banner"></div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=mohsin" alt="Mohsin" className="programmer-avatar" />
              <div className="programmer-name">Mohsin</div>
              <div className="programmer-badge">⭐ Pro Member</div>
              <div className="programmer-stats">
                <div className="stat">
                  <div className="stat-value">750</div>
                  <div className="stat-label">Points</div>
                </div>
                <div className="stat">
                  <div className="stat-value">15</div>
                  <div className="stat-label">Problems Solved</div>
                </div>
                <div className="stat">
                  <div className="stat-value">700</div>
                  <div className="stat-label">Coins</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Winners */}
        <section className="live-winners">
          <div className="section-header">
            <h3>⭐ Live Winners</h3>
            <a href="#" className="view-all">5 recent winners</a>
          </div>
          <div className="winners-grid">
            <div className="winner-card">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=peak" alt="Peak" className="winner-avatar" />
              <div className="winner-name">Peak</div>
              <div className="winner-time">2 hours ago</div>
              <div className="winner-achievement">🏆 Won "Tricky" Trivia</div>
            </div>
            <div className="winner-card">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=larina" alt="Larina" className="winner-avatar" />
              <div className="winner-name">Larina</div>
              <div className="winner-time">3 hours ago</div>
              <div className="winner-achievement">🎯 Won "Coding Masters"</div>
            </div>
            <div className="winner-card">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=pryan" alt="Pryan" className="winner-avatar" />
              <div className="winner-name">Pryan</div>
              <div className="winner-time">5 hours ago</div>
              <div className="winner-achievement">🧠 Won "Science Tour"</div>
            </div>
            <div className="winner-card">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=aisana" alt="Aisana" className="winner-avatar" />
              <div className="winner-name">Aisana</div>
              <div className="winner-time">6 hours ago</div>
              <div className="winner-achievement">🎨 Won "Culture Quiz"</div>
            </div>
            <div className="winner-card">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=marin" alt="Marin" className="winner-avatar" />
              <div className="winner-name">Marin</div>
              <div className="winner-time">8 hours ago</div>
              <div className="winner-achievement">🌍 Won "Geography Challenge"</div>
            </div>
          </div>
        </section>


      </div>
      
      {/* Session Timeout Warning */}
      {showTimeoutWarning && (
        <div className="session-timeout-warning">
          <div className="warning-content">
            <h3>Session Timeout Warning</h3>
            <p>Your session will expire in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} minutes due to inactivity.</p>
            <div className="warning-actions">
              <button className="btn primary" onClick={handleUserActivity}>
                Stay Logged In
              </button>
              <button className="btn secondary" onClick={handleLogout}>
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
