// script.js - Customer Shop Functionality

let cart = [];
let allProducts = [];
let filteredProducts = [];
let currentSort = 'popular';

// Initialize shop
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

// Load products from database
function loadProducts() {
    allProducts = DB.getProducts().filter(p => p.active);
    filteredProducts = [...allProducts];
    sortProducts(currentSort);
    displayProducts();
}

// Display products
function displayProducts() {
    const grid = document.getElementById('product-grid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">No products found</div>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => {
        const discountedPrice = product.discount > 0 
            ? product.price * (1 - product.discount / 100) 
            : product.price;
        
        return `
            <div class="product-card">
                ${product.discount > 0 ? `<div class="badge-discount">${product.discount}% OFF</div>` : ''}
                <div class="prod-img" style="background-image: url('${product.image}');"></div>
                <div class="prod-details">
                    <p class="prod-title">${product.name}</p>
                    <div class="price-row">
                        <span class="price">₱${discountedPrice.toLocaleString()}</span>
                        <span class="sold">${formatSold(product.sold)} sold</span>
                    </div>
                    ${product.stock > 0 
                        ? `<button class="add-btn" onclick="addToCart('${product.id}')">Add to Cart</button>`
                        : `<button class="add-btn" disabled style="background: #ccc; cursor: not-allowed;">Out of Stock</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Format sold count
function formatSold(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count;
}

// Sort products
function sortProducts(type) {
    currentSort = type;
    
    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    switch(type) {
        case 'popular':
            filteredProducts.sort((a, b) => b.sold - a.sold);
            break;
        case 'latest':
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => {
                const priceA = a.price * (1 - a.discount / 100);
                const priceB = b.price * (1 - b.discount / 100);
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => {
                const priceA = a.price * (1 - a.discount / 100);
                const priceB = b.price * (1 - b.discount / 100);
                return priceB - priceA;
            });
            break;
    }
    
    displayProducts();
}

// Apply filters
function applyFilters() {
    const checkedCategories = Array.from(document.querySelectorAll('.filter-group input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    const minPrice = parseInt(document.getElementById('min-price').value) || 0;
    const maxPrice = parseInt(document.getElementById('max-price').value) || Infinity;
    
    filteredProducts = allProducts.filter(product => {
        const price = product.price * (1 - product.discount / 100);
        
        const categoryMatch = checkedCategories.length === 0 || checkedCategories.includes(product.category);
        const priceMatch = price >= minPrice && price <= maxPrice;
        
        return categoryMatch && priceMatch;
    });
    
    sortProducts(currentSort);
}

// Clear filters
function clearFilters() {
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    
    filteredProducts = [...allProducts];
    sortProducts(currentSort);
}

// Search products
function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    if (!query) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }
    
    sortProducts(currentSort);
}

// Allow search on Enter key
document.getElementById('search-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// Cart Functions
function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('active');
}

function addToCart(productId) {
    const product = DB.getProduct(productId);
    if (!product || product.stock <= 0) {
        alert('Product is out of stock');
        return;
    }
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        alert('This item is already in your cart');
        return;
    }
    
    const discountedPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
    
    cart.push({
        productId: product.id,
        name: product.name,
        price: discountedPrice,
        image: product.image
    });
    
    saveCart();
    updateCartUI();
    toggleCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    badge.innerText = cart.length;
    document.getElementById('cart-total').innerText = `₱${total.toLocaleString()}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Your bag is empty.</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-img" style="background-image: url('${item.image}');"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toLocaleString()}</div>
                    <button class="cart-item-remove" onclick="removeItem(${index})">Remove</button>
                </div>
            </div>
        `).join('');
    }
}

function saveCart() {
    localStorage.setItem('lihim_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('lihim_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = 150;
    const total = subtotal + shipping;
    
    document.getElementById('checkout-items').innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name}</span>
            <span>₱${item.price.toLocaleString()}</span>
        </div>
    `).join('');
    
    document.getElementById('checkout-subtotal').innerText = `₱${subtotal.toLocaleString()}`;
    document.getElementById('checkout-total').innerText = `₱${total.toLocaleString()}`;
    
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function processOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipping = 150;
    const total = subtotal + shipping;
    
    const order = {
        customer: {
            name: form.elements[0].value,
            email: form.elements[1].value,
            phone: form.elements[2].value,
            address: form.elements[3].value
        },
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        paymentMethod: form.elements[4].value
    };
    
    DB.addOrder(order);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    
    closeCheckout();
    toggleCart();
    
    alert('Order placed successfully! Order ID: ' + order.id);
    
    form.reset();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const checkoutModal = document.getElementById('checkoutModal');
    if (event.target === checkoutModal) {
        closeCheckout();
    }
}