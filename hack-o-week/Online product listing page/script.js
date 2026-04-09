// Product Data
const products = [
    {
        id: 1,
        name: "Sony WH-1000XM5 Headphones",
        category: "Electronics",
        price: 1999,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
        description: "Industry-leading noise cancellation. Exceptional sound quality. Up to 30-hour battery life.",
        sale: true
    },
    {
        id: 2,
        name: "Nike Air Max 270 Sneakers",
        category: "Fashion",
        price: 2499,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        description: "A lifestyle shoe that blends comfort with a sleek, modern aesthetic.",
        sale: false
    },
    {
        id: 3,
        name: "Apple Watch Series 9",
        category: "Electronics",
        price: 3499,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
        description: "Advanced health features, crash detection, and the brightest display yet.",
        sale: false
    },
    {
        id: 4,
        name: "Herschel Heritage Backpack",
        category: "Accessories",
        price: 999,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
        description: "Classic design with a diamond detail. Durable and perfect for everyday use.",
        sale: true
    },
    {
        id: 5,
        name: "Minimalist Graphic Hoodie",
        category: "Fashion",
        price: 1599,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1556821840-fa864fbf4ab1?q=80&w=800&auto=format&fit=crop",
        description: "Premium cotton blend for absolute comfort. Minimalist design for any occasion.",
        sale: false
    },
    {
        id: 6,
        name: "Ray-Ban Aviator Sunglasses",
        category: "Accessories",
        price: 1299,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
        description: "Classic aviator shape. Polarized lenses for optimal clarity.",
        sale: false
    },
    {
        id: 7,
        name: "Logitech MX Master 3S",
        category: "Electronics",
        price: 899,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
        description: "The ultimate productivity mouse. Ultra-fast scrolling and ergonomic design.",
        sale: true
    },
    {
        id: 8,
        name: "Classic Denim Jacket",
        category: "Fashion",
        price: 2199,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop",
        description: "A wardrobe essential. Vintage wash with a modern, relaxed fit.",
        sale: false
    },
    {
        id: 9,
        name: "Samsung Galaxy Buds Pro",
        category: "Electronics",
        price: 1499,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        description: "Intelligent active noise cancellation. Crystal clear calls.",
        sale: true
    },
    {
        id: 10,
        name: "Leather Messenger Bag",
        category: "Accessories",
        price: 2999,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
        description: "Genuine leather. Multiple compartments for laptops and documents.",
        sale: false
    }
];

// State
let cart = [];
let currentProducts = [...products];
let filterTimeout = null;
let currentTransition = null;

// DOM Elements
const productGrid = document.getElementById('product-grid');
const productCountArea = document.getElementById('product-count');
const noResults = document.getElementById('no-results');
const cartBadge = document.getElementById('cart-badge');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

// Filter Elements
const heroSearch = document.getElementById('hero-search-input');
const mainSearch = document.getElementById('main-search-input');
const mobileSearch = document.getElementById('main-search-input-mobile');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const sortSelect = document.getElementById('sort-select');
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
const ratingFilter = document.getElementById('rating-filter');
const resetBtn = document.getElementById('reset-filters-btn');

// Mobile Filter Variables
const filterSidebar = document.getElementById('filter-sidebar');
const filterOverlay = document.getElementById('filter-overlay');
const mobileFilterBtn = document.getElementById('mobile-filter-btn');
const closeFilterBtn = document.getElementById('close-filter-btn');
const applyFilterBtn = document.getElementById('apply-filter-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initial sequence => Skeletons -> Filter -> Render
    renderSkeletons();
    
    // Setup Cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    setTimeout(() => {
        applyFilters(true); // pass true indicating it's the first load
    }, 800);
});

// Sound Effect Helper
function playPopSound() {
    // Usually standard to synthesize a quick click to keep it entirely asset free
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        // gracefully fail if audio isn't permitted
    }
}

