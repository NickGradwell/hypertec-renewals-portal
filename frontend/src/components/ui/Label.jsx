import React from 'react';

const Label = React.forwardRef(({ 
  className = '', 
  variant = 'default',
  size = 'default',
  children,
  ...props 
}, ref) => {
  const baseClasses = 'block font-medium text-gray-700';
  
  const variantClasses = {
    default: 'text-gray-700',
    error: 'text-red-700',
    success: 'text-green-700',
    warning: 'text-yellow-700'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-sm',
    lg: 'text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <label
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export default Label;
