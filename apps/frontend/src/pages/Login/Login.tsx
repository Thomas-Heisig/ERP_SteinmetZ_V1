// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Login/Login.tsx

/**
 * Login and registration page component
 * 
 * Features:
 * - User authentication (login)
 * - User registration
 * - Form validation
 * - Error handling
 * - Loading states
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <Login />
 * ```
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

/**
 * Login page component with authentication and registration
 */
export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect location from navigation state
  type LocationState = { from?: { pathname: string } };
  const from = (location.state as LocationState)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        await login({ username, password });
      } else {
        await register({ username, email, password, full_name: fullName });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true">
              🧱
            </span>
            <h1 className={styles.brandTitle}>ERP SteinmetZ</h1>
          </div>
          <p className={styles.subtitle}>
            {mode === "login"
              ? "Melden Sie sich an, um fortzufahren"
              : "Erstellen Sie ein neues Konto"}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className={styles.error} role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Benutzername <span className={styles.required} aria-label="erforderlich">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={isLoading}
              className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
              {...{ "aria-required": "true" as const, "aria-invalid": error ? ("true" as const) : ("false" as const) }}
            />
          </div>

          {mode === "register" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  E-Mail <span className={styles.required} aria-label="erforderlich">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
                  {...{ "aria-required": "true" as const, "aria-invalid": error ? ("true" as const) : ("false" as const) }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>Vollständiger Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Passwort <span className={styles.required} aria-label="erforderlich">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              disabled={isLoading}
              minLength={8}
              className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
              {...{ "aria-required": "true" as const, "aria-invalid": error ? ("true" as const) : ("false" as const) }}
            />
            {mode === "register" && (
              <small className={styles.hint}>
                Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie einer
                Zahl
              </small>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
            {...{ "aria-busy": isLoading ? ("true" as const) : ("false" as const) }}
          >
            {isLoading
              ? "Bitte warten..."
              : mode === "login"
                ? "Anmelden"
                : "Registrieren"}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={toggleMode}
            disabled={isLoading}
          >
            {mode === "login"
              ? "Noch kein Konto? Registrieren"
              : "Bereits ein Konto? Anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}
