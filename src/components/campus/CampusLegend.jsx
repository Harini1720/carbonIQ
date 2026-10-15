import React from 'react';
import { Sun, Wind, Zap, Bus, Trash2, ShieldCheck } from 'lucide-react';

export default function CampusLegend() {
  const items = [
    {
      icon: Sun,
      color: '#38bdf8',
      title: 'Solar Photovoltaic Arrays',
      desc: 'Rooftop and carport bifacial solar panels generating zero-carbon electricity onsite.'
    },
    {
      icon: Wind,
      color: '#f8fafc',
      title: 'Micro Wind Turbine',
      desc: '25 kW wind generator producing supplementary localized clean energy.'
    },
    {
      icon: Zap,
      color: '#10b981',
      title: 'Smart Microgrid Conduits',
      desc: 'Animated pulsing cables representing bi-directional power transmission between solar and facilities.'
    },
    {
      icon: Bus,
      color: '#34d399',
      title: 'Campus EV Shuttle Corridor',
      desc: 'Perimeter ring road traversed by clean battery-electric transit vehicles.'
    },
    {
      icon: Trash2,
      color: '#f59e0b',
      title: 'Resource Recovery Yard',
      desc: 'Multi-stream sorting and decentralized aerobic food waste composting.'
    }
  ];

  return (
    <div className="glass-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <ShieldCheck size={18} color="#34d399" />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
          Campus Digital Twin Legend & System Key
        </h4>
      </div>

      <div className="grid-cols-3" style={{ gap: '14px' }}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(16, 28, 24, 0.6)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${item.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={16} color={item.color} />
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff', display: 'block' }}>
                  {item.title}
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
