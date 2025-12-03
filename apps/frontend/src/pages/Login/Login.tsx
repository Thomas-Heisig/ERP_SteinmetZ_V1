// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Login/Login.tsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

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

  const from = (location.state as any)?.from?.pathname || "/";

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
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-brand">
            <span className="brand-icon" aria-hidden="true">
              🧱
            </span>
            <h1>ERP SteinmetZ</h1>
          </div>
          <p className="login-subtitle">
            {mode === "login"
              ? "Melden Sie sich an, um fortzufahren"
              : "Erstellen Sie ein neues Konto"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              Benutzername <span aria-label="erforderlich">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              disabled={isLoading}
            />
          </div>

          {mode === "register" && (
            <>
              <div className="form-group">
                <label htmlFor="email">
                  E-Mail <span aria-label="erforderlich">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Vollständiger Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">
              Passwort <span aria-label="erforderlich">*</span>
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
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              disabled={isLoading}
              minLength={8}
            />
            {mode === "register" && (
              <small className="form-hint">
                Mindestens 8 Zeichen, mit Groß- und Kleinbuchstaben sowie einer
                Zahl
              </small>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading
              ? "Bitte warten..."
              : mode === "login"
                ? "Anmelden"
                : "Registrieren"}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="toggle-mode-button"
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
