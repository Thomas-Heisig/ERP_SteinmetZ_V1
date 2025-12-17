// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Toast.tsx

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";
import { ToastContext } from "./useToast";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body,
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const typeIcons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const toastClasses = [styles.toast, styles[toast.type]]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={toastClasses}>
      <span className={styles.toastIcon}>{typeIcons[toast.type]}</span>
      <p className={styles.toastMessage}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={styles.toastClose}
        aria-label="Schließen"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastProvider;
