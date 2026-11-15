import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Test component that exposes theme state
const TestConsumer = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    return (
        <div>
            <span data-testid="mode">{isDarkMode ? 'dark' : 'light'}</span>
            <button onClick={toggleDarkMode}>Toggle</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('defaults to light mode when no localStorage', () => {
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('reads dark mode from localStorage', () => {
        localStorage.setItem('darkMode', 'true');
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('toggles dark mode', () => {
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
        act(() => {
            screen.getByText('Toggle').click();
        });
        expect(screen.getByTestId('mode')).toHaveTextContent('dark');
        expect(localStorage.getItem('darkMode')).toBe('true');
    });
});

