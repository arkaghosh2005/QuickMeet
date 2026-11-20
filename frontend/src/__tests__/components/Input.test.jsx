import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import Input from '../../components/Input';

// Helper to render with ThemeProvider (Input uses useTheme)
const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Input', () => {
    it('renders with label', () => {
        renderWithTheme(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders input element with props', () => {
        renderWithTheme(<Input type="text" placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('shows error message when error prop is set', () => {
        renderWithTheme(<Input error="Field is required" />);
        expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    it('applies error border class when error is set', () => {
        const { container } = renderWithTheme(<Input error="Error" />);
        const input = container.querySelector('input');
        expect(input.className).toContain('border-red-500');
    });

    it('renders icon when icon prop is provided', () => {
        renderWithTheme(<Input icon={<span data-testid="icon">🔒</span>} />);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('adds pl-10 padding when icon is present', () => {
        const { container } = renderWithTheme(<Input icon={<span>icon</span>} />);
        const input = container.querySelector('input');
        expect(input.className).toContain('pl-10');
    });

    it('renders suffix when suffix prop is provided', () => {
        renderWithTheme(<Input suffix={<button data-testid="suffix-btn">👁</button>} />);
        expect(screen.getByTestId('suffix-btn')).toBeInTheDocument();
    });

    it('adds pr-10 padding when suffix is present', () => {
        const { container } = renderWithTheme(<Input suffix={<span>suffix</span>} />);
        const input = container.querySelector('input');
        expect(input.className).toContain('pr-10');
    });

    it('does not add pr-10 when suffix is absent', () => {
        const { container } = renderWithTheme(<Input />);
        const input = container.querySelector('input');
        expect(input.className).not.toContain('pr-10');
    });

    it('fires onChange when user types', () => {
        const onChange = vi.fn();
        renderWithTheme(<Input onChange={onChange} placeholder="type here" />);
        fireEvent.change(screen.getByPlaceholderText('type here'), { target: { value: 'hello' } });
        expect(onChange).toHaveBeenCalled();
    });

    it('applies custom className', () => {
        const { container } = renderWithTheme(<Input className="custom-class" />);
        const input = container.querySelector('input');
        expect(input.className).toContain('custom-class');
    });
});
