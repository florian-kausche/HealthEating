// DOM Elements
const loaderOverlay = document.getElementById('loader-overlay');
const contentWrapper = document.getElementById('content-wrapper');
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const signInBtn = document.getElementById('sign-in-btn');
const signUpBtn = document.getElementById('sign-up-btn');
const heroSignupBtn = document.getElementById('hero-signup');
const popup = document.getElementById('popup');
const closePopupBtn = document.getElementById('close-popup-btn');
const popupCta = document.getElementById('popup-cta');
const recipeSearchForm = document.getElementById('recipe-search-form');
const recipeSearchInput = document.getElementById('recipe-search-input');
const dietFilter = document.getElementById('diet-filter');
const mealTypeFilter = document.getElementById('meal-type-filter');
const cuisineFilter = document.getElementById('cuisine-filter');
const timeFilter = document.getElementById('time-filter');
const productList = document.getElementById('product-list');

// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        loaderOverlay.style.display = 'none';
        contentWrapper.classList.remove('no-scroll');
    }, 2000);
});

// Mobile Navigation
hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Authentication State
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        signInBtn.style.display = 'none';
        signUpBtn.style.display = 'none';
        // Add user profile button or other authenticated state UI
    }
}

// Initialize auth state
checkAuthState();

// Popup Management
function showPopup() {
    popup.classList.add('active');
}

function hidePopup() {
    popup.classList.remove('active');
}

// Show popup after 5 seconds
setTimeout(showPopup, 5000);

closePopupBtn.addEventListener('click', hidePopup);
popupCta.addEventListener('click', () => {
    hidePopup();
    window.location.href = 'ai-recipes.html';
});

// Recipe Search
recipeSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchQuery = recipeSearchInput.value.trim();
    const diet = dietFilter.value;
    const mealType = mealTypeFilter.value;
    const cuisine = cuisineFilter.value;
    const maxTime = timeFilter.value;

    if (searchQuery) {
        // Store search parameters in localStorage
        localStorage.setItem('recipeSearchParams', JSON.stringify({
            query: searchQuery,
            diet,
            mealType,
            cuisine,
            maxTime
        }));
        
        // Redirect to AI recipes page
        window.location.href = 'ai-recipes.html';
    }
});

// Featured Products
const featuredProducts = [
    {
        name: 'Organic Quinoa',
        price: 12.99,
        image: 'image/quinoa.jpg',
        description: 'High-protein ancient grain'
    },
    {
        name: 'Extra Virgin Olive Oil',
        price: 15.99,
        image: 'image/olive-oil.jpg',
        description: 'Cold-pressed premium quality'
    },
    {
        name: 'Mixed Nuts',
        price: 9.99,
        image: 'image/nuts.jpg',
        description: 'Raw, unsalted variety pack'
    }
];

function displayProducts() {
    productList.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="price">$${product.price}</span>
            <button class="add-to-cart">Add to Cart</button>
        </div>
    `).join('');
}

// Initialize products display
displayProducts(); 