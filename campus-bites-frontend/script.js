document.addEventListener('DOMContentLoaded', async () => {
    // Static menu items. These will be loaded first.
    const staticFoodItems = [
        { id: '1', name: 'Pazhampori', price: 14, image: 'pazhampori.jpg', category: 'Snacks' },
        { id: '2', name: 'Vettu Cake', price: 15, image: 'vettu-cake.jpg', category: 'Snacks' },
        { id: '3', name: 'Pathiri', price: 12, image: 'pathiri.jpg', category: 'South Indian' },
        { id: '4', name: 'Kozhukkata', price: 20, image: 'kozhukkata.jpg', category: 'Snacks' },
        { id: '5', name: 'Ada', price: 20, image: 'ada.jpg', category: 'Snacks' },
        { id: '6', name: 'Veg Roll', price: 30, image: 'veg-roll.jpg', category: 'Snacks' },
        { id: '7', name: 'Vada', price: 12, image: 'vada.jpg', category: 'Snacks' },
        { id: '8', name: 'Cream Bun', price: 25, image: 'cream-bun.jpg', category: 'Snacks' },
        { id: '9', name: 'Donut', price: 30, image: 'donut.jpg', category: 'Snacks' },
        { id: '10', name: 'Pink Donut', price: 30, image: 'pink-donut.jpg', category: 'Snacks' },
        { id: '11', name: 'Maggi Noodles', price: 50, image: 'maggi.jpg', category: 'Snacks' },
        { id: '12', name: 'Masala Dosa', price: 90, image: 'masala-dosa.jpg', category: 'South Indian' },
        { id: '13', name: 'Samosa', price: 25, image: 'samosa.jpg', category: 'Snacks' },
        { id: '14', name: 'Veg Sandwich', price: 60, image: 'veg-sandwich.jpg', category: 'Snacks' },
        { id: '15', name: 'Coffee', price: 14, image: 'coffee.jpg', category: 'Beverages' },
        { id: '16', name: 'Tea', price: 14, image: 'tea.jpg', category: 'Beverages' },
        { id: '17', name: 'Cold Coffee', price: 40, image: 'cold-coffee.jpg', category: 'Beverages' },
        { id: '18', name: 'Boost', price: 20, image: 'boost.jpg', category: 'Beverages' },
    ];

    let allFoodItems = [];
    let cart = {};
    let dailySpecialItem = null;

    // DOM Elements
    const loginModal = document.getElementById('login-modal');
    const userLoginForm = document.getElementById('user-login-form');
    const adminLoginForm = document.getElementById('admin-login-form');
    const showAdminLoginBtn = document.getElementById('show-admin-login');
    const showUserLoginBtn = document.getElementById('show-user-login');
    const searchBar = document.querySelector('.search-bar');
    const foodGrid = document.getElementById('food-grid');
    const cartIconContainer = document.querySelector('.cart-icon-container');
    const cartCountSpan = document.querySelector('.cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const closeButtons = document.querySelectorAll('.close-button');
    const checkoutButton = document.getElementById('checkout-button');
    const checkoutPageModal = document.getElementById('checkout-page-modal');
    const orderConfirmedPageModal = document.getElementById('order-confirmed-page-modal');
    const backToMenuButton = document.querySelector('.back-to-menu-button');
    const checkoutBar = document.getElementById('checkout-bar');
    const tabs = document.querySelectorAll('.tab-button');
    const dailySpecialBanner = document.getElementById('daily-special-banner');
    // Add this to your DOM Elements section
    const orderTrackingModal = document.getElementById('order-tracking-modal');
    const trackOrderId = document.getElementById('track-order-id');
    const trackingSteps = document.querySelectorAll('.tracking-steps .step');
    
    // Check for Razorpay key in .env or hardcode if not available
    const razorpayKey = 'rzp_test_0eyJw3lqLbAHb9'; 
    const payWithRazorpayButton = document.getElementById('pay-and-place-order');

    // Check login status on page load
    const userRole = localStorage.getItem('role');
    if (userRole === 'user') {
        loginModal.style.display = 'none';
        initializePage();
    } else if (userRole === 'admin') {
        window.location.href = 'admin.html';
    } else {
        loginModal.style.display = 'block';
    }

    // Login event listeners
    userLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('user-phone').value;
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        const data = await response.json();
        if (data.role === 'user') {
            localStorage.setItem('role', 'user');
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userPhone', phoneNumber);
            loginModal.style.display = 'none';
            await initializePage();
        } else {
            alert('Login failed. Please try again.');
        }
    });

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.role === 'admin') {
            localStorage.setItem('role', 'admin');
            window.location.href = 'admin.html'; // Redirect to admin page
        } else {
            alert('Admin login failed. Invalid credentials.');
        }
    });

    showAdminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        userLoginForm.style.display = 'none';
        adminLoginForm.style.display = 'block';
    });

    showUserLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        adminLoginForm.style.display = 'none';
        userLoginForm.style.display = 'block';
    });

    async function initializePage() {
        try {
            const response = await fetch('http://localhost:5000/api/food-items');
            const dbItems = await response.json();
            
            allFoodItems = [...staticFoodItems, ...dbItems];
            
            // Re-map IDs for dynamic items to avoid conflicts with static items
            const newIdStart = staticFoodItems.length + 1;
            allFoodItems = allFoodItems.map((item, index) => ({
                ...item,
                id: item._id || item.id || (newIdStart + index).toString()
            }));
            
            dailySpecialItem = allFoodItems.find(item => item.isDailySpecial);
            if (dailySpecialItem && !dailySpecialItem.isSoldOut) {
                dailySpecialBanner.style.display = 'flex';
                document.getElementById('daily-special-text').textContent = `Today's Special: ${dailySpecialItem.name}!`;
            } else {
                dailySpecialBanner.style.display = 'none';
            }

            renderFoodItems();
        } catch (err) {
            console.error('Failed to fetch food items:', err);
            allFoodItems = staticFoodItems;
            renderFoodItems();
        }
    }

    // Render food items
    function renderFoodItems(category = 'All', searchTerm = '') {
        let filteredItems = category === 'All' ? allFoodItems : allFoodItems.filter(item => item.category === category);
        
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        foodGrid.innerHTML = '';
        filteredItems.forEach(item => {
            const foodCard = document.createElement('div');
            foodCard.classList.add('food-card');
            foodCard.dataset.id = item.id;
            if (item.isSoldOut) {
                foodCard.classList.add('sold-out');
            }
            foodCard.innerHTML = `
                <img src="images/${item.image}" alt="${item.name}" class="food-image">
                <div class="food-info">
                    <div class="food-details">
                        <h3 class="food-name">${item.name}</h3>
                        <p class="food-price">₹ ${item.price}</p>
                    </div>
                    <button class="add-button" data-id="${item.id}" ${item.isSoldOut ? 'disabled' : ''}>+ Add</button>
                </div>
            `;
            foodGrid.appendChild(foodCard);
        });
    }

    // Add item to cart
    function addItemToCart(itemId) {
        const item = allFoodItems.find(i => i.id === itemId);
        if (item && !item.isSoldOut) {
            if (cart[itemId]) {
                cart[itemId].quantity++;
            } else {
                cart[itemId] = { ...item, quantity: 1 };
            }
            updateCartUI();
        }
    }
    
    // Remove item from cart (decrements quantity)
    function removeItemFromCart(itemId) {
        if (cart[itemId]) {
            cart[itemId].quantity--;
            if (cart[itemId].quantity <= 0) {
                delete cart[itemId];
            }
            updateCartUI();
        }
    }

    // Update cart UI
    function updateCartUI() {
        const subtotalPriceSpan = document.getElementById('subtotal-price');
        const checkoutText = document.getElementById('checkout-text');
        
        let totalItems = 0;
        let subtotal = 0;

        cartItemsContainer.innerHTML = '';

        for (const itemId in cart) {
            const item = cart[itemId];
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name} ₹ ${item.price} x ${item.quantity}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-from-cart" data-id="${itemId}">-</button>
                    <button class="add-to-cart" data-id="${itemId}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        }

        if (totalItems > 0) {
            cartCountSpan.textContent = totalItems;
            cartCountSpan.style.display = 'inline';
            checkoutBar.style.display = 'flex';
            checkoutText.textContent = `Checkout - ${totalItems} item${totalItems > 1 ? 's' : ''} • ₹ ${subtotal}`;
        } else {
            cartCountSpan.textContent = '0';
            cartCountSpan.style.display = 'none';
            checkoutBar.style.display = 'none';
            cartItemsContainer.innerHTML = '<p>Your cart is empty. Add something tasty!</p>';
        }

        subtotalPriceSpan.textContent = `₹ ${subtotal}`;
        document.getElementById('total-price').textContent = `₹ ${subtotal}`;
        document.getElementById('pay-button-amount').textContent = `₹ ${subtotal}`;
    }

    // Event Listeners
    foodGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-button')) {
            const itemId = e.target.dataset.id;
            addItemToCart(itemId);
        }
    });
    
    // Listener for plus and minus buttons in the cart modal
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const itemId = e.target.dataset.id;
            addItemToCart(itemId);
        } else if (e.target.classList.contains('remove-from-cart')) {
            const itemId = e.target.dataset.id;
            removeItemFromCart(itemId);
        }
    });

    dailySpecialBanner.addEventListener('click', () => {
        if (dailySpecialItem) {
            const specialCard = document.querySelector(`.food-card[data-id="${dailySpecialItem.id}"]`);
            if (specialCard) {
                specialCard.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Search bar event listener
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const activeTab = document.querySelector('.tab-button.active').textContent;
        renderFoodItems(activeTab, searchTerm);
    });

    cartIconContainer.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    checkoutBar.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    checkoutButton.addEventListener('click', () => {
        if (Object.keys(cart).length === 0) {
            alert('Your cart is empty!');
            return;
        }
        cartModal.style.display = 'none';
        checkoutPageModal.style.display = 'block';
        updateOrderSummary();
    });

    // Razorpay Integration
    payWithRazorpayButton.addEventListener('click', async (e) => {
        e.preventDefault(); 

        const name = document.querySelector('#checkout-form input[placeholder="Your name"]').value;
        const rollNumber = document.querySelector('#checkout-form input[placeholder="Roll number"]').value;
        const pickupTime = document.querySelector('#checkout-form input[placeholder="Preferred pickup time (e.g. 1:15 PM)"]').value;

        let totalAmount = 0;
        for (const itemId in cart) {
            const item = cart[itemId];
            totalAmount += item.price * item.quantity;
        }

        const amountInPaise = totalAmount * 100;

        try {
            const backendResponse = await fetch('http://localhost:5000/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: amountInPaise,
                    items: Object.values(cart),
                    userId: localStorage.getItem('userId')
                }),
            });

            const orderData = await backendResponse.json();
            const orderId = orderData.order_id;
            
            const options = {
                "key": razorpayKey,
                "amount": amountInPaise,
                "currency": "INR",
                "name": "Campus Bites",
                "description": "Canteen Order",
                "order_id": orderId,
                "handler": function (paymentResponse) {
                    alert("Payment Successful! Order Confirmed.");
                    
                    checkoutPageModal.style.display = 'none';
                    orderConfirmedPageModal.style.display = 'block';
                    document.querySelector('.order-placed-notification').style.display = 'block';
                    
                    document.getElementById('confirmation-message').innerHTML = `Thanks ${name}, your order ${orderId} is received. Please head to the canteen pickup counter.`;
                    document.getElementById('notification-message').innerHTML = `Thanks ${name}. Your order ${orderId} is being prepared.`;
                    
                    // Add a "Track My Order" button
                    const trackButton = document.createElement('button');
                    trackButton.textContent = 'Track My Order';
                    trackButton.classList.add('back-to-menu-button'); 
                    trackButton.id = 'track-order-button';
                    orderConfirmedPageModal.querySelector('.modal-content').appendChild(trackButton);

                    trackButton.addEventListener('click', () => {
                        orderConfirmedPageModal.style.display = 'none';
                        trackOrderId.textContent = orderId;
                        orderTrackingModal.style.display = 'block';
                        trackOrderStatus(orderId);
                    });

                    cart = {};
                    updateCartUI();
                },
                "prefill": {
                    "name": name,
                    "email": "test@example.com", 
                    "contact": localStorage.getItem('userPhone')
                },
                "theme": {
                    "color": "#8A2BE2"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error('Payment process failed:', error);
            alert('Payment failed. Please try again.');
        }
    });

    backToMenuButton.addEventListener('click', () => {
        orderConfirmedPageModal.style.display = 'none';
        document.querySelector('.order-placed-notification').style.display = 'none';
        cart = {};
        updateCartUI();
        renderFoodItems();
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.textContent;
            renderFoodItems(category);
        });
    });

    function updateOrderSummary() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        orderSummaryItems.innerHTML = '';
        for (const itemId in cart) {
            const item = cart[itemId];
            const div = document.createElement('div');
            div.innerHTML = `<p>${item.name} × ${item.quantity}</p>`;
            orderSummaryItems.appendChild(div);
        }
    }
    // Add the new trackOrderStatus function here
    async function trackOrderStatus(orderId) {
        // This function will be called on a timer to fetch the latest status
        const updateUI = (status) => {
            const statuses = ['Received', 'Preparing', 'Ready', 'Completed'];
            const currentStepIndex = statuses.indexOf(status);
            trackingSteps.forEach((step, index) => {
                if (index <= currentStepIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/order-status/${orderId}`);
                const order = await response.json();
                if (order && order.status) {
                    updateUI(order.status);
                    if (order.status === 'Ready' || order.status === 'Completed') {
                        clearInterval(interval);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order status:', error);
            }
        }, 5000); // Poll every 5 seconds
    }

}); // The final closing bracket of the DOMContentLoaded event listener.The issue is in the payment button it is still showing payment failed when I am trying to make a payment can you fix it please.