// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Card.tsx

import React from "react";

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
  const paddingStyles: Record<string, string> = {
    none: "0",
    sm: "0.75rem",
    md: "1.25rem",
    lg: "2rem",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
    },
    elevated: {
      background: "var(--surface)",
      border: "none",
      boxShadow: "var(--shadow-lg)",
    },
    outlined: {
      background: "transparent",
      border: "1px solid var(--border)",
      boxShadow: "none",
    },
    glass: {
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "var(--shadow-sm)",
    },
  };

  return (
    <div
      className={`ui-card ui-card--${variant} ${className}`}
      onClick={onClick}
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {(title || subtitle || icon || actions) && (
        <div
          className="ui-card__header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: paddingStyles[padding],
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {icon && (
              <span
                style={{
                  fontSize: "1.5rem",
                  color: "var(--primary-500)",
                }}
              >
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </div>
      )}
      <div
        className="ui-card__content"
        style={{
          padding: paddingStyles[padding],
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;
