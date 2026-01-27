import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false 
}) => {
  const baseStyles = 'font-semibold transition-all duration-300 rounded-lg inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/50 disabled:bg-primary-800 disabled:cursor-not-allowed',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:cursor-not-allowed',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed',
    ghost: 'text-primary-600 hover:bg-primary-600/10 disabled:text-gray-600 disabled:cursor-not-allowed',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/50 disabled:bg-red-800 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};