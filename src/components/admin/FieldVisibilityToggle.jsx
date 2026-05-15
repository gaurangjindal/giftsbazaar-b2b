import React from 'react';
import { Eye, EyeOff, Settings2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const FieldVisibilityToggle = () => {
  const { visibilitySettings, toggleVisibility } = useAppContext();

  const fields = Object.keys(visibilitySettings);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Settings2 size={24} color="var(--accent-primary)" />
        Field Visibility Settings
      </h2>
      
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        Toggle which fields should be visible to customers on the storefront.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map(field => {
          const isVisible = visibilitySettings[field];
          
          return (
            <div 
              key={field}
              onClick={() => toggleVisibility(field)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: isVisible ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                border: `1px solid ${isVisible ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ 
                fontWeight: 500,
                color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)'
              }}>
                {field}
              </span>
              
              <button 
                className="btn-icon" 
                style={{ 
                  padding: '0.25rem',
                  color: isVisible ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
