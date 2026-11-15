import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from '../../components/Skeleton';

describe('Skeleton', () => {
    it('renders with default classes', () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild;
        expect(el).toHaveClass('animate-pulse');
        expect(el).toHaveClass('rounded');
    });

    it('accepts custom className', () => {
        const { container } = render(<Skeleton className="h-10 w-32" />);
        const el = container.firstChild;
        expect(el).toHaveClass('h-10');
        expect(el).toHaveClass('w-32');
    });
});

