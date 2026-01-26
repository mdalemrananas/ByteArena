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
  FaPlus,
  FaCheckCircle,
  FaTrophy as FaTrophyIcon
} from 'react-icons/fa';
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Check, 
  Award,
  Camera 
} from 'lucide-react';
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

const AccountSettings = ({ user, userData, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || 'Alex Johnson',
    username: userData?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'quizmaster',
    email: user?.email || 'alex@example.com',
    bio: userData?.bio || 'Quiz enthusiast and creator. I love making educational content!',
    website: userData?.website || '',
    country: userData?.country || userData?.location || '',
    skills: userData?.skills || [],
    currentSkill: '',
    avatar_url: user?.photoURL || userData?.avatar_url || ''
  });

  const tabs = [
    'Profile',
    // 'Security',
    // 'Notifications',
    // 'Privacy',
    //'Appearance',
    //'Quiz Preferences',
    //'Connected Accounts',
    //'Subscription'
  ];

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSkillInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      currentSkill: e.target.value
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const skill = formData.currentSkill?.trim();
      if (skill && !formData.skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill],
          currentSkill: ''
        }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSaveChanges = async () => {
    console.log('Saving changes:', formData);
    console.log('User UID:', user?.uid);
    console.log('User object:', user);
    console.log('User properties:', Object.keys(user || {}));
    
    // Try different possible UID properties
    const uid = user?.uid || user?.user?.uid || user?.firebase_uid;
    console.log('Resolved UID:', uid);
    
    if (!uid) {
      console.error('No user UID found');
      setNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'User not authenticated. Please log in again.'
      });
      return;
    }
    
    try {
      // First check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', uid)
        .single();

      console.log('Existing user:', existingUser);
      console.log('Fetch error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        setNotification({
          type: 'error',
          title: 'Database Error',
          message: 'Error checking user data. Please try again.'
        });
        return;
      }

      let updateData = {
        username: formData.username,
        display_name: formData.fullName,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
        website: formData.website,
        country: formData.country,
        skills: formData.skills,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      let result;
      if (existingUser) {
        // Update existing user
        console.log('Updating existing user...');
        result = await supabase
          .from('users')
          .update(updateData)
          .eq('firebase_uid', uid);
      } else {
        // Create new user
        console.log('Creating new user...');
        result = await supabase
          .from('users')
          .insert({
            ...updateData,
            firebase_uid: uid,
            email: user?.email || user?.user?.email,
            created_at: new Date().toISOString()
          });
      }

      const { data, error } = result;
      console.log('Supabase result:', { data, error });

      if (error) {
        console.error('Error updating/creating profile:', error);
        setNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Unknown error occurred while updating profile.'
        });
        return;
      }

      console.log('Profile updated/created successfully:', data);
      
      // Call the parent onSave function to update local state
      onSave(formData);
      
      // Show success notification
      setNotification({
        type: 'success',
        title: 'Profile Updated Successfully!',
        message: 'Your profile information has been saved.'
      });
      
      // Auto-close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Unknown error occurred while saving changes.'
      });
    }
  };

  // Debug function to check user data
  const handleDebugUserInfo = () => {
    console.log('=== DEBUG USER INFO ===');
    console.log('User object:', user);
    console.log('User UID:', user?.uid);
    console.log('User email:', user?.email);
    console.log('User displayName:', user?.displayName);
    console.log('User properties:', Object.keys(user || {}));
    console.log('UserData:', userData);
    console.log('========================');
    alert('Debug info logged to console. Check browser dev tools.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1rem',
      position: 'relative'
    }}>
      <style>
        {`
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
        `}
      </style>
      
      {/* Custom Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '1.25rem',
              marginTop: '0.125rem'
            }}>
              {notification.type === 'success' ? '✓' : '⚠'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 0.25rem 0',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                {notification.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                opacity: 0.9
              }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
                opacity: 0.8
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                Account Settings
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: 0
              }}>
                Manage your account settings and preferences
              </p>
            </div>
            <button
              onClick={handleDebugUserInfo}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              Debug User Info
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: activeTab === tab ? '#111827' : '#6b7280',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                border: activeTab === tab ? '2px solid #111827' : '2px solid transparent',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {/* Profile Information Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 0.5rem 0'
            }}>
              Profile Information
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: '0 0 2rem 0'
            }}>
              Update your profile information and how others see you on the platform.
            </p>

            {/* Avatar Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <img
                src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #e5e7eb'
                }}
              />
              <div>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}>
                  <Camera size={16} />
                  Change Avatar
                </button>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: 0
                }}>
                  JPG, PNG or GIF. 1MB max.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {/* Display Name and Username Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.5rem 0 0 0'
                }}>
                  Email address cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              {/* Website and Country Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    placeholder="https://yourwebsite.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange('country')}
                    placeholder={userData?.country || userData?.location || 'United States'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleInputChange('avatar_url')}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Skills */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Skills
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  minHeight: '60px'
                }}>
                  {formData.skills.map((skill, index) => (
                    <span key={index} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '1rem',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.currentSkill}
                  onChange={handleSkillInputChange}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Type a skill and press Enter or Space to add"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.5rem 0 0 0'
                }}>
                  Press Enter or Space to add skills. Click × to remove.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.5rem 0 0 0'
                }}>
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              onClick={handleSaveChanges}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: '#6366f1',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6366f1';
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to fetch user's contest statistics
const fetchUserContestStats = async (userId) => {
  try {
    // Fetch all contests that user participated in with status
    const { data: userParticipations, error: participationError } = await supabase
      .from('contest_participants')
      .select('contest_id, status')
      .eq('user_id', userId);

    if (participationError) {
      console.error('Error fetching user participations:', participationError);
      return {
        averageScore: 0,
        winRate: 0,
        completionRate: 0,
        totalQuestionsSolved: 0,
        totalContestQuestions: 0,
        bestCategory: null,
        favoriteCategory: null,
        weakestCategory: null
      };
    }

    if (!userParticipations || userParticipations.length === 0) {
      return {
        averageScore: 0,
        winRate: 0,
        completionRate: 0,
        totalQuestionsSolved: 0,
        totalContestQuestions: 0,
        bestCategory: null,
        favoriteCategory: null,
        weakestCategory: null
      };
    }

    const contestIds = userParticipations.map(p => p.contest_id);

    // Calculate Completion Rate: (completed contests / total participated) * 100%
    const totalParticipated = userParticipations.length;
    const completedContests = userParticipations.filter(p => p.status === 'completed').length;
    const completionRate = totalParticipated > 0 ? 
      Math.round((completedContests / totalParticipated) * 100) : 0;

    // Fetch all questions from these contests
    const { data: contestQuestions, error: questionsError } = await supabase
      .from('contest_questions')
      .select('id, contest_id')
      .in('contest_id', contestIds);

    if (questionsError) {
      console.error('Error fetching contest questions:', questionsError);
      return {
        averageScore: 0,
        winRate: 0,
        completionRate: 0,
        totalQuestionsSolved: 0,
        totalContestQuestions: 0,
        bestCategory: null,
        favoriteCategory: null,
        weakestCategory: null
      };
    }

    // Fetch user's solved questions with performance metrics
    const { data: solvedQuestions, error: solvesError } = await supabase
      .from('contest_question_solves')
      .select('question_id, language, time_taken, memory_taken')
      .eq('participate_id', userId);

    if (solvesError) {
      console.error('Error fetching solved questions:', solvesError);
      return {
        averageScore: 0,
        winRate: 0,
        completionRate: 0,
        totalQuestionsSolved: 0,
        totalContestQuestions: 0,
        bestCategory: null,
        favoriteCategory: null,
        weakestCategory: null
      };
    }

    const totalContestQuestions = contestQuestions ? contestQuestions.length : 0;
    const totalQuestionsSolved = solvedQuestions ? [...new Set(solvedQuestions.map(q => q.question_id))].length : 0;

    // Calculate Average Score: (total questions solved / total contest questions) * 100%
    const averageScore = totalContestQuestions > 0 ? 
      Math.round((totalQuestionsSolved / totalContestQuestions) * 100) : 0;

    // Calculate Win Rate: (contests where user solved >= 50% of questions / total contests participated) * 100%
    const contestsWithSolves = userParticipations.length;
    const successfulContests = userParticipations.filter(participation => {
      const contestQuestionsForThisContest = contestQuestions.filter(q => q.contest_id === participation.contest_id);
      const solvedQuestionsForThisContest = solvedQuestions.filter(solve => 
        contestQuestionsForThisContest.some(q => q.id === solve.question_id)
      );
      const solveRate = contestQuestionsForThisContest.length > 0 ? 
        (solvedQuestionsForThisContest.length / contestQuestionsForThisContest.length) : 0;
      return solveRate >= 0.5; // Consider winning if solved 50% or more questions
    }).length;

    const winRate = contestsWithSolves > 0 ? 
      Math.round((successfulContests / contestsWithSolves) * 100) : 0;

    // Calculate language performance metrics
    const languageStats = {};
    if (solvedQuestions && solvedQuestions.length > 0) {
      solvedQuestions.forEach(solve => {
        if (!languageStats[solve.language]) {
          languageStats[solve.language] = {
            count: 0,
            totalTime: 0,
            totalMemory: 0,
            avgTime: 0,
            avgMemory: 0,
            performanceScore: 0
          };
        }
        languageStats[solve.language].count++;
        languageStats[solve.language].totalTime += parseFloat(solve.time_taken);
        languageStats[solve.language].totalMemory += parseFloat(solve.memory_taken);
      });

      // Calculate averages and performance scores for each language
      Object.keys(languageStats).forEach(language => {
        const stats = languageStats[language];
        stats.avgTime = stats.totalTime / stats.count;
        stats.avgMemory = stats.totalMemory / stats.count;
        // Performance score: lower time + memory = better performance
        stats.performanceScore = stats.avgTime + (stats.avgMemory * 10); // Weight memory more heavily
      });
    }

    // Determine categories
    const languages = Object.keys(languageStats);
    let bestCategory = null;
    let favoriteCategory = null;
    let weakestCategory = null;

    if (languages.length > 0) {
      // Best Category: lowest performance score (best time + memory efficiency)
      bestCategory = languages.reduce((best, lang) => 
        languageStats[lang].performanceScore < languageStats[best].performanceScore ? lang : best
      );

      // Favorite Category: most used language
      favoriteCategory = languages.reduce((favorite, lang) => 
        languageStats[lang].count > languageStats[favorite].count ? lang : favorite
      );

      // Weakest Category: highest performance score (worst time + memory efficiency)
      weakestCategory = languages.reduce((weakest, lang) => 
        languageStats[lang].performanceScore > languageStats[weakest].performanceScore ? lang : weakest
      );
    }

    return {
      averageScore,
      winRate,
      completionRate,
      totalQuestionsSolved,
      totalContestQuestions,
      bestCategory,
      favoriteCategory,
      weakestCategory
    };
  } catch (error) {
    console.error('Error in fetchUserContestStats:', error);
    return {
      averageScore: 0,
      winRate: 0,
      completionRate: 0,
      totalQuestionsSolved: 0,
      totalContestQuestions: 0,
      bestCategory: null,
      favoriteCategory: null,
      weakestCategory: null
    };
  }
};

