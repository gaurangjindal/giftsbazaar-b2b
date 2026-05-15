import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Tag, Eye, EyeOff } from 'lucide-react';

export const CategoryManagement = () => {
  const { managedCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useAppContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleUpdate = (id) => {
    if (editingName.trim()) {
      updateCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} color="#3b82f6" />
            Category Management
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            Manage the categories visible on the Storefront. Deactivating a category hides all its products.
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Add New Category */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="New Category Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ flexGrow: 1, padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            style={{ padding: '0 1.5rem', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed', opacity: newCategoryName.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Add Category
          </button>
        </form>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {managedCategories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: cat.status === 'live' ? '#fff' : '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.status === 'live' ? '#10b981' : '#ccc' }} />
                
                {editingId === cat.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1 }}>
                    <input 
                      type="text" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      style={{ padding: '0.4rem 0.75rem', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', flexGrow: 1 }}
                    />
                    <button onClick={() => handleUpdate(cat.id)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: cat.status === 'live' ? '#111' : '#888' }}>
                    {cat.name}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => toggleCategoryStatus(cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', backgroundColor: cat.status === 'live' ? 'rgba(16, 185, 129, 0.1)' : '#f5f5f5', color: cat.status === 'live' ? '#059669' : '#666', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}
                >
                  {cat.status === 'live' ? <><Eye size={14} /> Live</> : <><EyeOff size={14} /> De-live</>}
                </button>
                
                <button 
                  onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                  style={{ padding: '0.4rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                  title="Edit Category Name"
                >
                  <Edit2 size={16} />
                </button>
                
                <button 
                  onClick={() => { if(window.confirm('Delete this category?')) deleteCategory(cat.id); }}
                  style={{ padding: '0.4rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {managedCategories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999', fontSize: '0.9rem' }}>
              No categories found. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
