import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaChevronLeft, FaChevronRight, FaSignOutAlt, FaPlus, FaEye,
  FaTrophy, FaStar, FaUsers, FaCode, FaDatabase, FaBolt
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-Homepage.css';

const QuestionSetterHomepage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const categoriesScrollRef = useRef(null);
  const problemsScrollRef = useRef(null);
  const contestScrollRef = useRef(null);
  const competitorsScrollRef = useRef(null);
  const winnersScrollRef = useRef(null);

  // Helper to correctly resolve public assets in any deployment base path
  const getImageUrl = (path) => `${process.env.PUBLIC_URL || ''}${path}`;

  // Dummy data
  const categories = [
    { id: 1, name: 'JavaScript', title: 'JAVASCRIPT 30 DAYS CHALLENGE', icon: <FaCode />, bgColor: '#1e3a8a', image: getImageUrl('/JavaScript_Cover.jpg') },
    { id: 2, name: 'Database', title: 'Database', icon: <FaDatabase />, bgColor: '#1e3a8a', image: getImageUrl('/Datbase_Cover.jpg') },
    { id: 3, name: 'Algorithms', title: 'ALGORITHMS', icon: <FaBolt />, bgColor: '#ffffff', textColor: '#000', image: getImageUrl('/Algorithms_Cover.jpg') },
    { id: 4, name: 'Concurrency', title: 'CONCURRENCY', icon: <FaBolt />, bgColor: '#6d55ff', image: getImageUrl('/Concurrency_Cover.jpg') },
  ];

  const latestProblems = [
    { id: 1, title: 'Maximum Subarray Sum With Length Divisible By K', difficulty: 'Medium', difficultyColor: '#fbbf24', image: getImageUrl('/Latest Problem 1.png') },
    { id: 2, title: 'Regular Expression Matching', difficulty: 'Hard', difficultyColor: '#ef4444', image: getImageUrl('/Latest Problem 2.png') },
    { id: 3, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', difficultyColor: '#10b981', image: getImageUrl('/Latest Problem 3.png') },
    { id: 4, title: 'N-Queens II', difficulty: 'Hard', difficultyColor: '#3b82f6', image: getImageUrl('/Latest Problem 4.png') },
  ];

  const contests = [
    {
      id: 1, 
      title: 'Science Quiz: Space Exploration', 
      creator: 'Alex Smith', 
      rating: 4.9, 
      prize: 'Win Money ৳5000',
      players: '2.5k',
      space: '500',
      tag: '2 DAYS LEFT',
      tagColor: '#3b82f6',
      trending: false,
      image: getImageUrl('/Contest 1.png')
    },
    {
      id: 2, 
      title: 'World Geography Challenge: Capitals & Geography', 
      creator: 'Alex Smith', 
      rating: 4.8, 
      prize: 'Win Money ৳5000',
      players: '1.9k',
      space: '200',
      tag: '1 DAY LEFT',
      tagColor: '#3b82f6',
      trending: false,
      image: getImageUrl('/Contest 2.png')
    },
    {
      id: 3, 
      title: 'Brain Teasers & Logic Puzzles', 
      creator: 'Alex Smith', 
      rating: 4.7, 
      prize: 'Win Money ৳5000',
      players: '3.2k',
      space: '800',
      tag: 'TRENDING',
      tagColor: '#f59e0b',
      trending: true,
      image: getImageUrl('/Contest 3.png')
    },
    { 
      id: 4, 
      title: 'History\'s Greatest Mysteries', 
      creator: 'Alex Smith', 
      rating: 4.9, 
      prize: 'Win Money ৳5000',
      players: '1.9k',
      space: '500',
      tag: 'EDITOR\'S CHOICE',
      tagColor: '#14b8a6',
      trending: false,
      image: getImageUrl('/Contest 4.png')
    },
  ];

  const topCompetitors = [
    { id: 1, name: 'Imran', country: 'Bangladesh', rank: 1, problems: 42, points: 1250, tag: null, avatar: 'I', image: getImageUrl('/Top programmer 1.png') },
    { id: 2, name: 'Lamia', country: 'Bangladesh', rank: 2, problems: 38, points: 980, tag: null, avatar: 'L', image: getImageUrl('/Top programmer 2.png') },
    { id: 3, name: 'Ananna', country: 'Bangladesh', rank: 3, problems: 35, points: 875, tag: null, avatar: 'A', image: getImageUrl('/Top programmer 3.png') },
    { id: 4, name: 'Mohin', country: 'Bangladesh', rank: 4, problems: 31, points: 720, tag: null, avatar: 'M', image: getImageUrl('/Top programmer 4.png') },
  ];

  const liveWinners = [
    { id: 1, name: 'Palak', time: '1 week ago', prize: 'Won ৳5000 playing \'Sports Trivia\'', avatar: 'P' },
    { id: 2, name: 'Lamia', time: '2 weeks ago', prize: 'Won ৳5000 playing \'Music Masters\'', avatar: 'L' },
    { id: 3, name: 'Imran', time: '3 weeks ago', prize: 'Won ৳5000 playing \'Science Trivia\'', avatar: 'I' },
    { id: 4, name: 'Ananna', time: '4 weeks ago', prize: 'Won ৳5000 playing \'Pop Culture Quiz\'', avatar: 'A' },
    { id: 5, name: 'Mohin', time: '1 month ago', prize: 'Won ৳5000 playing \'Geography Challenge\'', avatar: 'M' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="qs-homepage-layout">
      {/* Sidebar */}
      <aside className="qs-sidebar">
        <div className="qs-sidebar-logo">
          <span className="qs-logo-byte">Byte</span>
          <span className="qs-logo-arena">Arena</span>
            </div>
        <nav className="qs-sidebar-nav">
          <button 
            className="qs-nav-item active"
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
            <button className="qs-header-icon-btn" title="Notifications">
              <FaBell />
            </button>
            <button className="qs-header-icon-btn" title="Settings">
              <FaCog />
            </button>
            <button className="qs-header-icon-btn" title="Help">
              <FaQuestionCircle />
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
        <div className="qs-content-area">
          {/* Hero Banner */}
          <section
            className="qs-hero-banner"
            style={{
              backgroundImage: `url(${getImageUrl('/Dashboard_Banner.jpg')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="qs-hero-content">
              <h1 className="qs-hero-title">Your questions Adventure Starts Here: Share, Learn, Enjoy!</h1>
              <p className="qs-hero-subtitle">Build engaging problems, challenge others.</p>
              <button 
                className="qs-hero-btn"
                onClick={() => navigate('/question-setter/create')}
              >
                <FaPlus /> Create Questions
              </button>
            </div>
          </section>

          {/* Problems Categories */}
          <section className="qs-section">
            <h2 className="qs-section-title">Problems Categories</h2>
            <div className="qs-categories-container">
              <button 
                className="qs-scroll-btn qs-scroll-left"
                onClick={() => scroll(categoriesScrollRef, 'left')}
              >
                <FaChevronLeft />
              </button>
              <div className="qs-categories-scroll" ref={categoriesScrollRef}>
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="qs-category-card"
                    style={{ 
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: category.textColor || '#fff'
                    }}
                    onClick={() => navigate(`/question-setter/explore?category=${category.name}`)}
                  >
                    <div className="qs-category-overlay"></div>
                    <div className="qs-category-icon">{category.icon}</div>
                    <div className="qs-category-title">{category.title}</div>
                  </div>
                ))}
              </div>
              <button 
                className="qs-scroll-btn qs-scroll-right"
                onClick={() => scroll(categoriesScrollRef, 'right')}
              >
                <FaChevronRight />
              </button>
            </div>
          </section>

          {/* Latest Problems */}
          <section className="qs-section">
            <div className="qs-section-header">
              <h2 className="qs-section-title">Latest Problems</h2>
              <button 
                className="qs-view-all-btn"
                onClick={() => navigate('/question-setter/explore')}
              >
                View All Problems
              </button>
            </div>
            <div className="qs-categories-container">
              <button 
                className="qs-scroll-btn qs-scroll-left"
                onClick={() => scroll(problemsScrollRef, 'left')}
              >
                <FaChevronLeft />
              </button>
              <div className="qs-categories-scroll" ref={problemsScrollRef}>
                {latestProblems.map((problem) => (
                  <div 
                    key={problem.id} 
                    className="qs-category-card qs-card-with-button"
                    style={{ 
                      backgroundImage: `url(${problem.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      color: '#fff'
                    }}
                    onClick={() => navigate(`/question-setter/explore?problem=${problem.id}`)}
                  >
                    <div className="qs-category-overlay"></div>
                    <button 
                      className="qs-problem-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/question-setter/explore?problem=${problem.id}`);
                      }}
                    >
                      <FaEye /> View Details
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="qs-scroll-btn qs-scroll-right"
                onClick={() => scroll(problemsScrollRef, 'right')}
              >
                <FaChevronRight />
              </button>
            </div>
          </section>

          {/* Contest Section */}
          <section className="qs-section">
            <div className="qs-section-header">
              <div>
                <h2 className="qs-section-title">Contest</h2>
                <p className="qs-section-subtitle">Specially selected quizzes you don't want to miss.</p>
              </div>
              <div className="qs-filter-tabs">
                {['All', 'Hot', 'Trending', "Editor's Choice"].map((filter) => (
                  <button
                    key={filter}
                    className={`qs-filter-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="qs-categories-container">
              <button 
                className="qs-scroll-btn qs-scroll-left"
                onClick={() => scroll(contestScrollRef, 'left')}
              >
                <FaChevronLeft />
              </button>
              <div className="qs-categories-scroll" ref={contestScrollRef}>
                {contests.map((contest) => (
                  <div 
                    key={contest.id} 
                    className="qs-category-card qs-card-with-button"
                    style={{ 
                      backgroundImage: `url(${contest.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      color: '#fff'
                    }}
                    onClick={() => navigate(`/question-setter/contest/${contest.id}`)}
                  >
                    <div className="qs-category-overlay"></div>
                    {contest.tag && (
                      <div className="qs-contest-tag-overlay" style={{ backgroundColor: contest.tagColor }}>
                        {contest.tag}
                      </div>
                    )}
                    <button 
                      className="qs-problem-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/question-setter/contest/${contest.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="qs-scroll-btn qs-scroll-right"
                onClick={() => scroll(contestScrollRef, 'right')}
              >
                <FaChevronRight />
              </button>
            </div>
          </section>

          {/* Top Competitors */}
          <section className="qs-section">
        <div className="qs-section-header">
              <h2 className="qs-section-title">Top Competitors</h2>
              <div className="qs-section-actions">
                <button 
                  className="qs-view-all-btn"
                  onClick={() => navigate('/question-setter/leaderboard')}
                >
                  View Full Leaderboard
                </button>
                <div className="qs-scroll-controls">
                  <button onClick={() => scroll(competitorsScrollRef, 'left')}>
                    <FaChevronLeft />
                  </button>
                  <button onClick={() => scroll(competitorsScrollRef, 'right')}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
            <div className="qs-competitors-container">
              <div className="qs-competitors-scroll" ref={competitorsScrollRef}>
              {topCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="qs-competitor-card"
                    style={{
                      backgroundImage: `url(${competitor.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="qs-competitor-overlay"></div>
                    <div className="qs-competitor-content">
                      <div className="qs-competitor-avatar">{competitor.avatar}</div>
                      {competitor.tag && (
                        <div className="qs-competitor-tag">{competitor.tag}</div>
                      )}
                      <h3 className="qs-competitor-name">{competitor.name}</h3>
                      <p className="qs-competitor-country">{competitor.country}</p>
                      <div className="qs-competitor-stats">
                        <div className="qs-competitor-stat">
                          <span className="qs-stat-label">Rank</span>
                          <span className="qs-stat-value">#{competitor.rank}</span>
                        </div>
                        <div className="qs-competitor-stat">
                          <span className="qs-stat-label">Problems Solved</span>
                          <span className="qs-stat-value">{competitor.problems}</span>
                        </div>
                        <div className="qs-competitor-stat">
                          <span className="qs-stat-label">Points</span>
                          <span className="qs-stat-value">{competitor.points.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
            </div>
          ))}
              </div>
        </div>
      </section>

          {/* Live Winners */}
          <section className="qs-section">
        <div className="qs-section-header">
              <h2 className="qs-section-title">Live Winners</h2>
              <button className="qs-view-all-btn">5 recent winners</button>
        </div>
            <div className="qs-winners-container">
              <div className="qs-winners-scroll" ref={winnersScrollRef}>
                {liveWinners.map((winner) => (
                  <div key={winner.id} className="qs-winner-card">
                    <div className="qs-winner-trophy">
                      <FaTrophy />
              </div>
                    <div className="qs-winner-avatar">{winner.avatar}</div>
                    <h3 className="qs-winner-name">{winner.name}</h3>
                    <p className="qs-winner-prize">{winner.prize}</p>
                    <p className="qs-winner-time">{winner.time}</p>
            </div>
          ))}
              </div>
        </div>
      </section>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterHomepage;
