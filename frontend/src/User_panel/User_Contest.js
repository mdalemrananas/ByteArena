import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Box,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Paper
} from '@mui/material';
import { 
  FaArrowLeft as ArrowBackIcon,
  FaTrophy as TrophyIcon,
  FaUsers as UsersIcon,
  FaClock as ClockIcon,
  FaCoins as CoinsIcon,
  FaCalendarAlt as CalendarIcon,
  FaTag as TagIcon,
  FaFire as FireIcon,
  FaBolt as BoltIcon,
  FaStar as StarIcon,
  FaChevronLeft as ChevronLeftIcon,
  FaChevronRight as ChevronRightIcon
} from 'react-icons/fa';
import { 
  FaBars,
  FaHome,
  FaTrophy,
  FaCode,
  FaListOl,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaCommentAlt,
  FaCoins,
  FaUser
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import './User_Dashboard.css';
import './User_Contest.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const User_Contest = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('contest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}&background=random`
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const featuredContest = {
    title: 'Global Knowledge Championship',
    description: 'Test your knowledge across multiple categories and compete with players worldwide',
    date: 'Dec 4, 2025 at 7:00 PM - 9:00 PM',
    time: '1,248 participants',
    participants: '1,248 participants',
    prize: '$1000',
    registrationCloses: '2 days',
    rounds: '3 Rounds',
    categories: '15 Categories',
    questions: '50 Questions',
    progress: 75
  };

  const contests = [
    {
      id: 1,
      title: 'Code Clash Championship',
      description: 'Ultimate coding battle for developers',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '856',
      prize: '$500',
      closesIn: '5 days',
      status: 'Registration Open',
      difficulty: 'Medium',
      color: '#4CAF50',
      image: '/Contest_Cover.jpg'
    },
    {
      id: 2,
      title: 'Algorithm Arena',
      description: 'Master complex algorithms and data structures',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '623',
      prize: '$750',
      closesIn: '7 days',
      status: 'Upcoming',
      difficulty: 'Hard',
      color: '#FF9800',
      image: '/Contest_Cover.jpg'
    },
    {
      id: 3,
      title: 'JavaScript Jam',
      description: 'Test your JavaScript skills and frameworks',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '445',
      prize: '$300',
      closesIn: '10 days',
      status: 'Registration Open',
      difficulty: 'Easy',
      color: '#2196F3',
      image: '/Contest_Cover.jpg'
    },
    {
      id: 4,
      title: 'Python Power Play',
      description: 'Python programming challenge for all levels',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '789',
      prize: '$600',
      closesIn: '13 days',
      status: 'Upcoming',
      difficulty: 'Medium',
      color: '#4CAF50',
      image: '/Contest_Cover.jpg'
    },
    {
      id: 5,
      title: 'Web Dev Warriors',
      description: 'Frontend and backend development contest',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '334',
      prize: '$400',
      closesIn: '16 days',
      status: 'Registration Open',
      difficulty: 'Hard',
      color: '#FF9800',
      image: '/Contest_Cover.jpg'
    },
    {
      id: 6,
      title: 'Database Duel',
      description: 'SQL and NoSQL database challenge',
      date: 'Dec 4, 2025',
      time: '7:00 PM - 9:00 PM',
      participants: '567',
      prize: '$350',
      closesIn: '18 days',
      status: 'Upcoming',
      difficulty: 'Medium',
      color: '#4CAF50',
      image: '/Contest_Cover.jpg'
    }
  ];

  const categories = ['all', 'C/C++', 'Java', 'PHP', 'HTML, CSS', 'JavaScript', 'Python'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
  };

  const handleRegister = (contestId) => {
    console.log('Registering for contest:', contestId);
    // Add registration logic here
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <div className={`ud-root ${sidebarOpen ? '' : 'collapsed'}`}>
        <aside className="ud-sidebar">
          <div className="ud-logo">
            <span className="byte">Byte</span>
            <span className="arena">Arena</span>
          </div>
        </aside>
        <main className="ud-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </main>
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
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
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
              <input type="text" placeholder="Search contests, categories..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" data-tooltip="Home">
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
                  <img 
                    src={user.photoURL} 
                    alt="avatar" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`;
                    }}
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3, lg: 4 }, 
            py: { xs: 2, sm: 3 },
            maxWidth: { xl: '1400px' }
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Contests
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Compete in exciting challenges and win amazing prizes
            </Typography>
          </Box>

          {/* Featured Tournament */}
          <Card 
            sx={{ 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>
                    {featuredContest.title}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, color: 'white' }}>
                    {featuredContest.description}
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ color: 'white' }} />
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>{featuredContest.date}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UsersIcon sx={{ color: 'white' }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white' }}>{featuredContest.participants}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CoinsIcon sx={{ color: 'white' }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white' }}>Prize pool {featuredContest.prize}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                        Registration closes in {featuredContest.registrationCloses}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                        {featuredContest.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={featuredContest.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Chip 
                        icon={<TrophyIcon />} 
                        label={featuredContest.rounds} 
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Chip 
                        icon={<TagIcon />} 
                        label={featuredContest.categories} 
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Chip 
                        icon={<BoltIcon />} 
                        label={featuredContest.questions} 
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  backgroundColor: 'white', 
                  color: '#764ba2',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
                onClick={() => handleRegister('featured')}
              >
                Register Now
              </Button>
            </CardContent>
          </Card>

          {/* Contest Filters */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }
              }}
            >
              <Tab label="All Contests" />
              <Tab label="My Contests" />
              <Tab label="Past Contests" />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category === 'all' ? 'All Categories' : category}
                  onClick={() => handleCategoryChange(category)}
                  variant={categoryFilter === category ? 'filled' : 'outlined'}
                  color={categoryFilter === category ? 'primary' : 'default'}
                  sx={{ 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Contest Cards Grid */}
          <Box className="contest-cards-grid" sx={{ mb: 4, maxWidth: '1400px', mx: 'auto' }}>
            {contests.map((contest) => (
              <div key={contest.id} className="contest-card-wrapper">
                <Card 
                  sx={{ 
                    width: '100%',
                    height: '435px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    flexShrink: 0,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {/* Contest Image */}
                  <Box
                    sx={{
                      height: 160,
                      backgroundImage: `url(${contest.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1
                      }}
                    >
                      <Chip
                        label={contest.difficulty}
                        size="small"
                        sx={{
                          backgroundColor: getDifficultyColor(contest.difficulty),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ 
                    flex: 1, 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    height: '360px',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {contest.title}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                    maxHeight: '2.8em'
                  }}>
                      {contest.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon style={{ fontSize: '14px', color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {contest.date} at {contest.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UsersIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {contest.participants} participants
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CoinsIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {contest.prize} prize
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClockIcon style={{ fontSize: '14px', color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          Closes in {contest.closesIn}
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        onClick={() => handleRegister(contest.id)}
                        sx={{
                          backgroundColor: '#635BFF',
                          '&:hover': {
                            backgroundColor: '#635BFF',
                            opacity: 0.9
                          }
                        }}
                      >
                        Register
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon />}
              disabled
            >
              Previous
            </Button>
            <Button variant="contained" sx={{ minWidth: '40px' }}>1</Button>
            <Button variant="outlined" sx={{ minWidth: '40px' }}>2</Button>
            <Button
              variant="outlined"
              endIcon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </Box>
        </Container>
      </main>
    </div>
  );
};

export default User_Contest;
