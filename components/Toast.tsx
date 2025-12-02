import React, { useEffect, useState } from 'react';
import { ToastMessage, ToastType } from '../context/ToastContext';
import { CheckCircleIcon, ExclamationCircleIcon, InfoIcon, XIcon } from './Icons';

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to finish before removing from DOM
    setTimeout(() => onDismiss(message.id), 300);
  }

  const typeStyles: { [key in ToastType]: { bg: string, border: string, iconColor: string, icon: React.ReactNode } } = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/50',
      border: 'border-green-400 dark:border-green-600',
      iconColor: 'text-green-500 dark:text-green-400',
      icon: <CheckCircleIcon className="h-5 w-5" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/50',
      border: 'border-red-400 dark:border-red-600',
      iconColor: 'text-red-500 dark:text-red-400',
      icon: <ExclamationCircleIcon className="h-5 w-5" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/50',
      border: 'border-blue-400 dark:border-blue-600',
      iconColor: 'text-blue-500 dark:text-blue-400',
      icon: <InfoIcon className="h-5 w-5" />,
    },
  };

  const styles = typeStyles[message.type];

  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-lg pointer-events-auto
        flex ring-1 ring-black ring-opacity-5
        transform transition-all duration-300 ease-in-out
        ${styles.bg} border-l-4 ${styles.border}
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex-shrink-0 p-3">
        <span className={styles.iconColor}>{styles.icon}</span>
      </div>
      <div className="py-3 pr-3 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{message.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message.text}</p>
      </div>
      <div className="flex-shrink-0 p-2">
        <button
          onClick={handleDismiss}
          className="inline-flex rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Dismiss</span>
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
