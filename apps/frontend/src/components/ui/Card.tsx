// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Card.tsx

import React from "react";
import styles from "./Card.module.css";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

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
