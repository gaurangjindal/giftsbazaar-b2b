import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, ChevronLeft, ChevronRight, Trash2, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, Pencil, Filter, ArrowUpDown, Columns, CheckSquare, Square, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ProductEditModal } from './ProductEditModal';
import { ProductModal } from '../store/ProductModal';

// Custom confirmation modal
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        zIndex: 2000, animation: 'fadeIn 0.15s ease-out'
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '2rem', width: '90vw', maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        zIndex: 2001, textAlign: 'center',
        animation: 'modalSlideUp 0.2s ease-out'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <AlertTriangle size={24} color="#ef4444" />
        </div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#111' }}>{title}</h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '0.625rem 1.25rem', border: '1px solid #e5e5e5',
            backgroundColor: '#fff', color: '#555', borderRadius: '6px',
            fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', minWidth: '100px'
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '0.625rem 1.25rem', border: 'none',
            backgroundColor: '#ef4444', color: '#fff', borderRadius: '6px',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', minWidth: '100px'
          }}>Yes, Delete</button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:
        '@keyframes modalSlideUp { from { opacity:0; transform:translate(-50%,-48%); } to { opacity:1; transform:translate(-50%,-50%); } }' +
        '@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }'
      }} />
    </>
  );
};

export const ProductTable = () => {
  const { products, toggleProductStatus, deleteProduct, updateProduct, makeAllLive, makeAllDraft, clearAllProducts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState([]);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const [selectedColumns, setSelectedColumns] = useState(() => {
    const saved = localStorage.getItem('b2b_admin_columns');
    return saved ? JSON.parse(saved) : ['Name', 'Product Code', 'Selling Price', 'Quantity'];
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.setItem('b2b_admin_columns', JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };
  const hideConfirm = () => setConfirmModal({ open: false, title: '', message: '', onConfirm: null });

  const liveCount = products.filter(p => p.status === 'live').length;
  const draftCount = products.filter(p => p.status === 'draft').length;

  if (!products || products.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <Package size={48} color="#ccc" style={{ margin: '0 auto 1rem auto' }} />
        <h3>No Products Found</h3>
        <p style={{ color: '#888' }}>Upload a CSV catalog or add products manually to get started.</p>
      </div>
    );
  }

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p['Product Type']).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Extract unique vendors for filter
  const vendorsMap = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const vCode = p['pickup address code'] || p['Pickup Address Code'] || p['pickup Address Code'] || p['Pickup address code'] || p['Vendor Code'] || p['vendor code'];
      if (vCode) {
        counts[vCode] = (counts[vCode] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  // Extract all possible columns from product data
  const availableColumns = useMemo(() => {
    const keys = new Set();
    products.slice(0, 50).forEach(p => Object.keys(p).forEach(k => keys.add(k)));
    ['id', 'status', 'imageUrl'].forEach(k => keys.delete(k));
    return Array.from(keys).sort();
  }, [products]);

  const parsePrice = (val) => {
    if (!val) return 0;
    const num = parseFloat(val.toString().replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = !searchTerm || 
        (product['Name']?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product['Product Code']?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = !categoryFilter || product['Product Type'] === categoryFilter;

      const vCode = product['pickup address code'] || product['Pickup Address Code'] || product['pickup Address Code'] || product['Pickup address code'] || product['Vendor Code'] || product['vendor code'];
      const matchesVendor = vendorFilter.length === 0 || vendorFilter.includes(vCode);

      return matchesSearch && matchesStatus && matchesCategory && matchesVendor;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        const keyLower = sortConfig.key.toLowerCase();
        const isPrice = keyLower.includes('price') || keyLower.includes('cost') || keyLower.includes('mrp');
        const isQty = keyLower.includes('quantity');
        
        if (isPrice) {
          const numA = parsePrice(valA);
          const numB = parsePrice(valB);
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        } else if (isQty) {
          const numA = parseInt(valA) || 0;
          const numB = parseInt(valB) || 0;
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        } else {
          const strA = (valA || '').toString().toLowerCase();
          const strB = (valB || '').toString().toLowerCase();
          if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return result;
  }, [products, searchTerm, statusFilter, categoryFilter, vendorFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Package size={24} color="#3b82f6" />
            Product Catalog ({filteredProducts.length !== products.length ? `${filteredProducts.length} / ${products.length}` : products.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>● {liveCount} Live</span>
            <span style={{ color: '#f59e0b' }}>● {draftCount} Draft</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Column Selector */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: `1px solid ${showColumnSelector ? '#3b82f6' : '#e5e5e5'}`, borderRadius: '6px', backgroundColor: showColumnSelector ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: '0.8rem', color: showColumnSelector ? '#1d4ed8' : '#333', transition: 'all 0.2s', fontWeight: 500 }}
            >
              <Columns size={14} color={showColumnSelector ? '#3b82f6' : '#666'} /> Columns
            </button>
            {showColumnSelector && (
              <>
                {/* Invisible backdrop to close dropdown when clicking outside */}
                <div 
                  onClick={() => setShowColumnSelector(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 9 }}
                />
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 10, width: '450px', padding: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>Display Columns</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedColumns(availableColumns)} 
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Select All
                      </button>
                      <span style={{ color: '#ccc' }}>|</span>
                      <button 
                        onClick={() => setSelectedColumns(['Name', 'Product Code', 'Selling Price', 'Quantity'])} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {availableColumns.map(col => {
                      const isSelected = selectedColumns.includes(col);
                      return (
                        <div 
                          key={col} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedColumns(prev => prev.filter(c => c !== col));
                            } else {
                              setSelectedColumns(prev => [...prev, col]);
                            }
                          }}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', 
                            cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            borderRadius: '8px', border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          title={col}
                        >
                          <div style={{ color: isSelected ? '#3b82f6' : '#d1d5db', display: 'flex', alignItems: 'center' }}>
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <span style={{ color: isSelected ? '#1e3a8a' : '#4b5563', fontWeight: isSelected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {col}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={14} color="#666" style={{ position: 'absolute', left: '0.75rem' }} />
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0.5rem 2rem 0.5rem 2.25rem', fontSize: '0.8rem', border: '1px solid #e5e5e5', borderRadius: '6px', appearance: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowVendorSelector(!showVendorSelector)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: `1px solid ${showVendorSelector || vendorFilter.length > 0 ? '#3b82f6' : '#e5e5e5'}`, borderRadius: '6px', backgroundColor: showVendorSelector || vendorFilter.length > 0 ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: '0.8rem', color: showVendorSelector || vendorFilter.length > 0 ? '#1d4ed8' : '#333', transition: 'all 0.2s', fontWeight: 500 }}
            >
              <Filter size={14} color={showVendorSelector || vendorFilter.length > 0 ? '#3b82f6' : '#666'} /> 
              {vendorFilter.length > 0 ? `${vendorFilter.length} Vendor${vendorFilter.length > 1 ? 's' : ''} Selected` : 'All Vendors'}
              {vendorFilter.length > 0 && (
                <span style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{vendorFilter.length}</span>
              )}
            </button>
            {showVendorSelector && (
              <>
                <div 
                  onClick={() => setShowVendorSelector(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 9 }}
                />
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', zIndex: 10, width: '340px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Filter by Vendor</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => { setVendorFilter(vendorsMap.map(([v]) => v)); setCurrentPage(1); }} 
                          style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500 }}
                        >
                          All
                        </button>
                        <span style={{ color: '#e2e8f0', fontSize: '0.7rem' }}>|</span>
                        <button 
                          onClick={() => { setVendorFilter([]); setCurrentPage(1); }} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    {/* Summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flexGrow: 1, height: '4px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${vendorFilter.length === 0 ? 100 : (vendorFilter.length / vendorsMap.length) * 100}%`, backgroundColor: vendorFilter.length === 0 ? '#10b981' : '#3b82f6', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {vendorFilter.length === 0 ? 'All' : `${vendorFilter.length}/${vendorsMap.length}`}
                      </span>
                    </div>
                  </div>

                  {/* Vendor List */}
                  <div style={{ padding: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {vendorsMap.map(([vCode, count]) => {
                      const isSelected = vendorFilter.includes(vCode);
                      const pct = ((count / products.length) * 100).toFixed(0);
                      return (
                        <div 
                          key={vCode} 
                          onClick={() => {
                            if (isSelected) {
                              setVendorFilter(prev => prev.filter(c => c !== vCode));
                            } else {
                              setVendorFilter(prev => [...prev, vCode]);
                            }
                            setCurrentPage(1);
                          }}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', 
                            cursor: 'pointer', borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                            border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent'}`,
                            transition: 'all 0.15s', marginBottom: '2px'
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{ color: isSelected ? '#3b82f6' : '#cbd5e1', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.8rem', color: isSelected ? '#1e3a8a' : '#374151', fontWeight: isSelected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vCode}</span>
                              <span style={{ 
                                fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', flexShrink: 0,
                                backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9', 
                                color: isSelected ? '#1d4ed8' : '#64748b'
                              }}>{count} items</span>
                            </div>
                            {/* Percentage bar */}
                            <div style={{ marginTop: '4px', height: '3px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: isSelected ? '#3b82f6' : '#cbd5e1', borderRadius: '999px', transition: 'all 0.3s ease' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {vendorFilter.length > 0 && (
                    <div style={{ padding: '0.625rem 1rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Showing <strong style={{ color: '#111' }}>{filteredProducts.length}</strong> of {products.length} products
                      </span>
                      <button 
                        onClick={() => setShowVendorSelector(false)}
                        style={{ padding: '0.3rem 0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} color="#999" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.25rem', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '0.5rem' }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'live', label: 'Live' },
            { key: 'draft', label: 'Draft' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid',
                borderColor: statusFilter === tab.key ? '#111' : '#e5e5e5',
                backgroundColor: statusFilter === tab.key ? '#111' : '#fff',
                color: statusFilter === tab.key ? '#fff' : '#666',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={makeAllLive}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              borderRadius: '4px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <CheckCircle2 size={12} /> Make All Live
          </button>
          <button 
            onClick={makeAllDraft}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid #f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              borderRadius: '4px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <XCircle size={12} /> Make All Draft
          </button>
          <button 
            onClick={() => showConfirm(
              'Delete All Products',
              'This will permanently remove all ' + products.length + ' products from the catalog. This action cannot be undone.',
              () => { clearAllProducts(); setCurrentPage(1); setStatusFilter('all'); hideConfirm(); }
            )}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '4px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Trash2 size={12} /> Delete All
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Img</th>
              {selectedColumns.map(header => (
                <th 
                  key={header} 
                  onClick={() => handleSort(header)}
                  style={{ cursor: 'pointer', userSelect: 'none', transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title={`Sort by ${header}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {header}
                    <span style={{ color: sortConfig.key === header ? '#3b82f6' : '#d1d5db', display: 'flex' }}>
                      {sortConfig.key === header ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} />
                      )}
                    </span>
                  </div>
                </th>
              ))}
              <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id} style={{ transition: 'background-color 0.15s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => setPreviewProduct(product)}>
                  <td style={{ padding: '0.5rem' }}>
                    <img 
                      src={product.imageUrl} 
                      alt="" 
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/36';
                      }}
                    />
                  </td>
                  {selectedColumns.map(header => (
                    <td key={header + '-' + product.id} style={{ fontSize: '0.8rem' }}>
                      {header === 'Name' ? (
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#3b82f6' }} title="Click to preview">
                          {product[header] || '-'}
                        </span>
                      ) : (
                        product[header] || '-'
                      )}
                    </td>
                  ))}
                  {/* Status Toggle */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleProductStatus(product.id); }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        border: 'none',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: product.status === 'live' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: product.status === 'live' ? '#059669' : '#d97706',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      title={product.status === 'live' ? 'Click to set Draft' : 'Click to make Live'}
                    >
                      {product.status === 'live' ? <Eye size={10} /> : <EyeOff size={10} />}
                      {product.status === 'live' ? 'LIVE' : 'DRAFT'}
                    </button>
                  </td>
                  {/* Actions: Edit + Delete */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#999', padding: '0.25rem', borderRadius: '4px'
                        }}
                        title="Edit product"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm(
                            'Delete Product',
                            'Are you sure you want to delete "' + (product['Name'] || product.id) + '"?',
                            () => { deleteProduct(product.id); hideConfirm(); }
                          );
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#999', padding: '0.25rem', borderRadius: '4px'
                        }}
                        title="Delete product"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={priorityHeaders.length + 3} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '0.375rem', display: 'flex', alignItems: 'center' }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: '0.375rem', display: 'flex', alignItems: 'center' }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirm}
      />

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onSave={(updated) => { updateProduct(updated); setEditingProduct(null); }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {previewProduct && (
        <ProductModal 
          product={previewProduct} 
          onClose={() => setPreviewProduct(null)} 
          isAdmin={true}
          onEdit={() => {
            setEditingProduct(previewProduct);
            setPreviewProduct(null);
          }}
        />
      )}
    </div>
  );
};
