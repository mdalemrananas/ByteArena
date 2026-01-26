import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  LinearProgress,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  FaBars,
  FaBell,
  FaCode,
  FaChevronLeft,
  FaChevronRight,
  FaClock as ClockIcon,
  FaCoins as CoinsIcon,
  FaHome,
  FaSearch,
  FaSignOutAlt,
  FaTrophy as TrophyIcon,
  FaUser,
  FaUsers as UsersIcon,
} from 'react-icons/fa';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { getUserByFirebaseUid } from '../services/userService';
import '../User_panel/User_Dashboard.css';
import '../User_panel/User_Contest.css';

const QuestionSetterContest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState('contest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contestView, setContestView] = useState('All Contests'); // All Contests | My Contests

  const [contests, setContests] = useState([]);
  const [featuredContest, setFeaturedContest] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 8;

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuContest, setMenuContest] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null); // UUID from users table

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const ensureUserExists = async (firebaseUser) => {
    // First try to get user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUser.uid)
      .single();
    
    if (!fetchError && existingUser) {
      return existingUser.id;
    }
    
    // User doesn't exist, create them
    if (fetchError?.code === 'PGRST116') {
      const userProfile = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Question Setter',
        auth_provider: 'email',
        last_login: new Date().toISOString()
      };
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([userProfile])
        .select('id')
        .single();
      
      if (!insertError && newUser) {
        console.log('Created new user in database:', newUser.id);
        return newUser.id;
      } else {
        console.error('Error creating user:', insertError);
        return null;
      }
    }
    
    return null;
  };

  const fetchContests = async () => {
    try {
      // First, fetch all contests
      const { data: contestsData, error: contestsError } = await supabase
        .from('contests')
        .select('*')
        .order('registration_end', { ascending: true });

      if (contestsError) {
        console.error('Error fetching contests:', contestsError);
        return;
      }

      // If no contests, set empty array and return
      if (!contestsData || contestsData.length === 0) {
        setContests([]);
        return;
      }

      // Get participant counts for all contests in a single query
      const { data: participantsData, error: participantsError } = await supabase
        .from('contest_participants')
        .select('contest_id')
        .in('contest_id', contestsData.map(contest => contest.id));

      if (participantsError) {
        console.error('Error fetching participant counts:', participantsError);
        // Continue with the contests data even if participant count fails
        setContests(contestsData || []);
      } else {
        // Create a map of contest_id to participant count
        const participantCounts = participantsData.reduce((acc, { contest_id }) => {
          acc[contest_id] = (acc[contest_id] || 0) + 1;
          return acc;
        }, {});

        // Merge participant counts into contests data
        const contestsWithParticipants = contestsData.map(contest => ({
          ...contest,
          participant_count: participantCounts[contest.id] || 0
        }));

        setContests(contestsWithParticipants);
      }

      const now = new Date();
      const upcomingContests = contestsData.filter(
        (contest) => new Date(contest.registration_end) > now
      ) || [];
      const sortedUpcoming = upcomingContests.sort(
        (a, b) => new Date(a.registration_end) - new Date(b.registration_end),
      );
      setFeaturedContest(sortedUpcoming.length > 0 ? sortedUpcoming[0] : null);
    } catch (error) {
      console.error('Error in fetchContests:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userObj = {
          displayName: currentUser.displayName || 'Question Setter',
          email: currentUser.email,
          photoURL:
            currentUser.photoURL ||
            `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Question Setter'}&background=random`,
          uid: currentUser.uid,
        };
        setUser(userObj);
        // Ensure user exists in database and get their UUID
        const userId = await ensureUserExists(currentUser);
        if (userId) {
          setCurrentUserId(userId);
        } else {
          console.error('Failed to get or create user UUID');
        }
        fetchContests();
      } else {
        setUser(null);
        setCurrentUserId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Refetch when coming back from create/edit.
    if (currentUserId) {
      fetchContests();
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    // Refetch contests when currentUserId changes to ensure proper filtering
    if (currentUserId) {
      fetchContests();
    }
  }, [currentUserId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRegistrationStatus = (registrationStart, registrationEnd) => {
    const now = new Date();
    const start = new Date(registrationStart);
    const end = new Date(registrationEnd);
    if (now < start) return 'Upcoming';
    if (now > end) return 'Closed';
    return 'Registration Open';
  };

  const getDifficultyColor = (difficulty) => {
    switch ((difficulty || '').toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const isMyContest = (contest) => {
    if (!currentUserId || !contest?.created_by) {
      return false;
    }
    // Ensure both are strings for comparison
    const contestCreatedBy = String(contest.created_by);
    const userId = String(currentUserId);
    return contestCreatedBy === userId;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FFA000';
      case 'rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const filteredContests = useMemo(() => {
    const now = new Date();
    let filtered = [...contests];
    
    if (contestView === 'My Contests') {
      // Show all contests created by the user, regardless of status
      filtered = filtered.filter((c) => isMyContest(c));
    } else {
      // For 'All Contests', only show approved contests that are active/upcoming
      filtered = filtered.filter(
        (c) => c.status?.toLowerCase() === 'approved' && new Date(c.registration_end) > now
      );
    }
    
    return filtered;
  }, [contests, contestView, currentUserId]);

  const handleOpenMenu = (event, contest) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuContest(contest);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuContest(null);
  };

  const handleView = (contestId) => {
    handleCloseMenu();
    navigate(`/question-setter/contest/${contestId}`);
  };

  const handleEdit = (contestId) => {
    handleCloseMenu();
    navigate(`/question-setter/create-competition?editContest=${contestId}`);
  };

  const handleAskDelete = (contest) => {
    handleCloseMenu();
    setContestToDelete(contest);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contestToDelete?.id) return;
    try {
      const { error } = await supabase.from('contests').delete().eq('id', contestToDelete.id);
      if (error) {
        console.error('Error deleting contest:', error);
        return;
      }
      setContests((prev) => prev.filter((c) => c.id !== contestToDelete.id));
      setDeleteDialogOpen(false);
      setContestToDelete(null);
    } catch (e) {
      console.error('Error deleting contest:', e);
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
        <main
          className="ud-main"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
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
          {[
            { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
            { key: 'practice', name: 'Practice Problems', icon: <FaCode className="menu-icon" /> },
            { key: 'contest', name: 'Contest', icon: <TrophyIcon className="menu-icon" /> },
            { key: 'leaderboard', name: 'Leaderboard', icon: <UsersIcon className="menu-icon" /> },
            { key: 'logout', name: 'Logout', icon: <FaSignOutAlt className="menu-icon" />, danger: true },
          ].map((item) => (
            <button
              key={item.key}
              className={`ud-nav-item ${active === item.key ? 'active' : ''} ${
                item.danger ? 'danger' : ''
              }`}
              onClick={() => {
                if (item.key === 'logout') return handleLogout();
                setActive(item.key);
                if (item.key === 'home') navigate('/question-setter');
                if (item.key === 'practice') navigate('/question-setter/explore');
                if (item.key === 'contest') navigate('/question-setter/contest');
                if (item.key === 'leaderboard') navigate('/question-setter/leaderboard');
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
              <input type="text" placeholder="Search contests..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
              <FaHome />
            </button>
            <div
              className="profile"
              onClick={() => navigate('/question-setter/profile')}
              style={{ cursor: 'pointer' }}
              data-tooltip="Profile"
            >
              <div className="avatar">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${
                        user.displayName || 'Question Setter'
                      }&background=random`;
                    }}
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'Question Setter'}</span>
            </div>
          </div>
        </header>

        <Container
          maxWidth={false}
          sx={{
            px: { xs: 1, sm: 2, md: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
            width: '100%',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Contests
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create and manage competitive programming contests
            </Typography>
          </Box>

          {featuredContest && (
            <Card
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    gap: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 260 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>
                      {featuredContest.title}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, color: 'white' }}>
                      {featuredContest.title_description}
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span" sx={{ color: 'white' }}>
                            📅
                          </Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                            {formatDate(featuredContest.registration_start)} - {formatDate(featuredContest.registration_end)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UsersIcon style={{ color: 'white' }} />
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {featuredContest.total_register || 0} participants
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CoinsIcon style={{ color: 'white' }} />
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Prize pool ${featuredContest.prize_money || '0'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                          {getRegistrationStatus(featuredContest.registration_start, featuredContest.registration_end)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                          {(featuredContest.contest_difficulty || '').toString()}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={75}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          '& .MuiLinearProgress-bar': { backgroundColor: 'white' },
                        }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Chip
                          label={`${featuredContest.question_problem} Questions`}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Chip
                          label={`${featuredContest.time_limit_qs}s per question`}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Chip
                          label={(featuredContest.contest_difficulty || '').toString()}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: 'white',
                        color: '#764ba2',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                      onClick={() => navigate('/question-setter/create-competition')}
                    >
                      Create Contest
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={contestView === 'All Contests' ? 'contained' : 'outlined'}
              onClick={() => setContestView('All Contests')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              All Contests
            </Button>
            <Button
              variant={contestView === 'My Contests' ? 'contained' : 'outlined'}
              onClick={() => setContestView('My Contests')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              My Contests
            </Button>
          </Box>

          <Box sx={{ mb: 4, maxWidth: '1400px', mx: 'auto' }}>
            <Grid container spacing={3}>
              {filteredContests
                .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
                .map((contest) => {
                  const canManage = isMyContest(contest);
                  return (
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
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                          }}
                          onClick={() => navigate(`/question-setter/contest/${contest.id}`)}
                        >
                          <Box
                            sx={{
                              height: 160,
                              backgroundImage: contest.cover_image
                                ? `url(${contest.cover_image})`
                                : 'url(/Contest_Cover.jpg)',
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
                                background:
                                  'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
                              },
                            }}
                          >
                            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                              <Chip
                                label={contest.contest_difficulty}
                                size="small"
                                sx={{
                                  backgroundColor: getDifficultyColor(contest.contest_difficulty),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                }}
                              />
                            </Box>
                          </Box>

                          <CardContent
                            sx={{
                              flex: 1,
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                              <Typography
                                variant="h6"
                                component="h3"
                                sx={{ fontWeight: 'bold', flex: 1, fontSize: '1.1rem', lineHeight: 1.3 }}
                              >
                                {contest.title}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                                maxHeight: '2.8em',
                              }}
                            >
                              {contest.title_description}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box component="span" sx={{ fontSize: 12, color: '#666' }}>
                                  📅
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(contest.registration_start)} - {formatDate(contest.registration_end)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <UsersIcon style={{ fontSize: 14, color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {contest.participant_count || 0} participants
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={contest.status || 'pending'}
                                    size="small"
                                    sx={{
                                      backgroundColor: getStatusColor(contest.status),
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '10px',
                                      height: '20px',
                                      '& .MuiChip-label': {
                                        px: 0.5,
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClockIcon style={{ fontSize: 14, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {getRegistrationStatus(contest.registration_start, contest.registration_end)}
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={(e) => handleOpenMenu(e, contest)}
                                sx={{
                                  backgroundColor: '#635BFF',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  '&:hover': { backgroundColor: '#635BFF', opacity: 0.9 },
                                }}
                              >
                                Actions
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </div>
                    </Grid>
                  );
                })}
            </Grid>

            {filteredContests.length > cardsPerPage && (
              <Box
                sx={{
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
                    '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
                    '&:disabled': { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#f9fafb' },
                    '&.active': { backgroundColor: '#6366f1', color: 'white', borderColor: '#6366f1' },
                  },
                }}
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.ceil(filteredContests.length / cardsPerPage) }, (_, i) => (
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
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredContests.length / cardsPerPage) - 1),
                    )
                  }
                  disabled={currentPage >= Math.ceil(filteredContests.length / cardsPerPage) - 1}
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </Box>
            )}
          </Box>
        </Container>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={() => handleView(menuContest?.id)}>View</MenuItem>
          {menuContest && isMyContest(menuContest) && (
            <>
              {menuContest.status?.toLowerCase() !== 'approved' && (
                <MenuItem onClick={() => handleEdit(menuContest.id)}>Edit</MenuItem>
              )}
              {menuContest.status?.toLowerCase() === 'approved' && (
                <MenuItem disabled>Edit (Not allowed for approved contests)</MenuItem>
              )}
              <MenuItem 
                onClick={() => handleAskDelete(menuContest)} 
                sx={{ color: '#dc2626' }}
                disabled={menuContest.status?.toLowerCase() === 'approved'}
              >
                {menuContest.status?.toLowerCase() === 'approved' ? 'Delete (Not allowed for approved contests)' : 'Delete'}
              </MenuItem>
            </>
          )}
        </Menu>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete contest</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this contest?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
};

export default QuestionSetterContest;

