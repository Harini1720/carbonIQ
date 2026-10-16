import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function InfoNotice({ title, message, type = 'info', dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isSimulated = type === 'simulated';
  const isVerified = type === 'verified';
  const Icon = isSimulated ? AlertCircle : isVerified ? CheckCircle : Info;
  const iconColor = isSimulated ? 'var(--amber)' : isVerified ? 'var(--primary)' : 'var(--sky)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderRadius: '12px',
        marginBottom: '20px',
        background: isSimulated ? 'rgba(245, 158, 11, 0.1)' : isVerified ? 'var(--primary-glow)' : 'var(--bg-card-muted)',
        border: `1px solid ${isSimulated ? 'rgba(245, 158, 11, 0.3)' : isVerified ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
        color: 'var(--text-secondary)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--text-primary)', marginRight: '6px' }}>
            {title || (isSimulated ? 'Scenario Estimate:' : isVerified ? 'Calculation Basis:' : 'Information:')}
          </strong>
          {message ||
            'Values are calculated from activity data you enter using the selected emission factors.'}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.7
          }}
          title="Dismiss notice"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
