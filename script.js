import { TokenService, ApiService } from './api-config.js';

function showPopup() {
    document.getElementById('popup').classList.add('active');
}

function closePopup() {
    document.getElementById('popup').classList.remove('active');
}

// Initialize popup functionality
document.addEventListener('DOMContentLoaded', () => {
    // Show popup after 3 seconds
    setTimeout(showPopup, 3000);

    // Close popup button
    const closePopupBtn = document.getElementById('close-popup-btn');
    closePopupBtn?.addEventListener('click', closePopup);

    // Popup CTA button - redirect to AI recipes
    const popupCta = document.getElementById('popup-cta');
    popupCta?.addEventListener('click', (e) => {
        e.preventDefault();
        // Add loading state
        const button = e.currentTarget;
        button.classList.add('loading');
        button.disabled = true;

        // Small delay to show loading animation
        setTimeout(() => {
            window.location.href = 'ai-recipes.html';
        }, 500);
    });

    // Close popup when clicking outside
    const popup = document.getElementById('popup');
    popup?.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup();
        }
    });
});

// Smooth scroll for nav links with header offset
const header = document.querySelector('.main-header');
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header ? header.offsetHeight : 0;
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - headerHeight - 8, // 8px extra spacing
                behavior: 'smooth'
            });
        }
    });
});

// Search bar interaction
const searchInput = document.getElementById('recipe-search-input');
if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchForm = document.getElementById('recipe-search-form');
            if (searchForm) {
                searchForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Fix sign in/up button functionality
document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('sign-in-btn');
    const signUpBtn = document.getElementById('sign-up-btn');

    if (signInBtn) {
        signInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }

    if (signUpBtn) {
        signUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'signup.html';
        });
    }
});

// Remove the old modal logic since we're using separate pages
const modalBg = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.getElementById('close-modal');
const modalAction = document.getElementById('modal-action');
const authForm = document.getElementById('auth-form');
const switchBtn = document.getElementById('switch-btn');
const switchText = document.getElementById('switch-text');

// CTA buttons redirect to signup page 
document.addEventListener('DOMContentLoaded', () => {
    const heroSignup = document.getElementById('hero-signup');
    const allCtaButtons = document.querySelectorAll('.cta');
    
    function handleCtaClick(e) {
        e.preventDefault();
        const button = e.currentTarget;
        
        // Add loading state
        button.classList.add('loading');
        button.disabled = true;
        
        // Small delay to show animation before redirecting
        setTimeout(() => {
            window.location.href = 'signup.html';
        }, 500);
    }
    
    // Add click handler to all CTA buttons
    allCtaButtons.forEach(button => {
        button.addEventListener('click', handleCtaClick);
    });
});

// Popup logic
const closePopupBtn = document.getElementById('close-popup');
const popupCtaBtn = document.getElementById('popup-cta');
const popup = document.getElementById('popup');

if (closePopupBtn) closePopupBtn.onclick = closePopup;
if (popupCtaBtn) {
    popupCtaBtn.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'ai-recipes.html';
    };
}
if (popup) {
    popup.onclick = function(e) {
        if (e.target === popup) closePopup();
    };
}

// --- Dynamic Products Section ---
const products = [
    {
        title: 'Fresh Vegetable Salad',
        desc: 'A mix of fresh greens, tomatoes, cucumbers, and carrots. Perfect for a healthy lunch or dinner.',
        price: '$7.99',
        img: 'image/vegetable-salad.avif'
    },
    {
        title: 'Grilled Veggie Platter',
        desc: 'Assorted seasonal vegetables grilled to perfection. High in fiber and flavor.',
        price: '$9.99',
        img: 'image/grilling-veggies.jpg'
    },
    {
        title: 'Tropical Mixed Fruit Bowl',
        desc: 'A refreshing bowl of pineapple, mango, berries, and more. Great for breakfast or snack.',
        price: '$6.49',
        img: 'image/mixedfruit.jpg'
    },
    {
        title: 'Nutritious Power Smoothie',
        desc: 'A blend of spinach, banana, berries, and almond milk. Boost your energy naturally.',
        price: '$5.99',
        img: 'image/nutrition2.webp'
    },
    {
        title: 'Classic African Stew',
        desc: 'A hearty, flavorful stew with local spices and fresh vegetables. A taste of tradition.',
        price: '$11.99',
        img: 'image/African-Cooking.png'
    }
];

