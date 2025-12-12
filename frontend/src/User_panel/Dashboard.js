import React, { useState, useEffect } from 'react';
import { FaHome, FaFire, FaFolder, FaTrophy, FaNewspaper, FaSearch, 
  FaBell, FaCommentAlt, FaPlusCircle, FaCog, FaSignOutAlt, FaUserCircle, 
  FaDollarSign, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import './Dashboard.css';

// Mock data
const menuItems = [
  { name: 'Home', icon: <FaHome />, active: true },
  { name: "Today's Challenge", icon: <FaFire /> },
  { name: 'Categories', icon: <FaFolder /> },
  { name: 'Quiz Battle', icon: <FaTrophy /> },
  { name: 'News & Updates', icon: <FaNewspaper /> },
  { name: 'Explore Quizzes', icon: <FaSearch /> },
  { name: 'Quiz Tournament', icon: <FaTrophy /> },
  { name: 'Leaderboard', icon: <FaTrophy /> },
  { name: 'Quiz Creator Tips', icon: <FaCog /> },
  { name: 'Quiz Discussions', icon: <FaCommentAlt /> },
  { name: 'Create Quiz', icon: <FaPlusCircle /> },
  { name: 'AI Quiz Generator', icon: <FaCog /> },
  { name: 'Affiliate Page', icon: <FaDollarSign /> },
  { name: 'Pricing Plan', icon: <FaDollarSign /> },
  { name: 'Support', icon: <FaCog /> },
  { name: 'Logout', icon: <FaSignOutAlt />, className: 'logout' },
];

const categories = [
  { id: 1, name: 'Food & Cooking', count: 12, color: '#FF6B6B' },
  { id: 2, name: 'General Knowledge', count: 24, color: '#4ECDC4' },
  { id: 3, name: 'Geography', count: 18, color: '#45B7D1' },
  { id: 4, name: 'Health & Medicine', count: 9, color: '#96CEB4' },
  { id: 5, name: 'Language & Grammar', count: 15, color: '#FFEEAD' },
];

const socialIcons = [
  { icon: <FaFacebook />, url: '#' },
  { icon: <FaTwitter />, url: '#' },
  { icon: <FaInstagram />, url: '#' },
  { icon: <FaYoutube />, url: '#' },
];

function App() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes warning

  // Session timeout settings
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes warning

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

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="logo">QuizHub</h2>
          <button 
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </div>
        <nav className="menu">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className={`menu-item ${item.active ? 'active' : ''} ${item.className || ''}`} onClick={item.name === 'Logout' ? handleLogout : undefined}>
                <span className="menu-icon">{item.icon}</span>
                {isSidebarOpen && <span className="menu-text">{item.name}</span>}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search quizzes, categories, creators..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <button className="icon-btn">
              <FaCommentAlt />
              <span className="badge">5</span>
            </button>
            <div className="wallet">
              <span className="balance">$124.50</span>
              <button className="avatar">
                <FaUserCircle />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Your Quiz Adventure Starts Here: Play, Share, Earn!</h1>
            <p>Build engaging quizzes, challenge others, and earn rewards for your knowledge.</p>
            <div className="hero-buttons">
              <button className="btn primary">Create Quiz</button>
              <button className="btn secondary">Join Contest</button>
            </div>
          </div>
          <div className="hero-image">
            {/* Placeholder for illustration */}
            <div className="illustration">
              <div className="quiz-card">Science</div>
              <div className="quiz-card">History</div>
              <div className="quiz-card">Geography</div>
              <div className="trophy">🏆</div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories">
          <div className="section-header">
            <h2>Quiz Categories</h2>
            <div className="carousel-controls">
              <button>‹</button>
              <button>›</button>
            </div>
          </div>
          <div className="category-cards">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="category-card"
                style={{ backgroundColor: category.color }}
              >
                <span className="category-count">{category.count}</span>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>QuizHub</h3>
              <p>Build engaging quizzes, challenge others, and earn rewards for your knowledge.</p>
              <div className="social-icons">
                {socialIcons.map((social, index) => (
                  <a key={index} href={social.url} className="social-icon">
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#">Dashboard</a></li>
                <li><a href="#">Create Quiz</a></li>
                <li><a href="#">Leaderboard</a></li>
                <li><a href="#">Affiliate Program</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Categories</h4>
              <ul>
                <li><a href="#">Science</a></li>
                <li><a href="#">History</a></li>
                <li><a href="#">Maths</a></li>
                <li><a href="#">Literature</a></li>
                <li><a href="#">Sports</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Us</h4>
              <p>123 Quiz Street, Knowledge City</p>
              <p>+1 234 567 890</p>
              <p>info@quizhub.com</p>
              <button className="btn primary">Contact Support</button>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <input type="email" placeholder="Enter your email" />
            <button className="btn primary">Subscribe</button>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} QuizHub. All rights reserved.</p>
          </div>
        </footer>
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

export default App;
