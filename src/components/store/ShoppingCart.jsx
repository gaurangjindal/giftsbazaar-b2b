import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ShoppingCart = ({ isOpen, onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useAppContext();

  // Support both new and old schema keys for backward compatibility during testing
  const total = cart.reduce((sum, item) => {
    const priceStr = item['Selling Price'] || item['Selling price'] || item['MRP'] || '0';
    const price = parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, '')) || 0;
    return sum + (price * item.quantity);
  }, 0);

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
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
            <ShoppingBag size={24} color="var(--accent-primary)" />
            Your Cart
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item['Name']} 
                    style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
                  />
                  
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item['Name']}
                    </h4>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      ₹{item['Selling Price'] || item['Selling price'] || item['MRP'] || '0'}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.125rem' }}>
                        <button 
                          className="btn-icon" 
                          style={{ padding: '0.25rem' }}
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.875rem', width: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          className="btn-icon" 
                          style={{ padding: '0.25rem' }}
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        className="btn-icon" 
                        style={{ color: 'var(--danger)', padding: '0.25rem' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary w-full" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="btn btn-primary w-full">
                Checkout
              </button>
            </div>
          </div>
        )}
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
