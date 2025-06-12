document.addEventListener('DOMContentLoaded', function() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;

    // Generate a random order number and set date
    const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('order-date').textContent = orderDate;

    // Get order details from localStorage
    const orderDetails = JSON.parse(localStorage.getItem('orderDetails')) || {};
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Display order items
    const orderItemsContainer = document.getElementById('order-items');
    if (cartItems.length === 0) {
        orderItemsContainer.innerHTML = '<p class="no-items">No items in order</p>';
    } else {
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <img src="${item.img}" alt="${item.title}" class="item-image">
                    <div class="item-info">
                        <strong>${item.title}</strong>
                        <div class="item-meta">
                            <span>Quantity: ${item.quantity}</span>
                            <span class="item-price">$${parseFloat(item.price.replace('$', '')).toFixed(2)} each</span>
                        </div>
                    </div>
                </div>
                <div class="item-total">$${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return sum + (price * item.quantity);
    }, 0);
    const shipping = 5.99; // Fixed shipping cost
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Display totals
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    // Display shipping information
    const shippingInfo = document.getElementById('shipping-info');
    shippingInfo.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <strong>Name:</strong>
                <span>${orderDetails.fullName || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Email:</strong>
                <span>${orderDetails.email || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Phone:</strong>
                <span>${orderDetails.phone || 'N/A'}</span>
            </div>
            <div class="info-item">
                <strong>Address:</strong>
                <span>${orderDetails.address || 'N/A'}</span>
            </div>
        </div>
    `;

    // Display payment information
    const paymentInfo = document.getElementById('payment-info');
    const paymentMethod = orderDetails.paymentMethod || 'N/A';
    let paymentDetails = '';

    switch(paymentMethod) {
        case 'credit-card':
            paymentDetails = `Credit Card (ending in ${orderDetails.cardLast4 || '****'})`;
            break;
        case 'mobile-money':
            paymentDetails = `Mobile Money (${orderDetails.mobileProvider || 'N/A'})`;
            break;
        case 'cash':
            paymentDetails = 'Pay on Delivery';
            break;
        default:
            paymentDetails = 'N/A';
    }

    paymentInfo.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <strong>Payment Method:</strong>
                <span>${paymentDetails}</span>
            </div>
            <div class="info-item">
                <strong>Transaction ID:</strong>
                <span>${orderDetails.transactionId || 'N/A'}</span>
            </div>
        </div>
    `;

    // Handle print receipt
    document.getElementById('print-receipt').addEventListener('click', function() {
        window.print();
    });

    // Handle download PDF
    document.getElementById('download-receipt').addEventListener('click', async function() {
        try {
            const element = document.querySelector('.confirmation-container');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`order-${orderNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    });

    // Clear cart after successful order
    localStorage.removeItem('cartItems');
    localStorage.removeItem('orderDetails');

    // Add animation to status steps
    const statusSteps = document.querySelectorAll('.status-step');
    statusSteps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
        }, index * 1000);
    });
});

// Display order details
function displayOrderDetails() {
    const orderDetails = JSON.parse(localStorage.getItem('orderDetails'));
    const cartItems = JSON.parse(localStorage.getItem('cartItems'));
    
    if (!orderDetails || !cartItems) {
        document.getElementById('order-items').innerHTML = '<p class="no-items">No order details found.</p>';
        return;
    }

    // Generate random order number
    const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Format order date
    const orderDate = new Date(orderDetails.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Display order items
    const orderItemsContainer = document.getElementById('order-items');
    if (cartItems && cartItems.length > 0) {
        orderItemsContainer.innerHTML = cartItems.map(item => `
            <div class="order-item">
                <div class="item-details">
                    <img src="${item.img}" alt="${item.title}" class="item-image">
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <p>${item.desc}</p>
                    </div>
                </div>
                <div class="item-price">
                    <span class="quantity">Qty: ${item.quantity}</span>
                    <span class="price">$${parseFloat(item.price).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    } else {
        orderItemsContainer.innerHTML = '<p class="no-items">No items in this order.</p>';
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 5.99; // Fixed shipping cost
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    // Display totals
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    // Display shipping information
    document.getElementById('shipping-address').textContent = orderDetails.address;

    // Display payment information
    const paymentInfo = document.getElementById('payment-info');
    if (orderDetails.paymentMethod === 'credit-card') {
        paymentInfo.innerHTML = `
            <p><strong>Payment Method:</strong> Credit Card</p>
            <p><strong>Card Number:</strong> **** **** **** ${orderDetails.cardLast4}</p>
        `;
    } else if (orderDetails.paymentMethod === 'mobile-money') {
        paymentInfo.innerHTML = `
            <p><strong>Payment Method:</strong> Mobile Money</p>
            <p><strong>Provider:</strong> ${orderDetails.mobileProvider}</p>
        `;
    }

    // Display order number and date
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('order-date').textContent = orderDate;
    document.getElementById('transaction-id').textContent = orderDetails.transactionId;

    // Animate status steps
    animateStatusSteps();
} 