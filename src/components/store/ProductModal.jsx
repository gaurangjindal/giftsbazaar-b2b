import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Play, Heart, Package, Ruler, Palette } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProductModal = ({ product, onClose, isAdmin = false, onEdit = null }) => {
  const { addToCart, toggleWishlist, isInWishlist, visibilitySettings } = useAppContext();
  const [currentImage, setCurrentImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  // Gather all images from the CSV (Image 1, Image 2, ... Image 8)
  const images = [];
  for (let i = 1; i <= 8; i++) {
    const url = product['Image ' + i];
    if (url && url.trim()) {
      images.push(url.trim());
    }
  }
  // Fallback to the main imageUrl if no Image columns found
  if (images.length === 0 && product.imageUrl) {
    images.push(product.imageUrl);
  }

  const name = product['Name'] || 'Unnamed Product';
  const code = product['Product Code'] || product['Sku Id'] || '';
  const description = product['Description'] || '';

  // Pricing
  const formatPrice = (val) => {
    if (!val) return null;
    const num = parseFloat(val.toString().replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  };

  const cost = formatPrice(product['Cost Price']);
  const selling = formatPrice(product['Selling Price']);
  const mrp = formatPrice(product['MRP']);

  // Dimensions
  const length = product['Packaging Length (in cm)'] || product['Packaging Length'];
  const breadth = product['Packaging Breadth (in cm)'] || product['Packaging Breadth'];
  const height = product['Packaging Height (in cm)'] || product['Packaging Height'];
  let dimensions = '';
  if (length && breadth && height) {
    dimensions = length + '(L) × ' + breadth + '(B) × ' + height + '(H) cm';
  }

  // Extra details
  const details = [
    { label: 'Product Type', value: product['Product Type'], icon: Package },
    { label: 'Colour', value: product['Colour'], icon: Palette },
    { label: 'Size', value: product['Size'], icon: Ruler },
    { label: 'Brand', value: product['attr_Brand name'] },
    { label: 'Material', value: product['attr_material'] },
    { label: 'Theme', value: product['attr_Theme'] },
  ].filter(d => d.value);

  const quantity = parseInt(product['Quantity'] || '0');

  const prevImage = () => setCurrentImage(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentImage(i => (i === images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '900px',
        maxHeight: '90vh',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 1001,
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'row',
        animation: 'modalSlideUp 0.3s ease-out'
      }}>
        {/* Left: Image Carousel */}
        <div style={{ 
          width: '50%', 
          minHeight: '480px',
          backgroundColor: '#f5f5f5', 
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={images[currentImage]} 
            alt={name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              position: 'absolute',
              top: 0, left: 0,
              padding: '1.5rem'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/500';
            }}
          />

          {/* Nav Arrows */}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} style={{
                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <ChevronLeft size={18} color="#333" />
              </button>
              <button onClick={nextImage} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <ChevronRight size={18} color="#333" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: '1rem', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: '6px'
            }}>
              {images.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  style={{
                    width: i === currentImage ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: i === currentImage ? '#333' : '#ccc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} 
                />
              ))}
            </div>
          )}

          {/* Image Counter */}
          <div style={{
            position: 'absolute', top: '1rem', right: '1rem',
            backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff',
            padding: '0.25rem 0.5rem', borderRadius: '4px',
            fontSize: '0.7rem', fontWeight: 500
          }}>
            {currentImage + 1} / {images.length}
          </div>
        </div>

        {/* Right: Product Details */}
        <div style={{ 
          width: '50%', 
          padding: '2rem', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#f5f5f5', border: 'none',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} color="#666" />
          </button>

          {/* Product Code */}
          {visibilitySettings?.['Product Code'] !== false && (
            <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {code}
            </div>
          )}

          {/* Product Name */}
          {visibilitySettings?.['Name'] !== false && (
            <h2 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.5rem', fontWeight: 400, color: '#222',
              lineHeight: 1.3, marginBottom: '1rem'
            }}>
              {name}
            </h2>
          )}

          {/* Dimensions */}
          {dimensions && (
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>
              {dimensions}
            </div>
          )}

          {/* Pricing */}
          <div style={{
            display: 'flex', gap: '2rem', alignItems: 'baseline',
            padding: '1rem 0',
            borderTop: '1px solid #eee',
            borderBottom: '1px solid #eee',
            marginBottom: '1.5rem'
          }}>
            {cost && visibilitySettings?.['Cost Price'] !== false && (
              <div>
                <div style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Cost</div>
                <div style={{ fontSize: '1rem', color: '#666' }}>{'₹' + cost}</div>
              </div>
            )}
            {selling && visibilitySettings?.['Selling Price'] !== false && (
              <div>
                <div style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Selling</div>
                <div style={{ fontSize: '1.5rem', color: '#111', fontWeight: 700 }}>{'₹' + selling}</div>
              </div>
            )}
            {mrp && visibilitySettings?.['MRP'] !== false && (
              <div>
                <div style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>MRP</div>
                <div style={{ fontSize: '1rem', color: '#bbb', textDecoration: 'line-through' }}>{'₹' + mrp}</div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          {details.length > 0 && (
            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {details.map(d => (
                <div key={d.label}>
                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#444' }}>{d.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Description
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>{description}</p>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Add to Cart Section */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            {isAdmin ? (
              <button 
                onClick={onEdit}
                style={{
                  flexGrow: 1, padding: '0 1.5rem', height: '36px',
                  backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                <Palette size={16} /> Edit Product
              </button>
            ) : (
              <>
                {/* Quantity */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid #e5e5e5', borderRadius: '4px', overflow: 'hidden'
                }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1.125rem', color: '#555' }}>−</button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: '1.125rem', color: '#555' }}>+</button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  style={{
                    flexGrow: 1, padding: '0 1.5rem', height: '36px',
                    backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111'}
                >
                  <ShoppingCart size={16} /> Add to Order
                </button>

                {/* Wishlist */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    width: '36px', height: '36px',
                    border: '1px solid ' + (isInWishlist(product.id) ? '#ef4444' : '#e5e5e5'), 
                    borderRadius: '4px',
                    background: isInWishlist(product.id) ? 'rgba(239,68,68,0.05)' : '#fff', 
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <Heart size={16} color={isInWishlist(product.id) ? '#ef4444' : '#999'} fill={isInWishlist(product.id) ? '#ef4444' : 'none'} />
                </button>
              </>
            )}
          </div>

          {/* Stock Info */}
          <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: quantity > 0 ? '#10b981' : '#ef4444' }}>
            {quantity > 0 ? '● ' + quantity + ' in stock' : '● Out of stock'}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: 
        '@keyframes modalSlideUp { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }' +
        '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'
      }} />
    </>
  );
};
