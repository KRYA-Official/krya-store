// 1. Mock Data (6 Products)
const products = [
    { id: 1, name: "Premium Smartphone", price: 27000, category: "Mobile", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", desc: "High performance smartphone with 108MP camera." },
    { id: 2, name: "KRYA Neckband", price: 999, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", desc: "Pure bass sound, 20 hrs battery." },
    { id: 3, name: "Organic Apple", price: 180, category: "Grocery", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500", desc: "Farm fresh organic apples, 1kg." },
    { id: 4, name: "Smart Watch Elite", price: 3500, category: "Mobile", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", desc: "Track health and fitness in style." },
    { id: 5, name: "Gaming Headset", price: 4500, category: "Electronics", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500", desc: "Immersive 7.1 surround sound." },
    { id: 6, name: "Special Deal Laptop", price: 45000, category: "Deals", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500", desc: "Super fast processor for business." }
];

// 2. State Management (LocalStorage)
let cart = JSON.parse(localStorage.getItem('krya_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('krya_wishlist')) || [];
let orders = JSON.parse(localStorage.getItem('krya_orders')) || [];
let isDark = localStorage.getItem('krya_theme') === 'dark';

// 3. Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (isDark) document.body.classList.add('dark-mode');
    renderProducts(products);
    updateCartUI();
    renderOrders();
    loadProfile();
    setupEventListeners();
});

// 4. Render Functions
function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (items.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    
    grid.innerHTML = items.map(p => {
        const isWished = wishlist.includes(p.id);
        return `
        <div class="product-card">
            <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist(event, ${p.id})">
                <i class="fa${isWished ? 's' : 'r'} fa-heart"></i>
            </button>
            <img src="${p.image}" alt="${p.name}" onclick="openQuickView(${p.id})">
            <h3 class="mt-10">${p.name}</h3>
            <p class="price">₹${p.price.toLocaleString()}</p>
            <button class="primary-btn full-width mt-10" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
    `}).join('');
}

// 5. Cart Logic (Advanced Billing)
window.addToCart = (id) => {
    const item = cart.find(i => i.id === id);
    if (item) item.qty++;
    else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, qty: 1 });
    }
    saveData('krya_cart', cart);
    updateCartUI();
    showToast("Added to Cart!");
};

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveData('krya_cart', cart);
        updateCartUI();
    }
};

window.removeCartItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveData('krya_cart', cart);
    updateCartUI();
    showToast("Removed from Cart");
};

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-badge').innerText = count;
    document.getElementById('cart-badge').style.display = count > 0 ? 'block' : 'none';

    const cartItems = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const emptyMsg = document.getElementById('empty-cart-msg');

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        summary.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        return;
    }
    
    emptyMsg.classList.add('hidden');
    summary.classList.remove('hidden');

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-info">
                <h4>${item.name}</h4>
                <p class="price">₹${item.price.toLocaleString()}</p>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
            <button class="trash-btn" onclick="removeCartItem(${item.id})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    // Math: Subtotal + ₹40 + 5%
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + 40 + tax;

    document.getElementById('subtotal').innerText = `₹${subtotal.toLocaleString()}`;
    document.getElementById('tax-amount').innerText = `₹${tax.toLocaleString()}`;
    document.getElementById('grand-total').innerText = `₹${grandTotal.toLocaleString()}`;
}

// 6. Profile & Checkout (Validation)
document.getElementById('checkout-btn').addEventListener('click', () => {
    const profile = JSON.parse(localStorage.getItem('krya_profile'));
    if (!profile || !profile.name || !profile.address || profile.address.trim() === "") {
        showToast("⚠️ Please complete your profile address first.");
        switchTab('profile');
        return;
    }

    const newOrder = {
        id: Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString(),
        items: [...cart],
        total: document.getElementById('grand-total').innerText
    };

    orders.unshift(newOrder);
    saveData('krya_orders', orders);
    cart = [];
    saveData('krya_cart', cart);
    updateCartUI();
    renderOrders();
    showToast("Order Placed Successfully!");
    switchTab('orders');
});

document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = {
        name: document.getElementById('user-name').value.trim(),
        email: document.getElementById('user-email').value.trim(),
        address: document.getElementById('user-address').value.trim()
    };
    saveData('krya_profile', profile);
    showToast("Profile Saved!");
});

function loadProfile() {
    const p = JSON.parse(localStorage.getItem('krya_profile'));
    if (p) {
        document.getElementById('user-name').value = p.name || "";
        document.getElementById('user-email').value = p.email || "";
        document.getElementById('user-address').value = p.address || "";
    }
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    list.innerHTML = orders.length > 0 ? orders.map(o => `
        <div class="order-card">
            <span class="status-tag"><i class="fas fa-check-circle"></i> Completed</span>
            <h3>Order #${o.id}</h3>
            <p class="text-muted" style="font-size:0.8em; margin-bottom:10px;">${o.date}</p>
            <p style="font-size:0.9em;">${o.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</p>
            <h4 class="mt-10">Total: ${o.total}</h4>
        </div>
    `).join('') : '<p class="text-muted" style="text-align:center; padding:20px;">No orders yet.</p>';
}

// 7. Utilities & Listeners
window.toggleWishlist = (e, id) => {
    e.stopPropagation();
    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(w => w !== id);
        showToast("Removed from Wishlist");
    } else {
        wishlist.push(id);
        showToast("Added to Wishlist <i class='fas fa-heart'></i>");
    }
    saveData('krya_wishlist', wishlist);
    
    // Refresh current view
    const activeCat = document.querySelector('.cat-btn.active').dataset.cat;
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    let filtered = activeCat === 'All' ? products : products.filter(p => p.category === activeCat);
    if(searchVal) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal));
    renderProducts(filtered);
};

window.openQuickView = (id) => {
    const p = products.find(prod => prod.id === id);
    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc;
    document.getElementById('modal-price').innerText = `₹${p.price.toLocaleString()}`;
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id); closeModal(); };
    document.getElementById('quick-view-modal').style.display = 'flex';
};

window.closeModal = () => document.getElementById('quick-view-modal').style.display = 'none';
document.querySelector('.close-modal').addEventListener('click', closeModal);

window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    window.scrollTo(0, 0);
};

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.dataset.cat;
            const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
            renderProducts(filtered);
            document.getElementById('search-input').value = '';
        });
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const activeCat = document.querySelector('.cat-btn.active').dataset.cat;
        let pool = activeCat === 'All' ? products : products.filter(p => p.category === activeCat);
        renderProducts(pool.filter(p => p.name.toLowerCase().includes(query)));
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('krya_theme', mode);
    });
}

