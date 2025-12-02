import React from 'react';
import { useToast } from '../context/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div aria-live="polite" aria-atomic="true" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
      <div className="space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
