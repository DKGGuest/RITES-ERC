import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  // Convert status to CSS class (handle spaces, underscores and special characters)
  const getStatusClass = (status) => {
    return status
      .toLowerCase()
      .replace(/[_\s]+/g, '-')   // Replace spaces/underscores with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove other special characters
  };

  // Format status text for display (convert underscores to spaces and title case)
  const formatStatusText = (status) => {
    return status
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const className = `status-badge ${getStatusClass(status)}`;
  const displayText = formatStatusText(status);

  return <span className={className}>{displayText}</span>;
};

export default StatusBadge;
