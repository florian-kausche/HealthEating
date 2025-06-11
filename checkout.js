// Initialize checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load cart items and update summary
    loadCartItems();
    updateSummary();

    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            const paymentType = method.dataset.method;
            showPaymentForm(paymentType);
        });
    });

    // Handle credit card input formatting
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', formatCardNumber);
    }

    const expiry = document.getElementById('expiry');
    if (expiry) {
        expiry.addEventListener('input', formatExpiry);
    }

    // Handle form submission
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handleOrderSubmission);
    }
});

// Load cart items into checkout page
function loadCartItems() {
    const checkoutItems = document.getElementById('checkout-items');
    if (!checkoutItems) return;

    const cart = new Cart();
    if (cart.items.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="index.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        return;
    }

    checkoutItems.innerHTML = cart.items.map(item => `
        <div class="checkout-item">
            <img src="${item.img}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">${item.price}</div>
        </div>
    `).join('');
}

// Update order summary totals
function updateSummary() {
    const cart = new Cart();
    const subtotal = cart.getTotal();
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Show selected payment form
function showPaymentForm(paymentType) {
    const forms = document.querySelectorAll('.payment-form');
    forms.forEach(form => form.style.display = 'none');

    const selectedForm = document.getElementById(`${paymentType}-form`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
    }
}

// Format credit card number with spaces
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    input.value = value;
}

// Format expiry date
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    input.value = value;
}

// Handle order submission
async function handleOrderSubmission(e) {
    e.preventDefault();

    // Get selected payment method
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        alert('Please select a payment method');
        return;
    }

    // Validate shipping form
    const shippingForm = document.getElementById('shipping-form');
    if (!shippingForm.checkValidity()) {
        shippingForm.reportValidity();
        return;
    }

    // Validate payment details based on selected method
    const paymentType = selectedPayment.value;
    if (!validatePaymentDetails(paymentType)) {
        return;
    }

    // Disable submit button and show loading state
    const submitBtn = document.getElementById('place-order-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear cart
        const cart = new Cart();
        cart.items = [];
        cart.saveCart();

        // Show success message and redirect
        alert('Order placed successfully! Thank you for your purchase.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error placing order:', error);
        alert('There was an error processing your order. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}

// Validate payment details based on selected method
function validatePaymentDetails(paymentType) {
    switch (paymentType) {
        case 'credit-card':
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;

            if (cardNumber.length !== 16) {
                alert('Please enter a valid 16-digit card number');
                return false;
            }
            if (!expiry.match(/^\d{2}\/\d{2}$/)) {
                alert('Please enter a valid expiry date (MM/YY)');
                return false;
            }
            if (cvv.length !== 3) {
                alert('Please enter a valid 3-digit CVV');
                return false;
            }
            break;

        case 'mobile-money':
            const mobileNumber = document.getElementById('mobile-number').value;
            if (!mobileNumber) {
                alert('Please enter your mobile money number');
                return false;
            }
            break;

        case 'cash':
            // No additional validation needed for cash on delivery
            break;
    }
    return true;
} 