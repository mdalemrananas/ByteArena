import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaBell, FaCog, FaQuestionCircle, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaUsers, FaFileAlt, FaComments, FaPlay,
  FaChevronLeft
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './question-setter-SubmissionDetails.css';

const QuestionSetterSubmissionDetails = () => {
  const navigate = useNavigate();
  const { contestId, participantId, questionId, userId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const isContestSubmission = !!contestId && !!participantId;

  useEffect(() => {
    const loadData = async () => {
      if (isContestSubmission) {
        if (!contestId || !participantId) {
          setLoading(false);
          return;
        }

        try {
          // Get participant info
          const { data: participantData, error: participantError } = await supabase
            .from('contest_participants')
            .select(`
              *,
              users!inner (
                id,
                display_name,
                email
              )
            `)
            .eq('id', participantId)
            .single();

          if (participantError) throw participantError;
          setParticipant(participantData);

          // Get all submissions for this participant
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('contest_question_solves')
            .select(`
              *,
              contest_questions (
                id,
                title
              )
            `)
            .eq('participate_id', participantData.user_id);

          if (submissionsError) throw submissionsError;
          setSubmissions(submissionsData || []);
          
          if (submissionsData && submissionsData.length > 0) {
            setSelectedSubmission(submissionsData[0]);
          }
        } catch (error) {
          console.error('Error loading submission data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Handle practice problem submissions (existing logic)
        // For now, just set loading to false
        setLoading(false);
      }
    };

    loadData();
  }, [contestId, participantId, questionId, userId, isContestSubmission]);

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
      <div className="qs-submission-details-layout">
        <div className="qs-loading">Loading...</div>
      </div>
    );
  }

  if (!participant && !loading) {
    return (
      <div className="qs-submission-details-layout">
        <div className="qs-error">Submission not found</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  return (
    <div className="qs-submission-details-layout">
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

        {/* Navigation Tabs */}
        <div className="qs-submission-nav-tabs">
          <button 
            className="qs-submission-nav-tab"
            onClick={() => {
              if (isContestSubmission) {
                navigate(`/question-setter/contest/${contestId}`);
              } else {
                navigate(`/question-setter/question/${questionId}`);
              }
            }}
          >
            <FaChevronLeft /> Back {isContestSubmission ? 'to Contest' : 'to Question'}
          </button>
        </div>

        {/* Content Area */}
        <div className="qs-submission-content-area">
          <div className="qs-submission-container">
            {/* Left Side - Submissions List */}
            <div className="qs-submission-question-panel">
              <div className="qs-submission-question-content">
                <h1 className="qs-submission-problem-title">Submissions</h1>
                <p style={{ marginBottom: '20px', color: '#64748b' }}>
                  Participant: {participant?.users?.display_name || 'Unknown'}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>
                      No submissions found
                    </p>
                  ) : (
                    submissions.map((sub, index) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        style={{
                          padding: '16px',
                          border: `2px solid ${selectedSubmission?.id === sub.id ? '#6d55ff' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: selectedSubmission?.id === sub.id ? '#f8f9ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>
                              {sub.contest_questions?.title || `Submission ${index + 1}`}
                            </p>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
                              Language: {sub.language || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                              {formatDate(sub.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Code Editor */}
            <div className="qs-submission-code-panel">
              {selectedSubmission ? (
                <>
                  <div className="qs-submission-code-header">
                    <div className="qs-submission-code-info">
                      <span className="qs-submission-user">
                        {participant?.users?.display_name || 'Unknown'}
                      </span>
                      <span className="qs-submission-language">{selectedSubmission.language || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="qs-submission-code-editor">
                    <pre className="qs-code-content">
                      <code>{selectedSubmission.code || 'No code available'}</code>
                    </pre>
                  </div>

                  <div className="qs-submission-code-footer">
                    <div className="qs-submission-meta">
                      <span>Submitted: {formatDate(selectedSubmission.created_at)}</span>
                      <span>Time: {selectedSubmission.time_taken || 0}s</span>
                      <span>Memory: {selectedSubmission.memory_taken || 0} MB</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Select a submission to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetterSubmissionDetails;

