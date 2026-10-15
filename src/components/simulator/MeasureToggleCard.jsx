import React from 'react';
import { Check, Plus } from 'lucide-react';

export default function MeasureToggleCard({ measure, isSelected, onToggle }) {
  const categoryStyles = {
    electricity: { color: '#10b981', badge: 'Power / HVAC' },
    transport: { color: '#14b8a6', badge: 'Commuter Mobility' },
    waste: { color: '#f59e0b', badge: 'Circular Waste' }
  }[measure.category] || { color: '#10b981', badge: 'Campus Initiative' };

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '10px',
        background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 28, 24, 0.6)',
        border: `1px solid ${isSelected ? categoryStyles.color : 'var(--border-subtle)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: isSelected ? categoryStyles.color : 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            transition: 'background 0.2s'
          }}
        >
          {isSelected ? <Check size={14} /> : <Plus size={14} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>
              {measure.name}
            </strong>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: `${categoryStyles.color}22`,
                color: categoryStyles.color,
                fontWeight: 600
              }}
            >
              {categoryStyles.badge}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Estimated category reduction: <strong style={{ color: '#34d399' }}>-{measure.reductionPct}%</strong>
          </span>
        </div>
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isSelected ? categoryStyles.color : 'var(--text-dim)'
        }}
      >
        {isSelected ? 'Active' : '+ Add'}
      </div>
    </div>
  );
}
