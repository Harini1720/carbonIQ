import React, { useState } from 'react';
import { formatKg, formatPercent } from '../../utils/formatters';
import { Zap, Bus, Trash2 } from 'lucide-react';

export default function EmissionsDonutChart({ breakdown, totalKg }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 'electricity',
      label: 'Electricity',
      kg: breakdown?.electricity?.kg || 0,
      share: breakdown?.electricity?.share || 0,
      color: '#10b981',
      icon: Zap
    },
    {
      id: 'transport',
      label: 'Transportation',
      kg: breakdown?.transport?.kg || 0,
      share: breakdown?.transport?.share || 0,
      color: '#14b8a6',
      icon: Bus
    },
    {
      id: 'waste',
      label: 'Waste Generation',
      kg: breakdown?.waste?.kg || 0,
      share: breakdown?.waste?.share || 0,
      color: '#f59e0b',
      icon: Trash2
    }
  ];

  // SVG Donut Calculations
  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;
  const slices = categories.map((cat) => {
    const strokeDasharray = `${(cat.share / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (cat.share / 100) * circumference;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const activeData = hoveredCategory
    ? categories.find(c => c.id === hoveredCategory)
    : { label: 'Total Footprint', kg: totalKg, share: 100, color: '#34d399' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '10px 0' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Dynamic slices */}
          {slices.map((slice) => {
            const isHovered = hoveredCategory === slice.id;
            return (
              <circle
                key={slice.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 0 10px ${slice.color})` : 'none'
                }}
                onMouseEnter={() => setHoveredCategory(slice.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '20px'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {activeData.label}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '3px 0' }}>
            {formatPercent(activeData.share)}
          </span>
          <span style={{ fontSize: '0.75rem', color: activeData.color, fontWeight: 700 }}>
            {Math.round(activeData.kg).toLocaleString()} kg
          </span>
        </div>
      </div>

      {/* Legend items */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '14px', width: '100%' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = hoveredCategory === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `1px solid ${isSelected ? cat.color : 'transparent'}`
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: cat.color,
                  boxShadow: `0 0 8px ${cat.color}`
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {cat.label}
              </span>
              <strong style={{ fontSize: '0.8rem', color: '#fff' }}>
                {cat.share.toFixed(1)}%
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
