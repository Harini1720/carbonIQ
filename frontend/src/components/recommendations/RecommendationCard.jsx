import React from 'react';
import { Zap, Bus, Trash2, ArrowRight } from 'lucide-react';

const CATEGORY_META = {
  electricity: { icon: Zap, color: '#087f5b', label: 'Electricity' },
  transport: { icon: Bus, color: '#15966c', label: 'Transportation' },
  waste: { icon: Trash2, color: '#b86e12', label: 'Waste' }
};

export default function RecommendationCard({
  recommendation,
  onNavigate,
  actionLabel = 'Explore a what-if scenario',
  destination = 'simulator',
  evidenceLabel = 'From your entered data'
}) {
  const categoryMeta = CATEGORY_META[recommendation.category];
  const Icon = categoryMeta.icon;

  const priorityBadgeStyle = recommendation.priority === 'High Priority'
    ? { bg: '#fff0ef', text: '#a8333e', border: '#f1c8c9' }
    : { bg: '#fff5e5', text: '#986012', border: '#f0dbb7' };

  return (
    <div className="glass-card recommendation-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: categoryMeta.color }}>
            <Icon size={14} />
            {categoryMeta.label}
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '99px',
            fontWeight: 700,
            background: priorityBadgeStyle.bg,
            color: priorityBadgeStyle.text,
            border: `1px solid ${priorityBadgeStyle.border}`
          }}>
            {recommendation.priority}
          </span>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
          {recommendation.title}
        </h4>

        <div style={{
          background: 'var(--bg-card-muted)',
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          borderLeft: `3px solid ${categoryMeta.color}`
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.72rem', marginBottom: '2px' }}>
            {evidenceLabel}
          </strong>
          {recommendation.reason}
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
          {recommendation.action}
        </p>
      </div>

      <button
        onClick={() => onNavigate(destination)}
        className="btn btn-secondary"
        style={{ width: '100%', fontSize: '0.82rem', gap: '6px' }}
      >
        {actionLabel}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
