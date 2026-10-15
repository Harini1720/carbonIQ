import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  subtitle,
  changePct,
  changeLabel = 'vs baseline',
  color = 'emerald', // emerald, teal, amber, sky, rose
  tooltip,
  decimals = 0
}) {
  const isPositiveSaving = changePct < 0; // Negative emissions change = greener!

  const colorStyles = {
    emerald: {
      border: 'border-emerald-500/20',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#34d399',
      accentGlow: 'rgba(16, 185, 129, 0.08)'
    },
    teal: {
      border: 'border-teal-500/20',
      iconBg: 'rgba(20, 184, 166, 0.15)',
      iconColor: '#2dd4bf',
      accentGlow: 'rgba(20, 184, 166, 0.08)'
    },
    amber: {
      border: 'border-amber-500/20',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#fbbf24',
      accentGlow: 'rgba(245, 158, 11, 0.08)'
    },
    sky: {
      border: 'border-sky-500/20',
      iconBg: 'rgba(14, 165, 233, 0.15)',
      iconColor: '#38bdf8',
      accentGlow: 'rgba(14, 165, 233, 0.08)'
    },
    rose: {
      border: 'border-rose-500/20',
      iconBg: 'rgba(244, 63, 94, 0.15)',
      iconColor: '#fb7185',
      accentGlow: 'rgba(244, 63, 94, 0.08)'
    }
  }[color] || {
    border: 'border-emerald-500/20',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    accentGlow: 'rgba(16, 185, 129, 0.08)'
  };

  return (
    <div
      className="glass-card"
      style={{
        background: `radial-gradient(circle at top right, ${colorStyles.accentGlow} 0%, var(--bg-card) 60%)`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
          </span>
          {tooltip && (
            <span title={tooltip} style={{ cursor: 'help', color: 'var(--text-dim)', display: 'inline-flex' }}>
              <Info size={14} />
            </span>
          )}
        </div>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colorStyles.iconBg,
              color: colorStyles.iconColor
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          <AnimatedCounter value={value} decimals={decimals} />
        </div>
        {unit && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        {subtitle && (
          <span style={{ color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
        {changePct !== undefined && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              background: isPositiveSaving ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: isPositiveSaving ? '#34d399' : '#fb7185'
            }}
          >
            {isPositiveSaving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            <span>{Math.abs(changePct).toFixed(1)}% {changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
