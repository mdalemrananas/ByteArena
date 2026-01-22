import React, { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCode,
  FaCoins,
  FaChartLine,
  FaEye,
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
  FaCog,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Chip,
  Fade
} from '@mui/material';
import { Search as SearchIcon, FilterList, Star as StarIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import './Admin_Dashboard.css';
import './Admin_Contest_Details.css';

const menuItems = [
  { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
  { key: 'users', name: 'Users', icon: <FaUsers className="menu-icon" /> },
  { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
  { key: 'problems', name: 'Problems', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'analytics', name: 'Analytics', icon: <FaChartLine className="menu-icon" /> },
  { key: 'settings', name: 'Settings', icon: <FaCog className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const Admin_Contest_Details = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const [active, setActive] = useState('contests');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimating] = useState(false);
  const [contestData, setContestData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Leaderboard state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Leaderboard helper functions
  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy style={{ color: '#FFD700', fontSize: '1.2rem' }} />;
    if (rank === 2) return <FaMedal style={{ color: '#C0C0C0', fontSize: '1.2rem' }} />;
    if (rank === 3) return <FaMedal style={{ color: '#CD7F32', fontSize: '1.2rem' }} />;
    return <Typography variant="body2" fontWeight="600" sx={{ color: '#64748b' }}>#{rank}</Typography>;
  };

  const getRankBackgroundColor = (rank) => {
    if (rank === 1) return alpha('#FFD700', 0.1);
    if (rank === 2) return alpha('#C0C0C0', 0.1);
    if (rank === 3) return alpha('#CD7F32', 0.1);
    return 'transparent';
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Gold': 'warning',
      'Silver': 'default',
      'Bronze': 'success',
      'Diamond': 'info',
      'Platinum': 'secondary'
    };
    return colors[badge] || 'default';
  };

  // Fetch leaderboard data from database
  const fetchLeaderboardData = async () => {
    if (!contestId) return;
    
    setLeaderboardLoading(true);
    try {
      // First fetch participants with their user info
      const { data: participants, error: participantsError } = await supabase
        .from('contest_participants')
        .select(`
          id,
          score,
          rank,
          status,
          user_id,
          users!inner (
            id,
            display_name,
            username,
            email
          )
        `)
        .eq('contest_id', contestId)
        .eq('status', 'completed')
        .order('score', { ascending: false });

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        setLeaderboardData([]);
        return;
      }

      // Fetch problems solved count for each participant
      const participantsWithSolvedCount = await Promise.all(
        participants.map(async (participant) => {
          const { count, error: countError } = await supabase
            .from('contest_question_solves')
            .select('*', { count: 'exact', head: true })
            .eq('participate_id', participant.user_id);

          if (countError) {
            console.error('Error fetching solved count for user:', participant.user_id, countError);
            return {
              ...participant,
              problemsSolved: 0
            };
          }

          return {
            ...participant,
            problemsSolved: count || 0
          };
        })
      );

      // Transform data for the leaderboard display
      const transformedData = participantsWithSolvedCount.map((participant, index) => ({
        id: participant.user_id, // Add user_id for navigation
        rank: participant.rank || (index + 1),
        name: participant.users.display_name || 'Unknown User',
        username: participant.users.username ? `@${participant.users.username}` : '@user',
        score: participant.score || 0,
        level: participant.rank || 1, // Use rank as level since rank is stored in level column
        problemsSolved: participant.problemsSolved,
        badge: 'Bronze', // Default badge since column doesn't exist
        avatar: participant.users.display_name ? participant.users.display_name.charAt(0).toUpperCase() : 'U'
      }));

      setLeaderboardData(transformedData);
    } catch (error) {
      console.error('Error in fetchLeaderboardData:', error);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch leaderboard data when contest is loaded and tab changes to leaderboard
  useEffect(() => {
    if (contestId && activeTab === 'leaderboard') {
      fetchLeaderboardData();
    }
  }, [contestId, activeTab]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (item.key === 'home') {
                    navigate('/admin_dashboard');
                  } else if (item.key === 'users') {
                    navigate('/admin/users');
                  } else if (item.key === 'contests') {
                    navigate('/admin_contest');
                  } else if (item.key === 'problems') {
                    navigate('/admin/problems');
                  } else if (item.key === 'analytics') {
                    navigate('/admin/analytics');
                  } else if (item.key === 'leaderboard') {
                    navigate('/admin_leaderboard');
                  } else if (item.key === 'settings') {
                    navigate('/admin/settings');
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
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} data-tooltip="Profile">
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
                    <h2 className="section-title" style={{ color: 'white' }}>Overview</h2>
                    
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
                    <h2 className="section-title" style={{ color: 'white' }}>Rules</h2>
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
                        {leaderboardLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                            <Typography variant="body1" color="#64748b">Loading leaderboard data...</Typography>
                          </Box>
                        ) : leaderboardData.length === 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                            <FaTrophy style={{ fontSize: '3rem', color: '#e2e8f0', marginBottom: '1rem' }} />
                            <Typography variant="h6" color="#64748b" gutterBottom>
                              No completed participants yet
                            </Typography>
                            <Typography variant="body2" color="#94a3b8">
                              Participants who complete the contest will appear here in the leaderboard.
                            </Typography>
                          </Box>
                        ) : (
                          <>
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
                                      Competitor Name
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
                                      minWidth: 120, 
                                      backgroundColor: '#f8fafc',
                                      borderBottom: '2px solid #e2e8f0',
                                      fontSize: '0.875rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em'
                                    }}>
                                      Problems Solve
                                    </TableCell>
                                    <TableCell sx={{ 
                                      fontWeight: '600', 
                                      color: '#475569', 
                                      minWidth: 100, 
                                      backgroundColor: '#f8fafc',
                                      borderBottom: '2px solid #e2e8f0',
                                      fontSize: '0.875rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                      textAlign: 'center'
                                    }}>
                                      View Code
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {leaderboardData
                                    .filter(user => 
                                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      user.username.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .sort((a, b) => {
                                      if (sortBy === 'score') {
                                        return b.score - a.score;
                                      } else if (sortBy === 'problems') {
                                        return b.problemsSolved - a.problemsSolved;
                                      } else if (sortBy === 'name') {
                                        return a.name.localeCompare(b.name);
                                      } else if (sortBy === 'level') {
                                        return b.rank - a.rank;
                                      }
                                      return 0;
                                    })
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
                                          <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b', fontSize: '0.875rem' }}>
                                            {user.problemsSolved}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <button 
                                            className="view-code-button"
                                            onClick={() => {
                                              navigate(`/admin_contest/${contestId}/code/${user.id}`, {
                                                state: {
                                                  contestId: contestId,
                                                  userId: user.id,
                                                  username: user.username || 'Admin',
                                                  problemId: contestData?.question_problem || 1 // Pass the first problem ID
                                                }
                                              });
                                            }}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              color: '#6366F1',
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              '&:hover': {
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)'
                                              }
                                            }}
                                          >
                                            <FaEye size={18} />
                                          </button>
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
                                  <MenuItem value={3}>3</MenuItem>
                                  <MenuItem value={5}>5</MenuItem>
                                  <MenuItem value={10}>10</MenuItem>
                                  <MenuItem value={25}>25</MenuItem>
                                  <MenuItem value={50}>50</MenuItem>
                                </Select>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      border: '1px solid rgba(226, 232, 240, 0.8)',
                                      borderRadius: 1,
                                      backgroundColor: page === 0 ? '#f1f5f9' : 'white',
                                      color: page === 0 ? '#94a3b8' : '#64748b',
                                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                                      fontSize: '0.875rem',
                                      '&:hover': {
                                        backgroundColor: page === 0 ? '#f1f5f9' : alpha('#6366F1', 0.04),
                                        borderColor: page === 0 ? 'rgba(226, 232, 240, 0.8)' : '#6366F1'
                                      }
                                    }}
                                  >
                                    Previous
                                  </button>
                                  <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1}
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      border: '1px solid rgba(226, 232, 240, 0.8)',
                                      borderRadius: 1,
                                      backgroundColor: page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1 ? '#f1f5f9' : 'white',
                                      color: page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1 ? '#94a3b8' : '#64748b',
                                      cursor: page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1 ? 'not-allowed' : 'pointer',
                                      fontSize: '0.875rem',
                                      '&:hover': {
                                        backgroundColor: page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1 ? '#f1f5f9' : alpha('#6366F1', 0.04),
                                        borderColor: page >= Math.ceil(leaderboardData.length / rowsPerPage) - 1 ? 'rgba(226, 232, 240, 0.8)' : '#6366F1'
                                      }
                                    }}
                                  >
                                    Next
                                  </button>
                                </Box>
                                <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
                                  Page {page + 1} of {Math.ceil(leaderboardData.length / rowsPerPage)}
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        )}
                      </Paper>
                    </Fade>
                  </>
                )}

                {activeTab === 'prizes' && (
                  <>
                    <h2 className="section-title" style={{ color: 'white' }}>Prizes</h2>
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

      <style>{`
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

export default Admin_Contest_Details;