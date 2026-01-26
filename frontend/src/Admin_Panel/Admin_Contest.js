import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Menu,
  MenuItem,
  IconButton,
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel
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
  FaChevronLeft,
  FaChevronRight,
  FaChevronLeft as ChevronLeftIcon,
  FaChevronRight as ChevronRightIcon,
  FaEllipsisV as MoreVertIcon,
  FaEye as ViewIcon,
  FaEdit as EditIcon,
  FaTrash as DeleteIcon
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
  FaCoins,
  FaUser,
  FaPlus,
  FaUsers,
  FaChartBar,
  FaCog,
  FaMedal
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import './Admin_Dashboard.css';
import './Admin_Contest.css';

const menuItems = [
  { key: 'home', name: 'Dashboard', icon: <FaHome className="menu-icon" /> },
  { key: 'users', name: 'User Management', icon: <FaUsers className="menu-icon" /> },
  { key: 'contests', name: 'Contests', icon: <FaTrophy className="menu-icon" /> },
  { key: 'problems', name: 'Practice Problem', icon: <FaCode className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaMedal className="menu-icon" /> },
  { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
];

const Admin_Contest = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('contests');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [contests, setContests] = useState([]);
  const [featuredContest, setFeaturedContest] = useState(null);
  const [registeredContests, setRegisteredContests] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 8; // 2 rows with 4 cards each
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedContest, setSelectedContest] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch user's registered contests
  const fetchRegisteredContests = async (userId) => {
    try {
      // First get user's UUID from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', userId)
        .single();

      let registeredContestIds = [];

      if (userError || !userData) {
        console.log('User not found in users table, trying direct Firebase UID check');
        // Try with Firebase UID directly
        const { data, error } = await supabase
          .from('contest_participants')
          .select('contest_id')
          .eq('user_id', userId);

        if (!error && data) {
          registeredContestIds = data.map(item => item.contest_id);
        }
      } else {
        // Use proper UUID
        const { data, error } = await supabase
          .from('contest_participants')
          .select('contest_id')
          .eq('user_id', userData.id);

        if (!error && data) {
          registeredContestIds = data.map(item => item.contest_id);
        }
      }

      setRegisteredContests(registeredContestIds);
    } catch (error) {
      console.error('Error fetching registered contests:', error);
    }
  };

  // Fetch contests from Supabase
  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('registration_end', { ascending: true });

      if (error) {
        console.error('Error fetching contests:', error);
        return;
      }

      console.log('Contests fetched from Supabase:', data);
      setContests(data || []);

      // Fetch participant counts for all contests
      if (data && data.length > 0) {
        const counts = {};
        for (const contest of data) {
          counts[contest.id] = await getParticipantCount(contest.id);
        }
        setParticipantCounts(counts);
      }

      // Filter for upcoming contests (registration_end > now) and find the one ending soonest
      const now = new Date();
      const upcomingContests = data?.filter(contest =>
        new Date(contest.registration_end) > now
      ) || [];

      // Sort by registration_end (soonest first) and take the first one
      const sortedUpcoming = upcomingContests.sort((a, b) =>
        new Date(a.registration_end) - new Date(b.registration_end)
      );

      if (sortedUpcoming.length > 0) {
        setFeaturedContest(sortedUpcoming[0]);
      }
    } catch (error) {
      console.error('Error in fetchContests:', error);
    }
  };

  // Function to get participant count for a contest (excluding only null/invalid statuses)
  const getParticipantCount = async (contestId) => {
    try {
      const { data, error } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('contest_id', contestId)
        .in('status', ['registered', 'in_progress', 'completed', 'disqualified']);

      if (error) {
        console.error('Error fetching participants:', error);
        return 0;
      }

      return data ? data.length : 0;
    } catch (error) {
      console.error('Error in getParticipantCount:', error);
      return 0;
    }
  };

  // Monitor authentication state and fetch contests
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'Admin',
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Admin'}&background=random`
        });
        // Fetch contests when user is authenticated
        fetchContests();
        // Fetch user's registered contests
        fetchRegisteredContests(currentUser.uid);
      } else {
        setUser(null);
        setRegisteredContests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (key) => {
    setActive(key);
    switch (key) {
      case 'home':
        navigate('/admin_dashboard');
        break;
      case 'users':
        navigate('/admin_users');
        break;
      case 'contests':
        navigate('/admin_contests');
        break;
      case 'problems':
        navigate('/admin_problems');
        break;
      case 'leaderboard':
        navigate('/admin_leaderboard');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Debounce search term to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  // Check if user is registered for a specific contest
  const isUserRegisteredForContest = async (userId, contestId) => {
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

        return !error && data;
      } else {
        // Use proper UUID
        const { data, error } = await supabase
          .from('contest_participants')
          .select('id')
          .eq('contest_id', contestId)
          .eq('user_id', userData.id)
          .single();

        return !error && data;
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  };

  // Filter contests based on tab selection, category, difficulty, and search term
  const getFilteredContests = useMemo(() => {
    const now = new Date();
    let filteredContests = [];

    // Filter by tab first
    if (tabValue === 0) { // All Contests tab - show present/future contests only
      filteredContests = contests.filter(contest =>
        new Date(contest.registration_end) > now
      );
    } else if (tabValue === 1) { // Past Contests tab - show past contests only
      filteredContests = contests.filter(contest =>
        new Date(contest.registration_end) <= now
      );
    } else {
      filteredContests = contests;
    }

    // Apply category-based sorting or filtering
    if (categoryFilter === 'Registration End') {
      // Sort by registration end date (soonest first)
      filteredContests = [...filteredContests].sort((a, b) =>
        new Date(a.registration_end) - new Date(b.registration_end)
      );
    } else if (categoryFilter === 'Prize') {
      // Sort by prize amount (highest first)
      filteredContests = [...filteredContests].sort((a, b) =>
        (b.prize_money || 0) - (a.prize_money || 0)
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filteredContests = filteredContests.filter(contest =>
        contest.contest_difficulty && contest.contest_difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    // Filter by search term (using debounced value)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filteredContests = filteredContests.filter(contest =>
        (contest.title && contest.title.toLowerCase().includes(searchLower)) ||
        (contest.description && contest.description.toLowerCase().includes(searchLower)) ||
        (contest.contest_difficulty && contest.contest_difficulty.toLowerCase().includes(searchLower)) ||
        (contest.contest_category && contest.contest_category.toLowerCase().includes(searchLower)) ||
        (contest.prize_money && contest.prize_money.toString().includes(searchLower))
      );
    }

    return filteredContests;
  }, [contests, tabValue, categoryFilter, difficultyFilter, debouncedSearchTerm, registeredContests]);

  // Check if registration button should be shown
  const shouldShowRegisterButton = (contest) => {
    const now = new Date();
    const registrationStart = new Date(contest.registration_start);
    const registrationEnd = new Date(contest.registration_end);

    // Show register button only if registration is currently open (between start and end dates)
    return now >= registrationStart && now <= registrationEnd;
  };

  // Get search result count
  const getSearchResultCount = () => {
    return getFilteredContests.length;
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all';
  };

  const categories = ['all', 'Registration End', 'Prize'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
  };

  const handleRegister = (contestId) => {
    console.log('Viewing contest details:', contestId);
    navigate(`/admin_contest/${contestId}`);
  };

  const handleActionMenuOpen = (event, contest) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedContest(contest);
  };

  const handleActionMenuClose = (clearSelectedContest = true) => {
    setActionAnchorEl(null);
    if (clearSelectedContest) {
      setSelectedContest(null);
    }
  };

  const handleViewContest = () => {
    if (selectedContest) {
      navigate(`/admin_contest/${selectedContest.id}`);
    }
    handleActionMenuClose();
  };

  const handleEditContest = () => {
    if (selectedContest) {
      navigate(`/admin_contest/edit/${selectedContest.id}`);
    }
    handleActionMenuClose();
  };

  const handleDeleteContest = () => {
    setConfirmDialogOpen(true);
    handleActionMenuClose(false); // Don't clear selectedContest
  };

  const confirmDeleteContest = async () => {
    setConfirmDialogOpen(false);

    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', selectedContest.id);

      if (error) {
        console.error('Error deleting contest:', error);
        setNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete contest. Please try again.'
        });
      } else {
        // Refresh contests list
        fetchContests();
        setNotification({
          type: 'success',
          title: 'Delete Successful',
          message: `Contest "${selectedContest.title}" has been deleted successfully.`
        });
      }
    } catch (error) {
      console.error('Error in confirmDeleteContest:', error);
      setNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'An unexpected error occurred. Please try again.'
      });
    }
    setSelectedContest(null);
  };

  const cancelDeleteContest = () => {
    setConfirmDialogOpen(false);
    setSelectedContest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
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

  const handleStatusChange = async (contestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('contests')
        .update({ status: newStatus })
        .eq('id', contestId);

      if (error) {
        console.error('Error updating contest status:', error);
        setNotification({
          type: 'error',
          title: 'Status Update Failed',
          message: 'Failed to update contest status. Please try again.'
        });
      } else {
        // Refresh contests list
        fetchContests();
        setNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Contest status has been updated to ${newStatus}.`
        });
      }
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      setNotification({
        type: 'error',
        title: 'Status Update Failed',
        message: 'An unexpected error occurred. Please try again.'
      });
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
          <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="ud-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
              onClick={() => handleNavigation(item.key)}
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
            <p className="eyebrow">Contest Management</p>
            <h1>Manage Contests:</h1>
            <h2>Create, Monitor, and Analyze</h2>
            <p className="sub">Oversee all contest activities and participant engagement</p>
            <button
              className="primary-btn"
              onClick={() => navigate('/admin_contest/create')}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <FaPlus style={{ marginRight: '8px' }} />
              Create New Contest
            </button>
          </div>
        </section>

        <Container
          maxWidth={false}
          sx={{
            px: { xs: 1, sm: 2, md: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
            width: '100%'
          }}
        >
          {/* Header */}
          {/*
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Contests
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Compete in exciting challenges and win amazing prizes
            </Typography>
          </Box>
          */}

          {/* Featured Tournament */}
          {/*
          {featuredContest && (
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
                      {featuredContest.title_description}
                    </Typography>
                  
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ color: 'white' }} />
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                              {formatDate(featuredContest.registration_start)} - {formatDate(featuredContest.registration_end)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UsersIcon sx={{ color: 'white' }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {featuredContest.total_register || 0} participants
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CoinsIcon sx={{ color: 'white' }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Prize pool ${featuredContest.prize_money || '0'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                          {getRegistrationStatus(featuredContest.registration_start, featuredContest.registration_end)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                          {featuredContest.contest_difficulty}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
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
                          label={`${featuredContest.question_problem} Questions`} 
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
                          label={`${featuredContest.time_limit_qs}s per question`} 
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
                          label={featuredContest.contest_difficulty} 
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
                  onClick={() => handleRegister(featuredContest.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}
          */}

          {/* Contest Filters */}
          <Box sx={{ mb: 4 }}>
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
              <Tab label="Past Contests" />
            </Tabs>

            {/* Search and Filter Section */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap'
            }}>
              {/* Search Bar */}
              <Box sx={{
                width: '350px', // Decreased width
                position: 'relative'
              }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px',
                    zIndex: 2
                  }}
                />
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      clearSearch();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    fontSize: '14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: 'white',
                    paddingRight: searchTerm ? '40px' : '12px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.color = '#6b7280';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'none';
                      e.target.style.color = '#9ca3af';
                    }}
                    title="Clear search (ESC)"
                  >
                    ×
                  </button>
                )}
              </Box>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              {/* Difficulty Select */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Clear All Filters Button */}
              {hasActiveFilters() && (
                <Button
                  variant="outlined"
                  onClick={clearAllFilters}
                  size="small"
                  sx={{
                    borderColor: '#e5e7eb',
                    color: '#6b7280',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                >
                  Clear All
                </Button>
              )}

              {/* Search Results Count */}
              {debouncedSearchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {getSearchResultCount()} result{getSearchResultCount() !== 1 ? 's' : ''} found
                </Typography>
              )}
            </Box>
          </Box>

          {/* Contest Cards Grid */}
          <Box sx={{ mb: 4, maxWidth: '1400px', mx: 'auto' }}>
            {debouncedSearchTerm && getFilteredContests.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No contests found matching "{debouncedSearchTerm}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or filters
                </Typography>
                <Button
                  variant="outlined"
                  onClick={clearSearch}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getFilteredContests
                  .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                  .map((contest) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={contest.id}>
                      <div className="contest-card-wrapper">
                        <Card
                          sx={{
                            width: '330px',
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
                              backgroundImage: contest.cover_image ? `url(${contest.cover_image})` : 'url(/Contest_Cover.jpg)',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                              flexShrink: 0,
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
                            {/* Difficulty chip in top-right */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 1
                              }}
                            >
                              <Chip
                                label={contest.contest_difficulty}
                                size="small"
                                sx={{
                                  backgroundColor: getDifficultyColor(contest.contest_difficulty),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  height: '24px'
                                }}
                              />
                            </Box>
                          </Box>

                          <CardContent sx={{
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" component="h3" sx={{
                                fontWeight: 'bold',
                                flex: 1,
                                fontSize: '1.1rem',
                                lineHeight: 1.3
                              }}>
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
                              {contest.title_description}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarIcon style={{ fontSize: '14px', color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(contest.registration_start)} - {formatDate(contest.registration_end)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <UsersIcon style={{ fontSize: '14px', color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {participantCounts[contest.id] || 0} participants
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CoinsIcon style={{ fontSize: '14px', color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {contest.prize_money || 0} Points
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClockIcon style={{ fontSize: '14px', color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {getRegistrationStatus(contest.registration_start, contest.registration_end)}
                                </Typography>
                              </Box>
                              <div>
                                <IconButton
                                  onClick={(e) => handleActionMenuOpen(e, contest)}
                                  sx={{
                                    backgroundColor: '#635BFF',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: '#635BFF',
                                      opacity: 0.9
                                    },
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                  }}
                                >
                                  Actions <MoreVertIcon style={{ marginLeft: '4px', fontSize: '12px' }} />
                                </IconButton>
                                <Menu
                                  anchorEl={actionAnchorEl}
                                  open={Boolean(actionAnchorEl)}
                                  onClose={handleActionMenuClose}
                                  PaperProps={{
                                    sx: {
                                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '8px',
                                      mt: 1,
                                      minWidth: '150px'
                                    }
                                  }}
                                >
                                  <MenuItem onClick={handleViewContest} sx={{ fontSize: '14px' }}>
                                    <ViewIcon style={{ marginRight: '8px', color: '#6366f1' }} />
                                    View
                                  </MenuItem>
                                  <MenuItem onClick={handleEditContest} sx={{ fontSize: '14px' }}>
                                    <EditIcon style={{ marginRight: '8px', color: '#10b981' }} />
                                    Edit
                                  </MenuItem>
                                  <MenuItem onClick={handleDeleteContest} sx={{ fontSize: '14px', color: '#ef4444' }}>
                                    <DeleteIcon style={{ marginRight: '8px' }} />
                                    Delete
                                  </MenuItem>
                                </Menu>
                              </div>
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={contest.status || 'pending'}
                                onChange={(e) => handleStatusChange(contest.id, e.target.value)}
                                sx={{
                                  backgroundColor: getStatusColor(contest.status),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                  height: '30px',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                  },
                                  '& .MuiSvgIcon-root': {
                                    color: 'white'
                                  },
                                  '& .MuiSelect-select': {
                                    padding: '4px 8px',
                                    textTransform: 'capitalize'
                                  }
                                }}
                              >
                                <MenuItem value="pending" sx={{ textTransform: 'capitalize' }}>Pending</MenuItem>
                                <MenuItem value="approved" sx={{ textTransform: 'capitalize' }}>Approved</MenuItem>
                                <MenuItem value="rejected" sx={{ textTransform: 'capitalize' }}>Rejected</MenuItem>
                              </Select>
                            </FormControl>
                          </CardContent>
                        </Card>
                      </div>
                    </Grid>
                  ))}
              </Grid>
            )}

            {/* Pagination Controls */}
            {getFilteredContests.length > cardsPerPage && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                mt: 4,
                '& button': {
                  minWidth: '36px',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#4b5563',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    borderColor: '#d1d5db'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    backgroundColor: '#f9fafb'
                  },
                  '&.active': {
                    backgroundColor: '#6366f1',
                    color: 'white',
                    borderColor: '#6366f1'
                  }
                },
                '& .pagination-arrow': {
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    borderColor: '#d1d5db'
                  }
                }
              }}>
                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.ceil(getFilteredContests.length / cardsPerPage) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={currentPage === i ? 'active' : ''}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="pagination-arrow"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getFilteredContests.length / cardsPerPage) - 1))}
                  disabled={currentPage >= Math.ceil(getFilteredContests.length / cardsPerPage) - 1}
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </Box>
            )}
          </Box>
        </Container>
      </main>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={cancelDeleteContest}
        aria-labelledby="confirm-delete-dialog"
        aria-describedby="confirm-delete-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '8px',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle
          id="confirm-delete-dialog"
          sx={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#d32f2f',
            paddingBottom: '8px'
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: '16px' }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete the contest "<strong>{selectedContest?.title}</strong>"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ paddingTop: '0', gap: 1 }}>
          <Button
            onClick={cancelDeleteContest}
            variant="outlined"
            sx={{
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#d0d0d0',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteContest}
            variant="contained"
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '16px 20px',
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                marginLeft: '12px',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin_Contest;
