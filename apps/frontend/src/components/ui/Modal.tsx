// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Modal.tsx

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

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

  const modalClasses = [styles.modal, styles[size]].filter(Boolean).join(" ");

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Schließen"
                className={styles.closeButton}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
