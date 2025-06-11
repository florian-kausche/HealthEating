// Cart functionality
class Cart {
    constructor() {
        this.items = [];
        this.isLoading = false;
        this.error = null;
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.loadCart();
            this.renderCart();
        } catch (error) {
            this.handleError('Failed to initialize cart');
        } finally {
            this.hideLoading();
        }
    }

    async loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            this.items = savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    showLoading() {
        this.isLoading = true;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        this.isLoading = false;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    showError(message) {
        this.error = message;
        const errorElement = document.getElementById('cart-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
                this.error = null;
            }, 3000);
        }
    }

    handleError(message) {
        console.error(message);
        this.showError(message);
    }

    async addItem(product) {
        try {
            this.showLoading();
            const existingItem = this.items.find(item => item.title === product.title);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    ...product,
                    quantity: 1
                });
            }

            await this.saveCart();
            this.renderCart();
        } catch (error) {
            this.handleError('Failed to add item to cart');
        } finally {
            this.hideLoading();
        }
    }

    async removeItem(title) {
        try {
            this.showLoading();
            this.items = this.items.filter(item => item.title !== title);
            await this.saveCart();
            this.renderCart();
        } catch (error) {
            this.handleError('Failed to remove item from cart');
        } finally {
            this.hideLoading();
        }
    }

    async updateQuantity(title, quantity) {
        try {
            this.showLoading();
            const item = this.items.find(item => item.title === title);
            if (item) {
                item.quantity = Math.max(1, quantity);
                await this.saveCart();
                this.renderCart();
            }
        } catch (error) {
            this.handleError('Failed to update item quantity');
        } finally {
            this.hideLoading();
        }
    }

    async clearCart() {
        try {
            this.showLoading();
            this.items = [];
            await this.saveCart();
            this.renderCart();
        } catch (error) {
            this.handleError('Failed to clear cart');
        } finally {
            this.hideLoading();
        }
    }

    async saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            throw new Error('Failed to save cart to storage');
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return total + (price * item.quantity);
        }, 0);
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const checkoutBtn = document.getElementById('checkout-btn');
        const clearCartBtn = document.getElementById('clear-cart-btn');

        if (!cartItems || !cartSummary) return;

        // Update checkout button state
        if (checkoutBtn) {
            checkoutBtn.style.display = this.items.length > 0 ? 'flex' : 'none';
        }

        // Update clear cart button state
        if (clearCartBtn) {
            clearCartBtn.style.display = this.items.length > 0 ? 'flex' : 'none';
        }

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="index.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            cartSummary.innerHTML = '';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-title="${item.title}">
                <img src="${item.img}" alt="${item.title}" onerror="this.src='image/placeholder.jpg'">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <div class="item-quantity">
                        <button class="quantity-btn" onclick="window.cart.updateQuantity('${item.title}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.cart.updateQuantity('${item.title}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-price">${item.price}</div>
                    <button class="remove-item" onclick="window.cart.removeItem('${item.title}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const subtotal = this.getTotal();
        const shipping = subtotal > 0 ? 5.99 : 0;
        const total = subtotal + shipping;

        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-content">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
            <div class="summary-actions">
                <a href="checkout.html" class="checkout-btn" id="checkout-btn">
                    <i class="fas fa-lock"></i>
                    Proceed to Checkout
                </a>
                <button class="clear-cart-btn" id="clear-cart-btn" onclick="window.cart.clearCart()">
                    <i class="fas fa-trash"></i>
                    Clear Cart
                </button>
            </div>
        `;
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make Cart class available globally
    window.Cart = Cart;
    
    // Initialize cart only if not already initialized
    if (!window.cart) {
        window.cart = new Cart();
    }

    // Add to cart function (used by product cards)
    window.addToCart = async function(productTitle) {
        const product = window.products.find(p => p.title === productTitle);
        if (product) {
            await window.cart.addItem(product);
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 100);
        }
    };
}); 