function renderProducts() {
    const list = document.getElementById('product-list');
    if (!list) return;
    list.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.img}" alt="${product.title}">
            <div class="product-title">${product.title}</div>
            <div class="product-desc">${product.desc}</div>
            <div class="product-price">${product.price}</div>
            <button class="product-btn" onclick="addToCart('${product.title}')">Add to Cart</button>
        </div>
    `).join('');
}

// Make products array available globally
window.products = products;

// Call renderProducts on DOMContentLoaded
window.addEventListener('DOMContentLoaded', renderProducts);

document.addEventListener('DOMContentLoaded', () => {
    // Authentication state management
    function updateAuthState() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        if (TokenService.isAuthenticated()) {
            // Show authenticated user interface
            headerActions.innerHTML = `
                <div class="user-menu">
                    <button class="user-menu-button">
                        <i class="fas fa-user-circle"></i>
                        <span class="user-email"></span>
                    </button>
                    <div class="user-dropdown">
                        <a href="saved-recipes.html">
                            <i class="fas fa-heart"></i> Saved Recipes
                        </a>
                        <a href="ai-recipes.html">
                            <i class="fas fa-robot"></i> AI Suggestions
                        </a>
                        <button class="logout-button">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            `;

            // Set up user menu interactions
            setupUserMenu();
            
            // Load and display user info
            loadUserInfo();
        } else {
            // Show non-authenticated interface
            headerActions.innerHTML = `
                <a href="login.html" class="auth-button">Sign In</a>
                <a href="signup.html" class="auth-button">Sign Up</a>
            `;
        }
    }

    async function loadUserInfo() {
        try {
            const response = await ApiService.request('/auth/user');
            const userEmail = document.querySelector('.user-email');
            if (userEmail) {
                userEmail.textContent = response.email;
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    }

    function setupUserMenu() {
        const userMenuButton = document.querySelector('.user-menu-button');
        const userDropdown = document.querySelector('.user-dropdown');
        const logoutButton = document.querySelector('.logout-button');

        userMenuButton?.addEventListener('click', () => {
            userDropdown?.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                userDropdown?.classList.remove('show');
            }
        });

        // Handle logout
        logoutButton?.addEventListener('click', async () => {
            try {
                await ApiService.request('/auth/logout', { method: 'POST' });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                TokenService.removeToken();
                window.location.href = '/';
            }
        });
    }

    // Initialize authentication state
    updateAuthState();
});

// Handle navigation menu display
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');    const isHomePage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname.endsWith('/');
    
    if (!isHomePage) {
        nav.classList.add('simplified-nav');
        // Keep only AI Recipes, Sign In, and Sign Up links
        const allowedLinks = ['AI Recipes', 'Sign In', 'Sign Up'];
        const links = nav.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            if (!allowedLinks.includes(link.textContent.trim())) {
                link.style.display = 'none';
            }
        });
    }
});

// Fix navigation menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - headerHeight - 8,
                        behavior: 'smooth'
                    });
                }
            }
            // For external links (like ai-recipes.html), let the default behavior handle it
        });

    });

    // Add specific handler for AI Recipes link
    const aiRecipesLink = document.getElementById('ai-recipes-link');
    if (aiRecipesLink) {
        aiRecipesLink.addEventListener('click', function(e) {
            // Let the default behavior handle the navigation
            // No need to prevent default or add special handling
        });
    }
});

// Add to cart function (used by product cards)
function addToCart(productTitle) {
    const product = products.find(p => p.title === productTitle);
    if (product) {
        cart.addItem(product);
        window.location.href = 'cart.html';
    }
}
window.addToCart = addToCart;

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
      });
    });
  }
});

