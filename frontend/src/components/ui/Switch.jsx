import React from 'react';

const Switch = React.forwardRef(({ 
  className = '', 
  variant = 'default',
  size = 'default',
  checked = false,
  onChange,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: checked 
      ? 'bg-blue-600 focus:ring-blue-500' 
      : 'bg-gray-200 focus:ring-gray-500',
    error: checked 
      ? 'bg-red-600 focus:ring-red-500' 
      : 'bg-gray-200 focus:ring-gray-500',
    success: checked 
      ? 'bg-green-600 focus:ring-green-500' 
      : 'bg-gray-200 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'h-4 w-7',
    default: 'h-6 w-11',
    lg: 'h-8 w-14'
  };
  
  const thumbClasses = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    checked ? 'translate-x-6' : 'translate-x-1'
  } ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : ''}`;
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;
  
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={classes}
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      {...props}
    >
      <span className={thumbClasses} />
    </button>
  );
});

Switch.displayName = 'Switch';

export default Switch;