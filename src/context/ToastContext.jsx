import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast renderer */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#fff' : t.type === 'error' ? '#fff' : '#fff',
            border: `1px solid ${t.type === 'success' ? '#6ecf96' : t.type === 'error' ? '#f87171' : '#93c5fd'}`,
            borderLeft: `4px solid ${t.type === 'success' ? '#2E7D32' : t.type === 'error' ? '#dc2626' : '#3b82f6'}`,
            borderRadius: 10, padding: '12px 18px', minWidth: 260,
            boxShadow: '0 4px 16px rgba(0,0,0,.08)',
            fontSize: '.875rem', fontFamily: 'sans-serif',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
