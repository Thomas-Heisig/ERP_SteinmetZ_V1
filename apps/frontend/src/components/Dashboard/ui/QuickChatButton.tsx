// SPDX-License-Identifier: MIT
// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/ui/QuickChatButton.tsx

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardContext } from "../core/DashboardContext";
import cls from "../utils/cls";

// ============================================================================
// Type Definitions
// ============================================================================

export interface QuickChatButtonProps {
  position?: "BOTTOM_RIGHT" | "BOTTOM_LEFT" | "TOP_RIGHT" | "TOP_LEFT";
  variant?: "FLOATING" | "STATIC" | "MINIMAL";
  onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void;
  isOpen?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

const QuickChatButton: React.FC<QuickChatButtonProps> = ({
  position = "BOTTOM_RIGHT",
  variant = "FLOATING",
  onClick,
  isOpen = false,
  showNotification = false,
  notificationCount = 0,
  className = "",
  ...rest
}) => {
  const { t } = useTranslation();
  const { dispatch } = useDashboardContext();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [localState, setLocalState] = useState({
    isHovered: false,
    isPressed: false,
    isFocused: false,
    showNotification,
    notificationCount,
  });

  // Sync props → local state
  useEffect(() => {
    setLocalState((prev) => ({
      ...prev,
      showNotification,
      notificationCount,
    }));
  }, [showNotification, notificationCount]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    dispatch({ type: "TOGGLE_CHAT" });
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      buttonRef.current?.click();
    }

    if (event.key === "Escape" && localState.isFocused) {
      buttonRef.current?.blur();
    }
  };

  // ---------------------------------------------------------------------------
  // Mouse / Focus handling
  // ---------------------------------------------------------------------------

  const handleMouseEnter = () =>
    setLocalState((prev) => ({ ...prev, isHovered: true }));

  const handleMouseLeave = () =>
    setLocalState((prev) => ({ ...prev, isHovered: false, isPressed: false }));

  const handleMouseDown = () =>
    setLocalState((prev) => ({ ...prev, isPressed: true }));

  const handleMouseUp = () =>
    setLocalState((prev) => ({ ...prev, isPressed: false }));

  const handleFocus = () =>
    setLocalState((prev) => ({ ...prev, isFocused: true }));

  const handleBlur = () =>
    setLocalState((prev) => ({ ...prev, isFocused: false }));

  // ---------------------------------------------------------------------------
  // Position Styles
  // ---------------------------------------------------------------------------

  const positionStyles: React.CSSProperties =
    variant === "FLOATING"
      ? {
          position: "fixed",
          zIndex: 1000,
          ...(position === "BOTTOM_RIGHT" && {
            bottom: "1.5rem",
            right: "1.5rem",
          }),
          ...(position === "BOTTOM_LEFT" && {
            bottom: "1.5rem",
            left: "1.5rem",
          }),
          ...(position === "TOP_RIGHT" && { top: "1.5rem", right: "1.5rem" }),
          ...(position === "TOP_LEFT" && { top: "1.5rem", left: "1.5rem" }),
        }
      : {};

  // ---------------------------------------------------------------------------
  // Classnames für cls() – nur Strings, keine Objekte
  // ---------------------------------------------------------------------------

  const buttonClasses = cls(
    "quick-chat-button",
    `quick-chat-button--${variant.toLowerCase()}`,
    `quick-chat-button--${position.toLowerCase().replace("_", "-")}`,
    isOpen ? "quick-chat-button--open" : "",
    localState.isHovered ? "quick-chat-button--hovered" : "",
    localState.isPressed ? "quick-chat-button--pressed" : "",
    localState.isFocused ? "quick-chat-button--focused" : "",
    localState.showNotification ? "quick-chat-button--has-notification" : "",
    variant === "FLOATING" ? "quick-chat-button--floating" : "",
    className || undefined,
    undefined,
  );

  // ---------------------------------------------------------------------------
  // Render Button Content
  // ---------------------------------------------------------------------------

  const renderContent = () => {
    if (variant === "MINIMAL") {
      return (
        <>
          <span className="quick-chat-button__icon">{isOpen ? "✕" : "💬"}</span>
          {localState.showNotification && (
            <span className="quick-chat-button__notification-minimal"></span>
          )}
        </>
      );
    }

    if (variant === "STATIC") {
      return (
        <>
          <span className="quick-chat-button__icon">{isOpen ? "✕" : "💬"}</span>
          <span className="quick-chat-button__text">
            {isOpen ? t("quickChat.close") : t("quickChat.open")}
          </span>

          {localState.showNotification && (
            <span className="quick-chat-button__notification">
              {Math.min(localState.notificationCount, 99)}
            </span>
          )}
        </>
      );
    }

    // FLOATING default
    return (
      <>
        <span className="quick-chat-button__floating-icon">
          {isOpen ? "✕" : "💬"}
        </span>

        {localState.showNotification && (
          <span className="quick-chat-button__notification-floating">
            {Math.min(localState.notificationCount, 99)}
          </span>
        )}

        {localState.isHovered && (
          <span className="quick-chat-button__tooltip">
            {isOpen ? t("quickChat.closeChat") : t("quickChat.openChat")}
          </span>
        )}
      </>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      style={positionStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={isOpen ? t("quickChat.closeChat") : t("quickChat.openChat")}
      aria-expanded={isOpen}
      {...rest}
    >
      {renderContent()}

      {localState.showNotification && (
        <span id="quick-chat-notification" className="sr-only">
          {t("quickChat.unreadMessages", {
            count: localState.notificationCount,
          })}
        </span>
      )}
    </button>
  );
};

QuickChatButton.displayName = "QuickChatButton";

export default QuickChatButton;
