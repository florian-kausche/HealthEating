// login.js
import { ApiService, TokenService } from './api-config.js';

class AuthManager {
    constructor() {
        // Form elements
        this.loginForm = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.rememberCheckbox = document.getElementById('remember');
        
        // Header buttons
        this.signInBtn = document.getElementById('sign-in-btn');
        this.signUpBtn = document.getElementById('sign-up-btn');
        this.headerActions = document.querySelector('.header-actions');
        
        this.setupEventListeners();
        this.checkAuthStatus();
    }    setupEventListeners() {
        // Load remembered email if exists
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail && this.emailInput) {
            this.emailInput.value = rememberedEmail;
            this.rememberCheckbox.checked = true;
        }

        // Form submission
        this.loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthAction();
        });

        // Social login handlers
        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.currentTarget.querySelector('i').classList[1].split('-')[1];
                this.handleSocialLogin(platform);
            });
        });
    }

    showModal(type) {
        if (!this.modalBg) return;
        
        this.modalBg.style.display = 'flex';
        this.currentAction = type;
        this.modalTitle.textContent = type === 'signin' ? 'Sign In' : 'Sign Up';
        this.modalAction.textContent = type === 'signin' ? 'Sign In' : 'Sign Up';
        this.modalEmail.value = '';
        this.modalPassword.value = '';
        this.modalEmail.focus();
    }

    hideModal() {
        if (this.modalBg) {
            this.modalBg.style.display = 'none';
        }
    }    async handleAuthAction() {
        const email = this.emailInput?.value.trim();
        const password = this.passwordInput?.value;

        if (!this.validateInput(email, password)) return;

        try {
            await this.signIn(email, password);
        } catch (error) {
            this.showError(error.message);
        }
    }

    validateInput(email, password) {
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return false;
        }

        return true;
    }    async handleSocialLogin(platform) {
        const button = document.querySelector(`.social-button i.fa-${platform}`).parentElement;
        const originalHtml = button.innerHTML;
        
        try {
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
            button.style.pointerEvents = 'none';
            
            // OAuth configuration (replace with your actual OAuth credentials)
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
                },
                apple: {
                    client_id: 'your-apple-client-id',
                    redirect_uri: `${window.location.origin}/oauth/callback`,
                    scope: 'email name'
                }
            };
            
            // Initialize OAuth flow
            const oauthConfig = config[platform];
            if (!oauthConfig) {
                throw new Error(`${platform} login is not configured`);
            }
            
            // Create and store state parameter to prevent CSRF
            const state = this.generateRandomState();
            sessionStorage.setItem('oauth_state', state);
            
            // Build OAuth URL
            const oauthUrl = this.buildOAuthUrl(platform, oauthConfig, state);
            
            // Open OAuth popup
            const popup = window.open(oauthUrl, `${platform}Login`, 
                'width=500,height=600,menubar=no,toolbar=no,location=no');
            
            if (!popup) {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            }
            
            // Listen for OAuth callback
            const loginResult = await this.listenForOAuthCallback(popup, state);
            await this.handleOAuthSuccess(loginResult);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            button.innerHTML = originalHtml;
            button.style.pointerEvents = '';
        }
    }
    
    generateRandomState() {
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, x => x.toString(16)).join('');
    }
    
    buildOAuthUrl(platform, config, state) {
        const params = new URLSearchParams({
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: config.scope,
            state: state,
            response_type: 'code'
        });
        
        switch (platform) {
            case 'google':
                return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
            case 'facebook':
                return `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`;
            case 'apple':
                return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
            default:
                throw new Error('Unsupported platform');
        }
    }
    
    listenForOAuthCallback(popup, expectedState) {
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    reject(new Error('Login window was closed'));
                }
            }, 1000);
            
            window.addEventListener('message', function handler(event) {
                // Verify origin
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

    showError(message, type = 'error') {
        // Remove any existing error message
        const existingError = document.querySelector('.auth-error');
        if (existingError) existingError.remove();

        // Create and show new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = `auth-error ${type}`;
        errorDiv.textContent = message;
        
        // Insert error before the login button
        const loginButton = this.loginForm.querySelector('.login-button');
        loginButton.insertAdjacentElement('beforebegin', errorDiv);

        // Auto-remove error after 3 seconds
        setTimeout(() => errorDiv.remove(), 3000);
    }

    async signIn(email, password) {
        const submitButton = this.loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            
            // Call API to authenticate
            const response = await ApiService.login({ email, password });
            
            // Store auth token
            TokenService.setToken(response.token);
            
            // Remember email if checkbox is checked
            if (this.rememberCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Check email verification status
            if (!response.emailVerified) {
                this.showError('Please verify your email address. Check your inbox for verification instructions.', 'info');
                return;
            }
            
            // Redirect to dashboard or home page
            window.location.href = 'index.html';
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    async signUp(email, password) {
        // In a real app, this would be an API call
        // For demo, we'll use localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === email)) {
            throw new Error('Email already registered');
        }

        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));

        this.setSession(email);
        this.hideModal();
        this.updateUIForAuth();
    }

    async handleOAuthSuccess(loginResult) {
        try {
            const response = await ApiService.handleOAuth(loginResult.provider, loginResult.code);
            TokenService.setToken(response.token);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(error.message);
        }
    }

    setSession(email) {
        localStorage.setItem('currentUser', email);
        localStorage.setItem('sessionTimestamp', Date.now().toString());
        localStorage.setItem('isLoggedIn', 'true');
    }

    checkAuthStatus() {
        if (TokenService.isAuthenticated()) {
            // Update UI for authenticated state
            this.updateHeaderForAuthenticatedUser();
        }
    }

    clearSession() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionTimestamp');
        localStorage.removeItem('isLoggedIn');
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionTimestamp');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }

    updateUIForAuth() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser || !this.headerActions) return;

        // Remove sign in/up buttons
        this.signInBtn?.remove();
        this.signUpBtn?.remove();

        // Add user info and logout button if not already present
        if (!document.getElementById('user-info')) {
            const userInfo = document.createElement('div');
            userInfo.id = 'user-info';
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-email">${currentUser}</span>
                <button class="logout-btn">Logout</button>
            `;
            this.headerActions.appendChild(userInfo);

            // Add logout handler
            const logoutBtn = userInfo.querySelector('.logout-btn');
            logoutBtn?.addEventListener('click', () => this.logout());
        }
    }

    logout() {
        this.clearSession();
        window.location.reload();
    }
}

// Initialize auth management
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
