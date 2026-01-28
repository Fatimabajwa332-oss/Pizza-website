// js/app.js - Complete with all features including reservations
// Updated with new features and fixes

const API_BASE = 'http://localhost/BACKEND/api';

// Global variables
let cart = [];
let reservations = [];
let selectedSizes = {}; // Track selected sizes for each pizza

// DOM elements
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const closeCart = document.getElementById('close-cart');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const confirmationModal = document.getElementById('confirmation-modal');
const homeAfterOrder = document.getElementById('home-after-order');
const trackOrderBtn = document.getElementById('track-order-btn');
const reservationModal = document.getElementById('reservation-confirmation-modal');
const closeReservationModal = document.getElementById('close-reservation-modal');
const printReservationBtn = document.getElementById('print-reservation');
const reservationForm = document.getElementById('reservation-form');
const loadingOverlay = document.getElementById('loading-overlay');
const pizzaLoading = document.getElementById('pizza-loading');
const cartCount = document.getElementById('cart-count');
const cartIcon = document.getElementById('cart-icon');
const viewMenuBtn = document.getElementById('view-menu-btn');

// ==================== LOADING FUNCTIONS ====================

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    if (pizzaLoading) {
        pizzaLoading.style.display = 'block';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    if (pizzaLoading) {
        pizzaLoading.style.display = 'none';
    }
}

// ==================== API FUNCTIONS ====================

async function fetchPizzas(category = 'all') {
    try {
        console.log(`Fetching pizzas for category: ${category}`);
        const res = await fetch(`${API_BASE}/pizzas.php?category=${category}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Pizzas fetched:', data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching pizzas:', error);
        return getSamplePizzas(category);
    }
}

async function fetchDrinks() {
    try {
        const res = await fetch(`${API_BASE}/drinks.php`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching drinks:', error);
        return getSampleDrinks();
    }
}

// Sample data for testing
function getSamplePizzas(category = 'all') {
    const samplePizzas = [
        {
            id: 1,
            name: "Margherita",
            description: "Classic cheese and tomato pizza with fresh basil",
            image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
            category: "veg",
            price_small: "8.99",
            price_medium: "11.99",
            price_large: "14.99",
            ingredients: "Tomato sauce, mozzarella cheese, fresh basil, olive oil"
        },
        {
            id: 2,
            name: "Pepperoni",
            description: "Spicy pepperoni with mozzarella cheese",
            image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e",
            category: "non-veg",
            price_small: "10.99",
            price_medium: "13.99",
            price_large: "16.99",
            ingredients: "Tomato sauce, mozzarella cheese, pepperoni"
        },
        {
            id: 3,
            name: "Vegetarian Delight",
            description: "Loaded with fresh vegetables and cheese",
            image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca",
            category: "veg",
            price_small: "9.99",
            price_medium: "12.99",
            price_large: "15.99",
            ingredients: "Tomato sauce, mozzarella, mushrooms, bell peppers, onions, olives"
        }
    ];
    
    if (category === 'all') return samplePizzas;
    return samplePizzas.filter(pizza => pizza.category === category);
}

function getSampleDrinks() {
    return [
        {
            id: 1,
            name: "Coca Cola",
            description: "Classic cola drink",
            image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            price: "1.99"
        },
        {
            id: 2,
            name: "Fresh Orange Juice",
            description: "Freshly squeezed orange juice",
            image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b",
            price: "3.99"
        },
        {
            id: 3,
            name: "Iced Tea",
            description: "Refreshing iced tea with lemon",
            image_url: "https://images.unsplash.com/photo-1561047029-3000c68339ca",
            price: "2.49"
        }
    ];
}

// ==================== PIZZA RENDERING WITH NEW DESIGN ====================

function renderPizzas(pizzas, gridElement) {
    if (!gridElement) return;
    
    gridElement.innerHTML = '';
    
    if (pizzas.length === 0) {
        gridElement.innerHTML = '<div class="no-items">No pizzas available</div>';
        return;
    }
    
    pizzas.forEach(pizza => {
        const pizzaCard = document.createElement('div');
        pizzaCard.className = 'pizza-card';
        pizzaCard.setAttribute('data-pizza-id', pizza.id);
        
        pizzaCard.innerHTML = `
            <div class="pizza-img">
                <img src="${pizza.image_url}" alt="${pizza.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'">
                <span class="pizza-category ${pizza.category}">${pizza.category === 'veg' ? 'Veg' : 'Non-Veg'}</span>
            </div>
            <div class="pizza-info">
                <h3>${pizza.name}</h3>
                <p class="pizza-desc">${pizza.description}</p>
                
                <!-- Price Display with Selected Size -->
                <div class="selected-price-display">
                    <span>Price: </span>
                    <span class="current-price">$${pizza.price_small}</span>
                    <span class="size-label">(Small)</span>
                </div>
                
                <!-- Size Selection Buttons -->
                <div class="size-selector">
                    <button class="size-btn active" 
                            data-size="small" 
                            data-price="${pizza.price_small}">
                        Small: $${pizza.price_small}
                    </button>
                    <button class="size-btn" 
                            data-size="medium" 
                            data-price="${pizza.price_medium}">
                        Medium: $${pizza.price_medium}
                    </button>
                    <button class="size-btn" 
                            data-size="large" 
                            data-price="${pizza.price_large}">
                        Large: $${pizza.price_large}
                    </button>
                </div>
                
                <!-- Add to Cart Button -->
                <button class="add-to-cart-main-btn">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        gridElement.appendChild(pizzaCard);
        
        // Add event listeners to this pizza card
        setupPizzaCardEvents(pizzaCard, pizza);
    });
}

