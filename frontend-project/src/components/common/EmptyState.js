import React from 'react';

const EmptyState = ({ title = 'No data found', message = 'There are no records to display.', action }) => {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4 text-gray-300">📋</div>
      <h3 className="text-lg font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
