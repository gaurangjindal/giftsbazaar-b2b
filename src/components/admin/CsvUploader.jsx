import React, { useRef, useState } from 'react';
import { Upload, FileUp, AlertCircle, CheckCircle2, Rocket, Check, X } from 'lucide-react';
import Papa from 'papaparse';
import { useAppContext } from '../../context/AppContext';

export const CsvUploader = () => {
  const fileInputRef = useRef(null);
  const { updateProducts, makeAllLive, clearAllProducts } = useAppContext();
  
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, field-select, confirm, success, error
  const [message, setMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  
  // Field selection state
  const [rawData, setRawData] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(new Set());

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setStatus('error');
      setMessage('Please upload a valid CSV file.');
      return;
    }

    setStatus('loading');
    setMessage('Reading CSV file...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setStatus('error');
          setMessage('The CSV file appears to be empty.');
          return;
        }
        
        // Get all field names from the CSV
        const fields = results.meta.fields || [];
        setAllFields(fields);
        setRawData(results.data);
        
        // Pre-select important fields
        const important = new Set([
          'Product Code', 'Sku Id', 'Name', 'Selling Price', 'MRP', 'Cost Price',
          'Quantity', 'Product Type', 'Colour', 'Size', 'Description',
          'Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5',
          'Image 6', 'Image 7', 'Image 8', 'Image 9', 'Image 10',
          'Packaging Length (in cm)', 'Packaging Breadth (in cm)', 'Packaging Height (in cm)',
          'attr_Brand name', 'attr_material', 'attr_Theme',
          'Video 1', 'Video 2'
        ]);
        const preSelected = new Set(fields.filter(f => important.has(f)));
        setSelectedFields(preSelected);
        
        setStatus('field-select');
        setMessage(results.data.length + ' rows found with ' + fields.length + ' fields.');
      },
      error: () => {
        setStatus('error');
        setMessage('Failed to parse CSV file.');
      }
    });
  };

  const toggleField = (field) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        // Don't allow deselecting Product Code or Name
        if (field === 'Product Code' || field === 'Name') return prev;
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedFields(new Set(allFields));
  const deselectAll = () => setSelectedFields(new Set(['Product Code', 'Name']));

  const handleImport = () => {
    setStatus('loading');
    setMessage('Importing products...');

    // Process data with only selected fields
    const productMap = new Map();

    for (const row of rawData) {
      const cleanRow = {};
      for (const field of selectedFields) {
        const val = row[field];
        cleanRow[field] = typeof val === 'string' ? val.trim() : (val || '');
      }
      
      // Always include ID fields
      cleanRow.id = (cleanRow['Product Code'] || row['Product Code'] || row['Sku Id'] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9))).trim();
      if (!cleanRow['Product Code']) cleanRow['Product Code'] = cleanRow.id;

      // Deduplicate: keep row with best image data
      const existing = productMap.get(cleanRow.id);
      if (!existing) {
        productMap.set(cleanRow.id, cleanRow);
      } else {
        const existingHasImg = existing['Image 1'] && existing['Image 1'].startsWith('http');
        const newHasImg = cleanRow['Image 1'] && cleanRow['Image 1'].startsWith('http');
        if (newHasImg && !existingHasImg) {
          productMap.set(cleanRow.id, cleanRow);
        } else {
          for (const key of Object.keys(cleanRow)) {
            if (cleanRow[key] && !existing[key]) {
              existing[key] = cleanRow[key];
            }
          }
        }
      }
    }

    // Set image URLs
    const products = Array.from(productMap.values()).map(p => {
      const img1 = p['Image 1'] || '';
      if (img1.startsWith('http://') || img1.startsWith('https://')) {
        p.imageUrl = img1;
      } else {
        for (let i = 2; i <= 10; i++) {
          const imgN = p['Image ' + i] || '';
          if (imgN.startsWith('http://') || imgN.startsWith('https://')) {
            p.imageUrl = imgN;
            break;
          }
        }
        if (!p.imageUrl) {
          p.imageUrl = 'https://placehold.co/400x400/f5f5f0/999999?text=' + encodeURIComponent(p['Name'] || 'Product');
        }
      }
      return p;
    });

    updateProducts(products);
    setImportedCount(products.length);
    setStatus('confirm');
    setMessage(products.length + ' products imported as drafts.');
  };

  const handleMakeLive = () => {
    makeAllLive();
    setStatus('success');
    setMessage(importedCount + ' products are now LIVE on the storefront!');
  };

  const handleKeepDraft = () => {
    setStatus('success');
    setMessage(importedCount + ' products imported as drafts. Toggle them live individually.');
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };
  const onFileChange = (e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Upload size={24} color="#3b82f6" />
          Catalog Upload
        </h2>
        <button
          onClick={() => {
            clearAllProducts();
            setStatus('idle');
            setMessage('');
            setRawData([]);
            setAllFields([]);
          }}
          style={{
            padding: '0.375rem 0.75rem', border: '1px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444',
            borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer'
          }}
        >Clear All & Re-upload</button>
      </div>
      
      {/* Upload Area */}
      {(status === 'idle' || status === 'error' || status === 'success') && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          style={{
            border: '2px dashed ' + (isDragging ? '#3b82f6' : '#e5e5e5'),
            backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : '#f9fafb',
            borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}
        >
          <input type="file" accept=".csv" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
          <FileUp size={48} color={isDragging ? '#3b82f6' : '#ccc'} />
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Click or drag to upload CSV</h3>
            <p style={{ fontSize: '0.875rem', color: '#888' }}>Maximum file size 5MB. Must be .csv format.</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e5e5', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#666' }}>{message}</p>
        </div>
      )}

      {/* Field Selection Step */}
      {status === 'field-select' && (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Select Fields to Import</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#888' }}>{message} · {selectedFields.size} of {allFields.length} selected</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={selectAll} style={{ padding: '0.3rem 0.6rem', border: '1px solid #e5e5e5', backgroundColor: '#fff', color: '#555', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Select All</button>
              <button onClick={deselectAll} style={{ padding: '0.3rem 0.6rem', border: '1px solid #e5e5e5', backgroundColor: '#fff', color: '#555', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Deselect All</button>
            </div>
          </div>
          
          <div style={{ padding: '1rem 1.25rem', maxHeight: '320px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {allFields.map(field => {
              const isSelected = selectedFields.has(field);
              const isRequired = field === 'Product Code' || field === 'Name';
              return (
                <label
                  key={field}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: '6px',
                    border: '1px solid ' + (isSelected ? '#3b82f6' : '#eee'),
                    backgroundColor: isSelected ? 'rgba(59,130,246,0.05)' : '#fff',
                    cursor: isRequired ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem', color: isSelected ? '#111' : '#888',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => !isRequired && toggleField(field)}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: '2px solid ' + (isSelected ? '#3b82f6' : '#ddd'),
                    backgroundColor: isSelected ? '#3b82f6' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {field}
                    {isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                  </span>
                </label>
              );
            })}
          </div>
          
          {/* Data Preview Table */}
          <div style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5', fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
              Data Preview (First 50 rows)
            </div>
            <div style={{ maxHeight: '250px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    {Array.from(selectedFields).map(field => (
                      <th key={field} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap', color: '#555', fontWeight: 600 }}>
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {Array.from(selectedFields).map(field => (
                        <td key={field} style={{ padding: '0.4rem 0.75rem', color: '#333', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row[field] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Import Button */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setStatus('idle'); setRawData([]); setAllFields([]); }}
              style={{ padding: '0.5rem 1rem', border: '1px solid #e5e5e5', backgroundColor: '#fff', color: '#555', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleImport}
              style={{ padding: '0.5rem 1.5rem', border: 'none', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            ><Rocket size={14} /> Import {selectedFields.size} Fields</button>
          </div>
        </div>
      )}

      {/* Confirm: Make Live? */}
      {status === 'confirm' && (
        <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Rocket size={20} color="#3b82f6" />
            <span style={{ fontWeight: 600, color: '#333' }}>{importedCount} products imported as drafts</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
            Products are saved but not yet visible on the storefront. Would you like to make them live now?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleMakeLive} style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckCircle2 size={14} /> Yes, Make All Live
            </button>
            <button onClick={handleKeepDraft} style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#666', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
              Keep as Drafts
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {(status === 'error' || status === 'success') && (
        <div style={{ 
          marginTop: '1rem', padding: '1rem', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: '1px solid ' + (status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')
        }}>
          {status === 'error' && <AlertCircle size={20} color="#ef4444" />}
          {status === 'success' && <CheckCircle2 size={20} color="#10b981" />}
          <span style={{ color: status === 'error' ? '#ef4444' : '#10b981', fontSize: '0.875rem' }}>{message}</span>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: '@keyframes spin { 100% { transform: rotate(360deg); } }'}} />
    </div>
  );
};
