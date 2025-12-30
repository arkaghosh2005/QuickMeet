import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import Button from './Button';

const ChatPanel = ({
    isOpen,
    onClose,
    messages,
    onSendMessage,
    currentUserName,
}) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (event) => {
        event.preventDefault();
        const trimmedMessage = newMessage.trim();

        if (trimmedMessage) {
            onSendMessage(trimmedMessage);
            setNewMessage('');
        }
    };

    const handleMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isCurrentUser = (senderName) => {
        return senderName === currentUserName;
    };

    const isMessageEmpty = !newMessage.trim();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="h-full w-full bg-gray-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white">Meeting Chat</h3>
                <Button onClick={onClose} variant="ghost" className="p-1 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwnMessage = isCurrentUser(message.senderName);

                        return (
                            <div
                                key={message.id}
                                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                            >
                                {/* Message Bubble */}
                                <div
                                    className={`max-w-xs px-3 py-2 rounded-lg ${isOwnMessage
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-100'
                                        }`}
                                >
                                    <p className="text-sm">{message.message}</p>
                                </div>

                                {/* Message Info */}
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-400">{message.senderName}</span>
                                    {message.timestamp && (
                                        <span className="text-xs text-gray-500">
                                            {formatTime(message.timestamp)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleMessageChange}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button type="submit" disabled={isMessageEmpty} className="px-3 py-2">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatPanel;