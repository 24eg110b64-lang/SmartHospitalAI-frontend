import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'primary', // primary | secondary | purple | warning | success | danger
  subtext,
  onClick,
}) => {
  return (
    <div
      className={`stat-card ${variant}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper ${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
