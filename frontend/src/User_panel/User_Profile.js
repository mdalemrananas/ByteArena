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
  IconButton,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
  FaMedal,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUserCircle,
  FaEnvelope,
  FaGlobe,
  FaCodeBranch,
  FaTimes,
  FaPlus
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTabValue, setEditTabValue] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Full Stack Developer | Competitive Programmer | Open Source Enthusiast',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'DSA']
  });
  
  const [editFormData, setEditFormData] = useState({
    display_name: '',
    email: '',
    bio: '',
    website: '',
    country: '',
    skills: [],
    currentSkill: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        
        try {
          // Set basic user info from Firebase
          setUser(prev => ({
            ...prev,
            displayName: currentUser.displayName || userData.name,
            email: currentUser.email || userData.email,
            photoURL: currentUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'
          }));

          // Fetch user data from Supabase
          let supabaseUserData = await fetchUserData(currentUser.uid);
          
          // If user doesn't exist in Supabase, create a basic profile
          if (!supabaseUserData) {
            supabaseUserData = await createOrUpdateUserProfile(currentUser);
          }

          // Update local state with Supabase data
          if (supabaseUserData) {
            setUserData(prev => ({
              ...prev,
              name: supabaseUserData.display_name || prev.name,
              email: supabaseUserData.email || prev.email,
              bio: supabaseUserData.bio || prev.bio,
              website: supabaseUserData.website || prev.website,
              location: supabaseUserData.country || prev.location,
              skills: supabaseUserData.skills || prev.skills,
              // Add any other fields from Supabase you want to use
              username: supabaseUserData.username,
              avatar_url: supabaseUserData.avatar_url,
              rating: supabaseUserData.rating,
              rank: supabaseUserData.rank,
              wins: supabaseUserData.wins,
              losses: supabaseUserData.losses,
              matches_played: supabaseUserData.matches_played
            }));

            // Update user state with Supabase data
            setUser(prev => ({
              ...prev,
              displayName: supabaseUserData.display_name || prev.displayName,
              photoURL: supabaseUserData.avatar_url || prev.photoURL
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Still show the profile with Firebase data even if Supabase fails
        } finally {
          setLoading(false);
        }
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

  const handleEditProfile = () => {
    setEditFormData({
      display_name: user?.displayName || userData.name,
      email: user?.email || userData.email,
      bio: userData.bio,
      website: userData.website,
      country: userData.location || '',
      skills: userData.skills || [],
      currentSkill: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditModalOpen(true);
  };

  const handleEditTabChange = (event, newValue) => {
    setEditTabValue(newValue);
  };

  const handleEditFormChange = (field) => (event) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user from Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Validate required fields
      if (!editFormData.display_name?.trim()) {
        throw new Error('Display name is required');
      }
      if (!editFormData.email?.trim()) {
        throw new Error('Email is required');
      }

      // Prepare data for Supabase - matching the table schema exactly
      const profileData = {
        display_name: editFormData.display_name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        bio: editFormData.bio?.trim() || null,
        website: editFormData.website?.trim() || null,
        country: editFormData.country?.trim() || null,
        skills: editFormData.skills || [],
        updated_at: new Date().toISOString()
      };

      console.log('Saving profile data:', profileData);

      // Update user profile in Supabase
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('firebase_uid', currentUser.uid)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      console.log('Profile updated successfully in Supabase:', data);

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: editFormData.display_name,
        bio: editFormData.bio,
        website: editFormData.website,
        location: editFormData.country,
        skills: editFormData.skills
      }));

      // Update Firebase user display name if changed
      if (currentUser.displayName !== editFormData.display_name) {
        await currentUser.updateProfile({
          displayName: editFormData.display_name
        });
        setUser(prev => ({
          ...prev,
          displayName: editFormData.display_name
        }));
      }

      // Show success message
      alert('Profile updated successfully!');
      setEditModalOpen(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = () => {
    // Handle password change logic here
    console.log('Changing password:', {
      currentPassword: editFormData.currentPassword,
      newPassword: editFormData.newPassword,
      confirmPassword: editFormData.confirmPassword
    });
    setEditModalOpen(false);
  };

  const fetchUserData = async (firebaseUid) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // If user doesn't exist in Supabase yet, we'll create a basic profile
        if (error.code === 'PGRST116') { // No rows returned
          console.log('User not found in Supabase, creating new profile...');
          return null;
        }
        throw error;
      }

      console.log('User data fetched from Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      throw error;
    }
  };

  const createOrUpdateUserProfile = async (firebaseUser) => {
    try {
      const userProfile = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        auth_provider: 'email',
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      // Try to update first, then insert if not exists
      const { data, error } = await supabase
        .from('users')
        .upsert(userProfile, { 
          onConflict: 'firebase_uid',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user profile:', error);
        throw error;
      }

      console.log('User profile created/updated:', data);
      return data;
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
      throw error;
    }
  };

  const handleSkillInputChange = (event) => {
    const value = event.target.value;
    setEditFormData(prev => ({
      ...prev,
      currentSkill: value
    }));
  };

  const handleSkillKeyPress = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      const skill = editFormData.currentSkill?.trim() || '';
      const currentSkills = editFormData.skills || [];
      if (skill && !currentSkills.includes(skill)) {
        setEditFormData(prev => ({
          ...prev,
          skills: [...currentSkills, skill],
          currentSkill: ''
        }));
      } else {
        setEditFormData(prev => ({
          ...prev,
          currentSkill: ''
        }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = editFormData.skills || [];
    setEditFormData(prev => ({
      ...prev,
      skills: currentSkills.filter(skill => skill !== skillToRemove)
    }));
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
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<FaEdit />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
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

        {/* Edit Profile Modal - New Design */}
        <Modal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          aria-labelledby="edit-profile-modal"
          aria-describedby="edit-profile-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '85%', md: '800px' },
            maxHeight: '95vh',
            bgcolor: 'background.paper',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* New Modal Header */}
            <Box sx={{
              position: 'relative',
              p: 4,
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(40px)'
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                filter: 'blur(30px)'
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '15px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FaEdit style={{ fontSize: '28px' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" component="h2" fontWeight="700" sx={{ mb: 0.5 }}>
                      Edit Profile
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Customize your profile and security settings
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* New Tab Navigation */}
            <Box sx={{
              px: 4,
              py: 3,
              background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Box sx={{
                display: 'flex',
                gap: 2,
                p: 1,
                bgcolor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '12px'
              }}>
                <Button
                  onClick={() => setEditTabValue(0)}
                  sx={{
                    flex: 1,
                    py: 2,
                    px: 3,
                    borderRadius: '10px',
                    background: editTabValue === 0 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    color: editTabValue === 0 ? 'white' : 'text.secondary',
                    fontWeight: editTabValue === 0 ? '600' : '500',
                    boxShadow: editTabValue === 0 
                      ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: editTabValue === 0 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <FaUserCircle style={{ marginRight: 8, fontSize: '18px' }} />
                  General Information
                </Button>
                <Button
                  onClick={() => setEditTabValue(1)}
                  sx={{
                    flex: 1,
                    py: 2,
                    px: 3,
                    borderRadius: '10px',
                    background: editTabValue === 1 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    color: editTabValue === 1 ? 'white' : 'text.secondary',
                    fontWeight: editTabValue === 1 ? '600' : '500',
                    boxShadow: editTabValue === 1 
                      ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: editTabValue === 1 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'rgba(0, 0, 0, 0.05)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <FaLock style={{ marginRight: 8, fontSize: '18px' }} />
                  Security
                </Button>
              </Box>
            </Box>

            {/* New Tab Content */}
            <Box sx={{ p: 4, maxHeight: '50vh', overflowY: 'auto' }}>
              {editTabValue === 0 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#1a202c' }}>
                      Personal Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Update your basic information and profile details
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gap: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={editFormData.display_name}
                            onChange={handleEditFormChange('display_name')}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: '#f8fafc',
                                border: '2px solid transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: '#ffffff',
                                  borderColor: '#e2e8f0'
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaUserCircle style={{ color: '#64748b' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={editFormData.email}
                            onChange={handleEditFormChange('email')}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: '#f8fafc',
                                border: '2px solid transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: '#ffffff',
                                  borderColor: '#e2e8f0'
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  borderColor: '#667eea',
                                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FaEnvelope style={{ color: '#64748b' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={3}
                        value={editFormData.bio}
                        onChange={handleEditFormChange('bio')}
                        variant="outlined"
                        placeholder="Tell us about yourself..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#ffffff',
                              borderColor: '#e2e8f0'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Website"
                        value={editFormData.website}
                        onChange={handleEditFormChange('website')}
                        variant="outlined"
                        placeholder="https://yourwebsite.com"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#ffffff',
                              borderColor: '#e2e8f0'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaGlobe style={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Country"
                        value={editFormData.country}
                        onChange={handleEditFormChange('country')}
                        variant="outlined"
                        placeholder="Enter your country"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#ffffff',
                              borderColor: '#e2e8f0'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaGlobe style={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: '#1a202c' }}>
                      Skills
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Add your skills by typing and pressing space or enter
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Type a skill and press space or enter"
                        value={editFormData.currentSkill}
                        onChange={handleSkillInputChange}
                        onKeyPress={handleSkillKeyPress}
                        variant="outlined"
                        placeholder="e.g., C++, JavaScript, React..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#ffffff',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: '#e2e8f0'
                            },
                            '&.Mui-focused': {
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FaPlus style={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    
                    {editFormData.skills && editFormData.skills.length > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        minHeight: '60px'
                      }}>
                        {editFormData.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => handleRemoveSkill(skill)}
                            deleteIcon={
                              <FaTimes style={{ fontSize: '12px', color: 'black' }} />
                            }
                            sx={{
                              backgroundColor: 'linear-gradient(135deg, #e0e0e0 0%, #cccccc 100%)',
                              color: 'black',
                              fontWeight: '500',
                              borderRadius: '20px',
                              '& .MuiChip-deleteIcon': {
                                color: 'black',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  borderRadius: '50%'
                                }
                              },
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {editTabValue === 1 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1, color: '#1a202c' }}>
                      Security Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Update your password to keep your account secure
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gap: 3 }}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor="current-password" sx={{ 
                          backgroundColor: 'white',
                          px: 1
                        }}>
                          Current Password
                        </InputLabel>
                        <OutlinedInput
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={editFormData.currentPassword}
                          onChange={handleEditFormChange('currentPassword')}
                          sx={{
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#ffffff',
                              borderColor: '#e2e8f0'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              borderColor: '#667eea',
                              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                            }
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                                sx={{ color: '#64748b' }}
                              >
                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="Current Password"
                        />
                      </FormControl>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="new-password" sx={{ 
                            backgroundColor: 'white',
                            px: 1
                          }}>
                            New Password
                          </InputLabel>
                          <OutlinedInput
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={editFormData.newPassword}
                            onChange={handleEditFormChange('newPassword')}
                            sx={{
                              borderRadius: '12px',
                              backgroundColor: '#f8fafc',
                              border: '2px solid transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: '#ffffff',
                                borderColor: '#e2e8f0'
                              },
                              '&.Mui-focused': {
                                backgroundColor: '#ffffff',
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                              }
                            }}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                  sx={{ color: '#64748b' }}
                                >
                                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </IconButton>
                              </InputAdornment>
                            }
                            label="New Password"
                          />
                        </FormControl>
                        
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="confirm-password" sx={{ 
                            backgroundColor: 'white',
                            px: 1
                          }}>
                            Confirm New Password
                          </InputLabel>
                          <OutlinedInput
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={editFormData.confirmPassword}
                            onChange={handleEditFormChange('confirmPassword')}
                            sx={{
                              borderRadius: '12px',
                              backgroundColor: '#f8fafc',
                              border: '2px solid transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: '#ffffff',
                                borderColor: '#e2e8f0'
                              },
                              '&.Mui-focused': {
                                backgroundColor: '#ffffff',
                                borderColor: '#667eea',
                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                              }
                            }}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{ color: '#64748b' }}
                                >
                                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </IconButton>
                              </InputAdornment>
                            }
                            label="Confirm New Password"
                          />
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #3b82f6',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <FaLock />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="600" color="#1e40af">
                        Password Requirements
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 12 }}>
                      <Typography variant="body2" color="#1e40af" component="ul" sx={{ mt: 1, pl: 2 }}>
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'left', mt: 3 }}>
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        color: '#667eea',
                        fontWeight: '500',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                          color: '#5a67d8'
                        }
                      }}
                      onClick={() => {
                        // Handle forgot password logic here
                        console.log('Forgot password clicked');
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            {/* New Modal Actions */}
            <Box sx={{
              p: 4,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                All changes will be saved automatically
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditModalOpen(false)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '10px',
                    fontWeight: '600',
                    border: '2px solid #e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={editTabValue === 0 ? handleSaveProfile : handlePasswordChange}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '10px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                    }
                  }}
                >
                  {editTabValue === 0 ? 'Save Changes' : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </main>
    </div>
  );
};

export default User_Profile;
