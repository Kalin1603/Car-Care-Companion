import React, { createContext, useState, useCallback, FC, ReactNode } from 'react';
import { Toast, ToastType } from '../types';
import { createPortal } from 'react-dom';

const FADE_ANIMATION_DURATION = 500; // ms

interface ToastContextType {
  showToast: (message: string, options?: { type?: ToastType, duration?: number }) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface InternalToast extends Toast {
    duration: number;
    removing?: boolean;
}

const ToastContainer: FC<{ toasts: InternalToast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
    const toastIcons: Record<ToastType, string> = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    return createPortal(
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast-message toast-${toast.type} ${toast.removing ? 'toast-fade-out' : ''}`}>
                    <span className="material-symbols-outlined">{toastIcons[toast.type]}</span>
                    <span>{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="toast-close-btn" aria-label="Close">&times;</button>
                    <div className="toast-progress-bar" style={{ animationDuration: `${toast.duration}ms` }}></div>
                </div>
            ))}
        </div>,
        document.body
    );
};

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, removing: true } : toast
      )
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, FADE_ANIMATION_DURATION);
  }, []);

  const showToast = useCallback((message: string, options?: { type?: ToastType, duration?: number }) => {
    const id = new Date().toISOString() + Math.random();
    const type = options?.type || 'info';
    const duration = options?.duration || 5000;

    setToasts(prev => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};