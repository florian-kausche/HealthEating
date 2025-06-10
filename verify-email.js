// verify-email.js
import { ApiService } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const status = params.get('status');
    
    const statusContainer = document.getElementById('verification-status');
    const loginButton = document.querySelector('.action-button');
    
    async function verifyEmail() {
        if (status === 'pending') {
            showPending(email);
            return;
        }
        
        if (!token || !email) {
            showError('Invalid verification link');
            return;
        }
        
        try {
            await ApiService.verifyEmail(token);
            showSuccess();
        } catch (error) {
            showError(error.message);
        }
    }
    
    function showSuccess() {
        statusContainer.className = 'verification-status success';
        statusContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified. You can now sign in to your account.</p>
        `;
        loginButton.style.display = 'inline-block';
    }
    
    function showError(message) {
        statusContainer.className = 'verification-status error';
        statusContainer.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <h2>Verification Failed</h2>
            <p>${message}</p>
        `;
        loginButton.style.display = 'inline-block';
    }
    
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
    
    window.resendVerification = async (email) => {
        try {
            await ApiService.signup({ email, resendVerification: true });
            alert('Verification email has been resent. Please check your inbox.');
        } catch (error) {
            alert(error.message);
        }
    };
    
    // Start verification process
    verifyEmail();
});
