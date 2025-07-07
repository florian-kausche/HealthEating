import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // If user is already logged in, redirect them from register page
      navigate('/'); // Or to a dashboard: navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    try {
      await registerUser(email, password, fullName);
      // Registration successful, onAuthStateChanged in AuthContext will update the state.
      // Firebase client sign-in is handled within authService.registerUser
      // Navigate to home or dashboard after registration, onAuthStateChanged will ensure currentUser is updated.
      // The useEffect above might redirect even before this, if state updates fast enough.
      // Explicit navigation here is a good fallback.
      navigate('/');
    } catch (err) {
      console.error("Registration component error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container"> {/* Use global class */}
      <h2 className="page-title">Register</h2> {/* Use global class */}
      {error && <p className="error-message">{error}</p>} {/* Use global class */}
      <form onSubmit={handleSubmit}>
        <div className="form-group"> {/* Use global class */}
          <label htmlFor="fullName">Full Name:</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            // Styling from global .form-group input
          />
        </div>
        <div className="form-group"> {/* Use global class */}
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            // Styling from global .form-group input
          />
        </div>
        <div className="form-group"> {/* Use global class */}
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            // Styling from global .form-group input
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary" // Use global classes
          style={{ width: '100%', marginTop: '10px' }} // Keep block style, add margin
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}> {/* Adjusted margin */}
        Already have an account?{' '}
        <span onClick={() => navigate('/login')} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
