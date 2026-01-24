import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaComments, FaChevronDown,
  FaCalendar, FaClock, FaCoins, FaFileAlt, FaAward, FaStar,
  FaCheckCircle, FaTimesCircle, FaChartLine, FaGem, FaMedal,
  FaChevronLeft, FaChevronRight, FaEye
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './question-setter-ContestDetails.css';

const QuestionSetterContestDetails = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    const loadContest = async () => {
      if (!contestId) return;
      
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .eq('id', contestId)
          .single();

        if (error) throw error;
        setContest(data);
      } catch (error) {
        console.error('Error loading contest:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId]);

  useEffect(() => {
    if (activeTab === 'Submission' && contestId) {
      loadSubmissions();
    }
  }, [activeTab, contestId]);

  useEffect(() => {
    if (activeTab === 'Leaderboard' && contestId) {
      loadLeaderboard();
    }
  }, [activeTab, contestId]);

  const loadSubmissions = async () => {
    if (!contestId) return;
    setSubmissionsLoading(true);
    
    try {
      // Get contest questions for this contest first
      const { data: contestQuestions, error: questionsError } = await supabase
        .from('contest_questions')
        .select('id')
        .eq('contest_id', contestId);

      if (questionsError) throw questionsError;
      const questionIds = contestQuestions?.map(q => q.id) || [];

      // Fetch all participants for this contest
      const { data: participants, error: participantsError } = await supabase
        .from('contest_participants')
        .select(`
          id,
          user_id,
          status,
          score,
          rank,
          users!inner (
            id,
            display_name,
            email
          )
        `)
        .eq('contest_id', contestId);

      if (participantsError) throw participantsError;

      // For each participant, get their submissions for this contest's questions only
      const submissionsWithData = await Promise.all(
        participants.map(async (participant) => {
          let solves = [];
          if (questionIds.length > 0) {
            const { data: solvesData, error: solvesError } = await supabase
              .from('contest_question_solves')
              .select('*')
              .eq('participate_id', participant.user_id)
              .in('question_id', questionIds);

            if (solvesError) {
              console.error(`Error fetching solves for participant ${participant.user_id}:`, solvesError);
            } else {
              solves = solvesData || [];
            }
          }

          return {
            ...participant,
            submissions: solves,
            submissionCount: solves.length
          };
        })
      );

      setSubmissions(submissionsWithData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!contestId) return;
    setLeaderboardLoading(true);
    
    try {
      // Get contest questions for this contest first
      const { data: contestQuestions, error: questionsError } = await supabase
        .from('contest_questions')
        .select('id')
        .eq('contest_id', contestId);

      if (questionsError) throw questionsError;
      const questionIds = contestQuestions?.map(q => q.id) || [];

      // Get participants from contest_participants
      const { data: participants, error: participantsError } = await supabase
        .from('contest_participants')
        .select(`
          id,
          user_id,
          score,
          rank,
          status,
          users!inner (
            id,
            display_name,
            email
          )
        `)
        .eq('contest_id', contestId)
        .order('score', { ascending: false })
        .order('rank', { ascending: true });

      if (participantsError) throw participantsError;

      if (participants && participants.length > 0) {
        // Count problems solved for each participant
        const participantsWithSolved = await Promise.all(
          participants.map(async (participant) => {
            let problemsSolved = 0;
            if (questionIds.length > 0) {
              const { count, error: countError } = await supabase
                .from('contest_question_solves')
                .select('*', { count: 'exact', head: true })
                .eq('participate_id', participant.user_id)
                .in('question_id', questionIds);
              
              if (!countError) {
                problemsSolved = count || 0;
              }
            }

            // Determine badge based on rank
            let badge = 'Bronze';
            if (participant.rank === 1) badge = 'Gold';
            else if (participant.rank === 2) badge = 'Silver';
            else if (participant.rank === 3) badge = 'Bronze';

            return {
              rank: participant.rank || 0,
              name: participant.users?.display_name || 'Unknown',
              username: participant.users?.email?.split('@')[0] || 'user',
              score: participant.score || 0,
              level: participant.rank || 0,
              problemsSolved: problemsSolved,
              badge: badge
            };
          })
        );

        // Sort by rank (ascending), then by score (descending)
        participantsWithSolved.sort((a, b) => {
          if (a.rank !== b.rank) {
            return (a.rank || 999) - (b.rank || 999);
          }
          return b.score - a.score;
        });

        setLeaderboard(participantsWithSolved);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRegistrationStatus = (registrationStart, registrationEnd) => {
    const now = new Date();
    const start = new Date(registrationStart);
    const end = new Date(registrationEnd);
    if (now < start) return 'Upcoming';
    if (now > end) return 'Closed';
    return 'Registration Open';
  };

  const handleViewSubmission = (participantId, userId) => {
    navigate(`/question-setter/submission/${contestId}/${participantId}`);
  };

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

  const filteredSubmissions = submissions.filter((sub) => {
    const searchLower = submissionSearch.toLowerCase();
    const name = (sub.users?.display_name || '').toLowerCase();
    const email = (sub.users?.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const searchLower = leaderboardSearch.toLowerCase();
    const name = (entry.name || '').toLowerCase();
    const username = (entry.username || '').toLowerCase();
    return name.includes(searchLower) || username.includes(searchLower);
  });

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
            <span className="qs-nav-text">Practice Problems</span>
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
              style={{ 
                backgroundColor: getRegistrationStatus(contest.registration_start, contest.registration_end) === 'Registration Open' 
                  ? '#16a34a' 
                  : getRegistrationStatus(contest.registration_start, contest.registration_end) === 'Closed'
                  ? '#dc2626'
                  : '#f59e0b'
              }}
            >
              {getRegistrationStatus(contest.registration_start, contest.registration_end)}
            </div>
            <h1 className="qs-contest-hero-title">{contest.title}</h1>
            <p className="qs-contest-hero-description">{contest.title_description}</p>
            <div className="qs-contest-hero-info">
              <div className="qs-hero-info-item">
                <FaCalendar className="qs-hero-info-icon" />
                <span>{formatDate(contest.registration_start)} - {formatDate(contest.registration_end)}</span>
              </div>
              <div className="qs-hero-info-item">
                <FaUsers className="qs-hero-info-icon" />
                <span>{contest.total_register || 0} participants</span>
              </div>
              <div className="qs-hero-info-item">
                <FaCoins className="qs-hero-info-icon" />
                <span>${contest.prize_money || 0} prize money</span>
              </div>
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
                    <h2 className="qs-section-heading">About the Contest</h2>
                    <p className="qs-section-text">{contest.description || 'No description available.'}</p>
                  </section>
                </div>

                <div className="qs-contest-overview-right">
                  <div className="qs-contest-stats-card">
                    <h3 className="qs-stats-card-title">Contest Stats</h3>
                    <div className="qs-stats-list">
                      <div className="qs-stat-row">
                        <FaUsers className="qs-stat-icon" />
                        <span className="qs-stat-label">Participants:</span>
                        <span className="qs-stat-value">{contest.total_register || 0}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaAward className="qs-stat-icon" />
                        <span className="qs-stat-label">Questions:</span>
                        <span className="qs-stat-value">{contest.question_problem || 0}</span>
                      </div>
                      <div className="qs-stat-row">
                        <FaCoins className="qs-stat-icon" />
                        <span className="qs-stat-label">Prize Money:</span>
                        <span className="qs-stat-value">${contest.prize_money || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="qs-key-dates-card">
                    <h3 className="qs-stats-card-title">Key Dates</h3>
                    <div className="qs-dates-list">
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Registration Start:</span>
                          <span className="qs-date-value">{formatDate(contest.registration_start)}</span>
                        </div>
                      </div>
                      <div className="qs-date-row">
                        <FaCalendar className="qs-date-icon" />
                        <div className="qs-date-info">
                          <span className="qs-date-label">Registration End:</span>
                          <span className="qs-date-value">{formatDate(contest.registration_end)}</span>
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
                  <p className="qs-section-text" style={{ whiteSpace: 'pre-line' }}>
                    {contest.rules || 'No rules specified for this contest.'}
                  </p>
                </div>
                <div className="qs-contest-stats-card" style={{ marginTop: '32px' }}>
                  <h3 className="qs-stats-card-title">Contest Stats</h3>
                  <div className="qs-stats-list">
                    <div className="qs-stat-row">
                      <FaUsers className="qs-stat-icon" />
                      <span className="qs-stat-label">Participants:</span>
                      <span className="qs-stat-value">{contest.total_register || 0}</span>
                    </div>
                    <div className="qs-stat-row">
                      <FaAward className="qs-stat-icon" />
                      <span className="qs-stat-label">Questions:</span>
                      <span className="qs-stat-value">{contest.question_problem || 0}</span>
                    </div>
                    <div className="qs-stat-row">
                      <FaCoins className="qs-stat-icon" />
                      <span className="qs-stat-label">Prize Money:</span>
                      <span className="qs-stat-value">${contest.prize_money || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="qs-key-dates-card" style={{ marginTop: '24px' }}>
                  <h3 className="qs-stats-card-title">Key Dates</h3>
                  <div className="qs-dates-list">
                    <div className="qs-date-row">
                      <FaCalendar className="qs-date-icon" />
                      <div className="qs-date-info">
                        <span className="qs-date-label">Registration Start:</span>
                        <span className="qs-date-value">{formatDate(contest.registration_start)}</span>
                      </div>
                    </div>
                    <div className="qs-date-row">
                      <FaCalendar className="qs-date-icon" />
                      <div className="qs-date-info">
                        <span className="qs-date-label">Registration End:</span>
                        <span className="qs-date-value">{formatDate(contest.registration_end)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Submission' && (
              <div className="qs-submissions">
                {/* Search */}
                <div className="qs-submissions-filters">
                  <div className="qs-search-filter">
                    <FaSearch className="qs-filter-search-icon" />
                    <input
                      type="text"
                      placeholder="Search participant..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className="qs-filter-search-input"
                    />
                  </div>
                </div>

                {/* Submissions Table */}
                {submissionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading submissions...</div>
                ) : (
                  <div className="qs-table-container">
                    <table className="qs-submissions-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Participant Name</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Rank</th>
                          <th>Submission Count</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                              No submissions found
                            </td>
                          </tr>
                        ) : (
                          filteredSubmissions.map((sub, index) => (
                            <tr key={sub.id}>
                              <td className="qs-rank-cell">{index + 1}</td>
                              <td className="qs-user-cell">
                                <div className="qs-user-info">
                                  <div className="qs-user-avatar">
                                    {(sub.users?.display_name || 'U')[0].toUpperCase()}
                                  </div>
                                  <div className="qs-user-details">
                                    <span className="qs-user-name">{sub.users?.display_name || 'Unknown'}</span>
                                    <span className="qs-user-country">{sub.users?.email || ''}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="qs-language-cell">{sub.status || 'registered'}</td>
                              <td className="qs-points-cell">
                                <FaStar className="qs-star-icon" />
                                {sub.score || 0}
                              </td>
                              <td className="qs-rank-cell">{sub.rank || '-'}</td>
                              <td className="qs-points-cell">{sub.submissionCount}</td>
                              <td className="qs-actions-cell">
                                <button 
                                  className="qs-view-btn"
                                  onClick={() => handleViewSubmission(sub.id, sub.user_id)}
                                >
                                  <FaEye /> View Submission
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Leaderboard' && (
              <div className="qs-leaderboard">
                {/* Search */}
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
                </div>

                {/* Leaderboard Table */}
                {leaderboardLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading leaderboard...</div>
                ) : (
                  <div className="qs-table-container">
                    <table className="qs-leaderboard-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Username</th>
                          <th>Score</th>
                          <th>Level</th>
                          <th>Problems Solved</th>
                          <th>Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                              No leaderboard data available
                            </td>
                          </tr>
                        ) : (
                          filteredLeaderboard.map((entry, index) => (
                            <tr key={index}>
                              <td className="qs-rank-cell">
                                <div className={`qs-rank-badge ${entry.rank <= 3 ? 'qs-rank-highlight' : ''}`}>
                                  {entry.rank || index + 1}
                                </div>
                              </td>
                              <td className="qs-user-cell">
                                <div className="qs-user-info">
                                  <div className="qs-user-avatar">{entry.name[0].toUpperCase()}</div>
                                  <div className="qs-user-details">
                                    <span className="qs-user-name">{entry.name}</span>
                                    <span className="qs-user-country">@{entry.username}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="qs-score-cell">{entry.score.toLocaleString()}</td>
                              <td className="qs-level-cell">
                                <FaStar className="qs-star-icon" />
                                {entry.level}
                              </td>
                              <td className="qs-points-cell">{entry.problemsSolved}</td>
                              <td className="qs-badge-cell">
                                <span className={`qs-achievement-badge qs-badge-${entry.badge.toLowerCase()}`}>
                                  {entry.badge}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Prize' && (
              <div className="qs-contest-prize">
                <h2 className="qs-section-heading">Prize Distribution</h2>
                <div className="qs-prize-content">
                  <ul className="bullet-list" style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>1st Place:</strong> ${(contest.prize_money * 0.5 || 0).toFixed(2)} + Trophy + Certificate
                    </li>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>2nd Place:</strong> ${(contest.prize_money * 0.3 || 0).toFixed(2)} + Medal + Certificate
                    </li>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>3rd Place:</strong> ${(contest.prize_money * 0.2 || 0).toFixed(2)} + Medal + Certificate
                    </li>
                    <li style={{ padding: '12px 0' }}>
                      <strong>Total Prize Pool:</strong> ${contest.prize_money || 0}
                    </li>
                  </ul>
                </div>
                <div className="qs-contest-stats-card" style={{ marginTop: '32px' }}>
                  <h3 className="qs-stats-card-title">Contest Stats</h3>
                  <div className="qs-stats-list">
                    <div className="qs-stat-row">
                      <FaUsers className="qs-stat-icon" />
                      <span className="qs-stat-label">Participants:</span>
                      <span className="qs-stat-value">{contest.total_register || 0}</span>
                    </div>
                    <div className="qs-stat-row">
                      <FaAward className="qs-stat-icon" />
                      <span className="qs-stat-label">Questions:</span>
                      <span className="qs-stat-value">{contest.question_problem || 0}</span>
                    </div>
                    <div className="qs-stat-row">
                      <FaCoins className="qs-stat-icon" />
                      <span className="qs-stat-label">Prize Money:</span>
                      <span className="qs-stat-value">${contest.prize_money || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="qs-key-dates-card" style={{ marginTop: '24px' }}>
                  <h3 className="qs-stats-card-title">Key Dates</h3>
                  <div className="qs-dates-list">
                    <div className="qs-date-row">
                      <FaCalendar className="qs-date-icon" />
                      <div className="qs-date-info">
                        <span className="qs-date-label">Registration Start:</span>
                        <span className="qs-date-value">{formatDate(contest.registration_start)}</span>
                      </div>
                    </div>
                    <div className="qs-date-row">
                      <FaCalendar className="qs-date-icon" />
                      <div className="qs-date-info">
                        <span className="qs-date-label">Registration End:</span>
                        <span className="qs-date-value">{formatDate(contest.registration_end)}</span>
                      </div>
                    </div>
                  </div>
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