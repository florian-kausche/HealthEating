import React, { useState, useEffect } from 'react';
import { fetchAdminStats } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, currentUser, loading: authLoading } = useAuth(); // Get isAdmin status and auth loading status
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth loading to complete before making decisions
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to view this page. Redirecting to login...");
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!isAdmin) {
      setError("You do not have administrative privileges to view this page. Redirecting to home...");
      setIsLoading(false);
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const getStats = async () => {
      setIsLoading(true); // Set loading true before fetch
      try {
        const response = await fetchAdminStats();
        setStats(response.data); // The actual stats are in response.data
        setError('');
      } catch (err) {
        console.error("Error fetching admin stats on page:", err);
        setError(err.message || "Failed to load admin data. Ensure you have admin rights and the server is running.");
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch stats if authenticated and identified as admin client-side
    if (currentUser && isAdmin) {
        getStats();
    }

  }, [isAdmin, currentUser, authLoading, navigate]);

  // Styles specific to Admin Dashboard, some can be replaced by global classes
  const styles = {
    // page: { padding: '25px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f4f6f8', minHeight: 'calc(100vh - 70px)' }, // Base page padding from .main-content
    // title: { textAlign: 'center', color: '#2c3e50', marginBottom: '35px', fontSize: '2rem', fontWeight: '600' }, // .page-title
    // messageContainer: { maxWidth: '600px', margin: '30px auto', padding: '20px', borderRadius: '8px', textAlign: 'center'}, // Can use .card for this
    // error: { border: '1px solid #e74c3c', backgroundColor: '#fdeded', color: '#e74c3c' }, // .error-message
    // loading: { fontSize: '1.3em', color: '#3498db' }, // .loading-message
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '20px' },
    // statCard: { border: '1px solid #dfe6e9', borderRadius: '10px', padding: '25px', backgroundColor: '#ffffff', boxShadow: '0 5px 15px rgba(0,0,0,0.07)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }, // .card
    statLabel: { fontWeight: '600', color: '#3498db', display: 'block', marginBottom: '10px', fontSize: '0.95rem', textTransform: 'capitalize' },
    statValue: { fontSize: '1.8em', color: '#2c3e50', fontWeight: 'bold' },
    infoText: {marginTop: '40px', textAlign: 'center', color: '#7f8c8d'} // Custom class for the bottom text
  };

  const handleCardMouseOver = (e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; };
  const handleCardMouseOut = (e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.07)'; };


  if (authLoading || (isLoading && !error)) {
    return <div className="loading-message" style={{padding: '50px'}}>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return (
      <div> {/* Wrapper for page consistent padding if .main-content is not on App.js for all routes */}
        <h2 className="page-title">Admin Dashboard Access</h2>
        <p className="error-message" style={{maxWidth: '600px', margin: '20px auto'}}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h2 className="page-title">Admin Dashboard</h2>
        <p style={{textAlign: 'center', padding: '30px'}}>No administrative data available or still loading.</p>
      </div>
    );
  }

  return (
    <div> {/* Wrapper for page consistent padding */}
      <h2 className="page-title">Admin Dashboard - Application Overview</h2>
      <div style={styles.statsGrid}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="card" style={{transition: 'transform 0.2s ease, box-shadow 0.2s ease'}} onMouseOver={handleCardMouseOver} onMouseOut={handleCardMouseOut}>
            <span style={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
            <span style={styles.statValue}>
              {typeof value === 'string' && (value.includes('T') && value.includes('Z') && !isNaN(new Date(value)))
                ? new Date(value).toLocaleString()
                : value.toString()}
            </span>
          </div>
        ))}
      </div>
      <div style={styles.infoText}>
          <p>More admin functionalities (User Management, Content Moderation, Clinic Management) will be available here.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
