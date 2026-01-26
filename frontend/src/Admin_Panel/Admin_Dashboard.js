import React, { useEffect, useMemo, useState } from 'react';
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
  FaUsers,
  FaChartBar,
  FaCog,
  FaPlus,
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, Trophy, Users, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './Admin_Dashboard.css';

const menuItems = [
  { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
  { key: 'users', name: 'User Management', icon: <FaUsers className="menu-icon" /> },
  { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
  { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const categories = [
  {
    title: 'JAVASCRIPT 30 DAYS CHALLENGE',
    tag: 'Javascript',
    badge: '1',
    image: '/JavaScript_Cover.jpg',
  },
  {
    title: 'Database',
    tag: 'Database',
    badge: '2',
    image: '/Datbase_Cover.jpg',
  },
  {
    title: 'ALGORITHMS',
    tag: 'Algorithms',
    badge: '3',
    image: '/Algorithms_Cover.jpg',
  },
  {
    title: 'CONCURRENCY',
    tag: 'Concurrency',
    badge: '4',
    image: '/Concurrency_Cover.jpg',
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contestCardIndex, setContestCardIndex] = useState(0);
  const [isContestTransitioning, setIsContestTransitioning] = useState(false);
  const [contests, setContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(false);
  const [contestsError, setContestsError] = useState(null);
  const [practiceProblems, setPracticeProblems] = useState([]);
  const [practiceProblemsLoading, setPracticeProblemsLoading] = useState(false);
  const [practiceProblemsError, setPracticeProblemsError] = useState(null);

  const stats = useMemo(
    () => [
      { label: 'Total Users', value: '2,456', icon: <FaUsers /> },
      { label: 'Total Problems', value: '328', icon: <FaCode /> },
      { label: 'Active Contests', value: '12', icon: <FaTrophy /> },
      { label: 'Total Submissions', value: '45.2K', icon: <FaChartLine /> },
    ],
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'Admin',
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Admin'}&background=random`
        });
        setLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch contests data from Supabase
  useEffect(() => {
    const fetchContests = async () => {
      setContestsLoading(true);
      setContestsError(null);
      
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .eq('status', 'approved')
          .order('contest_created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Filter contests to show only currently running and upcoming contests
        const now = new Date();
        const activeAndUpcomingContests = data?.filter(contest => 
          new Date(contest.registration_end) > now
        ) || [];
        
        setContests(activeAndUpcomingContests);
      } catch (error) {
        console.error('Error fetching contests:', error);
        setContestsError('Failed to load contests');
      } finally {
        setContestsLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Fetch practice problems data from Supabase
  useEffect(() => {
    const fetchPracticeProblems = async () => {
      setPracticeProblemsLoading(true);
      setPracticeProblemsError(null);
      
      try {
        const { data, error } = await supabase
          .from('practice_problem')
          .select('*')
          .eq('admin_status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setPracticeProblems(data || []);
      } catch (error) {
        console.error('Error fetching practice problems:', error);
        setPracticeProblemsError('Failed to load practice problems');
      } finally {
        setPracticeProblemsLoading(false);
      }
    };

    fetchPracticeProblems();
  }, []);

  // Sliding effect for Latest Problems
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sliding effect for Contest
  useEffect(() => {
    const interval = setInterval(() => {
      handleContestNextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    if (practiceProblems.length > 0) {
      const maxIndex = Math.max(0, Math.ceil(practiceProblems.length / 4) - 1);
      setCurrentCardIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }
  };

  const handlePrevSlide = () => {
    if (practiceProblems.length > 0) {
      const maxIndex = Math.max(0, Math.ceil(practiceProblems.length / 4) - 1);
      setCurrentCardIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    }
  };

  const handleContestNextSlide = () => {
    if (contests.length > 0) {
      const maxIndex = Math.max(0, Math.ceil(contests.length / 4) - 1);
      setContestCardIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }
  };

  const handleContestPrevSlide = () => {
    if (contests.length > 0) {
      const maxIndex = Math.max(0, Math.ceil(contests.length / 4) - 1);
      setContestCardIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
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
          <span className="admin-badge">ADMIN</span>
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
                    navigate('/admin_dashboard');
                  } else if (item.key === 'users') {
                    navigate('/admin_users');
                  } else if (item.key === 'contests') {
                    navigate('/admin_contests');
                  } else if (item.key === 'problems') {
                    navigate('/admin_problems');
                  } else if (item.key === 'leaderboard') {
                    navigate('/admin_leaderboard');
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
              <input type="text" placeholder="Search users, contests, problems..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
              <FaHome />
            </button>
            <div className="profile" onClick={() => navigate('/admin_profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        <section className="ud-hero">
          <div className="hero-text">
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Manage Your Platform:</h1>
            <h2>Monitor, Control, Optimize!</h2>
            <p className="sub">Oversee users, contests, and system performance</p>
            <button className="primary-btn" onClick={() => navigate('/admin_contests')}>
              <FaPlus style={{ marginRight: '8px' }} />
              Create New Contest
            </button>
          </div>
        </section>

        <section className="ud-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </section>

        <section className="ud-section">
          <div className="section-head">
            <h3>Quick Actions</h3>
          </div>
          <div className="ud-cards">
            {categories.map((cat) => (
              <div key={cat.title} className="ud-card" style={{ backgroundImage: `url(${cat.image})` }}>
                <div className="card-top">
                  <span className="pill">{cat.tag}</span>
                  <span className="badge">{cat.badge}</span>
                </div>
                <div className="card-title">{cat.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Separator Line */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '2rem 0'
        }}></div>

        {/* Admin Management Interface */}
        <section className="ud-section">
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            margin: '-2rem'
          }}>
            <div>
              {/* Latest Problems Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaCode size={24} color="#6366f1" />
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      Recent Problems
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={handlePrevSlide}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/admin_problems')}
                    style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Manage All Problems
                  </button>
                </div>

                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}>
                  {practiceProblemsLoading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid #e5e7eb',
                          borderTop: '4px solid #6366f1',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 1rem'
                        }}></div>
                        <div>Loading problems...</div>
                      </div>
                    </div>
                  ) : practiceProblemsError ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '12px',
                      border: '1px solid #fecaca'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#dc2626'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                        <div>{practiceProblemsError}</div>
                        <button 
                          onClick={() => window.location.reload()}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : practiceProblems.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
                        <div>No problems available</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1.5rem',
                      transition: 'transform 0.5s ease-in-out',
                      transform: `translateX(-${currentCardIndex * 25}%)`
                    }}>
                      {practiceProblems.slice(currentCardIndex, currentCardIndex + 4).map((problem, index) => (
                        <div key={problem.problem_id} style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}>
                          <div style={{
                            height: '160px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            padding: '1rem'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '0.75rem',
                              left: '0.75rem',
                              backgroundColor: problem.problem_difficulty === 'hard' ? '#ef4444' : problem.problem_difficulty === 'medium' ? '#f59e0b' : '#10b981',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {problem.problem_difficulty?.toUpperCase() || 'MEDIUM'}
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: '0.75rem',
                              right: '0.75rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {problem.problem_category?.toUpperCase() || 'GENERAL'}
                            </div>
                            <div style={{
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Competitive Programming
                            </div>
                            <div style={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              Problem
                            </div>
                          </div>
                          <div style={{ padding: '1rem' }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '0.5rem'
                            }}>
                              {currentCardIndex + index + 1}. {problem.problem_title || problem.title || 'Untitled Problem'}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#6b7280',
                              marginBottom: '1rem',
                              lineHeight: '1.4'
                            }}>
                              {problem.problem_description ? problem.problem_description.substring(0, 80) + '...' : 'No description available'}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                ⏱️ {problem.time_limit || 'N/A'}s
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                🏆 {problem.points || '0'} pts
                              </div>
                            </div>
                            <button style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}>
                              Manage Problem
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Separator Line */}
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#e5e7eb',
                margin: '2rem 0'
              }}></div>

              {/* Contest Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaTrophy size={24} color="#6366f1" />
                    <div>
                      <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        Active Contests
                      </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={handleContestPrevSlide}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleContestNextSlide}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <button 
                      onClick={() => navigate('/admin_contests')}
                      style={{
                        color: '#6366f1',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Manage All Contests
                    </button>
                  </div>
                </div>

                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}>
                  {contestsLoading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid #e5e7eb',
                          borderTop: '4px solid #6366f1',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 1rem'
                        }}></div>
                        <div>Loading contests...</div>
                      </div>
                    </div>
                  ) : contestsError ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '12px',
                      border: '1px solid #fecaca'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#dc2626'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                        <div>{contestsError}</div>
                        <button 
                          onClick={() => window.location.reload()}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : contests.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '400px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏆</div>
                        <div>No contests available</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '1.5rem',
                      transition: 'transform 0.5s ease-in-out',
                      transform: `translateX(-${contestCardIndex * 25}%)`
                    }}>
                      {contests.slice(contestCardIndex, contestCardIndex + 4).map((contest) => {
                        // Determine status based on registration dates
                        const now = new Date();
                        const regStart = new Date(contest.registration_start);
                        const regEnd = new Date(contest.registration_end);
                        let status = 'UPCOMING';
                        let statusColor = '#3b82f6';
                        
                        if (now >= regStart && now <= regEnd) {
                          status = 'ACTIVE';
                          statusColor = '#ef4444';
                        } else if (now > regEnd) {
                          status = 'COMPLETED';
                          statusColor = '#f59e0b';
                        }
                        
                        return (
                        <div key={contest.id} style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/admin/contest/${contest.id}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}>
                          <div style={{
                            height: '140px',
                            backgroundImage: contest.cover_image ? `url(${contest.cover_image})` : 'none',
                            backgroundColor: contest.cover_image ? 'transparent' : '#1e293b',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            padding: '1rem'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '0.75rem',
                              left: '0.75rem',
                              backgroundColor: statusColor,
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {status}
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: '0.75rem',
                              right: '0.75rem',
                              backgroundColor: contest.contest_difficulty === 'hard' ? '#ef4444' : contest.contest_difficulty === 'medium' ? '#f59e0b' : '#10b981',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {contest.contest_difficulty?.toUpperCase()}
                            </div>
                          </div>
                          <div style={{ padding: '1rem' }}>
                            <h3 style={{
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              color: '#1f2937',
                              margin: '0 0 1rem 0'
                            }}>
                              {contest.title}
                            </h3>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '1rem',
                              lineHeight: '1.4'
                            }}>
                              {contest.description ? contest.description.substring(0, 100) + '...' : 'No description available'}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e5e7eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Trophy size={16} color="#6366f1" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1f2937' }}>
                                    {contest.question_problem} Problems
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> {contest.time_limit_qs}s per problem
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981' }}>
                                  ${contest.prize_money}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                  Prize Money
                                </div>
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '6px',
                              marginBottom: '1rem'
                            }}>
                              <Users size={16} color="#6366f1" />
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {contest.total_register} participants registered
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '6px',
                              marginBottom: '1rem'
                            }}>
                              <Calendar size={16} color="#6366f1" />
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {new Date(contest.registration_start).toLocaleDateString()} - {new Date(contest.registration_end).toLocaleDateString()}
                              </div>
                            </div>
                            <button style={{
                              width: '100%',
                              padding: '0.5rem',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/contest/${contest.id}`);
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}>
                              Manage Contest
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default AdminDashboard;