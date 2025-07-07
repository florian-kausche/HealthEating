import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import actual context
import Login from './Login';

// Mock the authService module
// This will mock the loginUser function to control its behavior during tests.
jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
}));

// Helper to render with Router and a mockable AuthContext
const renderLoginWithContext = (authContextValue, initialEntries = ['/login']) => {
  return render(
    <AuthContext.Provider value={authContextValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home Page after Redirect</div>} /> {/* Target for redirect */}
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  let mockAuthContext;

  beforeEach(() => {
    // Reset mocks before each test
    const { loginUser } = require('../../services/authService');
    loginUser.mockReset();

    // Default mock auth context value
    mockAuthContext = {
      currentUser: null,
      loading: false,
      isAdmin: false,
      signOut: jest.fn(),
      idToken: null,
      // Add any other functions/values your component might use from context
    };
  });

  it('renders login form with email, password fields, and a login button', () => {
    renderLoginWithContext(mockAuthContext);

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    // Using getByLabelText assumes labels are correctly associated with inputs via htmlFor
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it('allows typing into email and password fields', () => {
    renderLoginWithContext(mockAuthContext);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows an error message if login service call fails', async () => {
    const { loginUser } = require('../../services/authService');
    loginUser.mockRejectedValueOnce(new Error('Invalid test credentials'));

    renderLoginWithContext(mockAuthContext);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the error message to appear (since state updates are async)
    const errorMessage = await screen.findByText(/Invalid test credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('calls loginUser service on form submission with correct credentials', async () => {
    const { loginUser } = require('../../services/authService');
    // Mock a successful login that resolves (doesn't need a specific value unless used)
    loginUser.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

    renderLoginWithContext(mockAuthContext);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
    fireEvent.click(loginButton);

    // Check if loginUser was called with the email and password
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('user@example.com', 'securepassword');
    });
  });

  it('redirects to home page if user is already logged in', () => {
    mockAuthContext.currentUser = { email: 'test@example.com', uid: '123xyz' }; // Simulate logged-in user
    renderLoginWithContext(mockAuthContext, ['/login']);

    // The Login component's useEffect should navigate to '/'
    // We check if the content of the home page (our mock div) is rendered.
    expect(screen.getByText('Home Page after Redirect')).toBeInTheDocument();
    // And the login form specific elements should ideally not be there, or at least the main heading.
    // Depending on timing, the Login heading might briefly render.
    // A more robust check is that the login form itself isn't the primary view.
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });

});
