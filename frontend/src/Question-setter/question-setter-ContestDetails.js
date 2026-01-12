import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaComments, FaChevronDown,
  FaCalendar, FaClock, FaCoins, FaFileAlt, FaAward, FaStar,
  FaCheckCircle, FaTimesCircle, FaChartLine, FaGem, FaMedal,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import './question-setter-ContestDetails.css';

const QuestionSetterContestDetails = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionSort, setSubmissionSort] = useState('Correct');
  const [leaderboardSort, setLeaderboardSort] = useState('Score');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  useEffect(() => {
    // Load contest data
    const loadContest = () => {
      // Dummy contest data
      const dummyContests = [
        {
          id: 1,
          title: 'Global Knowledge Championship',
          description: 'Test your knowledge against the best question enthusiasts from around the world in this premier tournament with multiple rounds of challenging questions.',
          date: 'Dec 10, 2025',
          time: '7:00 PM - 9:00 PM',
          participants: 1248,
          prizeMoney: '৳5,000',
          status: 'Registration Open',
          rounds: 3,
          questions: 2,
          difficulty: 'Medium',
          timePerQuestion: '1 hour',
          registrationCloses: '2 days',
          about: 'Welcome to the Science Showdown! This exciting tournament will test your knowledge across multiple categories and challenge you to compete against quiz enthusiasts from around the world.',
          format: 'This tournament follows a Points-based format with 2 rounds of competition. Each round consists of 30 questions across various categories, with 60 seconds allowed per question.',
          eligibility: 'All registered users. All participants must have a registered account on QuizHub and agree to the tournament rules and fair play guidelines.',
          howToParticipate: [
            'Register for the tournament before the registration deadline',
            'Complete any qualifying rounds if applicable',
            'Log in during the scheduled tournament times',
            'Answer questions within the time limit',
            'Track your progress on the leaderboard'
          ],
          registrationPeriod: 'Dec 10, 2025',
          qualifyingRound: 'Dec 10, 2025',
          mainTournament: 'Dec 10, 2025',
          winnersAnnouncement: 'Dec 10, 2025'
        }
      ];

      const foundContest = dummyContests.find(c => c.id === parseInt(contestId || 1));
      if (foundContest) {
        setContest(foundContest);
      }
      setLoading(false);
    };

    loadContest();
  }, [contestId]);

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
      <div className="qs-contest-details-layout">
        <div className="qs-loading">Loading...</div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="qs-contest-details-layout">
        <div className="qs-error">Contest not found</div>
      </div>
    );
  }

  return (
    <div className="qs-contest-details-layout">
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
        <div className="qs-contest-details-content-area">
          {/* Hero Banner */}
          <div className="qs-contest-hero-banner">
            <div 
              className="qs-contest-status-badge"
              style={{ backgroundColor: '#16a34a' }}
            >
              {contest.status}
            </div>
            <h1 className="qs-contest-hero-title">{contest.title}</h1>
            <p className="qs-contest-hero-description">{contest.description}</p>
            <div className="qs-contest-hero-info">
              <div className="qs-hero-info-item">
                <FaCalendar className="qs-hero-info-icon" />
                <span>{contest.date}</span>
              </div>
              <div className="qs-hero-info-item">
                <FaClock className="qs-hero-info-icon" />
                <span>{contest.time}</span>
              </div>
              <div className="qs-hero-info-item">
                <FaUsers className="qs-hero-info-icon" />
                <span>{contest.participants.toLocaleString()} participants</span>
              </div>
              <div className="qs-hero-info-item">
                <FaCoins className="qs-hero-info-icon" />
                <span>{contest.prizeMoney} prize money</span>
              </div>
            </div>
            <div className="qs-contest-hero-stats">
              <div className="qs-hero-stat-box">
                <span className="qs-hero-stat-value">{contest.rounds} Rounds</span>
              </div>
              <div className="qs-hero-stat-box">
                <span className="qs-hero-stat-value">{contest.questions} Questions</span>
              </div>
              <div className="qs-hero-stat-box qs-hero-stat-difficulty">
                <span className="qs-hero-stat-value">{contest.difficulty} Difficulty</span>
                <div className="qs-difficulty-progress">
                  <div className="qs-difficulty-progress-bar" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="qs-hero-stat-closing">
                <FaClock className="qs-hero-stat-clock-icon" />
                <span>Registration closes in {contest.registrationCloses}</span>
              </div>
            </div>
            <div className="qs-contest-hero-link">
              <a href="#submissions">Submissions</a>
            </div>
          </div>

          {/* Tabs */}
          <div className="qs-contest-tabs">
            <button
              className={`qs-contest-tab ${activeTab === 'Overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('Overview')}
            >
              Overview
            </button>
            <button
              className={`qs-contest-tab ${activeTab === 'Rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('Rules')}
            >
              Rules
            </button>
            <button
              className={`qs-contest-tab ${activeTab === 'Submission' ? 'active' : ''}`}
              onClick={() => setActiveTab('Submission')}
            >
              Submission
            </button>
            <button
              className={`qs-contest-tab ${activeTab === 'Leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('Leaderboard')}
            >
              Leaderboard
            </button>
            <button
              className={`qs-contest-tab ${activeTab === 'Prize' ? 'active' : ''}`}
              onClick={() => setActiveTab('Prize')}
            >
              Prize
            </button>
          </div>

          {/* Tab Content */}
          <div className="qs-contest-tab-content">
            {activeTab === 'Overview' && (
              <div className="qs-contest-overview">
                <div className="qs-contest-overview-left">
                  <section className="qs-about-section">
                    <h2 className="qs-section-heading">About This Contest</h2>
                    <p className="qs-section-text">{contest.about}</p>
                  </section>

                  <section className="qs-format-section">
                    <h2 className="qs-section-heading">Contest Format</h2>
                    <p className="qs-section-text">{contest.format}</p>
                  </section>

                  <section className="qs-eligibility-section">
                    <h2 className="qs-section-heading">Eligibility</h2>
                    <p className="qs-section-text">{contest.eligibility}</p>
                  </section>

                  <section className="qs-participate-section">
                    <h2 className="qs-section-heading">How to Participate</h2>
                    <ol className="qs-participate-list">
                      {contest.howToParticipate.map((step, index) => (
                        <li key={index} className="qs-participate-item">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>

                <div className="qs-contest-overview-right">
                  <div className="qs-contest-stats-card">
                    <h3 className="qs-stats-card-title">Contest Stats</h3>
                    <div className="qs-stats-list">
                      <div className="qs-stat-row">
                        <FaUsers className="qs-stat-icon" />
                        <span className="qs-stat-label">Participants:</span>
                        <span className="qs-stat-value">{contest.participants.toLocaleString()}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaAward className="qs-stat-icon" />
                        <span className="qs-stat-label">Prize Pool:</span>
                        <span className="qs-stat-value">{contest.prizeMoney}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaTrophy className="qs-stat-icon" />
                        <span className="qs-stat-label">Difficulty:</span>
                        <span className="qs-stat-value">{contest.difficulty}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaClock className="qs-stat-icon" />
                        <span className="qs-stat-label">Time per Question:</span>
                        <span className="qs-stat-value">{contest.timePerQuestion}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaFileAlt className="qs-stat-icon" />
                        <span className="qs-stat-label">Total Questions:</span>
                        <span className="qs-stat-value">{contest.questions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="qs-key-dates-card">
                    <h3 className="qs-stats-card-title">Key Dates</h3>
                    <div className="qs-dates-list">
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Registration Period:</span>
                          <span className="qs-date-value">{contest.registrationPeriod}</span>
                        </div>
                      </div>
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Qualifying Round:</span>
                          <span className="qs-date-value">{contest.qualifyingRound}</span>
                        </div>
                      </div>
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Main Tournament:</span>
                          <span className="qs-date-value">{contest.mainTournament}</span>
                        </div>
                      </div>
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Winners Announcement:</span>
                          <span className="qs-date-value">{contest.winnersAnnouncement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Rules' && (
              <div className="qs-contest-rules">
                <h2 className="qs-section-heading">Contest Rules</h2>
                <div className="qs-rules-content">
                  <p className="qs-section-text">Rules content will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === 'Submission' && (
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
                              onClick={() => navigate(`/question-setter/submission/${contestId}/${user.name}`)}
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

            {activeTab === 'Prize' && (
              <div className="qs-contest-prize">
                <h2 className="qs-section-heading">Prize</h2>
                <div className="qs-prize-content">
                  <p className="qs-section-text">Prize content will be displayed here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterContestDetails;

