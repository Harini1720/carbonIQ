import React, { useState } from 'react';
import { formatKg } from '../../utils/formatters';
import {
  Zap,
  Bus,
  Trash2,
  Sun,
  ArrowRight,
  CheckCircle,
  TrendingDown,
  Clock,
  Gauge
} from 'lucide-react';

export default function RecommendationCard({ recommendation, onApply }) {
  const [applied, setApplied] = useState(false);

  const categoryMeta = {
    electricity: { icon: Zap, color: '#10b981', label: 'Electricity / HVAC' },
    solar: { icon: Sun, color: '#38bdf8', label: 'Renewable Solar' },
    transport: { icon: Bus, color: '#14b8a6', label: 'Transportation' },
    waste: { icon: Trash2, color: '#f59e0b', label: 'Waste Management' }
  }[recommendation.category] || { icon: Zap, color: '#10b981', label: 'General' };

  const Icon = categoryMeta.icon;

  const handleApply = () => {
    setApplied(true);
    if (onApply) onApply(recommendation);
    setTimeout(() => setApplied(false), 2500);
  };

  const priorityBadgeStyle = {
    'High Priority': { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
    'Quick Win': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    'Medium Priority': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' }
  }[recommendation.priority] || { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' };

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        {/* Top Badges & Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: categoryMeta.color
            }}
          >
            <Icon size={14} />
            {categoryMeta.label}
          </span>

          <span
            style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '99px',
              fontWeight: 700,
              background: priorityBadgeStyle.bg,
              color: priorityBadgeStyle.text,
              border: `1px solid ${priorityBadgeStyle.border}`
            }}
          >
            {recommendation.priority}
          </span>
        </div>

        {/* Title */}
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
          {recommendation.title}
        </h4>

        {/* Reason */}
        <div
          style={{
            background: 'rgba(16, 28, 24, 0.7)',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            borderLeft: `3px solid ${categoryMeta.color}`
          }}
        >
          <strong style={{ color: '#fff', display: 'block', fontSize: '0.72rem', marginBottom: '2px' }}>
            Data-Driven Rationale:
          </strong>
          {recommendation.reason}
        </div>

        {/* Action Description */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
          {recommendation.action}
        </p>
      </div>

      {/* Quantified Benefit & Action Button */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '14px',
            fontSize: '0.75rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Expected Avoidance:</span>
            <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>
              {formatKg(recommendation.expectedSavingsKg)}/mo
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Difficulty / Payback:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {recommendation.difficulty} ({recommendation.roiMonths})
            </span>
          </div>
        </div>

        <button
          onClick={handleApply}
          className={`btn ${applied ? 'btn-secondary' : 'btn-primary'}`}
          style={{ width: '100%', fontSize: '0.82rem', gap: '6px' }}
        >
          {applied ? (
            <>
              <CheckCircle size={15} color="#34d399" />
              Applied to Simulator Levers!
            </>
          ) : (
            <>
              Apply to Scenario Simulator
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
