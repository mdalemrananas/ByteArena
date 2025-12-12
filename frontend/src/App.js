import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LoadingBar from 'react-top-loading-bar';
import Home from './User_panel/Home.js';
import Dashboard from './User_panel/User_Dashboard.js';
import UserProfile from './User_panel/User_Profile.js';
import UserLeaderboard from './User_panel/User_Leaderboard.js';
import './App.css';

// Wrapper component to handle loading bar
const AppContent = () => {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Start loading bar when route changes
    setProgress(30);
    
    // Simulate loading completion
    const timer = setTimeout(() => setProgress(100), 500);
    
    // Clean up
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <LoadingBar
        color='#6d55ff'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/leaderboard" element={<UserLeaderboard />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;