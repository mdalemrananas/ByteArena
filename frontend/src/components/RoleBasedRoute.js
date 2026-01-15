import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserRole } from '../services/userRoleService';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const role = await getUserRole(currentUser.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (!user) {
    // Redirect to home if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!userRole) {
    // Redirect to home if role is not found
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      'admin': '/admin_dashboard',
      'moderator': '/question-setter',
      'user': '/dashboard'
    };
    
    return <Navigate to={roleRedirects[userRole] || '/'} state={{ from: location }} replace />;
  }

  return children;
};

export default RoleBasedRoute;
