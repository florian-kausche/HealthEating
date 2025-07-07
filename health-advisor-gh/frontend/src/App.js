import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import ChatbotPage from './pages/ChatbotPage';
import ClinicLocatorPage from './pages/ClinicLocatorPage';
import HealthDashboardPage from './pages/HealthDashboardPage'; // Import HealthDashboardPage
// import Home from './pages/Home'; // Example placeholder
// import Dashboard from './pages/Dashboard'; // Example placeholder
// import ProfilePage from './pages/ProfilePage'; // Example placeholder

import './App.css'; // Assuming App.css has some basic styles

// --- Placeholder Components (would normally be in separate files e.g. src/pages/) ---

// Placeholder Home Component
const Home = () => {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation(); // For localization
  const { Trans } = require('react-i18next'); // For components in translations

  return (
    <div className="home-banner">
      <h1>{t('home.welcomeMessage')}</h1>
      <p>{t('home.welcomeSubtitle')}</p>
      {currentUser ? (
        <div style={{ marginTop: '20px', fontSize: '1rem' }}>
          <p>{t('home.loggedInMessage', { name: currentUser.displayName || currentUser.email })}.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{marginTop: '10px'}}>{t('common.goDashboard')}</Link>
        </div>
      ) : (
        <p style={{ marginTop: '20px', fontSize: '1rem' }}>
          <Trans i18nKey="home.guestMessage">
            Please <Link to="/login" style={{color: 'white', fontWeight:'bold'}}>login</Link> or <Link to="/register" style={{color: 'white', fontWeight:'bold'}}>register</Link> to access all features.
          </Trans>
        </p>
      )}
    </div>
  );
};

// Placeholder Dashboard Component (Protected)
const Dashboard = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="page-title">{t('nav.dashboard')}</h2> {/* Example */}
      <div className="card">
        <p>Welcome, <strong>{currentUser?.displayName || currentUser?.email}!</strong></p>
        <p>This is your personalized dashboard. More features coming soon.</p>
      </div>
    </div>
  );
};

// --- End Placeholder Components ---


// ProtectedRoute Component (Helper for routes that require authentication)
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="loading-message" style={{paddingTop: '50px'}}> {/* Use global loading style */}
        Loading authentication status...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// AdminRoute Component
import AdminRoute from './components/Auth/AdminRoute';


function App() {
  const { currentUser, signOut, loading: authLoading, isAdmin } = useAuth();
  const { t, i18n } = useTranslation(); // For localization

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (authLoading) {
    return (
      <div className="AppLoading">
        <p>Loading Health Advisor Ghana...</p>
        {/* Consider adding a spinner component here */}
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Use CSS classes for nav styling */}
        <nav className="app-nav">
          <Link to="/" className="nav-brand">{t('appName')}</Link>
          <div className="nav-links-container">
            <Link to="/clinics">{t('nav.findClinic')}</Link>
            <Link to="/health-hub">{t('nav.healthHub')}</Link>
            {currentUser ? (
              <>
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
                <Link to="/symptom-checker">{t('nav.symptomChecker')}</Link>
                <Link to="/chatbot">{t('nav.chatbot')}</Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="admin-link">{t('nav.adminPanel')}</Link>
                )}
                <button onClick={handleLogout} className="logout-button">
                  {t('nav.logout')} ({currentUser.displayName || currentUser.email})
                </button>
              </>
            ) : (
              <>
                <Link to="/login">{t('nav.login')}</Link>
                <Link to="/register">{t('nav.register')}</Link>
              </>
            )}
            {/* Basic Language Switcher */}
            <div style={{ marginLeft: '20px' }}>
              <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'} style={{marginRight: '5px', padding: '5px 8px', cursor: 'pointer', backgroundColor: i18n.language === 'en' ? '#ccc' : '#fff'}}>EN</button>
              <button onClick={() => changeLanguage('tw')} disabled={i18n.language === 'tw'} style={{padding: '5px 8px', cursor: 'pointer', backgroundColor: i18n.language === 'tw' ? '#ccc' : '#fff'}}>TW</button>
            </div>
          </div>
        </nav>

        {/* Use CSS class for main content area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/symptom-checker"
              element={<ProtectedRoute><SymptomCheckerPage /></ProtectedRoute>}
            />
            <Route
              path="/chatbot"
              element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>}
            />
            <Route path="/clinics" element={<ClinicLocatorPage />} />
            <Route path="/health-hub" element={<HealthDashboardPage />} />

            <Route
              path="/admin/dashboard"
              element={<AdminRoute><AdminDashboardPage /></AdminRoute>}
            />

            {/* Fallback route for unmatched paths */}
            <Route path="*" element={<div className="card" style={{textAlign: 'center', marginTop: '50px'}}><h2 className="page-title">404 Not Found</h2><p>The page you are looking for does not exist.</p><Link to="/" className="btn btn-primary">Go to Home</Link></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