function setupPizzaCardEvents(pizzaCard, pizza) {
    const pizzaId = pizza.id;
    
    // Size button click events
    const sizeButtons = pizzaCard.querySelectorAll('.size-btn');
    const currentPrice = pizzaCard.querySelector('.current-price');
    const sizeLabel = pizzaCard.querySelector('.size-label');
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update price display
            const size = button.getAttribute('data-size');
            const price = button.getAttribute('data-price');
            
            currentPrice.textContent = `$${price}`;
            sizeLabel.textContent = `(${size.charAt(0).toUpperCase() + size.slice(1)})`;
            
            // Save selected size
            selectedSizes[pizzaId] = {
                size: size,
                price: parseFloat(price)
            };
        });
    });
    
    // Set default selected size
    selectedSizes[pizzaId] = {
        size: 'small',
        price: parseFloat(pizza.price_small)
    };
    
    // Add to cart button click event
    const addToCartBtn = pizzaCard.querySelector('.add-to-cart-main-btn');
    addToCartBtn.addEventListener('click', () => {
        addPizzaToCart(pizza);
    });
}

function addPizzaToCart(pizza) {
    const pizzaId = pizza.id;
    const selectedSize = selectedSizes[pizzaId];
    
    if (!selectedSize) {
        showNotification('Please select a size first!', 'error');
        return;
    }
    
    const cartItem = {
        id: Date.now(), // Unique ID for cart item
        type: 'pizza',
        pizzaId: pizza.id,
        name: pizza.name,
        size: selectedSize.size,
        price: selectedSize.price,
        quantity: 1
    };
    
    cart.push(cartItem);
    updateCart();
    showNotification(`Added ${pizza.name} (${selectedSize.size}) to cart!`);
}

