import React from 'react';

export const Container = ({ children, className = '' }) => {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {children}
    </div>
  );
};