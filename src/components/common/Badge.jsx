import React from 'react';

export const Badge = ({ children, variant, status, type = 'status' }) => {
  let computedVariant = variant || 'neutral';

  if (status) {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'available' || s === 'active' || s === 'normal') {
      computedVariant = 'success';
    } else if (s === 'scheduled' || s === 'pending') {
      computedVariant = 'warning';
    } else if (s === 'cancelled' || s === 'critical' || s === 'inactive' || s === 'emergency') {
      computedVariant = 'danger';
    } else if (s === 'in progress' || s === 'busy') {
      computedVariant = 'info';
    }
  }

  return <span className={`badge badge-${computedVariant}`}>{children || status}</span>;
};

export default Badge;
