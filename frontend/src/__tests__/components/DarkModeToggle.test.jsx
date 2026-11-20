import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import DarkModeToggle from '../../components/DarkModeToggle';

// Helper to render with ThemeProvider
const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('DarkModeToggle', () => {
    it('renders toggle button', () => {
        renderWithTheme(<DarkModeToggle />);
        expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
    });

    it('is keyboard accessible (has tabIndex)', () => {
        renderWithTheme(<DarkModeToggle />);
        const toggle = screen.getByRole('button', { name: /toggle dark mode/i });
        expect(toggle).toHaveAttribute('tabindex', '0');
    });
});
