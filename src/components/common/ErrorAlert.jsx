import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorAlert = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        color: '#991b1b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={20} style={{ flexShrink: 0, color: '#dc2626' }} />
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{message}</span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            flexShrink: 0,
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
