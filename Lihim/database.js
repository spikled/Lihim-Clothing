// database.js - Shared Database System using localStorage

const DB = {
    // Initialize database with sample data if empty
    init() {
        if (!localStorage.getItem('lihim_products')) {
            this.resetProducts();
        }
        if (!localStorage.getItem('lihim_orders')) {
            localStorage.setItem('lihim_orders', JSON.stringify([]));
        }
    },

    // Products CRUD
    getProducts() {
        return JSON.parse(localStorage.getItem('lihim_products') || '[]');
    },

    getProduct(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'prod_' + Date.now();
        product.createdAt = new Date().toISOString();
        product.sold = 0;
        products.push(product);
        localStorage.setItem('lihim_products', JSON.stringify(products));
        return product;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('lihim_products', JSON.stringify(products));
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('lihim_products', JSON.stringify(products));
    },

    // Orders CRUD
    getOrders() {
        return JSON.parse(localStorage.getItem('lihim_orders') || '[]');
    },

    getOrder(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    },

    addOrder(order) {
        const orders = this.getOrders();
        order.id = 'order_' + Date.now();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.push(order);
        localStorage.setItem('lihim_orders', JSON.stringify(orders));
        
        // Update product sold counts
        order.items.forEach(item => {
            const product = this.getProduct(item.productId);
            if (product) {
                this.updateProduct(item.productId, {
                    sold: product.sold + 1,
                    stock: product.stock - 1
                });
            }
        });
        
        return order;
    },

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem('lihim_orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    },

    deleteOrder(id) {
        let orders = this.getOrders();
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('lihim_orders', JSON.stringify(orders));
    },

    // Analytics
    getAnalytics() {
        const orders = this.getOrders();
        const products = this.getProducts();
        
        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);
        
        const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
        
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const topProducts = products
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);
        
        return {
            totalRevenue,
            totalOrders,
            totalProducts: products.length,
            avgOrder,
            topProducts
        };
    },

    // Reset to sample data
    resetProducts() {
        const sampleProducts = [
            {
                id: 'prod_1',
                name: 'Lihim Signature Hoodie',
                category: 'Hoodies',
                price: 1999,
                stock: 50,
                discount: 20,
                image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop',
                description: 'Premium cotton blend hoodie with signature embroidery',
                active: true,
                sold: 1200,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_2',
                name: 'Oversized Black Tee',
                category: 'T-Shirts',
                price: 899,
                stock: 100,
                discount: 15,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
                description: 'Relaxed fit oversized t-shirt in premium cotton',
                active: true,
                sold: 850,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_3',
                name: 'Cargo Pants - Olive',
                category: 'Bottoms',
                price: 2499,
                stock: 30,
                discount: 0,
                image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=400&auto=format&fit=crop',
                description: 'Tactical cargo pants with multiple pockets',
                active: true,
                sold: 420,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_4',
                name: 'Essential White Tee',
                category: 'T-Shirts',
                price: 699,
                stock: 150,
                discount: 10,
                image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=400&auto=format&fit=crop',
                description: 'Classic white crew neck t-shirt',
                active: true,
                sold: 1500,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_5',
                name: 'Zip-Up Hoodie Grey',
                category: 'Hoodies',
                price: 2299,
                stock: 40,
                discount: 25,
                image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=400&auto=format&fit=crop',
                description: 'Full zip hoodie with fleece lining',
                active: true,
                sold: 680,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_6',
                name: 'Denim Jacket - Classic Blue',
                category: 'Hoodies',
                price: 3499,
                stock: 20,
                discount: 0,
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop',
                description: 'Vintage style denim jacket',
                active: true,
                sold: 320,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_7',
                name: 'Jogger Pants Black',
                category: 'Bottoms',
                price: 1799,
                stock: 60,
                discount: 15,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop',
                description: 'Comfortable joggers with elastic waistband',
                active: true,
                sold: 920,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_8',
                name: 'Graphic Tee Collection',
                category: 'T-Shirts',
                price: 999,
                stock: 80,
                discount: 20,
                image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop',
                description: 'Limited edition graphic print tee',
                active: true,
                sold: 750,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_9',
                name: 'Canvas Tote Bag',
                category: 'Accessories',
                price: 599,
                stock: 100,
                discount: 0,
                image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop',
                description: 'Eco-friendly canvas tote with logo',
                active: true,
                sold: 540,
                createdAt: new Date().toISOString()
            },
            {
                id: 'prod_10',
                name: 'Beanie Hat Black',
                category: 'Accessories',
                price: 499,
                stock: 120,
                discount: 10,
                image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=400&auto=format&fit=crop',
                description: 'Warm knit beanie with embroidered logo',
                active: true,
                sold: 890,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('lihim_products', JSON.stringify(sampleProducts));
    }
};

// Initialize database on load
DB.init();