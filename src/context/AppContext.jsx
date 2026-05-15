import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Updated for new CSV schema
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
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('b2b_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [visibilitySettings, setVisibilitySettings] = useState(() => {
    const saved = localStorage.getItem('b2b_visibility');
    return saved ? JSON.parse(saved) : defaultVisibility;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('b2b_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('b2b_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('b2b_vendors');
    return saved ? JSON.parse(saved) : [];
  });

  const [productRequests, setProductRequests] = useState(() => {
    const saved = localStorage.getItem('b2b_product_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [managedCategories, setManagedCategories] = useState(() => {
    const saved = localStorage.getItem('b2b_managed_categories');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-initialize categories from products if none exist
  useEffect(() => {
    if (managedCategories.length === 0 && products.length > 0) {
      const counts = {};
      products.forEach(p => {
        let cat = p['attr_Theme'] || p['Product Type'] || '';
        cat = cat.trim();
        if (cat) {
          cat = cat.charAt(0).toUpperCase() + cat.slice(1);
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
      // Take top 20 categories to start with a clean list
      const topCats = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name]) => ({
           id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
           name: name,
           status: 'live'
        }));
      setManagedCategories(topCats);
    }
  }, [products, managedCategories.length]);

  useEffect(() => {
    localStorage.setItem('b2b_managed_categories', JSON.stringify(managedCategories));
  }, [managedCategories]);

  useEffect(() => {
    localStorage.setItem('b2b_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('b2b_visibility', JSON.stringify(visibilitySettings));
  }, [visibilitySettings]);

  useEffect(() => {
    localStorage.setItem('b2b_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('b2b_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('b2b_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('b2b_product_requests', JSON.stringify(productRequests));
  }, [productRequests]);

  // Sync state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'b2b_product_requests' && e.newValue) {
        setProductRequests(JSON.parse(e.newValue));
      } else if (e.key === 'b2b_products' && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      } else if (e.key === 'b2b_vendors' && e.newValue) {
        setVendors(JSON.parse(e.newValue));
      } else if (e.key === 'b2b_cart' && e.newValue) {
        setCart(JSON.parse(e.newValue));
      } else if (e.key === 'b2b_wishlist' && e.newValue) {
        setWishlist(JSON.parse(e.newValue));
      } else if (e.key === 'b2b_managed_categories' && e.newValue) {
        setManagedCategories(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  // Products uploaded via CSV start as 'draft'. Admin makes them 'live'.
  // If a product with the same ID already exists, it gets REPLACED (updated).
  const updateProducts = (newProducts) => {
    setProducts(prev => {
      const existingMap = new Map(prev.map(p => [p.id, p]));
      const tagged = newProducts.map(p => ({
        ...p,
        status: existingMap.has(p.id) ? (existingMap.get(p.id).status || 'draft') : 'draft'
      }));
      // Merge: new products replace existing ones with same ID
      const newMap = new Map(tagged.map(p => [p.id, p]));
      // Keep existing products that aren't in the new upload
      prev.forEach(p => {
        if (!newMap.has(p.id)) {
          newMap.set(p.id, p);
        }
      });
      return Array.from(newMap.values());
    });
  };

  // Clear all products (for fresh re-upload)
  const clearAllProducts = () => {
    setProducts([]);
  };

  const addSingleProduct = (product) => {
    setProducts(prev => [{ ...product, status: product.status || 'draft' }, ...prev]);
  };

  // Update a single product (edit)
  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? { ...updatedProduct, status: p.status } : p
    ));
  };

  // Toggle a single product live/draft
  const toggleProductStatus = (productId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === 'live' ? 'draft' : 'live' } 
        : p
    ));
  };

  // Make ALL products live at once
  const makeAllLive = () => {
    setProducts(prev => prev.map(p => ({ ...p, status: 'live' })));
  };

  // Make ALL products draft at once
  const makeAllDraft = () => {
    setProducts(prev => prev.map(p => ({ ...p, status: 'draft' })));
  };

  // Delete a product
  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    // Also remove from cart if present
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Vendor Functions
  const addVendor = (vendor) => {
    setVendors(prev => [{ ...vendor, id: vendor.id || generateId() }, ...prev]);
  };

  const updateVendor = (updatedVendor) => {
    setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const deleteVendor = (vendorId) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
  };

  const clearAllVendors = () => {
    setVendors([]);
  };

  const updateVendors = (newVendors) => {
    setVendors(prev => {
      const newMap = new Map(newVendors.map(v => [v.id, v]));
      prev.forEach(v => {
        if (!newMap.has(v.id)) {
          newMap.set(v.id, v);
        }
      });
      return Array.from(newMap.values());
    });
  };

  // Product Requests
  const addProductRequest = (requestDetails) => {
    const newReq = {
      id: generateId(),
      ...requestDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setProductRequests(prev => [newReq, ...prev]);
  };

  const updateProductRequestStatus = (id, newStatus) => {
    setProductRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: newStatus, resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : null } : r
    ));
  };
  
  const deleteProductRequest = (id) => {
    setProductRequests(prev => prev.filter(r => r.id !== id));
  };

  const toggleVisibility = (field) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
  
  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Category Management
  const addCategory = (name) => {
    setManagedCategories(prev => [...prev, { id: Date.now().toString(), name, status: 'live' }]);
  };
  const updateCategory = (id, newName) => {
    setManagedCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };
  const deleteCategory = (id) => {
    setManagedCategories(prev => prev.filter(c => c.id !== id));
  };
  const toggleCategoryStatus = (id) => {
    setManagedCategories(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'live' ? 'draft' : 'live' } : c));
  };

  // Only live products are visible to customers, AND their category must be live
  const activeCategoryNames = managedCategories.filter(c => c.status === 'live').map(c => c.name.toLowerCase());
  
  const liveProducts = products.filter(p => {
    if (p.status !== 'live') return false;
    // Allow if no categories are managed yet (fallback)
    if (managedCategories.length === 0) return true;
    
    let cat = p.category || p['attr_Theme'] || p['Product Type'] || '';
    cat = cat.trim().toLowerCase();
    return activeCategoryNames.includes(cat);
  });

  const value = {
    products,
    liveProducts,
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
    
    // Vendor State & Actions
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    clearAllVendors,
    updateVendors,

    // Managed Categories
    managedCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,

    // Product Requests
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
