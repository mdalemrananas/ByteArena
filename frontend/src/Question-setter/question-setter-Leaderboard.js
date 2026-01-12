import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaComments, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaStar, FaChartLine, FaGem, FaMedal
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-Leaderboard.css';

const QuestionSetterLeaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardSort, setLeaderboardSort] = useState('Score');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const leaderboardData = [
    { rank: 1, name: 'User1', country: 'Bangladesh', score: 9850, level: 78, problemsSolved: 42, badge: 'Diamond', avatar: 'U1', active: true },
    { rank: 2, name: 'User2', country: 'Bangladesh', score: 8720, level: 65, problemsSolved: 38, badge: 'Platinum', avatar: 'U2', active: true },
    { rank: 3, name: 'User3', country: 'Bangladesh', score: 7640, level: 59, problemsSolved: 35, badge: 'Gold', avatar: 'U3', active: true },
    { rank: 4, name: 'User4', country: 'Bangladesh', score: 6980, level: 52, problemsSolved: 31, badge: 'Gold', avatar: 'U4', active: true },
    { rank: 5, name: 'User5', country: 'Bangladesh', score: 6540, level: 48, problemsSolved: 29, badge: 'Silver', avatar: 'U5', active: true },
    { rank: 6, name: 'User6', country: 'Bangladesh', score: 5920, level: 45, problemsSolved: 27, badge: 'Silver', avatar: 'U6', active: false },
    { rank: 7, name: 'User7', country: 'Bangladesh', score: 5480, level: 41, problemsSolved: 25, badge: 'Bronze', avatar: 'U7', active: false },
    { rank: 8, name: 'User8', country: 'Bangladesh', score: 5120, level: 38, problemsSolved: 23, badge: 'Bronze', avatar: 'U8', active: false },
    { rank: 9, name: 'User9', country: 'Bangladesh', score: 4780, level: 36, problemsSolved: 21, badge: 'Bronze', avatar: 'U9', active: false },
    { rank: 10, name: 'User10', country: 'Bangladesh', score: 4350, level: 33, problemsSolved: 19, badge: 'Bronze', avatar: 'U10', active: false }
  ];

  return (
    <div className="qs-leaderboard-layout">
      {/* Sidebar */}
      <aside className="qs-sidebar">
        <div className="qs-sidebar-logo">
          <span className="qs-logo-byte">Byte</span>
          <span className="qs-logo-arena">Arena</span>
        </div>
        <nav className="qs-sidebar-nav">
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter')}
          >
            <FaHome className="qs-nav-icon" />
            <span className="qs-nav-text">Home</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/explore')}
          >
            <FaSearch className="qs-nav-icon" />
            <span className="qs-nav-text">Explore Questions</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/contest')}
          >
            <FaTrophy className="qs-nav-icon" />
            <span className="qs-nav-text">Contest</span>
          </button>
          <button 
            className="qs-nav-item active"
            onClick={() => navigate('/question-setter/leaderboard')}
          >
            <FaUsers className="qs-nav-icon" />
            <span className="qs-nav-text">Leaderboard</span>
          </button>
          <button 
            className="qs-nav-item"
            onClick={() => navigate('/question-setter/profile')}
          >
            <FaUserCircle className="qs-nav-icon" />
            <span className="qs-nav-text">Profile</span>
          </button>
          <button 
            className="qs-nav-item qs-nav-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="qs-nav-icon" />
            <span className="qs-nav-text">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="qs-main-content">
        {/* Header */}
        <header className="qs-header">
          <div className="qs-header-left">
            <div className="qs-logo-header">
              <span className="qs-logo-byte-header">Byte</span>
              <span className="qs-logo-arena-header">Arena</span>
            </div>
            <div className="qs-search-bar">
              <FaSearch className="qs-search-icon" />
              <input 
                type="text" 
                placeholder="Search Questions, Contest, Leaderboard..." 
                className="qs-search-input"
              />
            </div>
          </div>
          <div className="qs-header-right">
            <button className="qs-header-icon-btn qs-notification-btn" title="Messages">
              <FaComments />
              <span className="qs-notification-badge">2</span>
            </button>
            <button className="qs-header-icon-btn qs-notification-btn" title="Notifications">
              <FaBell />
              <span className="qs-notification-badge">1</span>
            </button>
            <button className="qs-header-icon-btn" title="Settings">
              <FaCog />
            </button>
            <button 
              className="qs-header-icon-btn qs-notification-btn" 
              title="Profile"
              onClick={() => navigate('/question-setter/profile')}
            >
              <FaUserCircle />
              <span className="qs-notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="qs-leaderboard-content-area">
          {/* Page Header */}
          <div className="qs-leaderboard-page-header">
            <h1 className="qs-leaderboard-page-title">Leaderboard</h1>
            <p className="qs-leaderboard-page-subtitle">See who's leading the pack in our global quiz rankings.</p>
          </div>

          {/* Global Leaderboard Banner */}
          <div className="qs-global-leaderboard-banner">
            <h2 className="qs-banner-title">Global Leaderboard</h2>
            <p className="qs-banner-description">Compete with the best quiz masters from around the world.</p>
          </div>

          {/* Search and Sort */}
          <div className="qs-leaderboard-filters">
            <div className="qs-search-filter">
              <FaSearch className="qs-filter-search-icon" />
              <input
                type="text"
                placeholder="Search competitor..."
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                className="qs-filter-search-input"
              />
            </div>
            <div className="qs-sort-filter">
              <label>Sort by:</label>
              <select
                value={leaderboardSort}
                onChange={(e) => setLeaderboardSort(e.target.value)}
                className="qs-sort-select"
              >
                <option value="Score">Score</option>
                <option value="Level">Level</option>
                <option value="Problems">Problems</option>
              </select>
              <FaChevronDown className="qs-sort-arrow" />
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="qs-table-container">
            <table className="qs-leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Problem Solve</th>
                  <th>Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user) => (
                  <tr key={user.rank}>
                    <td className="qs-rank-cell">
                      <div className={`qs-rank-badge ${user.rank <= 2 ? 'qs-rank-highlight' : ''}`}>
                        {user.rank}
                      </div>
                    </td>
                    <td className="qs-user-cell">
                      <div className="qs-user-info">
                        <div className="qs-user-avatar">{user.avatar}</div>
                        <div className="qs-user-details">
                          <span className="qs-user-name">{user.name}</span>
                          <span className="qs-user-country">{user.country}</span>
                        </div>
                      </div>
                    </td>
                    <td className="qs-score-cell">{user.score.toLocaleString()}</td>
                    <td className="qs-level-cell">
                      <FaStar className="qs-star-icon" />
                      {user.level}
                    </td>
                    <td className="qs-problems-cell">
                      <div className="qs-problems-info">
                        <span>{user.problemsSolved}</span>
                        {user.active && (
                          <div className="qs-active-status">
                            <span>Active</span>
                            <FaChartLine className="qs-active-icon" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="qs-badge-cell">
                      <span className={`qs-achievement-badge qs-badge-${user.badge.toLowerCase()}`}>
                        {user.badge === 'Diamond' && <FaGem />}
                        {user.badge === 'Platinum' && <FaMedal />}
                        {user.badge === 'Gold' && <FaMedal />}
                        {user.badge === 'Silver' && <FaMedal />}
                        {user.badge === 'Bronze' && <FaMedal />}
                        {user.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="qs-table-pagination">
            <span className="qs-pagination-info">Showing 1-10 of 15 users</span>
            <div className="qs-pagination-controls">
              <button className="qs-pagination-btn" disabled>
                <FaChevronLeft /> Previous
              </button>
              <button className="qs-pagination-btn">
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterLeaderboard;

