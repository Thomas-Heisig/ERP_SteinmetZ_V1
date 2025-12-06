// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Button.tsx

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  disabled,
  className = "",
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium
    rounded-lg transition-all duration-200 focus:outline-none
    focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles: Record<string, string> = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontWeight: 500,
        borderRadius: "8px",
        transition: "all 0.2s ease",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        padding:
          size === "sm"
            ? "0.375rem 0.75rem"
            : size === "lg"
              ? "0.75rem 1.5rem"
              : "0.5rem 1rem",
        fontSize:
          size === "sm" ? "0.875rem" : size === "lg" ? "1.125rem" : "1rem",
        background:
          variant === "primary"
            ? "var(--primary-500)"
            : variant === "danger"
              ? "var(--error-500)"
              : variant === "secondary"
                ? "var(--gray-100)"
                : "transparent",
        color:
          variant === "primary" || variant === "danger"
            ? "white"
            : "var(--text-primary)",
        border: variant === "outline" ? "1px solid var(--border)" : "none",
      }}
      {...props}
    >
      {loading && (
        <span
          className="ui-button__spinner"
          role="status"
          aria-label="Loading"
          style={{
            width: "1em",
            height: "1em",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
};

export default Button;
