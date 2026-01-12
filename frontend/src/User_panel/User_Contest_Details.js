import React, { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaChartLine,
  FaFire,
  FaHome,
  FaListOl,
  FaMedal,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTrophy,
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaTag,
  FaBolt,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './User_Dashboard.css';
import './User_Contest_Details.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const User_Contest_Details = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [active, setActive] = useState('contest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contestData, setContestData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Check if user is already registered for this contest
  const checkRegistrationStatus = async (userId, contestId) => {
    try {
      // First get user's UUID from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', userId)
        .single();

      if (userError || !userData) {
        console.log('User not found in users table, trying direct Firebase UID check');
        // Try with Firebase UID directly
        const { data, error } = await supabase
          .from('contest_participants')
          .select('id')
          .eq('contest_id', contestId)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          setIsRegistered(true);
        }
      } else {
        // Use proper UUID
        const { data, error } = await supabase
          .from('contest_participants')
          .select('id')
          .eq('contest_id', contestId)
          .eq('user_id', userData.id)
          .single();

        if (!error && data) {
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Fetch contest details from Supabase
  const fetchContestDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contest details:', error);
        return;
      }

      console.log('Contest details fetched from Supabase:', data);
      setContestData(data);
      
      // Check if user is already registered
      if (user) {
        await checkRegistrationStatus(user.uid, id);
      }
    } catch (error) {
      console.error('Error in fetchContestDetails:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to calculate registration status
  const getRegistrationStatus = (registrationStart, registrationEnd) => {
    const now = new Date();
    const start = new Date(registrationStart);
    const end = new Date(registrationEnd);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Closed';
    return 'Registration Open';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        // Fetch contest details when user is authenticated and contestId is available
        if (contestId) {
          fetchContestDetails(contestId);
        }
      } else {
        setUser(null);
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate, contestId]);

  useEffect(() => {
    if (user && contestData && contestId) {
      checkRegistrationStatus(user.uid, contestId);
    }
  }, [user, contestData, contestId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const handleRegister = async () => {
    if (!user || !contestData) {
      console.error('User or contest data not available');
      return;
    }

    setIsAnimating(true);
    
    try {
      // First, get the user's UUID from the users table using Firebase UID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid) // Assuming there's a firebase_uid column
        .single();

      if (userError || !userData) {
        console.error('Error fetching user UUID:', userError);
        // Try alternative approach - maybe the user_id column stores the Firebase UID directly
        console.log('Attempting to register with Firebase UID directly...');
      }

      // Use the Supabase UUID if found, otherwise try with Firebase UID
      const userIdToUse = userData?.id || user.uid;

      // Insert registration data into contest_participants table
      const { data, error } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: contestData.id,
          user_id: userIdToUse,
          status: 'registered'
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering for contest:', error);
        
        // Check if it's a duplicate registration error
        if (error.code === '23505') {
          console.log('User already registered for this contest');
          setIsRegistered(true);
          setNotification({
            type: 'info',
            message: 'You are already registered for this contest!'
          });
        } else {
          setNotification({
            type: 'error',
            message: 'Registration failed. Please try again.'
          });
        }
      } else {
        console.log('Successfully registered for contest:', data);
        setIsRegistered(true);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: '🎉 Registration completed successfully! Good luck!'
        });
        
        // Optionally update the contest's total_register count
        await supabase
          .from('contests')
          .update({ 
            total_register: (contestData.total_register || 0) + 1 
          })
          .eq('id', contestData.id);
      }
    } catch (error) {
      console.error('Error in handleRegister:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred during registration.'
      });
    } finally {
      setIsAnimating(false);
      
      // Auto-hide notification after 5 seconds
      if (notification) {
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`ud-root ${sidebarOpen ? '' : 'collapsed'}`}>
      <aside className="ud-sidebar">
        <div className="ud-logo">
          <span className="byte">Byte</span>
          <span className="arena">Arena</span>
        </div>
        <nav className="ud-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''
                }`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/dashboard');
                  } else if (item.key === 'contest') {
                    navigate('/contest');
                  } else if (item.key === 'leaderboard') {
                    navigate('/leaderboard');
                  }
                }
              }}
            >
              <span className="icon" style={{ marginRight: '12px' }}>{item.icon}</span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="ud-main">
        <header className="ud-topbar">
          <div className="ud-topbar-left">
            <button
              className="ud-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FaBars />
            </button>
            <div className="search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search quizzes, categories, creators..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button
              className="icon-btn"
              onClick={() => {
                console.log('Home button clicked, navigating to /');
                navigate('/');
              }}
              data-tooltip="Home"
            >
              <FaHome />
            </button>
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">4</span>
            </button>
            <div className="balance" data-tooltip="Reward Coins">
              <FaCoins className="balance-icon" />
              <span>1200.00</span>
            </div>
            <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        <section className="ud-content">
          <div className="contest-details-container">
            {/* Contest Header */}
            {contestData && (
              <div className="contest-header">
                <div className="registration-badge">
                  {getRegistrationStatus(contestData.registration_start, contestData.registration_end)}
                </div>
                <h1 className="contest-title">{contestData.title}</h1>
                <p className="contest-description">
                  {contestData.title_description}
                </p>
                
                <div className="contest-meta">
                  <div className="contest-meta-item">
                    <FaCalendarAlt className="icon" />
                    <span>
                      {formatDate(contestData.registration_start)} at {formatDate(contestData.registration_end)}
                    </span>
                  </div>
                  <div className="contest-meta-item">
                    <FaUsers className="icon" />
                    <span>{contestData.total_register || 0} participants</span>
                  </div>
                  <div className="contest-meta-item">
                    <FaCoins className="icon" />
                    <span>${contestData.prize_money || 0} prize</span>
                  </div>
                </div>

                <div className="contest-info-cards">
                  <div className="info-card">
                    <FaTrophy />
                    <span>{contestData.question_problem} Questions</span>
                  </div>
                  <div className="info-card">
                    <FaBolt />
                    <span>{contestData.time_limit_qs}s per question</span>
                  </div>
                  <div className="info-card">
                    <FaTag />
                    <span>{contestData.contest_difficulty} Difficulty</span>
                  </div>
                </div>

                <div className="countdown-text">
                  {getRegistrationStatus(contestData.registration_start, contestData.registration_end)}
                </div>

                <button 
                  className={`register-button ${isAnimating ? 'animating' : ''} ${isRegistered ? 'participate' : ''}`}
                  onClick={() => {
                    if (isRegistered) {
                      navigate(`/contest/participate/${contestId}`);
                    } else {
                      handleRegister();
                    }
                  }}
                  disabled={isAnimating}
                >
                  {isAnimating ? (
                    <span className="button-content">
                      <span className="spinner"></span>
                      Registering...
                    </span>
                  ) : isRegistered ? (
                    'Participate'
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="contest-tabs">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                Rules
              </button>
              <button 
                className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
              <button 
                className={`tab-button ${activeTab === 'prizes' ? 'active' : ''}`}
                onClick={() => setActiveTab('prizes')}
              >
                Prizes
              </button>
            </div>
            {/* Content Area */}
            <div className="contest-content">
              {/* Main Content */}
              <div className="content-section">
                {activeTab === 'overview' && (
                  <>
                    <h2 className="section-title">Overview</h2>
                    
                    <div>
                      <h3 className="section-subtitle">About This Contest</h3>
                      <p className="section-text">
                        {contestData?.description || 'Contest description will be available soon.'}
                      </p>
                    </div>
                  </>
                )}
                
                {activeTab === 'rules' && (
                  <>
                    <h2 className="section-title">Rules</h2>
                    <div>
                      <h3 className="section-subtitle">Contest Rules</h3>
                      <div className="section-text" style={{ whiteSpace: 'pre-line' }}>
                        {contestData?.rules || 'Rules will be available soon.'}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'leaderboard' && (
                  <>
                    <h2 className="section-title">Leaderboard</h2>
                    <p className="section-text">Leaderboard will be available after the contest starts.</p>
                  </>
                )}

                {activeTab === 'prizes' && (
                  <>
                    <h2 className="section-title">Prizes</h2>
                    <div>
                      <h3 className="section-subtitle">Prize Distribution</h3>
                      <ul className="bullet-list">
                        <li>1st Place: $500 + Trophy + Certificate</li>
                        <li>2nd Place: $300 + Medal + Certificate</li>
                        <li>3rd Place: $200 + Medal + Certificate</li>
                        <li>4th-10th Place: $50 each + Certificate</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div>
                {/* Contest Stats Card */}
                {contestData && (
                  <div className="sidebar-card">
                    <h3 className="sidebar-card-title">Contest Stats</h3>
                    <div className="stat-item">
                      <span className="stat-label">Participants</span>
                      <span className="stat-value">{contestData.total_register || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Prize Pool</span>
                      <span className="stat-value">${contestData.prize_money || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Difficulty</span>
                      <span className="stat-value">{contestData.contest_difficulty}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Time per Question</span>
                      <span className="stat-value">{contestData.time_limit_qs} sec</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Questions</span>
                      <span className="stat-value">{contestData.question_problem}</span>
                    </div>
                  </div>
                )}

                {/* Key Dates Card */}
                {contestData && (
                  <div className="sidebar-card">
                    <h3 className="sidebar-card-title">Key Dates</h3>
                    <div className="date-item">
                      <span className="date-label">Registration Period</span>
                      <span className="date-value">
                        {formatDate(contestData.registration_start)} - {formatDate(contestData.registration_end)}
                      </span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Contest Start</span>
                      <span className="date-value">{formatDate(contestData.registration_start)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Contest End</span>
                      <span className="date-value">{formatDate(contestData.registration_end)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Created</span>
                      <span className="date-value">{formatDate(contestData.contest_created_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Notification */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out',
            backgroundColor: 
              notification.type === 'success' ? '#10b981' :
              notification.type === 'error' ? '#ef4444' :
              notification.type === 'info' ? '#3b82f6' : '#6b7280'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '12px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default User_Contest_Details;