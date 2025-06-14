import { TokenService, ApiService } from './api-config.js';

class SignupManager {
    constructor() {
        this.form = document.getElementById('signup-form');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirm-password');
        this.togglePasswordButtons = document.querySelectorAll('.toggle-password');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.socialButtons = document.querySelectorAll('.social-btn');
        
        this.passwordChecks = {
            length: document.getElementById('length-check'),
            uppercase: document.getElementById('uppercase-check'),
            number: document.getElementById('number-check'),
            special: document.getElementById('special-check')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Password visibility toggle
        this.togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                button.querySelector('i').classList.toggle('fa-eye');
                button.querySelector('i').classList.toggle('fa-eye-slash');
            });
        });

        // Real-time password validation
        this.passwordInput.addEventListener('input', () => {
            this.validatePassword(this.passwordInput.value);
            this.validateConfirmPassword();
        });

        this.confirmPasswordInput.addEventListener('input', () => {
            this.validateConfirmPassword();
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Social signup
        this.socialButtons.forEach(button => {
            button.addEventListener('click', () => this.handleSocialSignup(button));
        });
    }

    validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.keys(checks).forEach(check => {
            if (checks[check]) {
                this.passwordChecks[check].classList.add('valid');
            } else {
                this.passwordChecks[check].classList.remove('valid');
            }
        });

        return Object.values(checks).every(Boolean);
    }

    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        if (confirmPassword && password !== confirmPassword) {
            this.showError(this.confirmPasswordInput, 'Passwords do not match');
            return false;
        } else {
            this.clearError(this.confirmPasswordInput);
            return true;
        }
    }

    validateForm() {
        let isValid = true;
        const fullname = document.getElementById('fullname');
        const email = document.getElementById('email');
        const terms = document.getElementById('terms');

        // Full name validation
        if (fullname.value.trim().length < 2) {
            this.showError(fullname, 'Please enter your full name');
            isValid = false;
        } else {
            this.clearError(fullname);
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            this.showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearError(email);
        }

        // Password validation
        if (!this.validatePassword(this.passwordInput.value)) {
            this.showError(this.passwordInput, 'Please meet all password requirements');
            isValid = false;
        } else {
            this.clearError(this.passwordInput);
        }

        // Confirm password validation
        if (!this.validateConfirmPassword()) {
            isValid = false;
        }

        // Terms validation
        if (!terms.checked) {
            this.showError(terms, 'Please agree to the terms and conditions');
            isValid = false;
        } else {
            this.clearError(terms);
        }

        return isValid;
    }

    showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.remove('error');
        errorElement.style.display = 'none';
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

        try {
            const formData = {
                fullname: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: this.passwordInput.value
            };

            const response = await ApiService.signup(formData);

            if (response.token) {
                TokenService.setToken(response.token);
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>Account Created Successfully!</h3>
                    <p>Please check your email to verify your account.</p>
                `;
                this.form.innerHTML = '';
                this.form.appendChild(successMessage);

                // Redirect to verification page
                setTimeout(() => {
                    window.location.href = 'verify-email.html?email=' + encodeURIComponent(formData.email);
                }, 3000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showError(this.form, error.message || 'Failed to create account. Please try again.');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Create Account';
        }
    }

    async handleSocialSignup(button) {
        const provider = button.classList.contains('google') ? 'google' : 'facebook';
        const originalHtml = button.innerHTML;
        
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            // OAuth configuration
            const config = {
                google: {
                    client_id: '917763527125-imu0l8f8tfl4453c0oiq7779mvpe2re9.apps.googleusercontent.com',
                    redirect_uri: `${window.location.origin}/oauth/callback`,
                    scope: 'email profile'
                },
                facebook: {
                    client_id: 'your-facebook-app-id',
                    redirect_uri: `${window.location.origin}/oauth/callback`,
                    scope: 'email,public_profile'
                }
            };

            // Initialize OAuth flow
            const oauthConfig = config[provider];
            if (!oauthConfig) {
                throw new Error(`${provider} signup is not configured`);
            }

            // Create and store state parameter
            const state = this.generateRandomState();
            sessionStorage.setItem('oauth_state', state);

            // Build OAuth URL
            const oauthUrl = this.buildOAuthUrl(provider, oauthConfig, state);

            // Open OAuth popup
            const popup = window.open(oauthUrl, `${provider}Signup`, 
                'width=500,height=600,menubar=no,toolbar=no,location=no');

            // Listen for OAuth callback
            const result = await this.listenForOAuthCallback(popup, state);
            
            // Handle OAuth success
            const response = await ApiService.handleOAuth(provider, result.code);
            TokenService.setToken(response.token);
            
            // Redirect to home page
            window.location.href = 'index.html';

        } catch (error) {
            console.error(`${provider} signup error:`, error);
            this.showError(this.form, `${provider} signup failed. Please try again.`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    }

    generateRandomState() {
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, x => x.toString(16)).join('');
    }

    buildOAuthUrl(provider, config, state) {
        const params = new URLSearchParams({
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: config.scope,
            state: state,
            response_type: 'code'
        });

        switch (provider) {
            case 'google':
                return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
            case 'facebook':
                return `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`;
            default:
                throw new Error('Unsupported provider');
        }
    }

    listenForOAuthCallback(popup, expectedState) {
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    reject(new Error('Signup window was closed'));
                }
            }, 1000);

            window.addEventListener('message', function handler(event) {
                if (event.origin !== window.location.origin) return;

                clearInterval(checkClosed);
                window.removeEventListener('message', handler);

                const { state, code, error } = event.data;

                if (error) {
                    reject(new Error(error));
                    return;
                }

                if (state !== expectedState) {
                    reject(new Error('Invalid state parameter'));
                    return;
                }

                resolve({ code });
            });
        });
    }
}

// Initialize signup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SignupManager();
});
