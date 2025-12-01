// SPDX-License-Identifier: MIT
// apps/frontend/src/features/settings/Settings.tsx

import React, { useState } from "react";
import { Card, Tabs, Button, Input, Select } from "../../components/ui";

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState("auto");

  const tabs = [
    {
      id: "general",
      label: "Allgemein",
      icon: "⚙️",
      content: <GeneralSettings theme={theme} setTheme={setTheme} />,
    },
    {
      id: "users",
      label: "Benutzer & Rollen",
      icon: "👥",
      content: <UserSettings />,
    },
    {
      id: "tenants",
      label: "Mandanten",
      icon: "🏢",
      content: <TenantSettings />,
    },
    {
      id: "api",
      label: "API-Schlüssel",
      icon: "🔑",
      content: <ApiSettings />,
    },
    {
      id: "backup",
      label: "Backup & Restore",
      icon: "💾",
      content: <BackupSettings />,
    },
    {
      id: "diagnostics",
      label: "Diagnose",
      icon: "🔍",
      content: <DiagnosticsSettings />,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card variant="elevated" padding="md">
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
          ⚙️ Einstellungen
        </h1>
      </Card>

      <Card variant="elevated" padding="none">
        <Tabs tabs={tabs} variant="underline" />
      </Card>
    </div>
  );
};

// General Settings
const GeneralSettings: React.FC<{ theme: string; setTheme: (t: string) => void }> = ({
  theme,
  setTheme,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
      <div>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
          Erscheinungsbild
        </h3>
        <Select
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "auto", label: "🌗 Automatisch (System)" },
            { value: "light", label: "☀️ Hell" },
            { value: "dark", label: "🌙 Dunkel" },
            { value: "lcars", label: "🖖 LCARS" },
            { value: "high-contrast", label: "👁️ Hoher Kontrast" },
          ]}
        />
      </div>

      <div>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
          Sprache & Region
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          <Select
            label="Sprache"
            value="de"
            options={[
              { value: "de", label: "🇩🇪 Deutsch" },
              { value: "en", label: "🇬🇧 English" },
              { value: "fr", label: "🇫🇷 Français" },
            ]}
          />
          <Select
            label="Zeitzone"
            value="Europe/Berlin"
            options={[
              { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
              { value: "Europe/London", label: "London (GMT/BST)" },
              { value: "America/New_York", label: "New York (EST/EDT)" },
            ]}
          />
        </div>
      </div>

      <Button variant="primary" style={{ alignSelf: "flex-start" }}>
        💾 Speichern
      </Button>
    </div>
  );
};

// User Settings (RBAC)
const UserSettings: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          Benutzer & Rollen (RBAC)
        </h3>
        <Button variant="primary" size="sm">+ Benutzer hinzufügen</Button>
      </div>

      <div style={{ background: "var(--gray-50)", borderRadius: "8px", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          Benutzerverwaltung mit rollenbasierter Zugriffskontrolle (RBAC)
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
          Verwalten Sie Benutzer, Rollen und Berechtigungen
        </p>
      </div>
    </div>
  );
};

// Tenant Settings (Multi-tenancy)
const TenantSettings: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          Mandantenverwaltung
        </h3>
        <Button variant="primary" size="sm">+ Mandant hinzufügen</Button>
      </div>

      <div style={{ background: "var(--gray-50)", borderRadius: "8px", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          Multi-Tenant-Konfiguration
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
          Verwalten Sie separate Mandanten mit eigenen Daten und Einstellungen
        </p>
      </div>
    </div>
  );
};

// API Settings
const ApiSettings: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
        API-Schlüssel & Integrationen
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Card variant="outlined" padding="md">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>OpenAI API</strong>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                GPT-4 für KI-Funktionen
              </p>
            </div>
            <Button variant="outline" size="sm">Konfigurieren</Button>
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Sipgate</strong>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Telefonie, SMS und Fax
              </p>
            </div>
            <Button variant="outline" size="sm">Konfigurieren</Button>
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>DATEV</strong>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Buchhaltungsexport
              </p>
            </div>
            <Button variant="outline" size="sm">Konfigurieren</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Backup Settings
const BackupSettings: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
        Backup & Wiederherstellung
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card variant="outlined" padding="md">
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>💾 Letztes Backup</h4>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            {new Date().toLocaleDateString("de-DE")}
          </p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>📊 Datenbankgröße</h4>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>124 MB</p>
        </Card>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button variant="primary">📥 Backup erstellen</Button>
        <Button variant="outline">📤 Backup importieren</Button>
      </div>
    </div>
  );
};

// Diagnostics Settings
const DiagnosticsSettings: React.FC = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
        System-Diagnose & Logs
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card variant="outlined" padding="md">
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            System-Status
          </h4>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--success-500)" }}>
            🟢 Gesund
          </p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Selbstheilung
          </h4>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            Aktiv
          </p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Letzter Check
          </h4>
          <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            03:00
          </p>
        </Card>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button variant="primary" onClick={() => window.open("/diagnostics", "_blank")}>
          🔍 Diagnoseseite öffnen
        </Button>
        <Button variant="outline">📋 Logs anzeigen</Button>
        <Button variant="outline">🔧 Health-Check starten</Button>
      </div>
    </div>
  );
};

export default Settings;
