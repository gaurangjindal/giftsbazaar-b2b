import React from 'react';
import { X, Trash2, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist, products } = useAppContext();

  // Find the actual product objects for the IDs in the wishlist
  const wishlistedProducts = products.filter(product => {
    const productId = product.id || product['Product Code'] || product['Sku Id'] || product['Name'];
    return wishlist.includes(productId);
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '400px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          transform: 'translateX(0)',
          animation: 'slideIn 0.3s ease-out',
          backgroundColor: '#fff'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontFamily: "'Playfair Display', serif" }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
            My Wishlist
          </h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }} onClick={onClose}>
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Wishlist Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {wishlistedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>
              <Heart size={48} color="#e5e5e5" style={{ margin: '0 auto 1rem auto' }} />
              <p>Your wishlist is empty.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wishlistedProducts.map(item => {
                const pId = item.id || item['Product Code'] || item['Sku Id'] || item['Name'];
                const sellingPrice = item['Selling Price'] || item['Selling price'] || item['MRP'] || '0';
                
                // Get first image
                let imgUrl = item.imageUrl;
                if (!imgUrl) {
                  for (let i = 1; i <= 8; i++) {
                    if (item['Image ' + i] && item['Image ' + i].trim()) {
                      imgUrl = item['Image ' + i].trim();
                      break;
                    }
                  }
                }
                
                return (
                  <div key={pId} style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #eaeaea'
                  }}>
                    <img 
                      src={imgUrl || 'https://via.placeholder.com/100'} 
                      alt={item['Name']} 
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                    
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: '#333', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item['Name'] || 'Unnamed Product'}
                      </h4>
                      <div style={{ color: '#111', fontWeight: 600, fontSize: '0.875rem' }}>
                        ₹{sellingPrice}
                      </div>
                    </div>
                    
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#999', alignSelf: 'center', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                      onClick={() => toggleWishlist(pId)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
};
