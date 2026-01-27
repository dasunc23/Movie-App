import React from 'react';

export const Textarea = ({ 
  placeholder,
  value,
  onChange,
  name,
  label,
  error,
  rows = 4,
  className = '',
  required = false,
  maxLength
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="
          w-full px-4 py-3 
          bg-dark-card border border-dark-border rounded-lg 
          text-white placeholder-gray-400 
          focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          transition-all duration-200
          resize-none
        "
      />
      
      <div className="flex justify-between mt-1">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {maxLength && (
          <p className="text-sm text-gray-400 ml-auto">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};