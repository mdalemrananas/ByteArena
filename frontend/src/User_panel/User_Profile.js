import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  Grid, 
  Box,
  Divider,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  FaArrowLeft as ArrowBackIcon,
  FaCheckCircle as CheckCircleIcon,
  FaTrophy as EmojiEventsIcon,
  FaStar,
  FaClock as AccessTimeIcon,
  FaThList as CategoryIcon,
  FaHeart as FavoriteIcon,
  FaFlagCheckered as SportsScoreIcon,
  FaChartLine as TrendingUpIcon,
  FaTrophy as EmojiEventsOutlinedIcon,
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
  FaUser,
  FaChartLine,
  FaFire,
  FaMedal
} from 'react-icons/fa';
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

const User_Profile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [active, setActive] = useState('home');
  const [user, setUser] = useState({
    displayName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    joinedDate: 'January 2023'
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Full Stack Developer | Competitive Programmer | Open Source Enthusiast',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'DSA']
  });

  const stats = useMemo(
    () => [
      { 
        label: 'Problems Solved', 
        value: '128', 
        icon: <FaCode style={{ color: '#6366F1' }} />,
        progress: 85,
        change: '+12%',
        changeType: 'increase'
      },
      { 
        label: 'Contest Rating', 
        value: '1540', 
        icon: <FaStar style={{ color: '#F59E0B' }} />,
        progress: 70,
        change: '+45',
        changeType: 'increase'
      },
      { 
        label: 'Current Streak', 
        value: '7 Days', 
        icon: <FaFire style={{ color: '#F97316' }} />,
        progress: 30,
        change: '2 more to best',
        changeType: 'neutral'
      },
      { 
        label: 'Leaderboard', 
        value: '#24', 
        icon: <FaMedal style={{ color: '#EC4899' }} />,
        progress: 92,
        change: 'Top 2%',
        changeType: 'decrease'
      },
    ],
    []
  );

  const recentActivity = [
    {
      id: 1,
      type: 'contest',
      title: 'Won Weekly Coding Challenge',
      time: '2 hours ago',
      icon: <EmojiEventsIcon style={{ color: '#F59E0B' }} />
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Earned the "Code Master" badge',
      time: '1 day ago',
      icon: <FaTrophy style={{ color: '#8B5CF6' }} />
    },
    {
      id: 3,
      type: 'level',
      title: 'Reached Level 10',
      time: '3 days ago',
      icon: <FaStar style={{ color: '#3B82F6' }} />
    }
  ];

  const upcomingContests = [
    {
      id: 1,
      title: 'Weekly Coding Challenge',
      date: 'Tomorrow, 10:00 AM',
      participants: '1.2k',
      prize: '$500'
    },
    {
      id: 2,
      title: 'Algorithms Tournament',
      date: 'In 3 days, 2:00 PM',
      participants: '3.4k',
      prize: 'Premium Subscription'
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(prev => ({
          ...prev,
          displayName: currentUser.displayName || userData.name,
          email: currentUser.email || userData.email,
          photoURL: currentUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'
        }));
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

  // Update the existing user data state with useMemo at the top level
  const updatedUserData = useMemo(() => ({
    ...userData, // Keep existing user data
    name: user?.displayName || userData.name,
    username: user?.displayName 
      ? `@${user.displayName.toLowerCase().replace(/\s+/g, '')}` 
      : userData.username,
    joinDate: user?.joinedDate 
      ? `Joined ${user.joinedDate}` 
      : userData.joinDate,
    stats: userData.stats || {
      quizzesTaken: 187,
      quizzesCreated: 15,
      followers: 1243,
      following: 356
    },
    level: userData.level || 42,
    activities: userData.activities || [{
      id: 1,
      type: 'quiz_completed',
      title: 'Completed "World History Trivia"',
      details: 'with a score of 95%',
      time: 'May 1, 08:30 PM',
      icon: <CheckCircleIcon color="success" />
    }],
    statsData: userData.statsData || [
      { label: 'Average Score', value: '87.5%' },
      { label: 'Win Rate', value: '78%' },
      { label: 'Current Streak', value: '5 quizzes' },
      { label: 'Highest Streak', value: '12 quizzes' },
      { label: 'Time Played', value: '11h 50m' },
      { label: '% Completion Rate', value: '94%' },
      { label: 'Best Category', value: 'History' },
      { label: 'Favorite Category', value: 'Science' },
      { label: 'Weakest Category', value: 'Sports' }
    ],
    achievements: userData.achievements || [
      { 
        id: 1, 
        title: 'Quiz Master Epic', 
        description: 'Complete 100 quizzes with a score of 80% or higher',
        date: 'Earned on 1/20/2023',
        icon: <EmojiEventsOutlinedIcon color="primary" />
      },
      { 
        id: 2, 
        title: 'Knowledge Seeker Uncommon', 
        description: 'Complete quizzes in 10 different categories',
        date: 'Earned on 11/5/2022',
        icon: <CategoryIcon color="primary" />
      },
      { 
        id: 3, 
        title: 'Perfect Score Rare', 
        description: 'Score 100% on any quiz',
        date: 'Not earned yet',
        icon: <FaStar color="action" style={{ opacity: 0.5 }} />,
        locked: true
      }
    ]
  }), [user, userData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
              <input type="text" placeholder="Search quizzes, categories, creators..." />
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
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          {updatedUserData.name}'s Profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm="auto" sx={{ textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mb: 2,
                    fontSize: '2.5rem',
                    bgcolor: 'primary.main',
                    mx: 'auto'
                  }}
                >
                  {updatedUserData.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Grid>
              <Grid item xs={12} sm>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mr: 1 }}>
                    {updatedUserData.name}
                  </Typography>
                  <Chip 
                    icon={<CheckCircleIcon fontSize="small" />} 
                    label="Verified" 
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                  <Chip 
                    label={`Level ${updatedUserData.level}`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {updatedUserData.username} • {updatedUserData.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {updatedUserData.joinDate}
                </Typography>
                <Typography variant="body1" paragraph>
                  {updatedUserData.bio}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                  <Button variant="contained" color="primary">
                    Follow
                  </Button>
                  <Button variant="outlined" color="primary">
                    Message
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm="auto" sx={{ ml: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{updatedUserData.stats.quizzesTaken}</Typography>
                    <Typography variant="body2" color="text.secondary">Quizzes Taken</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{updatedUserData.stats.quizzesCreated}</Typography>
                    <Typography variant="body2" color="text.secondary">Quizzes Created</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{updatedUserData.stats.followers.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Followers</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{updatedUserData.stats.following}</Typography>
                    <Typography variant="body2" color="text.secondary">Following</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs */}
          <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  height: 3,
                },
              }}
            >
              <Tab label="Activity" />
              <Tab label="Quizzes Taken" />
              <Tab label="Created Quizzes" />
              <Tab label="Followers" />
              <Tab label="Following" />
            </Tabs>
            
            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <List>
                  {updatedUserData.activities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {activity.details}
                              </Typography>
                              <br />
                              {activity.time}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
              {tabValue !== 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {tabValue === 1 && 'No quizzes taken yet'}
                    {tabValue === 2 && 'No quizzes created yet'}
                    {tabValue === 3 && 'No followers yet'}
                    {tabValue === 4 && 'Not following anyone yet'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Stats & Performance */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Stats & Performance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Stats Table */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Table Header */}
                <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ flex: 1, p: 1.5, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Metric
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Value
                    </Typography>
                  </Box>
                </Box>
                
                {/* Table Rows */}
                {updatedUserData.statsData.map((stat, index) => {
                  const getIcon = (label) => {
                    switch(label) {
                      case 'Average Score':
                        return <FaChartLine style={{ color: '#6366F1', fontSize: '14px' }} />;
                      case 'Win Rate':
                        return <FaTrophy style={{ color: '#F59E0B', fontSize: '14px' }} />;
                      case 'Current Streak':
                        return <FaFire style={{ color: '#F97316', fontSize: '14px' }} />;
                      case 'Highest Streak':
                        return <FaMedal style={{ color: '#EC4899', fontSize: '14px' }} />;
                      case 'Time Played':
                        return <AccessTimeIcon style={{ color: '#10B981', fontSize: '14px' }} />;
                      case '% Completion Rate':
                        return <TrendingUpIcon style={{ color: '#8B5CF6', fontSize: '14px' }} />;
                      case 'Best Category':
                        return <SportsScoreIcon style={{ color: '#3B82F6', fontSize: '14px' }} />;
                      case 'Favorite Category':
                        return <FavoriteIcon style={{ color: '#EF4444', fontSize: '14px' }} />;
                      case 'Weakest Category':
                        return <CategoryIcon style={{ color: '#6B7280', fontSize: '14px' }} />;
                      default:
                        return null;
                    }
                  };

                  const getProgressValue = (label) => {
                    switch(label) {
                      case 'Best Category':
                        return 85;
                      case 'Favorite Category':
                        return 70;
                      case 'Weakest Category':
                        return 30;
                      default:
                        return null;
                    }
                  };

                  const progressValue = getProgressValue(stat.label);
                  const icon = getIcon(stat.label);

                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        borderBottom: index < updatedUserData.statsData.length - 1 ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: '#fafafa'
                        }
                      }}
                    >
                      <Box sx={{ flex: 1, p: 1.5, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {icon}
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" fontWeight="500">
                          {stat.value}
                        </Typography>
                        {progressValue !== null && (
                          <Box sx={{ flex: 1, maxWidth: '60px' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progressValue} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: stat.label === 'Best Category' ? '#3B82F6' : 
                                                  stat.label === 'Favorite Category' ? '#EF4444' : '#6B7280'
                                }
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={5}>
          {/* Achievements */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Achievements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {updatedUserData.achievements.map((achievement) => (
                <Grid item xs={12} key={achievement.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      opacity: achievement.locked ? 0.6 : 1,
                      backgroundColor: achievement.locked ? 'action.hover' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        bgcolor: achievement.locked ? 'action.disabledBackground' : 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {React.cloneElement(achievement.icon, {
                          sx: { 
                            color: achievement.locked ? 'action.disabled' : 'primary.main',
                            fontSize: 24
                          }
                        })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {achievement.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {achievement.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button 
              fullWidth 
              variant="text" 
              color="primary"
              sx={{ mt: 2 }}
            >
              View All Achievements
            </Button>
          </Paper>
        </Grid>
      </Grid>
        </Container>
      </main>
    </div>
  );
};

export default User_Profile;
