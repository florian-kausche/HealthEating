import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // If user is already logged in, redirect them from login page
      navigate('/'); // Or to a dashboard: navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      // Login successful, onAuthStateChanged will update AuthContext.
      // Navigate to home or dashboard. The useEffect above might also trigger redirect.
      navigate('/');
    } catch (err) {
      console.error("Login component error:", err);
      let errorMessage = "Failed to login. Please check your credentials and try again.";
      // Firebase v9+ uses err.code for specific auth errors
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // General invalid credential error
            errorMessage = "Invalid email or password.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can try again later or reset your password.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage = err.message || "An unexpected error occurred during login.";
        }
      } else if (err.message) { // Fallback for other types of errors
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container"> {/* Use global class */}
      <h2 className="page-title">Login</h2> {/* Use global class */}
      {error && <p className="error-message">{error}</p>} {/* Use global class */}
      <form onSubmit={handleSubmit}>
        <div className="form-group"> {/* Use global class */}
          <label htmlFor="emailLogin">Email:</label> {/* Label styling from global */}
          <input
            id="emailLogin"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            // Input styling from global .form-group input
          />
        </div>
        <div className="form-group"> {/* Use global class */}
          <label htmlFor="passwordLogin">Password:</label> {/* Label styling from global */}
          <input
            id="passwordLogin"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            // Input styling from global .form-group input
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary" // Use global classes
          style={{ width: '100%', marginTop: '10px' }} // Keep block style for this button, add some top margin
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}> {/* Adjusted margin */}
        Don't have an account?{' '}
        <span onClick={() => navigate('/register')} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>
          Register
        </span>
      </p>
    </div>
  );
};

export default Login;
