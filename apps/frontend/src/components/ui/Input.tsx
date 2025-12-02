// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Input.tsx

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`ui-input-wrapper ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {label}
          </label>
        )}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon && iconPosition === "left" && (
            <span
              style={{
                position: "absolute",
                left: "0.75rem",
                color: "var(--text-tertiary)",
                pointerEvents: "none",
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="ui-input"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              paddingLeft:
                icon && iconPosition === "left" ? "2.5rem" : "0.75rem",
              paddingRight:
                icon && iconPosition === "right" ? "2.5rem" : "0.75rem",
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "var(--text-primary)",
              background: "var(--surface)",
              border: `1px solid ${error ? "var(--error-500)" : "var(--border)"}`,
              borderRadius: "8px",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              outline: "none",
            }}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span
              style={{
                position: "absolute",
                right: "0.75rem",
                color: "var(--text-tertiary)",
                pointerEvents: "none",
              }}
            >
              {icon}
            </span>
          )}
        </div>
        {error && (
          <span
            style={{
              display: "block",
              marginTop: "0.25rem",
              fontSize: "0.75rem",
              color: "var(--error-500)",
            }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            style={{
              display: "block",
              marginTop: "0.25rem",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
