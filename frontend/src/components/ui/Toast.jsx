import React, { createContext, useContext, useState, useCallback } from 'react';
import '../../styles/components.css';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, msg, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, title, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-icon" />
            <div>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
