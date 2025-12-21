import { useTheme } from '../context/ThemeContext';

const Input = ({
    label,
    error,
    icon,
    className = '',
    forceLightMode = false,
    ...props
}) => {
    const { isDarkMode } = useTheme();
    const useDarkMode = forceLightMode ? false : isDarkMode;  // Override if forced

    const baseInputClasses = [
        'w-full',
        'px-3',
        'py-2',
        'border',
        'rounded-lg',
        'shadow-sm',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent',
        'disabled:opacity-50'
    ];

    if (icon) {
        baseInputClasses.push('pl-10');
    }

    if (error) {
        baseInputClasses.push('border-red-500', 'focus:ring-red-500');
    } else {
        baseInputClasses.push(
            useDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
        );
    }

    const inputClasses = [...baseInputClasses, className].join(' ');

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-sm font-medium mb-1 ${useDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}

                <input
                    className={inputClasses}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Input;
