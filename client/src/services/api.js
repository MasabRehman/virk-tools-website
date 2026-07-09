const API_URL = import.meta.env.VITE_API_URL || 'https://virk-tools-website.onrender.com/api/v1';

export const api = {
  // Products
  getProducts: async (filters = '') => {
    const res = await fetch(`${API_URL}/products${filters}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  
  getFeaturedProducts: async () => {
    const res = await fetch(`${API_URL}/products/featured?limit=4`);
    if (!res.ok) throw new Error('Failed to fetch featured products');
    return res.json();
  },
  
  getProductById: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getSubcategoriesByCategoryId: async (categoryId) => {
    const res = await fetch(`${API_URL}/categories/${categoryId}/subcategories`);
    if (!res.ok) throw new Error('Failed to fetch subcategories');
    return res.json();
  },

  // Brands
  getBrands: async () => {
    const res = await fetch(`${API_URL}/brands`);
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  },

  // Cart
  getCartHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    const sessionToken = localStorage.getItem('cart_session_token');
    if (sessionToken) {
      headers['x-cart-session'] = sessionToken;
    }
    return headers;
  },

  handleCartResponse: async (res) => {
    if (!res.ok) throw new Error('Failed to process cart request');
    const data = await res.json();
    if (data.session_token) {
      localStorage.setItem('cart_session_token', data.session_token);
    }
    return data;
  },

  getCart: async () => {
    const res = await fetch(`${API_URL}/cart`, {
      headers: api.getCartHeaders(),
      credentials: 'include'
    });
    return api.handleCartResponse(res);
  },

  addToCart: async (productId, quantity, variantId = null, subcategoryId = null) => {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: api.getCartHeaders(),
      credentials: 'include',
      body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId, subcategory_id: subcategoryId }),
    });
    return api.handleCartResponse(res);
  },

  updateCartItem: async (itemId, quantity) => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: api.getCartHeaders(),
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
    return api.handleCartResponse(res);
  },

  removeCartItem: async (itemId) => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: api.getCartHeaders(),
      credentials: 'include'
    });
    return api.handleCartResponse(res);
  },

  // Checkout
  getDeliveryFee: async (city) => {
    const res = await fetch(`${API_URL}/orders/delivery-fee?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error('Failed to fetch delivery fee');
    return res.json();
  },

  checkout: async (checkoutData) => {
    const res = await fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: api.getCartHeaders(),
      body: JSON.stringify(checkoutData),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Checkout failed');
    return res.json();
  },

  // Admin
  adminLogin: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  getAdminHeaders: () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  adminGetProducts: async () => {
    const res = await fetch(`${API_URL}/admin/products?limit=1000`, {
      headers: api.getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin products');
    return res.json();
  },

  adminGetProductById: async (id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      headers: api.getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch product details');
    return res.json();
  },

  adminCreateProduct: async (productData) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      let msg = 'Failed to create product';
      try { const errData = await res.json(); msg = errData.message || errData.errors?.[0]?.msg || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminUpdateProduct: async (id, productData) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      let msg = 'Failed to update product';
      try { const errData = await res.json(); msg = errData.message || errData.errors?.[0]?.msg || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminDeleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: api.getAdminHeaders()
    });
    if (!res.ok) {
      let msg = 'Failed to delete product';
      try { const errData = await res.json(); msg = errData.message || errData.errors?.[0]?.msg || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminUploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type, the browser will set it to multipart/form-data with the boundary
      },
      body: formData
    });
    if (!res.ok) {
      let msg = 'Failed to upload image';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminCreateBrand: async (brandData) => {
    const res = await fetch(`${API_URL}/admin/brands`, {
      method: 'POST',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(brandData)
    });
    if (!res.ok) {
      let msg = 'Failed to create brand';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminGetCategories: () => fetch(`${API_URL}/admin/categories`, { headers: api.getAdminHeaders() }).then(res => res.json()),
  
  adminCreateCategory: async (categoryData) => {
    const res = await fetch(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) {
      let msg = 'Failed to create category';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminUpdateCategory: async (id, categoryData) => {
    const res = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) {
      let msg = 'Failed to update category';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminDeleteCategory: async (id) => {
    const res = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: api.getAdminHeaders()
    });
    if (!res.ok) {
      let msg = 'Failed to delete category';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminGetSubcategories: (categoryId) => fetch(`${API_URL}/admin/categories/${categoryId}/subcategories`, { headers: api.getAdminHeaders() }).then(res => res.json()),

  adminCreateSubcategory: async (categoryId, subData) => {
    const res = await fetch(`${API_URL}/admin/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: api.getAdminHeaders(),
      body: JSON.stringify(subData)
    });
    if (!res.ok) {
      let msg = 'Failed to create subcategory';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminDeleteSubcategory: async (categoryId, subId) => {
    const res = await fetch(`${API_URL}/admin/categories/${categoryId}/subcategories/${subId}`, {
      method: 'DELETE',
      headers: api.getAdminHeaders()
    });
    if (!res.ok) {
      let msg = 'Failed to delete subcategory';
      try { const errData = await res.json(); msg = errData.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  adminGetOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/orders?${query}`, {
      headers: api.getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  adminGetOrderById: async (id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: api.getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  adminGetDashboardStats: async () => {
    const res = await fetch(`${API_URL}/admin/orders/stats`, {
      headers: api.getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  adminDownloadExcel: () => {
    const token = localStorage.getItem('admin_token');
    return `${API_URL}/admin/orders/export/excel?token=${token}`;
  },

  adminUpdateOrderStatus: async (id, status, notes = '') => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: api.getAdminHeaders(),
      body: JSON.stringify({ confirmation_status: status, admin_notes: notes })
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  }
};
