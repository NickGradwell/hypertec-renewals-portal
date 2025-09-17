import React from 'react';

const Textarea = React.forwardRef(({ 
  className = '', 
  variant = 'default',
  size = 'default',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';
  
  const variantClasses = {
    default: 'border-gray-300',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    default: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <textarea
      ref={ref}
      className={classes}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
