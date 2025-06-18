// API Configuration and Endpoints
// This object contains all API-related configuration including base URL, endpoints, and headers
const API_CONFIG = {
    BASE_URL: 'https://api.healthyeating.com', // Replace with your actual API domain
    ENDPOINTS: {
        LOGIN: '/auth/login',           // Endpoint for user login
        SIGNUP: '/auth/signup',         // Endpoint for user registration
        VERIFY_EMAIL: '/auth/verify-email', // Endpoint for email verification
        RESET_PASSWORD: '/auth/reset-password', // Endpoint for password reset
        OAUTH: {
            GOOGLE: '/auth/oauth/google',    // Google OAuth endpoint
            FACEBOOK: '/auth/oauth/facebook', // Facebook OAuth endpoint
            APPLE: '/auth/oauth/apple'        // Apple OAuth endpoint
        }
    },
    HEADERS: {
        'Content-Type': 'application/json'  // Default content type for API requests
    },
    CORS_CONFIG: {
        mode: 'cors',                      // Enable CORS
        credentials: 'include',            // Include credentials in requests
        headers: {
            'Access-Control-Allow-Origin': window.location.origin,
            'Access-Control-Allow-Credentials': 'true'
        }
    }
};

// ApiService class for handling all API requests
class ApiService {
    // Get authentication headers with JWT token
    static getAuthHeaders() {
        const token = TokenService.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Generic request method for all API calls
    static async request(endpoint, options = {}) {
        const url = API_CONFIG.BASE_URL + endpoint;
        const headers = { 
            ...API_CONFIG.HEADERS, 
            ...this.getAuthHeaders(),
            ...options.headers 
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                ...API_CONFIG.CORS_CONFIG,
                headers
            });
            
            // Handle unauthorized access (401)
            if (response.status === 401) {
                // Token expired or invalid
                TokenService.removeToken();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            const data = await response.json();
            
            // Handle non-200 responses
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // User authentication methods
    static async login(credentials) {
        return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    
    static async signup(userData) {
        return this.request(API_CONFIG.ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    static async verifyEmail(token) {
        return this.request(API_CONFIG.ENDPOINTS.VERIFY_EMAIL, {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    }
    
    static async resetPassword(email) {
        return this.request(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
    
    // OAuth authentication method
    static async handleOAuth(provider, code) {
        return this.request(API_CONFIG.ENDPOINTS.OAUTH[provider.toUpperCase()], {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }
}

// TokenService class for managing JWT tokens
class TokenService {
    // Get stored token from localStorage
    static getToken() {
        return localStorage.getItem('auth_token');
    }
    
    // Store token in localStorage
    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }
    
    // Remove token from localStorage
    static removeToken() {
        localStorage.removeItem('auth_token');
    }
    
    // Check if user is authenticated and token is valid
    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // Simple JWT expiration check (assumes JWT payload structure)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }
}

// Export the configuration and service classes
export { API_CONFIG, ApiService, TokenService };
