import React, { useState, useEffect, useMemo } from 'react';
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
  FaCoins,
  FaUser
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
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
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [contests, setContests] = useState([]);
  const [featuredContest, setFeaturedContest] = useState(null);
  const [registeredContests, setRegisteredContests] = useState([]);

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

  // Monitor authentication state and fetch contests
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}&background=random`
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
    } else if (tabValue === 2) { // Past Contests tab - show past contests only
      filteredContests = contests.filter(contest => 
        new Date(contest.registration_end) <= now
      );
    } else if (tabValue === 1) { // My Contests tab - show registered contests only
      filteredContests = contests.filter(contest => 
        registeredContests.includes(contest.id)
      );
    } else {
      filteredContests = contests;
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filteredContests = filteredContests.filter(contest => 
        contest.contest_category && contest.contest_category.toLowerCase() === categoryFilter.toLowerCase()
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

  const categories = ['all', 'C/C++', 'Java', 'PHP', 'HTML, CSS', 'JavaScript', 'Python'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
  };

  const handleRegister = (contestId) => {
    console.log('Registering for contest:', contestId);
    navigate(`/contest/${contestId}`);
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
                  } else if (item.key === 'practice') {
                    navigate('/practice');
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
          maxWidth={false}
          sx={{ 
            px: { xs: 1, sm: 2, md: 3, lg: 4 }, 
            py: { xs: 2, sm: 3 },
            width: '100%'
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
              <Tab label="My Contests" />
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
                {getFilteredContests.map((contest) => (
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
                            {contest.total_register || 0} participants
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CoinsIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            ${contest.prize_money || 0} prize
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
                      {shouldShowRegisterButton(contest) ? (
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
                          View Details
                        </Button>
                      ) : (
                        <Box 
                          sx={{ 
                            width: '100px',  // Match button width
                            height: '36px',   // Match button height
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </div>
                </Grid>
              ))}
            </Grid>
            )}
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
