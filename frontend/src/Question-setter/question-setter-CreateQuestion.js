import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaUpload,
  FaTrophy, FaUsers, FaFileAlt
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-CreateQuestion.css';

const QuestionSetterCreateQuestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: 'Byte Battle League',
    description: 'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions just for completeness. It is from these brute force solutions that you cans.',
    difficulty: 'Hard',
    topics: 'Python',
    hints: 'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions just for completeness. It is from these brute force solutions that you cans.',
    timeLimit: '2 hours',
    visibility: 'Public',
    videoLink: 'https://www.youtube.com/watch?a=akasjdujdjapooakalapaoaopa=10',
    solutionDescription: ''
  });

  const [topics, setTopics] = useState(['Python']);
  const [hints, setHints] = useState(['A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions just for completeness. It is from these brute force solutions that you cans.']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalQuestion, setOriginalQuestion] = useState(null);

  // If editing, load question data from localStorage
  useEffect(() => {
    if (editId) {
      // Load from both dummy questions and saved questions
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
      
      const savedQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
      const allQuestions = [...dummyQuestions, ...savedQuestions];
      const questionToEdit = allQuestions.find(q => q.id === parseInt(editId));
      
      if (questionToEdit) {
        setOriginalQuestion(questionToEdit);
        setFormData({
          title: questionToEdit.title || '',
          description: questionToEdit.description || questionToEdit.hints || '',
          difficulty: questionToEdit.difficulty || 'Hard',
          topics: Array.isArray(questionToEdit.topics) ? questionToEdit.topics[0] || '' : (questionToEdit.topics || questionToEdit.category === 'c' ? 'C/C++' : 'Java'),
          hints: Array.isArray(questionToEdit.hints) ? questionToEdit.hints[0] || '' : (questionToEdit.hints || ''),
          timeLimit: questionToEdit.timeLimit || '2 hours',
          visibility: questionToEdit.visibility || 'Public',
          videoLink: questionToEdit.videoLink || '',
          solutionDescription: questionToEdit.solutionDescription || ''
        });
        if (questionToEdit.topics) {
          setTopics(Array.isArray(questionToEdit.topics) ? questionToEdit.topics : [questionToEdit.topics]);
        } else if (questionToEdit.category) {
          setTopics([questionToEdit.category === 'c' ? 'C/C++' : 'Java']);
        }
        if (questionToEdit.hints) {
          setHints(Array.isArray(questionToEdit.hints) ? questionToEdit.hints : [questionToEdit.hints]);
        } else if (questionToEdit.description) {
          setHints([questionToEdit.description]);
        }
      }
    } else {
      // Reset form for new question
      setFormData({
        title: '',
        description: '',
        difficulty: 'Hard',
        topics: '',
        hints: '',
        timeLimit: '2 hours',
        visibility: 'Public',
        videoLink: '',
        solutionDescription: ''
        });
      setTopics([]);
      setHints([]);
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTopic = () => {
    if (formData.topics && formData.topics.trim() && !topics.includes(formData.topics.trim())) {
      setTopics([...topics, formData.topics.trim()]);
      setFormData(prev => ({ ...prev, topics: '' }));
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const handleAddHint = () => {
    if (formData.hints && formData.hints.trim() && !hints.includes(formData.hints.trim())) {
      setHints([...hints, formData.hints.trim()]);
      setFormData(prev => ({ ...prev, hints: '' }));
    }
  };

  const handleRemoveHint = (hintToRemove) => {
    setHints(hints.filter(h => h !== hintToRemove));
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields (Title and Description)');
      setIsSubmitting(false);
      return;
    }

    try {
      // Determine category from topics
      let category = 'c';
      if (topics.length > 0) {
        const topicsStr = topics.join(' ').toLowerCase();
        if (topicsStr.includes('java')) {
          category = 'java';
        } else if (topicsStr.includes('c') || topicsStr.includes('c++')) {
          category = 'c';
        }
      } else if (formData.topics) {
        const topicsStr = formData.topics.toLowerCase();
        if (topicsStr.includes('java')) {
          category = 'java';
        }
      }

      const existingQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
      const questionData = {
        id: editId ? parseInt(editId) : Date.now(),
        title: formData.title,
        description: formData.description,
        category: category,
        difficulty: formData.difficulty,
        topics: topics.length > 0 ? topics : (formData.topics ? [formData.topics] : []),
        hints: hints.length > 0 ? hints : (formData.hints ? [formData.hints] : []),
        timeLimit: formData.timeLimit,
        visibility: formData.visibility,
        videoLink: formData.videoLink,
        solutionDescription: formData.solutionDescription,
        createdAt: originalQuestion?.createdAt || new Date().toISOString().split('T')[0],
        status: 'Published',
        author: originalQuestion?.author || 'User0',
        rating: originalQuestion?.rating || 4.5,
        ratingCount: originalQuestion?.ratingCount || 0,
        players: originalQuestion?.players || 0,
        points: originalQuestion?.points || 50
      };
      
      if (editId) {
        // Update existing question
        const index = existingQuestions.findIndex(q => q.id === parseInt(editId));
        if (index !== -1) {
          existingQuestions[index] = questionData;
        } else {
          existingQuestions.push(questionData);
        }
        alert('Question updated successfully!');
      } else {
        // Create new question
        existingQuestions.push(questionData);
        alert('Question published successfully!');
      }
      
      localStorage.setItem('qs-questions', JSON.stringify(existingQuestions));
      navigate('/question-setter/explore');
    } catch (error) {
      console.error('Error publishing question:', error);
      alert('Failed to publish question. Please try again.');
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
    <div className="qs-create-layout">
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
            <button className="qs-header-icon-btn" title="Document">
              <FaFileAlt />
            </button>
            <button className="qs-header-icon-btn qs-notification-btn" title="Notifications">
              <FaBell />
              <span className="qs-notification-badge">3</span>
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
          <h1 className="qs-page-title">Question Details</h1>

        <div className="qs-create-form">
            {/* Question Information Section */}
          <div className="qs-form-section">
              <h2 className="qs-section-title">Question Information</h2>
            
            <div className="qs-form-group">
                <label htmlFor="title">Question Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                  placeholder="Enter question title"
              />
            </div>

              <div className="qs-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter question description"
                  rows="6"
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

            <div className="qs-form-group">
                <label htmlFor="topics">Topics/Tags</label>
                <div className="qs-input-with-button">
                  <input
                    type="text"
                    id="topics"
                    name="topics"
                    value={formData.topics}
                onChange={handleChange}
                    placeholder="Enter topic or tag"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                  />
                  <button type="button" className="qs-add-btn" onClick={handleAddTopic}>
                    Add
                  </button>
                </div>
                {topics.length > 0 && (
                  <div className="qs-tags-list">
                    {topics.map((topic, index) => (
                      <span key={index} className="qs-tag">
                        {topic}
                        <button type="button" onClick={() => handleRemoveTopic(topic)} className="qs-tag-remove">×</button>
                      </span>
                    ))}
            </div>
                )}
          </div>
            
            <div className="qs-form-group">
                <label htmlFor="hints">Hints</label>
                <div className="qs-textarea-with-button">
              <textarea
                    id="hints"
                    name="hints"
                    value={formData.hints}
                onChange={handleChange}
                    placeholder="Enter hint"
                    rows="4"
              />
                  <button type="button" className="qs-add-btn" onClick={handleAddHint}>
                    Add
                  </button>
                </div>
                {hints.length > 0 && (
                  <div className="qs-hints-list">
                    {hints.map((hint, index) => (
                      <div key={index} className="qs-hint-item">
                        <p>{hint}</p>
                        <button type="button" onClick={() => handleRemoveHint(hint)} className="qs-hint-remove">×</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

              <div className="qs-form-row">
            <div className="qs-form-group">
                  <label htmlFor="timeLimit">Time Limit</label>
                  <select
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                onChange={handleChange}
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="24 hours">24 hours</option>
                  </select>
            </div>

            <div className="qs-form-group">
                  <label htmlFor="visibility">Visibility</label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                onChange={handleChange}
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                    <option value="Unlisted">Unlisted</option>
                  </select>
                </div>
            </div>
          </div>

            {/* Solution Information Section */}
          <div className="qs-form-section">
              <h2 className="qs-section-title">Solution Information</h2>
            
            <div className="qs-form-group">
                <label htmlFor="videoLink">Video link</label>
                <input
                  type="text"
                  id="videoLink"
                  name="videoLink"
                  value={formData.videoLink}
                onChange={handleChange}
                  placeholder="Enter YouTube or video URL"
              />
            </div>

            <div className="qs-form-group">
                <label htmlFor="solutionDescription">Description</label>
              <textarea
                  id="solutionDescription"
                  name="solutionDescription"
                  value={formData.solutionDescription}
                onChange={handleChange}
                  placeholder="Enter solution description"
                  rows="6"
              />
            </div>
          </div>

            {/* Action Buttons */}
          <div className="qs-form-actions">
            <button
                type="button"
                className="qs-action-btn qs-publish-btn"
              onClick={handlePublish}
              disabled={isSubmitting}
            >
                <FaUpload /> {editId ? 'Save Changes' : 'Publish Question'}
            </button>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default QuestionSetterCreateQuestion;
