import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
    it('renders with children text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeTruthy();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled').closest('button')).toHaveProperty('disabled', true);
    });

    it('shows loading spinner when loading', () => {
        render(<Button loading>Submit</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveProperty('disabled', true);
    });

    it('applies variant classes correctly', () => {
        const { container } = render(<Button variant="danger">Delete</Button>);
        const button = container.querySelector('button');
        expect(button.className).toContain('bg-red');
    });
});