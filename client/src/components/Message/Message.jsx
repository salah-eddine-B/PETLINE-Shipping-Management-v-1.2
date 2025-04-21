import React, { useEffect } from 'react';
import './Message.css';

export default function Message({ type, text, onClose }) {
    useEffect(() => {
        if (text) {
            const timer = setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [text, onClose]);

    if (!text) return null;

    return (
        <div className={`message ${type}`}>
            <span>{text}</span>
            {onClose && (
                <button className="message-close" onClick={onClose}>
                    ×
                </button>
            )}
        </div>
    );
} 