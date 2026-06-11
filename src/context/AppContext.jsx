import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const defaultVisibility = {
  'Name': true,
  'Product Code': true,
  'Sku Id': false,
  'Cost Price': false,
  'MRP': true,
  'Selling Price': true,
  'Quantity': true,
  'Product Type': true,
  'Size': true,
  'Colour': true,
  'attr_Brand name': true,
  'attr_material': false,
  'attr_Theme': false,
  'Description': false,
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [visibilitySettings, setVisibilitySettings] = useState(defaultVisibility);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('b2b_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('b2b_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [vendors, setVendors] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [managedCategories, setManagedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, venRes, reqRes, visRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/vendors`),
          axios.get(`${API_BASE_URL}/requests`),
          axios.get(`${API_BASE_URL}/settings/visibility`)
        ]);

        setProducts(prodRes.data);
        setManagedCategories(catRes.data);
        setVendors(venRes.data);
        setProductRequests(reqRes.data);
        if (Object.keys(visRes.data).length > 0) {
          setVisibilitySettings(visRes.data);
        }
      } catch (err) {
        console.error('Error fetching data from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync Cart and Wishlist to localStorage (Client-side only for now)
  useEffect(() => {
    localStorage.setItem('b2b_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('b2b_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Actions
  const updateProducts = async (newProducts) => {
    try {
      await axios.post(`${API_BASE_URL}/products/bulk`, newProducts);
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error updating products:', err);
    }
  };

  const clearAllProducts = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/products`);
      setProducts([]);
    } catch (err) {
      console.error('Error clearing products:', err);
    }
  };

  const addSingleProduct = async (product) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/products`, product);
      setProducts(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/products/${updatedProduct.id}`, updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? res.data : p));
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const toggleProductStatus = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStatus = product.status === 'live' ? 'draft' : 'live';
    try {
      const res = await axios.put(`${API_BASE_URL}/products/${productId}`, { status: newStatus });
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
    } catch (err) {
      console.error('Error toggling product status:', err);
    }
  };

  const makeAllLive = async () => {
    try {
      const updates = products.map(p => ({ ...p, status: 'live' }));
      await axios.post(`${API_BASE_URL}/products/bulk`, updates);
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error making all products live:', err);
    }
  };

  const makeAllDraft = async () => {
    try {
      const updates = products.map(p => ({ ...p, status: 'draft' }));
      await axios.post(`${API_BASE_URL}/products/bulk`, updates);
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error making all products draft:', err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCart(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Vendor Actions
  const addVendor = async (vendor) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/vendors`, vendor);
      setVendors(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding vendor:', err);
    }
  };

  const updateVendor = async (updatedVendor) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/vendors/${updatedVendor._id}`, updatedVendor);
      setVendors(prev => prev.map(v => v._id === updatedVendor._id ? res.data : v));
    } catch (err) {
      console.error('Error updating vendor:', err);
    }
  };

  const deleteVendor = async (vendorId) => {
    try {
      await axios.delete(`${API_BASE_URL}/vendors/${vendorId}`);
      setVendors(prev => prev.filter(v => v._id !== vendorId));
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
  };

  // Category Actions
  const addCategory = async (name) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/categories`, { name });
      setManagedCategories(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const updateCategory = async (id, newName) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/categories/${id}`, { name: newName });
      setManagedCategories(prev => prev.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
      setManagedCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const toggleCategoryStatus = async (id) => {
    const cat = managedCategories.find(c => c._id === id);
    if (!cat) return;
    const newStatus = cat.status === 'live' ? 'draft' : 'live';
    try {
      const res = await axios.put(`${API_BASE_URL}/categories/${id}`, { status: newStatus });
      setManagedCategories(prev => prev.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error('Error toggling category status:', err);
    }
  };

  // Request Actions
  const addProductRequest = async (requestDetails) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/requests`, requestDetails);
      setProductRequests(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding product request:', err);
    }
  };

  const updateProductRequestStatus = async (id, newStatus) => {
    const resolvedAt = newStatus === 'resolved' ? new Date().toISOString() : null;
    try {
      const res = await axios.put(`${API_BASE_URL}/requests/${id}`, { status: newStatus, resolvedAt });
      setProductRequests(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  const deleteProductRequest = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/requests/${id}`);
      setProductRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  // Visibility Settings
  const toggleVisibility = async (field) => {
    const updatedSettings = {
      ...visibilitySettings,
      [field]: !visibilitySettings[field]
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/settings/visibility`, updatedSettings);
      setVisibilitySettings(res);
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  // Cart & Wishlist (Keep in state and localStorage)
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Derived State
  const activeCategoryNames = managedCategories.filter(c => c.status === 'live').map(c => c.name.toLowerCase());
  
  const liveProducts = products.filter(p => {
    if (p.status !== 'live') return false;
    if (managedCategories.length === 0) return true;
    let cat = p.category || p['attr_Theme'] || p['Product Type'] || '';
    cat = cat.trim().toLowerCase();
    return activeCategoryNames.includes(cat);
  });

  const value = {
    products,
    liveProducts,
    loading,
    updateProducts,
    addSingleProduct,
    updateProduct,
    clearAllProducts,
    toggleProductStatus,
    makeAllLive,
    makeAllDraft,
    deleteProduct,
    visibilitySettings,
    toggleVisibility,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    isInWishlist,
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    managedCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    productRequests,
    addProductRequest,
    updateProductRequestStatus,
    deleteProductRequest
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
