import { useEffect, useRef } from 'react';
import Button from './Button';

const ConfirmModal = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant = 'danger' }) => {
    const cancelRef = useRef(null);
    const modalRef = useRef(null);

    // Auto-focus cancel button and trap focus within modal
    useEffect(() => {
        if (!isOpen) return;

        // Auto-focus cancel button on open
        cancelRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }

            // Focus trap: Tab / Shift+Tab cycle within modal
            if (e.key === 'Tab') {
                const focusable = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable || focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
        >
            <div
                ref={modalRef}
                className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-700 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="confirm-modal-title" className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p id="confirm-modal-message" className="text-gray-300 mb-6">{message}</p>
                <div className="flex space-x-3">
                    <Button
                        ref={cancelRef}
                        variant="ghost"
                        onClick={onCancel}
                        className="flex-1 text-gray-300 hover:bg-gray-700"
                    >
                        {cancelText || 'Cancel'}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        {confirmText || 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
