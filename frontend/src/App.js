import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';
import LoadingBar from 'react-top-loading-bar';
import PrivateRoute from './components/PrivateRoute.js';
import RoleBasedRoute from './components/RoleBasedRoute.js';
import sessionTimeoutService from './services/sessionTimeoutService';

//User Panel
import Home from './User_panel/Home.js';
import Dashboard from './User_panel/User_Dashboard.js';
import UserProfile from './User_panel/User_Profile.js';
import UserLeaderboard from './User_panel/User_Leaderboard.js';
import UserContest from './User_panel/User_Contest.js';
import User_Contest_Details from './User_panel/User_Contest_Details.js';
import User_Contest_Participate from './User_panel/User_Contest_Participate.js';
import PracticeProblem from './User_panel/PracticeProblem.js';
import SolveProblem from './User_panel/SolveProblem.js';
import Submissions from './User_panel/Submissions.js';
import ViewSubmission from './User_panel/ViewSubmission.js';
import Editorial from './User_panel/Editorial.js';
import IndividualLeaderboard from './User_panel/Individual_Leaderboard.js';

//Question Setter Panel
import QuestionSetterHomepage from './Question-setter/question-setter-Homepage.js';
import QuestionSetterExploreQuestions from './Question-setter/question-setter-ExploreQuestions.js';
import QuestionSetterCreateQuestion from './Question-setter/question-setter-CreateQuestion.js';
import QuestionSetterCreateCompetition from './Question-setter/question-setter-CreateCompetition.js';
import QuestionSetterQuestionDetails from './Question-setter/question-setter-QuestionDetails.js';
import QuestionSetterSubmissionDetails from './Question-setter/question-setter-SubmissionDetails.js';
import QuestionSetterContest from './Question-setter/question-setter-Contest.js';
import QuestionSetterContestDetails from './Question-setter/question-setter-ContestDetails.js';
import QuestionSetterLeaderboard from './Question-setter/question-setter-Leaderboard.js';
import QuestionSetterProfile from './Question-setter/question-setter-Profile.js';



//Admin Panel
import AdminDashboard from './Admin_Panel/Admin_Dashboard.js';
import Admin_Leaderboard from './Admin_Panel/Admin_Leaderboard.js';
import Admin_Contest from './Admin_Panel/Admin_Contest.js';
import Admin_Contest_Details from './Admin_Panel/Admin_Contest_Details.js';
import Admin_Contest_ViewCode from './Admin_Panel/Admin_Contest_View Code.js';
import UserManagement from './Admin_Panel/UserManagement.js';
import ApproveProblem from './Admin_Panel/ApproveProblem.js';
import Admin_ViewProblem from './Admin_Panel/Admin_ViewProblem.js';
import Admin_ProblemSubmission from './Admin_Panel/Admin_ProblemSubmission.js';
import Admin_IndividualLeaderboard from './Admin_Panel/Admin_IndividualLeaderboard.js';
import Admin_ViewSubmission from './Admin_Panel/Admin_ViewSubmission.js';




