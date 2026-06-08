import { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

const Button = forwardRef(({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}, ref) => {
    const { isDarkMode } = useTheme();

    // Base styles that apply to all buttons
    const baseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
    ].join(' ');

    // Variant-specific styles
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: isDarkMode
            ? 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
            : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: isDarkMode
            ? 'text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
            : 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    // Size-specific styles
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    // Combine all classes
    const buttonClasses = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
    ].join(' ');

    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            className={buttonClasses}
            disabled={isDisabled}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" className="mr-2" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
