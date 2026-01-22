import React, { useEffect, useState } from 'react';
import { 
  FaBars,
  FaBell,
  FaCode,
  FaHome,
  FaListOl,
  FaSearch,
  FaSignOutAlt,
  FaTrophy,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, Trophy, Users, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import '../User_panel/User_Dashboard.css';
import './question-setter-Homepage.css';

const qsMenuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problems', icon: <FaCode className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'profile', name: 'Profile', icon: <FaUser className="menu-icon" /> },
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

function QuestionSetterHomepage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [contestCardIndex, setContestCardIndex] = useState(0);
  const [contests, setContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(false);
  const [contestsError, setContestsError] = useState(null);
  const [practiceProblems, setPracticeProblems] = useState([]);
  const [practiceProblemsLoading, setPracticeProblemsLoading] = useState(false);
  const [practiceProblemsError, setPracticeProblemsError] = useState(null);
  const [topProgrammers, setTopProgrammers] = useState([]);
  const [topProgrammersLoading, setTopProgrammersLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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
          .order('contest_created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const now = new Date();
        const activeAndUpcomingContests =
          data?.filter((contest) => new Date(contest.registration_end) > now) || [];

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

  // Fetch top programmers from leaderboard
  useEffect(() => {
    const fetchTopProgrammers = async () => {
      setTopProgrammersLoading(true);
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select(`
            *,
            users:participate_id (
              id,
              display_name,
              email,
              avatar_url
            )
          `)
          .order('score', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching top programmers:', error);
          setTopProgrammers([]);
          return;
        }

        if (data && data.length > 0) {
          const transformedData = data.map((entry, index) => ({
            id: entry.id,
            rank: index + 1,
            name: entry.users?.display_name || 'Anonymous User',
            email: entry.users?.email || '',
            score: entry.score || 0,
            level: entry.level || 0,
            problemsSolved: entry.problem_solve || 0,
            badge: entry.badge || 'Bronze',
            avatar: entry.users?.display_name 
              ? entry.users.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'AU',
            userId: entry.participate_id
          }));

          setTopProgrammers(transformedData);
        } else {
          setTopProgrammers([]);
        }
      } catch (error) {
        console.error('Error fetching top programmers:', error);
        setTopProgrammers([]);
      } finally {
        setTopProgrammersLoading(false);
      }
    };

    fetchTopProgrammers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [practiceProblems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleContestNextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [contests.length]);

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
            </div>
        <nav className="ud-nav">
          {qsMenuItems.map((item) => (
          <button 
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${
                item.danger ? 'danger' : ''
              }`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/question-setter');
                  } else if (item.key === 'contest') {
                    navigate('/question-setter/contest');
                  } else if (item.key === 'practice') {
                    navigate('/question-setter/explore');
                  } else if (item.key === 'leaderboard') {
                    navigate('/question-setter/leaderboard');
                  } else if (item.key === 'profile') {
                    navigate('/question-setter/profile');
                  }
                }
              }}
            >
              <span className="icon" style={{ marginRight: '12px' }}>
                {item.icon}
              </span>
              <span className="label" style={{ textAlign: 'left', flex: 1 }}>
                {item.name}
              </span>
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
              <input
                type="text"
                placeholder="Search problems, contests, creators..."
              />
            </div>
          </div>
          <div className="ud-topbar-right">
          <button 
              className="icon-btn"
              onClick={() => navigate('/')}
              data-tooltip="Home"
          >
              <FaHome />
          </button>
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">4</span>
          </button>
            <div
              className="profile"
            onClick={() => navigate('/question-setter/profile')}
              style={{ cursor: 'pointer' }}
              data-tooltip="Profile"
            >
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'Question Setter'}</span>
            </div>
          </div>
        </header>

        <section className="ud-hero qs-hero-overlay">
          <div className="hero-text">
            <p className="eyebrow">Byte Arena · Question Setter</p>
            <h1>Design Problems that Challenge the Arena</h1>
            <h2>Create, curate, and manage competitive programming tasks</h2>
            <p className="sub">
              Build engaging problems for thousands of learners and track how they perform in real
              contests.
            </p>
          <button 
              className="primary-btn"
              onClick={() => navigate('/question-setter/explore')}
          >
              Go to Practice Problems
          </button>
          </div>
        </section>

        <section className="ud-section">
          <div className="section-head">
            <h3>Problem Categories</h3>
            <div className="arrows">
              <button>‹</button>
              <button>›</button>
            </div>
            </div>
          <div className="ud-cards">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="ud-card"
                style={{ backgroundImage: `url(${cat.image})` }}
              >
                <div className="card-top">
                  <span className="pill">{cat.tag}</span>
                  <span className="badge">{cat.badge}</span>
          </div>
                <div className="card-title">{cat.title}</div>
              </div>
            ))}
          </div>
        </section>

        <div
            style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#e5e7eb',
            margin: '2rem 0',
          }}
        ></div>

        <section className="ud-section">
          <div
            style={{
              minHeight: '100vh',
              backgroundColor: '#f5f5f5',
              padding: '2rem',
              margin: '-2rem',
            }}
          >
            <div>
              {/* Latest Problems Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <FaCode size={24} color="#6366f1" />
                    <h2
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: 0,
                      }}
                    >
                      Latest Practice Problems
                    </h2>
                  </div>
              <button 
                    onClick={() => navigate('/question-setter/explore')}
                    style={{
                      color: '#6366f1',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    View All Problems
              </button>
            </div>

                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                  }}
                >
                  {practiceProblemsLoading ? (
                    <div
                    style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e5e7eb',
                            borderTop: '4px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem',
                          }}
                        ></div>
                        <div>Loading problems...</div>
                  </div>
              </div>
                  ) : practiceProblemsError ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '12px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#dc2626',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          ⚠️
            </div>
                        <div>{practiceProblemsError}</div>
                      </div>
                    </div>
                  ) : practiceProblems.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          📝
            </div>
                        <div>No problems available</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1.5rem',
                        transition: 'transform 0.5s ease-in-out',
                        transform: `translateX(-${currentCardIndex * 25}%)`,
                      }}
                    >
                      {practiceProblems
                        .slice(currentCardIndex, currentCardIndex + 4)
                        .map((problem, index) => (
                          <div
                            key={problem.problem_id}
                    style={{ 
                              backgroundColor: 'white',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow =
                                '0 1px 3px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div
                              style={{
                                height: '160px',
                                background:
                                  'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                padding: '1rem',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0.75rem',
                                  left: '0.75rem',
                                  backgroundColor:
                                    problem.difficulty === 'Hard' ||
                                    problem.difficulty === 'HARD'
                                      ? '#ef4444'
                                      : problem.difficulty === 'Medium' ||
                                        problem.difficulty === 'MEDIUM'
                                      ? '#f59e0b'
                                      : '#10b981',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                {(problem.difficulty || 'MEDIUM').toUpperCase()}
                  </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0.75rem',
                                  right: '0.75rem',
                                  backgroundColor: '#6366f1',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                {(problem.problem_language || 'GENERAL').toUpperCase()}
                              </div>
                              <div
                                style={{
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  marginBottom: '0.5rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Competitive Programming
                              </div>
                              <div
                                style={{
                                  color: 'rgba(255,255,255,0.8)',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Problem
                              </div>
                            </div>
                            <div style={{ padding: '1rem' }}>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                {currentCardIndex + index + 1}.{' '}
                                {problem.problem_title || 'Untitled Problem'}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#6b7280',
                                  marginBottom: '1rem',
                                  lineHeight: '1.4',
                                }}
                              >
                                {problem.problem_description
                                  ? `${problem.problem_description.substring(0, 80)}...`
                                  : 'No description available'}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '1rem',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#6b7280',
                                  }}
                                >
                                  ⏱️ {problem.time_limit || 'N/A'}s
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#6b7280',
                                  }}
                                >
                                  🏆 {problem.points || '0'} pts
                                </div>
              </div>
              <button 
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: '#6366f1',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.backgroundColor = '#4f46e5')
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.backgroundColor = '#6366f1')
                                }
                                onClick={() => navigate('/question-setter/explore')}
                              >
                                View Details
              </button>
            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contest Separator */}
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  margin: '2rem 0',
                }}
              ></div>

          {/* Contest Section */}
              <div style={{ marginBottom: '3rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <FaTrophy size={24} color="#6366f1" />
              <div>
                      <h2
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        Contests
                      </h2>
              </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
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
                          transition: 'all 0.2s ease',
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
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
              </div>
            </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
              <button 
                      onClick={() => navigate('/question-setter/contest')}
                      style={{
                        color: '#6366f1',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View All Contests
              </button>
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                  }}
                >
                  {contestsLoading ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e5e7eb',
                            borderTop: '4px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem',
                          }}
                        ></div>
                        <div>Loading contests...</div>
                      </div>
                    </div>
                  ) : contestsError ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '12px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#dc2626',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          ⚠️
                        </div>
                        <div>{contestsError}</div>
                      </div>
                    </div>
                  ) : contests.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#6b7280',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          🏆
                        </div>
                        <div>No contests available</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1.5rem',
                        transition: 'transform 0.5s ease-in-out',
                        transform: `translateX(-${contestCardIndex * 25}%)`,
                      }}
                    >
                      {contests.slice(contestCardIndex, contestCardIndex + 4).map((contest) => {
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
                  <div 
                    key={contest.id} 
                    style={{ 
                              backgroundColor: 'white',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/question-setter/contest/${contest.id}`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow =
                                '0 1px 3px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div
                              style={{
                                height: '140px',
                                backgroundImage: contest.cover_image
                                  ? `url(${contest.cover_image})`
                                  : 'none',
                                backgroundColor: contest.cover_image ? 'transparent' : '#1e293b',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                padding: '1rem',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0.75rem',
                                  left: '0.75rem',
                                  backgroundColor: statusColor,
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                {status}
                      </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0.75rem',
                                  right: '0.75rem',
                                  backgroundColor:
                                    contest.contest_difficulty === 'hard'
                                      ? '#ef4444'
                                      : contest.contest_difficulty === 'medium'
                                      ? '#f59e0b'
                                      : '#10b981',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                {contest.contest_difficulty?.toUpperCase()}
                  </div>
              </div>
                            <div style={{ padding: '1rem' }}>
                              <h3
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  margin: '0 0 1rem 0',
                                }}
                              >
                                {contest.title}
                              </h3>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '1rem',
                                  lineHeight: '1.4',
                                }}
                              >
                                {contest.description
                                  ? `${contest.description.substring(0, 100)}...`
                                  : 'No description available'}
            </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '1rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      backgroundColor: '#e5e7eb',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Trophy size={16} color="#6366f1" />
                </div>
                                  <div>
                                    <div
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                      }}
                                    >
                                      {contest.question_problem} Problems
              </div>
                                    <div
                                      style={{
                                        fontSize: '0.7rem',
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                      }}
                                    >
                                      <Clock size={12} /> {contest.time_limit_qs}s per problem
            </div>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div
                    style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '700',
                                      color: '#10b981',
                                    }}
                                  >
                                    ${contest.prize_money}
                        </div>
                                  <div
                                    style={{
                                      fontSize: '0.7rem',
                                      color: '#6b7280',
                                    }}
                                  >
                                    Prize Money
                        </div>
                        </div>
                      </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.75rem',
                                  backgroundColor: '#f9fafb',
                                  borderRadius: '6px',
                                  marginBottom: '1rem',
                                }}
                              >
                                <Users size={16} color="#6366f1" />
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                  }}
                                >
                                  {contest.total_register} participants registered
                    </div>
            </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.75rem',
                                  backgroundColor: '#f9fafb',
                                  borderRadius: '6px',
                                  marginBottom: '1rem',
                                }}
                              >
                                <Calendar size={16} color="#6366f1" />
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                  }}
                                >
                                  {new Date(
                                    contest.registration_start,
                                  ).toLocaleDateString()}{' '}
                                  - {new Date(contest.registration_end).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: '#6366f1',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/question-setter/contest/${contest.id}`);
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.backgroundColor = '#4f46e5')
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.backgroundColor = '#6366f1')
                                }
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!contestsLoading && !contestsError && contests.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                    }}
                  >
                    {Array.from({
                      length: Math.max(1, Math.ceil(contests.length / 4)),
                    }).map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor:
                            contestCardIndex === index ? '#6366f1' : '#d1d5db',
                          transition: 'background-color 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onClick={() => setContestCardIndex(index)}
                      />
          ))}
              </div>
                )}
        </div>

              {/* Top Competitors Separator */}
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#e5e7eb',
                  margin: '2rem 0',
                }}
              ></div>

              {/* Top Competitors Section - Fetched from leaderboard */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Trophy size={24} />
                    Top 5 Competitors
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      onClick={() => navigate('/question-setter/leaderboard')}
                      style={{
                        color: '#6366f1',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View Full Leaderboard
                    </button>
                  </div>
                </div>

                {topProgrammersLoading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem',
                    color: '#6b7280'
                  }}>
                    Loading top programmers...
                  </div>
                ) : topProgrammers.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem',
                    color: '#6b7280'
                  }}>
                    No leaderboard data available
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '1rem'
                  }}>
                    {topProgrammers.map((competitor) => (
                      <div key={competitor.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}>
                        <div style={{
                          height: '80px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              zIndex: 0
                            }}
                          >
                            <source src="/Profile cover banner.mp4" type="video/mp4" />
                          </video>
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: competitor.rank <= 3 ? '#fbbf24' : '#6366f1',
                            color: 'white',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '3px',
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            zIndex: 10
                          }}>
                            #{competitor.rank}
                          </div>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            border: '3px solid white',
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            position: 'relative',
                            zIndex: 10
                          }}>
                            <img 
                              src={`https://ui-avatars.com/api/?name=${competitor.name.replace(' ', '+')}&background=6366f1&color=fff&size=50`} 
                              alt={competitor.name}
                              style={{ width: '100%', height: '100%' }} 
                            />
                          </div>
                        </div>
                        <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <h3 style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {competitor.name}
                          </h3>
                          <div style={{
                            fontSize: '0.65rem',
                            color: '#6b7280',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}>
                            <span>{competitor.email ? `@${competitor.email.split('@')[0]}` : '@user'}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                                {competitor.rank}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Rank</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                                {competitor.problemsSolved}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Problems</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                                {competitor.score}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Score</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}

export default QuestionSetterHomepage;
