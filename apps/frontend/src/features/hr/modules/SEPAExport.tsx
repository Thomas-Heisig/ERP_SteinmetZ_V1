// SPDX-License-Identifier: MIT
// apps/frontend/src/features/hr/modules/SEPAExport.tsx

import React, { useState } from "react";
import styles from "./SEPAExport.module.css";

interface SEPAExportProps {
  year: number;
  month: string;
}

export const SEPAExport: React.FC<SEPAExportProps> = ({ year, month }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyIBAN, setCompanyIBAN] = useState("");
  const [companyBIC, setCompanyBIC] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyIBAN || !companyBIC) {
      setMessage("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/hr/payroll/export/sepa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          month,
          company_name: companyName,
          company_iban: companyIBAN,
          company_bic: companyBIC,
        }),
      });

      if (!response.ok) {
        throw new Error("Export fehlgeschlagen");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sepa-payroll-${year}-${month}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("SEPA-Export erfolgreich");
      setCompanyName("");
      setCompanyIBAN("");
      setCompanyBIC("");
    } catch (error) {
      setMessage(
        `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>SEPA pain.001.001.03 Export</h3>
      <p className={styles.description}>
        Exportieren Sie Lohnabrechnungen als SEPA-Datei (pain.001.001.03) für
        Bankübertragungen
      </p>

      <form onSubmit={handleExport} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="companyName">Unternehmensname</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="z.B. Steinmetz GmbH"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="companyIBAN">Unternehmens-IBAN</label>
          <input
            id="companyIBAN"
            type="text"
            value={companyIBAN}
            onChange={(e) => setCompanyIBAN(e.target.value)}
            placeholder="DE89 3704 0044 0532 0130 00"
            maxLength={34}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="companyBIC">Unternehmens-BIC</label>
          <input
            id="companyBIC"
            type="text"
            value={companyBIC}
            onChange={(e) => setCompanyBIC(e.target.value)}
            placeholder="COBADEFF"
            maxLength={11}
            required
            className={styles.input}
          />
        </div>

        {message && (
          <div
            className={`${styles.message} ${message.includes("Fehler") ? styles.error : styles.success}`}
          >
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Wird exportiert..." : "SEPA-Datei exportieren"}
        </button>
      </form>
    </div>
  );
};

export default SEPAExport;
