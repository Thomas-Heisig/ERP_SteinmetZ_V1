// SPDX-License-Identifier: MIT
// apps/frontend/src/components/Auth/ProtectedRoute.tsx

/**
 * Protected Route Component
 *
 * Provides authentication-based route protection with permission and role-based access control.
 * Redirects unauthenticated users to login and shows access denied for insufficient permissions.
 *
 * Features:
 * - Authentication check with loading state
 * - Permission-based access control
 * - Role-based access control
 * - Automatic redirect to login with return path
 * - Informative access denied screen
 * - Responsive design
 *
 * @example
 * ```tsx
 * // Basic authentication
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // With permission check
 * <ProtectedRoute requiredPermission="users.edit">
 *   <UserEditor />
 * </ProtectedRoute>
 *
 * // With role check
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 *
 * @module Auth/ProtectedRoute
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./ProtectedRoute.module.css";

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Child components to render when authorized */
  children: React.ReactNode;
  /** Optional permission required to access the route */
  requiredPermission?: string;
  /** Optional role required to access the route */
  requiredRole?: string;
}

/**
 * ProtectedRoute component
 *
 * Wrapper component that enforces authentication and authorization.
 * Shows loading state, handles redirects, and displays access denied messages.
 *
 * @param props - Component props
 * @returns Protected route element or redirect
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} aria-label="Laden" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessDeniedIcon} aria-hidden="true">
          🔒
        </div>
        <h1 className={styles.accessDeniedTitle}>Zugriff verweigert</h1>
        <p className={styles.accessDeniedMessage}>
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
          <br />
          Benötigte Berechtigung:{" "}
          <span className={styles.accessDeniedRole}>{requiredPermission}</span>
        </p>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessDeniedIcon} aria-hidden="true">
          👤
        </div>
        <h1 className={styles.accessDeniedTitle}>Zugriff verweigert</h1>
        <p className={styles.accessDeniedMessage}>
          Sie benötigen die Rolle{" "}
          <span className={styles.accessDeniedRole}>{requiredRole}</span>, um
          auf diese Seite zuzugreifen.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Default export for backward compatibility
export default ProtectedRoute;
