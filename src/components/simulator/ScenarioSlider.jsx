import React from 'react';

export default function ScenarioSlider({
  label,
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  icon: Icon,
  color = '#10b981',
  unit = '%',
  subtitle,
  category = 'General'
}) {
  return (
    <div
      style={{
        background: 'rgba(16, 28, 24, 0.7)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        transition: 'border-color 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: `${color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#ffffff', display: 'block' }}>
              {label}
            </strong>
            {subtitle && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '6px',
            background: `${color}25`,
            color: color,
            fontFamily: 'var(--font-mono)'
          }}
        >
          {value}{unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="slider-range"
        style={{
          accentColor: color
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
        <span>Baseline ({min}{unit})</span>
        <span>Target ({max}{unit})</span>
      </div>
    </div>
  );
}
