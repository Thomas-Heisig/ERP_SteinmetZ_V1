// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Button.tsx

/**
 * Reusable Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * <Button variant="danger" loading>
 *   Processing...
 * </Button>
 *
 * <Button variant="outline" icon={<Icon />} iconPosition="left">
 *   With Icon
 * </Button>
 * ```
 */

import React from "react";
import styles from "./Button.module.css";

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Shows loading spinner and disables the button */
  loading?: boolean;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Position of the icon relative to the text */
  iconPosition?: "left" | "right";
}

/**
 * Button component with support for variants, sizes, loading states, and icons
 *
 * @param props - Button properties
 * @returns Rendered button element
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  disabled,
  className = "",
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Note: aria-busy and aria-live are correctly typed but ESLint jsx-a11y
  // shows false positives for boolean/conditional values
  const ariaProps = {
    "aria-busy": loading ? ("true" as const) : ("false" as const),
    "aria-live": loading ? ("polite" as const) : undefined,
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...ariaProps}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} role="status" aria-label="Loading" />
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
