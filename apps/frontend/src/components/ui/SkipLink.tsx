// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/SkipLink.tsx
// Accessibility: Skip navigation link for keyboard users

import React from "react";
import styles from "./SkipLink.module.css";

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
    <a href={href} className={styles.skipLink}>
      {children}
    </a>
  );
};

export default SkipLink;
