import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Grid, List, ShoppingBag, X, HelpCircle, Send, ChevronDown, ChevronUp, UploadCloud, Heart } from 'lucide-react';
import { State, City } from 'country-state-city';
import { ProductCard } from '../components/store/ProductCard';
import { ProductModal } from '../components/store/ProductModal';
import { ShoppingCart } from '../components/store/ShoppingCart';
import { WishlistDrawer } from '../components/store/WishlistDrawer';
import { useAppContext } from '../context/AppContext';

const SearchableSelect = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: disabled ? '#f5f5f5' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ color: value ? '#111' : '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
        <ChevronDown size={14} color="#999" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50 }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e5e5' }}>
            <input 
              autoFocus
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search..." 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div 
                key={opt.isoCode || opt.name}
                onClick={() => {
                  onChange(opt.name);
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', transition: 'background-color 0.2s', color: '#333' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {opt.name}
              </div>
            )) : (
              <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Storefront = () => {
  const { liveProducts, cart, addProductRequest, managedCategories, wishlist } = useAppContext();
  const products = liveProducts; // Alias for backward compatibility in this file
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, sortBy, itemsPerPage]);

  // Product Request Modal State
  const defaultFormState = { 
    fullName: '', 
    mobileNumber: '', 
    isWhatsappSame: true, 
    whatsappNumber: '', 
    state: '',
    city: '', 
    category: 'Retailer', 
    budgetRange: '', 
    urgency: 'Immediate',
    productName: '', 
    emailAddress: '', 
    expectedQuantity: '', 
    productUrls: '', 
    uploadedImages: [] 
  };
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState(defaultFormState);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [mediaError, setMediaError] = useState('');

  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const selectedState = indianStates.find(s => s.name === requestForm.state);
    if (selectedState) {
      setAvailableCities(City.getCitiesOfState('IN', selectedState.isoCode));
    } else {
      setAvailableCities([]);
    }
  }, [requestForm.state, indianStates]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setRequestForm(prev => ({
            ...prev,
            uploadedImages: [...(prev.uploadedImages || []), dataUrl]
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setRequestForm(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setMobileError('');
    setMediaError('');

    let hasError = false;

    if (requestForm.mobileNumber.length !== 10 || !/^\d{10}$/.test(requestForm.mobileNumber)) {
      setMobileError('Mobile number must be exactly 10 digits.');
      hasError = true;
    }

    if (!requestForm.productUrls.trim() && (!requestForm.uploadedImages || requestForm.uploadedImages.length === 0)) {
      setMediaError('Please either provide a product URL or upload a product image.');
      hasError = true;
    }

    if (!requestForm.fullName || !requestForm.mobileNumber || !requestForm.state || !requestForm.city || !requestForm.budgetRange) hasError = true;
    if (!requestForm.isWhatsappSame && !requestForm.whatsappNumber) hasError = true;
    
    if (hasError) return;
    
    // Add WhatsApp number if same
    const submitData = { ...requestForm, location: `${requestForm.city}, ${requestForm.state}` };
    if (submitData.isWhatsappSame) submitData.whatsappNumber = submitData.mobileNumber;

    addProductRequest(submitData);
    setRequestSubmitted(true);
    setTimeout(() => {
      setIsRequestModalOpen(false);
      setRequestSubmitted(false);
      setRequestForm(defaultFormState);
      setShowAdditionalDetails(false);
    }, 2000);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Extract dynamic categories based on managed list
  const categories = useMemo(() => {
    const activeCats = managedCategories.filter(c => c.status === 'live').map(c => c.name);
    const counts = { 'All': liveProducts.length };
    
    activeCats.forEach(cat => {
      counts[cat] = 0;
    });

    liveProducts.forEach(p => {
      let cat = p['attr_Theme'] || p['Product Type'] || '';
      cat = cat.trim();
      const matchedCat = activeCats.find(c => c.toLowerCase() === cat.toLowerCase());
      if (matchedCat) {
        counts[matchedCat]++;
      }
    });

    // Fallback if no managed categories
    if (managedCategories.length === 0) {
      liveProducts.forEach(p => {
        let cat = p['attr_Theme'] || p['Product Type'];
        if (cat) {
          cat = cat.trim();
          cat = cat.charAt(0).toUpperCase() + cat.slice(1);
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    }

    // Filter out categories with 0 products if we want to keep it clean, but let's keep them so admin sees what they created.
    // Actually, keeping empty categories is good so admin knows they exist.
    return counts;
  }, [liveProducts, managedCategories]);

  const filteredProducts = useMemo(() => {
    let result = liveProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        (product['Name']?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product['Product Code']?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        let cat = product['attr_Theme'] || product['Product Type'] || '';
        cat = cat.trim().toLowerCase();
        matchesCategory = cat === activeCategory.toLowerCase();
      }

      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => parseFloat(a['Selling Price'] || '0') - parseFloat(b['Selling Price'] || '0'));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => parseFloat(b['Selling Price'] || '0') - parseFloat(a['Selling Price'] || '0'));
    }

    return result;
  }, [products, searchTerm, activeCategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 30, 
        backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem'
      }}>
        <div style={{ flexShrink: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, margin: 0, color: '#333' }}>
            Gift <span style={{ fontStyle: 'italic' }}>Décor</span>
          </h1>
          <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#999', textTransform: 'uppercase' }}>
            Wholesale Catalogue
          </div>
        </div>

        <div style={{ flexGrow: 1, maxWidth: '500px', position: 'relative' }}>
          <Search size={15} color="#aaa" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" placeholder="Search name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', 
              borderRadius: '999px', border: '1px solid #e5e5e5',
              backgroundColor: '#fafafa', fontSize: '0.8rem', outline: 'none',
              fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            Showing <strong style={{ color: '#111' }}>{paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of {filteredProducts.length}
          </span>
          <button 
            onClick={() => setIsWishlistOpen(true)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="View Wishlist"
          >
            <Heart size={20} color="#333" />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                backgroundColor: '#ef4444', color: '#fff', fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{wishlist.length}</span>
            )}
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem' }}
          >
            <ShoppingBag size={20} color="#333" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                backgroundColor: '#111', color: '#fff', fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem 2rem', borderBottom: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#c2a878', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
          Premium Home & Office Décor · Resin Artisans · India
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.25rem', fontWeight: 400, color: '#222', maxWidth: '580px', margin: '0 auto 0.75rem auto', lineHeight: 1.2 }}>
          Curated <span style={{ fontStyle: 'italic', color: '#c2a878' }}>Showpieces</span> & Decorative Sculptures
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#888' }}>
          {products.length} unique products · All prices in <strong style={{ color: '#555' }}>Indian Rupees (₹)</strong>
        </p>
      </div>

      {/* Category Nav */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#aaa', textTransform: 'uppercase', fontWeight: 500 }}>Category</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {Object.entries(categories).map(([cat, count]) => {
              if (count < 2 && cat !== 'All') return null;
              const isActive = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: '3px',
                    border: '1px solid ' + (isActive ? '#111' : '#e5e5e5'),
                    backgroundColor: isActive ? '#111' : '#fff',
                    color: isActive ? '#fff' : '#666',
                    fontSize: '0.7rem', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.15s'
                  }}
                >
                  {cat} <span style={{ opacity: 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', width: 'auto', borderRadius: '3px', border: '1px solid #e5e5e5', fontFamily: "'Inter', sans-serif" }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#666' }}>
            <span>Per page:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{ padding: '0.2rem 0.4rem', borderRadius: '3px', border: '1px solid #e5e5e5', backgroundColor: '#fff', fontSize: '0.7rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150</option>
              <option value={200}>200</option>
              <option value={250}>250</option>
            </select>
          </div>
          <div style={{ display: 'flex', border: '1px solid #e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
            <button style={{ padding: '0.3rem 0.4rem', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Grid size={13} /></button>
            <button style={{ padding: '0.3rem 0.4rem', background: '#fff', color: '#ccc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><List size={13} /></button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
            <ShoppingBag size={48} color="#ddd" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No products found.</p>
            <button onClick={() => setIsRequestModalOpen(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={16} /> Request Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5" style={{ gap: '1rem' }}>
            {paginatedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}
        
        {filteredProducts.length > 0 && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', padding: '1rem', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', maxWidth: '350px', margin: '3rem auto 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e5e5e5', backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff', color: currentPage === 1 ? '#999' : '#111', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s' }}
              >
                Previous
              </button>
              
              <span style={{ padding: '0 0.75rem', fontSize: '0.8rem', color: '#555' }}>
                Page <strong style={{ color: '#111' }}>{currentPage}</strong> of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e5e5e5', backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f5f5f5' : '#fff', color: currentPage === totalPages || totalPages === 0 ? '#999' : '#111', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Request Product Button */}
      <button 
        onClick={() => setIsRequestModalOpen(true)} 
        style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          backgroundColor: '#111', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '50px', 
          padding: '1rem 1.5rem', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          fontWeight: 600, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 900,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        }}
        title="Can't find a product? Request it!"
      >
        <HelpCircle size={20} /> Request Product
      </button>

      {/* Product Request Modal */}
      {isRequestModalOpen && (
        <>
          <div onClick={() => setIsRequestModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '480px', zIndex: 1001, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setIsRequestModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><X size={20} color="#666" /></button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>Request a Product</h2>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>Tell us what you need, and our team will get back to you.</p>
            
            {requestSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981' }}>
                <Send size={48} style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Request Sent Successfully!</h3>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Mandatory Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Full Name *</label>
                    <input required type="text" value={requestForm.fullName} onChange={(e) => setRequestForm({...requestForm, fullName: e.target.value})} placeholder="Your full name" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Mobile Number *</label>
                    <input required type="tel" maxLength={10} value={requestForm.mobileNumber} onChange={(e) => setRequestForm({...requestForm, mobileNumber: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box', borderColor: mobileError ? '#ef4444' : '#e5e5e5' }} />
                    {mobileError && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{mobileError}</span>}
                  </div>
                  <div>
                    <div 
                      onClick={() => setRequestForm({...requestForm, isWhatsappSame: !requestForm.isWhatsappSame})}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ width: '36px', height: '20px', backgroundColor: requestForm.isWhatsappSame ? '#111' : '#ccc', borderRadius: '20px', position: 'relative', transition: '0.2s' }}>
                        <div style={{ position: 'absolute', top: '2px', left: requestForm.isWhatsappSame ? '18px' : '2px', width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', transition: '0.2s' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#555', fontWeight: 500 }}>WhatsApp is same as Mobile</span>
                    </div>
                  </div>
                  {!requestForm.isWhatsappSame && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>WhatsApp Number *</label>
                      <input required type="tel" maxLength={10} value={requestForm.whatsappNumber} onChange={(e) => setRequestForm({...requestForm, whatsappNumber: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>State *</label>
                      <SearchableSelect 
                        options={indianStates} 
                        value={requestForm.state} 
                        onChange={(val) => setRequestForm({...requestForm, state: val, city: ''})} 
                        placeholder="Select State" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>City *</label>
                      <SearchableSelect 
                        options={availableCities} 
                        value={requestForm.city} 
                        onChange={(val) => setRequestForm({...requestForm, city: val})} 
                        placeholder="Select City" 
                        disabled={!availableCities.length} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Your Category *</label>
                    <select required value={requestForm.category} onChange={(e) => setRequestForm({...requestForm, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Budget Range *</label>
                    <input required type="text" value={requestForm.budgetRange} onChange={(e) => setRequestForm({...requestForm, budgetRange: e.target.value})} placeholder="e.g. ₹500 - ₹1000" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>When do you want? *</label>
                    <select required value={requestForm.urgency} onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                      <option value="Immediate">Immediate</option>
                      <option value="Within 7 days">Within 7 days</option>
                      <option value="Within 15 days">Within 15 days</option>
                      <option value="Within 30 Days">Within 30 Days</option>
                    </select>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', borderColor: mediaError ? '#ef4444' : '#e5e5e5' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>Upload Product Images *</label>
                      <div 
                        style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff', position: 'relative', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                        onClick={() => document.getElementById('product-image-upload').click()}
                      >
                        <UploadCloud size={24} color="#6b7280" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0, fontWeight: 500 }}>Click to upload product images</p>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>JPG, PNG formats supported</p>
                        <input id="product-image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </div>
                      
                      {requestForm.uploadedImages && requestForm.uploadedImages.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                          {requestForm.uploadedImages.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img src={img} alt="preview" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e5e5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                              <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', margin: '1rem 0' }}>— OR ADD LINKS —</div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Product URLs (Optional)</label>
                      <textarea value={requestForm.productUrls} onChange={(e) => setRequestForm({...requestForm, productUrls: e.target.value})} rows={2} placeholder="Paste multiple product URLs here..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                    </div>
                    {mediaError && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.5rem', display: 'block' }}>{mediaError}</span>}
                  </div>

                  {/* Expandable Additional Details Section */}
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                    <button type="button" onClick={(e) => { e.preventDefault(); setShowAdditionalDetails(prev => !prev); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Additional Details (Optional)</span>
                      {showAdditionalDetails ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
                    </button>
                    
                    {showAdditionalDetails && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '0 0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Product Description</label>
                          <textarea value={requestForm.productName} onChange={(e) => setRequestForm({...requestForm, productName: e.target.value})} rows={2} placeholder="Describe the item, color, size, etc." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Email Address</label>
                          <input type="email" value={requestForm.emailAddress} onChange={(e) => setRequestForm({...requestForm, emailAddress: e.target.value})} placeholder="you@example.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>Expected Qty</label>
                          <input type="text" value={requestForm.expectedQuantity} onChange={(e) => setRequestForm({...requestForm, expectedQuantity: e.target.value})} placeholder="e.g. 50 pieces" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" style={{ marginTop: '0.5rem', padding: '0.875rem', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Submit Request
                </button>
              </form>
            )}
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Shopping Cart */}
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
};
