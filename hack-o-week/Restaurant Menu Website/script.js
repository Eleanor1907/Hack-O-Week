// Menu Data
const menuData = [
    { id: 1, name: "Garlic Bread", category: "Starters", price: 120, image: "garlic bread.jpeg", tag: "" },
    { id: 2, name: "Paneer Tikka", category: "Starters", price: 220, image: "paneer tikka.jpeg", tag: "Chef's Pick" },
    { id: 3, name: "Alfredo Pasta", category: "Main Course", price: 280, image: "alferedo pasta.jpg", tag: "Popular" },
    { id: 4, name: "Margherita Pizza", category: "Main Course", price: 300, image: "Margherita Pizza.jpeg", tag: "" },
    { id: 5, name: "Cold Coffee", category: "Beverages", price: 120, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400", tag: "" },
    { id: 6, name: "Mojito", category: "Beverages", price: 140, image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=400", tag: "" },
    { id: 7, name: "Brownie", category: "Desserts", price: 150, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400", tag: "Best Seller" },
    { id: 8, name: "Ice Cream Sundae", category: "Desserts", price: 180, image: "Ice Cream Sundae.jpeg", tag: "" }
];

// Initialize Cart Array
let cart = [];

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');
const navbar = document.getElementById('navbar');
const toastContainer = document.getElementById('toast-container');

// Checkout DOM Elements
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-modal-overlay');
const closeCheckoutBtn = document.getElementById('close-checkout');
const placeOrderBtn = document.getElementById('place-order-btn');
const successModal = document.getElementById('success-modal');
const closeSuccessBtn = document.getElementById('close-success-btn');
const checkoutItemsWrapper = document.getElementById('checkout-items');
const checkoutTotalVal = document.getElementById('checkout-total-val');
const payBtns = document.querySelectorAll('.pay-btn');

// Music Elements
const musicToggleBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
let isMusicPlaying = false;

// Custom Cursor Elements
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

// Toggle Cart Drawer
function toggleCart() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

// Show Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    if (window.lucide) {
        window.lucide.createIcons();
    }
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Map Menu Items to HTML
function renderMenu() {
    const categories = [...new Set(menuData.map(item => item.category))];
    let html = '';

    categories.forEach(category => {
        html += `
            <div class="category-block fade-up">
                <h3 class="category-title">${category}</h3>
                <div class="menu-grid">
        `;

        const items = menuData.filter(item => item.category === category);
        items.forEach(item => {
            const tagHtml = item.tag ? `<div class="menu-tag">${item.tag}</div>` : '';
            html += `
                <div class="menu-item-card tilt-card">
                    ${tagHtml}
                    <div class="menu-img-wrap">
                        <img src="${item.image}" alt="${item.name}" class="menu-img">
                    </div>
                    <div class="menu-details">
                        <div class="menu-name-price">
                            <span class="menu-name">${item.name}</span>
                            <span class="menu-price">₹${item.price}</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                            Add to Cart <i data-lucide="plus"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    menuContainer.innerHTML = html;
    
    // Re-initialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Re-initialize tilt
    initTilt();
}

// Cart Functions
function addToCart(id) {
    const item = menuData.find(i => i.id === id);
    const existingItem = cart.find(i => i.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${item.name} to cart`);
    
    // Badge Pop Animation
    cartBadge.classList.add('pop');
    setTimeout(() => cartBadge.classList.remove('pop'), 200);
}

function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Smoothly animate total
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = `₹${Math.floor(progress * (end - start) + start)}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = `₹${end}`;
        }
    };
    window.requestAnimationFrame(step);
}

let lastTotal = 0;
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.innerText = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your luxury dining experience awaits. Add items to your cart.</p>';
    } else {
        let html = '';
        cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">₹${item.price * item.quantity}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="ctrl-btn" onclick="updateQuantity(${item.id}, -1)"><i data-lucide="minus"></i></button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="ctrl-btn" onclick="updateQuantity(${item.id}, 1)"><i data-lucide="plus"></i></button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})"><i data-lucide="trash-2"></i></button>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = html;
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    const currentTotal = calculateTotal();
    animateValue(cartTotalElement, lastTotal, currentTotal, 500);
    lastTotal = currentTotal;
}

// Checkout Flows
checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0) {
        showToast("Your cart is empty.");
        return;
    }
    
    // Render summary and total
    let html = '';
    cart.forEach(item => {
        html += `<div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: var(--text-main);">${item.quantity}x ${item.name}</span>
                    <span style="color: var(--gold);">₹${item.price * item.quantity}</span>
                 </div>`;
    });
    checkoutItemsWrapper.innerHTML = html;
    checkoutTotalVal.innerHTML = `₹${calculateTotal()}`;
    
    toggleCart(); // close cart
    checkoutModal.classList.add('active');
    checkoutOverlay.classList.add('active');
});

closeCheckoutBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
    checkoutOverlay.classList.remove('active');
});

payBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        payBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

placeOrderBtn.addEventListener('click', () => {
    const originalText = placeOrderBtn.innerText;
    placeOrderBtn.innerText = "Processing...";
    
    setTimeout(() => {
        placeOrderBtn.innerText = originalText;
        checkoutModal.classList.remove('active');
        successModal.classList.add('active');
        
        // Empty cart
        cart = [];
        updateCartUI();
    }, 1200);
});

closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    checkoutOverlay.classList.remove('active');
});


// Story Experience & Scroll Effects
const heroThreshold = window.innerHeight * 0.5;

window.addEventListener('scroll', () => {
    // Sticky Navbar
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Background color subtle change for story experience
    if (window.scrollY > heroThreshold) {
        document.body.style.backgroundColor = "#080808"; // slightly darker when entering menu
    } else {
        document.body.style.backgroundColor = "#0f0f0f";
    }
});

// Intersection Observer for fade-ups
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.fade-up');
    hiddenElements.forEach((el) => observer.observe(el));
};

// 3D Tilt Effect on Menu Cards
function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * -10;
            const tiltY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // remove transition for smooth tracking
        });
    });
}

// Hero Title Animation Setup
function setupHeroTextAnimation() {
    const title = document.getElementById('hero-title');
    if(!title) return;
    const text = title.innerText;
    title.innerHTML = '';
    
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char; // preserve space
        span.style.animationDelay = `${index * 0.1}s`;
        title.appendChild(span);
    });
}

// Custom Cursor Logic
document.addEventListener('mousemove', e => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    
    cursorFollower.style.left = `${e.clientX}px`;
    cursorFollower.style.top = `${e.clientY}px`;
});

document.querySelectorAll('a, button, .cart-icon-container').forEach(el => {
    el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
});


// Music Toggle Logic
musicToggleBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicToggleBtn.innerHTML = '<i data-lucide="music"></i>';
        musicToggleBtn.style.background = 'var(--glass-bg)';
        musicToggleBtn.style.color = 'var(--gold)';
    } else {
        bgMusic.play().catch(e => console.log("Audio play failed:", e)); // handle browser autoplay restrictions
        musicToggleBtn.innerHTML = '<i data-lucide="volume-2"></i>';
        musicToggleBtn.style.background = 'var(--gold)';
        musicToggleBtn.style.color = 'var(--bg-dark)';
    }
    isMusicPlaying = !isMusicPlaying;
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

// Re-init listener events on dynamically added content if needed by observing changes
// For simplicity, running things on load suffices for our current structure

document.addEventListener('DOMContentLoaded', () => {
    setupHeroTextAnimation();
    renderMenu();
    updateCartUI();
    observeElements();
});
