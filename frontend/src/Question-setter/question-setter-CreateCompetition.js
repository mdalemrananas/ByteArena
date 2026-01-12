import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaUpload, FaTrophy, FaUsers, FaCalendar, FaClock, FaCoins
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-CreateCompetition.css';

const QuestionSetterCreateCompetition = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editContestId = searchParams.get('editContest');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    prize: '',
    difficulty: 'Medium',
    status: 'Registration Open',
    category: 'C/C++'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load contest data if editing
  useEffect(() => {
    if (editContestId) {
      setIsEditMode(true);
      const editingContest = JSON.parse(localStorage.getItem('qs-editing-contest') || 'null');
      if (editingContest) {
        setFormData({
          title: editingContest.title || '',
          description: editingContest.description || '',
          date: editingContest.date || '',
          time: editingContest.time || '',
          prize: editingContest.prize || '',
          difficulty: editingContest.difficulty || 'Medium',
          status: editingContest.status || 'Registration Open',
          category: editingContest.category || 'C/C++'
        });
      }
    }
  }, [editContestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields (Title and Description)');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get existing contests from localStorage or use dummy data
      const savedContests = JSON.parse(localStorage.getItem('qs-contests') || '[]');
      const allContests = [
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

      const contestData = {
        id: editContestId ? parseInt(editContestId) : Date.now(),
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        prize: formData.prize,
        difficulty: formData.difficulty,
        status: formData.status,
        category: formData.category,
        participants: editContestId ? (allContests.find(c => c.id === parseInt(editContestId))?.participants || '0 participants') : '0 participants',
        closesIn: editContestId ? (allContests.find(c => c.id === parseInt(editContestId))?.closesIn || 'Closes in 2 days') : 'Closes in 2 days',
        image: 'Competitive Programming Tournament',
        createdBy: 'user1'
      };

      // Get existing saved contests
      const existingSaved = JSON.parse(localStorage.getItem('qs-contests') || '[]');
      
      if (editContestId) {
        // Update existing contest
        const contestIndex = allContests.findIndex(c => c.id === parseInt(editContestId));
        if (contestIndex !== -1) {
          allContests[contestIndex] = { ...allContests[contestIndex], ...contestData };
        }
        // Update saved contests
        const savedIndex = existingSaved.findIndex(c => c.id === parseInt(editContestId));
        if (savedIndex !== -1) {
          existingSaved[savedIndex] = contestData;
        } else {
          existingSaved.push(contestData);
        }
        localStorage.setItem('qs-contests', JSON.stringify(existingSaved));
        localStorage.removeItem('qs-editing-contest');
        alert('Contest updated successfully!');
      } else {
        // Create new contest
        allContests.push(contestData);
        existingSaved.push(contestData);
        localStorage.setItem('qs-contests', JSON.stringify(existingSaved));
        alert('Contest created successfully!');
      }
      
      // Trigger storage event to update contest page
      window.dispatchEvent(new Event('storage'));
      navigate('/question-setter/contest');
    } catch (error) {
      console.error('Error saving contest:', error);
      alert('Failed to save contest. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="qs-create-competition-layout">
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
              <FaUsers />
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
        <div className="qs-content-area">
          <h1 className="qs-page-title">{isEditMode ? 'Edit Competition' : 'Create Competition'}</h1>

          <div className="qs-create-form">
            {/* Competition Information Section */}
            <div className="qs-form-section">
              <h2 className="qs-section-title">Competition Information</h2>
            
              <div className="qs-form-group">
                <label htmlFor="title">Competition Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter competition title"
                />
              </div>

              <div className="qs-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter competition description"
                  rows="6"
                />
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Dec 4, 2025"
                  />
                </div>

                <div className="qs-form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="text"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    placeholder="7:00 PM - 9:00 PM"
                  />
                </div>
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="prize">Prize</label>
                  <input
                    type="text"
                    id="prize"
                    name="prize"
                    value={formData.prize}
                    onChange={handleChange}
                    placeholder="৳1,000 prize"
                  />
                </div>

                <div className="qs-form-group">
                  <label htmlFor="difficulty">Difficulty Level</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="qs-form-row">
                <div className="qs-form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Registration Open">Registration Open</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="qs-form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="C/C++">C/C++</option>
                    <option value="Java">Java</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="qs-form-actions">
              <button
                type="button"
                className="qs-publish-btn"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                <FaUpload /> {isEditMode ? 'Save Changes' : 'Publish Competition'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterCreateCompetition;

