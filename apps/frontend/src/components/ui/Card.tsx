// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Card.tsx

/**
 * Card Component
 *
 * A versatile container component for displaying content with optional
 * header, title, subtitle, icon, and actions. Supports multiple visual
 * variants and padding options.
 *
 * @module Card
 * @category UI Components
 *
 * @example
 * ```tsx
 * <Card
 *   title="User Profile"
 *   subtitle="Edit your personal information"
 *   icon={<UserIcon />}
 *   variant="elevated"
 *   actions={<Button>Edit</Button>}
 * >
 *   <p>Card content goes here</p>
 * </Card>
 *
 * // Glass variant for modern UI
 * <Card variant="glass" padding="lg">
 *   <h2>Glassmorphism Design</h2>
 * </Card>
 * ```
 */

import React from "react";
import styles from "./Card.module.css";

/**
 * Card component props
 */
export interface CardProps {
  /** Content to be rendered inside the card */
  children: React.ReactNode;
  /** Optional title displayed in card header */
  title?: string;
  /** Optional subtitle displayed below title */
  subtitle?: string;
  /** Optional icon displayed in header */
  icon?: React.ReactNode;
  /** Optional action buttons/elements in header */
  actions?: React.ReactNode;
  /** Visual variant of the card */
  variant?: "default" | "elevated" | "outlined" | "glass";
  /** Internal padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Click handler - makes card interactive */
  onClick?: () => void;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Card component for structured content display
 *
 * @param {CardProps} props - Card configuration props
 * @returns {React.FC} Rendered card element
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
  style,
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-padding={padding}
      {...(style && Object.keys(style).length > 0 ? { style } : {})}
    >
      {(title || subtitle || icon || actions) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <div className={styles.headerText}>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
