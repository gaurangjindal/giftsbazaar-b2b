import React, { useState, useEffect } from 'react';
import { Heart, Play } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProductCard = ({ product, onClick }) => {
  const { toggleWishlist, isInWishlist, visibilitySettings } = useAppContext();
  
  const productId = product.id || product['Product Code'] || product['Sku Id'] || product['Name'];
  const wishlisted = isInWishlist(productId);
  
  const name = product['Name'] || 'Unnamed Product';
  const code = product['Product Code'] || product['Sku Id'] || '';
  
  // Pricing
  const formatPrice = (priceStr) => {
    if (!priceStr) return null;
    const num = parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return priceStr;
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
    dimensions = length + '(L) × ' + breadth + '(B) × ' + height + '(H)';
  }

  // Image Carousel Logic
  const images = [];
  for (let i = 1; i <= 8; i++) {
    const img = product['Image ' + i];
    if (img && img.trim()) images.push(img.trim());
  }
  if (images.length === 0) {
    images.push(product.imageUrl || 'https://via.placeholder.com/400');
  }

  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 1200); // Change image every 1.2s on hover
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <div 
      onClick={() => onClick && onClick(product)}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden',
        border: '1px solid #eaeaea',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        setIsHovered(true);
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.boxShadow = 'none';
        setIsHovered(false);
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f5f5f0' }}>
        <img 
          src={images[currentImageIndex]} 
          alt={name} 
          style={{ 
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%', objectFit: 'cover'
          }} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400';
          }}
        />

        {/* VIDEO badge */}
        <div style={{ 
          position: 'absolute', top: '0.6rem', left: '0.6rem', 
          backgroundColor: 'rgba(0,0,0,0.55)', padding: '0.2rem 0.45rem', 
          borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '0.2rem' 
        }}>
          <Play fill="white" size={7} color="white" />
          <span style={{ color: 'white', fontSize: '0.575rem', fontWeight: 600, letterSpacing: '0.04em' }}>VIDEO</span>
        </div>

        {/* Heart icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(productId); }}
          style={{ 
            position: 'absolute', top: '0.6rem', right: '0.6rem', 
            backgroundColor: 'white', border: 'none', borderRadius: '50%', 
            width: '26px', height: '26px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
          }}
        >
          <Heart size={12} color={wishlisted ? '#ef4444' : '#999'} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Product Code tag */}
        {visibilitySettings?.['Product Code'] !== false && (
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, 
            backgroundColor: 'white', padding: '0.2rem 0.45rem', 
            borderTopRightRadius: '3px', fontSize: '0.6rem', color: '#888', fontWeight: 500 
          }}>
            {code}
          </div>
        )}

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div style={{ 
            position: 'absolute', bottom: '0.45rem', left: '50%', 
            transform: 'translateX(-50%)', display: 'flex', gap: '4px',
            backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 6px', borderRadius: '10px'
          }}>
            {[...Array(Math.min(images.length, 6))].map((_, i) => (
              <div key={i} style={{ 
                width: '4px', height: '4px', borderRadius: '50%', 
                backgroundColor: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'background-color 0.2s'
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {visibilitySettings?.['Name'] !== false && (
          <h3 style={{ 
            margin: '0 0 0.35rem 0', fontSize: '0.8rem', lineHeight: 1.35, 
            color: '#333', fontWeight: 400, 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', minHeight: '2.2em' 
          }}>
            {name}
          </h3>
        )}

        {/* Dimensions */}
        <div style={{ fontSize: '0.6rem', color: '#aaa', marginBottom: '0.75rem', flexGrow: 1 }}>
          {dimensions || '\u00A0'}
        </div>

        {/* Pricing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.15rem' }}>
          {visibilitySettings?.['Cost Price'] !== false && (
            <div>
              <div style={{ fontSize: '0.5rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cost</div>
              <div style={{ fontSize: '0.8rem', color: '#777' }}>{cost ? '₹' + cost : '-'}</div>
            </div>
          )}
          {visibilitySettings?.['Selling Price'] !== false && (
            <div>
              <div style={{ fontSize: '0.5rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Selling</div>
              <div style={{ fontSize: '0.95rem', color: '#111', fontWeight: 700 }}>{selling ? '₹' + selling : '-'}</div>
            </div>
          )}
          {visibilitySettings?.['MRP'] !== false && (
            <div>
              <div style={{ fontSize: '0.5rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>MRP</div>
              <div style={{ fontSize: '0.7rem', color: '#bbb', textDecoration: 'line-through' }}>{mrp ? '₹' + mrp : '-'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
