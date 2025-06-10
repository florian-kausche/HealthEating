// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.renderCart();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.title === product.title);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        this.saveCart();
        this.renderCart();
    }

    removeItem(title) {
        this.items = this.items.filter(item => item.title !== title);
        this.saveCart();
        this.renderCart();
    }

    updateQuantity(title, quantity) {
        const item = this.items.find(item => item.title === title);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.renderCart();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
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

        if (!cartItems || !cartSummary) return;

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
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <div class="item-quantity">
                        <button onclick="cart.updateQuantity('${item.title}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.title}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-price">${item.price}</div>
                    <button class="remove-item" onclick="cart.removeItem('${item.title}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const subtotal = this.getTotal();
        const shipping = subtotal > 0 ? 5.99 : 0;
        const total = subtotal + shipping;

        cartSummary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>$${shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        `;
    }
}

// Initialize cart
const cart = new Cart();

// Checkout function
function checkout() {
    // For now, just show an alert
    alert('Checkout functionality coming soon!');
}

// Add to cart function (used by product cards)
function addToCart(productTitle) {
    const product = products.find(p => p.title === productTitle);
    if (product) {
        cart.addItem(product);
        window.location.href = 'cart.html';
    }
} 