function renderDrinks(drinks, gridElement) {
    if (!gridElement) return;
    
    gridElement.innerHTML = '';
    
    if (drinks.length === 0) {
        gridElement.innerHTML = '<div class="no-items">No drinks available</div>';
        return;
    }
    
    drinks.forEach(drink => {
        const drinkCard = document.createElement('div');
        drinkCard.className = 'drink-card';
        drinkCard.innerHTML = `
            <div class="drink-img">
                <img src="${drink.image_url}" alt="${drink.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1621506289937-a8e4df240d0b'">
            </div>
            <div class="drink-info">
                <h3>${drink.name}</h3>
                <p>${drink.description}</p>
                <div class="drink-price">$${drink.price}</div>
                <button class="add-to-cart-btn">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        const addBtn = drinkCard.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => {
            addDrinkToCart(drink);
        });
        
        gridElement.appendChild(drinkCard);
    });
}

function addDrinkToCart(drink) {
    const cartItem = {
        id: Date.now(),
        type: 'drink',
        drinkId: drink.id,
        name: drink.name,
        price: parseFloat(drink.price),
        quantity: 1
    };
    
    cart.push(cartItem);
    updateCart();
    showNotification(`Added ${drink.name} to cart!`);
}

// ==================== CART FUNCTIONS ====================

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart modal if open
    if (cartModal.classList.contains('active')) {
        renderCartItems();
    }
    
    // Update checkout button
    updateCheckoutButton();
    
    // Save to localStorage
    saveCartToLocalStorage();
}

function renderCartItems() {
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name} ${item.size ? `(${item.size})` : ''}</h4>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="item-actions">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
                <button class="remove-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners to cart item buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                updateCart();
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart[index].quantity++;
            updateCart();
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            updateCart();
        });
    });
}

function updateCheckoutButton() {
    if (checkoutBtn) {
        if (cart.length > 0) {
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
        }
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('pizzaCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function showCart() {
    if (cartModal) {
        cartModal.classList.add('active');
        renderCartItems();
    }
}

function hideCart() {
    if (cartModal) cartModal.classList.remove('active');
}

// ==================== CHECKOUT FUNCTIONS ====================

function updateOrderSummary() {
    const summaryElement = document.getElementById('order-items-summary');
    const totalElement = document.getElementById('checkout-total');
    
    if (!summaryElement || !totalElement) return;
    
    summaryElement.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <span>${item.name} ${item.size ? `(${item.size})` : ''} × ${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
        summaryElement.appendChild(itemElement);
    });
    
    totalElement.textContent = `$${total.toFixed(2)}`;
}

async function submitOrder(orderData) {
    try {
        // Simulate API call - replace with actual API
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    order_id: 'ORD' + Date.now().toString().slice(-8)
                });
            }, 1000);
        });
    } catch (error) {
        console.error('Order submission error:', error);
        return { success: false, message: 'Network error' };
    }
}

// ==================== RESERVATION FUNCTIONS ====================

async function submitReservation(reservationData) {
    try {
        // Simulate API call - replace with actual API
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        id: 'RES' + Date.now().toString().slice(-8),
                        ...reservationData,
                        status: 'confirmed'
                    }
                });
            }, 1000);
        });
    } catch (error) {
        console.error('Reservation error:', error);
        return { success: false, message: 'Network error' };
    }
}

function showReservationConfirmation(reservation) {
    const modal = document.getElementById('reservation-confirmation-modal');
    const details = document.getElementById('reservation-details');
    
    if (!modal || !details) return;
    
    const formattedDate = new Date(reservation.reservation_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = formatTime(reservation.reservation_time);
    
    details.innerHTML = `
        <div class="reservation-details">
            <p><strong>Reservation ID:</strong> ${reservation.id}</p>
            <p><strong>Name:</strong> ${reservation.customer_name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Guests:</strong> ${reservation.number_of_guests} people</p>
            <p><strong>Phone:</strong> ${reservation.phone}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Status:</strong> <span class="status-confirmed">Confirmed</span></p>
            ${reservation.special_requests ? `<p><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
        </div>
        <div class="confirmation-note">
            <p>A confirmation email has been sent to ${reservation.email}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
}

// ==================== NOTIFICATION FUNCTION ====================

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = 'notification-container';
        document.body.appendChild(newContainer);
        container = newContainer;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app...');
    
    // Show loading
    showLoading();
    
    // Load cart from localStorage
    loadCartFromLocalStorage();
    
    // Set minimum date for reservation form
    const reservationDateInput = document.getElementById('reservation-date');
    if (reservationDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const formattedDate = tomorrow.toISOString().split('T')[0];
        reservationDateInput.min = formattedDate;
        reservationDateInput.value = formattedDate;
    }
    
    // Load and display data
    try {
        // Load pizzas
        const pizzas = await fetchPizzas('all');
        console.log('Initial pizzas:', pizzas);
        
        // Render pizzas in both grids
        const pizzaGrid = document.getElementById('pizza-grid');
        const menuGrid = document.getElementById('menu-grid');
        
        if (pizzaGrid) renderPizzas(pizzas, pizzaGrid);
        if (menuGrid) renderPizzas(pizzas, menuGrid);
        
        // Load drinks
        const drinks = await fetchDrinks();
        const drinksGrid = document.getElementById('drinks-grid');
        if (drinksGrid) renderDrinks(drinks, drinksGrid);
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error loading menu items', 'error');
    } finally {
        // Hide loading
        hideLoading();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Cart functionality
    if (cartIcon) {
        cartIcon.addEventListener('click', showCart);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', hideCart);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            hideCart();
            if (checkoutModal) {
                checkoutModal.classList.add('active');
                updateOrderSummary();
            }
        });
    }
    // About Us Modal Functionality
const aboutLink = document.getElementById('about-link');
const aboutModal = document.getElementById('about-modal');
const closeAboutModal = document.querySelector('.close-about-modal');

if (aboutLink && aboutModal) {
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
}

if (closeAboutModal && aboutModal) {
    closeAboutModal.addEventListener('click', () => {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
}

// Close modal when clicking outside the content
if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Also add to the existing window click event handler for modal closing
window.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // ... keep your existing code for other modals
});
    
    // Checkout modal
    if (closeCheckout) {
        closeCheckout.addEventListener('click', () => {
            if (checkoutModal) checkoutModal.classList.remove('active');
        });
    }
    
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', hideCart);
    }
    
    // Order online button
    const orderOnlineBtn = document.getElementById('order-online-btn');
    if (orderOnlineBtn) {
        orderOnlineBtn.addEventListener('click', showCart);
    }
    
    // View menu button
    if (viewMenuBtn) {
        viewMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const menuSection = document.getElementById('menu-section');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const orderData = {
                customer_name: document.getElementById('customer-name').value,
                email: document.getElementById('customer-email').value,
                phone: document.getElementById('customer-phone').value,
                address: document.getElementById('customer-address').value,
                order_notes: document.getElementById('order-notes').value || '',
                total_amount: total,
                items: cart
            };
            
            // Show loading
            showNotification('Placing your order...', 'info');
            
            const result = await submitOrder(orderData);
            
            if (result.success) {
                // Show confirmation with 30-minute delivery message
                document.getElementById('confirmation-message').innerHTML = `
                    Your order <strong>#${result.order_id}</strong> has been placed successfully!<br>
                    <br>
                    <strong>Customer Name:</strong> ${orderData.customer_name}<br>
                    <strong>Delivery Address:</strong> ${orderData.address}<br>
                    <strong>Phone:</strong> ${orderData.phone}<br>
                    <strong>Total Amount:</strong> $${orderData.total_amount.toFixed(2)}
                `;
                
                if (confirmationModal) confirmationModal.classList.add('active');
                
                // Clear cart
                cart = [];
                selectedSizes = {};
                updateCart();
                
                // Close modals
                if (checkoutModal) checkoutModal.classList.remove('active');
                if (checkoutForm) checkoutForm.reset();
                
            } else {
                showNotification(result.message || 'Order failed. Please try again.', 'error');
            }
        });
    }
    
    // Order confirmation buttons
    if (homeAfterOrder) {
        homeAfterOrder.addEventListener('click', () => {
            if (confirmationModal) confirmationModal.classList.remove('active');
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', () => {
            showNotification('Order tracking feature coming soon!');
        });
    }
    
    // Reservation form
    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reservationData = {
                customer_name: document.getElementById('reservation-name').value,
                email: document.getElementById('reservation-email').value,
                phone: document.getElementById('reservation-phone').value,
                reservation_date: document.getElementById('reservation-date').value,
                reservation_time: document.getElementById('reservation-time').value,
                number_of_guests: document.getElementById('reservation-guests').value,
                special_requests: document.getElementById('reservation-notes').value || ''
            };
            
            // Validate date
            const today = new Date().toISOString().split('T')[0];
            if (reservationData.reservation_date < today) {
                showNotification('Please select a future date', 'error');
                return;
            }
            
            // Submit reservation
            const result = await submitReservation(reservationData);
            
            if (result.success) {
                // Show confirmation
                showReservationConfirmation(result.data);
                
                // Reset form
                reservationForm.reset();
                
                // Reset date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const formattedDate = tomorrow.toISOString().split('T')[0];
                document.getElementById('reservation-date').value = formattedDate;
                
            } else {
                showNotification(result.message || 'Reservation failed', 'error');
            }
        });
    }
    
    // Reservation modal buttons
    if (closeReservationModal) {
        closeReservationModal.addEventListener('click', () => {
            if (reservationModal) reservationModal.classList.remove('active');
        });
    }
    
    if (printReservationBtn) {
        printReservationBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    // Pizza category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const category = btn.getAttribute('data-category');
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            // Show loading
            showLoading();
            
            // Fetch and render filtered pizzas
            const pizzas = await fetchPizzas(category);
            
            // Update pizza grids
            const pizzaGrid = document.getElementById('pizza-grid');
            const menuGrid = document.getElementById('menu-grid');
            if (pizzaGrid) renderPizzas(pizzas, pizzaGrid);
            if (menuGrid) renderPizzas(pizzas, menuGrid);
            
            // Hide loading
            hideLoading();
        });
    });
    
    // Pizza form (admin)
    const showFormBtn = document.getElementById('show-form-btn');
    const hideFormBtn = document.getElementById('hide-form-btn');
    const pizzaForm = document.getElementById('pizza-form');
    const pizzaFormSection = document.getElementById('pizza-form-section');
    
    if (showFormBtn) {
        showFormBtn.addEventListener('click', () => {
            if (pizzaFormSection) pizzaFormSection.style.display = 'block';
        });
    }
    
    if (hideFormBtn) {
        hideFormBtn.addEventListener('click', () => {
            if (pizzaFormSection) pizzaFormSection.style.display = 'none';
        });
    }
    
    if (pizzaForm) {
        pizzaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('pizza-name').value,
                description: document.getElementById('pizza-description').value,
                image_url: document.getElementById('pizza-image').value,
                price_small: document.getElementById('pizza-price-small').value,
                price_medium: document.getElementById('pizza-price-medium').value,
                price_large: document.getElementById('pizza-price-large').value,
                category: document.querySelector('input[name="category"]:checked').value,
                ingredients: document.getElementById('pizza-ingredients').value
            };
            
            try {
                const response = await fetch(`${API_BASE}/pizzas.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Pizza added successfully!');
                    pizzaForm.reset();
                    if (pizzaFormSection) pizzaFormSection.style.display = 'none';
                    
                    // Reload pizzas
                    showLoading();
                    const pizzas = await fetchPizzas('all');
                    const pizzaGrid = document.getElementById('pizza-grid');
                    const menuGrid = document.getElementById('menu-grid');
                    if (pizzaGrid) renderPizzas(pizzas, pizzaGrid);
                    if (menuGrid) renderPizzas(pizzas, menuGrid);
                    hideLoading();
                    
                } else {
                    showNotification(result.message || 'Failed to add pizza', 'error');
                }
            } catch (error) {
                showNotification('Network error. Please try again.', 'error');
            }
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Thank you for your message! We will contact you soon.');
            contactForm.reset();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-modal')) {
            hideCart();
        }
        if (e.target.classList.contains('checkout-modal')) {
            checkoutModal.classList.remove('active');
        }
        if (e.target.classList.contains('confirmation-modal')) {
            confirmationModal.classList.remove('active');
        }
        if (e.target.classList.contains('reservation-confirmation-modal')) {
            reservationModal.classList.remove('active');
        }
    });
    
}

// Make functions available globally
window.showCart = showCart;
window.hideCart = hideCart;
window.showNotification = showNotification;

console.log('Pizza Restaurant App initialized successfully!');