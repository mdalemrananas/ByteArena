import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, FaHome, FaSearch, FaBell, FaCog, FaUserCircle,
  FaSignOutAlt, FaTrophy, FaComments, FaChevronDown,
  FaCheckCircle, FaStar, FaFire, FaMedal, FaEdit, FaEye, FaEyeSlash,
  FaLock, FaEnvelope, FaGlobe, FaCodeBranch, FaTimes, FaPlus,
  FaTrophy as FaTrophyIcon, FaCode, FaChartLine, FaListOl, FaUser
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
import { auth } from '../../firebase';
import { logoutUser } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';
import '../../User_panel/User_Dashboard.css';
import './question-setter-Profile.css';

const menuItems = [
  { key: 'home', name: 'Home', icon: <FaHome className="menu-icon" /> },
  { key: 'practice', name: 'Practice Problems', icon: <FaCode className="menu-icon" /> },
  { key: 'contest', name: 'Contest', icon: <FaTrophy className="menu-icon" /> },
  { key: 'leaderboard', name: 'Leaderboard', icon: <FaListOl className="menu-icon" /> },
  { key: 'profile', name: 'Profile', icon: <FaUser className="menu-icon" /> },
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
    'Security',
    'Notifications',
    'Privacy',
    'Appearance',
    'Quiz Preferences',
    'Connected Accounts',
    'Subscription'
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
        console.log('Updating existing user...');
        result = await supabase
          .from('users')
          .update(updateData)
          .eq('firebase_uid', uid);
      } else {
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
      
      onSave(formData);
      
      setNotification({
        type: 'success',
        title: 'Profile Updated Successfully!',
        message: 'Your profile information has been saved.'
      });
      
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

  return (
    <div className="qs-account-settings">
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
      
      {notification && (
        <div className="qs-notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div className={`qs-notification-content ${notification.type === 'success' ? 'success' : 'error'}`}>
            <div className="qs-notification-icon">
              {notification.type === 'success' ? '✓' : '⚠'}
            </div>
            <div className="qs-notification-text">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="qs-notification-close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="qs-account-settings-container">
        <div className="qs-account-settings-header">
          <div>
            <h1>Account Settings</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="qs-account-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`qs-account-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="qs-account-content-card">
          <div className="qs-profile-section">
            <h2>Profile Information</h2>
            <p>Update your profile information and how others see you on the platform.</p>

            <div className="qs-avatar-section">
              <img
                src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                alt="Profile"
                className="qs-avatar-image"
              />
              <div>
                <button className="qs-change-avatar-btn">
                  <Camera size={16} />
                  Change Avatar
                </button>
                <p className="qs-avatar-hint">JPG, PNG or GIF. 1MB max.</p>
              </div>
            </div>

            <div className="qs-form-grid">
              <div className="qs-form-row">
                <div className="qs-form-field">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    className="qs-form-input"
                  />
                </div>
                <div className="qs-form-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    className="qs-form-input"
                  />
                </div>
              </div>

              <div className="qs-form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="qs-form-input qs-form-input-readonly"
                />
                <p className="qs-form-hint">Email address cannot be changed. Contact support if you need to update it.</p>
              </div>

              <div className="qs-form-row">
                <div className="qs-form-field">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    placeholder="https://yourwebsite.com"
                    className="qs-form-input"
                  />
                </div>
                <div className="qs-form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange('country')}
                    placeholder={userData?.country || userData?.location || 'United States'}
                    className="qs-form-input"
                  />
                </div>
              </div>

              <div className="qs-form-field">
                <label>Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleInputChange('avatar_url')}
                  placeholder="https://example.com/avatar.jpg"
                  className="qs-form-input"
                />
              </div>

              <div className="qs-form-field">
                <label>Skills</label>
                <div className="qs-skills-container">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="qs-skill-tag">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="qs-skill-remove"
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
                  className="qs-form-input"
                />
                <p className="qs-form-hint">Press Enter or Space to add skills. Click × to remove.</p>
              </div>

              <div className="qs-form-field">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  rows={4}
                  className="qs-form-textarea"
                />
                <p className="qs-form-hint">Brief description for your profile. URLs are hyperlinked.</p>
              </div>
            </div>
          </div>

          <div className="qs-save-button-container">
            <button
              onClick={handleSaveChanges}
              className="qs-save-button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileContent = ({ user, userData, tabValue, setTabValue, handleEditProfile }) => {
  const activities = [
    {
      icon: <FaCheckCircle style={{ color: '#10b981', fontSize: '20px' }} />,
      text: "Completed 'World History Trivia' with a score of 95%",
      date: "May 1, 08:30 PM"
    },
    {
      icon: <FaTrophyIcon style={{ color: '#f59e0b', fontSize: '20px' }} />,
      text: "Earned the 'Quiz Wizard' achievement",
      date: "Apr 28, 03:15 PM"
    },
    {
      icon: <TrendingUp style={{ color: '#3b82f6', fontSize: '20px' }} />,
      text: "Reached level 42",
      date: "Apr 25, 10:45 PM"
    }
  ];

  const achievements = [
    {
      icon: <FaTrophyIcon style={{ color: '#a855f7', fontSize: '24px' }} />,
      title: "Quiz Master",
      badge: "Epic",
      badgeColor: "#f3e8ff",
      textColor: "#7c3aed",
      description: "Complete 100 quizzes with a score of 80% or higher",
      date: "Earned on 1/20/2023"
    },
    {
      icon: <Award style={{ color: '#10b981', width: '24px', height: '24px' }} />,
      title: "Knowledge Seeker",
      badge: "Uncommon",
      badgeColor: "#dcfce7",
      textColor: "#16a34a",
      description: "Complete quizzes in 10 different categories",
      date: "Earned on 11/5/2022"
    },
    {
      icon: <Target style={{ color: '#3b82f6', width: '24px', height: '24px' }} />,
      title: "Perfect Score",
      badge: "Rare",
      badgeColor: "#dbeafe",
      textColor: "#2563eb",
      description: "Achieve 100% on a difficult quiz",
      date: "Earned on 4/12/2023"
    }
  ];

  return (
    <>
      <div className="qs-profile-header-banner">
        <div className="qs-profile-header-content">
          <img
            src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
            alt={user?.displayName || "User"}
            className="qs-profile-avatar-large"
          />
          <div className="qs-profile-header-info">
            <div className="qs-profile-name-row">
              <h1>{user?.displayName || 'Alex Johnson'}</h1>
              <span className="qs-verified-badge">
                <Check style={{ width: '12px', height: '12px', color: 'white' }} />
              </span>
              <span className="qs-level-badge">
                <span style={{ color: '#fde047' }}>★</span> Level 42
              </span>
            </div>
            <p className="qs-profile-username">@{user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'alexjohnson'}</p>
            <p className="qs-profile-location">📍 {userData.location || 'United States'} • 📅 Joined {user?.joinedDate || 'March 15, 2022'}</p>
            <p className="qs-profile-bio">{userData.bio || 'Quiz enthusiast and knowledge seeker. I love challenging myself with difficult quizzes!'}</p>
            <div className="qs-profile-stats">
              <span><strong>187</strong> Quizzes Taken</span>
              <span><strong>15</strong> Quizzes Created</span>
              <span><strong>1,243</strong> Followers</span>
              <span><strong>356</strong> Following</span>
            </div>
          </div>
          <div className="qs-profile-actions">
            <button 
              onClick={handleEditProfile}
              className="qs-edit-profile-btn"
            >
              <span>✏️</span> Edit Profile
            </button>
            <button className="qs-message-btn">
              <span>💬</span> Message
            </button>
          </div>
        </div>
      </div>

      <div className="qs-profile-tabs">
        {['Activity', 'Quizzes Taken', 'Created Quizzes', 'Followers', 'Following'].map((tab, index) => (
          <button
            key={tab}
            onClick={() => setTabValue(index)}
            className={`qs-profile-tab ${tabValue === index ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="qs-profile-content-grid">
        <div className="qs-profile-content-left">
          <div className="qs-activity-card">
            {activities.map((activity, index) => (
              <div key={index} className="qs-activity-item">
                <div className="qs-activity-icon">{activity.icon}</div>
                <div className="qs-activity-text">
                  <p className="qs-activity-title">{activity.text}</p>
                  <p className="qs-activity-date">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qs-profile-content-right">
          <div className="qs-stats-card">
            <h2>Stats & Performance</h2>
            
            <div className="qs-stats-grid">
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <Target style={{ width: '18px', height: '18px' }} /> Average Score
                </p>
                <p className="qs-stat-value">87.5%</p>
              </div>
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <Trophy style={{ width: '18px', height: '18px' }} /> Win Rate
                </p>
                <p className="qs-stat-value">78%</p>
              </div>
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <TrendingUp style={{ width: '18px', height: '18px' }} /> Current Streak
                </p>
                <p className="qs-stat-value">5 quizzes</p>
              </div>
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <TrendingUp style={{ width: '18px', height: '18px' }} /> Highest Streak
                </p>
                <p className="qs-stat-value">12 quizzes</p>
              </div>
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <Clock style={{ width: '18px', height: '18px' }} /> Time Played
                </p>
                <p className="qs-stat-value">11h 50m</p>
              </div>
              <div className="qs-stat-item">
                <p className="qs-stat-label">
                  <Check style={{ width: '18px', height: '18px' }} /> Completion Rate
                </p>
                <p className="qs-stat-value">94%</p>
              </div>
            </div>

            <div className="qs-category-stats">
              <div className="qs-category-stat-row">
                <span className="qs-category-label">
                  <span style={{ color: '#f59e0b' }}>⭐</span> Best Category
                </span>
                <span className="qs-category-value">History</span>
              </div>
              <div className="qs-category-stat-row">
                <span className="qs-category-label">
                  <span style={{ color: '#3b82f6' }}>💙</span> Favorite Category
                </span>
                <span className="qs-category-value">Science</span>
              </div>
              <div className="qs-category-stat-row">
                <span className="qs-category-label">Weakest Category</span>
                <span className="qs-category-value">Sports</span>
              </div>
            </div>
          </div>

          <div className="qs-achievements-card">
            <h2>Achievements</h2>
            <div className="qs-achievements-list">
              {achievements.map((achievement, index) => (
                <div key={index} className="qs-achievement-item">
                  <div className="qs-achievement-icon-box">
                    {achievement.icon}
                  </div>
                  <div className="qs-achievement-content">
                    <div className="qs-achievement-header">
                      <h3>{achievement.title}</h3>
                      <span 
                        className="qs-achievement-badge"
                        style={{
                          backgroundColor: achievement.badgeColor,
                          color: achievement.textColor
                        }}
                      >
                        {achievement.badge}
                      </span>
                    </div>
                    <p className="qs-achievement-description">{achievement.description}</p>
                    <p className="qs-achievement-date">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const QuestionSetterProfile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('profile');
  const [user, setUser] = useState({
    uid: null,
    displayName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    joinedDate: 'January 2023'
  });
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Full Stack Developer | Competitive Programmer | Open Source Enthusiast',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'DSA']
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        
        try {
          setUser(prev => ({
            ...prev,
            uid: currentUser.uid,
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
              avatar_url: supabaseUserData.avatar_url
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
    setEditModalOpen(true);
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
                    navigate('/question-setter');
                  } else if (item.key === 'contest') {
                    navigate('/question-setter/contest');
                  } else if (item.key === 'practice') {
                    navigate('/question-setter/explore');
                  } else if (item.key === 'leaderboard') {
                    navigate('/question-setter/leaderboard');
                  } else if (item.key === 'profile') {
                    navigate('/question-setter/profile');
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
              <input type="text" placeholder="Search problems, contests, creators..." />
            </div>
          </div>
          <div className="ud-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/')} data-tooltip="Home">
              <FaHome />
            </button>
            <button className="icon-btn" data-tooltip="Notifications">
              <FaBell />
              <span className="badge">4</span>
            </button>
            <div
              className="profile"
              onClick={() => navigate('/question-setter/profile')}
              style={{ cursor: 'pointer' }}
              data-tooltip="Profile"
            >
              <div className="avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <FaUser />
                )}
              </div>
              <span>{user?.displayName || 'Question Setter'}</span>
            </div>
          </div>
        </header>

        <div className="qs-profile-content-area">
          <ProfileContent 
            user={user} 
            userData={userData} 
            tabValue={tabValue} 
            setTabValue={setTabValue} 
            handleEditProfile={handleEditProfile} 
          />
        </div>

        {/* Edit Profile Modal */}
        {editModalOpen && (
          <div className="qs-modal-overlay" onClick={() => setEditModalOpen(false)}>
            <div className="qs-modal-content" onClick={(e) => e.stopPropagation()}>
              <AccountSettings
                user={user}
                userData={userData}
                onClose={() => setEditModalOpen(false)}
                onSave={(formData) => {
                  console.log('Profile updated:', formData);
                  setUser(prev => ({
                    ...prev,
                    displayName: formData.fullName,
                    photoURL: formData.avatar_url
                  }));
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionSetterProfile;

