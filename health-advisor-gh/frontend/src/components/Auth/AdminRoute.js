import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading: authLoading } = useAuth(); // Renamed loading to authLoading for clarity
  const location = useLocation();

  if (authLoading) {
    // Display a loading message while authentication and admin status are being verified.
    // This helps prevent premature redirects or rendering.
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '1.2rem' }}>
        Verifying access permissions...
      </div>
    );
  }

  if (!currentUser) {
    // If user is not authenticated, redirect them to the login page.
    // 'replace' avoids adding the admin route to history if user wasn't allowed.
    // 'state: { from: location }' allows redirecting back after successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If user is authenticated but not an admin, redirect them to the home page.
    // A message can be passed via state to optionally display an "Access Denied" message on the home page,
    // or you could redirect to a dedicated '/unauthorized' page.
    console.warn("AdminRoute: Access denied. User is authenticated but lacks admin privileges."); // For developer debugging
    return <Navigate to="/" state={{ unauthorizedAdminAccess: true, message: "Access Denied: You do not have permission to view this administrative page." }} replace />;
  }

  // If user is authenticated and is an admin, render the child components.
  return children;
};

export default AdminRoute;
