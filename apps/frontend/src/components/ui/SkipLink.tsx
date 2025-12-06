// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/SkipLink.tsx
// Accessibility: Skip navigation link for keyboard users

import React from "react";

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip Link component for improved keyboard navigation
 * Allows users to skip repetitive navigation and jump to main content
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="skip-link"
      style={{
        position: "absolute",
        left: "-9999px",
        zIndex: 999,
        padding: "1rem",
        background: "var(--primary-500, #3b82f6)",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px",
        fontSize: "1rem",
        fontWeight: "600",
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "1rem";
        e.currentTarget.style.top = "1rem";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
      }}
    >
      {children}
    </a>
  );
};

export default SkipLink;
