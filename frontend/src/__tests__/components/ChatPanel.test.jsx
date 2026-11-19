import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import ChatPanel from '../../components/ChatPanel';

const mockMessages = [
    { id: '1', senderName: 'Alice', message: 'Hello!', timestamp: new Date() },
    { id: '2', senderName: 'Bob', message: 'Hi there!', timestamp: new Date() },
];

// Helper to render with ThemeProvider (ChatPanel uses Button which uses useTheme)
const renderWithTheme = (ui) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ChatPanel', () => {
    it('returns null when not open', () => {
        const { container } = renderWithTheme(
            <ChatPanel
                isOpen={false}
                onClose={() => {}}
                messages={[]}
                onSendMessage={() => {}}
                currentUserName="Alice"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders empty state when no messages', () => {
        renderWithTheme(
            <ChatPanel
                isOpen={true}
                onClose={() => {}}
                messages={[]}
                onSendMessage={() => {}}
                currentUserName="Alice"
            />
        );
        expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('renders messages', () => {
        renderWithTheme(
            <ChatPanel
                isOpen={true}
                onClose={() => {}}
                messages={mockMessages}
                onSendMessage={() => {}}
                currentUserName="Alice"
            />
        );
        expect(screen.getByText('Hello!')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('calls onSendMessage when form is submitted', () => {
        const onSend = vi.fn();
        renderWithTheme(
            <ChatPanel
                isOpen={true}
                onClose={() => {}}
                messages={[]}
                onSendMessage={onSend}
                currentUserName="Alice"
            />
        );
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(input.closest('form'));
        expect(onSend).toHaveBeenCalledWith('Test message');
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        renderWithTheme(
            <ChatPanel
                isOpen={true}
                onClose={onClose}
                messages={[]}
                onSendMessage={() => {}}
                currentUserName="Alice"
            />
        );
        // The close button is the first button in the panel (X icon)
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);
        expect(onClose).toHaveBeenCalled();
    });

    it('has role="region" with aria-label', () => {
        renderWithTheme(
            <ChatPanel
                isOpen={true}
                onClose={() => {}}
                messages={[]}
                onSendMessage={() => {}}
                currentUserName="Alice"
            />
        );
        expect(screen.getByRole('region', { name: 'Meeting Chat' })).toBeInTheDocument();
    });
});
