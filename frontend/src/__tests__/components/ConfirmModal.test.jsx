import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../components/ConfirmModal';

describe('ConfirmModal', () => {
    it('returns null when not open', () => {
        const { container } = render(
            <ConfirmModal
                isOpen={false}
                title="Test"
                message="Test message"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders title and message when open', () => {
        render(
            <ConfirmModal
                isOpen={true}
                title="Leave Meeting?"
                message="Are you sure?"
                confirmText="Leave"
                cancelText="Stay"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(screen.getByText('Leave Meeting?')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText('Leave')).toBeInTheDocument();
        expect(screen.getByText('Stay')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Test"
                message="Test"
                confirmText="Yes"
                onConfirm={onConfirm}
                onCancel={() => {}}
            />
        );
        fireEvent.click(screen.getByText('Yes'));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button clicked', () => {
        const onCancel = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Test"
                message="Test"
                cancelText="No"
                onConfirm={() => {}}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByText('No'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('has proper aria attributes', () => {
        render(
            <ConfirmModal
                isOpen={true}
                title="Test"
                message="Test message"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
});

