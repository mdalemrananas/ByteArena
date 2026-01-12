import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaPlus, FaEye, FaEdit, FaTrash,
  FaTrophy, FaStar, FaUsers, FaChevronDown, FaChevronLeft, FaChevronRight,
  FaCoins
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-ExploreQuestions.css';

const QuestionSetterExploreQuestions = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedSort, setSelectedSort] = useState('Most Popular');
  const [activeFilter, setActiveFilter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [questionView, setQuestionView] = useState('All Questions'); // 'All Questions' or 'My Questions'
  const itemsPerPage = 6;

  // Dummy questions data
  useEffect(() => {
    const dummyQuestions = [
      {
        id: 1,
        title: 'Maximum Subarray Sum With Length Divisible by K',
        category: 'c',
        difficulty: 'Hard',
        author: 'User0',
        rating: 4.8,
        ratingCount: 124,
        players: 285,
        points: 60,
        createdAt: '2024-01-15',
        status: 'Published'
      },
      {
        id: 2,
        title: 'Regular Expression Matching',
        category: 'java',
        difficulty: 'Medium',
        author: 'User1',
        rating: 4.6,
        ratingCount: 98,
        players: 245,
        points: 50,
        createdAt: '2024-01-14',
        status: 'Published'
      },
      {
        id: 3,
        title: 'Remove Duplicates from Sorted Array',
        category: 'c',
        difficulty: 'Easy',
        author: 'User2',
        rating: 4.9,
        ratingCount: 156,
        players: 320,
        points: 40,
        createdAt: '2024-01-13',
        status: 'Published'
      },
      {
        id: 4,
        title: 'N-Queens II',
        category: 'java',
        difficulty: 'Hard',
        author: 'User3',
        rating: 4.7,
        ratingCount: 112,
        players: 198,
        points: 70,
        createdAt: '2024-01-12',
        status: 'Published'
      },
      {
        id: 5,
        title: 'Binary Tree Maximum Path Sum',
        category: 'c',
        difficulty: 'Hard',
        author: 'User4',
        rating: 4.5,
        ratingCount: 87,
        players: 175,
        points: 65,
        createdAt: '2024-01-11',
        status: 'Published'
      },
      {
        id: 6,
        title: 'Graph Traversal Algorithms',
        category: 'java',
        difficulty: 'Medium',
        author: 'User5',
        rating: 4.8,
        ratingCount: 134,
        players: 290,
        points: 55,
        createdAt: '2024-01-10',
        status: 'Published'
      },
      {
        id: 7,
        title: 'Two Sum Problem',
        category: 'c',
        difficulty: 'Easy',
        author: 'User6',
        rating: 4.9,
        ratingCount: 201,
        players: 450,
        points: 30,
        createdAt: '2024-01-09',
        status: 'Published'
      },
      {
        id: 8,
        title: 'Reverse Linked List',
        category: 'java',
        difficulty: 'Medium',
        author: 'User7',
        rating: 4.7,
        ratingCount: 145,
        players: 310,
        points: 45,
        createdAt: '2024-01-08',
        status: 'Published'
      }
    ];

    // Load questions from localStorage
    const savedQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
    
    // Combine dummy questions with saved questions (avoid duplicates by ID)
    const allQuestions = [...dummyQuestions];
    savedQuestions.forEach(savedQ => {
      const existingIndex = allQuestions.findIndex(q => q.id === savedQ.id);
      if (existingIndex === -1) {
        // New question, add it
        allQuestions.push({
          ...savedQ,
          author: savedQ.author || `User${savedQ.id}`,
          rating: savedQ.rating || 4.5,
          ratingCount: savedQ.ratingCount || 100,
          players: savedQ.players || 200,
          points: savedQ.points || 50
        });
      } else {
        // Update existing question with saved data
        allQuestions[existingIndex] = { 
          ...allQuestions[existingIndex], 
          ...savedQ,
          author: savedQ.author || allQuestions[existingIndex].author || `User${savedQ.id}`,
          rating: savedQ.rating || allQuestions[existingIndex].rating || 4.5,
          ratingCount: savedQ.ratingCount || allQuestions[existingIndex].ratingCount || 100,
          players: savedQ.players || allQuestions[existingIndex].players || 200,
          points: savedQ.points || allQuestions[existingIndex].points || 50
        };
      }
    });

    setQuestions(allQuestions);
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'c', name: 'C/C++' },
    { id: 'java', name: 'Java' }
  ];

  const difficulties = ['All Levels', 'Easy', 'Medium', 'Hard'];
  const sortOptions = ['Most Popular', 'Newest', 'Highest Rated', 'Highest Reward'];

  // Filter questions
  let filteredQuestions = questions;
  
  // Filter by view (All Questions or My Questions)
  if (questionView === 'My Questions') {
    // Filter questions created by current user (check localStorage for created questions)
    const savedQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
    const myQuestionIds = savedQuestions.map(q => q.id);
    filteredQuestions = filteredQuestions.filter(q => myQuestionIds.includes(q.id));
  }
  
  if (selectedCategory !== 'all') {
    filteredQuestions = filteredQuestions.filter(q => q.category === selectedCategory);
  }
  
  if (selectedDifficulty !== 'All Levels') {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === selectedDifficulty);
  }

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (selectedSort) {
      case 'Newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Highest Reward':
        return b.points - a.points;
      case 'Most Popular':
      default:
        return b.players - a.players;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex);

  const handleDropdownToggle = (questionId, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === questionId ? null : questionId);
  };

  const handleView = (questionId) => {
    setOpenDropdown(null);
    navigate(`/question-setter/question/${questionId}`);
  };

  const handleEdit = (questionId) => {
    setOpenDropdown(null);
    navigate(`/question-setter/create?edit=${questionId}`);
  };

  const handleDelete = (questionId) => {
    setOpenDropdown(null);
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      
      const savedQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
      const filteredSaved = savedQuestions.filter(q => q.id !== questionId);
      localStorage.setItem('qs-questions', JSON.stringify(filteredSaved));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.qs-action-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#00C9A7';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#FF6B6B';
      default: return '#64748b';
    }
  };

  return (
    <div className="qs-explore-layout">
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
            className="qs-nav-item active"
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
          {/* Page Title */}
          <div className="qs-page-header">
            <h1 className="qs-page-title">Explore Questions</h1>
            <p className="qs-page-subtitle">Discover and play quizzes from our community.</p>
          </div>

          {/* Hero Banner */}
          <section className="qs-hero-banner">
            <div className="qs-hero-content">
              <h2 className="qs-hero-title">Your questions Adventure Starts Here: Share, Learn, Enjoy!</h2>
              <p className="qs-hero-subtitle">Build engaging problems, challenge others.</p>
            <button 
                className="qs-hero-btn"
              onClick={() => navigate('/question-setter/create')}
            >
                <FaPlus /> Create Questions
            </button>
          </div>
          </section>

          {/* Search and Filters */}
          <div className="qs-search-filter-section">
            <div className="qs-question-search">
              <FaSearch className="qs-search-icon-small" />
              <input 
                type="text" 
                placeholder="Search questions by title, category..." 
                className="qs-question-search-input"
              />
            </div>
            <div className="qs-quick-filters">
              {['All', 'Hot', 'Trending', "Editor's"].map((filter) => (
                <button
                  key={filter}
                  className={`qs-quick-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
          </div>
        </div>

          {/* Category Tags */}
          <div className="qs-category-tags">
          {categories.map((category) => (
            <button
              key={category.id}
                className={`qs-category-tag ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
            >
              {category.name}
            </button>
          ))}
        </div>

          {/* Main Content Grid */}
          <div className="qs-explore-main">
            {/* Filters Sidebar */}
            <aside className="qs-filters-sidebar">
              <div className="qs-filter-section">
                <h3 className="qs-filter-title">Difficulty</h3>
                <div className="qs-filter-options">
                  {difficulties.map((difficulty) => (
                    <label key={difficulty} className="qs-radio-label">
                      <input
                        type="radio"
                        name="difficulty"
                        value={difficulty}
                        checked={selectedDifficulty === difficulty}
                        onChange={(e) => {
                          setSelectedDifficulty(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="qs-radio-input"
                      />
                      <span className={`qs-radio-custom ${selectedDifficulty === difficulty ? 'checked' : ''}`}>
                        {difficulty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="qs-filter-section">
                <h3 className="qs-filter-title">Sort By</h3>
                <div className="qs-filter-options">
                  {sortOptions.map((option) => (
                    <label key={option} className="qs-radio-label">
                      <input
                        type="radio"
                        name="sort"
                        value={option}
                        checked={selectedSort === option}
                        onChange={(e) => {
                          setSelectedSort(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="qs-radio-input"
                      />
                      <span className={`qs-radio-custom ${selectedSort === option ? 'checked' : ''}`}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="qs-filter-section">
                <h3 className="qs-filter-title">Availability</h3>
                <button 
                  className="qs-availability-btn"
                  onClick={() => setShowAvailability(!showAvailability)}
                >
                  <span>Select availability</span>
                  <FaChevronDown className={showAvailability ? 'rotated' : ''} />
                </button>
              </div>
            </aside>

            {/* Questions List */}
            <div className="qs-questions-list">
              <div className="qs-questions-header">
                <div className="qs-questions-view-tabs">
                  <button
                    className={`qs-questions-view-tab ${questionView === 'All Questions' ? 'active' : ''}`}
                    onClick={() => {
                      setQuestionView('All Questions');
                      setCurrentPage(1);
                    }}
                  >
                    All Questions
                  </button>
                  <button
                    className={`qs-questions-view-tab ${questionView === 'My Questions' ? 'active' : ''}`}
                    onClick={() => {
                      setQuestionView('My Questions');
                      setCurrentPage(1);
                    }}
                  >
                    My Questions
                  </button>
                </div>
                <p className="qs-questions-count">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedQuestions.length)} of {sortedQuestions.length} quizzes.
                </p>
              </div>

        <div className="qs-questions-grid">
                {paginatedQuestions.map((question) => (
            <div key={question.id} className="qs-question-card">
                    <div className="qs-question-thumbnail">
                      <div className="qs-thumbnail-content">COMPETITIVE PROGRAMMING CHALLENGE</div>
                    </div>
                    <div className="qs-question-content">
                      <div className="qs-question-header">
                  <span 
                    className="qs-difficulty-badge"
                          style={{ 
                            background: getDifficultyColor(question.difficulty),
                            color: '#fff'
                          }}
                  >
                    {question.difficulty}
                  </span>
                        <span className="qs-language-badge">
                          {question.category === 'c' ? 'C++' : 'Java'}
                        </span>
                        <div className={`qs-action-dropdown ${openDropdown === question.id ? 'active' : ''}`}>
                  <button
                    className="qs-action-btn"
                            onClick={(e) => handleDropdownToggle(question.id, e)}
                  >
                            Action <FaChevronDown className="qs-action-chevron" />
                  </button>
                  {openDropdown === question.id && (
                    <div className="qs-dropdown-menu">
                      <button onClick={() => handleView(question.id)}>
                        <FaEye /> View
                      </button>
                      <button onClick={() => handleEdit(question.id)}>
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(question.id)} className="qs-delete-btn">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
                <h3 className="qs-question-title">{question.title}</h3>
                      <div className="qs-question-meta">
                        <span className="qs-question-author">by {question.author}</span>
                        <div className="qs-question-rating">
                          <FaStar className="qs-star-icon" />
                          <span>{question.rating} ({question.ratingCount})</span>
                        </div>
                      </div>
                      <div className="qs-question-footer">
                        <div className="qs-question-stats">
                          <FaUsers className="qs-stat-icon" />
                          <span>{question.players} players</span>
                        </div>
                        <div className="qs-question-reward">
                          <FaCoins className="qs-coin-icon" />
                          <span>{question.points}</span>
                        </div>
                </div>
              </div>
            </div>
          ))}
        </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="qs-pagination">
                  <button
                    className="qs-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          className={`qs-pagination-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="qs-pagination-dots">...</span>;
                    }
                    return null;
                  })}
                  <button
                    className="qs-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}

              {paginatedQuestions.length === 0 && (
          <div className="qs-empty-state">
                  <p>No questions found matching your filters.</p>
            <button 
              className="qs-create-btn"
              onClick={() => navigate('/question-setter/create')}
            >
              <FaPlus /> Create Your First Question
            </button>
          </div>
        )}
      </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterExploreQuestions;
