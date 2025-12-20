// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/Login/Login.tsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin123");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  type LocationState = { from?: { pathname: string } };
  const from = (location.state as LocationState)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        console.warn("Attempting login with:", { username: username.trim() });
        await login({ username: username.trim(), password });
        setSuccess("Login erfolgreich! Leite weiter...");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        console.warn("Attempting registration with:", {
          username: username.trim(),
          email: email.trim(),
        });
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          // Diese Felder könnten erweitert werden für Adressinformationen
        });
        setSuccess("Registrierung erfolgreich! Leite zum Login weiter...");
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setEmail("");
          setFullName("");
          setAddress("");
          setCity("");
          setPostalCode("");
          setPhone("");
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Auth error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
    if (mode === "login") {
      // Clear form when switching to register
      setUsername("");
      setPassword("");
      setEmail("");
      setFullName("");
      setAddress("");
      setCity("");
      setPostalCode("");
      setPhone("");
    } else {
      // Pre-fill demo data when switching to login
      setUsername("admin");
      setPassword("Admin123");
    }
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

        <div className={styles.formContainer}>
          {mode === "login" && (
            <div className={styles.info}>
              Demo-Credentials: <br />
              <strong>Benutzer:</strong> admin <br />
              <strong>Passwort:</strong> Admin123
            </div>
          )}

          {error && (
            <div className={styles.error} role="alert" aria-live="polite">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className={styles.success} role="alert" aria-live="polite">
              ✅ {success}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Benutzername{" "}
                <span className={styles.required} aria-label="erforderlich">
                  *
                </span>
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
                className={styles.input}
                placeholder="z.B. admin"
                aria-required="true"
              />
            </div>

            {mode === "register" && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    E-Mail{" "}
                    <span className={styles.required} aria-label="erforderlich">
                      *
                    </span>
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
                    className={styles.input}
                    placeholder="beispiel@domain.de"
                    aria-required="true"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fullName" className={styles.label}>
                    Vollständiger Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    disabled={isLoading}
                    className={styles.input}
                    placeholder="Max Mustermann"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.label}>
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    disabled={isLoading}
                    className={styles.input}
                    placeholder="Straße Hausnummer"
                  />
                </div>

                <div className={styles.formColumns}>
                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode" className={styles.label}>
                      PLZ
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      autoComplete="postal-code"
                      disabled={isLoading}
                      className={styles.input}
                      placeholder="10115"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city" className={styles.label}>
                      Stadt
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      disabled={isLoading}
                      className={styles.input}
                      placeholder="Berlin"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    disabled={isLoading}
                    className={styles.input}
                    placeholder="+49 30 12345678"
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Passwort{" "}
                <span className={styles.required} aria-label="erforderlich">
                  *
                </span>
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
                className={styles.input}
                placeholder={
                  mode === "login" ? "Ihr Passwort" : "Mindestens 8 Zeichen"
                }
                aria-required="true"
              />
              {mode === "register" && (
                <small className={styles.passwordHint}>
                  Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, eine Ziffer
                </small>
              )}
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading
                ? "Bitte warten..."
                : mode === "login"
                  ? "Anmelden"
                  : "Registrieren"}
            </button>
          </form>

          <div className={styles.toggleLink}>
            <button type="button" onClick={toggleMode} disabled={isLoading}>
              {mode === "login"
                ? "Noch kein Konto? Jetzt registrieren"
                : "Bereits ein Konto? Jetzt anmelden"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
