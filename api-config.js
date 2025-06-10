// API Configuration and Endpoints
const API_CONFIG = {
    BASE_URL: 'https://api.healthyeating.com', // Replace with your actual API domain
    ENDPOINTS: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        VERIFY_EMAIL: '/auth/verify-email',
        RESET_PASSWORD: '/auth/reset-password',
        OAUTH: {
            GOOGLE: '/auth/oauth/google',
            FACEBOOK: '/auth/oauth/facebook',
            APPLE: '/auth/oauth/apple'
        }
    },
    HEADERS: {
        'Content-Type': 'application/json'
    },
    CORS_CONFIG: {
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Access-Control-Allow-Origin': window.location.origin,
            'Access-Control-Allow-Credentials': 'true'
        }
    }
};

class ApiService {
    static getAuthHeaders() {
        const token = TokenService.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

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
            
            if (response.status === 401) {
                // Token expired or invalid
                TokenService.removeToken();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
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
    
    static async handleOAuth(provider, code) {
        return this.request(API_CONFIG.ENDPOINTS.OAUTH[provider.toUpperCase()], {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }
}

// Token management
class TokenService {
    static getToken() {
        return localStorage.getItem('auth_token');
    }
    
    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }
    
    static removeToken() {
        localStorage.removeItem('auth_token');
    }
    
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

export { API_CONFIG, ApiService, TokenService };