const ProfileContent = ({ user, userData, tabValue, setTabValue, handleEditProfile, contestStats, solvedProblems, activities, userScore }) => {
  
  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(to right, #e9d5ff, #bfdbfe)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <img
            src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
            alt={user?.displayName || "User"}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {user?.displayName || 'Alex Johnson'}
              </h1>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.5rem'
              }}>
                <Check style={{ width: '12px', height: '12px', color: 'white' }} />
              </span>
              <span style={{
                backgroundColor: '#f97316',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginLeft: '0.5rem'
              }}>
                <span style={{ color: '#fde047' }}>★</span> Level {userData.level || 1}
              </span>
            </div>
            <p style={{ color: '#4b5563', margin: '0 0 0.25rem 0' }}>
              @{user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'alexjohnson'}
            </p>
            <p style={{ color: '#4b5563', margin: '0 0 0.25rem 0' }}>
              📍 {userData.location || 'United States'} • 📅 Joined {user?.joinedDate || 'March 15, 2022'}
            </p>
            <p style={{ color: '#374151', margin: '0 0 1rem 0' }}>
              {userData.bio || 'Quiz enthusiast and knowledge seeker. I love challenging myself with difficult quizzes!'}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#374151' }}>
                <strong style={{ color: '#111827' }}>
                  {(solvedProblems?.contestProblems?.length || 0) + (solvedProblems?.practiceProblems?.length || 0)}
                </strong> Problem Solve
              </span>
              <span style={{ color: '#374151' }}>
                <strong style={{ color: '#111827' }}>{userData.contestParticipate || 0}</strong> Contest Participate
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleEditProfile}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>✏️</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        {['Activity', 'Problem Solve'].map((tab, index) => (
          <button
            key={tab}
            onClick={() => setTabValue(index)}
            style={{
              padding: '1rem 0.5rem',
              fontWeight: '500',
              color: tabValue === index ? '#2563eb' : '#4b5563',
              background: 'none',
              border: 'none',
              borderBottom: tabValue === index ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginRight: '2rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        flexDirection: 'row',
        padding: '0'
      }}>
        {/* Left Column - Activity or Problem Solve */}
        <div style={{ 
          flex: 2, 
          minWidth: 0 
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            {tabValue === 0 ? (
              // Activity Tab Content
              activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    style={{
                      padding: '2rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.5rem',
                      borderBottom: index < activities.length - 1 ? '1px solid #e5e7eb' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ 
                      marginTop: '0.25rem', 
                      fontSize: '24px'
                    }}>{activity.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        color: '#111827', 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '1rem', 
                        fontWeight: '500' 
                      }}>{activity.title}</p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        margin: '0 0 0.25rem 0' 
                      }}>{activity.description}</p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>{formatActivityDate(activity.date)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No Activity Yet</h3>
                  <p style={{ margin: 0 }}>Start participating in contests and solving problems to see your activity here!</p>
                </div>
              )
            ) : (
              // Problem Solve Tab Content
              <div style={{ padding: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 1.5rem 0'
                }}>
                  Solved Problems
                </h3>
                
                {/* Contest Problems Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaTrophy style={{ color: '#f59e0b' }} />
                    Contest Problems ({solvedProblems?.contestProblems?.length || 0})
                  </h4>
                  
                  {solvedProblems?.contestProblems?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {solvedProblems.contestProblems.map((solve, index) => (
                        <div
                          key={solve.id}
                          style={{
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            backgroundColor: '#f9fafb',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h5 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 0.5rem 0'
                              }}>
                                {solve.question?.question_title || 'Unknown Problem'}
                              </h5>
                              <p style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                margin: '0 0 0.5rem 0'
                              }}>
                                Contest: {solve.question?.contest?.title || 'Unknown Contest'}
                              </p>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaCode style={{ color: '#3b82f6' }} />
                                  {solve.language?.toUpperCase() || 'N/A'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <AccessTimeIcon style={{ color: '#10b981' }} />
                                  {solve.time_taken ? `${solve.time_taken}s` : 'N/A'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaChartLine style={{ color: '#f59e0b' }} />
                                  {solve.memory_taken ? `${solve.memory_taken}MB` : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              whiteSpace: 'nowrap'
                            }}>
                              {new Date(solve.solve_created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      <FaCode style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No contest problems solved yet. Start participating in contests to see your solved problems here!</p>
                    </div>
                  )}
                </div>

                {/* Practice Problems Section */}
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaCode style={{ color: '#3b82f6' }} />
                    Practice Problems ({solvedProblems?.practiceProblems?.length || 0})
                  </h4>
                  
                  {solvedProblems?.practiceProblems?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {solvedProblems.practiceProblems.map((problem, index) => (
                        <div
                          key={problem.submission_id}
                          style={{
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            backgroundColor: '#f9fafb'
                          }}
                        >
                          <h5 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {problem.problem?.problem_title}
                          </h5>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                            <span>{problem.problem?.difficulty || 'N/A'}</span>
                            <span>{problem.language?.toUpperCase() || 'N/A'}</span>
                            <span>{problem.points} points</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FaCode style={{ color: '#3b82f6' }} />
                              {problem.problem?.problem_language || 'N/A'}
                            </span>
                            {problem.rank && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FaTrophy style={{ color: '#f59e0b' }} />
                                Rank #{problem.rank}
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AccessTimeIcon style={{ color: '#10b981' }} />
                              {new Date(problem.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      <FaCode style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No practice problems solved yet. Start practicing to improve your skills!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Achievements */}
        <div style={{ 
          flex: 1, 
          minWidth: 0 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2rem' 
          }}>
            {/* Stats & Performance */}
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: 0,
                marginBottom: '2rem'
              }}>
                Stats & Performance
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Target style={{ width: '18px', height: '18px' }} /> Average Score
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {contestStats?.averageScore || 0}%
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Trophy style={{ width: '18px', height: '18px' }} /> Win Rate
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {contestStats?.winRate || 0}%
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp style={{ width: '18px', height: '18px' }} /> Current Streak
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>5 quizzes</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp style={{ width: '18px', height: '18px' }} /> Highest Streak
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>12 quizzes</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Clock style={{ width: '18px', height: '18px' }} /> Time Played
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>11h 50m</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Check style={{ width: '18px', height: '18px' }} /> Completion Rate
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {contestStats?.completionRate || 0}%
                  </p>
                </div>
              </div>

              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: '#f59e0b' }}>⭐</span> Best Category
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {contestStats?.bestCategory || 'N/A'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: '#3b82f6' }}>💙</span> Favorite Category
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {contestStats?.favoriteCategory || 'N/A'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Weakest Category</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {contestStats?.weakestCategory || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/*}
            {/* Achievements
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: 0,
                marginBottom: '1.5rem'
              }}>
                Achievements
              </h2>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem' 
              }}>
                {achievements.map((achievement, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {achievement.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <h3 style={{ 
                          fontWeight: '600', 
                          color: '#111827', 
                          margin: 0, 
                          fontSize: '1.125rem' 
                        }}>
                          {achievement.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontWeight: '600',
                          backgroundColor: achievement.badgeColor,
                          color: achievement.textColor
                        }}>
                          {achievement.badge}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#4b5563', 
                        margin: '0 0 0.5rem 0', 
                        lineHeight: '1.5' 
                      }}>
                        {achievement.description}
                      </p>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </>
  );
};

const User_Profile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [active, setActive] = useState('home');
  const [user, setUser] = useState({
    uid: null,
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
    location: 'United States',
    website: 'https://alexjohnson.dev',
    joinedDate: 'January 2023',
    rating: 1847,
    rank: 'Expert',
    wins: 142,
    losses: 89,
    matches_played: 231,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'DSA'],
    contestParticipate: 0
  });
  const [contestStats, setContestStats] = useState({
    averageScore: 0,
    winRate: 0,
    completionRate: 0,
    bestCategory: 'N/A',
    favoriteCategory: 'N/A',
    weakestCategory: 'N/A'
  });
  const [solvedProblems, setSolvedProblems] = useState({
    contestProblems: [],
    practiceProblems: []
  });

  const [activities, setActivities] = useState([]);
  const [userScore, setUserScore] = useState(0);

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
            uid: currentUser.uid, // Add the UID here
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
            // Fetch contest participation count
            const contestCount = await fetchContestParticipationCount(supabaseUserData.id);
            
            // Fetch leaderboard data
            const leaderboardData = await fetchLeaderboardData(supabaseUserData.id);
            
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
              matches_played: supabaseUserData.matches_played,
              contestParticipate: contestCount,
              // Add leaderboard data
              level: leaderboardData.level,
              badge: leaderboardData.badge,
              score: leaderboardData.score,
              problem_solve: leaderboardData.problem_solve
            }));

            // Fetch contest statistics
            const stats = await fetchUserContestStats(supabaseUserData.id);
            setContestStats(stats);

            // Fetch solved problems
            const solvedData = await fetchSolvedProblems(supabaseUserData.id);
            setSolvedProblems(solvedData);

            // Fetch user activities
            const userActivities = await fetchUserActivities(supabaseUserData.id);
            setActivities(userActivities);

            // Fetch user's score
            const score = await fetchUserScore(supabaseUserData.id);
            setUserScore(score);

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

  const fetchLeaderboardData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('level, badge, score, problem_solve')
        .eq('participate_id', userId)
        .single();

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        // If no leaderboard entry exists, return default values
        if (error.code === 'PGRST116') { // No rows returned
          return { level: 1, badge: 'bronze', score: 0, problem_solve: 0 };
        }
        throw error;
      }

      console.log('Leaderboard data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchLeaderboardData:', error);
      // Return default values on error
      return { level: 1, badge: 'bronze', score: 0, problem_solve: 0 };
    }
  };

  const fetchUserScore = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('score')
        .eq('participate_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user score:', error);
        // If no leaderboard entry exists, return 0
        if (error.code === 'PGRST116') {
          return 0;
        }
        throw error;
      }

      return data?.score || 0;
    } catch (error) {
      console.error('Error in fetchUserScore:', error);
      return 0;
    }
  };

  const fetchUserActivities = async (userId) => {
    try {
      const activities = [];
      
      // 1. Contest participations
      const { data: contestParticipations, error: contestError } = await supabase
        .from('contest_participants')
        .select(`
          id,
          status,
          score,
          rank,
          joined_at,
          updated_at,
          contest_id,
          contest:contests(
            id,
            title,
            title_description,
            contest_difficulty,
            prize_money
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (!contestError && contestParticipations) {
        contestParticipations.forEach(participation => {
          activities.push({
            id: participation.id,
            type: 'contest_participation',
            title: `Registered for ${participation.contest?.title || 'Contest'}`,
            description: `${participation.contest?.title_description || 'Contest'} - ${participation.contest?.contest_difficulty || 'Medium'} difficulty`,
            status: participation.status,
            score: participation.score,
            rank: participation.rank,
            prize: participation.contest?.prize_money,
            date: participation.joined_at,
            icon: <FaTrophy style={{ color: '#f59e0b', fontSize: '20px' }} />
          });
        });
      }

      // 2. Contest question solves
      const { data: contestSolves, error: solveError } = await supabase
        .from('contest_question_solves')
        .select(`
          id,
          language,
          time_taken,
          memory_taken,
          solve_created_at,
          question_id,
          question:contest_questions(
            id,
            question_title,
            contest_id,
            contest:contests(
              id,
              title
            )
          )
        `)
        .eq('participate_id', userId)
        .order('solve_created_at', { ascending: false });

      if (!solveError && contestSolves) {
        contestSolves.forEach(solve => {
          activities.push({
            id: solve.id,
            type: 'contest_solve',
            title: `Solved: ${solve.question?.question_title || 'Contest Problem'}`,
            description: `Contest: ${solve.question?.contest?.title || 'Unknown'} • Language: ${solve.language?.toUpperCase()}`,
            language: solve.language,
            time: solve.time_taken,
            memory: solve.memory_taken,
            date: solve.solve_created_at,
            icon: <FaCheckCircle style={{ color: '#10b981', fontSize: '20px' }} />
          });
        });
      }

      // 3. Practice problem submissions
      const { data: practiceSubmissions, error: practiceError } = await supabase
        .from('practice_submission')
        .select(`
          submission_id,
          language,
          submission_status,
          points,
          rank,
          submitted_at,
          problem_id,
          problem:practice_problem(
            problem_id,
            problem_title,
            difficulty,
            problem_language,
            points
          )
        `)
        .eq('problem_solver_id', userId)
        .order('submitted_at', { ascending: false });

      if (!practiceError && practiceSubmissions) {
        practiceSubmissions.forEach(submission => {
          activities.push({
            id: submission.submission_id,
            type: 'practice_submission',
            title: `Submitted: ${submission.problem?.problem_title || 'Practice Problem'}`,
            description: `Difficulty: ${submission.problem?.difficulty || 'Unknown'} • Language: ${submission.language?.toUpperCase()}`,
            status: submission.submission_status,
            points: submission.points,
            rank: submission.rank,
            date: submission.submitted_at,
            icon: <FaCode style={{ color: '#3b82f6', fontSize: '20px' }} />
          });
        });
      }

      // 4. User profile updates (check when user was created/updated)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('created_at, updated_at, last_login')
        .eq('id', userId)
        .single();

      if (!profileError && userProfile) {
        // Account creation
        activities.push({
          id: 'account_created',
          type: 'account_created',
          title: 'Account Created',
          description: 'Welcome to ByteArena! Your account has been successfully created.',
          date: userProfile.created_at,
          icon: <FaUser style={{ color: '#8b5cf6', fontSize: '20px' }} />
        });

        // Last login (if different from creation)
        if (userProfile.last_login && userProfile.last_login !== userProfile.created_at) {
          activities.push({
            id: 'last_login',
            type: 'login',
            title: 'Last Login',
            description: 'You logged into your account.',
            date: userProfile.last_login,
            icon: <FaUser style={{ color: '#6b7280', fontSize: '20px' }} />
          });
        }
      }

      // 5. Leaderboard achievements
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('level, badge, score, problem_solve, updated_at')
        .eq('participate_id', userId)
        .single();

      if (!leaderboardError && leaderboardData) {
        activities.push({
          id: 'leaderboard_rank',
          type: 'achievement',
          title: `Achieved Level ${leaderboardData.level} - ${leaderboardData.badge.charAt(0).toUpperCase() + leaderboardData.badge.slice(1)} Badge`,
          description: `Score: ${leaderboardData.score} • Problems Solved: ${leaderboardData.problem_solve}`,
          level: leaderboardData.level,
          badge: leaderboardData.badge,
          score: leaderboardData.score,
          problemsSolved: leaderboardData.problem_solve,
          date: leaderboardData.updated_at,
          icon: <FaStar style={{ color: '#fde047', fontSize: '20px' }} />
        });
      }

      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('Fetched user activities:', activities);
      return activities;

    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  };

  const fetchSolvedProblems = async (userId) => {
    try {
      // Fetch contest questions solved by user
      const { data: contestSolves, error: contestError } = await supabase
        .from('contest_question_solves')
        .select(`
          id,
          language,
          time_taken,
          memory_taken,
          solve_created_at,
          question_id,
          question:contest_questions(
            id,
            question_title,
            question_description,
            contest_id,
            contest:contests(
              id,
              title
            )
          )
        `)
        .eq('participate_id', userId)
        .order('solve_created_at', { ascending: false });

      if (contestError) {
        console.error('Error fetching contest solves:', contestError);
        return { contestProblems: [], practiceProblems: [] };
      }

      // Fetch practice problems solved by user using practice_submission table
      const { data: practiceSubmissions, error: practiceError } = await supabase
        .from('practice_submission')
        .select(`
          submission_id,
          language,
          submission_status,
          points,
          rank,
          submitted_at,
          problem_solver_id,
          problem_id,
          problem:practice_problem(
            problem_id,
            problem_title,
            difficulty,
            problem_language,
            problem_rating,
            points,
            created_at
          )
        `)
        .eq('problem_solver_id', userId)
        .order('submitted_at', { ascending: false });

      if (practiceError) {
        console.error('Error fetching practice submissions:', practiceError);
        return { 
          contestProblems: contestSolves || [], 
          practiceProblems: [] 
        };
      }

      console.log('Contest problems solved:', contestSolves);
      console.log('Practice problems solved:', practiceSubmissions);

      return {
        contestProblems: contestSolves || [],
        practiceProblems: practiceSubmissions || []
      };
    } catch (error) {
      console.error('Error in fetchSolvedProblems:', error);
      return { contestProblems: [], practiceProblems: [] };
    }
  };

  const fetchContestParticipationCount = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching contest participation count:', error);
        return 0;
      }

      return data ? data.length : 0;
    } catch (error) {
      console.error('Error in fetchContestParticipationCount:', error);
      return 0;
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
            <div className="balance" data-tooltip="Reward Coins">
              <FaCoins className="balance-icon" />
              <span>{userScore.toFixed(2)}</span>
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

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          <ProfileContent 
            user={user} 
            userData={userData} 
            tabValue={tabValue} 
            setTabValue={setTabValue} 
            handleEditProfile={handleEditProfile} 
            contestStats={contestStats}
            solvedProblems={solvedProblems}
            activities={activities}
            userScore={userScore}
          />
        </Box>

        {/* Edit Profile Modal - New Account Settings */}
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
            width: { xs: '98%', sm: '95%', md: '90%', lg: '85%', xl: '80%' },
            height: { xs: '95vh', sm: '90vh', md: '90vh', lg: '85vh', xl: '80vh' },
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <AccountSettings
                user={user}
                userData={userData}
                onClose={() => setEditModalOpen(false)}
                onSave={(formData) => {
                  // Handle save logic here
                  console.log('Profile updated:', formData);
                  // Update user state with new data
                  setUser(prev => ({
                    ...prev,
                    displayName: formData.fullName,
                    photoURL: formData.avatar_url
                  }));
                  // Update userData state
                  setUserData(prev => ({
                    ...prev,
                    username: formData.username,
                    bio: formData.bio,
                    website: formData.website,
                    country: formData.country,
                    skills: formData.skills,
                    avatar_url: formData.avatar_url
                  }));
                }}
              />
            </Box>
          </Box>
        </Modal>
      </main>
    </div>
  );
};

export default User_Profile;
