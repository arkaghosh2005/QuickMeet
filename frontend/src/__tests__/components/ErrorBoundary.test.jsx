import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) throw new Error('Test error');
    return <div>Content rendered</div>;
};

describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText('Content rendered')).toBeInTheDocument();
    });

    it('renders fallback UI on error', () => {
        // Suppress console.error for the expected error
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Refresh Page')).toBeInTheDocument();
        spy.mockRestore();
    });
});

