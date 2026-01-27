import React from 'react';

export const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const loader = (
    <div className={`
      ${sizes[size]}
      border-primary-600 border-t-transparent
      rounded-full animate-spin
    `} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {loader}
    </div>
  );
};