import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CsvUploader } from '../components/admin/CsvUploader';
import { ProductForm } from '../components/admin/ProductForm';
import { FieldVisibilityToggle } from '../components/admin/FieldVisibilityToggle';
import { ProductTable } from '../components/admin/ProductTable';
import { VendorManagement } from '../components/admin/VendorManagement';
import { ProductRequests } from '../components/admin/ProductRequests';
import { CategoryManagement } from '../components/admin/CategoryManagement';
import { Users, BarChart3, Eye, EyeOff, HelpCircle, Tag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const { products, vendors, productRequests } = useAppContext();
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard', 'products', 'vendors', 'requests'
  const [activeUploadTab, setActiveUploadTab] = useState('upload'); // 'upload' or 'manual'

  const liveProductsCount = products.filter(p => p.status === 'live').length;
  const draftProductsCount = products.length - liveProductsCount;
  const pendingRequestsCount = productRequests?.filter(r => r.status === 'pending').length || 0;

  // Calculate unique vendors dynamically from products based on pickup address code
  const uniqueVendorsCount = new Set(
    products
      .map(p => p['pickup address code'] || p['Pickup Address Code'] || p['pickup Address Code'] || p['Pickup address code'] || p['Vendor Code'] || p['vendor code'])
      .filter(Boolean)
  ).size;

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Dashboard Overview</h2>
          
          {/* Analytics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Users size={16} /> Total Vendors
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>{uniqueVendorsCount}</div>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Package size={16} /> Total Products
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>{products.length}</div>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Eye size={16} /> Live Products
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>{liveProductsCount}</div>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <EyeOff size={16} /> Draft Products
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>{draftProductsCount}</div>
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Data Upload</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              className={`btn ${activeUploadTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setActiveUploadTab('upload')}
            >
              Upload CSV
            </button>
            <button 
              className={`btn ${activeUploadTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setActiveUploadTab('manual')}
            >
              Add Manually
            </button>
          </div>

          {activeUploadTab === 'upload' ? <CsvUploader /> : <ProductForm />}
          
          <div style={{ marginTop: '2rem' }}>
            <FieldVisibilityToggle />
          </div>
        </div>
      );
    }
    
    if (activeMenu === 'products') {
      return (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Product Management</h2>
          <ProductTable />
        </div>
      );
    }

    if (activeMenu === 'vendors') {
      return (
        <div>
          <VendorManagement />
        </div>
      );
    }
    
    if (activeMenu === 'categories') {
      return (
        <div>
          <CategoryManagement />
        </div>
      );
    }

    if (activeMenu === 'requests') {
      return (
        <div style={{ padding: '2rem' }}>
          <ProductRequests />
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        backgroundColor: '#111', 
        color: '#fff', 
        display: 'flex', 
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Logo/Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #333' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            margin: 0, 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Admin Portal
          </h1>
          <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.25rem' }}>B2B Catalog Management</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveMenu('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: activeMenu === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeMenu === 'dashboard' ? '#fff' : '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveMenu('products')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: activeMenu === 'products' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeMenu === 'products' ? '#fff' : '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <Package size={18} />
            All Products
          </button>
          
          <button 
            onClick={() => setActiveMenu('vendors')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: activeMenu === 'vendors' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeMenu === 'vendors' ? '#fff' : '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            Vendors
          </button>

          <button 
            onClick={() => setActiveMenu('categories')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: activeMenu === 'categories' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeMenu === 'categories' ? '#fff' : '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <Tag size={18} />
            Categories
          </button>
          
          <button 
            onClick={() => setActiveMenu('requests')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: activeMenu === 'requests' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeMenu === 'requests' ? '#fff' : '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <HelpCircle size={18} />
              Requests
            </div>
            {pendingRequestsCount > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link 
            to="/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: 'transparent', color: '#888',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <ExternalLink size={18} />
            View Storefront
          </Link>
          
          <button 
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              backgroundColor: 'transparent', color: '#ef4444',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem' }}>
        {renderContent()}
      </div>
    </div>
  );
};
