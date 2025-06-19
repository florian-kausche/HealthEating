// verify-email.js
import { ApiService } from './api-config.js';

// Initialize email verification when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Extract URL parameters for verification process
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');        // Verification token from email link
    const email = params.get('email');        // User's email address
    const status = params.get('status');      // Verification status (pending, success, error)
    
    // Get DOM elements for status display and action buttons
    const statusContainer = document.getElementById('verification-status');
    const loginButton = document.querySelector('.action-button');
    
    // Main email verification function
    async function verifyEmail() {
        // Handle pending verification status (email sent but not clicked)
        if (status === 'pending') {
            showPending(email);
            return;
        }
        
        // Validate required parameters
        if (!token || !email) {
            showError('Invalid verification link');
            return;
        }
        
        // Attempt to verify email with API
        try {
            await ApiService.verifyEmail(token);
            showSuccess();
        } catch (error) {
            showError(error.message);
        }
    }
    
    // Display success message when email is verified
    function showSuccess() {
        statusContainer.className = 'verification-status success';
        statusContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified. You can now sign in to your account.</p>
        `;
        loginButton.style.display = 'inline-block';
    }
    
    // Display error message when verification fails
    function showError(message) {
        statusContainer.className = 'verification-status error';
        statusContainer.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <h2>Verification Failed</h2>
            <p>${message}</p>
        `;
        loginButton.style.display = 'inline-block';
    }
    
    // Display pending message when waiting for email verification
    function showPending(email) {
        statusContainer.className = 'verification-status pending';
        statusContainer.innerHTML = `
            <i class="fas fa-envelope"></i>
            <h2>Verify Your Email</h2>
            <p>We've sent a verification link to <strong>${email}</strong>. Please check your inbox and click the link to verify your account.</p>
            <p class="small">Don't see the email? Check your spam folder or <a href="#" onclick="resendVerification('${email}')">click here to resend</a>.</p>
        `;
        loginButton.style.display = 'none';
    }
    
    // Global function to resend verification email
    window.resendVerification = async (email) => {
        try {
            await ApiService.signup({ email, resendVerification: true });
            alert('Verification email has been resent. Please check your inbox.');
        } catch (error) {
            alert(error.message);
        }
    };
    
    // Start the verification process when page loads
    verifyEmail();
});
