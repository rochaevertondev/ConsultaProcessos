/**
 * Hook para gerenciar toast notifications
 */
import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // 'success' | 'error' | 'info'
  });

  /**
   * Mostra toast notification
   */
  const showToast = (message, type = 'success', duration = 5000) => {
    setToast({ show: true, message, type });
    
    setTimeout(() => {
      hideToast();
    }, duration);
  };

  /**
   * Esconde toast
   */
  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};
