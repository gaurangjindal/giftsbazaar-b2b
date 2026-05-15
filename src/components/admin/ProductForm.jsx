import React, { useState } from 'react';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProductForm = () => {
  const { addSingleProduct } = useAppContext();
  const [formData, setFormData] = useState({
    Name: '',
    'Product Code': '',
    'Selling Price': '',
    MRP: '',
    Quantity: '',
    'Image 1': '',
    Description: '',
    'Product Type': '',
    Colour: ''
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Name || !formData['Product Code']) {
      setStatus('error');
      return;
    }

    const newProduct = { ...formData };
    newProduct.id = newProduct['Product Code'] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9));
    const seed = (newProduct.Name || '').replace(/\s+/g, '') || newProduct.id;
    newProduct.imageUrl = newProduct['Image 1'] || ('https://picsum.photos/seed/' + seed + '/400/300');

    addSingleProduct(newProduct);
    setStatus('success');
    
    // Reset form
    setFormData({
      Name: '',
      'Product Code': '',
      'Selling Price': '',
      MRP: '',
      Quantity: '',
      'Image 1': '',
      Description: '',
      'Product Type': '',
      Colour: ''
    });
    
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={24} color="var(--accent-primary)" />
        Add Product Manually
      </h2>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product Name *</label>
          <input name="Name" value={formData.Name} onChange={handleChange} required placeholder="e.g. Elegant Deer Couple" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product Code *</label>
          <input name="Product Code" value={formData['Product Code']} onChange={handleChange} required placeholder="e.g. ZAJAI-Gift-1132" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product Type</label>
          <input name="Product Type" value={formData['Product Type']} onChange={handleChange} placeholder="e.g. home_decor" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Selling Price</label>
          <input type="number" name="Selling Price" value={formData['Selling Price']} onChange={handleChange} placeholder="e.g. 949" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>MRP</label>
          <input type="number" name="MRP" value={formData.MRP} onChange={handleChange} placeholder="e.g. 1899" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
          <input type="number" name="Quantity" value={formData.Quantity} onChange={handleChange} placeholder="e.g. 100" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Colour</label>
          <input name="Colour" value={formData.Colour} onChange={handleChange} placeholder="e.g. Golden and Brown" />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Image URL</label>
          <div style={{ position: 'relative' }}>
            <ImageIcon size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input name="Image 1" value={formData['Image 1']} onChange={handleChange} placeholder="https://..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
          <textarea name="Description" value={formData.Description} onChange={handleChange} placeholder="Product description..." rows={3}></textarea>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary">Add Product</button>
          
          {status === 'success' && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>Product added successfully!</span>}
          {status === 'error' && <span style={{ marginLeft: '1rem', color: 'var(--danger)' }}>Please fill required fields.</span>}
        </div>
      </form>
    </div>
  );
};
