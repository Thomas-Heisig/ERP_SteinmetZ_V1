// SPDX-License-Identifier: MIT
// apps/frontend/src/features/hr/Payroll.tsx

import React, { useState } from "react";
import { PayrollList, SEPAExport } from "./modules";
import styles from "./Payroll.module.css";

export const Payroll: React.FC = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"overview" | "sepa">("overview");

  const months = [
    { value: "01", label: "Januar" },
    { value: "02", label: "Februar" },
    { value: "03", label: "März" },
    { value: "04", label: "April" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Dezember" },
  ];

  const currentYear = useState(() => new Date().getFullYear())[0];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Lohnabrechnung</h1>
        <div className={styles.filters}>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className={styles.select}
            aria-label="Jahr auswählen"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={month || ""}
            onChange={(e) => setMonth(e.target.value || undefined)}
            className={styles.select}
            aria-label="Monat auswählen"
          >
            <option value="">Alle Monate</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Übersicht
        </button>
        <button
          className={`${styles.tab} ${activeTab === "sepa" ? styles.active : ""}`}
          onClick={() => setActiveTab("sepa")}
        >
          SEPA-Export
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && <PayrollList year={year} month={month} />}
        {activeTab === "sepa" && month && (
          <SEPAExport year={year} month={month} />
        )}
        {activeTab === "sepa" && !month && (
          <div className={styles.info}>
            <p>
              Bitte wählen Sie einen Monat aus, um eine SEPA-Datei zu
              exportieren
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
