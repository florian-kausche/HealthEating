// reset-password.js
import { ApiService } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-form');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value.trim();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Call API to request password reset
            await ApiService.resetPassword(email);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'auth-error info';
            successMessage.textContent = 'If an account exists with this email, you will receive password reset instructions.';
            form.insertBefore(successMessage, submitButton);
            
            // Clear the form
            form.email.value = '';
            
        } catch (error) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'auth-error';
            errorMessage.textContent = error.message;
            form.insertBefore(errorMessage, submitButton);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});
