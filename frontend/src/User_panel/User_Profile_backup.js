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

  const fetchUserData = async (firebaseUid) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        if (error.code === 'PGRST116') {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        
        try {
          setUser(prev => ({
            ...prev,
            displayName: currentUser.displayName || userData.name,
            email: currentUser.email || userData.email,
            photoURL: currentUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'
          }));

          let supabaseUserData = await fetchUserData(currentUser.uid);
          
          if (!supabaseUserData) {
            supabaseUserData = await createOrUpdateUserProfile(currentUser);
          }

          if (supabaseUserData) {
            setUserData(prev => ({
              ...prev,
              name: supabaseUserData.display_name || prev.name,
              email: supabaseUserData.email || prev.email,
              bio: supabaseUserData.bio || prev.bio,
              website: supabaseUserData.website || prev.website,
              location: supabaseUserData.country || prev.location,
              skills: supabaseUserData.skills || prev.skills,
              username: supabaseUserData.username,
              avatar_url: supabaseUserData.avatar_url,
              rating: supabaseUserData.rating,
              rank: supabaseUserData.rank,
              wins: supabaseUserData.wins,
              losses: supabaseUserData.losses,
              matches_played: supabaseUserData.matches_played
            }));

            setUser(prev => ({
              ...prev,
              displayName: supabaseUserData.display_name || prev.displayName,
              photoURL: supabaseUserData.avatar_url || prev.photoURL
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
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

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      if (!editFormData.display_name?.trim()) {
        throw new Error('Display name is required');
      }
      if (!editFormData.email?.trim()) {
        throw new Error('Email is required');
      }

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

      setUserData(prev => ({
        ...prev,
        name: editFormData.display_name,
        bio: editFormData.bio,
        website: editFormData.website,
        location: editFormData.country,
        skills: editFormData.skills
      }));

      if (currentUser.displayName !== editFormData.display_name) {
        await currentUser.updateProfile({
          displayName: editFormData.display_name
        });
        setUser(prev => ({
          ...prev,
          displayName: editFormData.display_name
        }));
      }

      alert('Profile updated successfully!');
      setEditModalOpen(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
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
    <div>
      <h1>User Profile with Supabase Integration</h1>
      <p>This is the restored version with Supabase functionality.</p>
      <Button onClick={handleEditProfile}>Edit Profile</Button>
    </div>
  );
};

export default User_Profile;
