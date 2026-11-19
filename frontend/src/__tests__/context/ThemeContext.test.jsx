import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
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
        document.documentElement.classList.remove('dark');
    });

    it('defaults to light mode when no localStorage', () => {
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('reads dark mode from localStorage', async () => {
        localStorage.setItem('theme', 'dark');
        render(
            <ThemeProvider>
                <TestConsumer />
            </ThemeProvider>
        );
        // ThemeContext reads localStorage in useEffect (async), so wait for update
        await waitFor(() => {
            expect(screen.getByTestId('mode')).toHaveTextContent('dark');
        });
    });

    it('toggles dark mode', async () => {
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
        expect(localStorage.getItem('theme')).toBe('dark');
    });
});
