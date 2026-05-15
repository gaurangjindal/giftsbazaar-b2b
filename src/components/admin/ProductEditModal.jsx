import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProductEditModal = ({ product, onSave, onClose }) => {
  const { managedCategories } = useAppContext();
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!product) return null;

  // Categorize fields
  const skipFields = ['id', 'imageUrl', 'status'];
  const allKeys = Object.keys(formData).filter(k => !skipFields.includes(k));

  const imageKeys = allKeys.filter(k => k.startsWith('Image ') || k.startsWith('Video '));
  const priceKeys = allKeys.filter(k => ['Cost Price', 'MRP', 'Selling Price'].includes(k));
  const dimensionKeys = allKeys.filter(k => k.includes('Packaging') || k.includes('Weight'));
  const attrKeys = allKeys.filter(k => k.startsWith('attr_'));
  const basicKeys = allKeys.filter(k => 
    !imageKeys.includes(k) && !priceKeys.includes(k) && 
    !dimensionKeys.includes(k) && !attrKeys.includes(k)
  );

  const tabs = [
    { key: 'basic', label: 'Basic Info', fields: basicKeys },
    { key: 'pricing', label: 'Pricing', fields: priceKeys },
    { key: 'images', label: 'Images & Videos', fields: imageKeys },
    { key: 'dimensions', label: 'Dimensions', fields: dimensionKeys },
    { key: 'attributes', label: 'Attributes', fields: attrKeys },
  ].filter(t => t.fields.length > 0);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Update imageUrl if Image 1 changed
    const img1 = formData['Image 1'] || '';
    if (img1.startsWith('http://') || img1.startsWith('https://')) {
      formData.imageUrl = img1;
    }
    onSave(formData);
  };

  const currentFields = tabs.find(t => t.key === activeTab)?.fields || [];

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        zIndex: 2000, animation: 'fadeIn 0.15s ease-out'
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95vw', maxWidth: '720px', maxHeight: '85vh',
        backgroundColor: '#fff', borderRadius: '12px',
        overflow: 'hidden', zIndex: 2001,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
        animation: 'modalSlideUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Edit Product</h3>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#888' }}>
              {formData['Product Code'] || formData.id} · {formData['Name'] || 'Unnamed'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: '#f5f5f5', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color="#666" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #e5e5e5',
          padding: '0 1.5rem', gap: '0', overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1rem', border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab.key ? '#111' : '#999',
                fontSize: '0.8rem', fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              {tab.label} <span style={{ color: '#ccc', marginLeft: '0.25rem' }}>{tab.fields.length}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
          {/* Image Preview for Images tab */}
          {activeTab === 'images' && formData.imageUrl && (
            <div style={{
              marginBottom: '1.25rem', borderRadius: '8px', overflow: 'hidden',
              backgroundColor: '#f5f5f0', textAlign: 'center', padding: '1rem'
            }}>
              <img
                src={formData.imageUrl}
                alt="Preview"
                style={{ maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }}
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
              <p style={{ fontSize: '0.7rem', color: '#999', margin: '0.5rem 0 0' }}>Current primary image</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: currentFields.length > 4 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            {currentFields.map(key => {
              const value = formData[key] || '';
              const isUrl = value.startsWith('http://') || value.startsWith('https://');
              const isLongText = key === 'Description' || key === 'Name';
              
              return (
                <div key={key} style={{ gridColumn: isLongText ? '1 / -1' : 'auto' }}>
                  <label style={{
                    display: 'block', fontSize: '0.7rem', color: '#888',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    marginBottom: '0.375rem', fontWeight: 500
                  }}>
                    {key.replace('attr_', '')}
                  </label>
                  
                  {isLongText ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      rows={3}
                      style={{
                        width: '100%', padding: '0.5rem 0.75rem',
                        border: '1px solid #e5e5e5', borderRadius: '6px',
                        fontSize: '0.85rem', resize: 'vertical',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    />
                  ) : key === 'attr_Theme' || key === 'Product Type' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{
                          flexGrow: 1, padding: '0.5rem 0.75rem',
                          border: '1px solid #e5e5e5', borderRadius: '6px',
                          fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                          outline: 'none', backgroundColor: '#fff', cursor: 'pointer'
                        }}
                      >
                        <option value="">Select a category...</option>
                        {managedCategories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name} {cat.status === 'draft' ? '(De-live)' : ''}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const textToAnalyze = `${formData.Name || ''} ${formData.Description || ''}`.toLowerCase();
                          let bestMatch = '';
                          managedCategories.forEach(cat => {
                            if (textToAnalyze.includes(cat.name.toLowerCase())) {
                              bestMatch = cat.name;
                            }
                          });
                          if (bestMatch) {
                            handleChange(key, bestMatch);
                          } else {
                            alert("Couldn't find an obvious match based on title/description. Please select manually.");
                          }
                        }}
                        style={{
                          padding: '0 0.75rem', backgroundColor: '#f0fdf4', color: '#166534',
                          border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 500
                        }}
                        title="Auto-suggest based on Product Name"
                      >
                        <Sparkles size={14} /> Suggest
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{
                          width: '100%', padding: '0.5rem 0.75rem',
                          border: '1px solid #e5e5e5', borderRadius: '6px',
                          fontSize: '0.85rem',
                          paddingRight: isUrl ? '2.5rem' : '0.75rem',
                          fontFamily: "'Inter', sans-serif"
                        }}
                      />
                      {isUrl && key.startsWith('Image') && (
                        <div style={{
                          position: 'absolute', right: '0.5rem', top: '50%',
                          transform: 'translateY(-50%)'
                        }}>
                          <img
                            src={value}
                            alt=""
                            style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '3px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid #e5e5e5',
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1rem', border: '1px solid #e5e5e5',
            backgroundColor: '#fff', color: '#555', borderRadius: '6px',
            fontSize: '0.85rem', cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: '0.5rem 1.25rem', border: 'none',
            backgroundColor: '#111', color: '#fff', borderRadius: '6px',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.375rem'
          }}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:
        '@keyframes modalSlideUp { from { opacity:0; transform:translate(-50%,-48%); } to { opacity:1; transform:translate(-50%,-50%); } }' +
        '@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }'
      }} />
    </>
  );
};
