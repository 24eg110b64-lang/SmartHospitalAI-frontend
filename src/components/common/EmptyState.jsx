import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this list.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-medium)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          marginBottom: '0.35rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          marginBottom: actionLabel ? '1.25rem' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          <Plus size={16} /> {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
