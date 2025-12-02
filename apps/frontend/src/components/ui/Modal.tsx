// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Modal.tsx

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeStyles: Record<string, string> = {
    sm: "400px",
    md: "560px",
    lg: "800px",
    xl: "1140px",
    full: "calc(100vw - 2rem)",
  };

  const modalContent = (
    <div
      className="ui-modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1040,
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        className="ui-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: sizeStyles[size],
          maxHeight: "calc(100vh - 2rem)",
          background: "var(--surface)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-2xl)",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {(title || showCloseButton) && (
          <div
            className="ui-modal__header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.5rem",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "var(--text-tertiary)",
                  borderRadius: "6px",
                  transition: "background 0.2s ease",
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div
          className="ui-modal__content"
          style={{
            flex: 1,
            padding: "1.5rem",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
