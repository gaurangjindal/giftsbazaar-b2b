import React, { useState, useRef } from 'react';
import { Users, Plus, Upload, Trash2, Pencil, X, Save, FileUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Papa from 'papaparse';

const VendorFormModal = ({ vendor, onSave, onClose }) => {
  const [formData, setFormData] = useState(vendor || {
    name: '', address: '', phone: '', productCategory: '', totalSkus: '', productCode: '', vendorCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px',
        zIndex: 2001, padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Vendor Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Address</label>
              <input name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Product Category</label>
              <input name="productCategory" value={formData.productCategory} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Total SKUs</label>
              <input type="number" name="totalSkus" value={formData.totalSkus} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Product Code Prefix</label>
              <input name="productCode" value={formData.productCode} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Vendor Code</label>
              <input required name="vendorCode" value={formData.vendorCode} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              <Save size={16} style={{ verticalAlign: 'text-bottom', marginRight: '0.25rem' }} /> Save Vendor
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export const VendorManagement = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, updateVendors, clearAllVendors, products } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const fileInputRef = useRef(null);

  const handleSaveVendor = (vendorData) => {
    if (vendorData.id) {
      updateVendor(vendorData);
    } else {
      addVendor(vendorData);
    }
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const vendorCounts = {};
  products?.forEach(p => {
    const vCode = p['pickup address code'] || p['Pickup Address Code'] || p['pickup Address Code'] || p['Pickup address code'] || p['Vendor Code'] || p['vendor code'];
    if (vCode) {
      vendorCounts[vCode] = (vendorCounts[vCode] || 0) + 1;
    }
  });

  const allVendorCodes = new Set([...vendors.map(v => v.vendorCode).filter(Boolean), ...Object.keys(vendorCounts)]);
  
  const combinedVendors = Array.from(allVendorCodes).map(code => {
    const manualData = vendors.find(v => v.vendorCode === code) || {};
    return {
      id: manualData.id || code,
      vendorCode: code,
      name: manualData.name || 'Unknown Vendor',
      productCategory: manualData.productCategory || '-',
      phone: manualData.phone || '-',
      totalSkus: vendorCounts[code] || manualData.totalSkus || '0', // Use dynamic count if available
      isManual: !!manualData.id
    };
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) return;
        
        const mappedVendors = results.data.map(row => ({
          id: row['id'] || row['Vendor Code'] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9)),
          name: row['Name'] || row['Vendor Name'] || '',
          address: row['Address'] || '',
          phone: row['Phone'] || row['Phone Number'] || '',
          productCategory: row['Product Category'] || row['Category'] || '',
          totalSkus: row['Total SKUs'] || row['Total SKU'] || '',
          productCode: row['Product Code'] || '',
          vendorCode: row['Vendor Code'] || ''
        })).filter(v => v.name || v.vendorCode);

        if (mappedVendors.length > 0) {
          updateVendors(mappedVendors);
          alert(`Successfully imported ${mappedVendors.length} vendors.`);
        }
        e.target.value = null; // reset input
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} color="#3b82f6" /> Vendor Management
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #e5e5e5', backgroundColor: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
          >
            <FileUp size={16} /> Import CSV
          </button>
          <button 
            onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', backgroundColor: '#111', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Vendor Code</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Phone</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Total SKUs</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {combinedVendors.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
                  No vendors found. Add one manually or import via CSV.
                </td>
              </tr>
            ) : (
              combinedVendors.map(vendor => (
                <tr key={vendor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>{vendor.vendorCode || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{vendor.name || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#666' }}>{vendor.productCategory || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#666' }}>{vendor.phone || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#666' }}>{vendor.totalSkus || '0'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => { setEditingVendor(vendor); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                    {vendor.isManual && (
                      <button onClick={() => { if(window.confirm('Delete vendor?')) deleteVendor(vendor.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <VendorFormModal 
          vendor={editingVendor} 
          onSave={handleSaveVendor} 
          onClose={() => { setIsModalOpen(false); setEditingVendor(null); }} 
        />
      )}
    </div>
  );
};
