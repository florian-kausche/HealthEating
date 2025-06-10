import { TokenService, ApiService } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Password visibility toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Password validation
    const passwordChecks = {
        length: document.getElementById('length-check'),
        uppercase: document.getElementById('uppercase-check'),
        number: document.getElementById('number-check'),
        special: document.getElementById('special-check')
    };

    function validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.keys(checks).forEach(check => {
            if (checks[check]) {
                passwordChecks[check].classList.add('valid');
            } else {
                passwordChecks[check].classList.remove('valid');
            }
        });

        return Object.values(checks).every(Boolean);
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        const fullname = document.getElementById('fullname');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        const terms = document.getElementById('terms');

        // Full name validation
        if (fullname.value.trim().length < 2) {
            showError(fullname, 'Please enter your full name');
            isValid = false;
        } else {
            clearError(fullname);
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(email);
        }

        // Password validation
        if (!validatePassword(password.value)) {
            showError(password, 'Please meet all password requirements');
            isValid = false;
        } else {
            clearError(password);
        }

        // Confirm password validation
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        } else {
            clearError(confirmPassword);
        }

        // Terms validation
        if (!terms.checked) {
            showError(terms, 'Please agree to the terms and conditions');
            isValid = false;
        } else {
            clearError(terms);
        }

        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        formGroup.classList.remove('error');
        errorElement.style.display = 'none';
    }

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        validatePassword(passwordInput.value);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        try {
            const formData = {
                fullname: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };

            const response = await ApiService.request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.token) {
                TokenService.setToken(response.token);
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Failed to create account. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    });

    // Social signup buttons
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');

    googleBtn?.addEventListener('click', () => {
        // Implement Google OAuth
        alert('Google signup coming soon!');
    });

    facebookBtn?.addEventListener('click', () => {
        // Implement Facebook OAuth
        alert('Facebook signup coming soon!');
    });
});
