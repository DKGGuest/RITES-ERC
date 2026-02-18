import React from 'react';

export const Modal = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay active">
            <div className="admin-modal">
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">{title}</h2>
                    <button className="admin-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};
