import React from 'react';

export const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  label,
  error,
  icon,
  className = '',
  required = false,
  disabled = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            ${icon ? 'pl-12' : ''}
            bg-dark-card border border-dark-border rounded-lg 
            text-white placeholder-gray-400 
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            disabled:bg-gray-800 disabled:cursor-not-allowed
            transition-all duration-200
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};