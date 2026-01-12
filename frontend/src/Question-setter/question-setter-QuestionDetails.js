import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaFileAlt, FaComments, FaStar,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle,
  FaChartLine, FaGem, FaMedal
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-QuestionDetails.css';

const QuestionSetterQuestionDetails = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionSort, setSubmissionSort] = useState('Correct');
  const [leaderboardSort, setLeaderboardSort] = useState('Score');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load question data
    const loadQuestion = () => {
      const dummyQuestions = [
        {
          id: 1,
          title: 'Two Sum',
          category: 'c',
          difficulty: 'Medium',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
              input: 'nums = [3,2,4], target = 6',
              output: '[1,2]',
              explanation: null
            },
            {
              input: 'nums = [3,3], target = 6',
              output: '[0,1]',
              explanation: null
            }
          ],
          constraints: [
            '2 <= nums.length <= 104',
            '-109 <= nums[i] <= 109',
            '-109 <= target <= 109',
            'Only one valid answer exists.'
          ],
          followUp: 'Follow-up: Can you come up with an algorithm that is less than O(n2) time complexity?',
          participants: 1248,
          prizePool: 5000,
          timePerQuestion: '1 hour',
          totalQuestions: 2
        },
        {
          id: 2,
          title: 'Regular Expression Matching',
          category: 'java',
          difficulty: 'Hard',
          description: 'Given an input string s and a pattern p, implement regular expression matching with support for \'.\' and \'*\' where:\n\n\'.\' Matches any single character.\n\'*\' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).',
          examples: [
            {
              input: 's = "aa", p = "a"',
              output: 'false',
              explanation: '"a" does not match the entire string "aa".'
            }
          ],
          constraints: [
            '1 <= s.length <= 20',
            '1 <= p.length <= 30',
            's contains only lowercase English letters.',
            'p contains only lowercase English letters, \'.\', and \'*\'.',
            'It is guaranteed for each appearance of the character \'*\', there will be a previous valid character to match.'
          ],
          followUp: null,
          participants: 856,
          prizePool: 3000,
          timePerQuestion: '2 hours',
          totalQuestions: 1
        }
      ];

      const savedQuestions = JSON.parse(localStorage.getItem('qs-questions') || '[]');
      const allQuestions = [...dummyQuestions, ...savedQuestions];
      
      const foundQuestion = allQuestions.find(q => q.id === parseInt(questionId));
      
      if (foundQuestion) {
        // Enhance question with default values if missing
        setQuestion({
          ...foundQuestion,
          examples: foundQuestion.examples || [
            {
              input: foundQuestion.sampleInput || 'Input example',
              output: foundQuestion.sampleOutput || 'Output example',
              explanation: foundQuestion.explanation || null
            }
          ],
          constraints: foundQuestion.constraints || [
            '1 <= n <= 10^5',
            'All values are integers'
          ],
          followUp: foundQuestion.followUp || null,
          participants: foundQuestion.participants || 500,
          prizePool: foundQuestion.prizePool || 2000,
          timePerQuestion: foundQuestion.timeLimit || '1 hour',
          totalQuestions: foundQuestion.totalQuestions || 1
        });
      } else {
        // Default question if not found
        setQuestion({
          id: parseInt(questionId),
          title: 'Question Not Found',
          description: 'The question you are looking for does not exist.',
          examples: [],
          constraints: [],
          followUp: null,
          participants: 0,
          prizePool: 0,
          timePerQuestion: 'N/A',
          totalQuestions: 0
        });
      }
      
      setLoading(false);
    };

    loadQuestion();
  }, [questionId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="qs-details-layout">
        <div className="qs-loading">Loading...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="qs-details-layout">
        <div className="qs-error">Question not found</div>
      </div>
    );
  }

  return (
    <div className="qs-details-layout">
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
        <div className="qs-content-area">
          <div className={`qs-details-container ${activeTab === 'Overview' ? 'qs-overview-layout' : 'qs-full-width'}`}>
            {/* Main Content */}
            <div className="qs-details-main">
              {/* Navigation Tabs */}
              <div className="qs-details-tabs">
                <button
                  className={`qs-details-tab ${activeTab === 'Overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Overview')}
                >
                  Overview
                </button>
                <button
                  className={`qs-details-tab ${activeTab === 'Submissions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Submissions')}
                >
                  Submissions
                </button>
                <button
                  className={`qs-details-tab ${activeTab === 'Leaderboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Leaderboard')}
                >
                  Leaderboard
                </button>
              </div>

              {/* Tab Content */}
              <div className="qs-details-content">
                {activeTab === 'Overview' && (
                  <div className="qs-overview-content-wrapper">
                    <div className="qs-overview">
                    <h1 className="qs-problem-title">1. {question.title}</h1>
                    
                    <div className="qs-problem-description">
                      {question.description.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Examples */}
                    {question.examples && question.examples.length > 0 && (
                      <div className="qs-examples">
                        <h2 className="qs-section-heading">Examples:</h2>
                        {question.examples.map((example, index) => (
                          <div key={index} className="qs-example">
                            <h3 className="qs-example-title">Example {index + 1}:</h3>
                            <div className="qs-example-content">
                              <div className="qs-example-item">
                                <span className="qs-example-label">Input:</span>
                                <code className="qs-example-code">{example.input}</code>
                              </div>
                              <div className="qs-example-item">
                                <span className="qs-example-label">Output:</span>
                                <code className="qs-example-code">{example.output}</code>
                              </div>
                              {example.explanation && (
                                <div className="qs-example-item">
                                  <span className="qs-example-label">Explanation:</span>
                                  <p className="qs-example-text">{example.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints */}
                    {question.constraints && question.constraints.length > 0 && (
                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Constraints:</h2>
                        <ul className="qs-constraints-list">
                          {question.constraints.map((constraint, index) => (
                            <li key={index} className="qs-constraint-item">
                              <code>{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up */}
                    {question.followUp && (
                      <div className="qs-followup">
                        <p className="qs-followup-text">
                          <code>{question.followUp}</code>
                        </p>
                      </div>
                    )}
                    </div>

                    {/* Right Sidebar - Tournament Stats (Only for Overview) */}
                    <aside className="qs-details-sidebar">
                      <div className="qs-tournament-stats">
                        <h2 className="qs-stats-title">Tournament Stats</h2>
                        <div className="qs-stats-list">
                          <div className="qs-stat-item">
                            <span className="qs-stat-label">Participants:</span>
                            <span className="qs-stat-value">{question.participants.toLocaleString()}</span>
                          </div>
                          <div className="qs-stat-item">
                            <span className="qs-stat-label">Prize Pool:</span>
                            <span className="qs-stat-value">৳{question.prizePool.toLocaleString()}</span>
                          </div>
                          <div className="qs-stat-item">
                            <span className="qs-stat-label">Difficulty:</span>
                            <span 
                              className="qs-stat-value qs-difficulty-badge"
                              style={{
                                color: question.difficulty === 'Easy' ? '#00C9A7' : 
                                       question.difficulty === 'Medium' ? '#F59E0B' : '#FF6B6B'
                              }}
                            >
                              {question.difficulty}
                            </span>
                          </div>
                          <div className="qs-stat-item">
                            <span className="qs-stat-label">Time per Question:</span>
                            <span className="qs-stat-value">{question.timePerQuestion}</span>
                          </div>
                          <div className="qs-stat-item">
                            <span className="qs-stat-label">Total Questions:</span>
                            <span className="qs-stat-value">{question.totalQuestions}</span>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}

                {activeTab === 'Submissions' && (
                  <div className="qs-submissions">
                    {/* Search and Sort */}
                    <div className="qs-submissions-filters">
                      <div className="qs-search-filter">
                        <FaSearch className="qs-filter-search-icon" />
                        <input
                          type="text"
                          placeholder="Search competitor..."
                          value={submissionSearch}
                          onChange={(e) => setSubmissionSearch(e.target.value)}
                          className="qs-filter-search-input"
                        />
                      </div>
                      <div className="qs-sort-filter">
                        <label>Sort by:</label>
                        <select
                          value={submissionSort}
                          onChange={(e) => setSubmissionSort(e.target.value)}
                          className="qs-sort-select"
                        >
                          <option value="Correct">Correct</option>
                          <option value="Points">Points</option>
                          <option value="Time">Time</option>
                        </select>
                        <FaChevronDown className="qs-sort-arrow" />
                      </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="qs-table-container">
                      <table className="qs-submissions-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Actions</th>
                            <th>Language</th>
                            <th>Points</th>
                            <th>Time</th>
                            <th>Stage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { rank: 1, name: 'User1', country: 'Bangladesh', language: 'C', points: 78, time: '1 hour', stage: 'Correct', avatar: 'U1' },
                            { rank: 2, name: 'User2', country: 'Bangladesh', language: 'java', points: 65, time: '1 hour 2 min', stage: 'Correct', avatar: 'U2' },
                            { rank: 3, name: 'User3', country: 'Bangladesh', language: 'java', points: 59, time: '1 hour 3 min', stage: 'Wrong', avatar: 'U3' },
                            { rank: 4, name: 'User4', country: 'Bangladesh', language: 'java', points: 52, time: '1 hour 4 min', stage: 'Wrong', avatar: 'U4' },
                            { rank: 5, name: 'User5', country: 'Bangladesh', language: 'C++', points: 48, time: '1 hour 5 min', stage: 'No code', avatar: 'U5' },
                            { rank: 6, name: 'User6', country: 'Bangladesh', language: 'C++', points: 45, time: '1 hour 6 min', stage: 'No code', avatar: 'U6' },
                            { rank: 7, name: 'User7', country: 'Bangladesh', language: 'C', points: 41, time: '1 hour 7 min', stage: 'No code', avatar: 'U7' },
                            { rank: 8, name: 'User8', country: 'Bangladesh', language: 'C++', points: 38, time: '1 hour 8 min', stage: 'No code', avatar: 'U8' },
                            { rank: 9, name: 'User9', country: 'Bangladesh', language: 'C++', points: 36, time: '1 hour 9 min', stage: 'No code', avatar: 'U9' },
                            { rank: 10, name: 'User10', country: 'Bangladesh', language: 'java', points: 33, time: '1 hour 10 min', stage: 'No code', avatar: 'U10' }
                          ].map((user) => (
                            <tr key={user.rank}>
                              <td className="qs-rank-cell">{user.rank}</td>
                              <td className="qs-user-cell">
                                <div className="qs-user-info">
                                  <div className="qs-user-avatar">{user.avatar}</div>
                                  <div className="qs-user-details">
                                    <span className="qs-user-name">{user.name}</span>
                                    <span className="qs-user-country">{user.country}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="qs-actions-cell">
                                <button 
                                  className="qs-view-btn"
                                  onClick={() => navigate(`/question-setter/submission/${questionId}/${user.name}`)}
                                >
                                  View
                                </button>
                              </td>
                              <td className="qs-language-cell">{user.language}</td>
                              <td className="qs-points-cell">
                                <FaStar className="qs-star-icon" />
                                {user.points}
                              </td>
                              <td className="qs-time-cell">{user.time}</td>
                              <td className="qs-stage-cell">
                                <span className={`qs-stage-badge qs-stage-${user.stage.toLowerCase().replace(' ', '-')}`}>
                                  {user.stage === 'Correct' && <FaCheckCircle />}
                                  {user.stage === 'Wrong' && <FaTimesCircle />}
                                  {user.stage}
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
                )}

                {activeTab === 'Leaderboard' && (
                  <div className="qs-leaderboard">
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
                          <option value="Time">Time</option>
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
                            <th>Time</th>
                            <th>Badge</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { rank: 1, name: 'User1', country: 'Bangladesh', score: 9850, level: 78, time: '1 hour', badge: 'Diamond', avatar: 'U1' },
                            { rank: 2, name: 'User2', country: 'Bangladesh', score: 8750, level: 65, time: '1 hour 2 min', badge: 'Platinum', avatar: 'U2' },
                            { rank: 3, name: 'User3', country: 'Bangladesh', score: 7650, level: 59, time: '1 hour 3 min', badge: 'Gold', avatar: 'U3' },
                            { rank: 4, name: 'User4', country: 'Bangladesh', score: 6850, level: 52, time: '1 hour 4 min', badge: 'Gold', avatar: 'U4' },
                            { rank: 5, name: 'User5', country: 'Bangladesh', score: 6250, level: 48, time: '1 hour 5 min', badge: 'Silver', avatar: 'U5' },
                            { rank: 6, name: 'User6', country: 'Bangladesh', score: 5750, level: 45, time: '1 hour 6 min', badge: 'Silver', avatar: 'U6' },
                            { rank: 7, name: 'User7', country: 'Bangladesh', score: 5250, level: 41, time: '1 hour 7 min', badge: 'Bronze', avatar: 'U7' },
                            { rank: 8, name: 'User8', country: 'Bangladesh', score: 4850, level: 38, time: '1 hour 8 min', badge: 'Bronze', avatar: 'U8' },
                            { rank: 9, name: 'User9', country: 'Bangladesh', score: 4550, level: 36, time: '1 hour 9 min', badge: 'Bronze', avatar: 'U9' },
                            { rank: 10, name: 'User10', country: 'Bangladesh', score: 4350, level: 33, time: '1 hour 10 min', badge: 'Bronze', avatar: 'U10' }
                          ].map((user) => (
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
                              <td className="qs-time-cell">
                                <div className="qs-time-info">
                                  <span>{user.time}</span>
                                  <div className="qs-active-status">
                                    <span>Active</span>
                                    <FaChartLine className="qs-active-icon" />
                                  </div>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterQuestionDetails;

