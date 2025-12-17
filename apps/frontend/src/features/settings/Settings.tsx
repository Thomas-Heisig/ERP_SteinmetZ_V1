// SPDX-License-Identifier: MIT
// apps/frontend/src/features/settings/Settings.tsx

import React, { useState } from "react";
import { Card, Tabs, Button, Select } from "../../components/ui";
import styles from "./Settings.module.css";

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
    <div className={styles.container}>
      <Card variant="elevated" padding="md">
        <h1 className={styles.header}>⚙️ Einstellungen</h1>
      </Card>

      <Card variant="elevated" padding="none">
        <Tabs tabs={tabs} variant="underline" />
      </Card>
    </div>
  );
};

// General Settings
const GeneralSettings: React.FC<{
  theme: string;
  setTheme: (t: string) => void;
}> = ({ theme, setTheme }) => {
  return (
    <div className={styles.generalSettings}>
      <div>
        <h3 className={styles.sectionTitle}>Erscheinungsbild</h3>
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
        <h3 className={styles.sectionTitle}>Sprache & Region</h3>
        <div className={styles.gridTwo}>
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

      <Button variant="primary" className={styles.saveButton}>
        💾 Speichern
      </Button>
    </div>
  );
};

// User Settings (RBAC)
const UserSettings: React.FC = () => {
  return (
    <div className={styles.settingsContent}>
      <div className={styles.settingsHeader}>
        <h3 className={styles.settingsHeaderTitle}>Benutzer & Rollen (RBAC)</h3>
        <Button variant="primary" size="sm">
          + Benutzer hinzufügen
        </Button>
      </div>

      <div className={styles.placeholder}>
        <p className={styles.placeholderText}>
          Benutzerverwaltung mit rollenbasierter Zugriffskontrolle (RBAC)
        </p>
        <p className={styles.placeholderSubtext}>
          Verwalten Sie Benutzer, Rollen und Berechtigungen
        </p>
      </div>
    </div>
  );
};

// Tenant Settings (Multi-tenancy)
const TenantSettings: React.FC = () => {
  return (
    <div className={styles.settingsContent}>
      <div className={styles.settingsHeader}>
        <h3 className={styles.settingsHeaderTitle}>Mandantenverwaltung</h3>
        <Button variant="primary" size="sm">
          + Mandant hinzufügen
        </Button>
      </div>

      <div className={styles.placeholder}>
        <p className={styles.placeholderText}>Multi-Tenant-Konfiguration</p>
        <p className={styles.placeholderSubtext}>
          Verwalten Sie separate Mandanten mit eigenen Daten und Einstellungen
        </p>
      </div>
    </div>
  );
};

// API Settings
const ApiSettings: React.FC = () => {
  return (
    <div className={styles.apiSection}>
      <h3 className={styles.sectionTitle}>API-Schlüssel & Integrationen</h3>

      <div className={styles.apiList}>
        <Card variant="outlined" padding="md">
          <div className={styles.apiCard}>
            <div className={styles.apiCardInfo}>
              <strong>OpenAI API</strong>
              <p className={styles.apiCardDescription}>
                GPT-4 für KI-Funktionen
              </p>
            </div>
            <Button variant="outline" size="sm">
              Konfigurieren
            </Button>
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className={styles.apiCard}>
            <div className={styles.apiCardInfo}>
              <strong>Sipgate</strong>
              <p className={styles.apiCardDescription}>
                Telefonie, SMS und Fax
              </p>
            </div>
            <Button variant="outline" size="sm">
              Konfigurieren
            </Button>
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className={styles.apiCard}>
            <div className={styles.apiCardInfo}>
              <strong>DATEV</strong>
              <p className={styles.apiCardDescription}>Buchhaltungsexport</p>
            </div>
            <Button variant="outline" size="sm">
              Konfigurieren
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Backup Settings
const BackupSettings: React.FC = () => {
  return (
    <div className={styles.backupSection}>
      <h3 className={styles.sectionTitle}>Backup & Wiederherstellung</h3>

      <div className={styles.backupGrid}>
        <Card variant="outlined" padding="md">
          <h4 className={styles.backupStatTitle}>💾 Letztes Backup</h4>
          <p className={styles.backupStatValue}>
            {new Date().toLocaleDateString("de-DE")}
          </p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 className={styles.backupStatTitle}>📊 Datenbankgröße</h4>
          <p className={styles.backupStatValue}>124 MB</p>
        </Card>
      </div>

      <div className={styles.buttonGroup}>
        <Button variant="primary">📥 Backup erstellen</Button>
        <Button variant="outline">📤 Backup importieren</Button>
      </div>
    </div>
  );
};

// Diagnostics Settings
const DiagnosticsSettings: React.FC = () => {
  return (
    <div className={styles.diagnosticsSection}>
      <h3 className={styles.sectionTitle}>System-Diagnose & Logs</h3>

      <div className={styles.diagnosticsGrid}>
        <Card variant="outlined" padding="md">
          <h4 className={styles.diagnosticTitle}>System-Status</h4>
          <p className={styles.diagnosticValueSuccess}>🟢 Gesund</p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 className={styles.diagnosticTitle}>Selbstheilung</h4>
          <p className={styles.diagnosticValue}>Aktiv</p>
        </Card>
        <Card variant="outlined" padding="md">
          <h4 className={styles.diagnosticTitle}>Letzter Check</h4>
          <p className={styles.diagnosticValue}>03:00</p>
        </Card>
      </div>

      <div className={styles.buttonGroup}>
        <Button
          variant="primary"
          onClick={() => window.open("/diagnostics", "_blank")}
        >
          🔍 Diagnoseseite öffnen
        </Button>
        <Button variant="outline">📋 Logs anzeigen</Button>
        <Button variant="outline">🔧 Health-Check starten</Button>
      </div>
    </div>
  );
};

export default Settings;
