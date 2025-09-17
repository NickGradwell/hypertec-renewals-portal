import React from 'react';

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-white hover:bg-primary-hover",
    destructive: "bg-red-600 text-white hover:bg-red-700/90",
    outline: "border border-gray-300 hover:bg-primary/10 hover:text-primary",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300/80",
    ghost: "hover:bg-primary/10 hover:text-primary",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
