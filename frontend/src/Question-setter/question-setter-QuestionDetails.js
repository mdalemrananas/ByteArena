import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaStar,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { practiceSubmissionsService } from '../services/practiceSubmissionsService';
import './question-setter-QuestionDetails.css';
import './question-setter-ExploreQuestions.css';

const QuestionSetterQuestionDetails = () => {
  const navigate = useNavigate();
  const { questionId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submissions + leaderboard (both come from practice_submission)
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Code viewer modal
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeModalLoading, setCodeModalLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: pErr } = await supabase
          .from('practice_problem')
          .select('*')
          .eq('problem_id', questionId)
          .single();

        if (pErr) throw pErr;
        setProblem(data);
      } catch (e) {
        console.error('Failed to load practice problem:', e);
        setProblem(null);
        setError(e?.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [questionId]);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!questionId) return;
      setSubmissionsLoading(true);
      setError('');
      try {
        const { data, error: sErr } = await supabase
          .from('practice_submission')
          .select(
            'submission_id, problem_id, problem_solver_id, problem_solver_name, country, language, submission_status, points, submitted_at, submitted_code',
          )
          .eq('problem_id', questionId)
          .order('submitted_at', { ascending: false });

        if (sErr) throw sErr;
        setSubmissions(data || []);
      } catch (e) {
        console.error('Failed to load submissions:', e);
        setSubmissions([]);
        setError(e?.message || 'Failed to load submissions');
      } finally {
        setSubmissionsLoading(false);
      }
    };

    if (activeTab === 'Submissions') {
      loadSubmissions();
    }
  }, [activeTab, questionId]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!questionId) return;
      setLeaderboardLoading(true);
      setError('');
      try {
        const result = await practiceSubmissionsService.getLeaderboardOptimized(questionId);
        
        if (result.success) {
          setLeaderboard(result.data || []);
        } else {
          console.error('Failed to load leaderboard:', result.error);
          setLeaderboard([]);
          setError(result.error || 'Failed to load leaderboard');
        }
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
        setLeaderboard([]);
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        setLeaderboardLoading(false);
      }
    };

    if (activeTab === 'Leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab, questionId]);

  const filteredSubmissions = useMemo(() => {
    const q = submissionSearch.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) => {
      const name = (s.problem_solver_name || '').toLowerCase();
      const country = (s.country || '').toLowerCase();
      const lang = (s.language || '').toLowerCase();
      return name.includes(q) || country.includes(q) || lang.includes(q);
    });
  }, [submissions, submissionSearch]);

  const filteredLeaderboard = useMemo(() => {
    const q = leaderboardSearch.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter((entry) => {
      const name = (entry.problem_solver_name || '').toLowerCase();
      const country = (entry.country || '').toLowerCase();
      return name.includes(q) || country.includes(q);
    });
  }, [leaderboard, leaderboardSearch]);

  const openCodeModal = async (submission) => {
    setSelectedSubmission(null);
    setCodeModalOpen(true);
    setCodeModalLoading(true);

    try {
      // If code was included in list fetch, just use it.
      if (submission?.submitted_code !== undefined && submission?.submitted_code !== null) {
        setSelectedSubmission(submission);
        setCodeModalLoading(false);
        return;
      }

      // Fetch the full submission with code
      const { data, error: sErr } = await supabase
        .from('practice_submission')
        .select('submission_id, problem_solver_name, country, language, submission_status, points, submitted_at, submitted_code')
        .eq('submission_id', submission.submission_id)
        .single();

      if (sErr) throw sErr;
      setSelectedSubmission(data);
    } catch (e) {
      console.error('Failed to load submitted code:', e);
      setError(e?.message || 'Failed to load submitted code');
      setCodeModalOpen(false);
    } finally {
      setCodeModalLoading(false);
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

  if (loading) {
    return (
      <div className="qs-details-layout">
        <div className="qs-loading">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="qs-details-layout">
        <div className="qs-error">{error || 'Problem not found'}</div>
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
            <span className="qs-nav-text">Practice Problems</span>
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
                style={{ backgroundColor: '#fff' }}
              />
            </div>
          </div>
          <div className="qs-header-right">
            <button className="qs-header-icon-btn" onClick={() => navigate('/')} title="Home">
              <FaHome />
            </button>
            <button 
              className="qs-header-icon-btn" 
              title="Profile"
              onClick={() => navigate('/question-setter/profile')}
            >
              <FaUserCircle />
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
                      <h1 className="qs-problem-title">{problem.problem_title}</h1>

                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Problem Description</h2>
                        <pre className="qs-example-code">{problem.problem_description || ''}</pre>
                      </div>

                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Input</h2>
                        <pre className="qs-example-code">{problem.problem_input || ''}</pre>
                      </div>

                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Output</h2>
                        <pre className="qs-example-code">{problem.problem_output || ''}</pre>
                      </div>

                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Sample Input</h2>
                        <pre className="qs-example-code">{problem.sample_input || ''}</pre>
                      </div>

                      <div className="qs-constraints">
                        <h2 className="qs-section-heading">Sample Output</h2>
                        <pre className="qs-example-code">{problem.sample_output || ''}</pre>
                      </div>
                    </div>
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
                        <label>Problem:</label>
                        <div
                          className="qs-sort-select"
                          style={{ paddingRight: 12, display: 'flex', alignItems: 'center' }}
                        >
                          #{questionId}
                        </div>
                      </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="qs-table-container">
                      <table className="qs-submissions-table">
                        <thead>
                          <tr>
                            <th>Problem Solver Name</th>
                            <th>Country</th>
                            <th>Language</th>
                            <th>Submission Status</th>
                            <th>Points</th>
                            <th>Submitted At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissionsLoading ? (
                            <tr>
                              <td colSpan={7} className="qs-empty-message">Loading submissions...</td>
                            </tr>
                          ) : filteredSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="qs-empty-message">No submissions found.</td>
                            </tr>
                          ) : (
                            filteredSubmissions.slice(0, itemsPerPage).map((s) => (
                              <tr key={s.submission_id}>
                                <td className="qs-user-cell">{s.problem_solver_name || '-'}</td>
                                <td className="qs-language-cell">{s.country || '-'}</td>
                                <td className="qs-language-cell">{s.language || '-'}</td>
                                <td className="qs-language-cell">{s.submission_status || '-'}</td>
                                <td className="qs-points-cell">
                                  <FaStar className="qs-star-icon" />
                                  {Number(s.points) || 0}
                                </td>
                                <td className="qs-time-cell">
                                  {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '-'}
                                </td>
                                <td className="qs-actions-cell">
                                  <button className="qs-view-btn" onClick={() => openCodeModal(s)}>
                                    View Code
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="qs-table-pagination">
                      <span className="qs-pagination-info">
                        Showing {Math.min(filteredSubmissions.length, itemsPerPage)} of {filteredSubmissions.length} submissions
                      </span>
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
                        <label>Sort:</label>
                        <div
                          className="qs-sort-select"
                          style={{ paddingRight: 12, display: 'flex', alignItems: 'center' }}
                        >
                          points ↓ then time ↑
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="qs-table-container">
                      <table className="qs-leaderboard-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>User Name</th>
                            <th>Country</th>
                            <th>Points</th>
                            <th>Language</th>
                            <th>Submission Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardLoading ? (
                            <tr>
                              <td colSpan={6} className="qs-empty-message">Loading leaderboard...</td>
                            </tr>
                          ) : filteredLeaderboard.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="qs-empty-message">No leaderboard data available.</td>
                            </tr>
                          ) : (
                            filteredLeaderboard.slice(0, itemsPerPage).map((entry) => (
                              <tr key={`${entry.problem_solver_id}-${entry.rank}`}>
                                <td className="qs-rank-cell">
                                  <div className={`qs-rank-badge ${entry.rank <= 3 ? 'qs-rank-highlight' : ''}`}>
                                    {entry.rank}
                                  </div>
                                </td>
                                <td className="qs-user-cell">{entry.problem_solver_name || '-'}</td>
                                <td className="qs-language-cell">{entry.country || '-'}</td>
                                <td className="qs-points-cell">
                                  <FaStar className="qs-star-icon" />
                                  {Number(entry.points) || 0}
                                </td>
                                <td className="qs-language-cell">{entry.language || '-'}</td>
                                <td className="qs-time-cell">-</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="qs-table-pagination">
                      <span className="qs-pagination-info">
                        Showing {Math.min(filteredLeaderboard.length, itemsPerPage)} of {filteredLeaderboard.length} entries
                      </span>
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

      {/* Code viewer modal */}
      {codeModalOpen && (
        <div className="pp-modal-overlay" onClick={() => setCodeModalOpen(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-head">
              <h3 style={{ margin: 0 }}>Submitted Code</h3>
              <button className="pp-create-close" onClick={() => setCodeModalOpen(false)}>
                Close
              </button>
            </div>
            {codeModalLoading ? (
              <div style={{ padding: 16 }}>Loading...</div>
            ) : (
              <div className="pp-modal-body">
                <div className="pp-modal-row">
                  <div>
                    <div className="pp-meta-label">Solver</div>
                    <div className="pp-meta-value">{selectedSubmission?.problem_solver_name || '-'}</div>
                  </div>
                  <div>
                    <div className="pp-meta-label">Language</div>
                    <div className="pp-meta-value">{selectedSubmission?.language || '-'}</div>
                  </div>
                </div>
                <div className="pp-block">
                  <div className="pp-meta-label">Code</div>
                  <pre className="pp-pre">{selectedSubmission?.submitted_code || ''}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default QuestionSetterQuestionDetails;

