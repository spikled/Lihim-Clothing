// admin.js - Admin Dashboard Functionality

let currentTab = 'products';
let currentOrderFilter = 'all';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    showTab('products');
    loadProducts();
    loadOrders();
    loadAnalytics();
});

// Tab Navigation
function showTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update nav
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.style.borderColor = 'transparent';
    });
    event?.target?.style.borderColor = '#fff';
}

// Product Management
function loadProducts() {
    const products = DB.getProducts();
    const tbody = document.getElementById('products-tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">No products yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const discountedPrice = product.discount > 0 
            ? product.price * (1 - product.discount / 100) 
            : product.price;
        
        return `
            <tr>
                <td><div class="product-img-thumb" style="background-image: url('${product.image}');"></div></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₱${discountedPrice.toLocaleString()}${product.discount > 0 ? ` <small style="color: #888; text-decoration: line-through;">₱${product.price.toLocaleString()}</small>` : ''}</td>
                <td>${product.stock}</td>
                <td>${product.sold}</td>
                <td><span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">${product.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="action-btn" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddProduct() {
    document.getElementById('product-modal-title').innerText = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(id) {
    const product = DB.getProduct(id);
    if (!product) return;
    
    document.getElementById('product-modal-title').innerText = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-discount').value = product.discount || 0;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-active').checked = product.active;
    
    document.getElementById('productModal').style.display = 'block';
}

function saveProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const productId = document.getElementById('product-id').value;
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        discount: parseInt(document.getElementById('product-discount').value) || 0,
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        active: document.getElementById('product-active').checked
    };
    
    if (productId) {
        // Update existing product
        DB.updateProduct(productId, productData);
    } else {
        // Add new product
        DB.addProduct(productData);
    }
    
    closeProductModal();
    loadProducts();
    loadAnalytics();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        DB.deleteProduct(id);
        loadProducts();
        loadAnalytics();
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Order Management
function loadOrders() {
    let orders = DB.getOrders();
    
    // Apply filter
    if (currentOrderFilter !== 'all') {
        orders = orders.filter(o => o.status === currentOrderFilter);
    }
    
    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const tbody = document.getElementById('orders-tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #888;">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    ${order.customer.name}<br>
                    <small style="color: #888;">${order.customer.email}</small>
                </td>
                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                <td><strong>₱${order.total.toLocaleString()}</strong></td>
                <td>${date}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <button class="action-btn" onclick="viewOrder('${order.id}')">View</button>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px; font-size: 12px; margin-left: 5px;">
                        <option value="">Change Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function filterOrders(status) {
    currentOrderFilter = status;
    loadOrders();
}

function viewOrder(id) {
    const order = DB.getOrder(id);
    if (!order) return;
    
    const date = new Date(order.createdAt).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const details = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">Order #${order.id}</h3>
            <p style="color: #888; margin-bottom: 5px;">${date}</p>
            <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">Customer Information</h4>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong><br>${order.customer.address}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">Order Items</h4>
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #f9f9f9;">
                    <span>${item.name}</span>
                    <span><strong>₱${item.price.toLocaleString()}</strong></span>
                </div>
            `).join('')}
        </div>
        
        <div style="background: #f9f9f9; padding: 15px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span>₱${order.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Shipping:</span>
                <span>₱${order.shipping.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #000; font-size: 18px; font-weight: 700;">
                <span>Total:</span>
                <span>₱${order.total.toLocaleString()}</span>
            </div>
        </div>
        
        <div>
            <h4 style="margin-bottom: 10px;">Payment Method</h4>
            <p>${order.paymentMethod.toUpperCase()}</p>
        </div>
    `;
    
    document.getElementById('order-details').innerHTML = details;
    document.getElementById('orderModal').style.display = 'block';
}

function updateOrderStatus(orderId, status) {
    if (!status) return;
    
    DB.updateOrder(orderId, { status: status });
    loadOrders();
    
    // Reset dropdown
    event.target.value = '';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// Analytics
function loadAnalytics() {
    const analytics = DB.getAnalytics();
    
    document.getElementById('total-revenue').innerText = `₱${analytics.totalRevenue.toLocaleString()}`;
    document.getElementById('total-orders').innerText = analytics.totalOrders;
    document.getElementById('total-products').innerText = analytics.totalProducts;
    document.getElementById('avg-order').innerText = `₱${Math.round(analytics.avgOrder).toLocaleString()}`;
    
    // Top products
    const topProductsDiv = document.getElementById('top-products');
    
    if (analytics.topProducts.length === 0) {
        topProductsDiv.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No sales data yet</p>';
        return;
    }
    
    topProductsDiv.innerHTML = analytics.topProducts.map((product, index) => `
        <div class="top-product-item">
            <div>
                <div style="font-size: 24px; color: #888; margin-bottom: 5px;">#${index + 1}</div>
                <div class="top-product-info">${product.name}</div>
                <div style="font-size: 12px; color: #888; margin-top: 3px;">${product.category}</div>
            </div>
            <div style="text-align: right;">
                <div class="top-product-sales">${product.sold} sold</div>
                <div style="font-size: 14px; color: #888;">₱${product.price.toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === orderModal) {
        closeOrderModal();
    }
}