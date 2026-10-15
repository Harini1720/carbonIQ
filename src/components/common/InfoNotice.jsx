import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, X } from 'lucide-react';

export default function InfoNotice({ title, message, type = 'simulated', dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isSimulated = type === 'simulated';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderRadius: '12px',
        marginBottom: '20px',
        background: isSimulated ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${isSimulated ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        color: isSimulated ? '#fde68a' : '#a7f3d0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isSimulated ? (
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />
        )}
        <div style={{ fontSize: '0.85rem' }}>
          <strong style={{ color: '#fff', marginRight: '6px' }}>
            {title || (isSimulated ? 'Simulated Demonstration Data:' : 'Verified Data Logic:')}
          </strong>
          {message ||
            'Values presented are calibrated simulations derived from CEA India v19, IPCC AR6, and DEFRA methodologies. Never presented as real-time IoT campus sensor telemetry.'}
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