// Interacting functions
window.scrollAndFocusMainSearch = function() {
    document.getElementById('products').scrollIntoView({behavior: 'smooth', block: 'start'});
    const isMobile = window.innerWidth <= 768;
    setTimeout(() => {
        if(isMobile) {
            mobileSearch.focus();
        } else {
            mainSearch.focus();
        }
    }, 600);
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    playPopSound();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Engine: Skeletons & Transitions
function renderSkeletons() {
    productGrid.innerHTML = '';
    noResults.classList.add('hidden');
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.classList.add('skeleton');
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-line" style="margin-top: 2rem;"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line" style="margin-top: auto; margin-bottom: 2rem;"></div>
        `;
        productGrid.appendChild(skeleton);
    }
    productCountArea.textContent = `(Filtering...)`;
}

// Smooth Transition Pipeline
async function triggerSmoothFilterUpdate(filteredProducts) {
    if (currentTransition) return; // Prevent spamming
    currentTransition = true;

    const cards = document.querySelectorAll('.product-card');
    
    // 1. Fade out current if they exist
    if (cards.length > 0) {
        cards.forEach(card => card.classList.add('fade-out-scale'));
        // Wait for CSS transition
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 2. Render Skeletons (feeling of calculation)
    renderSkeletons();
    
    // Simulate slight lag for server feel
    await new Promise(resolve => setTimeout(resolve, 600));

    // 3. Render New Data
    currentProducts = filteredProducts;
    productCountArea.textContent = `(${currentProducts.length})`;

    productGrid.innerHTML = '';
    if (filteredProducts.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filteredProducts.forEach((product, index) => {
            const card = buildProductCardHTML(product);
            // Staggering
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('fade-in-up');
            productGrid.appendChild(card);
        });
    }

    currentTransition = false;
}

function buildProductCardHTML(product) {
    let starsHtml = '';
    for(let i=0; i<5; i++) {
        if(i < Math.floor(product.rating)) {
            starsHtml += '<ion-icon name="star"></ion-icon>';
        } else if(i === Math.floor(product.rating) && product.rating % 1 !== 0) {
            starsHtml += '<ion-icon name="star-half"></ion-icon>';
        } else {
            starsHtml += '<ion-icon name="star-outline"></ion-icon>';
        }
    }

    const card = document.createElement('div');
    card.classList.add('product-card');
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" loading="lazy" alt="${product.name}">
            <div class="product-badges">
                ${product.sale ? '<span class="badge-sale">Sale</span>' : ''}
            </div>
            <button class="wishlist-btn" onclick="toggleWishlist(this)"><ion-icon name="heart-outline"></ion-icon></button>
        </div>
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                ${starsHtml}
                <span>(${product.rating})</span>
            </div>
            <div class="product-price-row">
                <span class="product-price">₹${product.price}</span>
            </div>
            <div class="product-actions">
                <button class="btn btn-view" onclick="openModal(${product.id})">Details</button>
                <button class="btn btn-add btn-primary" onclick="debounceAddToCart(this, ${product.id})">Add</button>
            </div>
        </div>
    `;
    return card;
}

// Logic logic
function applyFilters(isInitialLoad = false) {
    let filtered = [...products];
    
    // Search Filter
    const query = mainSearch.value.toLowerCase() || mobileSearch.value.toLowerCase() || heroSearch.value.toLowerCase();
    if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }
    
    // Category Filter (Checkboxes)
    const activeCategories = Array.from(categoryCheckboxes)
        .filter(box => box.checked)
        .map(box => box.value);
        
    if (activeCategories.length > 0) {
        filtered = filtered.filter(p => activeCategories.includes(p.category));
    }
    
    // Price Filter
    const maxPrice = Number(priceRange.value);
    filtered = filtered.filter(p => p.price <= maxPrice);
    
    // Rating Filter
    if (ratingFilter.checked) {
        filtered = filtered.filter(p => p.rating >= 4.0);
    }
    
    // Sorting
    const sort = sortSelect.value;
    if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }
    
    if (isInitialLoad) {
        triggerSmoothFilterUpdate(filtered);
    } else {
        // Debounce to prevent jumping
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            triggerSmoothFilterUpdate(filtered);
        }, 400); // Wait user stop tuning filters
    }
}

// Triggers
const inputHandler = (e) => {
    if(e.target === heroSearch && heroSearch.value !== '') {
        mainSearch.value = heroSearch.value;
        mobileSearch.value = heroSearch.value;
    }
    if(e.target === mainSearch && mainSearch.value !== '') {
        heroSearch.value = mainSearch.value;
        mobileSearch.value = mainSearch.value;
    }
    if(e.target === mobileSearch && mobileSearch.value !== '') {
        heroSearch.value = mobileSearch.value;
        mainSearch.value = mobileSearch.value;
    }
    applyFilters();
}
heroSearch.addEventListener('input', inputHandler);
mainSearch.addEventListener('input', inputHandler);
mobileSearch.addEventListener('input', inputHandler);

