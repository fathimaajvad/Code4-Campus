// This is the full, updated script.js file.
// Please replace your entire current script.js content with this code.

// Global cart object
let cart = {};

// Function to save the cart to the server
async function saveCartToServer() {
  const userId = localStorage.getItem('userId');
  if (!userId) return; // Don't save if the user isn't logged in

  try {
    const response = await fetch(`${window.API_URL}/api/save-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cart: cart })
    });
    if (!response.ok) {
      console.error('Failed to save cart to server.');
    }
  } catch (error) {
    console.error('Error saving cart to server:', error);
  }
}

// Function to load the cart from the server
async function loadCartFromServer() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    // If not logged in, clear cart to start fresh
    cart = {};
    return;
  }

  try {
    const response = await fetch(`${window.API_URL}/api/load-cart/${userId}`);
    if (response.ok) {
      const serverCart = await response.json();
      if (serverCart && Object.keys(serverCart).length > 0) {
        cart = serverCart;
        console.log('Cart loaded from server successfully.');
      } else {
        console.log('No cart found on server, starting with empty cart.');
        cart = {};
      }
    } else {
      console.error('Failed to load cart from server.');
      cart = {};
    }
  } catch (error) {
    console.error('Error loading cart from server:', error);
    cart = {};
  }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Replaced alert with a simple console log for a better user experience within the environment.
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            console.log('Screenshots are not allowed on this page.');
        }
    });

    const staticFoodItems = [
        { name: 'Pazhampori', price: 14, image: 'pazhampori.jpg', category: 'Snacks' },
        { name: 'Vettu Cake', price: 15, image: 'vettu-cake.jpg', category: 'Snacks' },
        { name: 'Pathiri', price: 12, image: 'pathiri.jpg', category: 'Snacks' },
        { name: 'Kozhukkata', price: 20, image: 'kozhukkata.jpg', category: 'Snacks' },
        { name: 'Ada', price: 20, image: 'ada.jpg', category: 'Snacks' },
        { name: 'Veg Roll', price: 30, image: 'veg-roll.jpg', category: 'Snacks' },
        { name: 'Vada', price: 12, image: 'vada.jpg', category: 'Snacks' },
        { name: 'Cream Bun', price: 25, image: 'cream-bun.jpg', category: 'Snacks' },
        { name: 'Donut', price: 30, image: 'donut.jpg', category: 'Snacks' },
        { name: 'Pink Donut', price: 30, image: 'pink-donut.jpg', category: 'Snacks' },
        { name: 'Maggi Noodles', price: 50, image: 'maggi.jpg', category: 'Snacks' },
        { name: 'Masala Dosa', price: 90, image: 'masala-dosa.jpg', category: 'Snacks' },
        { name: 'Samosa', price: 25, image: 'samosa.jpg', category: 'Snacks' },
        { name: 'Veg Sandwich', price: 60, image: 'veg-sandwich.jpg', category: 'Snacks' },
        { name: 'Coffee', price: 14, image: 'coffee.jpg', category: 'Beverages' },
        { name: 'Tea', price: 14, image: 'tea.jpg', category: 'Beverages' },
        { name: 'Cold Coffee', price: 40, image: 'cold-coffee.jpg', category: 'Cold Beverages' },
        { name: 'Boost', price: 20, image: 'boost.jpg', category: 'Beverages' },
        { name: 'Orange Juice', price: 30, image: 'orange-juice.jpg', category: 'Juice' },
        { name: 'Mango Juice', price: 35, image: 'mango-juice.jpg', category: 'Juice' },
        { name: 'Watermelon Fresh Juice', price: 40, image: 'watermelon-fresh-juice.jpg', category: 'Fresh Juice' },
        { name: 'Strawberry Shake', price: 50, image: 'strawberry-shake.jpg', category: 'Shake' },
        { name: 'Chocolate Shake', price: 55, image: 'chocolate-shake.jpg', category: 'Shake' },
        { name: 'Porotta', price: 10, image: 'porotta.jpg', category: 'Staples' },
        { name: 'Butter Naan', price: 20, image: 'butter-naan.jpg', category: 'Staples' },
        { name: 'Bhatura', price: 20, image: 'bhatura.jpg', category: 'Staples' },
        { name: 'Paneer Butter Masala', price: 100, image: 'paneer-butter-masala.jpg', category: 'Curries' },
        
        // ADDED ITEM TO 'Meals' CATEGORY
        { name: 'Chicken Biryani', price: 150, image: 'biryani.jpg', category: 'Meals' },
    ];

    let allFoodItems = [];
    let dailySpecialItems = [];
    let orderTrackingInterval = null;
    let orderReadyCheckInterval = null;
    let isReadyPopupShown = false;

    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const userLoginForm = document.getElementById('user-login-form');
    const adminLoginForm = document.getElementById('admin-login-form');
    const signupForm = document.getElementById('signup-form');
    const showAdminLoginBtn = document.getElementById('show-admin-login');
    const showUserLoginBtn = document.getElementById('show-user-login');
    const showSignupBtn = document.getElementById('show-signup');
    const logoutLink = document.getElementById('logout-link');
    const myProfileLink = document.getElementById('my-profile-link');
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    const profileIcon = document.getElementById('profile-icon');
    
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
    const orderReadyModal = document.getElementById('order-ready-modal');
    const backToMenuButton = document.querySelector('.back-to-menu-button');
    const checkoutBar = document.getElementById('checkout-bar');
    const tabs = document.querySelectorAll('.tab-button');
    const dailySpecialBanner = document.getElementById('daily-special-banner');
    const bannerImageContainer = dailySpecialBanner ? dailySpecialBanner.querySelector('.banner-image-container') : null;
    const orderTrackingModal = document.getElementById('order-tracking-modal');
    const trackOrderIdElement = document.getElementById('track-order-id');
    const trackOrderTokenElement = document.getElementById('track-order-token');
    const trackingSteps = document.querySelectorAll('.tracking-steps .step');
    const trackOrderIcon = document.getElementById('track-order-icon');
    const receiptIcon = document.getElementById('receipt-icon');
    const receiptModal = document.getElementById('receipt-modal');
    const singleReceiptModal = document.getElementById('single-receipt-modal');
    const receiptsList = document.getElementById('receipts-list');
    const qrCodeContainerConfirm = document.getElementById('qr-code-container-confirm');
    const qrModal = document.getElementById('qr-modal');
    const receiptQrCodeContainer = document.getElementById('receipt-qr-code-container');
    
    const razorpayKey = 'rzp_test_0eyJw3lqLbAHb9';
    const payWithRazorpayButton = document.getElementById('pay-and-place-order');

    let currentTrackableOrderId = null;
    let currentUserData = null;
    let currentTrackableOrderToken = null;
    
    // --- Admin Dashboard Specific Elements ---
    const liveOrdersList = document.getElementById('live-orders-list');
    const liveOrdersContent = document.getElementById('live-orders-content');
    const readyOrdersList = document.getElementById('ready-orders-list');
    const readyOrdersContent = document.getElementById('ready-orders-content');
    const toggleLiveOrdersBtn = document.getElementById('toggle-live-orders');
    const toggleReadyOrdersBtn = document.getElementById('toggle-ready-orders');
    const orderCategories = ["Meals", "Curries", "Staples", "Cold Beverages", "Juice", "Fresh Juice", "Shake"];
    const qrCodeInput = document.getElementById('qr-code-input');
    const scanQrButton = document.getElementById('scan-qr-button');
    const scanResultDiv = document.getElementById('scan-result');
    const billModal = document.getElementById('bill-modal');
    const billDetailsDiv = document.getElementById('bill-details');
    const greatThanksButton = document.getElementById('great-thanks-button');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    // NEW: Admin Dashboard collapsible elements
    const toggleScannerBtn = document.getElementById('toggle-scanner');
    const toggleMenuBtn = document.getElementById('toggle-menu');
    const menuContent = document.getElementById('menu-content');
    const scannerContent = document.getElementById('scanner-content');

    // Check if the current page is the admin dashboard
    const userRole = localStorage.getItem('role');

    if (window.location.pathname.includes('admin.html')) {
        if (userRole !== 'admin') {
            window.location.replace('index.html');
            return;
        }
        initializeAdminDashboard();
    } else {
        if (userRole === 'user') {
            loginModal.style.display = 'none';
            receiptIcon.style.display = 'flex';
            profileIcon.style.display = 'flex';
            await loadUserProfile();
            await loadCartFromServer(); // Load the cart from the database
            initializePage();
        } else if (userRole === 'admin') {
            window.location.href = 'admin.html';
        } else {
            loginModal.style.display = 'block';
        }
    }
    
    // --- Shared Functions ---
    let bannerImageInterval = null;
    let currentSpecialImageIndex = 0;

    async function initializePage() {
        try {
            const response = await fetch(`${window.API_URL}/api/food-items`);
            allFoodItems = await response.json();
            
            if (allFoodItems.length === 0) {
                for (const item of staticFoodItems) {
                    await fetch(`${window.API_URL}/api/add-item`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item),
                    });
                }
                const newResponse = await fetch(`${window.API_URL}/api/food-items`);
                allFoodItems = await newResponse.json();
            }
            
            dailySpecialItems = allFoodItems.filter(item => item.isDailySpecial);
            if (dailySpecialItems.length > 0) {
                dailySpecialBanner.style.display = 'flex';
                const specialNames = dailySpecialItems.map(item => item.name).join(', ');
                document.getElementById('daily-special-text').textContent = specialNames;
                
                if (bannerImageContainer) {
                    bannerImageContainer.innerHTML = '';
                    dailySpecialItems.forEach((item, index) => {
                        const img = document.createElement('img');
                        img.src = `images/${item.image}`;
                        img.alt = item.name;
                        img.classList.add('special-banner-image');
                        if (index === 0) {
                            img.classList.add('active');
                        }
                        bannerImageContainer.appendChild(img);
                    });
                }
                
                if (dailySpecialItems.length > 1) {
                    startBannerCarousel();
                } else if (dailySpecialItems.length === 1) {
                    const firstImage = bannerImageContainer.querySelector('.special-banner-image');
                    if (firstImage) {
                        firstImage.classList.add('active');
                    }
                }
                
            } else {
                dailySpecialBanner.style.display = 'none';
                if (bannerImageInterval) clearInterval(bannerImageInterval);
            }

            renderFoodItems();
            updateCartUI(); // Update UI after loading the cart
            await updateTrackOrderBanner();
            startOrderReadyPolling();
        } catch (err) {
            console.log(err);
            console.error('Failed to initialize page:', err);
        }
    }

    function startBannerCarousel() {
        if (bannerImageInterval) clearInterval(bannerImageInterval);

        const images = bannerImageContainer.querySelectorAll('.special-banner-image');
        if (images.length < 2) return;

        bannerImageInterval = setInterval(() => {
            images[currentSpecialImageIndex].classList.remove('active');
            currentSpecialImageIndex = (currentSpecialImageIndex + 1) % images.length;
            images[currentSpecialImageIndex].classList.add('active');
        }, 3000); // Change image every 3 seconds
    }

    function renderFoodItems(category = 'All', searchTerm = '') {
        let filteredItems = category === 'All' ? allFoodItems : allFoodItems.filter(item => item.category === category);
        
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        foodGrid.innerHTML = '';
        if (filteredItems.length === 0) {
            foodGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No items found in this category.</p>';
            return;
        }

        filteredItems.forEach(item => {
            const foodCard = document.createElement('div');
            foodCard.classList.add('food-card');
            foodCard.dataset.id = item._id;
            if (item.isSoldOut) {
                foodCard.classList.add('sold-out');
            }
            
            const cartQuantity = cart[item._id] ? cart[item._id].quantity : 0;
            
            foodCard.innerHTML = `
                <img src="images/${item.image}" alt="${item.name}" class="food-image">
                <div class="food-info">
                    <div class="food-details">
                        <h3 class="food-name">${item.name}</h3>
                        <p class="food-price">₹ ${item.price}</p>
                    </div>
                </div>
                ${cartQuantity === 0 ? `
                    <button class="add-button" data-id="${item._id}" ${item.isSoldOut ? 'disabled' : ''}>+ Add</button>
                ` : `
                    <div class="quantity-selector">
                        <button class="remove-from-cart" data-id="${item._id}">-</button>
                        <span class="item-quantity">${cartQuantity}</span>
                        <button class="add-to-cart" data-id="${item._id}">+</button>
                    </div>
                `}
            `;
            foodGrid.appendChild(foodCard);
        });
    }

    function addItemToCart(itemId) {
        const item = allFoodItems.find(i => i._id === itemId);
        if (item && !item.isSoldOut) {
            if (cart[itemId]) {
                cart[itemId].quantity++;
            } else {
                cart[itemId] = { ...item, quantity: 1 };
            }
            updateCartUI();
            saveCartToServer(); // Save the updated cart to the server
            renderFoodItems(document.querySelector('.tab-button.active').dataset.category, searchBar.value);
        }
    }
    
    function removeItemFromCart(itemId) {
        if (cart[itemId]) {
            cart[itemId].quantity--;
            if (cart[itemId].quantity <= 0) {
                delete cart[itemId];
            }
            updateCartUI();
            saveCartToServer(); // Save the updated cart to the server
            renderFoodItems(document.querySelector('.tab-button.active').dataset.category, searchBar.value);
        }
    }

    function updateCartUI() {
        const subtotalPriceSpan = document.getElementById('subtotal-price');
        const checkoutText = document.getElementById('checkout-text');
        
        let totalItems = 0;
        let subtotal = 0;

        cartItemsContainer.innerHTML = '';

        if (Object.keys(cart).length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty. Add something tasty!</p>';
        }

        for (const itemId in cart) {
            const item = cart[itemId];
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name} ₹ ${item.price}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-from-cart" data-id="${itemId}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
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
        }

        subtotalPriceSpan.textContent = `₹ ${subtotal}`;
        document.getElementById('total-price').textContent = `₹ ${subtotal}`;
        document.getElementById('pay-button-amount').textContent = `₹ ${subtotal}`;
    }

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
    
    function showReceiptPopUp(order) {
        const receiptContent = document.getElementById('receipt-pop-up-content');
        receiptContent.innerHTML = `
            <h3>Campus Bites</h3>
            <hr>
            <p><strong>Receipt</strong></p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
            <p>Order ID: #${order.customOrderId}</p>
            <p>Token Number: ${order.tokenNumber}</p>
            <hr>
            <div class="items-list">
                ${order.items.map(item => `
                    <div class="receipt-line">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>₹ ${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="receipt-line receipt-total">
                <span>Total:</span>
                <span>₹ ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
            </div>
            <p style="text-align: center; margin-top: 20px;">Thank you for your order!</p>
        `;
        singleReceiptModal.style.display = 'block';
    }

    async function startOrderReadyPolling() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            if (orderReadyCheckInterval) clearInterval(orderReadyCheckInterval);
            return;
        }
        if (orderReadyCheckInterval) clearInterval(orderReadyCheckInterval);
        isReadyPopupShown = false;

        orderReadyCheckInterval = setInterval(async () => {
            if (isReadyPopupShown) {
                clearInterval(orderReadyCheckInterval);
                return;
            }
            try {
                const response = await fetch(`${window.API_URL}/api/user-active-orders/${userId}`);
                const order = await response.json();
                
                if (order && order.status === 'Ready' && !isReadyPopupShown) {
                    showOrderReadyPopup(order);
                    isReadyPopupShown = true;
                    clearInterval(orderReadyCheckInterval);
                    if (orderTrackingInterval) clearInterval(orderTrackingInterval);
                } else if (!order) {
                    clearInterval(orderReadyCheckInterval);
                }
            } catch (error) {
                console.error('Failed to poll for order ready status:', error);
            }
        }, 10000);
    }
    
    function showOrderReadyPopup(order) {
        const userName = currentUserData ? `${currentUserData.firstName} ${currentUserData.lastName}` : 'User';
        const itemNames = order.items.map(item => item.name).join(' and ');
        const message = `${userName}, your order for "${itemNames}" is ready. Your token is ${order.tokenNumber}. Please head to the canteen pickup counter.`;

        document.getElementById('order-ready-message').textContent = message;
        orderReadyModal.style.display = 'block';
        
        trackOrderIcon.style.display = 'none';
    }

    async function trackOrderStatus(customOrderId) {
        if (orderTrackingInterval) clearInterval(orderTrackingInterval);

        const updateUI = (status) => {
            const statuses = ['Received', 'Preparing', 'Ready'];
            const currentStepIndex = statuses.indexOf(status);
            trackingSteps.forEach((step, index) => {
                if (index <= currentStepIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };
        
        const initialResponse = await fetch(`${window.API_URL}/api/order-status/${customOrderId}`);
        const initialOrder = await initialResponse.json();
        if (initialOrder && initialOrder.status) {
            trackOrderTokenElement.textContent = initialOrder.tokenNumber;
            updateUI(initialOrder.status);
        }

        orderTrackingInterval = setInterval(async () => {
            try {
                const response = await fetch(`${window.API_URL}/api/order-status/${customOrderId}`);
                const order = await response.json();
                if (order && order.status) {
                    updateUI(order.status);
                    if (order.status === 'Completed') {
                        clearInterval(orderTrackingInterval);
                        currentTrackableOrderId = null;
                        updateTrackOrderBanner();
                        orderTrackingModal.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order status:', error);
            }
        }, 5000);
    }
    
    async function updateTrackOrderBanner() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            trackOrderIcon.style.display = 'none';
            return;
        }
        try {
            const response = await fetch(`${window.API_URL}/api/user-active-orders/${userId}`);
            const activeOrder = await response.json();
            
            if (activeOrder && activeOrder.customOrderId) {
                const isTrackable = activeOrder.items.some(item => ['Meals', 'Curries', 'Staples', 'Cold Beverages', 'Fresh Juice', 'Shake'].includes(item.category));
                if (isTrackable && activeOrder.status !== 'Completed' && activeOrder.status !== 'Ready') {
                    trackOrderIcon.style.display = 'flex';
                    currentTrackableOrderId = activeOrder.customOrderId;
                    currentTrackableOrderToken = activeOrder.tokenNumber;
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to check for active orders:', error);
        }
        trackOrderIcon.style.display = 'none';
        currentTrackableOrderId = null;
    }
    
    async function fetchAndRenderReceipts() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            receiptsList.innerHTML = '<p>Please log in to view your receipts.</p>';
            return;
        }

        try {
            const response = await fetch(`${window.API_URL}/api/user-orders/${userId}`);
            const orders = await response.json();
            
            receiptsList.innerHTML = '';
            if (orders.length === 0) {
                receiptsList.innerHTML = '<p>No past orders found.</p>';
                return;
            }

            orders.forEach(order => {
                const orderItems = order.items.map(item => `${item.name} x ${item.quantity}`).join(', ');
                const totalAmount = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
                
                const receiptDiv = document.createElement('div');
                receiptDiv.classList.add('receipt-item');
                receiptDiv.innerHTML = `
                    <div class="receipt-item-info">
                        <h4>Order ID: #${order.customOrderId}</h4>
                        <p>Token: ${order.tokenNumber}</p>
                        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Total: <span class="receipt-total">₹ ${totalAmount}</span></p>
                    </div>
                    <div>
                        <button class="view-receipt-button" data-order-id="${order._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${order.qrCodeToken ? `<button class="view-qr-button" data-token="${order.qrCodeToken}"><i class="fas fa-qrcode"></i></button>` : ''}
                    </div>
                `;
                receiptsList.appendChild(receiptDiv);
            });

        } catch (error) {
            console.error('Failed to fetch user orders:', error);
            receiptsList.innerHTML = '<p>Error fetching your receipts.</p>';
        }
    }
    
    // NEW: Function to generate and display the QR code in a pop-up
    function showQrCodePopUp(qrCodeToken) {
        if (!receiptQrCodeContainer) return;
        receiptQrCodeContainer.innerHTML = '';
        new QRCode(receiptQrCodeContainer, {
            text: qrCodeToken,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        qrModal.style.display = 'block';
    }

    async function loadUserProfile() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            currentUserData = null;
            return;
        }
        try {
            const response = await fetch(`${window.API_URL}/api/user/${userId}`);
            const user = await response.json();
            if (response.ok) {
                currentUserData = user;
                document.getElementById('profile-first-name').value = user.firstName || '';
                document.getElementById('profile-last-name').value = user.lastName || '';
                document.getElementById('profile-department').value = user.department || '';
                document.getElementById('profile-id').value = user.studentId || '';
                document.getElementById('profile-email').value = user.email || '';
                document.getElementById('profile-phone').value = user.phoneNumber || '';
            } else {
                console.error('User profile not found or could not be loaded.');
                currentUserData = null;
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            currentUserData = null;
        }
    }

    userLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('user-phone').value;
        const response = await fetch(`${window.API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });

        if (response.status === 404) {
            console.log('User not found. Please sign up to continue.');
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
            document.getElementById('signup-phone').value = phoneNumber;
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData.message || 'Login failed. Please try again.');
            return;
        }

        const data = await response.json();
        if (data.role === 'user') {
            localStorage.setItem('role', 'user');
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userPhone', phoneNumber);
            loginModal.style.display = 'none';
            receiptIcon.style.display = 'flex';
            profileIcon.style.display = 'flex';
            await loadUserProfile();
            await loadCartFromServer(); // Load the cart after login
            await initializePage();
        } else {
            console.error('Login failed. Please try again.');
        }
    });

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const response = await fetch(`${window.API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.role === 'admin') {
            localStorage.setItem('role', 'admin');
            window.location.href = 'admin.html';
        } else {
            console.error('Admin login failed. Invalid credentials.');
        }
    });

    if(forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`${window.API_URL}/api/admin/forgot-password`, {
                    method: 'POST',
                });
                const result = await response.json();
                console.log(result.message);
                alert(result.message);
            } catch (error) {
                console.error('Failed to request password reset:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

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
    
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'block';
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUser = {
            firstName: document.getElementById('signup-first-name').value,
            lastName: document.getElementById('signup-last-name').value,
            department: document.getElementById('signup-department').value,
            studentId: document.getElementById('signup-id').value,
            email: document.getElementById('signup-email').value,
            phoneNumber: document.getElementById('signup-phone').value,
        };

        try {
            const signupResponse = await fetch(`${window.API_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            
            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
                console.error(signupData.message || 'An error occurred during sign up.');
                return;
            }

            if (signupData.success) {
                console.log('Sign up successful!');
                localStorage.setItem('role', 'user');
                localStorage.setItem('userId', signupData.userId);
                localStorage.setItem('userPhone', newUser.phoneNumber);
                signupModal.style.display = 'none';
                receiptIcon.style.display = 'flex';
                profileIcon.style.display = 'flex';
                await loadUserProfile();
                await loadCartFromServer(); // Load cart after signup
                await initializePage();
            } else {
                console.error('Sign up failed. Please try again.');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            console.error('An error occurred during sign up. Please check if your server is running and accessible.');
        }
    });
    
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        await saveCartToServer(); // Save cart before logging out
        localStorage.clear();
        window.location.reload();
    });

    myProfileLink.addEventListener('click', async (e) => {
        e.preventDefault();
        await loadUserProfile();
        profileModal.style.display = 'block';
    });
    
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        const updatedUser = {
            firstName: document.getElementById('profile-first-name').value,
            lastName: document.getElementById('profile-last-name').value,
            department: document.getElementById('profile-department').value,
            studentId: document.getElementById('profile-id').value,
            email: document.getElementById('profile-email').value,
        };
        try {
            const response = await fetch(`${window.API_URL}/api/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Profile updated successfully!');
                profileModal.style.display = 'none';
                await loadUserProfile();
            } else {
                console.error(data.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            console.error('Failed to update profile. Please check if your server is running and accessible.');
        }
    });

    foodGrid.addEventListener('click', (e) => {
        const addButton = e.target.closest('.add-button');
        const plusButton = e.target.closest('.quantity-selector .add-to-cart');
        const minusButton = e.target.closest('.quantity-selector .remove-from-cart');

        if (addButton) {
            const itemId = addButton.dataset.id;
            addItemToCart(itemId);
        } else if (plusButton) {
            const itemId = plusButton.dataset.id;
            addItemToCart(itemId);
        } else if (minusButton) {
            const itemId = minusButton.dataset.id;
            removeItemFromCart(itemId);
        }
    });
    
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('add-to-cart')) {
            const itemId = target.dataset.id;
            addItemToCart(itemId);
        } else if (target.classList.contains('remove-from-cart')) {
            const itemId = target.dataset.id;
            removeItemFromCart(itemId);
        }
    });

    dailySpecialBanner.addEventListener('click', () => {
        if (dailySpecialItems.length > 0) {
            const allTab = document.querySelector('.tab-button[data-category="All"]');
            if (allTab) {
                tabs.forEach(t => t.classList.remove('active'));
                allTab.classList.add('active');
                renderFoodItems('All');
            }
            setTimeout(() => {
                const firstSpecialCard = document.querySelector(`.food-card[data-id="${dailySpecialItems[0]._id}"]`);
                if (firstSpecialCard) {
                    firstSpecialCard.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    });

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const activeTab = document.querySelector('.tab-button.active').dataset.category;
        renderFoodItems(activeTab, searchTerm);
    });

    cartIconContainer.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    checkoutBar.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });
    
    receiptIcon.addEventListener('click', () => {
        fetchAndRenderReceipts();
        receiptModal.style.display = 'block';
    });
    
    receiptsList.addEventListener('click', async (e) => {
        const viewButton = e.target.closest('.view-receipt-button');
        const qrButton = e.target.closest('.view-qr-button');
        
        if (viewButton) {
            const orderId = viewButton.dataset.orderId;
            try {
                const response = await fetch(`${window.API_URL}/api/order/${orderId}`);
                const order = await response.json();
                if (order) {
                    showReceiptPopUp(order);
                }
            } catch (error) {
                console.error('Failed to fetch single order:', error);
                console.error('Could not load receipt details.');
            }
        } else if (qrButton) {
            const qrCodeToken = qrButton.dataset.token;
            showQrCodePopUp(qrCodeToken);
        }
    });

    trackOrderIcon.addEventListener('click', () => {
        if (currentTrackableOrderId) {
            trackOrderIdElement.textContent = `#${currentTrackableOrderId}`;
            trackOrderTokenElement.textContent = currentTrackableOrderToken;
            orderTrackingModal.style.display = 'block';
            trackOrderStatus(currentTrackableOrderId);
        }
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';

            if (modal.id === 'order-ready-modal' && currentTrackableOrderId) {
                try {
                    const response = await fetch(`${window.API_URL}/api/admin/update-order-status/${currentTrackableOrderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Completed' }),
                    });
                    if (response.ok) {
                        console.log('Order status updated to Completed.');
                        currentTrackableOrderId = null;
                        updateTrackOrderBanner();
                    } else {
                        console.error('Failed to update order status to Completed.');
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                }
            }
        });
    });
    
    const greatThanksOrderReadyButton = orderReadyModal ? orderReadyModal.querySelector('.back-to-menu-button') : null;
    if (greatThanksOrderReadyButton) {
        greatThanksOrderReadyButton.addEventListener('click', () => {
            orderReadyModal.style.display = 'none';
        });
    }

    checkoutButton.addEventListener('click', async () => {
        if (Object.keys(cart).length === 0) {
            console.log('Your cart is empty!');
            return;
        }

        await loadUserProfile();

        cartModal.style.display = 'none';
        checkoutPageModal.style.display = 'block';
        updateOrderSummary();

        if (currentUserData) {
            document.getElementById('user-name').value = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`;
            document.getElementById('roll-number').value = currentUserData.studentId || '';
        }
    });

    if (payWithRazorpayButton) {
        payWithRazorpayButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            await loadUserProfile();

            const name = document.getElementById('user-name').value;
            const rollNumber = document.getElementById('roll-number').value;
            const pickupTime = document.getElementById('pickup-time').value;
            const extraSuggestions = document.getElementById('extra-suggestions').value; // Get the extra suggestions

            if (!name || !rollNumber) {
                console.error('User profile data is missing. Please check your profile and try again.');
                return;
            }

            let totalAmount = 0;
            const items = Object.values(cart).map(item => {
                totalAmount += item.price * item.quantity;
                return {
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    category: item.category
                };
            });

            const amountInPaise = totalAmount * 100;

            try {
                const backendResponse = await fetch(`${window.API_URL}/api/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: amountInPaise,
                        items: items,
                        userId: localStorage.getItem('userId'),
                        userName: name,
                        userRollNo: rollNumber,
                        pickupTime: pickupTime,
                        extraSuggestions: extraSuggestions,
                    }),
                });

                const orderData = await backendResponse.json();
                const customOrderId = orderData.custom_order_id;
                const tokenNumber = orderData.tokenNumber;
                const qrCodeToken = orderData.qrCodeToken;
                
                const options = {
                    "key": razorpayKey,
                    "amount": amountInPaise,
                    "currency": "INR",
                    "name": "Campus Bites",
                    "description": `Order ID: ${customOrderId}`,
                    "order_id": orderData.order_id,
                    "handler": function (paymentResponse) {
                        const confirmationMessage = `Thanks **${name}**, your order **#${customOrderId}** is confirmed. Your token number is ${tokenNumber}. Please show the QR code below at the counter.`;

                        checkoutPageModal.style.display = 'none';
                        orderConfirmedPageModal.style.display = 'block';
                        document.getElementById('confirmation-message').innerHTML = confirmationMessage;

                        qrCodeContainerConfirm.innerHTML = '';
                        new QRCode(qrCodeContainerConfirm, {
                            text: qrCodeToken,
                            width: 150,
                            height: 150,
                            colorDark : "#000000",
                            colorLight : "#ffffff",
                            correctLevel : QRCode.CorrectLevel.H
                        });
                        
                        const isTrackable = items.some(item => ['Meals', 'Curries', 'Staples', 'Cold Beverages', 'Fresh Juice', 'Shake'].includes(item.category));
                        if (isTrackable) {
                            currentTrackableOrderId = customOrderId;
                            currentTrackableOrderToken = tokenNumber;
                            updateTrackOrderBanner();
                            startOrderReadyPolling();
                        }
                        
                        cart = {};
                        updateCartUI();
                        saveCartToServer(); // Save the empty cart to the server after a successful order
                    },
                    "prefill": {
                        "name": name,
                        "email": currentUserData.email || "user@campus.edu",
                        "contact": localStorage.getItem('userPhone')
                    },
                    "theme": {
                        "color": "#5d3fd3"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    console.error(response.error.description);
                });
                rzp1.open();

            } catch (error) {
                console.error('Payment process failed:', error);
                console.error('Payment failed. Please try again.');
            }
        });
    }

    backToMenuButton.addEventListener('click', () => {
        orderConfirmedPageModal.style.display = 'none';
        cart = {};
        updateCartUI();
        saveCartToServer(); // Save the empty cart on returning to the menu
        renderFoodItems();
    });
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.dataset.category;
            renderFoodItems(category);
        });
    });

    updateTrackOrderBanner();
    
    // --- New Admin Dashboard Logic ---
    function initializeAdminDashboard() {
        const foodItemList = document.getElementById('food-item-list');
        const liveOrdersList = document.getElementById('live-orders-list');
        const liveOrdersContent = document.getElementById('live-orders-content');
        const readyOrdersList = document.getElementById('ready-orders-list');
        const readyOrdersContent = document.getElementById('ready-orders-content');
        const toggleLiveOrdersBtn = document.getElementById('toggle-live-orders');
        const toggleReadyOrdersBtn = document.getElementById('toggle-ready-orders');
        const form = document.getElementById('food-item-form');
        const logoutButton = document.getElementById('admin-logout-button');
        
        // NEW: Get the collapsible buttons for the admin dashboard
        const toggleScannerBtn = document.getElementById('toggle-scanner');
        const toggleMenuBtn = document.getElementById('toggle-menu');
        const menuContent = document.getElementById('menu-content');
        const scannerContent = document.getElementById('scanner-content');
        
        let html5QrcodeScanner = null;
        let isScannerRunning = false;

        const billModal = document.getElementById('bill-modal');
        const billDetailsDiv = document.getElementById('bill-details');
        const greatThanksButton = document.getElementById('great-thanks-button');
        
        const qrCodeInput = document.getElementById('qr-code-input');
        const scanQrButton = document.getElementById('scan-qr-button');
        const scanResultDiv = document.getElementById('scan-result');

        if (liveOrdersContent) liveOrdersContent.classList.add('visible');
        if (readyOrdersContent) readyOrdersContent.classList.add('visible');
        if (toggleLiveOrdersBtn) toggleLiveOrdersBtn.classList.remove('collapsed');
        if (toggleReadyOrdersBtn) toggleReadyOrdersBtn.classList.remove('collapsed');
        if (menuContent) menuContent.classList.remove('visible');
        if (toggleMenuBtn) toggleMenuBtn.classList.add('collapsed');
        if (scannerContent) scannerContent.classList.remove('visible');
        if (toggleScannerBtn) toggleScannerBtn.classList.add('collapsed');

        if (toggleLiveOrdersBtn) {
            toggleLiveOrdersBtn.addEventListener('click', () => {
                if(liveOrdersContent) liveOrdersContent.classList.toggle('visible');
                if(toggleLiveOrdersBtn) toggleLiveOrdersBtn.classList.toggle('collapsed');
            });
        }
        
        if (toggleReadyOrdersBtn) {
            toggleReadyOrdersBtn.addEventListener('click', () => {
                if(readyOrdersContent) readyOrdersContent.classList.toggle('visible');
                if(toggleReadyOrdersBtn) toggleReadyOrdersBtn.classList.toggle('collapsed');
            });
        }
        
        // NEW: Add event listeners for the new collapsible sections
        if (toggleMenuBtn) {
            toggleMenuBtn.addEventListener('click', () => {
                if (menuContent) {
                    menuContent.classList.toggle('visible');
                    toggleMenuBtn.classList.toggle('collapsed');
                }
            });
        }
        
        if (toggleScannerBtn) {
            toggleScannerBtn.addEventListener('click', () => {
                if (scannerContent) {
                    scannerContent.classList.toggle('visible');
                    toggleScannerBtn.classList.toggle('collapsed');
                    if (scannerContent.classList.contains('visible')) {
                        startScanner();
                    } else {
                        stopScanner();
                    }
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.clear();
                window.location.replace('index.html');
            });
        }

        async function startScanner() {
            if (isScannerRunning) return;
            const onScanSuccess = (decodedText, decodedResult) => {
                if (qrCodeInput.value !== decodedText) {
                    qrCodeInput.value = decodedText;
                    verifyQrCode(decodedText);
                }
            };
            const onScanError = (errorMessage) => {
                console.warn('Scan error:', errorMessage);
            };
            html5QrcodeScanner = new Html5Qrcode('qr-reader');
            html5QrcodeScanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 }, disableFlip: false },
                onScanSuccess, onScanError
            ).then(() => {
                isScannerRunning = true;
                console.log('Scanner started successfully.');
                if (scanResultDiv) {
                    scanResultDiv.className = '';
                    scanResultDiv.textContent = '';
                }
            }).catch(err => {
                console.error('Error starting scanner:', err);
                if (scanResultDiv) {
                    scanResultDiv.className = 'error';
                    scanResultDiv.textContent = 'Could not start camera. Please check permissions or try again.';
                }
                isScannerRunning = false;
            });
        }
        
        async function stopScanner() {
            if (!isScannerRunning) return;
            try {
                await html5QrcodeScanner.stop();
                html5QrcodeScanner.clear();
                console.log('Scanner stopped.');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            } finally {
                isScannerRunning = false;
            }
        }
        
        async function fetchAndRenderOrders() {
            try {
                const response = await fetch(`${window.API_URL}/api/orders`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allOrders = await response.json();
                
                const liveOrders = allOrders.filter(order => order.status === 'Received' || order.status === 'Preparing');
                const readyOrders = allOrders.filter(order => order.status === 'Ready');

                if(liveOrdersList) renderOrderList(liveOrders, liveOrdersList, 'live');
                if(readyOrdersList) renderOrderList(readyOrders, readyOrdersList, 'ready');

            } catch (err) {
                console.error('Failed to fetch orders:', err);
                if(liveOrdersList) liveOrdersList.innerHTML = '<p>Error fetching orders. Please check server connection.</p>';
            }
        }

        function renderOrderList(orders, listElement, type) {
            listElement.innerHTML = '';
            if (orders.length === 0) {
                listElement.innerHTML = `<p>No ${type} orders.</p>`;
                return;
            }
            orders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.classList.add('admin-order-item');
                orderDiv.dataset.customOrderId = order.customOrderId;
                let itemsList = order.items.map(item => `${item.name} x ${item.quantity}`).join(', ');
                
                // NEW: Add a bold section for suggestions if they exist
                let suggestionsHtml = '';
                if (order.extraSuggestions && order.extraSuggestions.trim() !== '') {
                    suggestionsHtml = `<p><strong>Suggestions: ${order.extraSuggestions}</strong></p>`;
                }

                orderDiv.innerHTML = `
                    <div class="order-info">
                        <h3>Order ID: ${order.customOrderId} | Token: ${order.tokenNumber}</h3>
                        <p>Items: ${itemsList}</p>
                        <div class="order-details-meta">
                            <span>Name: ${order.userName || 'N/A'}</span>
                            <span>Roll No: ${order.userRollNo || 'N/A'}</span>
                            <span>Pickup Time: ${order.pickupTime || 'N/A'}</span>
                            <span class="order-status-text">Status: ${order.status}</span>
                        </div>
                        ${suggestionsHtml}
                    </div>
                    <div class="order-actions">
                        ${type === 'live' ? `
                            ${order.status === 'Received' ? `<button class="status-btn" data-id="${order._id}" data-status="Preparing">Preparing</button>` : ''}
                            ${order.status === 'Preparing' ? `<button class="status-btn ready-btn" data-id="${order._id}" data-status="Ready">Ready</button>` : ''}
                        ` : ''}
                    </div>
                `;
                listElement.appendChild(orderDiv);
            });
        }
        
        if (liveOrdersList) {
            liveOrdersList.addEventListener('click', async (e) => {
                if (e.target.classList.contains('status-btn')) {
                    const orderId = e.target.dataset.id;
                    const newStatus = e.target.dataset.status;

                    await fetch(`${window.API_URL}/api/admin/update-order-status/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    });

                    fetchAndRenderOrders();
                }
            });
        }
        
        if(scanQrButton) {
            scanQrButton.addEventListener('click', () => {
                if (qrCodeInput) verifyQrCode(qrCodeInput.value.trim());
            });
        }

        if(qrCodeInput) {
            qrCodeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    verifyQrCode(qrCodeInput.value.trim());
                }
            });
        }
        
        async function verifyQrCode(qrCodeToken) {
            if (!qrCodeToken) {
                if (scanResultDiv) {
                    scanResultDiv.className = 'error';
                    scanResultDiv.textContent = 'Please enter a QR code token.';
                }
                return;
            }

            try {
                const response = await fetch(`${window.API_URL}/api/admin/scan-qr`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeToken })
                });
                const result = await response.json();
                
                if (result.success) {
                    displayBillPopup(result.order);
                    if (scanResultDiv) {
                        scanResultDiv.className = 'success';
                        scanResultDiv.textContent = 'Order Confirmed! Bill displayed.';
                    }
                    if (qrCodeInput) qrCodeInput.value = '';
                    fetchAndRenderOrders();
                } else {
                    if (scanResultDiv) {
                        scanResultDiv.className = 'error';
                        scanResultDiv.textContent = result.message;
                    }
                }
            } catch (err) {
                if (scanResultDiv) {
                    scanResultDiv.className = 'error';
                    scanResultDiv.textContent = 'Server error during QR code validation.';
                }
                console.error(err);
            }
        }
        
        function displayBillPopup(order) {
            if (!billDetailsDiv || !billModal) return;
            billDetailsDiv.innerHTML = `
                <div style="text-align: left;">
                    <p><strong>Order ID:</strong> #${order.customOrderId}</p>
                    <p><strong>Token:</strong> ${order.tokenNumber}</p>
                    <p><strong>Customer:</strong> ${order.userName || 'N/A'}</p>
                    <hr style="margin: 10px 0; border: 1px dashed #ddd;">
                    <h4 style="margin-top: 0;">Items:</h4>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between;">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>₹ ${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                    ${order.extraSuggestions ? `<p style="margin-top: 10px;"><strong>Suggestions:</strong> ${order.extraSuggestions}</p>` : ''}
                    <hr style="margin: 10px 0; border: 1px dashed #ddd;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem;">
                        <span>Total:</span>
                        <span>₹ ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
                    </div>
                </div>
            `;
            billModal.style.display = 'block';
        }

        function closeBillPopup() {
            if (billModal) billModal.style.display = 'none';
        }

        const billCloseButton = billModal ? billModal.querySelector('.close-button') : null;
        if(billCloseButton) billCloseButton.addEventListener('click', closeBillPopup);
        if(greatThanksButton) greatThanksButton.addEventListener('click', closeBillPopup);
    
        fetchAndRenderItems();
        fetchAndRenderOrders();
        setInterval(fetchAndRenderOrders, 15000);
        
        async function fetchAndRenderItems() {
            try {
                const response = await fetch(`${window.API_URL}/api/food-items`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const items = await response.json();
                renderItems(items);
            } catch(err) {
                console.error('Failed to fetch food items:', err);
            }
        }

        function renderItems(items) {
            if(!foodItemList) return;
            foodItemList.innerHTML = '';
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('admin-food-item');
                if (item.isSoldOut) {
                    itemDiv.classList.add('sold-out');
                }
                const soldOutBtnClass = item.isSoldOut ? 'sold-out-button active' : 'sold-out-button';
                const specialBadge = item.isDailySpecial ? `<span class="special-badge">Special ✨</span>` : '';
                const specialBtnText = item.isDailySpecial ? 'Deselect Special' : 'Set as Special';
                const specialBtnClass = item.isDailySpecial ? 'special-button active' : 'special-button';
                itemDiv.innerHTML = `
                    <div class="admin-food-item-info">
                        <h3>${specialBadge}${item.name}</h3>
                        <p>₹ ${item.price} • ${item.category}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="${specialBtnClass}" data-id="${item._id}">${specialBtnText}</button>
                        <button class="${soldOutBtnClass}" data-id="${item._id}">${item.isSoldOut ? 'Sold Out ✅' : 'Mark Sold Out'}</button>
                        <button class="delete-button" data-id="${item._id}">Take Down</button>
                    </div>
                `;
                foodItemList.appendChild(itemDiv);
            });
        }
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newItem = {
                    name: document.getElementById('name').value,
                    price: document.getElementById('price').value,
                    image: document.getElementById('image').value,
                    category: document.getElementById('category').value,
                };
                await fetch(`${window.API_URL}/api/add-item`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem),
                });
                form.reset();
                fetchAndRenderItems();
            });
        }

        if(foodItemList) {
            foodItemList.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                if (!itemId) return;
                if (e.target.classList.contains('delete-button')) {
                    await fetch(`${window.API_URL}/api/delete-item/${itemId}`, { method: 'DELETE' });
                } else if (e.target.classList.contains('sold-out-button')) {
                    const isSoldOut = e.target.classList.contains('active');
                    await fetch(`${window.API_URL}/api/update-item/${itemId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isSoldOut: !isSoldOut })
                    });
                } else if (e.target.classList.contains('special-button')) {
                    const isSpecial = e.target.classList.contains('active');
                    if (isSpecial) {
                        await fetch(`${window.API_URL}/api/unset-daily-special/${itemId}`, { method: 'PUT' });
                    } else {
                        await fetch(`${window.API_URL}/api/set-daily-special/${itemId}`, { method: 'PUT' });
                    }
                }
                fetchAndRenderItems();
            });
        }
    } // End of initializeAdminDashboard
}); // End of DOMContentLoaded
