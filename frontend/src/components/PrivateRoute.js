import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();


  if (loading) {
    // Show a loading spinner or placeholder while checking authentication
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Check if the user's role is included in the allowedRoles array
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />; // Redirect to home or an unauthorized page
  }

  // Ensure Component is a valid React component
  return <Component />;
};


export default ProtectedRoute;
