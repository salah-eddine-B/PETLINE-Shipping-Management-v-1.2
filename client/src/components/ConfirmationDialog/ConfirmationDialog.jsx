import React from 'react';
import './ConfirmationDialog.css';

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirmation-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Non</button>
                    <button className="btn btn-primary" onClick={onConfirm}>Oui</button>
                </div>
            </div>
        </div>
    );
} 