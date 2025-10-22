import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  icon: Icon,
  fullWidth = false 
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-300 dark:hover:bg-slate-700',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 20} />}
    </button>
  );
};

export default Button;