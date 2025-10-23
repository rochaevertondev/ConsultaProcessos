/**
 * Componente Toast - Notificações
 */
import React from 'react';

const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span>{toast.message}</span>
    </div>
  );
};

export default Toast;
