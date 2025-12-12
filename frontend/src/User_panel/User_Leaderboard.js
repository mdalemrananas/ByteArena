import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Box,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Fade,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  MilitaryTech as TrophyIcon,
  Star as StarIcon,
  EmojiEvents as MedalIcon,
  TrendingUp,
  FilterList,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

const User_Leaderboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [active, setActive] = useState('leaderboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Stats data
  const statsData = [
    { label: 'Total Players', value: '2,847', change: '+12%', icon: <FaUser />, color: '#6366F1' },
    { label: 'Active Today', value: '1,234', change: '+8%', icon: <FaFire />, color: '#F59E0B' },
    { label: 'Avg Score', value: '4,250', change: '+5%', icon: <TrendingUp />, color: '#10B981' },
    { label: 'Tournaments', value: '24', change: '+2', icon: <FaTrophy />, color: '#EF4444' }
  ];

  // Mock data for leaderboard
  const leaderboardData = [
    { rank: 1, name: 'Alex Chen', username: '@alexchen', score: 9850, level: 78, problemsSolved: 342, badge: 'Elite', avatar: 'AC' },
    { rank: 2, name: 'Sarah Johnson', username: '@sarahj', score: 8720, level: 65, problemsSolved: 298, badge: 'Master', avatar: 'SJ' },
    { rank: 3, name: 'Mike Wilson', username: '@mikew', score: 7640, level: 59, problemsSolved: 267, badge: 'Expert', avatar: 'MW' },
    { rank: 4, name: 'Emma Davis', username: '@emmad', score: 6980, level: 52, problemsSolved: 245, badge: 'Advanced', avatar: 'ED' },
    { rank: 5, name: 'James Brown', username: '@jamesb', score: 6540, level: 48, problemsSolved: 229, badge: 'Advanced', avatar: 'JB' },
    { rank: 6, name: 'Lisa Anderson', username: '@lisaa', score: 5920, level: 45, problemsSolved: 211, badge: 'Senior', avatar: 'LA' },
    { rank: 7, name: 'David Miller', username: '@davidm', score: 5480, level: 41, problemsSolved: 198, badge: 'Senior', avatar: 'DM' },
    { rank: 8, name: 'Jennifer Taylor', username: '@jennifert', score: 5120, level: 38, problemsSolved: 187, badge: 'Intermediate', avatar: 'JT' },
    { rank: 9, name: 'Robert Martinez', username: '@robertm', score: 4890, level: 36, problemsSolved: 176, badge: 'Intermediate', avatar: 'RM' },
    { rank: 10, name: 'Maria Garcia', username: '@mariag', score: 4670, level: 34, problemsSolved: 165, badge: 'Intermediate', avatar: 'MG' },
  ];

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'Elite': return 'error';
      case 'Master': return 'warning';
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Senior': return 'secondary';
      case 'Intermediate': return 'default';
      default: return 'default';
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <TrophyIcon sx={{ color: '#FFD700', fontSize: 20 }} />;
    if (rank === 2) return <MedalIcon sx={{ color: '#C0C0C0', fontSize: 20 }} />;
    if (rank === 3) return <MedalIcon sx={{ color: '#CD7F32', fontSize: 20 }} />;
    return <Typography variant="body2" fontWeight="bold" color="text.secondary">#{rank}</Typography>;
  };

  const getRankBackgroundColor = (rank) => {
    if (rank === 1) return '#FFF3E0';
    if (rank === 2) return '#F5F5F5';
    if (rank === 3) return '#FFF8E1';
    return 'transparent';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: 'calc(100vh - 80px)',
        }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
            {/* Header Section */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 'bold', 
                  color: '#1e293b',
                  mb: 1,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Global Leaderboard
                </Typography>
                <Typography variant="body1" color="#64748b" sx={{ mb: 3 }}>
                  Track your progress and compete with the best players worldwide
                </Typography>
              </Box>
            </Fade>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
              {statsData.map((stat, index) => (
                <Fade in timeout={1000 + index * 200} key={stat.label}>
                  <Card 
                    sx={{ 
                      background: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        borderColor: stat.color
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          backgroundColor: alpha(stat.color, 0.1),
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {stat.icon}
                        </Box>
                        <Chip 
                          label={stat.change} 
                          size="small" 
                          sx={{ 
                            backgroundColor: alpha('#10B981', 0.1),
                            color: '#10B981',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="#64748b">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>

        {/* Search and Sort Bar */}
            <Fade in timeout={1200}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  mb: 4, 
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Search players by name or username..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                      flex: 1,
                      minWidth: { xs: '100%', sm: '300px' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: alpha('#6366F1', 0.02),
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          borderColor: '#6366F1',
                          backgroundColor: alpha('#6366F1', 0.04)
                        },
                        '&.Mui-focused': {
                          borderColor: '#6366F1',
                          backgroundColor: 'white',
                          boxShadow: `0 0 0 3px ${alpha('#6366F1', 0.1)}`
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ 
                        borderRadius: 2.5,
                        backgroundColor: alpha('#6366F1', 0.02),
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          borderColor: '#6366F1',
                          backgroundColor: alpha('#6366F1', 0.04)
                        },
                        '&.Mui-focused': {
                          borderColor: '#6366F1',
                          backgroundColor: 'white',
                          boxShadow: `0 0 0 3px ${alpha('#6366F1', 0.1)}`
                        }
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterList sx={{ color: '#64748b', mr: 1 }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="score">Sort by Score</MenuItem>
                      <MenuItem value="level">Sort by Level</MenuItem>
                      <MenuItem value="problems">Sort by Problems</MenuItem>
                      <MenuItem value="name">Sort by Name</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Fade>

        {/* Leaderboard Table */}
            <Fade in timeout={1400}>
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'white',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                  <Table sx={{ minWidth: { xs: 600, sm: 800, md: 1000 } }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 80, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Rank
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 200, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Player
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 100, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Score
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 100, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Level
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 120, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Problems
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: '600', 
                          color: '#475569', 
                          minWidth: 100, 
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Badge
                        </TableCell>
                      </TableRow>
                    </TableHead>
              <TableBody>
                {leaderboardData
                  .filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.username.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow 
                      key={user.rank}
                      sx={{ 
                        backgroundColor: getRankBackgroundColor(user.rank),
                        '&:hover': {
                          backgroundColor: alpha('#6366F1', 0.04),
                          '& .MuiTableCell-root': {
                            color: '#1e293b'
                          }
                        },
                        transition: 'all 0.2s ease-in-out',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRankIcon(user.rank)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              background: user.rank <= 3 
                                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                                : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              boxShadow: user.rank <= 3 ? '0 4px 12px rgba(255, 215, 0, 0.4)' : '0 2px 8px rgba(99, 102, 241, 0.3)'
                            }}
                          >
                            {user.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                              {user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#6366F1', fontSize: '0.875rem' }}>
                          {user.score.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b', fontSize: '0.875rem' }}>
                            {user.level}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.25 }}>
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                sx={{ 
                                  fontSize: 10,
                                  color: i < Math.floor(user.level / 20) ? '#FFD700' : '#e2e8f0'
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b', fontSize: '0.875rem' }}>
                          {user.problemsSolved}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.badge} 
                          color={getBadgeColor(user.badge)}
                          size="small"
                          variant="filled"
                          sx={{ 
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            height: 24,
                            borderRadius: 1.5
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: { xs: 2, sm: 3 }, 
                  flexWrap: 'wrap', 
                  gap: 2,
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, leaderboardData.length)} of {leaderboardData.length} players
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="#64748b" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.875rem' }}>
                      Rows per page:
                    </Typography>
                    <Select
                      value={rowsPerPage}
                      onChange={handleChangeRowsPerPage}
                      size="small"
                      sx={{ 
                        minWidth: 60,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        '&:hover': {
                          borderColor: '#6366F1'
                        }
                      }}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                    <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
                      Page {page + 1} of {Math.ceil(leaderboardData.length / rowsPerPage)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default User_Leaderboard;
