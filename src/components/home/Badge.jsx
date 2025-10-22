import React from 'react';

const Badge = ({ children, variant = 'blue', className = '' }) => {
  const variants = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 dark:border-blue-400/30',
    green: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 dark:border-green-400/30',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 dark:border-purple-400/30',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 dark:border-orange-400/30'
  };

  return (
    <div className={`
      inline-flex items-center px-4 py-2 border-2 rounded-full text-sm font-semibold
      transition-all duration-300 hover:scale-105
      ${variants[variant]} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Badge;