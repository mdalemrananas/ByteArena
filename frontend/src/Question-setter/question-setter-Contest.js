import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaComments, FaChevronDown,
  FaChevronLeft, FaChevronRight, FaClock, FaCoins, FaEye, FaEdit, FaTrash
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-Contest.css';

const QuestionSetterContest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedContest, setSelectedContest] = useState('All Contest');
  const [contestView, setContestView] = useState('All Contest'); // 'All Contest' or 'My Contest'
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTournaments, setAllTournaments] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.qs-action-dropdown')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDropdownToggle = (contestId, e) => {
    if (e) e.stopPropagation();
    setOpenDropdown(openDropdown === contestId ? null : contestId);
  };

  const handleView = (contestId) => {
    setOpenDropdown(null);
    navigate(`/question-setter/contest/${contestId}`);
  };

  const handleEdit = (contestId) => {
    setOpenDropdown(null);
    // Find the contest data
    const contest = allTournaments.find(t => t.id === contestId);
    if (contest) {
      // Save contest data to localStorage for editing
      localStorage.setItem('qs-editing-contest', JSON.stringify(contest));
      // Navigate to create competition page with edit mode
      navigate(`/question-setter/create-competition?editContest=${contestId}`);
    }
  };

  const handleDelete = (contestId) => {
    setOpenDropdown(null);
    if (window.confirm('Are you sure you want to delete this contest?')) {
      // Remove from tournaments list
      const updatedTournaments = allTournaments.filter(t => t.id !== contestId);
      setAllTournaments(updatedTournaments);
      // Save to localStorage
      localStorage.setItem('qs-contests', JSON.stringify(updatedTournaments));
    }
  };

  const categories = ['All Categories', 'C/C++', 'Java'];
  
  // Load tournaments from localStorage or use default
  useEffect(() => {
    const defaultTournaments = [
      {
        id: 1,
        title: 'Code Clash Championship',
        description: 'Test your coding skills in intense problem-solving battles and competitions.',
        date: 'Dec 4, 2025',
        time: '7:00 PM - 9:00 PM',
        prize: '৳1,000 prize',
        participants: '342 participants',
        closesIn: 'Closes in 2 days',
        status: 'Registration Open',
        difficulty: 'Medium',
        image: 'Competitive Programming Tournament',
        createdBy: 'user1'
      },
      {
        id: 2,
        title: 'Algorithm Arena',
        description: 'Solve challenging algorithms under time pressure to prove your coding mastery.',
        date: 'Dec 4, 2025',
        time: '7:00 PM - 9:00 PM',
        prize: '৳750 prize',
        participants: '215 participants',
        closesIn: 'Closes in 2 days',
        status: 'Upcoming',
        difficulty: 'Hard',
        image: 'Competitive Programming Tournament',
        createdBy: 'other'
      },
      {
        id: 3,
        title: 'Byte Battle League',
        description: 'Compete with top programmers in fast-paced coding challenges worldwide.',
        date: 'Dec 4, 2025',
        time: '7:00 PM - 9:00 PM',
        prize: '৳1,500 prize',
        participants: '567 participants',
        closesIn: 'Closes in 2 days',
        status: 'Ongoing',
        difficulty: 'Easy',
        image: 'Competitive Programming Tournament',
        createdBy: 'user1'
      },
      {
        id: 4,
        title: 'Hacker\'s Gauntlet',
        description: 'Push your programming limits with real-time contests and coding duels.',
        date: 'Dec 4, 2025',
        time: '7:00 PM - 9:00 PM',
        prize: '৳1,200 prize',
        participants: '215 participants',
        closesIn: 'Closes in 2 days',
        status: 'Registration Open',
        difficulty: 'Medium',
        image: 'Competitive Programming Tournament',
        createdBy: 'other'
      },
      {
        id: 5,
        title: 'Global Knowledge Championship',
        description: 'Test your knowledge against the best question enthusiasts from around the world.',
        date: 'Dec 10, 2025',
        time: '7:00 PM - 9:00 PM',
        prize: '৳5,000 prize',
        participants: '1,248 participants',
        closesIn: 'Closes in 2 days',
        status: 'Registration Open',
        difficulty: 'Medium',
        image: 'Competitive Programming Tournament',
        createdBy: 'user1'
      }
    ];

    const savedContests = JSON.parse(localStorage.getItem('qs-contests') || '[]');
    if (savedContests.length > 0) {
      // Merge saved contests with defaults, prioritizing saved ones
      const merged = [...defaultTournaments];
      savedContests.forEach(saved => {
        const index = merged.findIndex(t => t.id === saved.id);
        if (index !== -1) {
          merged[index] = { ...merged[index], ...saved };
        } else {
          merged.push(saved);
        }
      });
      setAllTournaments(merged);
    } else {
      setAllTournaments(defaultTournaments);
    }
  }, []);

  // Listen for navigation events to refresh data
  useEffect(() => {
    const handleFocus = () => {
      const savedContests = JSON.parse(localStorage.getItem('qs-contests') || '[]');
      if (savedContests.length > 0) {
        const defaultTournaments = [
          {
            id: 1,
            title: 'Code Clash Championship',
            description: 'Test your coding skills in intense problem-solving battles and competitions.',
            date: 'Dec 4, 2025',
            time: '7:00 PM - 9:00 PM',
            prize: '৳1,000 prize',
            participants: '342 participants',
            closesIn: 'Closes in 2 days',
            status: 'Registration Open',
            difficulty: 'Medium',
            image: 'Competitive Programming Tournament',
            createdBy: 'user1'
          },
          {
            id: 2,
            title: 'Algorithm Arena',
            description: 'Solve challenging algorithms under time pressure to prove your coding mastery.',
            date: 'Dec 4, 2025',
            time: '7:00 PM - 9:00 PM',
            prize: '৳750 prize',
            participants: '215 participants',
            closesIn: 'Closes in 2 days',
            status: 'Upcoming',
            difficulty: 'Hard',
            image: 'Competitive Programming Tournament',
            createdBy: 'other'
          },
          {
            id: 3,
            title: 'Byte Battle League',
            description: 'Compete with top programmers in fast-paced coding challenges worldwide.',
            date: 'Dec 4, 2025',
            time: '7:00 PM - 9:00 PM',
            prize: '৳1,500 prize',
            participants: '567 participants',
            closesIn: 'Closes in 2 days',
            status: 'Ongoing',
            difficulty: 'Easy',
            image: 'Competitive Programming Tournament',
            createdBy: 'user1'
          },
          {
            id: 4,
            title: 'Hacker\'s Gauntlet',
            description: 'Push your programming limits with real-time contests and coding duels.',
            date: 'Dec 4, 2025',
            time: '7:00 PM - 9:00 PM',
            prize: '৳1,200 prize',
            participants: '215 participants',
            closesIn: 'Closes in 2 days',
            status: 'Registration Open',
            difficulty: 'Medium',
            image: 'Competitive Programming Tournament',
            createdBy: 'other'
          },
          {
            id: 5,
            title: 'Global Knowledge Championship',
            description: 'Test your knowledge against the best question enthusiasts from around the world.',
            date: 'Dec 10, 2025',
            time: '7:00 PM - 9:00 PM',
            prize: '৳5,000 prize',
            participants: '1,248 participants',
            closesIn: 'Closes in 2 days',
            status: 'Registration Open',
            difficulty: 'Medium',
            image: 'Competitive Programming Tournament',
            createdBy: 'user1'
          }
        ];
        const merged = [...defaultTournaments];
        savedContests.forEach(saved => {
          const index = merged.findIndex(t => t.id === saved.id);
          if (index !== -1) {
            merged[index] = { ...merged[index], ...saved };
          } else {
            merged.push(saved);
          }
        });
        setAllTournaments(merged);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Reload tournaments when returning to this page
  useEffect(() => {
    const savedContests = JSON.parse(localStorage.getItem('qs-contests') || '[]');
    if (savedContests.length > 0) {
      const defaultTournaments = [
        {
          id: 1,
          title: 'Code Clash Championship',
          description: 'Test your coding skills in intense problem-solving battles and competitions.',
          date: 'Dec 4, 2025',
          time: '7:00 PM - 9:00 PM',
          prize: '৳1,000 prize',
          participants: '342 participants',
          closesIn: 'Closes in 2 days',
          status: 'Registration Open',
          difficulty: 'Medium',
          image: 'Competitive Programming Tournament',
          createdBy: 'user1'
        },
        {
          id: 2,
          title: 'Algorithm Arena',
          description: 'Solve challenging algorithms under time pressure to prove your coding mastery.',
          date: 'Dec 4, 2025',
          time: '7:00 PM - 9:00 PM',
          prize: '৳750 prize',
          participants: '215 participants',
          closesIn: 'Closes in 2 days',
          status: 'Upcoming',
          difficulty: 'Hard',
          image: 'Competitive Programming Tournament',
          createdBy: 'other'
        },
        {
          id: 3,
          title: 'Byte Battle League',
          description: 'Compete with top programmers in fast-paced coding challenges worldwide.',
          date: 'Dec 4, 2025',
          time: '7:00 PM - 9:00 PM',
          prize: '৳1,500 prize',
          participants: '567 participants',
          closesIn: 'Closes in 2 days',
          status: 'Ongoing',
          difficulty: 'Easy',
          image: 'Competitive Programming Tournament',
          createdBy: 'user1'
        },
        {
          id: 4,
          title: 'Hacker\'s Gauntlet',
          description: 'Push your programming limits with real-time contests and coding duels.',
          date: 'Dec 4, 2025',
          time: '7:00 PM - 9:00 PM',
          prize: '৳1,200 prize',
          participants: '215 participants',
          closesIn: 'Closes in 2 days',
          status: 'Registration Open',
          difficulty: 'Medium',
          image: 'Competitive Programming Tournament',
          createdBy: 'other'
        },
        {
          id: 5,
          title: 'Global Knowledge Championship',
          description: 'Test your knowledge against the best question enthusiasts from around the world.',
          date: 'Dec 10, 2025',
          time: '7:00 PM - 9:00 PM',
          prize: '৳5,000 prize',
          participants: '1,248 participants',
          closesIn: 'Closes in 2 days',
          status: 'Registration Open',
          difficulty: 'Medium',
          image: 'Competitive Programming Tournament',
          createdBy: 'user1'
        }
      ];
      const merged = [...defaultTournaments];
      savedContests.forEach(saved => {
        const index = merged.findIndex(t => t.id === saved.id);
        if (index !== -1) {
          merged[index] = { ...merged[index], ...saved };
        } else {
          merged.push(saved);
        }
      });
      setAllTournaments(merged);
    }
  }, [location.pathname]);

  // Filter tournaments based on view
  const tournaments = contestView === 'My Contest' 
    ? allTournaments.filter(t => t.createdBy === 'user1')
    : allTournaments;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registration Open':
        return '#16a34a';
      case 'Upcoming':
        return '#f59e0b';
      case 'Ongoing':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#16a34a';
      case 'Medium':
        return '#f59e0b';
      case 'Hard':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="qs-contest-layout">
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
            className="qs-nav-item active"
            onClick={() => navigate('/question-setter/contest')}
          >
            <FaTrophy className="qs-nav-icon" />
            <span className="qs-nav-text">Contest</span>
          </button>
          <button 
            className="qs-nav-item"
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
        <div className="qs-contest-content-area">
          {/* Page Title */}
          <div className="qs-contest-page-header">
            <h1 className="qs-contest-page-title">Contest</h1>
            <p className="qs-contest-page-subtitle">Compete against other quiz enthusiasts and win amazing prizes.</p>
          </div>

          {/* Upcoming Tournament Banner */}
          <div className="qs-upcoming-tournament">
            <div className="qs-upcoming-tag">Upcoming Tournament</div>
            <div className="qs-upcoming-content">
              <div className="qs-upcoming-left">
                <h2 className="qs-upcoming-title">Global Knowledge Championship</h2>
                <p className="qs-upcoming-description">
                  Test your knowledge against the best question enthusiasts from around the world in this premier tournament with multiple rounds of challenging questions.
                </p>
                <div className="qs-upcoming-details">
                  <div className="qs-upcoming-detail-item">
                    <span className="qs-upcoming-detail-label">Date:</span>
                    <span className="qs-upcoming-detail-value">Dec 10, 2025</span>
                  </div>
                  <div className="qs-upcoming-detail-item">
                    <span className="qs-upcoming-detail-label">Time:</span>
                    <span className="qs-upcoming-detail-value">7:00 PM - 9:00 PM</span>
                  </div>
                  <div className="qs-upcoming-detail-item">
                    <FaUsers className="qs-upcoming-icon" />
                    <span className="qs-upcoming-detail-value">1,248 participants</span>
                  </div>
                  <div className="qs-upcoming-detail-item">
                    <FaTrophy className="qs-upcoming-icon" />
                    <span className="qs-upcoming-detail-value">৳5,000 prize money</span>
                  </div>
                </div>
                <button 
                  className="qs-create-competition-btn"
                  onClick={() => navigate('/question-setter/create-competition')}
                >
                  Create Competitions →
                </button>
              </div>
              <div className="qs-upcoming-stats">
                <div className="qs-stat-item">
                  <span className="qs-stat-value">3 Rounds</span>
                </div>
                <div className="qs-stat-item">
                  <span className="qs-stat-value">2 Questions</span>
                </div>
                <div className="qs-stat-item qs-stat-difficulty">
                  <span className="qs-stat-value">Medium Difficulty</span>
                </div>
                <div className="qs-stat-closing">
                  <FaClock className="qs-stat-clock-icon" />
                  <span>Registration closes in</span>
                  <span className="qs-stat-time">2 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* All Tournaments Section */}
          <div className="qs-all-tournaments">
            <div className="qs-tournaments-header">
              <h2 className="qs-all-tournaments-title">All Tournaments</h2>
              <div className="qs-contest-view-tabs">
                <button
                  className={`qs-contest-view-tab ${contestView === 'All Contest' ? 'active' : ''}`}
                  onClick={() => setContestView('All Contest')}
                >
                  All Contest
                </button>
                <button
                  className={`qs-contest-view-tab ${contestView === 'My Contest' ? 'active' : ''}`}
                  onClick={() => setContestView('My Contest')}
                >
                  My Contest
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="qs-tournament-filters">
              <div className="qs-category-filters">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`qs-category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="qs-contest-dropdown">
                <select
                  value={selectedContest}
                  onChange={(e) => setSelectedContest(e.target.value)}
                  className="qs-contest-select"
                >
                  <option value="All Contest">All Contest</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
                <FaChevronDown className="qs-dropdown-arrow" />
              </div>
            </div>

            {/* Tournament Cards */}
            <div className="qs-tournament-cards">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="qs-tournament-card">
                  <div 
                    className="qs-tournament-status"
                    style={{ backgroundColor: getStatusColor(tournament.status) }}
                  >
                    {tournament.status}
                  </div>
                  <div className="qs-tournament-image">
                    <div className="qs-tournament-image-placeholder">
                      {tournament.image}
                    </div>
                    <div 
                      className="qs-tournament-difficulty"
                      style={{ backgroundColor: getDifficultyColor(tournament.difficulty) }}
                    >
                      {tournament.difficulty}
                    </div>
                  </div>
                  <div className="qs-tournament-content">
                    <h3 className="qs-tournament-card-title">{tournament.title}</h3>
                    <p className="qs-tournament-card-description">{tournament.description}</p>
                    <div className="qs-tournament-card-details">
                      <div className="qs-tournament-card-time">
                        {tournament.time} || {tournament.date}
                      </div>
                      <div className="qs-tournament-card-prize">
                        <FaCoins className="qs-prize-icon" />
                        {tournament.prize}
                      </div>
                      <div className="qs-tournament-card-participants">
                        <FaUsers className="qs-participants-icon" />
                        {tournament.participants}
                      </div>
                      <div className="qs-tournament-card-closing">
                        <FaClock className="qs-closing-icon" />
                        {tournament.closesIn}
                      </div>
                    </div>
                    <div className="qs-tournament-card-actions">
                      <div className="qs-action-dropdown">
                        <button
                          className={`qs-action-btn ${openDropdown === tournament.id ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownToggle(tournament.id, e);
                          }}
                        >
                          Actions <FaChevronDown className={`qs-action-chevron ${openDropdown === tournament.id ? 'rotate' : ''}`} />
                        </button>
                        {openDropdown === tournament.id && (
                          <div className="qs-dropdown-menu">
                            <button onClick={(e) => { e.stopPropagation(); handleView(tournament.id); }}>
                              <FaEye /> View
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(tournament.id); }}>
                              <FaEdit /> Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(tournament.id); }} className="qs-delete-btn">
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="qs-tournament-pagination">
              <button 
                className="qs-pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /> Previous
              </button>
              <div className="qs-pagination-numbers">
                <button 
                  className={`qs-pagination-number ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button 
                  className={`qs-pagination-number ${currentPage === 2 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>
              </div>
              <button 
                className="qs-pagination-btn"
                onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
                disabled={currentPage === 2}
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterContest;

