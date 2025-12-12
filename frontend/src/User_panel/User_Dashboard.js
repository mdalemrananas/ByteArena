import React, { useEffect, useMemo, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaCommentAlt,
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
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import './User_Dashboard.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
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

function UserDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = useMemo(
    () => [
      { label: 'Problems Solved', value: '128', icon: <FaChartLine /> },
      { label: 'Contest Rating', value: '1540', icon: <FaStar /> },
      { label: 'Current Streak', value: '7 Days', icon: <FaFire /> },
      { label: 'Leaderboard Rank', value: '#24', icon: <FaMedal /> },
    ],
    []
  );

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
            <button className="icon-btn" data-tooltip="Messages">
              <FaCommentAlt />
              <span className="badge">2</span>
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

        <section className="ud-hero">
          <div className="hero-text">
            <p className="eyebrow">Byte Arena</p>
            <h1>Your Adventure Starts Here:</h1>
            <h2>Share, Learn, Enjoy!</h2>
            <p className="sub">Build engaging problems, challenge others</p>
            <button className="primary-btn">Explore Problems</button>
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
            <h3>Problems Categories</h3>
            <div className="arrows">
              <button>‹</button>
              <button>›</button>
            </div>
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
      </main>
    </div>
  );
}

export default UserDashboard;
