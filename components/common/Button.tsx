import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'custom';
  children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseStyles = 'px-6 py-3 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f10] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none';
  
  const variantStyles = {
    primary: 'bg-fuchsia-500 text-white shadow-lg hover:bg-fuchsia-600 hover:shadow-fuchsia-500/50 focus:ring-fuchsia-500 disabled:bg-fuchsia-500/50',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-600/50'
  };

  const appliedVariantStyles = (variant === 'primary' || variant === 'secondary') ? variantStyles[variant] : '';

  return (
    <button className={`${baseStyles} ${appliedVariantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Button = React.memo(ButtonComponent);