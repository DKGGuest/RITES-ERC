import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  // Convert status to CSS class (handle spaces and special characters)
  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  };

  const className = `status-badge ${getStatusClass(status)}`;
  return <span className={className}>{status}</span>;
};

export default StatusBadge;
