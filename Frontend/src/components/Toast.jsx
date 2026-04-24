import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ type, title, message, onClose }) => {
    const icons = {
        success: <CheckCircle size={16} />,
        error: <XCircle size={16} />,
        info: <Info size={16} />,
        warning: <AlertTriangle size={16} />
    };

    return (
        <div className={`toast-card ${type}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-body">
                <span className="toast-title">{title}</span>
                {message && <span className="toast-message">{message}</span>}
            </div>
            <button className="toast-close" onClick={onClose}><X size={16} /></button>
            <div className="toast-progress"></div>
        </div>
    );
};

export default Toast;
