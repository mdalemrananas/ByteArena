import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import {
  FaBars,
  FaSignOutAlt,
  FaUsers,
  FaTrophy,
  FaFileAlt,
  FaChartLine,
  FaBell,
  FaCog,
  FaHome,
  FaUserShield,
  FaCode,
  FaDatabase,
  FaSearch,
  FaCommentAlt,
  FaMoon,
  FaUser,
  FaCompass,
  FaCog as FaSettings,
  FaEye,
  FaTrash,
  FaSave,
  FaUpload,
  FaPlus,
  FaStar,
  FaMedal,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
   FaHourglassHalf,
  FaCoins
} from 'react-icons/fa';
import './admin_homepage.css';

const AdminHomepage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContests: 0,
    totalProblems: 0,
    recentUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [contests, setContests] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        // Auto-set admin status if needed
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentUser.email)
            .single();
          
          if (!userData || !userData.is_admin) {
            // Auto-grant admin access
            await supabase
              .from('users')
              .update({ is_admin: true, role: 'admin' })
              .eq('email', currentUser.email);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentUsers();
      if (activeTab === 'user-management') {
        loadAllUsers();
      } else if (activeTab === 'explore-questions' || activeTab === 'program-management') {
        loadQuestions();
      } else if (activeTab === 'contest') {
        loadContests();
      } else if (activeTab === 'leaderboard') {
        loadLeaderboard();
      }
    }
  }, [user, activeTab]);

  const loadStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: contestCount } = await supabase
        .from('contests')
        .select('*', { count: 'exact', head: true });

      const { count: problemCount } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true })
        .catch(() => ({ count: 0 }));

      setStats({
        totalUsers: userCount || 0,
        recentUsers: recentCount || 0,
        totalContests: contestCount || 0,
        totalProblems: problemCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      // Mock data if table doesn't exist
      setQuestions([
        { id: 1, title: 'Maximum Subarray Sum With Length Divisible by K', difficulty: 'Hard', language: 'C++', creator: 'User0', rating: 4.8, players: 285, reward: 60, status: 'approved' },
        { id: 2, title: 'Regular Expression Matching', difficulty: 'Medium', language: 'Python', creator: 'User1', rating: 4.5, players: 178, reward: 50, status: 'approved' },
        { id: 3, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', language: 'Java', creator: 'User2', rating: 4.2, players: 412, reward: 40, status: 'pending' },
        { id: 4, title: 'N-Queens II', difficulty: 'Hard', language: 'C++', creator: 'User3', rating: 4.7, players: 156, reward: 70, status: 'rejected' },
      ]);
    }
  };

  const loadContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setContests(data);
      }
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(15);

      if (!error && data) {
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Mock data
      setLeaderboardData([
        { id: 1, rank: 1, name: 'User1', country: 'Bangladesh', score: 9850, level: 78, problemsSolved: 42, badge: 'Diamond', time: '1 hour', active: true },
        { id: 2, rank: 2, name: 'User2', country: 'Bangladesh', score: 8720, level: 65, problemsSolved: 38, badge: 'Platinum', time: '1 hour', active: true },
        { id: 3, rank: 3, name: 'User3', country: 'Bangladesh', score: 7640, level: 59, problemsSolved: 35, badge: 'Gold', time: '1 hour', active: true },
      ]);
    }
  };

  const loadRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentUsers(data);
      }
    } catch (error) {
      console.error('Error loading recent users:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { key: 'home', name: 'Home', icon: <FaHome /> },
    { key: 'user-management', name: 'User Management', icon: <FaUsers /> },
    { key: 'program-management', name: 'Program Management', icon: <FaSettings /> },
    { key: 'explore-questions', name: 'Explore Questions', icon: <FaCompass /> },
    { key: 'contest', name: 'Contest', icon: <FaTrophy /> },
    { key: 'leaderboard', name: 'Leaderboard', icon: <FaChartLine /> },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: '#667eea' },
    { label: 'Total Questions', value: stats.totalProblems, icon: <FaCode />, color: '#48bb78' },
    { label: 'Total Contest', value: stats.totalContests, icon: <FaTrophy />, color: '#ed8936' },
    { label: 'Recent user', value: stats.recentUsers, icon: <FaUser />, color: '#9f7aea' },
  ];

  const categories = [
    { title: 'JAVASCRIPT 30 DAYS CHALLENGE', tag: 'Javascript', badge: '1', image: '/JavaScript_Cover.jpg' },
    { title: 'Database', tag: 'Database', badge: '2', image: '/Datbase_Cover.jpg' },
    { title: 'ALGORITHMS', tag: 'Algorithms', badge: '3', image: '/Algorithms_Cover.jpg' },
    { title: 'CONCURRENCY', tag: 'Concurrency', badge: '4', image: '/Concurrency_Cover.jpg' },
  ];

  const renderHomePage = () => (
    <>
      <section className="admin-hero" style={{ backgroundImage: 'url(/Dashboard_Banner.jpg)' }}>
        <div className="admin-hero-text">
          <p className="admin-eyebrow">Byte Arena</p>
          <h1>Your questions Adventure Starts Here:</h1>
          <h2>Share, Learn, Enjoy!</h2>
          <p className="admin-sub">Build engaging problems, challenge others</p>
          <button className="admin-primary-btn">Create Questions</button>
        </div>
      </section>

      <section className="admin-stats">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat">
            <div className="admin-stat-icon">{stat.icon}</div>
            <div className="admin-stat-label">{stat.label}</div>
            <div className="admin-stat-value">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h3>Problems Categories</h3>
          <div className="admin-arrows">
            <button>‹</button>
            <button>›</button>
          </div>
        </div>
        <div className="admin-cards">
          {categories.map((cat, idx) => (
            <div key={idx} className="admin-card" style={{ backgroundImage: `url(${cat.image})` }}>
              <div className="admin-card-top">
                <span className="admin-pill">{cat.tag}</span>
                <span className="admin-badge-num">{cat.badge}</span>
              </div>
              <div className="admin-card-title">{cat.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h3>Latest Problems</h3>
          <button className="admin-view-all">View All Problems</button>
        </div>
        <div className="admin-problems-grid">
          {questions.slice(0, 4).map((q) => (
            <div key={q.id} className="admin-problem-card">
              <div className="admin-problem-header">
                <span className={`admin-difficulty ${q.difficulty?.toLowerCase()}`}>{q.difficulty || 'Medium'}</span>
              </div>
              <div className="admin-problem-content">
                <h4>{q.title || 'Problem Title'}</h4>
                <p className="admin-problem-meta">by {q.creator || 'User'}</p>
                <div className="admin-problem-footer">
                  <span><FaStar /> {q.rating || '4.5'} ({q.players || 0} players)</span>
                  <span className="admin-reward"><FaCoins /> {q.reward || 50}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderUserManagement = () => (
    <>
      <div className="admin-page-header">
        <h2>User Management</h2>
        <p>See who's leading the pack in our global quiz rankings.</p>
      </div>
      <div className="admin-filters">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search user by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="admin-filter-select">
          <option>Select: User</option>
          <option>Admin</option>
          <option>Regular User</option>
        </select>
      </div>
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Level</th>
              <th>Problem Solve</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.filter(u => 
              !searchTerm || u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((user, idx) => (
              <tr key={user.id}>
                <td>{idx + 1}</td>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar-small">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} />
                      ) : (
                        <span>{user.display_name?.[0] || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <div>{user.display_name || 'User'}</div>
                      <div className="admin-user-country">Bangladesh</div>
                    </div>
                  </div>
                </td>
                <td>{user.email || 'user@gmail.com'}</td>
                <td><FaStar /> {user.level || 78}</td>
                <td>{user.problems_solved || 42} <span className="admin-active">Active</span></td>
                <td><button className="admin-view-btn">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-pagination">
          <span>Showing 1-10 of {allUsers.length} users</span>
        </div>
      </div>
    </>
  );

  const renderProgramManagement = () => (
    <>
      <div className="admin-page-header">
        <h2>Program Management</h2>
        <p>Discover and play quizzes from our community.</p>
      </div>
      <div className="admin-hero-banner" style={{ backgroundImage: 'url(/Dashboard_Banner.jpg)' }}>
        <h1>Your questions Adventure Starts Here: Share, Learn, Enjoy!</h1>
        <p>Build engaging problems, challenge others</p>
        <button className="admin-primary-btn">Create Contest</button>
      </div>
      <div className="admin-filters">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input type="text" placeholder="Search quizzes by title, category, or creator..." />
        </div>
        <div className="admin-filter-buttons">
          <button className="admin-filter-btn active">All</button>
          <button className="admin-filter-btn">Hot</button>
          <button className="admin-filter-btn">Trending</button>
          <button className="admin-filter-btn">Editor's</button>
        </div>
      </div>
      <div className="admin-questions-grid">
        {questions.map((q) => (
          <div key={q.id} className="admin-question-card">
            <div className="admin-question-image">
              <div className="admin-question-overlay">COMPETITIVE PROGRAMMING CHALLENGE</div>
              <span className={`admin-difficulty-badge ${q.difficulty?.toLowerCase()}`}>{q.difficulty || 'Medium'}</span>
            </div>
            <div className="admin-question-info">
              <div className="admin-question-lang">{q.language || 'C++'}</div>
              <h4>{q.title}</h4>
              <p className="admin-question-creator">by {q.creator || 'User'}</p>
              <div className="admin-question-meta">
                <span><FaStar /> {q.rating || '4.8'} ({q.players || 124} players)</span>
                <span className="admin-reward"><FaCoins /> {q.reward || 60}</span>
              </div>
              <div className="admin-question-actions">
                {q.status === 'approved' && <button className="admin-approve-btn">Approve</button>}
                {q.status === 'pending' && <button className="admin-pending-btn">Pending</button>}
                {q.status === 'rejected' && <button className="admin-reject-btn">Rejected</button>}
                <button className="admin-view-btn-small">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderExploreQuestions = () => (
    <>
      <div className="admin-page-header">
        <h2>Explore Questions</h2>
        <p>Discover and play quizzes from our community</p>
      </div>
      <div className="admin-hero-banner" style={{ backgroundImage: 'url(/Dashboard_Banner.jpg)' }}>
        <h1>Your questions Adventure Starts Here: Share, Learn, Enjoy!</h1>
        <p>Build engaging problems, challenge others</p>
        <button className="admin-primary-btn">Create Questions</button>
      </div>
      <div className="admin-filters">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input type="text" placeholder="Search quizzes by title, category, or creator..." />
        </div>
        <div className="admin-filter-buttons">
          <button className="admin-filter-btn active">All</button>
          <button className="admin-filter-btn">Hot</button>
          <button className="admin-filter-btn">Trending</button>
          <button className="admin-filter-btn">Editor's</button>
        </div>
        <div className="admin-category-buttons">
          <button className="admin-category-btn active">All Categories</button>
          <button className="admin-category-btn">C/C++</button>
          <button className="admin-category-btn">Java</button>
          <button className="admin-category-btn">PHP</button>
          <button className="admin-category-btn">HTML, CSS</button>
          <button className="admin-category-btn">JavaScript</button>
          <button className="admin-category-btn">Python</button>
        </div>
      </div>
      <div className="admin-questions-grid">
        {questions.map((q) => (
          <div key={q.id} className="admin-question-card">
            <div className="admin-question-image">
              <div className="admin-question-overlay">COMPETITIVE PROGRAMMING CHALLENGE</div>
              <span className={`admin-difficulty-badge ${q.difficulty?.toLowerCase()}`}>{q.difficulty || 'Medium'}</span>
            </div>
            <div className="admin-question-info">
              <div className="admin-question-lang">{q.language || 'C++'}</div>
              <h4>{q.title}</h4>
              <p className="admin-question-creator">by {q.creator || 'User'}</p>
              <div className="admin-question-meta">
                <span><FaStar /> {q.rating || '4.8'} ({q.players || 124} players)</span>
                <span className="admin-reward"><FaCoins /> {q.reward || 60}</span>
              </div>
              <button className="admin-view-btn-small">View</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderContest = () => (
    <>
      <div className="admin-page-header">
        <h2>Contest</h2>
        <p>Compete against other quiz enthusiasts and win amazing prizes</p>
      </div>
      {contests.length > 0 && (
        <div className="admin-featured-contest">
          <div className="admin-contest-badge">Upcoming Tournament</div>
          <h3>{contests[0].title || 'Global Knowledge Championship'}</h3>
          <p>{contests[0].description || 'Test your knowledge against the best question enthusiasts from around the world'}</p>
          <div className="admin-contest-details">
            <span><FaClock /> {contests[0].start_time || 'Dec 10, 2025 | 7:00 PM - 9:00 PM'}</span>
            <span><FaUsers /> {contests[0].participants || '1,248'} participants</span>
            <span><FaCoins /> ৳{contests[0].prize_pool || '5,000'} prize money</span>
          </div>
          <button className="admin-primary-btn">Create Competitions</button>
        </div>
      )}
      <div className="admin-filters">
        <div className="admin-category-buttons">
          <button className="admin-category-btn active">All Categories</button>
          <button className="admin-category-btn">C/C++</button>
          <button className="admin-category-btn">Java</button>
          <button className="admin-category-btn">PHP</button>
          <button className="admin-category-btn">HTML, CSS</button>
          <button className="admin-category-btn">JavaScript</button>
          <button className="admin-category-btn">Python</button>
        </div>
      </div>
      <div className="admin-contests-grid">
        {contests.map((contest) => (
          <div key={contest.id} className="admin-contest-card">
            <div className="admin-contest-status">Registration Open</div>
            <div className="admin-contest-difficulty">Medium</div>
            <h4>{contest.title || 'Contest Title'}</h4>
            <p>{contest.description || 'Contest description'}</p>
            <div className="admin-contest-meta">
              <span>7:00 PM - 9:00 PM || Dec 4, 2025</span>
              <span>৳1,000 prize</span>
              <span>{contest.participants || 342} participants</span>
            </div>
            <button className="admin-action-dropdown">Actions</button>
          </div>
        ))}
      </div>
    </>
  );

  const renderLeaderboard = () => (
    <>
      <div className="admin-page-header">
        <h2>Leaderboard</h2>
        <p>See who's leading the pack in our global quiz rankings.</p>
      </div>
      <div className="admin-leaderboard-banner">
        <h1>Global Leaderboard</h1>
        <p>Compete with the best quiz masters from around the world.</p>
      </div>
      <div className="admin-filters">
        <div className="admin-search-box">
          <FaSearch className="admin-search-icon" />
          <input type="text" placeholder="Search competitor..." />
        </div>
        <select className="admin-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="score">Sort by: Score</option>
          <option value="level">Sort by: Level</option>
          <option value="problems">Sort by: Problems Solved</option>
        </select>
      </div>
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Level</th>
              <th>Problem Solve</th>
              <th>Badge</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry) => (
              <tr key={entry.id || entry.rank}>
                <td>
                  <div className={`admin-rank ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}>
                    {entry.rank || entry.id}
                  </div>
                </td>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar-small">
                      <span>{entry.name?.[0] || 'U'}</span>
                    </div>
                    <div>
                      <div>{entry.name || 'User'}</div>
                      <div className="admin-user-country">{entry.country || 'Bangladesh'}</div>
                    </div>
                  </div>
                </td>
                <td>{entry.score?.toLocaleString() || '0'}</td>
                <td><FaStar /> {entry.level || 78}</td>
                <td>
                  {entry.problemsSolved || entry.problem_solve || 42}
                  {entry.active && <span className="admin-active">Active</span>}
                </td>
                <td>
                  <span className={`admin-badge-${entry.badge?.toLowerCase() || 'bronze'}`}>
                    {entry.badge || 'Bronze'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-pagination">
          <span>Showing 1-10 of {leaderboardData.length} users</span>
          <button className="admin-pagination-btn">Previous</button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`admin-container ${sidebarOpen ? '' : 'collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-byte">Byte</span>
          <span className="admin-logo-arena">Arena</span>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <span className="admin-logo-text">Byte Arena</span>
            <div className="admin-search">
              <FaSearch className="admin-search-icon" />
              <input type="text" placeholder="Search Questions, Contest, Leaderboard..." />
            </div>
          </div>
          <div className="admin-topbar-right">
            <button className="admin-icon-btn">
              <FaCommentAlt />
              <span className="admin-badge">2</span>
            </button>
            <button className="admin-icon-btn">
              <FaBell />
              <span className="admin-badge">3</span>
            </button>
            <button className="admin-icon-btn">
              <FaMoon />
            </button>
            <div className="admin-user-profile">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Admin" />
              ) : (
                <div className="admin-avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'home' && renderHomePage()}
          {activeTab === 'user-management' && renderUserManagement()}
          {activeTab === 'program-management' && renderProgramManagement()}
          {activeTab === 'explore-questions' && renderExploreQuestions()}
          {activeTab === 'contest' && renderContest()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
        </div>
      </main>
    </div>
  );
};

export default AdminHomepage;
