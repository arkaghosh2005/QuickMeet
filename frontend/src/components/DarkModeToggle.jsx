import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    const toggleContainerStyle = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '60px',
        height: '30px',
        backgroundColor: isDarkMode ? '#3B82F6' : '#D1D5DB',
        borderRadius: '15px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        padding: '3px',
    };

    const toggleButtonStyle = {
        position: 'absolute',
        width: '24px',
        height: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease',
        transform: isDarkMode ? 'translateX(30px)' : 'translateX(0px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    };

    return (
        <div
            onClick={toggleDarkMode}
            style={toggleContainerStyle}
            role="button"
            aria-label="Toggle dark mode"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    toggleDarkMode();
                }
            }}
        >
            <div style={toggleButtonStyle}>
                {isDarkMode ? (
                    <Moon style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
                ) : (
                    <Sun style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                )}
            </div>
        </div>
    );
};

export default DarkModeToggle;
