import React from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'error', message }) => {
  const colors = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <div className={`p-4 rounded-md border text-sm font-medium ${colors[type]}`}>
      {message}
    </div>
  );
};