categoryCheckboxes.forEach(cb => cb.addEventListener('change', () => applyFilters()));
sortSelect.addEventListener('change', () => applyFilters());
ratingFilter.addEventListener('change', () => applyFilters());

priceRange.addEventListener('input', (e) => {
    priceDisplay.textContent = `₹${e.target.value}`;
    applyFilters();
});

resetBtn.addEventListener('click', () => {
    heroSearch.value = '';
    mainSearch.value = '';
    mobileSearch.value = '';
    categoryCheckboxes.forEach(cb => cb.checked = false);
    sortSelect.value = 'default';
    priceRange.value = '10000';
    priceDisplay.textContent = '₹10000';
    ratingFilter.checked = false;
    applyFilters();
});

// Mobile Sidebar logics
function openMobileFilter() {
    filterSidebar.classList.add('active');
    filterOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMobileFilter() {
    filterSidebar.classList.remove('active');
    filterOverlay.classList.remove('active');
    document.body.style.overflow = '';
}
mobileFilterBtn.addEventListener('click', openMobileFilter);
closeFilterBtn.addEventListener('click', closeMobileFilter);
filterOverlay.addEventListener('click', closeMobileFilter);
applyFilterBtn.addEventListener('click', closeMobileFilter);

// Wishlist Animation
window.toggleWishlist = function(btn) {
    const icon = btn.querySelector('ion-icon');
    if (icon.getAttribute('name') === 'heart') {
        icon.setAttribute('name', 'heart-outline');
        icon.style.color = '#94a3b8';
        btn.classList.remove('wishlist-anim');
    } else {
        playPopSound();
        icon.setAttribute('name', 'heart');
        icon.style.color = '#ef4444';
        
        // Triger Animation
        btn.classList.remove('wishlist-anim');
        void btn.offsetWidth; // trigger reflow
        btn.classList.add('wishlist-anim');
        
        showToast('Added to Wishlist!');
    }
}

// Add to Cart Button Pop
window.debounceAddToCart = function(btnElement, productId) {
    playPopSound();
    
    // Add pop class
    btnElement.classList.add('btn-pop');
    setTimeout(() => {
        btnElement.classList.remove('btn-pop');
    }, 300);

    addToCart(productId);
}

// Cart Logic
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    saveCart();
    showToast(`${product.name} added to cart!`);
    
    // bounce badge
    cartBadge.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCart();
}

function changeQty(productId, amount) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
            saveCart();
        }
    }
}

function updateCartUI() {
    // Update Counts
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartCount.textContent = totalItems;
    
    // Calculate Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `₹${total}`;
    
    // Render Items
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty" style="display:flex;">
                <ion-icon name="cart-outline"></ion-icon>
                <p>Your cart is empty.</p>
                <button class="btn btn-primary" onclick="closeCartSidebar()">Continue Shopping</button>
            </div>
        `;
        return;
    }
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove Item">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        `;
        cartItemsContainer.appendChild(div);
    });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Side Cart Toggle
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');

function openCartSidebar() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartToggle.addEventListener('click', openCartSidebar);
closeCartBtn.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

// Modal Logic
const modal = document.getElementById('product-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');

window.openModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Populate Data
    document.getElementById('modal-image').src = product.image;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-price').textContent = `₹${product.price}`;
    document.getElementById('modal-description').textContent = product.description;
    
    const badge = document.getElementById('modal-badge');
    if (product.sale) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    // Stars HTML
    let starsHtml = '';
    for(let i=0; i<5; i++) {
        if(i < Math.floor(product.rating)) {
            starsHtml += '<ion-icon name="star"></ion-icon>';
        } else if(i === Math.floor(product.rating) && product.rating % 1 !== 0) {
            starsHtml += '<ion-icon name="star-half"></ion-icon>';
        } else {
            starsHtml += '<ion-icon name="star-outline"></ion-icon>';
        }
    }
    starsHtml += `<span>(${product.rating})</span>`;
    document.getElementById('modal-rating').innerHTML = starsHtml;
    
    // Add to cart binding
    const btn = document.getElementById('modal-add-to-cart');
    btn.onclick = () => {
        debounceAddToCart(btn, product.id);
        setTimeout(() => {
            closeModal();
            openCartSidebar();
        }, 300);
    };
    
    // Open
    modal.classList.add('active');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Toast System
const toastContainer = document.getElementById('toast-container');

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = `
        <ion-icon name="checkmark-circle"></ion-icon>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