// Wrapper component to handle loading bar
const AppContent = () => {
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const location = useLocation();

  // Handle session timeout warning
  const handleSessionWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  // Extend session when user clicks "Stay Signed In"
  const handleExtendSession = useCallback(() => {
    sessionTimeoutService.extendSession();
    setShowWarning(false);
  }, []);

  // Handle manual sign out from warning modal
  const handleSignOut = useCallback(async () => {
    setShowWarning(false);
    await sessionTimeoutService.forceLogout();
  }, []);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Initialize session timeout when user is authenticated
        sessionTimeoutService.init(handleSessionWarning);
      } else {
        // Cleanup session timeout when user is not authenticated
        sessionTimeoutService.cleanup();
      }
    });

    return () => {
      unsubscribe();
      sessionTimeoutService.cleanup();
    };
  }, [handleSessionWarning]);

  // Start loading bar when route changes
  useEffect(() => {
    setProgress(30);
    
    // Simulate loading completion
    const timer = setTimeout(() => setProgress(100), 500);
    
    // Clean up
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <LoadingBar
        color='#6d55ff'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      
      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f44336' }}>
              Session Timeout Warning
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              Your session will expire in 5 minutes due to inactivity. Do you want to stay signed in?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleExtendSession}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Stay Signed In
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Home />} />
        {/* User Routes - Only accessible by users */}
        <Route path="/dashboard" element={<RoleBasedRoute allowedRoles={['user']}><Dashboard /></RoleBasedRoute>} />
        <Route path="/profile" element={<RoleBasedRoute allowedRoles={['user']}><UserProfile /></RoleBasedRoute>} />
        <Route path="/leaderboard" element={<RoleBasedRoute allowedRoles={['user']}><UserLeaderboard /></RoleBasedRoute>} />
        <Route path="/contest" element={<RoleBasedRoute allowedRoles={['user']}><UserContest /></RoleBasedRoute>} />
        <Route path="/contest/:contestId" element={<RoleBasedRoute allowedRoles={['user']}><User_Contest_Details /></RoleBasedRoute>} />
        <Route path="/contest/participate/:contestId" element={<RoleBasedRoute allowedRoles={['user']}><User_Contest_Participate /></RoleBasedRoute>} />
        <Route path="/practice" element={<RoleBasedRoute allowedRoles={['user']}><PracticeProblem /></RoleBasedRoute>} />
        <Route path="/practice/solve/:problemId" element={<RoleBasedRoute allowedRoles={['user']}><SolveProblem /></RoleBasedRoute>} />
        <Route path="/practice/editorial/:problemId" element={<RoleBasedRoute allowedRoles={['user']}><Editorial /></RoleBasedRoute>} />
        <Route path="/practice/submissions/:problemId" element={<RoleBasedRoute allowedRoles={['user']}><Submissions /></RoleBasedRoute>} />
        <Route path="/practice/leaderboard/:problemId" element={<RoleBasedRoute allowedRoles={['user']}><IndividualLeaderboard /></RoleBasedRoute>} />
        <Route path="/submissions" element={<RoleBasedRoute allowedRoles={['user']}><Submissions /></RoleBasedRoute>} />
        <Route path="/submissions/view/:submissionId" element={<RoleBasedRoute allowedRoles={['user']}><ViewSubmission /></RoleBasedRoute>} />
        <Route path="/editorial" element={<RoleBasedRoute allowedRoles={['user']}><Editorial /></RoleBasedRoute>} />
        <Route path="/individual-leaderboard" element={<RoleBasedRoute allowedRoles={['user']}><IndividualLeaderboard /></RoleBasedRoute>} />
        
        {/* Question Setter Routes - Only accessible by moderators */}
        <Route path="/question-setter" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterHomepage /></RoleBasedRoute>} />
        <Route path="/question-setter/explore" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterExploreQuestions /></RoleBasedRoute>} />
        <Route path="/question-setter/contest" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterContest /></RoleBasedRoute>} />
        <Route path="/question-setter/contest/:contestId" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterContestDetails /></RoleBasedRoute>} />
        <Route path="/question-setter/leaderboard" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterLeaderboard /></RoleBasedRoute>} />
        <Route path="/question-setter/profile" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterProfile /></RoleBasedRoute>} />
        <Route path="/question-setter/create" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterCreateQuestion /></RoleBasedRoute>} />
        <Route path="/question-setter/create-competition" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterCreateCompetition /></RoleBasedRoute>} />
        <Route path="/question-setter/question/:questionId" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterQuestionDetails /></RoleBasedRoute>} />
        <Route path="/question-setter/submission/:questionId/:userId" element={<RoleBasedRoute allowedRoles={['moderator']}><QuestionSetterSubmissionDetails /></RoleBasedRoute>} />
        
        
        {/* Admin Routes - Only accessible by admins */}
        <Route path="/admin_dashboard" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDashboard /></RoleBasedRoute>} />
        <Route path="/admin_users" element={<RoleBasedRoute allowedRoles={['admin']}><UserManagement /></RoleBasedRoute>} />
        <Route path="/admin_contests" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_Contest /></RoleBasedRoute>} />
        <Route path="/admin_problems" element={<RoleBasedRoute allowedRoles={['admin']}><ApproveProblem /></RoleBasedRoute>} />
        <Route path="/admin_problems/:problemId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_ViewProblem /></RoleBasedRoute>} />
        <Route path="/admin_submissions/:problemId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_ProblemSubmission /></RoleBasedRoute>} />
        <Route path="/admin/submissions/view/:submissionId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_ViewSubmission /></RoleBasedRoute>} />
        <Route path="/admin/leaderboard/:problemId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_IndividualLeaderboard /></RoleBasedRoute>} />
        <Route path="/admin_analytics" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDashboard /></RoleBasedRoute>} />
        <Route path="/admin_settings" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDashboard /></RoleBasedRoute>} />
        <Route path="/admin_contest/:contestId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_Contest_Details /></RoleBasedRoute>} />
        <Route path="/admin_leaderboard" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_Leaderboard /></RoleBasedRoute>} />
        <Route path="/admin_contest" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_Contest /></RoleBasedRoute>} />
        <Route path="/admin_contest/:contestId/code/:userId" element={<RoleBasedRoute allowedRoles={['admin']}><Admin_Contest_ViewCode /></RoleBasedRoute>} />
        {/*<Route path="/admin_contest/:contestId" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDashboard /></RoleBasedRoute>} />*/}
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
