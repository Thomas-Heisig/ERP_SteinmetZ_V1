// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Toast.tsx

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

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
    <div
      className="ui-toast-container"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 9999,
        maxWidth: "400px",
      }}
    >
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

  const typeStyles: Record<
    ToastType,
    { bg: string; border: string; icon: string }
  > = {
    success: {
      bg: "var(--success-50)",
      border: "var(--success-500)",
      icon: "✓",
    },
    error: {
      bg: "var(--error-50)",
      border: "var(--error-500)",
      icon: "✕",
    },
    warning: {
      bg: "var(--warning-50)",
      border: "var(--warning-500)",
      icon: "⚠",
    },
    info: {
      bg: "var(--info-50)",
      border: "var(--primary-500)",
      icon: "ℹ",
    },
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      className="ui-toast"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1rem",
        background: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: "8px",
        boxShadow: "var(--shadow-lg)",
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{styles.icon}</span>
      <p style={{ margin: 0, flex: 1, color: "var(--text-primary)" }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          color: "var(--text-tertiary)",
          padding: "0.25rem",
        }}
      >
        ✕
      </button>
    </div>
  );
};

// Convenience functions
export const toast = {
  success: (message: string, duration?: number) => ({
    type: "success" as const,
    message,
    duration,
  }),
  error: (message: string, duration?: number) => ({
    type: "error" as const,
    message,
    duration,
  }),
  warning: (message: string, duration?: number) => ({
    type: "warning" as const,
    message,
    duration,
  }),
  info: (message: string, duration?: number) => ({
    type: "info" as const,
    message,
    duration,
  }),
};

export default ToastProvider;
