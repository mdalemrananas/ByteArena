import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaTh, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { logoutUser } from '../services/authService';
import './Navbar.css';

const Navbar = ({ onSignInClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: 'Guest',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=4a3fcc&color=fff'
  });
  
  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase User:', firebaseUser); // Debug log
      
      if (firebaseUser) {
        // User is signed in
        const userName = firebaseUser.displayName || 
                        (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
        
        // Create avatar URL with the user's name
        const avatarUrl = firebaseUser.photoURL || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4a3fcc&color=fff`;
        
        console.log('Setting user:', { name: userName, avatar: avatarUrl }); // Debug log
        
        setIsLoggedIn(true);
        setUser({
          name: userName,
          avatar: avatarUrl,
          fullName: firebaseUser.displayName || ''
        });
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setUser({
          name: 'Guest',
          avatar: 'https://ui-avatars.com/api/?name=Guest&background=4a3fcc&color=fff'
        });
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Optional: Redirect to home or login page after logout
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug log to check values
  console.log('isLoggedIn:', isLoggedIn);
  console.log('user:', user);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo">
          <span className="gradient-text">Byte</span>Arena
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">Practice</a>
          <a href="#" className="nav-link">Community</a>
          <a href="#" className="nav-link">About Us</a>
          
          {isLoggedIn ? (
            <div className="user-profile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginLeft: '20px',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 15px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '30px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button 
                    style={{
                      background: 'rgba(74, 63, 204, 0.1)',
                      border: 'none',
                      color: '#4a3fcc',
                      fontSize: '1.3rem',
                      cursor: 'pointer',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => navigate('/dashboard')}
                    aria-label="Go to Dashboard"
                    title="Dashboard"
                  >
                    <FaTh style={{ transform: 'scale(1.1)' }} />
                  </button>
                  <span style={{
                    visibility: 'hidden',
                    width: '80px',
                    backgroundColor: '#333',
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    position: 'absolute',
                    zIndex: '1',
                    bottom: '125%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: '0',
                    transition: 'opacity 0.3s',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                  }}>
                    Dashboard
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '4px 8px 4px 4px',
                      borderRadius: '20px',
                      position: 'relative',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.querySelector('.profile-tooltip').style.visibility = 'visible';
                      e.currentTarget.querySelector('.profile-tooltip').style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('.profile-tooltip').style.visibility = 'hidden';
                      e.currentTarget.querySelector('.profile-tooltip').style.opacity = '0';
                    }}
                    onClick={() => navigate('/dashboard/profile')}
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=4a3fcc&color=fff';
                      }}
                    />
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#333',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px',
                      display: 'inline-block',
                      marginRight: '8px'
                    }} 
                    title={user.name}>
                      {user.name}
                    </span>
                    <span className="profile-tooltip" style={{
                      visibility: 'hidden',
                      width: '60px',
                      backgroundColor: '#333',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      position: 'absolute',
                      zIndex: '1',
                      top: 'calc(100% + 5px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: '0',
                      transition: 'opacity 0.3s',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      Profile
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        left: '50%',
                        marginLeft: '-5px',
                        borderWidth: '0 5px 5px 5px',
                        borderStyle: 'solid',
                        borderColor: 'transparent transparent #333 transparent'
                      }}></span>
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff4d4f',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      marginLeft: '4px',
                      position: 'relative',
                      top: '1px'
                    }}
                    aria-label="Sign out"
                    title="Sign out"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)';
                      e.currentTarget.querySelector('.logout-text').style.display = 'inline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.querySelector('.logout-text').style.display = 'none';
                    }}
                  >
                    <FaSignOutAlt style={{ fontSize: '1.3rem' }} />
                    <span className="logout-text" style={{
                      fontSize: '0.95rem',
                      color: '#ff4d4f',
                      display: 'none'
                    }}>
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-outline" onClick={onSignInClick}>
                Sign In
              </button>
              <button className="btn btn-primary">Get Started</button>
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
