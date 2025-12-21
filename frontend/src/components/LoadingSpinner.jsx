const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const spinnerClasses = [
        'animate-spin',
        'rounded-full',
        'border-2',
        'border-gray-300',
        'border-t-blue-600',
        sizeClasses[size],
        className,
    ].join(' ');

    return <div className={spinnerClasses} />;
};

export default LoadingSpinner;
