import React from 'react';
import { useToast } from '../../contexts/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>✕</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
