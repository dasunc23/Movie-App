import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  hover = false,
  onClick 
}) => {
  const baseStyles = 'bg-dark-card border border-dark-border rounded-xl shadow-xl';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:border-primary-500/50 transition-all duration-300 cursor-pointer' : '';

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};