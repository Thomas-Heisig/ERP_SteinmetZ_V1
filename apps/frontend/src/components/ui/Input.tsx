// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Input.tsx

/**
 * @module Input
 * @description Accessible input component with label, error, helper text, and icon support
 */

import React, { forwardRef, useId } from "react";
import styles from "./Input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input when no error */
  helperText?: string;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Position of the icon */
  iconPosition?: "left" | "right";
  /** Optional suffix text/element (e.g., unit) */
  suffix?: React.ReactNode;
  /** Makes the label visually required with asterisk */
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      suffix,
      className,
      id,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // Combine aria-describedby with error/helper IDs
    const describedBy =
      [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ") ||
      undefined;

    const inputClasses = [
      styles.input,
      icon && iconPosition === "left" && styles.hasIconLeft,
      suffix && styles.hasSuffix,
      error && styles.inputError,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // ARIA attributes - using explicit values to satisfy ESLint jsx-a11y
    // Note: ESLint jsx-a11y plugin shows false positive warnings for ARIA attributes with expressions.
    // This code is correct per React and ARIA specifications.
    const ariaProps = {
      "aria-invalid": error ? ("true" as const) : ("false" as const),
      "aria-required": required ? ("true" as const) : ("false" as const),
      "aria-describedby": describedBy,
    };

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-label="required">
                {" "}
                *
              </span>
            )}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && iconPosition === "left" && (
            <span className={styles.iconLeft} aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...ariaProps}
            {...props}
          />
          {suffix && (
            <span className={styles.suffix} aria-hidden="true">
              {suffix}
            </span>
          )}
          {icon && iconPosition === "right" && (
            <span className={styles.iconRight} aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <span id={errorId} role="alert" className={styles.errorText}>
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
