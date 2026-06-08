import Button from './Button';

const ConfirmModal = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60"
            onClick={onCancel}
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-700 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex space-x-3">
                    <Button
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
