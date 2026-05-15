import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, CheckCircle2, Clock, Search, Trash2, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProductRequests = () => {
  const { productRequests, updateProductRequestStatus, deleteProductRequest } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    requester: true,
    contact: true,
    product: true,
    quantity: true,
    budget: true,
    urgency: true,
    status: true,
    actions: true
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRequests = productRequests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const matchesSearch = !searchTerm || 
      (req.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = productRequests.filter(r => r.status === 'pending').length;
  const resolvedCount = productRequests.filter(r => r.status === 'resolved').length;

  return (
    <div className="glass-panel" style={{ overflow: 'visible' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <HelpCircle size={24} color="#3b82f6" />
            Product Requests ({productRequests.length})
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#f59e0b' }}>● {pendingCount} Pending</span>
            <span style={{ color: '#10b981' }}>● {resolvedCount} Resolved</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} color="#999" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'resolved', label: 'Resolved' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid',
                borderColor: filter === tab.key ? '#111' : '#e5e5e5',
                backgroundColor: filter === tab.key ? '#111' : '#fff',
                color: filter === tab.key ? '#fff' : '#666',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            style={{ padding: '0.375rem 0.75rem', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#333' }}
          >
            Columns <ChevronDown size={12} />
          </button>
          {showColumnDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', padding: '1rem', zIndex: 50, width: '360px', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>Display Columns</h3>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <button onClick={() => setVisibleColumns({ date: true, requester: true, contact: true, product: true, quantity: true, budget: true, urgency: true, status: true, actions: true })} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}>Select All</button>
                  <span style={{ color: '#ccc' }}>|</span>
                  <button onClick={() => setVisibleColumns({ date: true, requester: true, contact: true, product: true, quantity: true, budget: true, urgency: true, status: true, actions: true })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>Reset Defaults</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {Object.keys(visibleColumns).map(col => {
                  const isChecked = visibleColumns[col];
                  return (
                    <label key={col} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', 
                      fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize',
                      border: isChecked ? '1px solid #93c5fd' : '1px solid transparent',
                      backgroundColor: isChecked ? '#eff6ff' : 'transparent',
                      color: isChecked ? '#1e40af' : '#4b5563',
                      borderRadius: '6px',
                      transition: 'all 0.15s'
                    }}>
                      <div style={{ 
                        width: '16px', height: '16px', borderRadius: '4px', 
                        border: isChecked ? 'none' : '1px solid #d1d5db', 
                        backgroundColor: isChecked ? '#3b82f6' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))} 
                        style={{ display: 'none' }}
                      />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>
            <HelpCircle size={48} color="#ddd" style={{ margin: '0 auto 1rem' }} />
            <p>No product requests found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e5e5', backgroundColor: '#fafafa' }}>
                {visibleColumns.date && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>}
                {visibleColumns.requester && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Requester</th>}
                {visibleColumns.contact && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Contact</th>}
                {visibleColumns.product && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Product</th>}
                {visibleColumns.quantity && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Quantity</th>}
                {visibleColumns.budget && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Budget Range</th>}
                {visibleColumns.urgency && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Urgency</th>}
                {visibleColumns.status && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>}
                {visibleColumns.actions && <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {visibleColumns.date && (
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#555', whiteSpace: 'nowrap' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                  )}
                  {visibleColumns.requester && (
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>{req.fullName || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.15rem' }}>
                        {req.city && req.state ? `${req.city}, ${req.state}` : req.location || '-'}
                      </div>
                      <div style={{ display: 'inline-block', padding: '0.15rem 0.4rem', backgroundColor: '#eee', borderRadius: '4px', fontSize: '0.65rem', marginTop: '0.3rem', color: '#555' }}>
                        {req.category || 'Other'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.contact && (
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#333' }}>
                      <div style={{ marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📞 {req.mobileNumber || req.contactInfo || '-'}</span>
                        {req.isWhatsappSame && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 500 }}>
                            Also WhatsApp
                          </span>
                        )}
                      </div>
                      {!req.isWhatsappSame && req.whatsappNumber && req.whatsappNumber !== req.mobileNumber && (
                        <div style={{ color: '#10b981', fontSize: '0.75rem', marginBottom: '0.15rem' }}>💬 {req.whatsappNumber}</div>
                      )}
                      {req.emailAddress && <div style={{ color: '#666', fontSize: '0.75rem' }}>✉️ {req.emailAddress}</div>}
                    </td>
                  )}
                  {visibleColumns.product && (
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        {req.uploadedImages && req.uploadedImages.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
                            {req.uploadedImages.map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                <img src={img} alt="Product" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e5e5' }} />
                              </a>
                            ))}
                          </div>
                        ) : req.imageUrl ? (
                          <a href={req.imageUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                            <img src={req.imageUrl} alt="Product" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e5e5' }} onError={(e) => { e.target.onerror=null; e.target.style.display='none'; }} />
                          </a>
                        ) : (
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', flexShrink: 0 }}>
                            <HelpCircle size={16} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#111', marginBottom: '0.25rem' }}>{req.productName || 'No Description provided'}</div>
                          {req.productUrls ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {req.productUrls.split(/[\n,]+/).map((url, i) => url.trim() ? (
                                <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6', textDecoration: 'none', wordBreak: 'break-all' }}>
                                  Link {i + 1}
                                </a>
                              ) : null)}
                            </div>
                          ) : req.referenceUrl && (
                            <a href={req.referenceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}>
                              Reference Link
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.quantity && (
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#333', whiteSpace: 'nowrap' }}>
                      {req.expectedQuantity || '-'}
                    </td>
                  )}
                  {visibleColumns.budget && (
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#333', whiteSpace: 'nowrap' }}>
                      {req.budgetRange || '-'}
                    </td>
                  )}
                  {visibleColumns.urgency && (
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#333', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#eab308', fontWeight: 500 }}>{req.urgency || '-'}</span>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                        backgroundColor: req.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: req.status === 'resolved' ? '#059669' : '#d97706'
                      }}>
                        {req.status === 'resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateProductRequestStatus(req.id, req.status === 'pending' ? 'resolved' : 'pending')}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem',
                            color: req.status === 'pending' ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: req.status === 'pending' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '6px'
                          }}
                          title={req.status === 'pending' ? 'Mark as Resolved' : 'Mark as Pending'}
                        >
                          {req.status === 'pending' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this request?')) {
                              deleteProductRequest(req.id);
                            }
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem',
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px'
                          }}
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
